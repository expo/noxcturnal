use std::sync::Arc;

use napi::{
    Result,
    bindgen_prelude::{Buffer, Either},
};
use napi_derive::napi;

use crate::protocol::manifest::CompiledManifest;

pub(super) struct ManifestData {
    bytes: Box<[u8]>,
    compiled: CompiledManifest,
}

/// Source-independent routing metadata owned by a prepared JavaScript plan.
/// Copy the input once: subsequent Buffer mutations cannot change this snapshot.
#[napi]
pub struct NativeCompiledManifest {
    data: Arc<ManifestData>,
}

#[napi]
impl NativeCompiledManifest {
    #[napi(constructor)]
    pub fn new(manifest: Buffer) -> Result<Self> {
        let bytes = manifest.to_vec().into_boxed_slice();
        let compiled = super::decode_route_manifest(&bytes)?;
        Ok(Self {
            data: Arc::new(ManifestData { bytes, compiled }),
        })
    }
}

pub(super) enum ResolvedManifest<'a> {
    Buffer {
        bytes: Buffer,
        compiled: Box<CompiledManifest>,
    },
    Shared(&'a NativeCompiledManifest),
}

impl<'a> ResolvedManifest<'a> {
    pub(super) fn new(manifest: Either<Buffer, &'a NativeCompiledManifest>) -> Result<Self> {
        match manifest {
            Either::A(bytes) => {
                let compiled = Box::new(super::decode_route_manifest(&bytes)?);
                Ok(Self::Buffer { bytes, compiled })
            }
            Either::B(shared) => Ok(Self::Shared(shared)),
        }
    }

    pub(super) fn compiled(&self) -> &CompiledManifest {
        match self {
            Self::Buffer { compiled, .. } => compiled,
            Self::Shared(shared) => &shared.data.compiled,
        }
    }

    fn bytes(&self) -> &[u8] {
        match self {
            Self::Buffer { bytes, .. } => bytes,
            Self::Shared(shared) => &shared.data.bytes,
        }
    }

    pub(super) fn key(&self) -> ManifestKey {
        match self {
            Self::Buffer { bytes, .. } => ManifestKey::Bytes(bytes.to_vec()),
            Self::Shared(shared) => ManifestKey::Shared(Arc::clone(&shared.data)),
        }
    }
}

pub(super) enum ManifestKey {
    Bytes(Vec<u8>),
    Shared(Arc<ManifestData>),
}

impl ManifestKey {
    pub(super) fn memory_usage(&self) -> usize {
        match self {
            Self::Bytes(bytes) => bytes.capacity(),
            // Shared metadata belongs to the prepared plan, not each session.
            Self::Shared(_) => 0,
        }
    }

    pub(super) fn matches(&self, manifest: &ResolvedManifest<'_>) -> bool {
        match (self, manifest) {
            (Self::Shared(left), ResolvedManifest::Shared(right))
                if Arc::ptr_eq(left, &right.data) =>
            {
                true
            }
            (Self::Bytes(bytes), _) => bytes == manifest.bytes(),
            (Self::Shared(shared), _) => shared.bytes.as_ref() == manifest.bytes(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::constants::ROUTE_MANIFEST_MAGIC;

    #[test]
    fn session_keys_keep_metadata_alive_after_handle_drop() {
        let bytes = [ROUTE_MANIFEST_MAGIC, 0, 0, 0, 32, 0, 0, 0]
            .into_iter()
            .flat_map(u32::to_le_bytes)
            .collect::<Vec<_>>()
            .into_boxed_slice();
        let compiled = super::super::decode_route_manifest(&bytes).unwrap();
        let handle = NativeCompiledManifest {
            data: Arc::new(ManifestData { bytes, compiled }),
        };
        let weak = Arc::downgrade(&handle.data);
        let first = ResolvedManifest::Shared(&handle).key();
        let second = ResolvedManifest::Shared(&handle).key();
        drop(handle);
        drop(first);
        assert!(weak.upgrade().is_some());
        // A new handle can use the metadata retained by the remaining session.
        let surviving_handle = NativeCompiledManifest {
            data: weak.upgrade().unwrap(),
        };
        assert!(second.matches(&ResolvedManifest::Shared(&surviving_handle)));
        drop(surviving_handle);
        drop(second);
        assert!(weak.upgrade().is_none());
    }
}
