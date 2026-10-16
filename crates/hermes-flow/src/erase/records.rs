//! Record lowering follows Hermes' constructor/object-pattern semantics while
//! leaving methods and static initializers at their original source positions.
use super::*;
use std::fmt::Write;

struct Property {
    key: Node,
    binding: String,
    shorthand: bool,
}

impl<'a> Walk<'a> {
    pub(super) fn record_expression(
        &mut self,
        node: Node,
        cursor: &mut Cursor<'a>,
    ) -> Result<(), Bail> {
        let constructor = cursor
            .peek_node()?
            .ok_or_else(|| malformed("record constructor"))?;
        self.replace_span(node.start..constructor.start, "new ".into());
        self.node(cursor)?;
        // The type arguments and trivia between the callee and object disappear
        // together; the actual object and its nested values keep their bytes.
        cursor.skip_node()?;
        let properties = cursor
            .peek_node()?
            .ok_or_else(|| malformed("record properties"))?;
        self.replace_span(constructor.end..properties.start, "(".into());
        self.node(cursor)?;
        self.replace_span(node.end..node.end, ")".into());
        Ok(())
    }

    pub(super) fn record_declaration(
        &mut self,
        node: Node,
        cursor: &mut Cursor<'a>,
    ) -> Result<(), Bail> {
        let id = cursor
            .peek_node()?
            .ok_or_else(|| malformed("record name"))?;
        self.replace_span(node.start..id.start, "class ".into());
        cursor.skip_node()?;
        let types = self.erase_field(FieldType::Node, cursor)?;
        self.class_implements(cursor, types.map_or(id.end, |span| span.end))?;
        let body = cursor.node()?.ok_or_else(|| malformed("record body"))?;
        let count = cursor.list_len()?;

        // Allocate all constructor bindings before traversing default values,
        // as Hermes does. Literal and reserved-word keys need generated locals.
        let mut probe = *cursor;
        let mut properties = Vec::new();
        for _ in 0..count {
            let member = probe.node()?.ok_or_else(|| malformed("record member"))?;
            if member.kind == kind::RECORD_DECLARATION_PROPERTY {
                let key = probe
                    .peek_node()?
                    .ok_or_else(|| malformed("record property key"))?;
                let name = identifier_name(&probe).and_then(|name| std::str::from_utf8(name).ok());
                let shorthand = key.kind == kind::IDENTIFIER
                    && name.is_some_and(|name| !reserved_binding(name));
                let binding = if shorthand {
                    self.source_str()?[key.start as usize..key.end as usize].to_owned()
                } else {
                    loop {
                        let name = self.record_names.reserve();
                        if self.occupied_names.insert(name.as_bytes().to_vec()) {
                            break name;
                        }
                    }
                };
                properties.push(Property {
                    key,
                    binding,
                    shorthand,
                });
            }
            probe.skip_fields(member.kind)?;
        }

        let mut parameters = Vec::new();
        let mut assignments = String::new();
        let mut own_index = 0;
        for _ in 0..count {
            let member = cursor.node()?.ok_or_else(|| malformed("record member"))?;
            match member.kind {
                kind::RECORD_DECLARATION_PROPERTY => {
                    cursor.skip_node()?; // key
                    cursor.skip_node()?; // type
                    let default = if let Some(value) = cursor.peek_node()? {
                        Some(self.capture(cursor, value.start..value.end)?)
                    } else {
                        cursor.skip_node()?;
                        None
                    };
                    let property = &properties[own_index];
                    own_index += 1;
                    let key =
                        &self.source_str()?[property.key.start as usize..property.key.end as usize];
                    let binding = match default {
                        Some(value) => format!("{} = ({value})", property.binding),
                        None => property.binding.clone(),
                    };
                    parameters.push(if property.shorthand {
                        binding
                    } else {
                        format!("{key}: {binding}")
                    });
                    let target = if property.key.kind == kind::IDENTIFIER {
                        format!("this.{key}")
                    } else {
                        format!("this[{key}]")
                    };
                    let _ = write!(assignments, "{target} = {};", property.binding);
                    let end = self.record_separator(member.end, body.end);
                    self.erase_span(member.start..end);
                }
                kind::RECORD_DECLARATION_STATIC_PROPERTY => {
                    cursor.skip_node()?; // key
                    self.erase_field(FieldType::Node, cursor)?;
                    self.node(cursor)?; // initializer and nested Flow
                    let end = self.record_separator(member.end, body.end);
                    if self.source.get(end.saturating_sub(1) as usize) == Some(&b',') {
                        self.replace_span(end - 1..end, ";".into());
                    }
                }
                kind::METHOD_DEFINITION => self.walk_fields(member, cursor)?,
                _ => return Err(malformed("unexpected record member")),
            }
        }
        self.replace_span(
            body.start + 1..body.start + 1,
            format!(
                "constructor({{{}}}) {{{assignments}}}",
                parameters.join(", ")
            ),
        );
        Ok(())
    }

    // Hermes excludes an expression's surrounding parentheses from its span.
    // A property default `(expr)` therefore leaves closing parens before its
    // separator. Consume those too, without touching the next member's bytes.
    fn record_separator(&self, from: u32, end: u32) -> u32 {
        let mut at = from as usize;
        loop {
            let next = self.skip_trivia(at);
            if next >= end as usize {
                return at as u32;
            }
            match self.source.get(next) {
                Some(b')') => at = next + 1,
                Some(b',' | b';') => return (next + 1) as u32,
                _ => return at as u32,
            }
        }
    }
}

fn malformed(detail: &str) -> Bail {
    Bail::new(BailKind::Malformed, detail)
}

fn reserved_binding(name: &str) -> bool {
    // Hermes' reserved-word mapping plus the strict-mode binding restrictions
    // of the class constructor we generate (`eval`, `arguments`, `let`, ...).
    matches!(
        name,
        "await"
            | "break"
            | "case"
            | "catch"
            | "class"
            | "const"
            | "continue"
            | "debugger"
            | "default"
            | "delete"
            | "do"
            | "else"
            | "enum"
            | "export"
            | "extends"
            | "false"
            | "finally"
            | "for"
            | "function"
            | "if"
            | "import"
            | "in"
            | "instanceof"
            | "new"
            | "null"
            | "return"
            | "super"
            | "switch"
            | "this"
            | "throw"
            | "true"
            | "try"
            | "typeof"
            | "var"
            | "void"
            | "while"
            | "with"
            | "yield"
            | "let"
            | "implements"
            | "interface"
            | "package"
            | "private"
            | "protected"
            | "public"
            | "static"
            | "eval"
            | "arguments"
    )
}
