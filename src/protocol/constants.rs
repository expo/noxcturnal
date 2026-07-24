//! Shared wire-format constants. Keep these values in sync with
//! `js/protocol/constants.ts`; protocol tests exercise both encoders together.

pub(crate) const PARTS_TAG: u32 = 0x8000_0000;
pub(crate) const ROUTE_MANIFEST_MAGIC: u32 = 0x4e_52_4d_46; // NRMF
pub(crate) const ROUTED_TAPE_MAGIC: u32 = 0x4e_52_54_46; // NRTF

pub(crate) const MAX_COMPILED_ROUTES: usize = 4096;
pub(crate) const MAX_ROUTE_PREDICATES: usize = 64;
pub(crate) const MAX_PREDICATE_VALUES: usize = 1024;
pub(crate) const MAX_ROUTE_PAYLOAD_FIELDS: usize = 64;
pub(crate) const MAX_ROUTE_MANIFEST_BYTES: usize = 4 * 1024 * 1024;
