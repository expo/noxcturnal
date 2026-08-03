use napi::{Result, bindgen_prelude::Buffer};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::generated::event_schema::field_key_name;
use crate::protocol::manifest::{
    CompiledManifest, CompiledPredicate, CompiledRoute, CompiledScalar, VisitSide,
};
use crate::protocol::routed::{PackedWords, encode_routed_envelope};
use crate::semantic::retained_index::{RetainedFieldValue, RetainedIndex};

use super::RoutedCounts;
use super::fields::predicate_scalar_type;

pub(crate) fn routed_buffer_from_index(
    manifest: &CompiledManifest,
    index: &RetainedIndex,
    scope_parents: &[u32],
    root: Option<(u32, u32)>,
) -> Result<Buffer> {
    let mut writer =
        RetainedRouteWriter::with_capacity(index.traversal_records().len().saturating_mul(8));
    for &record in index.traversal_records() {
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

struct RetainedRouteWriter {
    words: PackedWords,
    string_ids: FxHashMap<String, u32>,
    counts: RoutedCounts,
    sequence: u32,
    route_scratch: Vec<u32>,
    parent_ids: FxHashSet<u32>,
}

impl RetainedRouteWriter {
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

    fn record(
        &mut self,
        manifest: &CompiledManifest,
        index: &RetainedIndex,
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
        self.words
            .extend([event_sequence, node_id, protocol_id, start, end]);
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
        let present = payload_ids
            .iter()
            .filter(|&&field_id| index.scalar_field(node_id, field_id).is_some())
            .count();
        self.words.push(present as u32);
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
                    let next = self.string_ids.len() as u32;
                    *self.string_ids.entry(value.to_owned()).or_insert(next)
                }
            };
            self.words.extend([field_id, value]);
        }
        if manifest.needs_comments {
            if comments_inner {
                let comments = index.inner_comments(start, end).collect::<Vec<_>>();
                self.words.push(comments.len() as u32);
                for comment in comments {
                    let next = self.string_ids.len() as u32;
                    let value = *self.string_ids.entry(comment.value.clone()).or_insert(next);
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
        index: &RetainedIndex,
        scope_parents: &[u32],
    ) -> Result<Buffer> {
        // Parent access commonly continues through several ancestors. Ship the
        // compact summary closure once with the routed batch instead of forcing
        // JavaScript to issue one synchronous N-API request per additional
        // level.
        let mut parent_ids = self.parent_ids;
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
            let mut strings = (0..self.string_ids.len())
                .map(|_| String::new())
                .collect::<Vec<_>>();
            for (value, id) in self.string_ids {
                strings[id as usize] = value;
            }
            return encode_routed_envelope(
                manifest,
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
                        let next = self.string_ids.len() as u32;
                        *self.string_ids.entry(value.to_owned()).or_insert(next)
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
        let mut strings = (0..self.string_ids.len())
            .map(|_| String::new())
            .collect::<Vec<_>>();
        for (value, id) in self.string_ids {
            strings[id as usize] = value;
        }
        encode_routed_envelope(
            manifest,
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
            let scalar_type = predicate_scalar_type(field_name, node_type_id, actual);
            predicate.values.iter().any(|expected| match expected {
                CompiledScalar::String(value) => scalar_type == 0 && actual == value,
                CompiledScalar::Number(value) => {
                    scalar_type == 1
                        && actual
                            .parse::<f64>()
                            .is_ok_and(|actual| actual == *value)
                }
                CompiledScalar::Boolean(value) => {
                    scalar_type == 2
                        && actual.parse::<bool>().is_ok_and(|actual| actual == *value)
                }
                CompiledScalar::Null => false,
            })
        }
    }
}
