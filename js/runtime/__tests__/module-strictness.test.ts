import { expect, test } from 'vitest';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const pipeline = (native: object = { comments: false }) =>
  defineNativePipeline({ phases: [{ name: 'strictness', native }] });

function output(source: string, native?: object, filename = 'fixture.js') {
  const result = transform(source, filename, pipeline(native));
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  return result.code;
}

test.each([
  'export function probe(){return this}',
  'import "dep";',
  'export {};',
  'export {value} from "dep";',
  'export default function probe() {}',
])('materializes module strictness: %s', source => {
  expect(output(source)).toMatch(/['"]use strict['"]/);
});

test.each([
  'module.exports = function(){return this};',
  'function probe(){return this}',
  'const text = "export {}";',
])('preserves sloppy input: %s', source => {
  expect(output(source)).toBe(source);
});

test('factory lowering preserves strict receiver and property writes', () => {
  const code = output(`export function probe(){
    const target = Object.freeze({x: 1});
    let threw = false;
    try { target.x = 2; } catch { threw = true; }
    return [this === undefined, threw];
  }`);
  // Model the downstream ESM-to-factory loss boundary.
  const probe = Function(code.replace('export ', '') + ';return probe;')();
  expect(probe()).toEqual([true, true]);
  const sloppy = Function(
    output('function sloppy(){return this === undefined};') + ';return sloppy;',
  )();
  expect(sloppy()).toBe(false);
});

test('preserves prologues and deduplicates across phases', () => {
  const code = output('"custom"; "use strict"; export {};');
  expect(code.match(/use strict/g)).toHaveLength(1);
  expect(output(code)).toBe(code);
});

test('classifies after type erasure and JSX imports, before DCE', () => {
  expect(
    output(
      'import type {T} from "dep";',
      {
        typescript: 'strip',
      },
      'fixture.ts',
    ),
  ).toMatch(/use strict/);
  expect(
    output(
      'export const element = <View/>;',
      {
        jsx: 'automatic',
      },
      'fixture.jsx',
    ),
  ).toMatch(/use strict/);
  expect(
    output('export {}; function unused() {}', {
      optimize: { deadCodeElimination: true },
    }),
  ).toMatch(/use strict/);
});

test('script JSX require does not imply ESM', () => {
  expect(output('const element = <View/>;', { jsx: 'automatic' }, 'fixture.jsx')).not.toMatch(
    /use strict/,
  );
});

test('repeated phases preserve hashbang, comments and source mappings', () => {
  const source =
    '#!/usr/bin/env node\n// retained\n"custom";\nexport function probe(){return this;}';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'first', native: { optimize: { constantFolding: true } } },
        { name: 'second', native: { compact: true } },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  expect(result.code.startsWith('#!/usr/bin/env node')).toBe(true);
  expect(result.code).toContain('retained');
  expect(result.code.match(/use strict/g)).toHaveLength(1);
  expect(result.map).toBeTruthy();
});

test('output preparation runs without selected transforms and invalid input throws', () => {
  expect(output('export {};', {})).toMatch(/use strict/);
  expect(output('function probe(){return this;}', {})).toBe('function probe(){return this;}');
  expect(() => output('export function {')).toThrow();
});

test('class-local strictness does not replace the module directive', () => {
  const code = output('export class Example {} export function probe(){return this;}', {
    transforms: { classes: true },
    helpers: { mode: 'inline' },
  });
  expect(code.trimStart()).toMatch(/^["']use strict["']/);
});

test.each([
  'const url = import.meta.url; function probe(){return this;}',
  'await work(); function probe(){return this;}',
  'await using resource = null;',
])('preserves modules without static imports or exports: %s', source => {
  expect(output(source)).toMatch(/['"]use strict['"]/);
});

test.each([
  'async function probe(){await work();}',
  'async function probe(){await using resource = null;}',
  'const probe = async () => await work();',
  'function probe(){return import("dep");}',
  'function probe(){return new.target;}',
])('does not mistake nested await or dynamic imports for modules: %s', source => {
  expect(output(source)).not.toMatch(/use strict/);
});

test.each(['import {type T} from "dep";', 'import {typeof T} from "dep";'])(
  'preserves module strictness through Flow erasure: %s',
  moduleSyntax => {
    const code = output(`// @flow\n${moduleSyntax}\nfunction probe(){return this === undefined;}`);
    expect(code).toMatch(/['"]use strict['"]/);
    expect(Function(code + ';return probe;')()()).toBe(true);
  },
);

test('top-level await is preserved in explicit module filenames too', () => {
  expect(output('await work();', undefined, 'fixture.mjs')).toMatch(/use strict/);
  expect(output('function probe(){return this;}', undefined, 'fixture.mjs')).toMatch(/use strict/);
});

test('Flow erasure preserves prologue order, hashbangs, and explicit strictness', () => {
  const code = output(
    '#!/usr/bin/env node\n// @flow\n"use client";\nimport {type T} from "dep";\nfunction probe(){return this;}',
    { compact: true },
  );
  expect(code.startsWith('#!/usr/bin/env node')).toBe(true);
  expect(code.indexOf('use client')).toBeLessThan(code.indexOf('use strict'));
  expect(code.match(/use strict/g)).toHaveLength(1);
  expect(output('// @flow\n"use strict";\nexport type T = string;')).toMatch(/use strict/);
});

test('conditional JSX phases still preserve module strictness without JSX', () => {
  expect(output('export function probe(){return this;}', { jsx: 'automatic-if-present' })).toMatch(
    /use strict/,
  );
  expect(output('function probe(){return this;}', { jsx: 'automatic-if-present' })).not.toMatch(
    /use strict/,
  );
});

test('top-level await remains strict after asynchronous factory lowering', async () => {
  const code = output('await work(); function probe(){return this === undefined;}');
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const probe = await new AsyncFunction('work', code + ';return probe;')(() => {});
  expect(probe()).toBe(true);
});

test('import.meta retains strictness when downstream lowering removes it', () => {
  const code = output('const url = import.meta.url; function probe(){return this === undefined;}');
  const probe = Function(
    code.replace('import.meta.url', '"file:///fixture.js"') + ';return probe;',
  )();
  expect(probe()).toBe(true);
});

test('Flow type exports retain sloppy behavior without a later native phase', () => {
  const code = output(
    '// @flow\nexport type T = string;\nfunction probe(){return this === undefined;}',
    {},
  );
  expect(Function(code + ';return probe;')()()).toBe(false);
});

test('visitor-only factory output preserves module strictness without a native phase', () => {
  const factory = defineNativePlugin({
    name: 'test-module-factory',
    post(context) {
      context.editor.remove(0, 'export '.length);
      context.editor.prepend('capture(function () {\n');
      context.editor.append('\nreturn probe;});');
    },
  });
  const result = transform(
    'export function probe(){return this === undefined;}',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'factory', plugins: [factory] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  let probe: (() => boolean) | undefined;
  Function(
    'capture',
    result.code,
  )((factory: () => () => boolean) => {
    probe = factory();
  });
  expect(probe!()).toBe(true);
  expect(result.code.match(/use strict/g)).toHaveLength(1);
  expect(result.code).toMatch(/^capture\(function \(\) \{\n"use strict";/);
});

test('read-only phases observe original module input while final output is prepared', () => {
  const source = 'export function probe(){return this;}';
  const seen: string[] = [];
  const observer = defineNativePlugin({
    name: 'observe-original-module',
    editEffect: 'none',
    pre(context) {
      seen.push(context.source);
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'first-observer', plugins: [observer] },
        { name: 'second-observer', plugins: [observer] },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  expect(seen).toEqual([source, source]);
  expect(result.code.match(/use strict/g)).toHaveLength(1);
});

test('core output preparation preserves hashbangs and source mappings', () => {
  const source = '#!/usr/bin/env node\n// retained\nexport function probe(){return this;}';
  const result = transform(source, 'fixture.js', defineNativePipeline({ phases: [] }), {
    sourceMapMode: 'character',
  });
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  expect(result.code.startsWith('#!/usr/bin/env node\n')).toBe(true);
  expect(result.code).toContain('// retained');
  expect(result.code.match(/use strict/g)).toHaveLength(1);
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  const position = (token: string) => {
    const before = result.code.slice(0, result.code.indexOf(token)).split('\n');
    return { line: before.length, column: before.at(-1)!.length };
  };
  expect(originalPositionFor(map, position('function'))).toEqual({
    source: 'fixture.js',
    line: 3,
    column: 7,
    name: null,
  });
  expect(originalPositionFor(map, position('use strict'))).toEqual({
    source: null,
    line: null,
    column: null,
    name: null,
  });
});

test('output preparation recognizes runtime-helper imports emitted during lowering', () => {
  const code = output(
    'async function probe(){await work();}',
    {
      transforms: { asyncFunctions: true },
      helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
    },
    'fixture.mjs',
  );
  expect(code).toMatch(/import .*asyncToGenerator/);
  expect(code).toMatch(/use strict/);
});

test('a skipped observer followed by native output prepares the directive once', () => {
  const skipped = defineNativePlugin({
    name: 'skipped-async-observer',
    contract: { syntax: { anyOf: ['AsyncFunction'] } },
    post() {
      throw new Error('observer should be skipped');
    },
  });
  const result = transform(
    'export function probe(){return this;}',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'observer', plugins: [skipped] },
        { name: 'print', native: { compact: true } },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  expect(result.code.match(/use strict/g)).toHaveLength(1);
});

test('output preparation is independent of whether a native plan has executable work', () => {
  expect(
    output('export function probe(){return this;}', { optimize: { moduleContext: true } }),
  ).toMatch(/use strict/);
});

test.each([false, true])('inline helpers preserve directive comments (compact: %s)', compact => {
  const result = transform(
    '// banner\n"use client"; export const a = {...x};',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'syntax',
          native: {
            compact,
            transforms: { objectRestSpread: { loose: true, useBuiltIns: false } },
            helpers: { mode: 'inline' },
          },
        },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  expect(result.code).toMatch(/^\/\/ banner\n["']use client["'];\s*["']use strict["'];/);
});

test('output preparation stays outside deferred source-copy replacements', () => {
  const plugin = defineNativePlugin({
    name: 'wrap-import-meta',
    visitors: [
      defineVisitor('ImportMeta', {}, path => {
        path.replaceWith(path.context.code.template`(${path.getSource()})`);
      }),
    ],
  });
  const result = transform(
    'import.meta.url;',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'wrap', plugins: [plugin] }],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  expect(result.code).toBe('"use strict";\n(import.meta).url;');
});

test.each(['empty', 'native'] as const)(
  'matches Babel module classification in %s output',
  mode => {
    for (const [filename, source] of [
      ['fixture.mjs', 'function probe(){return this === undefined;}'],
      ['fixture.mjs', 'module.exports = function probe(){return this === undefined;}'],
      ['fixture.ts', 'import x = require("dep");function probe(){return this === undefined;}'],
    ]) {
      const result = transform(
        source,
        filename,
        mode === 'empty' ? defineNativePipeline({ phases: [] }) : pipeline({ typescript: 'strip' }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.status);
      expect(result.code).toMatch(/['"]use strict['"]/);
      if (filename.endsWith('.mjs') && !source.startsWith('module')) {
        expect(Function(result.code + ';return probe;')()()).toBe(true);
      }
    }
  },
);

test.each([
  'import type T from "dep";',
  'import typeof T from "dep";',
  'export type T = string;',
  'export opaque type T = string;',
  'export type {T} from "dep";',
])('matches Hermes script classification for Flow %s', declaration => {
  const source = '// @flow\n' + declaration + '\nfunction probe(){return this === undefined;}';
  for (const phases of [[], [{ name: 'emit', native: { comments: false } }]]) {
    const result = transform(source, 'fixture.js', defineNativePipeline({ phases }));
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.status);
    expect(result.code).not.toMatch(/use strict/);
    expect(Function(result.code + ';return probe;')()()).toBe(false);
  }
});

test('module identity survives JSX parser overrides and TypeScript language prepasses', () => {
  for (const [filename, source, parser] of [
    ['fixture.mjs', 'function probe(){return this === undefined;}', 'jsx'],
    [
      'fixture.ts',
      'import x = require("dep");function probe(){return this === undefined;}',
      'auto',
    ],
  ] as const) {
    const result = transform(
      source,
      filename,
      pipeline({ typescript: 'strip', transforms: { blockScoping: true } }),
      { parser },
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.status);
    expect(result.code).toMatch(/use strict/);
    expect(Function(result.code + ';return probe;')()()).toBe(true);
  }
  const result = transform(
    'function probe(){return this === undefined;}',
    'fixture.mjs',
    defineNativePipeline({ phases: [] }),
    { parser: 'jsx' },
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.status);
  expect(Function(result.code + ';return probe;')()()).toBe(true);
});

test.each([
  ['import type X = require("dep");', true],
  ['import X = Namespace.Value;', false],
])('matches Babel for TypeScript import equals %s', (declaration, strict) => {
  const code = output(
    `${declaration}function probe(){return this === undefined;}`,
    { typescript: 'strip', transforms: { blockScoping: true } },
    'fixture.ts',
  );
  expect(code.includes('use strict')).toBe(strict);
  expect(Function(code + ';return probe;')()()).toBe(strict);
});

test.each(['auto', 'jsx'] as const)(
  'explicit module early errors survive the %s parser',
  parser => {
    for (const plan of [defineNativePipeline({ phases: [] }), pipeline({ comments: false })]) {
      expect(() => transform('with ({}) {}', 'fixture.mjs', plan, { parser })).toThrow(/with/);
    }
  },
);
