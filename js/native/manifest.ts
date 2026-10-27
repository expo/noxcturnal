import { native, type NativeCompiledManifestBinding, type NativeManifest } from './binding';

// Prepared plans own immutable buffers. A missing entry deliberately leaves raw,
// potentially mutable buffers on the native compatibility/validation path.
const manifests = new WeakMap<Buffer, NativeCompiledManifestBinding | null>();

export function shareManifest(buffer: Buffer): Buffer {
  if (!manifests.has(buffer)) manifests.set(buffer, null);
  return buffer;
}

export function nativeManifest(buffer: Buffer): NativeManifest {
  const cached = manifests.get(buffer);
  if (cached === undefined) return buffer;
  if (cached !== null) return cached;
  const compiled = new native.NativeCompiledManifest(buffer);
  manifests.set(buffer, compiled);
  return compiled;
}
