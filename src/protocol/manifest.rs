use napi::{Error, Result, Status};
use rustc_hash::FxHashSet;

use crate::generated::event_schema::{
    NODE_TYPE_COUNT, field_key_id, field_key_name, predicate_field_supported,
};

use super::constants::{
    FieldMask, MAX_COMPILED_ROUTES, MAX_PREDICATE_VALUES, MAX_ROUTE_MANIFEST_BYTES,
    MAX_ROUTE_PAYLOAD_FIELDS, MAX_ROUTE_PREDICATES, NodeTypeSet, ROUTE_MANIFEST_MAGIC,
};

#[derive(Clone)]
pub(crate) struct CompiledPredicate {
    pub(crate) field_id: u32,
    pub(crate) operation: u32,
    pub(crate) values: Vec<CompiledScalar>,
}

#[derive(Clone)]
pub(crate) enum CompiledScalar {
    String(String),
    Number(f64),
    Boolean(bool),
    Null,
}

#[derive(Clone)]
pub(crate) struct CompiledRoute {
    pub(crate) id: u32,
    pub(crate) node_type_id: u32,
    pub(crate) side: VisitSide,
    pub(crate) predicates: Vec<CompiledPredicate>,
    pub(crate) payload_field_ids: Vec<u32>,
    /// `payload_field_ids` as a mask, so a matching route's payload selection is one
    /// word and coalescing several matched routes is a bitwise union.
    pub(crate) payload_mask: FieldMask,
}

pub(crate) struct CompiledManifest {
    pub(crate) routes_by_type: Vec<Vec<CompiledRoute>>,
    pub(crate) include_parent: bool,
    pub(crate) include_scope: bool,
    pub(crate) include_exit: bool,
    pub(crate) retention_capabilities: u32,
    pub(crate) structural_parent_types: NodeTypeSet,
    /// Union of route payload/predicate and retained-plan fields per node type,
    /// precomputed so the retained collector performs no per-node selection work.
    pub(crate) merged_field_mask_by_type: Vec<FieldMask>,
    /// Predicate fields without direct scalar accessors; only these fields need
    /// materialization before matching.
    pub(crate) fallback_predicate_mask_by_type: Vec<FieldMask>,
    pub(crate) needs_semantics: bool,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub(crate) enum VisitSide {
    Enter,
    Exit,
}

pub(crate) fn decode_route_manifest(
    data: &[u8],
    has_direct_predicate_scalar: impl Fn(u32, &str) -> bool,
    semantic_field_keys: &[&str],
) -> Result<CompiledManifest> {
    if data.len() < 28 || data.len() > MAX_ROUTE_MANIFEST_BYTES || !data.len().is_multiple_of(4) {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid routed manifest buffer",
        ));
    }
    let word = |index: usize| {
        u32::from_le_bytes(
            data[index * 4..index * 4 + 4]
                .try_into()
                .expect("word bounds"),
        )
    };
    if word(0) != ROUTE_MANIFEST_MAGIC {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid routed manifest magic",
        ));
    }
    let flags = word(1);
    if flags & !0x3ff != 0 {
        return Err(Error::new(
            Status::InvalidArg,
            "unknown routed manifest flags",
        ));
    }
    let route_count = word(2) as usize;
    if route_count > MAX_COMPILED_ROUTES {
        return Err(Error::new(
            Status::InvalidArg,
            "compiled route limit exceeded",
        ));
    }
    let string_count = word(3) as usize;
    let strings_offset = word(4) as usize;
    let plugin_count = word(5) as usize;
    let structural_parent_count = word(6) as usize;
    if plugin_count > MAX_COMPILED_ROUTES {
        return Err(Error::new(
            Status::InvalidArg,
            "compiled plugin limit exceeded",
        ));
    }
    if strings_offset < 28 || strings_offset > data.len() || !strings_offset.is_multiple_of(4) {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid routed manifest string offset",
        ));
    }
    let mut strings = Vec::with_capacity(string_count);
    let mut byte_cursor = strings_offset;
    for _ in 0..string_count {
        if byte_cursor + 4 > data.len() {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated routed manifest strings",
            ));
        }
        let length =
            u32::from_le_bytes(data[byte_cursor..byte_cursor + 4].try_into().unwrap()) as usize;
        byte_cursor += 4;
        if byte_cursor + length > data.len() {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated routed manifest string",
            ));
        }
        strings.push(
            std::str::from_utf8(&data[byte_cursor..byte_cursor + length])
                .map_err(|_| Error::new(Status::InvalidArg, "invalid routed manifest UTF-8"))?
                .to_owned(),
        );
        byte_cursor = (byte_cursor + length).next_multiple_of(4);
    }
    let word_limit = strings_offset / 4;
    let mut cursor = 7;
    let mut seen_ids = FxHashSet::default();
    let mut routes_by_type = vec![Vec::new(); NODE_TYPE_COUNT + 1];
    for _ in 0..route_count {
        if cursor + 8 > word_limit {
            return Err(Error::new(Status::InvalidArg, "truncated compiled route"));
        }
        let id = word(cursor);
        let node_type_id = word(cursor + 1);
        let side = match word(cursor + 2) {
            0 => VisitSide::Enter,
            1 => VisitSide::Exit,
            _ => {
                return Err(Error::new(
                    Status::InvalidArg,
                    "invalid compiled route side",
                ));
            }
        };
        let plugin_id = word(cursor + 3) as usize;
        let order = word(cursor + 4) as usize;
        let route_flags = word(cursor + 5);
        let predicate_count = word(cursor + 6) as usize;
        let payload_count = word(cursor + 7) as usize;
        cursor += 8;
        if node_type_id == 0 || node_type_id as usize > NODE_TYPE_COUNT {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid compiled node type id",
            ));
        }
        // `order` is a plugin ordinal (route-less plugins still advance it), so it is
        // bounded by the plugin count, not the route count.
        if plugin_id >= plugin_count || order >= plugin_count.max(1) {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid compiled plugin or order id",
            ));
        }
        if id as usize >= route_count || !seen_ids.insert(id) {
            return Err(Error::new(
                Status::InvalidArg,
                "duplicate compiled route id",
            ));
        }
        if route_flags != 0
            || predicate_count > MAX_ROUTE_PREDICATES
            || payload_count > MAX_ROUTE_PAYLOAD_FIELDS
        {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid compiled route limits",
            ));
        }
        let mut predicates = Vec::with_capacity(predicate_count);
        for _ in 0..predicate_count {
            if cursor + 3 > word_limit {
                return Err(Error::new(
                    Status::InvalidArg,
                    "truncated compiled predicate",
                ));
            }
            let field_id = word(cursor);
            let operation = word(cursor + 1);
            let value_count = word(cursor + 2) as usize;
            cursor += 3;
            if field_key_name(field_id).is_none()
                || !predicate_field_supported(node_type_id, field_id)
                || operation > 2
                || (operation == 0 && value_count != 1)
                || (operation == 2 && value_count != 1)
                || value_count > MAX_PREDICATE_VALUES
                || cursor + value_count * 2 > word_limit
            {
                return Err(Error::new(Status::InvalidArg, "invalid compiled predicate"));
            }
            let mut values = Vec::with_capacity(value_count);
            for _ in 0..value_count {
                let tag = word(cursor);
                let payload = word(cursor + 1);
                cursor += 2;
                values.push(match tag {
                    0 => CompiledScalar::String(
                        strings
                            .get(payload as usize)
                            .ok_or_else(|| {
                                Error::new(Status::InvalidArg, "invalid predicate string id")
                            })?
                            .clone(),
                    ),
                    1 => CompiledScalar::Number(
                        strings
                            .get(payload as usize)
                            .ok_or_else(|| {
                                Error::new(Status::InvalidArg, "invalid predicate number id")
                            })?
                            .parse::<f64>()
                            .map_err(|_| {
                                Error::new(Status::InvalidArg, "invalid predicate number")
                            })?,
                    ),
                    2 => CompiledScalar::Boolean(payload != 0),
                    3 if payload == 0 => CompiledScalar::Null,
                    _ => return Err(Error::new(Status::InvalidArg, "invalid predicate scalar")),
                });
            }
            predicates.push(CompiledPredicate {
                field_id,
                operation,
                values,
            });
        }
        if cursor + payload_count > word_limit {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated route payload fields",
            ));
        }
        let mut payload_field_ids = Vec::with_capacity(payload_count);
        for _ in 0..payload_count {
            let field_id = word(cursor);
            cursor += 1;
            if field_key_name(field_id).is_none() {
                return Err(Error::new(Status::InvalidArg, "invalid payload field id"));
            }
            payload_field_ids.push(field_id);
        }
        let payload_mask = payload_field_ids
            .iter()
            .fold(FieldMask::none(), |mask, &field_id| mask.with(field_id));
        routes_by_type[node_type_id as usize].push(CompiledRoute {
            id,
            node_type_id,
            side,
            predicates,
            payload_field_ids,
            payload_mask,
        });
    }
    if cursor + structural_parent_count > word_limit {
        return Err(Error::new(
            Status::InvalidArg,
            "truncated structural parent types",
        ));
    }
    let mut structural_parent_types = NodeTypeSet::default();
    for _ in 0..structural_parent_count {
        let type_id = word(cursor);
        cursor += 1;
        if type_id == 0
            || type_id as usize > NODE_TYPE_COUNT
            || !structural_parent_types.insert(type_id)
        {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid structural parent type",
            ));
        }
    }
    if cursor >= word_limit {
        return Err(Error::new(
            Status::InvalidArg,
            "missing retained field plan",
        ));
    }
    let retained_type_count = word(cursor) as usize;
    cursor += 1;
    let mut retained_fields_by_type = vec![Vec::new(); NODE_TYPE_COUNT + 1];
    for _ in 0..retained_type_count {
        if cursor + 2 > word_limit {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated retained field plan",
            ));
        }
        let type_id = word(cursor);
        let field_count = word(cursor + 1) as usize;
        cursor += 2;
        if type_id == 0
            || type_id as usize > NODE_TYPE_COUNT
            || !retained_fields_by_type[type_id as usize].is_empty()
            || cursor + field_count > word_limit
        {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid retained field plan",
            ));
        }
        let fields = &mut retained_fields_by_type[type_id as usize];
        for _ in 0..field_count {
            let field_id = word(cursor);
            cursor += 1;
            if field_key_name(field_id).is_none() || fields.contains(&field_id) {
                return Err(Error::new(Status::InvalidArg, "invalid retained field id"));
            }
            fields.push(field_id);
        }
    }
    if cursor != word_limit {
        return Err(Error::new(
            Status::InvalidArg,
            "trailing routed manifest words",
        ));
    }
    let include_exit = routes_by_type
        .iter()
        .flatten()
        .any(|route| route.side == VisitSide::Exit);
    let include_parent = flags & 1 != 0;
    let include_scope = flags & 2 != 0;
    let merged_field_mask_by_type = routes_by_type
        .iter()
        .zip(&retained_fields_by_type)
        .map(|(routes, retained_field_ids)| {
            routes
                .iter()
                .flat_map(|route| {
                    route
                        .payload_field_ids
                        .iter()
                        .copied()
                        .chain(route.predicates.iter().map(|predicate| predicate.field_id))
                })
                .chain(retained_field_ids.iter().copied())
                .fold(FieldMask::none(), |mask, field_id| mask.with(field_id))
        })
        .collect::<Vec<_>>();
    let semantic_mask = semantic_field_keys
        .iter()
        .filter_map(|name| field_key_id(name))
        .fold(FieldMask::none(), |mask, field_id| mask.with(field_id));
    // Structural ancestry comes from the syntax traversal's parent stack.
    // Only lexical scope data and semantic-only fields require SemanticBuilder.
    let needs_semantics = include_scope
        || merged_field_mask_by_type
            .iter()
            .any(|mask| mask.intersects(semantic_mask));
    let fallback_predicate_mask_by_type = routes_by_type
        .iter()
        .enumerate()
        .map(|(type_id, routes)| {
            routes
                .iter()
                .flat_map(|route| route.predicates.iter())
                .filter(|predicate| {
                    field_key_name(predicate.field_id)
                        .is_some_and(|name| !has_direct_predicate_scalar(type_id as u32, name))
                })
                .fold(FieldMask::none(), |mask, predicate| {
                    mask.with(predicate.field_id)
                })
        })
        .collect::<Vec<_>>();
    Ok(CompiledManifest {
        routes_by_type,
        include_parent,
        include_scope,
        include_exit,
        retention_capabilities: flags >> 2,
        structural_parent_types,
        merged_field_mask_by_type,
        fallback_predicate_mask_by_type,
        needs_semantics,
    })
}
