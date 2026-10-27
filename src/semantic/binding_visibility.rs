use std::rc::Rc;

use napi::bindgen_prelude::Buffer;

const ABSENT: u32 = u32::MAX;

/// Scope IDs are identities, not traversal positions. Build explicit half-open
/// subtree intervals from their parent links, independently of AST spans/ID order.
fn scope_ranges(parents: &[u32]) -> Vec<[u32; 2]> {
    let mut first = vec![ABSENT; parents.len()];
    let mut next = vec![ABSENT; parents.len()];
    let mut roots = Vec::new();
    for (id, &parent) in parents.iter().enumerate() {
        if parent == ABSENT {
            roots.push(id as u32);
        } else {
            next[id] = first[parent as usize];
            first[parent as usize] = id as u32;
        }
    }
    let mut ranges = vec![[0, 0]; parents.len()];
    let mut position = 0;
    let mut pending = roots.into_iter().map(|id| (id, false)).collect::<Vec<_>>();
    while let Some((id, exit)) = pending.pop() {
        if exit {
            ranges[id as usize][1] = position;
        } else {
            ranges[id as usize][0] = position;
            position += 1;
            pending.push((id, true));
            let mut child = first[id as usize];
            while child != ABSENT {
                pending.push((child, false));
                child = next[child as usize];
            }
        }
    }
    ranges
}

/// Changes to the nearest visible declaration, in scope preorder. Restoring the
/// outer binding at each exit also handles sibling subtrees without a backward
/// scan during lookup. Coincident exits/enters collapse to their final value.
fn visibility_changes(scopes: &[u32], ranges: &[[u32; 2]]) -> Vec<[u32; 2]> {
    let mut changes: Vec<[u32; 2]> = Vec::with_capacity(scopes.len() * 2);
    let mut active: Vec<u32> = Vec::new();
    let mut emit = |position, scope| {
        if let Some(last) = changes.last_mut()
            && last[0] == position
        {
            last[1] = scope;
        } else {
            changes.push([position, scope]);
        }
    };
    for &scope in scopes {
        let start = ranges[scope as usize][0];
        while let Some(&owner) = active.last() {
            let end = ranges[owner as usize][1];
            if end > start {
                break;
            }
            active.pop();
            emit(end, active.last().copied().unwrap_or(ABSENT));
        }
        emit(start, scope);
        active.push(scope);
    }
    while let Some(owner) = active.pop() {
        emit(
            ranges[owner as usize][1],
            active.last().copied().unwrap_or(ABSENT),
        );
    }
    changes
}

/// Header: bound-name count, scope count, then two u32 interval words per scope.
/// Each name: padded length-prefixed UTF-8, original name ID, change count. A zero
/// count carries one owning scope; otherwise it carries (position, owner) changes.
/// Unbound names never need to cross the native/JS boundary for binding lookup.
pub(super) fn encode(
    names: &[Rc<str>],
    bindings: impl Iterator<Item = (u32, u32)>,
    parents: &[u32],
) -> Buffer {
    let ranges = scope_ranges(parents);
    let mut bindings = bindings.collect::<Vec<_>>();
    bindings.sort_unstable_by_key(|&(scope, name)| (name, ranges[scope as usize][0]));
    let name_count = bindings.chunk_by(|a, b| a.1 == b.1).count();
    let mut output = Vec::with_capacity(8 + ranges.len() * 8 + bindings.len() * 24);
    output.extend_from_slice(&(name_count as u32).to_le_bytes());
    output.extend_from_slice(&(ranges.len() as u32).to_le_bytes());
    for range in &ranges {
        for word in range {
            output.extend_from_slice(&word.to_le_bytes());
        }
    }
    for group in bindings.chunk_by(|a, b| a.1 == b.1) {
        let name_id = group[0].1;
        let name = &names[name_id as usize];
        output.extend_from_slice(&(name.len() as u32).to_le_bytes());
        output.extend_from_slice(name.as_bytes());
        output.resize(output.len().next_multiple_of(4), 0);
        output.extend_from_slice(&name_id.to_le_bytes());
        if group.len() == 1 {
            output.extend_from_slice(&0_u32.to_le_bytes());
            output.extend_from_slice(&group[0].0.to_le_bytes());
        } else {
            let scopes = group.iter().map(|&(scope, _)| scope).collect::<Vec<_>>();
            let changes = visibility_changes(&scopes, &ranges);
            output.extend_from_slice(&(changes.len() as u32).to_le_bytes());
            for change in changes {
                for word in change {
                    output.extend_from_slice(&word.to_le_bytes());
                }
            }
        }
    }
    output.into()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn intervals_follow_parent_links_not_id_order() {
        let parents = [ABSENT, 4, 0, 2, 0, 4];
        assert_eq!(
            scope_ranges(&parents),
            [[0, 6], [4, 5], [1, 3], [2, 3], [3, 6], [5, 6]]
        );
    }

    #[test]
    fn visibility_matches_ancestor_walk_for_every_binding_placement() {
        // Includes a parent whose ID follows its child, adjacent siblings, and
        // nested bindings whose exits coincide. No source coordinates are used.
        let parents = [ABSENT, 4, 0, 2, 0, 4];
        let ranges = scope_ranges(&parents);
        for mask in 1..1 << parents.len() {
            let mut scopes = (0..parents.len() as u32)
                .filter(|&id| mask & (1 << id) != 0)
                .collect::<Vec<_>>();
            scopes.sort_unstable_by_key(|&id| ranges[id as usize][0]);
            let changes = visibility_changes(&scopes, &ranges);
            for target in 0..parents.len() as u32 {
                let mut expected = target;
                while expected != ABSENT && !scopes.contains(&expected) {
                    expected = parents[expected as usize];
                }
                let end = changes.partition_point(|change| change[0] <= ranges[target as usize][0]);
                let actual = end.checked_sub(1).map_or(ABSENT, |index| changes[index][1]);
                assert_eq!(actual, expected, "mask={mask} scope={target}");
            }
        }
    }

    #[test]
    fn deeply_nested_scopes_need_no_recursive_walk() {
        let mut parents = vec![ABSENT];
        parents.extend(0..4095);
        let ranges = scope_ranges(&parents);
        assert_eq!(ranges[0], [0, 4096]);
        assert_eq!(ranges[4095], [4095, 4096]);
        let scopes = (0..4096).collect::<Vec<_>>();
        let changes = visibility_changes(&scopes, &ranges);
        assert_eq!(changes.len(), 4097);
        assert_eq!(changes[4096], [4096, ABSENT]);
    }
}
