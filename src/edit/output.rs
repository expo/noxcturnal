/// Assemble output placements independently of source-coordinate edits. Payloads
/// share the body's immutable edit view; the temporary document keeps their
/// provenance until a second piece transaction places them in the edited body.
pub(crate) fn commit(
    source: &str,
    filename: &str,
    commands: Vec<crate::edit::EditCommand>,
    mode: Option<&str>,
    strict: bool,
) -> napi::Result<crate::event_types::NativeDecodedCommit> {
    use crate::edit::{EditCommand, EditKind, MappingPolicy, Piece, RawContentPart};
    use crate::sourcemap;
    let (mut placements, rest): (Vec<_>, Vec<_>) = commands
        .into_iter()
        .enumerate()
        .map(|(index, mut command)| {
            command.order.get_or_insert(index as u32);
            command
        })
        .partition(|command| matches!(command.kind, EditKind::Prologue | EditKind::ProgramEnd));
    if placements.is_empty() && !strict {
        return crate::edit::commit::commit_decoded_commands(source, rest, mode);
    }
    let (sections, body): (Vec<_>, Vec<_>) = rest
        .into_iter()
        .partition(|command| matches!(command.kind, EditKind::Prefix | EditKind::Suffix));
    placements.sort_by_key(|command| (command.kind == EditKind::ProgramEnd, command.order));
    let kinds: Vec<_> = placements
        .iter()
        .map(|command| (command.kind, command.order.unwrap()))
        .collect();
    let (mut pieces, payloads) = crate::edit::build_with_roots(source, body, placements)?;
    let body = sourcemap::render_code(source, &pieces);
    let layout = crate::output::body_layout(&body, filename, strict)?;
    if payloads.is_empty() && layout.strict.is_none() && sections.is_empty() {
        return super::commit::commit_decoded_pieces(source, pieces, mode);
    }
    let mut insertions = Vec::new();
    let mut occupied = std::collections::HashSet::new();
    if let Some(preparation) = layout.strict {
        occupied.insert(preparation.offset);
        insertions.push((
            preparation.offset,
            0,
            0,
            RawContentPart::Text(preparation.content),
        ));
    }
    let mut virtual_end = body.encode_utf16().count() as u32;
    let mut has_append = false;
    for ((kind, order), payload) in kinds.into_iter().zip(payloads) {
        let index = usize::from(kind == EditKind::ProgramEnd);
        has_append |= index == 1;
        let boundary = if kind == EditKind::ProgramEnd {
            &layout.epilogue
        } else {
            &layout.preamble
        };
        let at = boundary.offset;
        let prefix = if occupied.insert(at) {
            boundary.prefix.clone()
        } else {
            String::new()
        };
        let text = sourcemap::render_code(source, &payload);
        let suffix = if text.trim_end().ends_with(';') && !text.contains('/') {
            "\n"
        } else {
            "\n;\n"
        };
        let length = prefix.encode_utf16().count()
            + text.encode_utf16().count()
            + suffix.encode_utf16().count();
        let generated = |text: String| Piece::Generated {
            text,
            start: source.len(),
            end: source.len(),
            mapping: MappingPolicy::Sourceless,
            names: Vec::new(),
        };
        pieces.push(generated(prefix));
        pieces.extend(payload);
        pieces.push(generated(suffix.into()));
        insertions.push((
            at,
            1 + index,
            order,
            RawContentPart::Copy {
                start: virtual_end,
                end: virtual_end + length as u32,
            },
        ));
        virtual_end += length as u32;
    }
    if has_append && layout.eof_line_boundary {
        insertions.push((
            body.encode_utf16().count() as u32,
            3,
            0,
            RawContentPart::Text("\n".into()),
        ));
    }
    insertions.sort_by_key(|entry| (entry.0, entry.1, entry.2));
    let assembly = insertions
        .into_iter()
        .enumerate()
        .map(|(index, (at, _, _, content))| {
            let (kind, start, end, content, destination) = match content {
                RawContentPart::Text(text) => (EditKind::PrependLeft, at, at, Some(text), None),
                RawContentPart::Copy { start, end } => (EditKind::Move, start, end, None, Some(at)),
            };
            EditCommand {
                kind,
                start,
                end,
                content,
                parts: Vec::new(),
                destination,
                mapping: Some(MappingPolicy::Sourceless),
                order: Some(u32::MAX - index as u32),
                names: None,
            }
        })
        .collect();
    let mode = mode.unwrap_or("boundary");
    let (temporary, first) = sourcemap::render_decoded_layer(source, &pieces, mode);
    let assembled = crate::edit::build(&temporary, assembly)?;
    let (mut code, second) = sourcemap::render_decoded_layer(&temporary, &assembled, mode);
    let mut layers = vec![first, second];
    if !sections.is_empty() {
        let wrapper = crate::edit::build(&code, sections)?;
        let (wrapped, layer) = sourcemap::render_decoded_layer(&code, &wrapper, mode);
        code = wrapped;
        layers.push(layer);
    }
    let map = sourcemap::compose_decoded_layers(&layers).map_err(crate::engine::compose_error)?;
    Ok(crate::event_types::NativeDecodedCommit {
        code_changed: code != source,
        map_changed: code != source || !mapping_is_identity(&map, source, mode)?,
        code,
        map: map.into(),
    })
}

fn mapping_is_identity(map: &[u8], source: &str, mode: &str) -> napi::Result<bool> {
    let identity = crate::edit::commit::commit_decoded_commands(source, Vec::new(), Some(mode))?;
    Ok(map == identity.map.as_ref())
}
