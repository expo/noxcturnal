//! What the rules do to real Flow, checked against the linked Hermes.
//!
//! Every case here is either a rule from `PLAN_NATIVE_FLOW_ERASURE.md` or a
//! place the plan's first draft got wrong. The output is compared as text
//! because that is the point of erasure: the formatting the Babel printer would
//! have destroyed survives.

#![cfg(feature = "parser")]

use hermes_flow::{BailKind, erase_source};

#[track_caller]
fn erased(source: &str) -> String {
    erase_source(source)
        .unwrap_or_else(|bail| panic!("bailed on {source:?}: {bail}"))
        .apply(source)
}

#[track_caller]
fn bailed(source: &str) -> BailKind {
    match erase_source(source) {
        Ok(erasure) => panic!(
            "expected a bail for {source:?}, erased to {:?}",
            erasure.apply(source)
        ),
        Err(bail) => bail.kind,
    }
}

#[test]
fn leaves_plain_javascript_byte_identical() {
    for source in [
        "const x = 1;\n",
        "export default function f(a, b) { return a + b; }\n",
        "class A extends B { #x = 1; static y = 2; get z() { return 3; } }\n",
        "const f = async (a) => { for await (const x of y) {} };\n",
        "import a, { b as c } from './m';\nexport { c };\nexport * from './n';\n",
        "const o = { ...rest, [k]: v, m() {}, get g() { return 1; } };\n",
        "label: for (;;) { break label; }\n",
        "const re = /a?b/gu, t = `x${y}z`;\n",
    ] {
        assert_eq!(erased(source), source, "changed plain JavaScript");
    }
}

#[test]
fn erases_type_declarations_whole() {
    assert_eq!(
        erased("type A = number;\nconst x = 1;\n"),
        "\nconst x = 1;\n"
    );
    assert_eq!(erased("opaque type A = number;\n"), "\n");
    assert_eq!(erased("interface I { a: number }\n"), "\n");
    assert_eq!(erased("declare var x: number;\n"), "\n");
    assert_eq!(erased("declare function f(): void;\n"), "\n");
    assert_eq!(erased("declare class C {}\n"), "\n");
    assert_eq!(
        erased("declare module 'm' { declare var x: number; }\n"),
        "\n"
    );
    assert_eq!(erased("declare module.exports: number;\n"), "\n");
    assert_eq!(erased("declare export default number;\n"), "\n");
    assert_eq!(erased("declare export * from 'm';\n"), "\n");
}

#[test]
fn erases_annotations_on_bindings() {
    assert_eq!(erased("const x: number = 1;\n"), "const x = 1;\n");
    assert_eq!(erased("let y: ?string;\n"), "let y;\n");
    assert_eq!(
        erased("function f(a: number, b: string): void {}\n"),
        "function f(a, b) {}\n"
    );
    assert_eq!(
        erased("const {a}: Props = p;\nconst [b]: Array<T> = q;\n"),
        "const {a} = p;\nconst [b] = q;\n"
    );
}

/// The rule the plan calls out as having no node to anchor to: `optional` is a
/// boolean, so the `?` has to be found in the gap between the name and the
/// annotation. `?string` puts a second `?` inside the annotation, which is why
/// the search is bounded by the annotation's start rather than the node's end.
#[test]
fn erases_the_optional_marker() {
    assert_eq!(erased("function f(x?: string) {}\n"), "function f(x) {}\n");
    assert_eq!(erased("function f(x?: ?string) {}\n"), "function f(x) {}\n");
    assert_eq!(erased("function f(x?) {}\n"), "function f(x) {}\n");
    // `ClassProperty.optional` is in the rules because `ESTree.def` declares
    // it, but this Hermes rejects `foo?: T` in a class body: the field is only
    // reachable inside a `declare class` or an interface, both of which are
    // erased wholesale. Pinned here so a pin bump that starts accepting it
    // shows up as a test failure rather than as wrong output.
    assert_eq!(bailed("class A { foo?: number; }\n"), BailKind::ParseFailed);
}

/// The other anchorless rule. Erasing only the annotation would leave `this` as
/// a real parameter, so the whole parameter goes, and its comma with it.
#[test]
fn erases_a_this_parameter() {
    assert_eq!(
        erased("function f(this: T, x: number) {}\n"),
        "function f( x) {}\n"
    );
    assert_eq!(erased("function f(this: T) {}\n"), "function f() {}\n");
    // Only at index 0: a later parameter named `this` is not a thing, but a
    // property named `this` is, and must not be touched.
    assert_eq!(
        erased("const o = { this: 1 };\n"),
        "const o = { this: 1 };\n"
    );
}

/// The case the plan says the equivalence harness must cover explicitly:
/// Hermes' JavaScript stripper drops the default from a typed parameter, and
/// erasure cannot, because the annotation span lies strictly inside `left` and
/// `right` lies outside it.
#[test]
fn keeps_defaults_on_typed_parameters() {
    assert_eq!(
        erased("function f(nodes: Array<number> = [], x?: string = 'a') {}\n"),
        "function f(nodes = [], x = 'a') {}\n"
    );
    assert_eq!(
        erased("const g = ({a}: Props = {}) => a;\n"),
        "const g = ({a} = {}) => a;\n"
    );
}

#[test]
fn erases_function_type_syntax() {
    assert_eq!(
        erased("function f<T>(x: T): T { return x; }\n"),
        "function f(x) { return x; }\n"
    );
    assert_eq!(
        erased("const g = <T>(x: T): T => x;\n"),
        "const g = (x) => x;\n"
    );
    assert_eq!(
        erased("function f(x: mixed): boolean %checks { return true; }\n"),
        "function f(x)  { return true; }\n"
    );
}

/// `superTypeArguments`, not `superTypeParameters` as the plan's first draft
/// had it, and `implements` needs the keyword that belongs to no node.
#[test]
fn erases_class_type_syntax() {
    assert_eq!(
        erased("class A<T> extends B<T> implements C, D {}\n"),
        "class A extends B  {}\n"
    );
    assert_eq!(erased("class A implements C {}\n"), "class A  {}\n");
    assert_eq!(
        erased("class A { +x: number; static -y: string; }\n"),
        "class A { x; static y; }\n"
    );
    assert_eq!(
        erased("class A { declare foo: number; }\n"),
        "class A {  }\n"
    );
}

#[test]
fn erases_call_and_jsx_type_arguments() {
    assert_eq!(erased("f<T>(x);\n"), "f(x);\n");
    assert_eq!(erased("new C<T>(x);\n"), "new C(x);\n");
    assert_eq!(erased("a?.b<T>(x);\n"), "a?.b(x);\n");
    // Missing from the plan's first draft.
    assert_eq!(erased("const e = <Foo<T> />;\n"), "const e = <Foo />;\n");
}

#[test]
fn erases_type_only_imports_and_exports() {
    assert_eq!(erased("import type A from 'm';\n"), "\n");
    assert_eq!(erased("import typeof A from 'm';\n"), "\n");
    assert_eq!(erased("export type A = number;\n"), "\n");
    // `export type * from` was missing from the plan's first draft.
    assert_eq!(erased("export type * from 'm';\n"), "\n");
    assert_eq!(
        erased("import { type A, B } from 'm';\n"),
        "import {  B } from 'm';\n"
    );
    assert_eq!(
        erased("import { A, type B } from 'm';\n"),
        "import { A } from 'm';\n"
    );
    // Every specifier type-only makes the whole declaration type-only, so it
    // goes. Leaving `import {} from 'm'` would keep the module in the
    // dependency graph — six type-only React Native modules and 426 KB of
    // bundle, measured against `apps/native-component-list`.
    assert_eq!(erased("import { type A } from 'm';\n"), "\n");
    assert_eq!(erased("import { type A, type B } from 'm';\n"), "\n");
}

/// A side-effect import starts with no specifiers and must survive. Hermes'
/// own stripper removes every zero-specifier import, which is why
/// `@expo/metro-config` carries a workaround to put them back; drawing the
/// distinction on "did it have specifiers to begin with" avoids needing one.
#[test]
fn keeps_side_effect_imports() {
    assert_eq!(erased("import './m';\n"), "import './m';\n");
    assert_eq!(
        erased("import 'm';\nimport type A from 'n';\n"),
        "import 'm';\n\n"
    );
}

#[test]
fn erases_casts_but_keeps_the_value() {
    assert_eq!(erased("const a = (x: number);\n"), "const a = (x);\n");
    assert_eq!(erased("const b = x as number;\n"), "const b = x ;\n");
    assert_eq!(erased("const c = x as const;\n"), "const c = x ;\n");
}

/// From the corpus. Hermes excludes a node's own parentheses from its range but
/// includes them in the enclosing node's, so bounding the erasure by the value's
/// end and the node's end swallows the `)` and the file stops parsing.
#[test]
fn keeps_the_parentheses_around_a_cast_value() {
    assert_eq!(
        erased("export default (a ? b : c) as component(...Props);\n"),
        "export default (a ? b : c) ;\n"
    );
    assert_eq!(erased("const d = (x) as T;\n"), "const d = (x) ;\n");
}

/// `as` is two letters and plenty of identifiers end in them, so the scan for
/// the keyword has to check both word boundaries.
#[test]
fn does_not_find_as_inside_an_identifier() {
    assert_eq!(
        erased("const e = (bananas: T);\n"),
        "const e = (bananas);\n"
    );
    assert_eq!(erased("const f = alias as T;\n"), "const f = alias ;\n");
}

#[test]
fn bails_on_proposal_syntax() {
    assert_eq!(
        bailed("component Foo(bar: string) { return null; }\n"),
        BailKind::Proposal
    );
    assert_eq!(bailed("hook useFoo(): void {}\n"), BailKind::Proposal);
    assert_eq!(bailed("enum E { A, B }\n"), BailKind::Proposal);
}

#[test]
fn bails_on_decorators() {
    assert_eq!(
        bailed("class A { @dec foo = 1; }\n"),
        BailKind::UnhandledSyntax
    );
}

#[test]
fn bails_on_a_syntax_error() {
    assert_eq!(bailed("const = ;\n"), BailKind::ParseFailed);
}

/// Erasure preserves formatting where the Babel printer reformats. That is the
/// property the byte-identical corpus gate loses and the equivalence harness
/// replaces, so it is worth pinning directly.
#[test]
fn preserves_formatting_around_what_it_removes() {
    let source = "// leading comment\n\
                  const   x   : number   =   1 ;   // trailing\n\
                  \n\
                  \tfunction  f ( a : string ) : void { }\n";
    assert_eq!(
        erased(source),
        "// leading comment\n\
         const   x      =   1 ;   // trailing\n\
         \n\
         \tfunction  f ( a  )  { }\n"
    );
}
