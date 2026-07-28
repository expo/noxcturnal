/*
 * Implementation of the C surface declared in `hermes_flow_shim.h`.
 *
 * Every table here is expanded from `hermes/AST/ESTree.def` rather than
 * written out, for the same reason the Rust reader is generated from it: a
 * Hermes pin bump that adds or reorders a node has to move both sides
 * together or fail loudly, and neither side is a list anyone maintains.
 */

#include "hermes/AST/Context.h"
#include "hermes/AST/ESTree.h"
#include "hermes/Parser/JSParser.h"

#include "llvh/ADT/StringRef.h"
#include "llvh/Support/ErrorHandling.h"
#include "llvh/Support/MemoryBuffer.h"

#include "HermesParserDiagHandler.h"
#include "hermes_flow_shim.h"

#include <cstdint>
#include <cstring>
#include <memory>
#include <string>
#include <vector>

using namespace hermes;
using namespace hermes::ESTree;

struct HermesFlowParse {
  std::string error;
  uint32_t errorLine = 0;
  uint32_t errorColumn = 0;
  /// Self-contained: no pointer in here outlives the parse that produced it,
  /// so the Hermes context and arena are released before this is returned.
  std::vector<uint32_t> buffer;
};

namespace {

/// Walks the AST once and appends it to a word buffer. Never allocates a node,
/// never revisits one; the cost is one linear append per field.
class BufferWriter {
 public:
  BufferWriter(const char *base, std::vector<uint32_t> &out)
      : base_(base), out_(out) {}

  void writeRoot(ProgramNode *program) { field(static_cast<NodePtr>(program)); }

 private:
  /// Start of the source text. `SMLoc`s point into it, so subtracting gives the
  /// byte offset directly — which is the whole reason this shim exists rather
  /// than the UTF-16 position buffer Hermes' own serializer produces.
  const char *base_;
  std::vector<uint32_t> &out_;

  void word(uint32_t value) { out_.push_back(value); }

  uint32_t offsetOf(llvh::SMLoc loc) const {
    return loc.isValid() ? static_cast<uint32_t>(loc.getPointer() - base_) : 0;
  }

  // -- one overload per field type in ESTree.def ---------------------------

  void field(NodeBoolean value) { word(value ? 1u : 0u); }

  void field(NodeNumber value) {
    uint64_t bits;
    std::memcpy(&bits, &value, sizeof bits);
    word(static_cast<uint32_t>(bits));
    word(static_cast<uint32_t>(bits >> 32));
  }

  /// `NodeLabel` and `NodeString` are the same C++ type, so this covers both.
  void field(NodeLabel value) {
    if (!value) {
      word(HERMES_FLOW_NULL_LABEL);
      return;
    }
    llvh::StringRef str = value->str();
    word(static_cast<uint32_t>(str.size()));
    size_t at = out_.size();
    out_.resize(at + (str.size() + 3) / 4, 0);
    std::memcpy(out_.data() + at, str.data(), str.size());
  }

  void field(NodeList &list) {
    word(static_cast<uint32_t>(list.size()));
    for (Node &child : list) {
      field(&child);
    }
  }

  void field(NodePtr node) {
    if (!node) {
      word(0);
      return;
    }
    word(static_cast<uint32_t>(node->getKind()) + 1);
    llvh::SMRange range = node->getSourceRange();
    word(offsetOf(range.Start));
    word(offsetOf(range.End));

    switch (node->getKind()) {
      default:
        llvm_unreachable("invalid node kind");

#define HERMES_FLOW_DISPATCH(NAME) \
  case NodeKind::NAME:             \
    fields(cast<NAME##Node>(node));\
    return;

#define ESTREE_NODE_0_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_1_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_2_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_3_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_4_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_5_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_6_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_7_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_8_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_9_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#define ESTREE_NODE_10_ARGS(NAME, ...) HERMES_FLOW_DISPATCH(NAME)
#include "hermes/AST/ESTree.def"
#undef HERMES_FLOW_DISPATCH
    }
  }

  // -- per-node field writers, expanded from the same definitions ----------

#define W(NM) field(node->_##NM);

#define ESTREE_NODE_0_ARGS(NAME, BASE) \
  void fields(NAME##Node *) {}
#define ESTREE_NODE_1_ARGS(NAME, BASE, T0, N0, O0) \
  void fields(NAME##Node *node) { W(N0) }
#define ESTREE_NODE_2_ARGS(NAME, BASE, T0, N0, O0, T1, N1, O1) \
  void fields(NAME##Node *node) { W(N0) W(N1) }
#define ESTREE_NODE_3_ARGS(NAME, BASE, T0, N0, O0, T1, N1, O1, T2, N2, O2) \
  void fields(NAME##Node *node) { W(N0) W(N1) W(N2) }
#define ESTREE_NODE_4_ARGS( \
    NAME, BASE, T0, N0, O0, T1, N1, O1, T2, N2, O2, T3, N3, O3) \
  void fields(NAME##Node *node) { W(N0) W(N1) W(N2) W(N3) }
#define ESTREE_NODE_5_ARGS( \
    NAME, BASE, T0, N0, O0, T1, N1, O1, T2, N2, O2, T3, N3, O3, T4, N4, O4) \
  void fields(NAME##Node *node) { W(N0) W(N1) W(N2) W(N3) W(N4) }
#define ESTREE_NODE_6_ARGS( \
    NAME, BASE, T0, N0, O0, T1, N1, O1, T2, N2, O2, T3, N3, O3, T4, N4, O4, \
    T5, N5, O5) \
  void fields(NAME##Node *node) { W(N0) W(N1) W(N2) W(N3) W(N4) W(N5) }
#define ESTREE_NODE_7_ARGS( \
    NAME, BASE, T0, N0, O0, T1, N1, O1, T2, N2, O2, T3, N3, O3, T4, N4, O4, \
    T5, N5, O5, T6, N6, O6) \
  void fields(NAME##Node *node) { W(N0) W(N1) W(N2) W(N3) W(N4) W(N5) W(N6) }
#define ESTREE_NODE_8_ARGS( \
    NAME, BASE, T0, N0, O0, T1, N1, O1, T2, N2, O2, T3, N3, O3, T4, N4, O4, \
    T5, N5, O5, T6, N6, O6, T7, N7, O7) \
  void fields(NAME##Node *node) { \
    W(N0) W(N1) W(N2) W(N3) W(N4) W(N5) W(N6) W(N7) \
  }
#define ESTREE_NODE_9_ARGS( \
    NAME, BASE, T0, N0, O0, T1, N1, O1, T2, N2, O2, T3, N3, O3, T4, N4, O4, \
    T5, N5, O5, T6, N6, O6, T7, N7, O7, T8, N8, O8) \
  void fields(NAME##Node *node) { \
    W(N0) W(N1) W(N2) W(N3) W(N4) W(N5) W(N6) W(N7) W(N8) \
  }
#define ESTREE_NODE_10_ARGS( \
    NAME, BASE, T0, N0, O0, T1, N1, O1, T2, N2, O2, T3, N3, O3, T4, N4, O4, \
    T5, N5, O5, T6, N6, O6, T7, N7, O7, T8, N8, O8, T9, N9, O9) \
  void fields(NAME##Node *node) { \
    W(N0) W(N1) W(N2) W(N3) W(N4) W(N5) W(N6) W(N7) W(N8) W(N9) \
  }
#include "hermes/AST/ESTree.def"
#undef W
};

/// Names indexed by raw `NodeKind`. The enum in `ESTree.h` is expanded from the
/// same file with the same sentinels, so index and enumerator agree.
const char *const kNodeKindNames[] = {
#define ESTREE_FIRST(NAME, ...) "_" #NAME "_First",
#define ESTREE_LAST(NAME) "_" #NAME "_Last",
#define ESTREE_NODE_0_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_1_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_2_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_3_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_4_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_5_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_6_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_7_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_8_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_9_ARGS(NAME, ...) #NAME,
#define ESTREE_NODE_10_ARGS(NAME, ...) #NAME,
#include "hermes/AST/ESTree.def"
};

constexpr uint32_t kNodeKindCount =
    static_cast<uint32_t>(sizeof(kNodeKindNames) / sizeof(kNodeKindNames[0]));

} // namespace

HermesFlowParse *hermes_flow_parse(const char *source, size_t length) {
  auto parse = std::make_unique<HermesFlowParse>();
  if (source == nullptr || source[length] != 0) {
    parse->error = "Input source must be zero-terminated";
    return parse.release();
  }

  auto context = std::make_shared<Context>();
  auto &sm = context->getSourceErrorManager();
  const HermesParserDiagHandler diagHandler(sm);

  int bufferId = sm.addNewSourceBuffer(
      llvh::MemoryBuffer::getMemBuffer(llvh::StringRef{source, length}));

  // Unambiguous mode exists for callers that do not know whether a file is
  // Flow. This one is only reached for files already classified as Flow, and
  // the proposals are on so that proposal syntax parses and then bails on a
  // rule rather than looking like a broken file.
  context->setParseFlow(ParseFlowSetting::ALL);
  context->setParseFlowComponentSyntax(true);
  context->setParseFlowMatch(true);
  context->setParseFlowRecords(true);
  context->setParseJSX(true);
  context->setUseCJSModules(true);

  parser::JSParser jsParser(*context, bufferId, parser::FullParse);
  llvh::Optional<ProgramNode *> program = jsParser.parse();

  if (diagHandler.hasError()) {
    parse->error = diagHandler.getErrorString();
    parse->errorLine = diagHandler.getErrorLine();
    parse->errorColumn = diagHandler.getErrorColumn();
    return parse.release();
  }
  if (!program) {
    parse->error = "Failed to parse source";
    return parse.release();
  }

  // No semantic resolution. Erasure reads spans; a semantic error in the input
  // is the downstream parser's to report, and skipping `hermesSema` keeps 19k
  // lines of C++ out of eight release builds.
  parse->buffer.reserve(HERMES_FLOW_BUFFER_HEADER_WORDS + length / 2);
  parse->buffer.push_back(HERMES_FLOW_BUFFER_MAGIC);
  parse->buffer.push_back(HERMES_FLOW_BUFFER_ABI);
  parse->buffer.push_back(static_cast<uint32_t>(length));
  parse->buffer.push_back(0);
  BufferWriter(source, parse->buffer).writeRoot(*program);

  return parse.release();
}

void hermes_flow_parse_free(HermesFlowParse *parse) {
  delete parse;
}

const char *hermes_flow_parse_error(const HermesFlowParse *parse) {
  if (parse == nullptr || parse->error.empty()) {
    return nullptr;
  }
  return parse->error.c_str();
}

uint32_t hermes_flow_parse_error_line(const HermesFlowParse *parse) {
  return parse == nullptr ? 0 : parse->errorLine;
}

uint32_t hermes_flow_parse_error_column(const HermesFlowParse *parse) {
  return parse == nullptr ? 0 : parse->errorColumn;
}

const uint32_t *hermes_flow_parse_buffer(const HermesFlowParse *parse) {
  if (parse == nullptr || !parse->error.empty()) {
    return nullptr;
  }
  return parse->buffer.data();
}

size_t hermes_flow_parse_buffer_words(const HermesFlowParse *parse) {
  if (parse == nullptr || !parse->error.empty()) {
    return 0;
  }
  return parse->buffer.size();
}

uint32_t hermes_flow_node_kind_count(void) {
  return kNodeKindCount;
}

const char *hermes_flow_node_kind_name(uint32_t kind) {
  return kind < kNodeKindCount ? kNodeKindNames[kind] : nullptr;
}
