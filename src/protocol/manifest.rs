use napi::{Error, Result, Status};
use rustc_hash::FxHashSet;

use crate::generated::event_schema::{
    CHILD_ROLE_COUNT, NODE_TYPE_COUNT, child_role_cardinality, child_role_id, child_role_name,
    child_role_parent_type_id, field_key_id, field_key_name, node_type_id, node_type_name,
    predicate_field_supported,
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
    pub(crate) comments_inner: bool,
}

pub(crate) struct CompiledManifest {
    pub(crate) routes_by_type: Vec<Vec<CompiledRoute>>,
    pub(crate) program_only: bool,
    pub(crate) include_parent: bool,
    pub(crate) include_scope: bool,
    pub(crate) include_exit: bool,
    pub(crate) include_traversal: bool,
    pub(crate) retention_capabilities: u32,
    pub(crate) child_role_mask_by_parent_type: Vec<ChildRoleMask>,
    /// Union of route payload/predicate and retained-plan fields per node type,
    /// precomputed so the retained collector performs no per-node selection work.
    pub(crate) merged_field_mask_by_type: Vec<FieldMask>,
    /// Fields serialized once for matching nodes in the ancestor closure.
    pub(crate) ancestor_field_mask_by_type: Vec<FieldMask>,
    pub(crate) ancestor_types: NodeTypeSet,
    pub(crate) ancestor_child_parent_types: NodeTypeSet,
    pub(crate) has_ancestor_hydration: bool,
    pub(crate) ancestry_depth: u32,
    /// Predicate fields without direct scalar accessors; only these fields need
    /// materialization before matching.
    pub(crate) fallback_predicate_mask_by_type: Vec<FieldMask>,
    pub(crate) needs_semantics: bool,
    pub(crate) needs_comments: bool,
}

#[derive(Clone, Default)]
pub(crate) struct ChildRoleMask {
    pub(crate) wildcard: bool,
    pub(crate) role_ids: Vec<u32>,
}

impl ChildRoleMask {
    pub(crate) fn requests_children(&self) -> bool {
        self.wildcard || !self.role_ids.is_empty()
    }
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
    if flags & !0x7ff != 0 {
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
    let child_parent_count = word(6) as usize;
    if child_parent_count > NODE_TYPE_COUNT {
        return Err(Error::new(
            Status::InvalidArg,
            "child parent limit exceeded",
        ));
    }
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
        if route_flags & !1 != 0
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
            comments_inner: route_flags & 1 != 0,
        });
    }
    let mut child_role_mask_by_parent_type = vec![ChildRoleMask::default(); NODE_TYPE_COUNT + 1];
    for _ in 0..child_parent_count {
        if cursor + 3 > word_limit {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated child retention plan",
            ));
        }
        let type_id = word(cursor);
        let wildcard = word(cursor + 1);
        let role_count = word(cursor + 2) as usize;
        cursor += 3;
        if type_id == 0
            || type_id as usize > NODE_TYPE_COUNT
            || wildcard > 1
            || role_count > CHILD_ROLE_COUNT
            || cursor + role_count > word_limit
            || child_role_mask_by_parent_type[type_id as usize].requests_children()
            || wildcard == 1 && role_count != 0
        {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid child retention plan",
            ));
        }
        let mask = &mut child_role_mask_by_parent_type[type_id as usize];
        mask.wildcard = wildcard == 1;
        for _ in 0..role_count {
            let role_id = word(cursor);
            cursor += 1;
            if child_role_parent_type_id(role_id) != Some(type_id)
                || child_role_cardinality(role_id).is_none()
                || child_role_name(role_id).and_then(|role| child_role_id(type_id, role))
                    != Some(role_id)
                || mask.role_ids.contains(&role_id)
            {
                return Err(Error::new(Status::InvalidArg, "invalid child role id"));
            }
            mask.role_ids.push(role_id);
        }
        if !mask.wildcard && mask.role_ids.is_empty() {
            return Err(Error::new(Status::InvalidArg, "empty child retention plan"));
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
    let (
        mut ancestor_field_mask_by_type,
        ancestor_types,
        ancestor_child_parent_types,
        ancestry_depth,
    ) = if cursor == word_limit {
        (
            Vec::new(),
            NodeTypeSet::default(),
            NodeTypeSet::default(),
            u32::MAX,
        )
    } else {
        let ancestor_type_count = word(cursor) as usize;
        cursor += 1;
        let mut field_masks = if ancestor_type_count == 0 {
            Vec::new()
        } else {
            vec![FieldMask::none(); NODE_TYPE_COUNT + 1]
        };
        for _ in 0..ancestor_type_count {
            if cursor + 2 > word_limit {
                return Err(Error::new(
                    Status::InvalidArg,
                    "truncated ancestor field plan",
                ));
            }
            let type_id = word(cursor);
            let field_count = word(cursor + 1) as usize;
            cursor += 2;
            if type_id == 0
                || type_id as usize > NODE_TYPE_COUNT
                || !field_masks[type_id as usize].is_empty()
                || cursor + field_count > word_limit
            {
                return Err(Error::new(
                    Status::InvalidArg,
                    "invalid ancestor field plan",
                ));
            }
            let mut mask = FieldMask::none();
            for _ in 0..field_count {
                let field_id = word(cursor);
                cursor += 1;
                if field_key_name(field_id).is_none() || mask.wants(field_id) {
                    return Err(Error::new(Status::InvalidArg, "invalid ancestor field id"));
                }
                mask = mask.with(field_id);
            }
            field_masks[type_id as usize] = mask;
        }
        let mut decode_type_set = |label: &str| -> Result<NodeTypeSet> {
            if cursor >= word_limit {
                return Err(Error::new(Status::InvalidArg, format!("missing {label}")));
            }
            let count = word(cursor) as usize;
            cursor += 1;
            if cursor + count > word_limit {
                return Err(Error::new(Status::InvalidArg, format!("truncated {label}")));
            }
            let mut types = NodeTypeSet::default();
            for _ in 0..count {
                let type_id = word(cursor);
                cursor += 1;
                if type_id == 0 || type_id as usize > NODE_TYPE_COUNT || !types.insert(type_id) {
                    return Err(Error::new(Status::InvalidArg, format!("invalid {label}")));
                }
            }
            Ok(types)
        };
        let types = decode_type_set("ancestor node types")?;
        let child_parent_types = decode_type_set("ancestor child parent types")?;
        if cursor >= word_limit {
            return Err(Error::new(Status::InvalidArg, "missing ancestry depth"));
        }
        let depth = word(cursor);
        cursor += 1;
        (field_masks, types, child_parent_types, depth)
    };
    if ancestor_field_mask_by_type.is_empty() && !ancestor_child_parent_types.is_empty() {
        ancestor_field_mask_by_type.resize(NODE_TYPE_COUNT + 1, FieldMask::none());
    }
    let has_ancestor_hydration = !ancestor_child_parent_types.is_empty()
        || ancestor_field_mask_by_type
            .iter()
            .any(|mask| !mask.is_empty());
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
    let write_field_id = field_key_id("write");
    let semantic_mask = semantic_field_keys
        .iter()
        .filter(|name| **name != "write")
        .filter_map(|name| field_key_id(name))
        .fold(FieldMask::none(), |mask, field_id| mask.with(field_id));
    // Structural ancestry comes from the syntax traversal's parent stack.
    // Only lexical scope data and semantic-only fields require SemanticBuilder.
    let needs_semantics = include_scope
        || merged_field_mask_by_type
            .iter()
            .enumerate()
            .any(|(type_id, mask)| {
                mask.intersects(semantic_mask)
                    || node_type_name(type_id as u32) == Some("Identifier")
                        && write_field_id.is_some_and(|field_id| mask.wants(field_id))
            });
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
    let needs_comments = flags & (1 << 8) != 0
        || routes_by_type
            .iter()
            .flatten()
            .any(|route| route.comments_inner);
    Ok(CompiledManifest {
        program_only: routes_by_type[node_type_id("Program").expect("Program type") as usize].len()
            == route_count,
        routes_by_type,
        include_parent,
        include_scope,
        include_exit,
        include_traversal: flags & (1 << 10) != 0,
        retention_capabilities: (flags >> 2) & 0xff,
        child_role_mask_by_parent_type,
        merged_field_mask_by_type,
        ancestor_field_mask_by_type,
        ancestor_types,
        ancestor_child_parent_types,
        has_ancestor_hydration,
        ancestry_depth,
        fallback_predicate_mask_by_type,
        needs_semantics,
        needs_comments,
    })
}
