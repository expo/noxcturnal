import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'named replacement followed by a decimal digit',
    source: `globalThis.result = 'abcdefghij'.replace(/(?<x>a)(b)(c)(d)(e)(f)(g)(h)(i)(j)/, '$<x>0');`,
    expected: 'j',
  },
  {
    name: 'named replacement with an escaped dollar',
    source: `globalThis.result = 'a'.replace(/(?<x>a)/, '$$<x>');`,
    expected: '$1',
  },
  {
    name: 'named replacement callback own apply',
    source: `function replace() { return 'correct'; } replace.apply = () => 'wrong'; globalThis.result = 'a'.replace(/(?<x>a)/, replace);`,
    expected: 'wrong',
  },
  ...[true, false].map(groups => ({
    name: `custom exec ${groups ? 'replaces' : 'omits'} named groups`,
    source: `const pattern = /(?<x>a)/; pattern.exec = function () { const match = ['a', 'positional']; match.index = 0; match.input = 'a'; ${groups ? "match.groups = { x: 'custom' };" : ''} return match; }; globalThis.result = 'a'.replace(pattern, '$<x>');`,
    expected: 'positional',
  })),
  {
    name: 'custom exec callback receives synthesized groups',
    source: `const pattern = /(?<x>a)/; pattern.exec = function () { const match = ['a', 'positional']; match.index = 0; match.input = 'a'; return match; }; globalThis.result = 'a'.replace(pattern, (...args) => args.length + ':' + typeof args.at(-1));`,
    expected: '5:object',
  },
  {
    name: 'native constructor loses named group metadata',
    source: `const pattern = /(?<x>a)/; globalThis.result = new RegExp(pattern).exec('a').groups?.x;`,
    expected: undefined,
  },
  {
    name: 'native RegExp call copies wrapped pattern',
    source: `const pattern = /(?<x>a)/; pattern.lastIndex = 2; globalThis.result = [RegExp(pattern) === pattern, RegExp(pattern).lastIndex];`,
    expected: [false, 0],
  },
].map(entry => ({
  ...entry,
  transform: 'regexpNamedCaptureGroups',
  plugin: 'named-capturing-groups-regex',
  absent: /\(\?<x>/,
}));

// These observations retain Babel's helper baseline; native differences remain in compliance.
describe.each(cases)('$name', entry => {
  test.each(['inline', 'runtime'] as const)('%s helper compatibility', async mode => {
    const code = compile(entry.source, {
      transforms: { [entry.transform]: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    const reference = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        [require('@babel/plugin-transform-' + entry.plugin), {}],
        ...(mode === 'runtime'
          ? [
              [
                require('@babel/plugin-transform-runtime'),
                { version: '7.29.7', useESModules: false },
              ],
            ]
          : []),
      ],
    });
    expect(reference?.code).toBeTypeOf('string');
    expect(code).not.toMatch(entry.absent);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/wrapRegExp');
    else expect(code).not.toContain('require(');
    for (const output of [reference!.code!, code]) {
      const context: Record<string, unknown> = {};
      new Function('require', 'globalThis', output)(require, context);
      expect(await context.result).toEqual(entry.expected);
    }
  });
});
