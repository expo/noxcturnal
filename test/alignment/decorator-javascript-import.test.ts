import { transformSync } from '@babel/core';
import decorators from '@babel/plugin-proposal-decorators';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';
const cases = [
  { name: 'unused named import', head: `import {value} from 'audit-dependency';` },
  { name: 'unused default import', head: `import value from 'audit-dependency';` },
  { name: 'unused namespace import', head: `import * as value from 'audit-dependency';` },
  { name: 'bare import', head: `import 'audit-dependency';` },
];
function load(code: string, throwing: boolean) {
  const dependency =
    'data:text/javascript;base64,' +
    Buffer.from(
      `export const value=3;export default value;${throwing ? `throw new Error('dependency evaluated');` : ''}`,
    ).toString('base64') +
    '#' +
    crypto.randomUUID();
  return importCode(code.replaceAll('audit-dependency', dependency));
}
for (const entry of cases)
  describe(entry.name, () => {
    const source = `${entry.head}let calls=0;function mark(C){calls++;return C}@mark class C{static value=3}export const result=[calls,C.value];`;
    beforeAll(async () => {
      const babel = transformSync(source, {
        filename: 'input.js',
        configFile: false,
        babelrc: false,
        plugins: [[decorators, { legacy: true }]],
      })!.code!;
      await expect(load(babel, true)).rejects.toThrow('dependency evaluated');
      expect((await load(babel, false)).result).toEqual([1, 3]);
    });
    for (const mode of ['inline', 'runtime'] as const)
      test(`preserves JavaScript dependency evaluation, ${mode}`, async () => {
        const code = compile(
          source,
          { transforms: { legacyDecorators: true }, helpers: { mode, version: '7.29.7' } },
          'input.js',
        );
        expect(code).not.toContain('@mark');
        expect(code).not.toContain('@babel/runtime');
        await expect(load(code, true)).rejects.toThrow('dependency evaluated');
        expect((await load(code, false)).result).toEqual([1, 3]);
      });
  });
