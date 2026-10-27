use napi::{Error, Result, Status};
use rustc_hash::FxHashSet;

use crate::generated::event_schema::NODE_TYPE_COUNT;
use crate::semantic::retained_index::RetainedIndex;

const PLAN_MAGIC: u32 = 0x5043_464e;
const TYPE_WORDS: usize = (NODE_TYPE_COUNT + 32) / 32;
const EXIT: u32 = 1 << 31;

fn invalid(reason: &str) -> Error {
    Error::new(
        Status::InvalidArg,
        format!("invalid routed child roots: {reason}"),
    )
}

// [magic, route count, member count, type words], then route [start, count]
// pairs, then fixed-size members [plugin id, depth, direct types, ancestor types].
// TypeScript caches this source-independent projection by prepared-plan identity.
struct Plan<'a> {
    routes: &'a [u32],
    members: &'a [u32],
    member_words: usize,
}

impl<'a> Plan<'a> {
    fn decode(words: &'a [u32]) -> Result<Self> {
        if words.len() < 4 || words[0] != PLAN_MAGIC || words[3] as usize != TYPE_WORDS {
            return Err(invalid("plan header"));
        }
        let route_words = (words[1] as usize)
            .checked_mul(2)
            .ok_or_else(|| invalid("route count"))?;
        let member_words = 2 + TYPE_WORDS * 2;
        let members_length = (words[2] as usize)
            .checked_mul(member_words)
            .ok_or_else(|| invalid("member count"))?;
        let routes_end = 4_usize
            .checked_add(route_words)
            .ok_or_else(|| invalid("route count"))?;
        if routes_end.checked_add(members_length) != Some(words.len()) {
            return Err(invalid("plan length"));
        }
        let routes = &words[4..routes_end];
        for route in routes.chunks_exact(2) {
            if route[0]
                .checked_add(route[1])
                .is_none_or(|end| end > words[2])
            {
                return Err(invalid("route member range"));
            }
        }
        Ok(Self {
            routes,
            members: &words[routes_end..],
            member_words,
        })
    }

    fn apply(
        &self,
        route: u32,
        node_id: u32,
        node_type: u32,
        index: &RetainedIndex,
        stopped: &[u8],
        roots: &mut Roots,
    ) -> Result<()> {
        let start = (route as usize)
            .checked_mul(2)
            .ok_or_else(|| invalid("route id"))?;
        let end = start.checked_add(2).ok_or_else(|| invalid("route id"))?;
        let route = self
            .routes
            .get(start..end)
            .ok_or_else(|| invalid("route id"))?;
        let first = route[0] as usize * self.member_words;
        let last = first + route[1] as usize * self.member_words;
        for member in self.members[first..last].chunks_exact(self.member_words) {
            if stopped
                .get(member[0] as usize)
                .is_some_and(|flag| *flag != 0)
            {
                continue;
            }
            if contains(&member[2..2 + TYPE_WORDS], node_type) {
                roots.add(node_id);
            }
            let mut remaining = member[1];
            if remaining == 0 {
                continue;
            }
            let ancestor_types = &member[2 + TYPE_WORDS..];
            let mut ancestor = index.parent_id(node_id);
            while remaining != 0 {
                let Some(id) = ancestor else { break };
                let kind = index.type_id(id).ok_or_else(|| invalid("ancestor id"))?;
                if contains(ancestor_types, kind) {
                    roots.add(id);
                }
                ancestor = index.parent_id(id);
                remaining -= 1;
            }
        }
        Ok(())
    }
}

fn contains(types: &[u32], kind: u32) -> bool {
    types
        .get(kind as usize / 32)
        .is_some_and(|word| word & (1 << (kind % 32)) != 0)
}

#[derive(Default)]
struct Roots {
    seen: FxHashSet<u32>,
    ordered: Vec<u32>,
}

impl Roots {
    fn add(&mut self, id: u32) {
        if self.seen.insert(id) {
            self.ordered.push(id);
        }
    }
}

struct Tape<'a> {
    words: &'a [u32],
    offset: usize,
}

impl Tape<'_> {
    fn take(&mut self, count: usize) -> Result<&[u32]> {
        let end = self
            .offset
            .checked_add(count)
            .ok_or_else(|| invalid("tape length"))?;
        let words = self
            .words
            .get(self.offset..end)
            .ok_or_else(|| invalid("truncated tape"))?;
        self.offset = end;
        Ok(words)
    }

    fn word(&mut self) -> Result<u32> {
        Ok(self.take(1)?[0])
    }

    fn skip_records(&mut self, width: usize) -> Result<()> {
        let length = (self.word()? as usize)
            .checked_mul(width)
            .ok_or_else(|| invalid("record count"))?;
        self.take(length)?;
        Ok(())
    }
}

/// Select hydration roots without constructing events or decoding scalar payloads.
/// All identity and ancestry comes from the same retained semantic snapshot.
pub(super) fn routed_child_roots(
    index: &RetainedIndex,
    data: &[u32],
    flags: u32,
    plan: &[u32],
    stopped: &[u8],
) -> Result<Vec<u32>> {
    if flags & !31 != 0 {
        return Err(invalid("shape flags"));
    }
    let plan = Plan::decode(plan)?;
    let mut tape = Tape {
        words: data,
        offset: 0,
    };
    let mut roots = Roots::default();
    let mut enters = Vec::new();
    while tape.offset < tape.words.len() {
        let sequence = tape.word()?;
        let node_id = tape.word()?;
        let kind = index.type_id(node_id).ok_or_else(|| invalid("node id"))?;
        let exit = sequence & EXIT != 0;
        if exit {
            if flags & 4 == 0 || enters.pop() != Some(node_id) {
                return Err(invalid("exit pairing"));
            }
        } else {
            let type_tag = tape.word()?;
            if type_tag & !EXIT != kind {
                return Err(invalid("node type"));
            }
            if type_tag & EXIT != 0 {
                if flags & 4 == 0 {
                    return Err(invalid("exit shape"));
                }
                enters.push(node_id);
            }
            let header_words = 2
                + usize::from(flags & 16 != 0)
                + usize::from(flags & 1 != 0) * 2
                + usize::from(flags & 2 != 0) * 2;
            tape.take(header_words)?;
            tape.skip_records(2)?;
            if flags & 8 != 0 {
                tape.skip_records(4)?;
            }
        }
        let count = tape.word()? as usize;
        let routes = tape.take(count)?;
        if exit {
            for &route in routes.iter().rev() {
                plan.apply(route, node_id, kind, index, stopped, &mut roots)?;
            }
        } else {
            for &route in routes {
                plan.apply(route, node_id, kind, index, stopped, &mut roots)?;
            }
        }
    }
    if !enters.is_empty() {
        return Err(invalid("unclosed exit carriers"));
    }
    Ok(roots.ordered)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::generated::event_schema::node_type_id;

    fn index() -> RetainedIndex {
        let mut index = RetainedIndex::with_node_count(5, None, false, false);
        for (id, name, parent) in [
            (0, "Program", None),
            (1, "Function", Some(0)),
            (2, "BlockStatement", Some(1)),
            (3, "CallExpression", Some(2)),
            (4, "Identifier", Some(3)),
        ] {
            index.record(id, node_type_id(name).unwrap(), 0, 0, parent, 0);
        }
        index
    }

    fn member(plugin: u32, depth: u32, direct: &[&str], ancestors: &[&str]) -> Vec<u32> {
        let mut words = vec![plugin, depth];
        for names in [direct, ancestors] {
            let mut types = [0; TYPE_WORDS];
            for name in names {
                let id = node_type_id(name).unwrap() as usize;
                types[id / 32] |= 1 << (id % 32);
            }
            words.extend(types);
        }
        words
    }

    fn plan(members: &[Vec<u32>]) -> Vec<u32> {
        let mut words = vec![
            PLAN_MAGIC,
            members.len() as u32,
            members.len() as u32,
            TYPE_WORDS as u32,
        ];
        for id in 0..members.len() as u32 {
            words.extend([id, 1]);
        }
        for member in members {
            words.extend(member);
        }
        words
    }

    fn enter(
        index: &RetainedIndex,
        flags: u32,
        id: u32,
        carrier: bool,
        routes: &[u32],
    ) -> Vec<u32> {
        let mut words = vec![
            id,
            id,
            index.type_id(id).unwrap() | if carrier { EXIT } else { 0 },
            0,
            0,
        ];
        if flags & 16 != 0 {
            words.push(100);
        }
        if flags & 1 != 0 {
            words.extend([index.parent_id(id).unwrap_or(u32::MAX), 0]);
        }
        if flags & 2 != 0 {
            words.extend([0, u32::MAX]);
        }
        // These scalar/comment payload IDs deliberately have no string table:
        // root selection must skip the payload rather than try to decode it.
        words.extend([1, 1, 0xdead_beef]);
        if flags & 8 != 0 {
            words.extend([1, 1, 0xfeed_beef, 0, 0]);
        }
        words.push(routes.len() as u32);
        words.extend(routes);
        words
    }

    fn tape(index: &RetainedIndex, flags: u32) -> Vec<u32> {
        let exits = flags & 4 != 0;
        let mut words = enter(index, flags, 3, exits, &[0]);
        words.extend(enter(index, flags, 4, exits, &[1]));
        if exits {
            words.extend([EXIT | 5, 4, 1, 1]);
            words.extend([EXIT | 6, 3, 2, 0, 2]);
        }
        words
    }

    fn rules() -> Vec<u32> {
        plan(&[
            member(0, 2, &["CallExpression"], &["Function"]),
            member(1, u32::MAX, &["Identifier"], &["Program"]),
            member(2, 1, &["CallExpression"], &["BlockStatement"]),
        ])
    }

    #[test]
    fn selects_direct_and_ancestor_roots_across_every_optional_tape_shape() {
        let index = index();
        for flags in 0..32 {
            let roots =
                routed_child_roots(&index, &tape(&index, flags), flags, &rules(), &[]).unwrap();
            assert_eq!(
                roots,
                if flags & 4 != 0 {
                    vec![3, 1, 4, 0, 2]
                } else {
                    vec![3, 1, 4, 0]
                },
                "shape {flags}"
            );
        }
    }

    #[test]
    fn stopped_plugins_and_duplicate_members_preserve_first_encounter_order() {
        let index = index();
        assert_eq!(
            routed_child_roots(&index, &tape(&index, 4), 4, &rules(), &[0, 1]).unwrap(),
            [3, 1, 2]
        );
        assert_eq!(
            routed_child_roots(&index, &tape(&index, 4), 4, &rules(), &[1]).unwrap(),
            [4, 0, 3, 2]
        );
        assert_eq!(
            routed_child_roots(&index, &tape(&index, 4), 4, &rules(), &[1, 0, 1]).unwrap(),
            [4, 0]
        );
        assert_eq!(
            routed_child_roots(&index, &tape(&index, 4), 4, &rules(), &[0, 0, 0]).unwrap(),
            [3, 1, 4, 0, 2]
        );
        let mut duplicate = rules();
        duplicate[5] = 2; // Route zero visits members zero and one.
        assert!(
            routed_child_roots(&index, &tape(&index, 4), 4, &duplicate, &[1, 1, 1])
                .unwrap()
                .is_empty()
        );
        let mut exits = enter(&index, 4, 3, true, &[]);
        exits.extend([EXIT | 5, 3, 3, 0, 2, 0]);
        assert_eq!(
            routed_child_roots(&index, &exits, 4, &rules(), &[]).unwrap(),
            [3, 1, 2]
        );
        exits.splice(exits.len() - 3.., [0, 2, 2]);
        assert_eq!(
            routed_child_roots(&index, &exits, 4, &rules(), &[]).unwrap(),
            [3, 2, 1]
        );
    }

    #[test]
    fn ancestry_depth_uses_parent_identity_despite_coincident_anchors() {
        let index = index();
        let data = enter(&index, 0, 3, false, &[0]);
        for (depth, expected) in [
            (0, vec![]),
            (1, vec![]),
            (2, vec![1]),
            (u32::MAX, vec![1, 0]),
        ] {
            let rules = plan(&[member(0, depth, &[], &["Function", "Program"])]);
            assert_eq!(
                routed_child_roots(&index, &data, 0, &rules, &[]).unwrap(),
                expected
            );
        }
    }

    #[test]
    fn rejects_invalid_plans_node_ids_routes_and_truncated_payloads() {
        let index = index();
        let data = tape(&index, 0);
        let rules = rules();
        for length in 0..rules.len() {
            assert!(routed_child_roots(&index, &data, 0, &rules[..length], &[]).is_err());
        }
        let mut invalid_range = rules.clone();
        invalid_range[4] = u32::MAX;
        assert!(routed_child_roots(&index, &data, 0, &invalid_range, &[]).is_err());
        assert!(routed_child_roots(&index, &data, 32, &rules, &[]).is_err());
        let mut invalid_id = data.clone();
        invalid_id[1] = 99;
        assert!(routed_child_roots(&index, &invalid_id, 0, &rules, &[]).is_err());
        let mut invalid_type = data;
        invalid_type[2] = node_type_id("Program").unwrap();
        assert!(routed_child_roots(&index, &invalid_type, 0, &rules, &[]).is_err());
        let invalid_route = enter(&index, 0, 3, false, &[u32::MAX]);
        assert!(routed_child_roots(&index, &invalid_route, 0, &rules, &[]).is_err());
        let mut truncated = enter(&index, 8, 3, false, &[0]);
        truncated.pop();
        assert!(routed_child_roots(&index, &truncated, 8, &rules, &[]).is_err());
    }

    #[test]
    fn rejects_unmatched_and_unclosed_exit_carriers() {
        let index = index();
        let rules = rules();
        let mut data = enter(&index, 4, 3, true, &[0]);
        assert!(routed_child_roots(&index, &data, 4, &rules, &[]).is_err());
        data.extend([EXIT | 5, 4, 1, 0]);
        assert!(routed_child_roots(&index, &data, 4, &rules, &[]).is_err());
        assert!(routed_child_roots(&index, &[EXIT | 1, 3, 1, 0], 0, &rules, &[]).is_err());
    }
}
