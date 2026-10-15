import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../index';

for (const compact of [false, true]) {
  for (const header of [
    '',
    '"use strict"; // trailing comment\n',
    '"😀";"use strict"; ',
    '"use strict"; ',
    '#!/usr/bin/env node\n"use strict"; ',
    '/* 😀 license */\n"use strict";"custom directive"; ',
  ]) {
    test(`helper preamble preserves mappings compact=${compact} header=${JSON.stringify(header)}`, () => {
      const source = `${header}const markerValue={...input};globalThis.result=markerValue;`;
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({
          phases: [
            {
              name: 'helpers',
              native: {
                transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
                helpers: { mode: 'inline' },
                compact,
              },
            },
          ],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      const map = new TraceMap({
        version: 3,
        sources: ['input.js'],
        names: result.map.names,
        mappings: result.map.mappings,
      });
      const position = (text: string, offset: number) => {
        const before = text.slice(0, offset).split('\n');
        return { line: before.length, column: before.at(-1)!.length };
      };
      const bodyPosition = position(result.code, result.code.indexOf('markerValue'));
      expect(originalPositionFor(map, bodyPosition)).toMatchObject({
        source: 'input.js',
        ...position(source, source.indexOf('markerValue')),
      });
      expect(
        originalPositionFor(map, position(result.code, result.code.indexOf('var babelHelpers')))
          .source,
      ).toBeNull();
      if (header.includes('use strict')) {
        expect(
          originalPositionFor(map, position(result.code, result.code.indexOf('use strict') - 1)),
        ).toMatchObject({
          source: 'input.js',
          ...position(source, source.indexOf('use strict') - 1),
        });
      }
    });
  }
}

for (const [compact, spread] of [
  [false, false],
  [false, true],
  [true, true],
] as const) {
  test(`custom inline helpers preserve mappings compact=${compact} with Oxc helpers=${spread}`, () => {
    const source = `#!/usr/bin/env node\n"use strict";\nconst {['a']:a,...markerValue}=${spread ? '{...input}' : 'input'};`;
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'helpers',
            native: {
              transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
              helpers: { mode: 'inline' },
              compact,
            },
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toMatch(/^#!\/usr\/bin\/env node\n["']use strict["'];/);
    const map = new TraceMap({
      version: 3,
      sources: ['input.js'],
      names: result.map.names,
      mappings: result.map.mappings,
    });
    const position = (offset: number) => {
      const lines = result.code.slice(0, offset).split('\n');
      return { line: lines.length, column: lines.at(-1)!.length };
    };
    expect(originalPositionFor(map, position(result.code.indexOf('markerValue')))).toMatchObject({
      source: 'input.js',
      line: 3,
      column: 18,
    });
    for (const helper of [
      ...(spread ? ['var babelHelpers'] : []),
      'var _objectDestructuringEmpty2',
      'function _objectWithoutProperties(',
    ]) {
      const offset = result.code.indexOf(helper);
      expect(offset).toBeGreaterThan(0);
      expect(originalPositionFor(map, position(offset)).source).toBeNull();
    }
  });
}
