import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from './runtime';
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each([false, true])('parenthesized eval with constant folding=%s', constantFolding => {
  describe.each(['eval', '(eval)', '((eval))', '(0,eval)'])('callee %s', callee => {
    const indirect = callee === '(0,eval)';
    const fails = callee === '(eval)' || callee === '((eval))';
    let actual: unknown;
    beforeAll(() => {
      const source = `function inspect(){const auditHidden=()=>42;try{return ${callee}('auditHidden()')}catch(error){return error.name}}globalThis.result=inspect();`;
      const expected = indirect ? 'ReferenceError' : 42;
      expect(observe(source)).toBe(expected);
      const code = compile(source, { optimize: { deadCodeElimination: true, constantFolding } });
      actual = observe(code);
      expect(actual).toBe(callee === 'eval' ? 42 : 'ReferenceError');
      if (callee === 'eval') expect(code).toMatch(/const\s+auditHidden\s*=/);
      else expect(code).not.toMatch(/const\s+auditHidden\s*=/);
    });
    (fails ? test.fails : test)('preserves functions observable through direct eval', () => {
      expect(actual).toBe(indirect ? 'ReferenceError' : 42);
    });
  });
});
