use napi::{Result, bindgen_prelude::Buffer};

use super::constants::ROUTED_TAPE_MAGIC;
use super::manifest::CompiledManifest;

/// Indexed routing can leave bounds absent and use its lazy bulk table instead.
/// This keeps skip declarations from eagerly allocating per-node index caches.
pub(crate) fn routed_shape_flags(manifest: &CompiledManifest, inline_bounds: bool) -> u32 {
    u32::from(manifest.include_parent)
        | (u32::from(manifest.include_scope) << 1)
        | (u32::from(manifest.include_exit) << 2)
        | (u32::from(manifest.needs_comments) << 3)
        | (u32::from(inline_bounds) << 4)
}

pub(crate) fn encode_routed_envelope(
    shape_flags: u32,
    node_count: u32,
    strings: Vec<String>,
    data: Vec<u8>,
    node_records: u32,
    route_deliveries: u32,
    parent_summaries: Vec<u32>,
) -> Result<Buffer> {
    let strings_size: usize = strings
        .iter()
        .map(|value| 4 + value.len() + (4 - value.len() % 4) % 4)
        .sum();
    let records_offset = 32 + strings_size + parent_summaries.len() * 4;
    let mut output = Vec::with_capacity(records_offset + data.len());
    for word in [
        ROUTED_TAPE_MAGIC,
        shape_flags,
        node_count,
        node_records,
        route_deliveries,
        strings.len() as u32,
        records_offset as u32,
        (parent_summaries.len() / 8) as u32,
    ] {
        output.extend_from_slice(&word.to_le_bytes());
    }
    for value in strings {
        output.extend_from_slice(&(value.len() as u32).to_le_bytes());
        output.extend_from_slice(value.as_bytes());
        output.resize(output.len().next_multiple_of(4), 0);
    }
    for word in parent_summaries {
        output.extend_from_slice(&word.to_le_bytes());
    }
    output.extend_from_slice(&data);
    Ok(output.into())
}

pub(crate) struct PackedWords(Vec<u8>);

impl PackedWords {
    pub(crate) fn with_capacity(capacity: usize) -> Self {
        Self(Vec::with_capacity(capacity))
    }

    pub(crate) fn len(&self) -> usize {
        self.0.len()
    }

    pub(crate) fn patch(&mut self, offset: usize, word: u32) {
        self.0[offset..offset + 4].copy_from_slice(&word.to_le_bytes());
    }

    pub(crate) fn push(&mut self, word: u32) {
        self.0.extend_from_slice(&word.to_le_bytes());
    }

    pub(crate) fn extend<const N: usize>(&mut self, words: [u32; N]) {
        for word in words {
            self.push(word);
        }
    }

    pub(crate) fn extend_from_slice(&mut self, words: &[u32]) {
        for &word in words {
            self.push(word);
        }
    }

    pub(crate) fn into_bytes(self) -> Vec<u8> {
        self.0
    }
}
