//! Bindings to the native Hermes Flow parser.
//!
//! The C surface is described in `cpp/hermes_flow_shim.h`, including the wire
//! format of the buffer a parse produces. The short version: a parse yields a
//! self-contained blob of `u32` words with no pointers in it, so everything
//! above this crate works on an ordinary slice.
//!
//! [`Parse`] is the only thing callers need; the `extern "C"` declarations are
//! public for the drift test in `hermes-flow` and are not otherwise interesting.

use std::ffi::{CStr, c_char};
use std::fmt;
use std::os::raw::c_void;

/// Magic word at `buffer()[0]`. "HMFS", little-endian.
pub const BUFFER_MAGIC: u32 = 0x5346_4d48;
/// Wire format version at `buffer()[1]`.
pub const BUFFER_ABI: u32 = 1;
/// Words of header before the root node.
pub const BUFFER_HEADER_WORDS: usize = 4;
/// Length word written in place of a null `NodeLabel`.
pub const NULL_LABEL: u32 = u32::MAX;

/// Opaque handle to a parse result. Never constructed on the Rust side.
#[repr(C)]
pub struct HermesFlowParse {
    _opaque: [u8; 0],
    _not_send: std::marker::PhantomData<*mut c_void>,
}

unsafe extern "C" {
    pub fn hermes_flow_parse(source: *const c_char, length: usize) -> *mut HermesFlowParse;
    pub fn hermes_flow_parse_free(parse: *mut HermesFlowParse);
    pub fn hermes_flow_parse_error(parse: *const HermesFlowParse) -> *const c_char;
    pub fn hermes_flow_parse_error_line(parse: *const HermesFlowParse) -> u32;
    pub fn hermes_flow_parse_error_column(parse: *const HermesFlowParse) -> u32;
    pub fn hermes_flow_parse_buffer(parse: *const HermesFlowParse) -> *const u32;
    pub fn hermes_flow_parse_buffer_words(parse: *const HermesFlowParse) -> usize;
    pub fn hermes_flow_node_kind_count() -> u32;
    pub fn hermes_flow_node_kind_name(kind: u32) -> *const c_char;
}

/// A parse error, with the position Hermes reported for it.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseError {
    pub message: String,
    pub line: u32,
    pub column: u32,
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:{}: {}", self.line, self.column, self.message)
    }
}

impl std::error::Error for ParseError {}

/// An owned parse result. Dropping it frees the native buffer.
pub struct Parse {
    raw: *mut HermesFlowParse,
}

impl fmt::Debug for Parse {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Parse")
            .field("words", &self.buffer().len())
            .finish()
    }
}

// The buffer is immutable for the life of the parse and the handle owns it
// outright, so it can move between threads. It is not `Sync` — nothing needs
// that, and Hermes makes no claim about concurrent reads of its allocations.
unsafe impl Send for Parse {}

impl Parse {
    /// Parses `source` as a Flow file.
    ///
    /// Returns `Err` for a syntax error. Hermes requires a NUL terminator it
    /// does not count, which is added here rather than pushed onto callers.
    pub fn new(source: &str) -> Result<Self, ParseError> {
        let mut terminated = Vec::with_capacity(source.len() + 1);
        terminated.extend_from_slice(source.as_bytes());
        terminated.push(0);

        // SAFETY: `terminated` is `source.len()` bytes followed by the NUL the
        // shim requires, and the shim copies everything it keeps before
        // returning, so the buffer need not outlive the call.
        let raw = unsafe { hermes_flow_parse(terminated.as_ptr().cast(), source.len()) };
        assert!(!raw.is_null(), "hermes_flow_parse returned null");
        let parse = Self { raw };

        // SAFETY: `raw` is a live handle from `hermes_flow_parse`.
        let message = unsafe { hermes_flow_parse_error(raw) };
        if message.is_null() {
            return Ok(parse);
        }
        // SAFETY: non-null means a NUL-terminated string owned by the parse.
        let message = unsafe { CStr::from_ptr(message) }
            .to_string_lossy()
            .into_owned();
        Err(ParseError {
            message,
            // SAFETY: as above.
            line: unsafe { hermes_flow_parse_error_line(raw) },
            // SAFETY: as above.
            column: unsafe { hermes_flow_parse_error_column(raw) },
        })
    }

    /// The serialized AST, header included.
    pub fn buffer(&self) -> &[u32] {
        // SAFETY: `raw` is live and the parse succeeded, so the shim guarantees
        // a non-null pointer to `words` initialized `u32`s that it keeps alive
        // for as long as this handle exists.
        unsafe {
            let data = hermes_flow_parse_buffer(self.raw);
            let words = hermes_flow_parse_buffer_words(self.raw);
            if data.is_null() {
                return &[];
            }
            std::slice::from_raw_parts(data, words)
        }
    }
}

impl Drop for Parse {
    fn drop(&mut self) {
        // SAFETY: `raw` came from `hermes_flow_parse` and is freed once.
        unsafe { hermes_flow_parse_free(self.raw) };
    }
}

/// Number of `NodeKind` values in this build of Hermes, sentinels included.
pub fn node_kind_count() -> u32 {
    // SAFETY: no arguments, no state.
    unsafe { hermes_flow_node_kind_count() }
}

/// Name of a raw `NodeKind` value, or `None` when out of range.
pub fn node_kind_name(kind: u32) -> Option<&'static str> {
    // SAFETY: the shim range-checks `kind` and returns a pointer to a string
    // literal with static lifetime.
    let name = unsafe { hermes_flow_node_kind_name(kind) };
    if name.is_null() {
        return None;
    }
    // SAFETY: non-null means a NUL-terminated static string literal.
    unsafe { CStr::from_ptr(name) }.to_str().ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_and_writes_a_well_formed_header() {
        let parse = Parse::new("1 + 1;\n").expect("parse");
        let buffer = parse.buffer();
        assert_eq!(buffer[0], BUFFER_MAGIC);
        assert_eq!(buffer[1], BUFFER_ABI);
        assert_eq!(buffer[2], 7, "source length in bytes");
        assert_eq!(buffer[3], 0, "reserved");
        // Root Program: kind word, start, end, then a one-element body list.
        assert_ne!(buffer[BUFFER_HEADER_WORDS], 0, "root is not a null node");
        assert_eq!(buffer[BUFFER_HEADER_WORDS + 1], 0, "program starts at 0");
        // Ends after the last token rather than at EOF, and the end offset is
        // exclusive — every span in the buffer is a half-open byte range.
        assert_eq!(buffer[BUFFER_HEADER_WORDS + 2], 6, "program ends after `;`");
        assert_eq!(buffer[BUFFER_HEADER_WORDS + 3], 1, "one statement in body");
    }

    #[test]
    fn parses_flow_syntax() {
        let parse = Parse::new("const x: number = 1;\n").expect("flow parse");
        assert!(parse.buffer().len() > BUFFER_HEADER_WORDS);
    }

    #[test]
    fn reports_a_syntax_error_with_a_position() {
        let error = Parse::new("const = ;\n").expect_err("syntax error");
        assert!(!error.message.is_empty());
        assert_eq!(error.line, 1);
    }

    #[test]
    fn exposes_the_node_kind_table() {
        let count = node_kind_count();
        assert!(count > 200, "unexpectedly few node kinds: {count}");
        assert_eq!(node_kind_name(0), Some("Empty"));
        assert_eq!(node_kind_name(count), None);
    }
}
