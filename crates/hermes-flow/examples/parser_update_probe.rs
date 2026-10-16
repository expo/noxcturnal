//! Process-isolated probe for the parser update inventory, including old parser crashes.
use std::io::{self, Read, Write};

fn main() {
    let mut source = String::new();
    io::stdin().read_to_string(&mut source).unwrap();
    let result = match hermes_flow::erase_source(&source) {
        Ok(erasure) => serde_json::json!({"outcome": "erased", "code": erasure.apply(&source)}),
        Err(bail) => {
            serde_json::json!({"outcome": format!("{:?}", bail.kind), "detail": bail.detail})
        }
    };
    let mut output = io::stdout().lock();
    writeln!(output, "{result}").unwrap();
}
