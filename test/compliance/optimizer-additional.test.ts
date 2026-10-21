import { runInNewContext } from 'node:vm';
import { expect, test } from 'vitest';
import { compile } from './runtime';

// A .js file without module syntax is parsed as Script. Use a script realm so
// var/function declarations create global properties, and lexical declarations
// remain visible to indirect eval in the global environment.
const cases = [
  {
    name: 'dead function elimination preserves script lexical bindings used by indirect eval',
    source: `const publicValue = () => 3;
globalThis.result = (0, eval)('publicValue()');`,
  },
  {
    name: 'dead function elimination preserves script function properties',
    source: `function publicValue() { return 3; }
globalThis.result = globalThis['public' + 'Value']();`,
  },
  {
    name: 'dead function elimination preserves script var function properties',
    source: `var publicValue = () => 3;
globalThis.result = globalThis['public' + 'Value']();`,
  },
];
function run(source: string): unknown {
  const context: Record<string, unknown> = {};
  runInNewContext(source, context);
  return context.result;
}

test.each(cases)('$name', ({ source }) => {
  const code = compile(source, { optimize: { deadCodeElimination: true } }, 'input.js');
  expect(run(code)).toBe(3);
});
