import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}

const cases = [
  { name: 'direct eval', callee: 'eval', expected: 42, retainsBinding: true },
  { name: 'one pair of parentheses', callee: '(eval)', expected: 42, retainsBinding: true },
  { name: 'nested parentheses', callee: '((eval))', expected: 42, retainsBinding: true },
  {
    name: 'comma expression is indirect',
    callee: '(0,eval)',
    expected: 'ReferenceError',
    retainsBinding: false,
  },
];

describe.each([false, true])('eval with constant folding=%s', constantFolding => {
  test.each(cases)('$name', ({ callee, expected, retainsBinding }) => {
    const source = `
      function inspect() {
        const auditHidden = () => 42;
        try { return ${callee}('auditHidden()'); }
        catch (error) { return error.name; }
      }
      globalThis.result = inspect();
    `;
    const code = compile(source, { optimize: { deadCodeElimination: true, constantFolding } });
    expect(observe(code)).toBe(expected);
    if (retainsBinding) expect(code).toMatch(/const\s+auditHidden\s*=/);
    else expect(code).not.toMatch(/const\s+auditHidden\s*=/);
  });
});
