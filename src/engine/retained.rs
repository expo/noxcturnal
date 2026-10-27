use napi::{Result, bindgen_prelude::Buffer};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::generated::event_schema::field_key_name;
use crate::protocol::manifest::{
    CompiledManifest, CompiledPredicate, CompiledRoute, CompiledScalar, VisitSide,
};
use crate::protocol::routed::{
    PackedWords, encode_routed_envelope, routed_shape_flags, routed_type_tag,
};
use crate::semantic::retained_index::{RetainedFieldValue, RetainedIndex};

use super::RoutedCounts;
use super::fields::{compiled_scalar_matches, predicate_scalar_type};

pub(crate) fn routed_buffer_from_index(
    manifest: &CompiledManifest,
    index: &RetainedIndex,
    scope_parents: &[u32],
    root: Option<(u32, u32)>,
) -> Result<Buffer> {
    let range = root.map_or_else(
        || 0..index.traversal_records().len(),
        |(start, end)| index.traversal_range(start, end),
    );
    routed_buffer_from_range(manifest, index, scope_parents, root, range)
}

pub(crate) fn routed_subtree_buffer_from_index(
    manifest: &CompiledManifest,
    index: &RetainedIndex,
    scope_parents: &[u32],
    root_id: u32,
) -> Result<Buffer> {
    routed_buffer_from_range(
        manifest,
        index,
        scope_parents,
        None,
        index.subtree_range(root_id),
    )
}

fn routed_buffer_from_range(
    manifest: &CompiledManifest,
    index: &RetainedIndex,
    scope_parents: &[u32],
    root: Option<(u32, u32)>,
    range: std::ops::Range<usize>,
) -> Result<Buffer> {
    let mut writer = RetainedRouteWriter::with_capacity(range.len().saturating_mul(8));
    if range.start > 0 {
        writer.sequence = index.traversal_sequence_before(
            range.start,
            manifest
                .routes_by_type
                .iter()
                .enumerate()
                .filter_map(|(type_id, routes)| {
                    routes
                        .iter()
                        .any(|route| route.side == VisitSide::Exit)
                        .then_some(type_id as u32)
                }),
        );
    }
    let records = &index.traversal_records()[range];
    for &record in records {
        // Inspection can retain exits for later nested visitors. Enter-only
        // manifests never advance their sequence for these records.
        if !manifest.include_exit && record & 0x8000_0000 != 0 {
            continue;
        }
        let side = if record & 0x8000_0000 != 0 {
            VisitSide::Exit
        } else {
            VisitSide::Enter
        };
        let node_id = record & 0x7fff_ffff;
        writer.record(manifest, index, node_id, side, scope_parents, root);
    }
    writer.finish(manifest, index.len() as u32, index, scope_parents)
}

struct RetainedRouteWriter<'a> {
    words: PackedWords,
    string_ids: FxHashMap<&'a str, u32>,
    counts: RoutedCounts,
    sequence: u32,
    route_scratch: Vec<u32>,
    parent_ids: FxHashSet<u32>,
}

impl<'a> RetainedRouteWriter<'a> {
    fn with_capacity(capacity: usize) -> Self {
        Self {
            words: PackedWords::with_capacity(capacity),
            string_ids: FxHashMap::default(),
            counts: RoutedCounts::default(),
            sequence: 0,
            route_scratch: Vec::new(),
            parent_ids: FxHashSet::default(),
        }
    }

    // The retained snapshot owns these strings until packing completes. Reuse
    // their bytes instead of cloning every response-local dictionary entry.
    fn intern(&mut self, value: &'a str) -> u32 {
        let next = self.string_ids.len() as u32;
        *self.string_ids.entry(value).or_insert(next)
    }

    fn record(
        &mut self,
        manifest: &CompiledManifest,
        index: &'a RetainedIndex,
        node_id: u32,
        side: VisitSide,
        scope_parents: &[u32],
        root: Option<(u32, u32)>,
    ) {
        let Some(protocol_id) = index.type_id(node_id) else {
            return;
        };
        let candidates = &manifest.routes_by_type[protocol_id as usize];
        if side == VisitSide::Exit && !candidates.iter().any(|route| route.side == VisitSide::Exit)
        {
            return;
        }
        let event_sequence = self.sequence;
        self.sequence += 1;
        if candidates.is_empty() {
            return;
        }
        let start = index.start(node_id);
        let end = index.end(node_id);
        if root.is_some_and(|(root_start, root_end)| start < root_start || end > root_end) {
            return;
        }
        let mut matched_routes = std::mem::take(&mut self.route_scratch);
        matched_routes.clear();
        let mut payload_route: Option<&CompiledRoute> = None;
        let mut payload_union: Vec<u32> = Vec::new();
        let mut matched_exit_carrier = false;
        let mut comments_inner = false;
        for route in candidates
            .iter()
            .filter(|route| side == VisitSide::Enter || route.side == side)
        {
            if route
                .predicates
                .iter()
                .all(|predicate| retained_predicate_matches(predicate, index, node_id, protocol_id))
            {
                if route.side == side {
                    matched_routes.push(route.id);
                } else {
                    matched_exit_carrier = true;
                }
                if !route.payload_field_ids.is_empty() {
                    if payload_route.is_none() && payload_union.is_empty() {
                        payload_route = Some(route);
                    } else {
                        if let Some(previous) = payload_route.take() {
                            payload_union.extend_from_slice(&previous.payload_field_ids);
                        }
                        for &field_id in &route.payload_field_ids {
                            if !payload_union.contains(&field_id) {
                                payload_union.push(field_id);
                            }
                        }
                    }
                }
                comments_inner |= route.comments_inner;
            }
        }
        if matched_routes.is_empty() && !matched_exit_carrier {
            self.route_scratch = matched_routes;
            return;
        }
        if side == VisitSide::Exit {
            self.words.extend([
                event_sequence | 0x8000_0000,
                node_id,
                matched_routes.len() as u32,
            ]);
            self.words.extend_from_slice(&matched_routes);
            self.counts.node_records += 1;
            self.counts.route_deliveries += matched_routes.len() as u32;
            self.route_scratch = matched_routes;
            return;
        }
        self.words.extend([
            event_sequence,
            node_id,
            routed_type_tag(protocol_id, matched_exit_carrier),
            start,
            end,
        ]);
        if manifest.include_parent {
            let parent_id = index.parent_id(node_id);
            if let Some(parent_id) = parent_id {
                self.parent_ids.insert(parent_id);
            }
            self.words.extend([
                parent_id.unwrap_or(u32::MAX),
                parent_id
                    .and_then(|parent_id| index.type_id(parent_id))
                    .unwrap_or(u32::MAX),
            ]);
        }
        if manifest.include_scope {
            let scope_id = index.scope_id(node_id);
            self.words.extend([
                scope_id,
                scope_parents
                    .get(scope_id as usize)
                    .copied()
                    .unwrap_or(u32::MAX),
            ]);
        }
        let payload_ids: &[u32] =
            payload_route.map_or(&payload_union, |route| &route.payload_field_ids);
        let count_offset = self.words.len();
        self.words.push(0);
        let mut present = 0;
        for &field_id in payload_ids {
            let Some(retained) = index.scalar_field(node_id, field_id) else {
                continue;
            };
            let value = match retained {
                RetainedFieldValue::Packed(value) => value,
                RetainedFieldValue::String(id) => {
                    let value = index
                        .scalar_string(id)
                        .expect("retained scalar string id is valid");
                    self.intern(value)
                }
            };
            self.words.extend([field_id, value]);
            present += 1;
        }
        self.words.patch(count_offset, present);
        if manifest.needs_comments {
            if comments_inner {
                let comments = index.inner_comments(start, end).collect::<Vec<_>>();
                self.words.push(comments.len() as u32);
                for comment in comments {
                    let value = self.intern(&comment.value);
                    self.words.extend([
                        u32::from(comment.block),
                        value,
                        comment.start,
                        comment.end,
                    ]);
                }
            } else {
                self.words.push(0);
            }
        }
        self.words.push(matched_routes.len() as u32);
        self.words.extend_from_slice(&matched_routes);
        self.counts.node_records += 1;
        self.counts.route_deliveries += matched_routes.len() as u32;
        self.route_scratch = matched_routes;
    }

    fn finish(
        mut self,
        manifest: &CompiledManifest,
        node_count: u32,
        index: &'a RetainedIndex,
        scope_parents: &[u32],
    ) -> Result<Buffer> {
        // Parent access commonly continues through several ancestors. Ship the
        // compact summary closure once with the routed batch instead of forcing
        // JavaScript to issue one synchronous N-API request per additional
        // level.
        let mut parent_ids = std::mem::take(&mut self.parent_ids);
        let seeds = parent_ids.iter().copied().collect::<Vec<_>>();
        if manifest.ancestry_depth == u32::MAX {
            for seed in seeds {
                let mut current = seed;
                while let Some(parent_id) = index.parent_id(current) {
                    if !parent_ids.insert(parent_id) {
                        break;
                    }
                    current = parent_id;
                }
            }
        } else {
            for seed in seeds {
                let mut current = seed;
                let mut depth = 1u32;
                while depth < manifest.ancestry_depth
                    && let Some(parent_id) = index.parent_id(current)
                {
                    if !parent_ids.insert(parent_id) {
                        break;
                    }
                    current = parent_id;
                    depth += 1;
                }
            }
        }
        let mut parent_ids = parent_ids.into_iter().collect::<Vec<_>>();
        parent_ids.sort_unstable();
        let parents = index.parent_summary_words(&parent_ids, scope_parents);
        if !manifest.has_ancestor_hydration {
            let data = self.words.into_bytes();
            let mut strings = vec![""; self.string_ids.len()];
            for (value, id) in self.string_ids {
                strings[id as usize] = value;
            }
            return encode_routed_envelope(
                routed_shape_flags(manifest, false),
                node_count,
                strings,
                data,
                self.counts.node_records,
                self.counts.route_deliveries,
                parents,
            );
        }
        // Hydrated ancestors are sparse zero-delivery node records appended once
        // per unique node. They share the routed string table and event cache, so
        // descendants reference them by ID without embedding ancestor payloads.
        let mut hydrated_ids = FxHashSet::default();
        let mut child_parents = Vec::new();
        for &node_id in &parent_ids {
            let Some(type_id) = index.type_id(node_id) else {
                continue;
            };
            let mask = manifest.ancestor_field_mask_by_type[type_id as usize];
            if !mask.is_empty() {
                hydrated_ids.insert(node_id);
            }
            if manifest.ancestor_types.contains(type_id)
                && manifest.ancestor_child_parent_types.contains(type_id)
            {
                child_parents.push(node_id);
            }
        }
        while let Some(parent_id) = child_parents.pop() {
            for child_id in index.children(parent_id) {
                if !hydrated_ids.insert(child_id) {
                    continue;
                }
                if index
                    .type_id(child_id)
                    .is_some_and(|type_id| manifest.ancestor_child_parent_types.contains(type_id))
                {
                    child_parents.push(child_id);
                }
            }
        }
        let mut hydrated_ids = hydrated_ids.into_iter().collect::<Vec<_>>();
        hydrated_ids.sort_unstable();
        let mut hydrated = PackedWords::with_capacity(hydrated_ids.len().saturating_mul(12));
        for node_id in hydrated_ids {
            let Some(type_id) = index.type_id(node_id) else {
                continue;
            };
            let mask = manifest.ancestor_field_mask_by_type[type_id as usize]
                .union(manifest.merged_field_mask_by_type[type_id as usize]);
            let field_count = index
                .scalar_fields(node_id)
                .filter(|(field_id, _)| mask.wants(*field_id))
                .count();
            hydrated.extend([
                node_id,
                node_id,
                type_id,
                index.start(node_id),
                index.end(node_id),
            ]);
            if manifest.include_parent {
                let parent_id = index.parent_id(node_id);
                hydrated.extend([
                    parent_id.unwrap_or(u32::MAX),
                    parent_id
                        .and_then(|parent_id| index.type_id(parent_id))
                        .unwrap_or(u32::MAX),
                ]);
            }
            if manifest.include_scope {
                let scope_id = index.scope_id(node_id);
                hydrated.extend([
                    scope_id,
                    scope_parents
                        .get(scope_id as usize)
                        .copied()
                        .unwrap_or(u32::MAX),
                ]);
            }
            hydrated.push(field_count as u32);
            for (field_id, retained) in index
                .scalar_fields(node_id)
                .filter(|(field_id, _)| mask.wants(*field_id))
            {
                let value = match retained {
                    RetainedFieldValue::Packed(value) => value,
                    RetainedFieldValue::String(id) => {
                        let value = index
                            .scalar_string(id)
                            .expect("retained scalar string id is valid");
                        self.intern(value)
                    }
                };
                hydrated.extend([field_id, value]);
            }
            if manifest.needs_comments {
                hydrated.push(0);
            }
            hydrated.push(0);
            self.counts.node_records += 1;
        }
        let mut data = hydrated.into_bytes();
        data.extend_from_slice(&self.words.into_bytes());
        let mut strings = vec![""; self.string_ids.len()];
        for (value, id) in self.string_ids {
            strings[id as usize] = value;
        }
        encode_routed_envelope(
            routed_shape_flags(manifest, false),
            node_count,
            strings,
            data,
            self.counts.node_records,
            self.counts.route_deliveries,
            parents,
        )
    }
}

fn retained_predicate_matches(
    predicate: &CompiledPredicate,
    index: &RetainedIndex,
    node_id: u32,
    node_type_id: u32,
) -> bool {
    let field_name = field_key_name(predicate.field_id).expect("validated predicate field");
    let actual = index.scalar_field(node_id, predicate.field_id);
    if predicate.operation == 2 {
        let expected = matches!(
            predicate.values.first(),
            Some(CompiledScalar::Boolean(true))
        );
        return actual.is_some() == expected;
    }
    let Some(actual) = actual else {
        return false;
    };
    match actual {
        RetainedFieldValue::Packed(value)
            if value & 0x8000_0000 != 0 =>
        {
            predicate
                .values
                .iter()
                .any(|expected| matches!(expected, CompiledScalar::Boolean(expected) if *expected == (value & 1 != 0)))
        }
        RetainedFieldValue::Packed(value)
            if value & 0x4000_0000 != 0 =>
        {
            let actual = (value & 0x3fff_ffff) as f64;
            predicate
                .values
                .iter()
                .any(|expected| matches!(expected, CompiledScalar::Number(expected) if *expected == actual))
        }
        RetainedFieldValue::Packed(_) => false,
        RetainedFieldValue::String(id) => {
            let actual = index
                .scalar_string(id)
                .expect("retained scalar string id is valid");
            let (scalar_type, actual) = if field_name == "constantValue" {
                crate::semantic::value_transport::scalar(actual)
            } else {
                (predicate_scalar_type(field_name, node_type_id, actual), actual)
            };
            predicate
                .values
                .iter()
                .any(|expected| compiled_scalar_matches(expected, scalar_type, actual))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::generated::event_schema::{field_ids, node_type_id};
    use crate::protocol::constants::{FieldMask, ROUTE_MANIFEST_MAGIC};

    #[test]
    fn route_packing_preserves_sparse_payloads_and_ignored_exit_sequences() {
        let identifier_type = node_type_id("Identifier").unwrap();
        let mut index = RetainedIndex::with_node_count(2, None, false, true);
        index.record(0, node_type_id("Program").unwrap(), 0, 10, None, 0);
        index.record(1, identifier_type, 2, 3, Some(0), 0);
        index.set_scalar_strings([("x".into(), 0)].into_iter().collect());
        index.record_packed_fields(1, &[field_ids::NAME, 0, field_ids::BINDING, 0x8000_0001]);
        index.set_comments(vec![
            crate::semantic::retained_index::RetainedComment {
                block: true,
                value: "x".into(),
                start: 2,
                end: 3,
            },
            crate::semantic::retained_index::RetainedComment {
                block: false,
                value: "雪😀".into(),
                start: 2,
                end: 3,
            },
        ]);
        index.record_enter(0);
        index.record_enter(1);
        index.record_exit(1);
        index.record_exit(0);
        for include_exit in [false, true] {
            let bytes = [ROUTE_MANIFEST_MAGIC, 0, 0, 0, 32, 0, 0, 0]
                .into_iter()
                .flat_map(u32::to_le_bytes)
                .collect::<Vec<_>>();
            let mut manifest = crate::engine::decode_route_manifest(&bytes).unwrap();
            manifest.include_exit = include_exit;
            manifest.program_only = false;
            manifest.needs_comments = true;
            for (id, payload_field_ids) in [
                vec![field_ids::GLOBAL, field_ids::NAME],
                vec![field_ids::NAME, field_ids::BINDING],
            ]
            .into_iter()
            .enumerate()
            {
                manifest.routes_by_type[identifier_type as usize].push(CompiledRoute {
                    id: id as u32,
                    node_type_id: identifier_type,
                    side: if include_exit && id == 1 {
                        VisitSide::Exit
                    } else {
                        VisitSide::Enter
                    },
                    predicates: Vec::new(),
                    payload_mask: payload_field_ids
                        .iter()
                        .fold(FieldMask::none(), |mask, &id| mask.with(id)),
                    payload_field_ids,
                    comments_inner: true,
                });
            }
            let actual = routed_buffer_from_index(&manifest, &index, &[], None).unwrap();
            let word = |offset| u32::from_le_bytes(actual[offset..offset + 4].try_into().unwrap());
            // Field and comment strings deduplicate by content, including when
            // equal values live in separate allocations in the retained index.
            assert_eq!(word(20), 2);
            assert_eq!(word(32), 1);
            assert_eq!(actual[36], b'x');
            assert_eq!(word(40), "雪😀".len() as u32);
            assert_eq!(&actual[44..51], "雪😀".as_bytes());
            let records_offset = word(24) as usize;
            assert_eq!(word(records_offset), 1);
            assert_eq!(word(records_offset + 5 * 4), 2);
            assert_eq!(
                (word(records_offset + 6 * 4), word(records_offset + 7 * 4)),
                (field_ids::NAME, 0)
            );
            assert_eq!(
                (word(records_offset + 8 * 4), word(records_offset + 9 * 4)),
                (field_ids::BINDING, 0x8000_0001)
            );
            assert_eq!(word(records_offset + 10 * 4), 2);
            assert_eq!(word(records_offset + 12 * 4), 0);
            assert_eq!(word(records_offset + 16 * 4), 1);
            assert_eq!(word(12), if include_exit { 2 } else { 1 });
            assert_eq!(word(16), 2);
        }
    }
}
