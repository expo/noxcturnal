/*
 * A flat C surface over the Hermes Flow parser, shaped for span-based erasure
 * rather than for rebuilding an ESTree tree in the caller.
 *
 * This is deliberately not `tools/hermes-parser/hermes-parser-wasm.cpp`. That
 * file serializes string fields as `(uint32_t)str.begin()` — a pointer
 * truncated to 32 bits, which is correct under emscripten and meaningless in a
 * 64-bit native process — and reports positions as UTF-16 line/column/offset
 * triples computed for JavaScript consumers. Erasure wants neither: it wants
 * byte offsets into the UTF-8 source, and it wants string fields it can
 * actually read.
 *
 * So the buffer written here is a self-contained blob of `uint32_t` words with
 * no pointers in it. That makes the Rust side safe over a plain `&[u32]`, and
 * it makes a recorded buffer a usable test fixture with no Hermes present.
 *
 * ## Wire format
 *
 * Header, four words:
 *
 *   [0] magic, `HERMES_FLOW_BUFFER_MAGIC`
 *   [1] ABI version, `HERMES_FLOW_BUFFER_ABI`
 *   [2] source length in bytes
 *   [3] reserved, zero
 *
 * Then the root `Program` node. A node is:
 *
 *   [kind + 1][start byte][end byte][field...]
 *
 * with `0` in place of the kind word for a null node pointer. Kinds are
 * `hermes::ESTree::NodeKind` values offset by one so zero can mean absent, as
 * in Hermes' own serializer. Start and end are byte offsets into the source
 * that was handed to `hermes_flow_parse`; end is exclusive.
 *
 * Fields follow the node's `ESTree.def` declaration order, encoded by type:
 *
 *   NodePtr                 a node, as above
 *   NodeList                [count] then that many nodes
 *   NodeBoolean             [0 or 1]
 *   NodeNumber              [low 32 bits][high 32 bits] of the f64, unaligned
 *   NodeLabel / NodeString  [length][bytes, zero-padded to a whole word], or
 *                           [HERMES_FLOW_NULL_LABEL] when the string is null
 *
 * The reader in `hermes-flow` is generated from the same `ESTree.def`, so both
 * sides agree on field order by construction; `hermes_flow_node_kind_name`
 * exists so a test can prove the kind numbering agrees too.
 */

#ifndef HERMES_FLOW_SHIM_H
#define HERMES_FLOW_SHIM_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* "HMFS", little-endian. */
#define HERMES_FLOW_BUFFER_MAGIC 0x53464d48u
#define HERMES_FLOW_BUFFER_ABI 1u
#define HERMES_FLOW_BUFFER_HEADER_WORDS 4u
#define HERMES_FLOW_NULL_LABEL 0xffffffffu

typedef struct HermesFlowParse HermesFlowParse;

/*
 * Parses `source`, which must be `length` bytes followed by a NUL that is not
 * counted in `length`. Never returns null; ask for the error.
 *
 * Flow, JSX, and the component/hook/match/record proposals are all enabled, so
 * a file using proposal syntax parses rather than failing. The erasure rules
 * bail on those nodes, and keeping the two outcomes distinguishable is what
 * lets the coverage counter tell "syntax we chose not to handle" apart from
 * "syntax this Hermes cannot parse".
 */
HermesFlowParse *hermes_flow_parse(const char *source, size_t length);

void hermes_flow_parse_free(HermesFlowParse *parse);

/* Null when the parse succeeded. Owned by the parse; valid until it is freed. */
const char *hermes_flow_parse_error(const HermesFlowParse *parse);
uint32_t hermes_flow_parse_error_line(const HermesFlowParse *parse);
uint32_t hermes_flow_parse_error_column(const HermesFlowParse *parse);

/* Null when the parse failed. */
const uint32_t *hermes_flow_parse_buffer(const HermesFlowParse *parse);
/* Length of the buffer in 32-bit words, including the header. */
size_t hermes_flow_parse_buffer_words(const HermesFlowParse *parse);

/*
 * Schema introspection. Used by the drift test that proves the generated Rust
 * kind constants still match this build of Hermes, not on any hot path.
 */
uint32_t hermes_flow_node_kind_count(void);
/* Name for a raw `NodeKind` value, or null when out of range. Range-start and
 * range-end sentinels are named `_Base_First` / `_Base_Last`, as in the enum. */
const char *hermes_flow_node_kind_name(uint32_t kind);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* HERMES_FLOW_SHIM_H */
