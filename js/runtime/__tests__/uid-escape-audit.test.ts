import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  {
    name: 'declared escaped name',
    source: String.raw`const temp=3;const _t\u0065mp=9;globalThis.result=[temp,_t\u0065mp];`,
    external: false,
  },
  {
    name: 'unresolved escaped name',
    source: String.raw`const temp=3;globalThis.result=[temp,_t\u0065mp];`,
    external: true,
  },
];
function run(source: string, external: boolean) {
  const context: Record<string, unknown> = {};
  if (external) new Function('_temp', 'globalThis', source)(9, context);
  else new Function('globalThis', source)(context);
  return context.result;
}
describe.each(cases)('$name', entry => {
  test('original binding control', () => expect(run(entry.source, entry.external)).toEqual([3, 9]));
  describe.each([false, true])('identifier index warmed: %s', warm => {
    let code: string;
    beforeAll(() => {
      const plugin = defineNativePlugin({
        name: 'uid-escape-audit',
        visitors: [
          defineVisitor('Program', { scope: true }, path => {
            if (warm) for (let i = 0; i < 8; i++) path.scope.generateUid(`warm${i}`);
            path.scope.rename('temp');
          }),
        ],
      });
      const result = transform(
        entry.source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      code = result.code;
      expect(code).not.toContain('const temp=');
    });
    test.fails('default rename avoids decoded binding and reference names', () =>
      expect(run(code, entry.external)).toEqual([3, 9]));
  });
});
