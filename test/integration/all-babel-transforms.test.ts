import assert from 'node:assert/strict';
import vm from 'node:vm';
import babel, { type PluginItem } from '@babel/core';
import generate from '@babel/generator';
import decorators from '@babel/plugin-proposal-decorators';
import asyncGenerators from '@babel/plugin-transform-async-generator-functions';
import asyncFunctions from '@babel/plugin-transform-async-to-generator';
import blockScoping from '@babel/plugin-transform-block-scoping';
import classProperties from '@babel/plugin-transform-class-properties';
import classStaticBlock from '@babel/plugin-transform-class-static-block';
import classes from '@babel/plugin-transform-classes';
import destructuring from '@babel/plugin-transform-destructuring';
import dotAllRegex from '@babel/plugin-transform-dotall-regex';
import explicitResourceManagement from '@babel/plugin-transform-explicit-resource-management';
import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import exportNamespaceFrom from '@babel/plugin-transform-export-namespace-from';
import forOf from '@babel/plugin-transform-for-of';
import flowStripTypes from '@babel/plugin-transform-flow-strip-types';
import logicalAssignment from '@babel/plugin-transform-logical-assignment-operators';
import namedCaptures from '@babel/plugin-transform-named-capturing-groups-regex';
import nullishCoalescing from '@babel/plugin-transform-nullish-coalescing-operator';
import objectRestSpread from '@babel/plugin-transform-object-rest-spread';
import optionalCatchBinding from '@babel/plugin-transform-optional-catch-binding';
import optionalChaining from '@babel/plugin-transform-optional-chaining';
import parameters from '@babel/plugin-transform-parameters';
import privateMethods from '@babel/plugin-transform-private-methods';
import privatePropertyInObject from '@babel/plugin-transform-private-property-in-object';
import reactJsx from '@babel/plugin-transform-react-jsx';
import reactJsxDevelopment from '@babel/plugin-transform-react-jsx-development';
import reactPure from '@babel/plugin-transform-react-pure-annotations';
import stickyRegex from '@babel/plugin-transform-sticky-regex';
import unicodePropertyRegex from '@babel/plugin-transform-unicode-property-regex';
import unicodeRegex from '@babel/plugin-transform-unicode-regex';
import unicodeSetsRegex from '@babel/plugin-transform-unicode-sets-regex';
import typescript from '@babel/plugin-transform-typescript';
import flowEnums from 'babel-plugin-transform-flow-enums';
import { test } from 'vitest';

import type { PreflightPlan } from '../../js/index';
import { defineNativePipeline, transform } from '../../js/index';

// This is deliberately a preset, rather than one-plugin-at-a-time alignment. It
// catches ordering and helper-sharing failures that the focused suites cannot.
const babelLanguagePreset: PluginItem[] = [
  [classProperties, { loose: true }],
  [privateMethods, { loose: true }],
  [privatePropertyInObject, { loose: true }],
  [classStaticBlock, { loose: true }],
  classes,
  [objectRestSpread, { loose: true, useBuiltIns: true }],
  destructuring,
  parameters,
  forOf,
  asyncGenerators,
  asyncFunctions,
  optionalChaining,
  nullishCoalescing,
  logicalAssignment,
  exponentiation,
  optionalCatchBinding,
  blockScoping,
  stickyRegex,
  dotAllRegex,
  namedCaptures,
  unicodePropertyRegex,
  unicodeSetsRegex,
  unicodeRegex,
];

const nativeLanguagePreset: PreflightPlan = {
  transforms: {
    classProperties: { loose: true },
    privateMethods: true,
    privatePropertyInObject: true,
    classStaticBlock: true,
    classes: true,
    objectRestSpread: { loose: true, useBuiltIns: true },
    destructuring: true,
    parameters: true,
    forOf: true,
    asyncGeneratorFunctions: true,
    asyncFunctions: true,
    optionalChaining: { loose: false },
    nullishCoalescingOperator: { loose: false },
    logicalAssignmentOperators: true,
    exponentiationOperator: true,
    optionalCatchBinding: true,
    blockScoping: true,
    regexpSticky: true,
    regexpDotAll: true,
    regexpNamedCaptureGroups: true,
    regexpUnicodePropertyEscapes: true,
    regexpUnicodeSets: true,
    regexpUnicode: true,
  },
  helpers: { mode: 'inline' },
};

test('matches a Babel preset when language transforms interact in one program', async () => {
  const source = String.raw`
    class Counter {
      #value = 1;
      extra = 2;
      static label = 'counter';
      static { this.label += '!'; }
      #twice() { return this.#value * 2; }
      has(candidate) { return #value in candidate; }
      read(step = 1, ...rest) { this.#value **= step; return this.#twice() + rest.length; }
    }
    async function* sequence(input = { nested: { value: 2 } }) {
      const { nested: { value }, ...rest } = input;
      for (const item of [value, rest.missing ?? 3]) yield await Promise.resolve(item);
    }
    async function run() {
      const counter = new Counter();
      let optional = null;
      optional ??= counter?.read(2, 'x');
      const values = [];
      for await (const value of sequence()) values.push(value);
      try { throw new Error('x'); } catch { values.push(optional); }
      return [Counter.label, counter.has(counter), values, /a.b/s.test('a\nb'), /(?<x>a)/u.exec('a').groups.x, /\p{ASCII}/u.test('A'), /^[\p{ASCII}&&\p{Letter}]+$/v.test('Az'), /a/y.sticky];
    }
    globalThis.__result = run();
  `;
  const babelCode = transformWithBabel(source, 'fixture.js', babelLanguagePreset);
  const noxcturnalCode = transformWithNoxcturnal(source, 'fixture.js', nativeLanguagePreset);

  assert.doesNotMatch(
    noxcturnalCode,
    /\?\.|\?\?|\?\?=|for await|async function\*|#value|\.\.\.rest/,
  );
  assert.deepEqual(await execute(noxcturnalCode), await execute(babelCode));
});

test.each([
  {
    name: 'short-circuits computed optional and logical assignment keys exactly once',
    source: `
      const log = [];
      const key = label => (log.push(label), 'value');
      const target = { value: null };
      target[key('assign-key')] ??= (log.push('assign-value'), 4);
      const missing = null;
      const removed = delete missing?.[key('delete-key')];
      globalThis.__result = [target.value, removed, log];
    `,
  },
  {
    name: 'preserves per-iteration bindings through destructuring and closures',
    source: `
      const readers = [];
      for (let [index, value] of [[0, 'a'], [1, 'b']]) {
        readers.push(() => [index, value]);
      }
      globalThis.__result = readers.map(read => read());
    `,
  },
  {
    name: 'orders derived construction, parameter defaults, fields, and private state',
    source: `
      const log = [];
      class Base { constructor() { log.push('super'); } }
      class Derived extends Base {
        field = (log.push('field'), 2);
        #value;
        constructor({ value = 3 } = {}) {
          log.push('before-super');
          super();
          this.#value = value;
          log.push('after-private');
        }
        read({ multiplier = this.field } = {}) { return this.#value * multiplier; }
      }
      const instance = new Derived();
      globalThis.__result = [instance.read(), log];
    `,
  },
])('adversarially matches Babel: $name', async ({ source }) => {
  const babelCode = transformWithBabel(source, 'adversarial.js', babelLanguagePreset);
  const noxcturnalCode = transformWithNoxcturnal(source, 'adversarial.js', nativeLanguagePreset);
  assert.deepEqual(await execute(noxcturnalCode), await execute(babelCode));
});

test('matches a Babel preset when TypeScript, JSX, decorators, and class transforms interact', async () => {
  const source = `
    function mark(value: any) { value.marked = true; }
    @mark
    class Component {
      value: number = 2;
      render(input?: { value?: number }) {
        return <Item value={input?.value ?? this.value} />;
      }
    }
    globalThis.__result = [Component.marked, new Component().render({ value: 3 })];
  `;
  const babelCode = transformWithBabel(source, 'fixture.tsx', [
    [decorators, { legacy: true }],
    [typescript, { isTSX: true, allExtensions: true, allowNamespaces: true }],
    [reactJsx, { runtime: 'classic' }],
    reactPure,
    [classProperties, { loose: true }],
    classes,
    optionalChaining,
    nullishCoalescing,
  ]);
  const noxcturnalCode = transformWithNoxcturnal(source, 'fixture.tsx', {
    typescript: 'strip',
    jsx: 'classic',
    jsxPure: true,
    transforms: {
      legacyDecorators: true,
      classProperties: { loose: true },
      classes: true,
      optionalChaining: { loose: false },
      nullishCoalescingOperator: { loose: false },
    },
    helpers: { mode: 'inline' },
  });
  const globals = {
    Item: 'Item',
    React: { createElement: (type: unknown, props: unknown) => ({ type, props }) },
  };
  assert.doesNotMatch(noxcturnalCode, /: number|: any|<Item|@mark|\?\.|\?\?/);
  assert.match(noxcturnalCode, /@__PURE__/);
  assert.deepEqual(await execute(noxcturnalCode, globals), await execute(babelCode, globals));
});

test('matches Babel when JSX development metadata composes with user props', async () => {
  const source = `
    const view = <Item value={2} />;
    globalThis.__result = [view.type, view.props.value, Boolean(view.props.__source), '__self' in view.props];
  `;
  const babelCode = transformWithBabel(source, 'fixture.jsx', [
    [reactJsxDevelopment, { runtime: 'classic' }],
  ]);
  const noxcturnalCode = transformWithNoxcturnal(source, 'fixture.jsx', {
    jsx: 'classic-development',
    helpers: { mode: 'inline' },
  });
  const globals = {
    Item: 'Item',
    React: { createElement: (type: unknown, props: unknown) => ({ type, props }) },
  };
  assert.doesNotMatch(noxcturnalCode, /<Item/);
  assert.match(noxcturnalCode, /__source/);
  assert.match(noxcturnalCode, /__self/);
  assert.deepEqual(await execute(noxcturnalCode, globals), await execute(babelCode, globals));
});

test('matches Babel when Flow erasure composes with the language preset', async () => {
  const source = `// @flow
    enum State { Ready, Done }
    type Input = { value?: number };
    function read(input: Input = {}) { return input.value?.toString() ?? 'missing'; }
    globalThis.__result = [State.Ready, State.Done, read({ value: 4 }), read()];
  `;
  const babelCode = transformWithBabel(source, 'fixture.js', [
    flowEnums,
    flowStripTypes,
    parameters,
    optionalChaining,
    nullishCoalescing,
  ]);
  const noxcturnalCode = transformWithNoxcturnal(source, 'fixture.js', {
    transforms: {
      parameters: true,
      optionalChaining: { loose: false },
      nullishCoalescingOperator: { loose: false },
    },
    helpers: { mode: 'inline' },
  });
  assert.doesNotMatch(noxcturnalCode, /type Input|\?\.|\?\?/);
  const flowEnumRuntime = Object.assign((members: Record<string, unknown>) => members, {
    Mirrored: (members: string[]) => Object.fromEntries(members.map(member => [member, member])),
  });
  const globals = {
    require: (name: string) => {
      assert.equal(name, 'flow-enums-runtime');
      return flowEnumRuntime;
    },
  };
  assert.deepEqual(await execute(noxcturnalCode, globals), await execute(babelCode, globals));
});

test('matches Babel when export namespace lowering shares a module with language syntax', () => {
  const source = `
    export * as tools from './tools';
    export const read = input => input?.value ?? 0;
  `;
  const babelCode = transformWithBabel(
    source,
    'fixture.js',
    [exportNamespaceFrom, optionalChaining, nullishCoalescing],
    'module',
  );
  const noxcturnalCode = transformWithNoxcturnal(source, 'fixture.js', {
    transforms: {
      exportNamespaceFrom: true,
      optionalChaining: { loose: false },
      nullishCoalescingOperator: { loose: false },
    },
  });
  assert.doesNotMatch(noxcturnalCode, /export \* as|\?\.|\?\?/);
  assert.equal(canonicalize(noxcturnalCode, 'fixture.js'), canonicalize(babelCode, 'fixture.js'));
});

test('matches Babel when explicit resource management composes with block scoping', async () => {
  const source = `
    const events = [];
    {
      using resource = { [Symbol.dispose]() { events.push('dispose'); } };
      events.push('body');
    }
    globalThis.__result = events;
  `;
  const babelCode = transformWithBabel(source, 'fixture.js', [
    explicitResourceManagement,
    blockScoping,
  ]);
  const noxcturnalCode = transformWithNoxcturnal(source, 'fixture.js', {
    transforms: { explicitResourceManagement: true, blockScoping: true },
    helpers: { mode: 'inline' },
  });
  assert.doesNotMatch(noxcturnalCode, /using resource/);
  assert.deepEqual(await execute(noxcturnalCode), await execute(babelCode));
});

function transformWithBabel(
  source: string,
  filename: string,
  plugins: PluginItem[],
  sourceType: 'script' | 'module' = 'script',
): string {
  const result = babel.transformSync(source, {
    babelrc: false,
    configFile: false,
    filename,
    plugins,
    sourceType,
  });
  if (result?.code == null) throw new Error('Babel produced no output');
  return result.code;
}

function canonicalize(source: string, filename: string): string {
  const ast = babel.parseSync(source, {
    babelrc: false,
    configFile: false,
    filename,
    sourceType: 'module',
  });
  if (ast == null) throw new Error('Could not parse transformed output');
  scrubPrinterDetails(ast);
  return generate(ast, { comments: false, compact: false }).code;
}

function scrubPrinterDetails(value: unknown): void {
  if (value == null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) scrubPrinterDetails(item);
    return;
  }
  const record = value as Record<string, unknown>;
  delete record.extra;
  for (const child of Object.values(record)) scrubPrinterDetails(child);
}

function transformWithNoxcturnal(source: string, filename: string, plan: PreflightPlan): string {
  const result = transform(
    source,
    filename,
    defineNativePipeline({ phases: [{ name: 'all-language-transforms', native: plan }] }),
  );
  if (result.status !== 'complete')
    throw new Error(`Noxcturnal ${result.status}: ${result.reason}`);
  return result.code;
}

async function execute(source: string, globals: Record<string, unknown> = {}): Promise<unknown> {
  const context = vm.createContext({
    Promise,
    Error,
    Symbol,
    globalThis: undefined,
    ...globals,
  });
  context.globalThis = context;
  new vm.Script(source).runInContext(context, { timeout: 1_000 });
  return JSON.parse(JSON.stringify(await context.__result));
}
