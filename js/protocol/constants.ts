export const DYNAMIC_TAG = 0x80000000;
export const TAG_INDEX = 0x7fffffff;
export const NUMBER_VALUE = 0x40000000;
export const NUMBER_PAYLOAD = 0x3fffffff;
export const EXIT_TAG = 0x20000000;
export const NODE_COUNT_PAYLOAD = 0x1fffffff;
export const MISSING_VALUE = 0xffffffff;
export const PARTS_TAG = 0x80000000;
export const PACKED_HEADER_BYTES = 16;
export const ROUTE_MANIFEST_MAGIC = 0x4e524d46;
export const ROUTED_TAPE_MAGIC = 0x4e525446;
export const ROUTED_HEADER_BYTES = 32;

export function alignToWord(offset: number): number {
  return (offset + 3) & ~3;
}

export function paddingFor(length: number): number {
  return (4 - (length % 4)) % 4;
}
