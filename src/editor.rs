use napi::{Error, Result, Status};
use napi_derive::napi;

#[napi(string_enum)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EditKind {
    Replace,
    Remove,
    AppendLeft,
    PrependLeft,
    AppendRight,
    PrependRight,
    AddSourceMapLocation,
}

#[napi(string_enum)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MappingPolicy {
    Sourceless,
    AnchorStart,
    AnchorBoundaries,
    Identity,
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct EditCommand {
    pub kind: EditKind,
    /// Public offsets are JavaScript UTF-16 code units.
    pub start: u32,
    pub end: u32,
    pub content: Option<String>,
    pub mapping: Option<MappingPolicy>,
    pub order: Option<u32>,
    pub names: Option<Vec<String>>,
}

#[derive(Debug, Clone)]
pub struct ByteEdit {
    pub start: usize,
    pub end: usize,
    pub content: String,
    pub mapping: MappingPolicy,
    pub order: u32,
    pub affinity: u8,
    pub reverse_order: bool,
    pub mark_only: bool,
    pub names: Vec<String>,
}

#[cfg(test)]
pub fn utf16_to_byte(source: &str, offset: u32) -> Result<usize> {
    let target = offset as usize;
    let mut utf16 = 0;
    for (byte, ch) in source.char_indices() {
        if utf16 == target {
            return Ok(byte);
        }
        utf16 += ch.len_utf16();
        if utf16 > target {
            return Err(Error::new(
                Status::InvalidArg,
                format!("UTF-16 offset {offset} splits a surrogate pair"),
            ));
        }
    }
    if utf16 == target {
        Ok(source.len())
    } else {
        Err(Error::new(
            Status::InvalidArg,
            format!("UTF-16 offset {offset} is outside the source"),
        ))
    }
}

pub fn normalize(source: &str, commands: Vec<EditCommand>) -> Result<Vec<ByteEdit>> {
    let mut edits = Vec::with_capacity(commands.len());
    let byte_offsets = if source.is_ascii() {
        None
    } else {
        let mut offsets = vec![None; source.encode_utf16().count() + 1];
        let mut utf16 = 0usize;
        for (byte, character) in source.char_indices() {
            offsets[utf16] = Some(byte);
            utf16 += character.len_utf16();
        }
        offsets[utf16] = Some(source.len());
        Some(offsets)
    };
    let resolve = |offset: u32| -> Result<usize> {
        if byte_offsets.is_none() && (offset as usize) <= source.len() {
            Ok(offset as usize)
        } else {
            byte_offsets
                .as_ref()
                .and_then(|offsets| offsets.get(offset as usize))
                .and_then(|offset| *offset)
                .ok_or_else(|| {
                    Error::new(
                        Status::InvalidArg,
                        format!("invalid UTF-16 offset {offset}"),
                    )
                })
        }
    };
    for (index, command) in commands.into_iter().enumerate() {
        let mut start = resolve(command.start)?;
        let mut end = resolve(command.end)?;
        let (affinity, reverse_order) = match command.kind {
            EditKind::AppendLeft => {
                end = start;
                (1, false)
            }
            EditKind::PrependLeft => {
                end = start;
                (0, true)
            }
            EditKind::AppendRight => {
                end = start;
                (3, false)
            }
            EditKind::PrependRight => {
                end = start;
                (2, true)
            }
            EditKind::AddSourceMapLocation => {
                end = start;
                (4, false)
            }
            EditKind::Remove | EditKind::Replace => (4, false),
        };
        if start > end {
            std::mem::swap(&mut start, &mut end);
        }
        edits.push(ByteEdit {
            start,
            end,
            content: if command.kind == EditKind::Remove {
                String::new()
            } else {
                command.content.unwrap_or_default()
            },
            mapping: command.mapping.unwrap_or(MappingPolicy::Sourceless),
            order: command.order.unwrap_or(index as u32),
            affinity,
            reverse_order,
            mark_only: command.kind == EditKind::AddSourceMapLocation,
            names: command.names.unwrap_or_default(),
        });
    }
    validate_and_sort(edits)
}

pub fn validate_and_sort(mut edits: Vec<ByteEdit>) -> Result<Vec<ByteEdit>> {
    edits.sort_by_key(|edit| {
        (
            edit.start,
            edit.end != edit.start,
            edit.affinity,
            if edit.reverse_order {
                u32::MAX - edit.order
            } else {
                edit.order
            },
        )
    });
    let mut previous_range: Option<(usize, usize)> = None;
    for edit in &edits {
        if let Some((start, end)) = previous_range
            && (edit.start < end || (edit.start == start && edit.end > edit.start))
        {
            return Err(Error::new(
                Status::InvalidArg,
                format!(
                    "overlapping edits at {start}..{end} and {}..{}",
                    edit.start, edit.end
                ),
            ));
        }
        if edit.end > edit.start {
            previous_range = Some((edit.start, edit.end));
        }
    }
    Ok(edits)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn command(kind: EditKind, start: u32, end: u32, content: &str, order: u32) -> EditCommand {
        EditCommand {
            kind,
            start,
            end,
            content: Some(content.into()),
            mapping: None,
            order: Some(order),
            names: None,
        }
    }

    #[test]
    fn rejects_overlaps() {
        let result = normalize(
            "abcdef",
            vec![
                command(EditKind::Replace, 1, 4, "x", 0),
                command(EditKind::Remove, 3, 5, "", 1),
            ],
        );
        assert!(result.is_err());
    }

    #[test]
    fn orders_all_insert_affinities() {
        let edits = normalize(
            "x",
            vec![
                command(EditKind::AppendRight, 0, 0, "AR", 3),
                command(EditKind::PrependRight, 0, 0, "PR", 2),
                command(EditKind::AppendLeft, 0, 0, "AL", 1),
                command(EditKind::PrependLeft, 0, 0, "PL", 0),
            ],
        )
        .unwrap();
        assert_eq!(
            edits
                .iter()
                .map(|edit| edit.content.as_str())
                .collect::<Vec<_>>(),
            ["PL", "AL", "PR", "AR"]
        );
    }

    #[test]
    fn rejects_offsets_inside_surrogate_pairs() {
        assert!(utf16_to_byte("😀", 1).is_err());
        assert_eq!(utf16_to_byte("😀", 2).unwrap(), 4);
    }
}
