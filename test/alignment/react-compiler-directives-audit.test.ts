import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
const cases = [
  ['ordinary', '', ''],
  ['explicit memo', "'use memo';", ''],
  ['legacy memo', "'use forget';", ''],
  ['default opt out', "'use no memo';", ''],
  ['legacy opt out', "'use no forget';", ''],
  ['custom opt out', "'skip optimization';", ''],
  ['memo then opt out', "'use memo';'use no memo';", ''],
  ['opt out then memo', "'use no memo';'use memo';", ''],
  ['escaped memo', String.raw`'use\x20memo';`, ''],
  ['escaped opt out', String.raw`'use\x20no memo';`, ''],
  ['module memo', '', "'use memo';"],
  ['escaped module opt out', '', String.raw`'use\x20no memo';`],
  ['unicode escaped memo', String.raw`'use\u0020memo';`, ''],
  ['escaped custom opt out', String.raw`'skip\x20optimization';`, ''],
  ['module opt out', '', "'use no memo';"],
  ['directive after statement', "void 0;'use no memo';", ''],
] as const;
for (const compilationMode of ['infer', 'syntax', 'annotation', 'all'] as const) {
  describe.each(cases)(`compiler ${compilationMode}: %s`, (_name, body, module) => {
    let actual: boolean;
    let expected: boolean;
    beforeAll(() => {
      const source = `${module} export function App({value}) {${body} return <div>{value}</div>}`;
      const options = {
        compilationMode,
        panicThreshold: 'none' as const,
        target: '19' as const,
        enableResetCacheOnSourceFileChanges: false,
        customOptOutDirectives: ['skip optimization', 'use no memo', 'skip optimization'],
      };
      const reference = transformSync(source, {
        filename: 'input.jsx',
        configFile: false,
        babelrc: false,
        parserOpts: { plugins: ['jsx'] },
        plugins: [
          [
            referenceRequire('babel-plugin-react-compiler'),
            {
              ...options,
              customOptOutDirectives: ['use no memo', 'use no forget', 'skip optimization'],
              environment: { enableResetCacheOnSourceFileChanges: false },
            },
          ],
        ],
      })!.code!;
      const code = compile(source, { reactCompiler: options, jsx: 'preserve' }, 'input.jsx');
      expected = reference.includes('react/compiler-runtime');
      actual = code.includes('react/compiler-runtime');
      expect(code).toContain('<div>');
    });
    test('matches the pinned directive boundary', () => expect(actual).toBe(expected));
  });
}
