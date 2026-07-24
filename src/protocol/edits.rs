use napi::{Error, Result, Status};

use crate::edit;
use crate::protocol::constants::PARTS_TAG;

fn decode_packed_words(data: &[u8], strings: Vec<String>) -> Result<Vec<edit::EditCommand>> {
    if !data.len().is_multiple_of(4) || data.len() < 4 {
        return Err(Error::new(Status::InvalidArg, "invalid packed edit buffer"));
    }
    let word_count = data.len() / 4;
    let word =
        |index: usize| u32::from_le_bytes(data[index * 4..index * 4 + 4].try_into().unwrap());
    // Words region: [partsOffset, edit words..., parts table...]. The parts table holds
    // deferred content entries: [partCount, then per part (tag, a, b)] where tag 0 is an
    // interned text id and tag 1 is a source copy range in UTF-16 offsets.
    let parts_offset = word(0) as usize;
    if parts_offset < 1 || parts_offset > word_count {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid packed parts offset",
        ));
    }
    let mut parts_entries: Vec<Vec<edit::RawContentPart>> = Vec::new();
    let mut parts_cursor = parts_offset;
    while parts_cursor < word_count {
        let part_count = word(parts_cursor) as usize;
        parts_cursor += 1;
        if parts_cursor + part_count * 3 > word_count {
            return Err(Error::new(Status::InvalidArg, "truncated packed parts"));
        }
        let mut entry = Vec::with_capacity(part_count);
        for part in 0..part_count {
            let base = parts_cursor + part * 3;
            entry.push(match word(base) {
                0 => edit::RawContentPart::Text(
                    strings
                        .get(word(base + 1) as usize)
                        .cloned()
                        .ok_or_else(|| {
                            Error::new(Status::InvalidArg, "invalid packed string id")
                        })?,
                ),
                1 => edit::RawContentPart::Copy {
                    start: word(base + 1),
                    end: word(base + 2),
                },
                _ => return Err(Error::new(Status::InvalidArg, "invalid packed part tag")),
            });
        }
        parts_cursor += part_count * 3;
        parts_entries.push(entry);
    }
    let mut cursor = 1;
    let mut edits = Vec::new();
    while cursor < parts_offset {
        if cursor + 7 > parts_offset {
            return Err(Error::new(Status::InvalidArg, "truncated packed edit"));
        }
        let kind = match word(cursor) {
            0 => edit::EditKind::Replace,
            1 => edit::EditKind::Remove,
            2 => edit::EditKind::AppendLeft,
            3 => edit::EditKind::PrependLeft,
            4 => edit::EditKind::AppendRight,
            5 => edit::EditKind::PrependRight,
            6 => edit::EditKind::AddSourceMapLocation,
            7 => edit::EditKind::Prefix,
            8 => edit::EditKind::Prologue,
            9 => edit::EditKind::Suffix,
            10 => edit::EditKind::Move,
            _ => return Err(Error::new(Status::InvalidArg, "invalid packed edit kind")),
        };
        let content_id = word(cursor + 3);
        let mapping = match word(cursor + 4) {
            0 => edit::MappingPolicy::Sourceless,
            1 => edit::MappingPolicy::AnchorStart,
            2 => edit::MappingPolicy::AnchorBoundaries,
            3 => edit::MappingPolicy::Identity,
            _ => {
                return Err(Error::new(
                    Status::InvalidArg,
                    "invalid packed mapping policy",
                ));
            }
        };
        let name_count = word(cursor + 6) as usize;
        if cursor + 7 + name_count > parts_offset {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated packed edit names",
            ));
        }
        let names = (cursor + 7..cursor + 7 + name_count)
            .map(|index| {
                strings
                    .get(word(index) as usize)
                    .cloned()
                    .ok_or_else(|| Error::new(Status::InvalidArg, "invalid packed string id"))
            })
            .collect::<Result<Vec<_>>>()?;
        // Move edits reuse the content word as their destination offset.
        let (content, parts, destination) =
            if kind == edit::EditKind::Move {
                let destination = (content_id != u32::MAX).then_some(content_id);
                (None, Vec::new(), destination)
            } else if content_id == u32::MAX {
                (None, Vec::new(), None)
            } else if content_id & PARTS_TAG != 0 {
                let entry = (content_id & !PARTS_TAG) as usize;
                (
                    None,
                    parts_entries
                        .get(entry)
                        .cloned()
                        .ok_or_else(|| Error::new(Status::InvalidArg, "invalid packed parts id"))?,
                    None,
                )
            } else {
                (
                    Some(strings.get(content_id as usize).cloned().ok_or_else(|| {
                        Error::new(Status::InvalidArg, "invalid packed string id")
                    })?),
                    Vec::new(),
                    None,
                )
            };
        edits.push(edit::EditCommand {
            kind,
            start: word(cursor + 1),
            end: word(cursor + 2),
            content,
            parts,
            destination,
            mapping: Some(mapping),
            order: Some(word(cursor + 5)),
            names: Some(names),
        });
        cursor += 7 + name_count;
    }
    Ok(edits)
}

pub(crate) fn decode_packed_commands(data: &[u8]) -> Result<Vec<edit::EditCommand>> {
    if data.len() < 8 {
        return Err(Error::new(
            Status::InvalidArg,
            "truncated packed edit envelope",
        ));
    }
    let string_count = u32::from_le_bytes(data[0..4].try_into().unwrap()) as usize;
    let words_offset = u32::from_le_bytes(data[4..8].try_into().unwrap()) as usize;
    if words_offset > data.len() || !words_offset.is_multiple_of(4) {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid packed edit word offset",
        ));
    }
    // Strings arrive as one lengths table followed by a single concatenated UTF-8 slab,
    // so JavaScript performs one encode instead of one write call per string.
    if 8 + string_count * 4 > words_offset {
        return Err(Error::new(
            Status::InvalidArg,
            "truncated packed edit string",
        ));
    }
    let mut strings = Vec::with_capacity(string_count);
    let mut cursor = 8 + string_count * 4;
    for index in 0..string_count {
        let length_at = 8 + index * 4;
        let length =
            u32::from_le_bytes(data[length_at..length_at + 4].try_into().unwrap()) as usize;
        if cursor + length > words_offset {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated packed edit string value",
            ));
        }
        strings.push(
            std::str::from_utf8(&data[cursor..cursor + length])
                .map_err(|_| Error::new(Status::InvalidArg, "invalid packed edit UTF-8"))?
                .to_owned(),
        );
        cursor += length;
    }
    decode_packed_words(&data[words_offset..], strings)
}
