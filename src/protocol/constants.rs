//! Shared wire-format constants. Keep these values in sync with
//! `js/protocol/constants.ts`; protocol tests exercise both encoders together.

use crate::generated::event_schema::NODE_TYPE_COUNT;

pub(crate) const PARTS_TAG: u32 = 0x8000_0000;
pub(crate) const ROUTE_MANIFEST_MAGIC: u32 = 0x4e_52_4d_46; // NRMF
pub(crate) const ROUTED_TAPE_MAGIC: u32 = 0x4e_52_54_46; // NRTF

pub(crate) const MAX_COMPILED_ROUTES: usize = 4096;
pub(crate) const MAX_ROUTE_PREDICATES: usize = 64;
pub(crate) const MAX_PREDICATE_VALUES: usize = 1024;
pub(crate) const MAX_ROUTE_PAYLOAD_FIELDS: usize = 64;
pub(crate) const MAX_ROUTE_MANIFEST_BYTES: usize = 4 * 1024 * 1024;

/// The set of field keys a collector should materialize for one node.
///
/// Field selection runs per node for every routed and retained record, so the
/// requested set is one machine word rather than a name list: `all()` means the
/// caller took no position, and every other value is a bit per protocol field id.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(crate) struct FieldMask(u64);

impl FieldMask {
    const ALL: u64 = u64::MAX;

    pub(crate) const fn all() -> Self {
        Self(Self::ALL)
    }

    pub(crate) const fn none() -> Self {
        Self(0)
    }

    pub(crate) const fn with(self, field_id: u32) -> Self {
        Self(self.0 | 1u64 << field_id)
    }

    pub(crate) const fn without(self, field_id: u32) -> Self {
        Self(self.0 & !(1u64 << field_id))
    }

    pub(crate) const fn union(self, other: Self) -> Self {
        Self(self.0 | other.0)
    }

    pub(crate) const fn wants(self, field_id: u32) -> bool {
        self.0 & (1u64 << field_id) != 0
    }

    pub(crate) const fn is_empty(self) -> bool {
        self.0 == 0
    }

    pub(crate) const fn intersects(self, other: Self) -> bool {
        self.0 & other.0 != 0
    }
}

/// A set of protocol node type ids.
///
/// Membership is tested once per node in the retained collector, so the set is a
/// fixed bitset indexed by type id rather than a hash set.
#[derive(Clone, Default, PartialEq, Eq)]
pub(crate) struct NodeTypeSet([u64; NODE_TYPE_SET_WORDS]);

const NODE_TYPE_SET_WORDS: usize = (NODE_TYPE_COUNT + 1).div_ceil(64);

impl NodeTypeSet {
    pub(crate) fn insert(&mut self, node_type_id: u32) -> bool {
        let (word, bit) = Self::position(node_type_id);
        let added = self.0[word] & bit == 0;
        self.0[word] |= bit;
        added
    }

    pub(crate) fn contains(&self, node_type_id: u32) -> bool {
        let (word, bit) = Self::position(node_type_id);
        self.0[word] & bit != 0
    }

    pub(crate) fn is_empty(&self) -> bool {
        self.0.iter().all(|word| *word == 0)
    }

    fn position(node_type_id: u32) -> (usize, u64) {
        let index = node_type_id as usize;
        debug_assert!(index <= NODE_TYPE_COUNT);
        (index / 64, 1u64 << (index % 64))
    }
}
