//! Sequential reader over the serialized AST buffer.
//!
//! The format is described in `crates/hermes-parser-sys/cpp/hermes_flow_shim.h`.
//! It is a stream, not an index: a field's position depends on the length of
//! every field before it, so reading is strictly forward and skipping a field
//! means walking its structure. That suits erasure, which visits the tree once
//! and in order anyway.
//!
//! Every read is checked. This runs behind a napi boundary, where a panic
//! aborts the process, and a malformed buffer should surface as a bail rather
//! than take the host down.

use crate::generated::estree::{FieldType, NODE_KIND_COUNT, NODE_KINDS};

/// "HMFS", little-endian. Mirrors `HERMES_FLOW_BUFFER_MAGIC`.
pub const BUFFER_MAGIC: u32 = 0x5346_4d48;
/// Mirrors `HERMES_FLOW_BUFFER_ABI`.
pub const BUFFER_ABI: u32 = 1;
/// Mirrors `HERMES_FLOW_BUFFER_HEADER_WORDS`.
pub const HEADER_WORDS: usize = 4;
/// Mirrors `HERMES_FLOW_NULL_LABEL`.
pub const NULL_LABEL: u32 = u32::MAX;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReadError {
    /// Not a buffer this reader recognises.
    BadMagic(u32),
    /// A buffer from a different build of the shim.
    UnsupportedAbi(u32),
    /// Ran off the end.
    Truncated,
    /// A node kind outside the table this crate was generated against, which
    /// means the reader and the linked Hermes disagree.
    UnknownKind(u32),
}

impl std::fmt::Display for ReadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::BadMagic(word) => write!(f, "not an AST buffer (magic {word:#x})"),
            Self::UnsupportedAbi(version) => write!(f, "unsupported buffer version {version}"),
            Self::Truncated => f.write_str("truncated AST buffer"),
            Self::UnknownKind(kind) => write!(f, "unknown node kind {kind}"),
        }
    }
}

impl std::error::Error for ReadError {}

/// A node's kind and the half-open byte range it occupies in the source.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Node {
    pub kind: u32,
    pub start: u32,
    pub end: u32,
}

impl Node {
    pub fn name(&self) -> &'static str {
        NODE_KINDS[self.kind as usize].name
    }
}

/// A validated buffer. Cheap to create and to copy.
#[derive(Debug, Clone, Copy)]
pub struct Buffer<'a> {
    words: &'a [u32],
    source_len: u32,
}

impl<'a> Buffer<'a> {
    pub fn new(words: &'a [u32]) -> Result<Self, ReadError> {
        let header = words.get(..HEADER_WORDS).ok_or(ReadError::Truncated)?;
        if header[0] != BUFFER_MAGIC {
            return Err(ReadError::BadMagic(header[0]));
        }
        if header[1] != BUFFER_ABI {
            return Err(ReadError::UnsupportedAbi(header[1]));
        }
        Ok(Self {
            words,
            source_len: header[2],
        })
    }

    /// Length in bytes of the source this was parsed from.
    pub fn source_len(&self) -> u32 {
        self.source_len
    }

    /// A cursor positioned at the root `Program`.
    pub fn cursor(&self) -> Cursor<'a> {
        Cursor {
            words: self.words,
            at: HEADER_WORDS,
        }
    }
}

/// A position in the buffer. Reads advance it.
#[derive(Debug, Clone, Copy)]
pub struct Cursor<'a> {
    words: &'a [u32],
    at: usize,
}

impl<'a> Cursor<'a> {
    fn word(&mut self) -> Result<u32, ReadError> {
        let word = *self.words.get(self.at).ok_or(ReadError::Truncated)?;
        self.at += 1;
        Ok(word)
    }

    /// Reads a node header. `None` is a null node pointer, already consumed.
    pub fn node(&mut self) -> Result<Option<Node>, ReadError> {
        let tagged = self.word()?;
        if tagged == 0 {
            return Ok(None);
        }
        // Kinds are stored offset by one so zero can mean absent.
        let kind = tagged - 1;
        if kind as usize >= NODE_KIND_COUNT {
            return Err(ReadError::UnknownKind(kind));
        }
        let start = self.word()?;
        let end = self.word()?;
        Ok(Some(Node { kind, start, end }))
    }

    /// Reads a node header without advancing.
    pub fn peek_node(&self) -> Result<Option<Node>, ReadError> {
        let mut probe = *self;
        probe.node()
    }

    /// Reads the element count of a list. The elements follow.
    pub fn list_len(&mut self) -> Result<u32, ReadError> {
        self.word()
    }

    pub fn boolean(&mut self) -> Result<bool, ReadError> {
        Ok(self.word()? != 0)
    }

    /// Numbers are two words of `f64` bits and are never needed here.
    pub fn skip_number(&mut self) -> Result<(), ReadError> {
        self.word()?;
        self.word()?;
        Ok(())
    }

    /// Reads a string field. The bytes are Hermes' "modified UTF-8", which is
    /// not guaranteed to be valid UTF-8, so they stay bytes; every comparison
    /// the rules make is against an ASCII keyword.
    pub fn label(&mut self) -> Result<Option<&'a [u8]>, ReadError> {
        let length = self.word()?;
        if length == NULL_LABEL {
            return Ok(None);
        }
        let words = (length as usize).div_ceil(4);
        let slice = self
            .words
            .get(self.at..self.at + words)
            .ok_or(ReadError::Truncated)?;
        self.at += words;
        // SAFETY: `slice` is `words` initialized `u32`s, so reinterpreting it
        // as `4 * words` bytes reads only initialized memory within the same
        // allocation, and `length <= 4 * words` by construction. `u8` has no
        // alignment requirement and no invalid bit patterns.
        let bytes =
            unsafe { std::slice::from_raw_parts(slice.as_ptr().cast::<u8>(), slice.len() * 4) };
        Ok(Some(&bytes[..length as usize]))
    }

    /// Advances past one field of the given type without interpreting it.
    pub fn skip_field(&mut self, ty: FieldType) -> Result<(), ReadError> {
        match ty {
            FieldType::Node => self.skip_node(),
            FieldType::List => {
                let count = self.list_len()?;
                for _ in 0..count {
                    self.skip_node()?;
                }
                Ok(())
            }
            FieldType::Bool => self.word().map(drop),
            FieldType::Number => self.skip_number(),
            FieldType::Label => self.label().map(drop),
        }
    }

    /// Advances past a whole node, subtree included.
    pub fn skip_node(&mut self) -> Result<(), ReadError> {
        let Some(node) = self.node()? else {
            return Ok(());
        };
        self.skip_fields(node.kind)
    }

    /// Advances past the fields of a node whose header was already read.
    pub fn skip_fields(&mut self, kind: u32) -> Result<(), ReadError> {
        for field in NODE_KINDS[kind as usize].fields {
            self.skip_field(field.ty)?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `1 + 1;` — a header, a Program with one ExpressionStatement.
    fn buffer_of(words: &[u32]) -> Vec<u32> {
        let mut out = vec![BUFFER_MAGIC, BUFFER_ABI, 0, 0];
        out.extend_from_slice(words);
        out
    }

    #[test]
    fn rejects_a_foreign_buffer() {
        assert_eq!(
            Buffer::new(&[1, 2, 3, 4]).err(),
            Some(ReadError::BadMagic(1))
        );
        assert_eq!(
            Buffer::new(&[BUFFER_MAGIC]).err(),
            Some(ReadError::Truncated)
        );
        assert_eq!(
            Buffer::new(&[BUFFER_MAGIC, 99, 0, 0]).err(),
            Some(ReadError::UnsupportedAbi(99))
        );
    }

    #[test]
    fn reads_a_null_node() {
        let words = buffer_of(&[0]);
        let buffer = Buffer::new(&words).expect("header");
        assert_eq!(buffer.cursor().node(), Ok(None));
    }

    #[test]
    fn rejects_a_kind_outside_the_generated_table() {
        let words = buffer_of(&[NODE_KIND_COUNT as u32 + 1, 0, 0]);
        let buffer = Buffer::new(&words).expect("header");
        assert_eq!(
            buffer.cursor().node(),
            Err(ReadError::UnknownKind(NODE_KIND_COUNT as u32))
        );
    }

    #[test]
    fn reads_a_label_and_its_padding() {
        // "flow" is four bytes, exactly one word; "js" is two, padded to one.
        // Native byte order, because the shim writes the bytes with `memcpy`
        // into the word array rather than assembling words from characters.
        let words = buffer_of(&[
            4,
            u32::from_ne_bytes(*b"flow"),
            2,
            u32::from_ne_bytes(*b"js\0\0"),
        ]);
        let buffer = Buffer::new(&words).expect("header");
        let mut cursor = buffer.cursor();
        assert_eq!(cursor.label(), Ok(Some(&b"flow"[..])));
        assert_eq!(cursor.label(), Ok(Some(&b"js"[..])));
    }

    #[test]
    fn reads_a_null_label() {
        let words = buffer_of(&[NULL_LABEL]);
        let buffer = Buffer::new(&words).expect("header");
        assert_eq!(buffer.cursor().label(), Ok(None));
    }
}
