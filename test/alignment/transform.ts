import babel, { type PluginItem } from '@babel/core';
import generate from '@babel/generator';
import flowStripTypes from '@babel/plugin-transform-flow-strip-types';
import assert from 'node:assert/strict';
import path from 'node:path';
import vm from 'node:vm';

import type { PreflightPlan } from '../../js/index';
import { defineNativePipeline, transform } from '../../js/index';

const hermesParser = require('hermes-parser') as {
  parse(source: string, options: Record<string, unknown>): Parameters<typeof generate>[0];
};

export type StructuralAlignment = {
  babel: string;
  canonical: string;
  noxcturnal: string;
};

type BabelAlignmentOptions = {
  source: string;
  filename: string;
  plugins: PluginItem[];
  noxcturnal: PreflightPlan;
};

type BehaviorAlignmentOptions = BabelAlignmentOptions & {
  globals?: Record<string, unknown> | (() => Record<string, unknown>);
  output: {
    mustMatch?: readonly RegExp[];
    mustNotMatch: readonly RegExp[];
  };
};

type EncodedValue =
  | null
  | boolean
  | string
  | { type: 'array'; items: EncodedValue[] }
  | { type: 'bigint' | 'number' | 'symbol'; value: string }
  | { type: 'error'; name: string; message: string }
  | { type: 'map'; entries: [EncodedValue, EncodedValue][] }
  | { type: 'object'; entries: [string, EncodedValue][]; prototype: string | null }
  | { type: 'set'; values: EncodedValue[] }
  | { type: 'undefined' };

type ExecutionOutcome =
  | { status: 'returned'; value: EncodedValue }
  | { status: 'threw'; error: { name: string; message: string } };

/** Compare one explicitly selected Babel transform with one native preflight plan. */
export function alignBabelTransform(options: BabelAlignmentOptions): StructuralAlignment {
  const reference = babel.transformSync(options.source, {
    babelrc: false,
    comments: true,
    compact: false,
    configFile: false,
    filename: options.filename,
    plugins: options.plugins,
    sourceMaps: false,
  });
  if (reference?.code == null) throw new Error('Babel produced no output');
  return alignOutput(options.source, options.filename, options.noxcturnal, reference.code);
}

/** Assert a documented Noxcturnal boundary while proving the individual Babel transform accepts it. */
export function expectBabelSupportedNoxcturnalBailout(
  options: BabelAlignmentOptions,
  reason: string,
): void {
  const reference = babel.transformSync(options.source, {
    babelrc: false,
    configFile: false,
    filename: options.filename,
    plugins: options.plugins,
  });
  if (reference?.code == null) throw new Error('Babel produced no output');
  const result = transform(
    options.source,
    options.filename,
    defineNativePipeline({ phases: [{ name: 'alignment', native: options.noxcturnal }] }),
  );
  assert.equal(result.status, 'bailout');
  if (result.status === 'bailout') assert.equal(result.reason, reason);
}

/** Execute both outputs and compare the JSON-compatible value assigned to `globalThis.__result`. */
export async function alignBabelBehavior(options: BehaviorAlignmentOptions): Promise<unknown> {
  const reference = babel.transformSync(options.source, {
    babelrc: false,
    comments: false,
    compact: false,
    configFile: false,
    filename: options.filename,
    plugins: options.plugins,
    sourceMaps: false,
  });
  if (reference?.code == null) throw new Error('Babel produced no output');

  const transformed = transform(
    options.source,
    options.filename,
    defineNativePipeline({ phases: [{ name: 'alignment', native: options.noxcturnal }] }),
  );
  if (transformed.status !== 'complete') {
    throw new Error(`Noxcturnal ${transformed.status}: ${transformed.reason}`);
  }
  for (const pattern of options.output.mustMatch ?? []) {
    assert.match(transformed.code, pattern, `Noxcturnal output does not contain ${pattern}`);
  }
  for (const pattern of options.output.mustNotMatch) {
    assert.doesNotMatch(transformed.code, pattern, `Noxcturnal output still contains ${pattern}`);
  }

  const babelValue = await execute(reference.code, options.globals);
  const noxcturnalValue = await execute(transformed.code, options.globals);
  assert.deepEqual(noxcturnalValue, babelValue);
  return noxcturnalValue.status === 'returned'
    ? decode(noxcturnalValue.value)
    : { throws: noxcturnalValue.error };
}

/** Compare native Flow erasure with the transforms exported by the pinned Hermes parser. */
export function alignHermesFlowTransform(
  source: string,
  filename = 'input.js',
  referenceParser: typeof hermesParser = hermesParser,
): StructuralAlignment {
  const ast = referenceParser.parse(source, {
    babel: true,
    enableExperimentalComponentSyntax: true,
    enableExperimentalFlowMatchSyntax: true,
    enableExperimentalFlowRecordSyntax: true,
    flow: 'all',
    sourceType: 'module',
    transformOptions: { TransformEnumSyntax: { enable: true } },
  });
  // Keep Hermes' Babel AST through stripping: printing and reparsing it with
  // Babel would reject valid Hermes syntax such as a type parameter named `in`.
  const reference = babel.transformFromAstSync(
    ast as Parameters<typeof babel.transformFromAstSync>[0],
    source,
    {
      babelrc: false,
      comments: false,
      configFile: false,
      filename,
      parserOpts: { plugins: ['jsx'] },
      plugins: [flowStripTypes],
    },
  );
  if (reference?.code == null) throw new Error('Hermes/Babel produced no output');
  return alignOutput(
    source,
    filename,
    filename.endsWith('x') ? { jsx: 'preserve' } : {},
    reference.code,
  );
}

/** Hermes' Babel adapter drops member decorators, including at the candidate
 * revision. Use Babel's Flow stripper as the preservation oracle for these
 * cases; Hermes parser acceptance is asserted separately. */
export function alignFlowDecoratorTransform(source: string): StructuralAlignment {
  return alignBabelTransform({
    source,
    filename: 'input.js',
    noxcturnal: {},
    plugins: [
      {
        manipulateOptions(_options, parser) {
          parser.plugins.push('decorators-legacy');
        },
      },
      flowStripTypes,
    ],
  });
}

function alignOutput(
  source: string,
  filename: string,
  plan: PreflightPlan,
  reference: string,
): StructuralAlignment {
  const absoluteFilename = path.resolve(filename);
  const result = transform(
    source,
    absoluteFilename,
    defineNativePipeline({ phases: [{ name: 'alignment', native: plan }] }),
  );
  if (result.status !== 'complete') {
    throw new Error(`Noxcturnal ${result.status}: ${result.reason}`);
  }

  const babelCode = canonicalize(reference, absoluteFilename);
  const noxcturnalCode = canonicalize(result.code, absoluteFilename);
  if (noxcturnalCode !== babelCode) {
    throw new Error(
      `Alignment differs for ${filename}\n\nBabel/Hermes:\n${babelCode}\n\nNoxcturnal:\n${noxcturnalCode}`,
    );
  }
  return { babel: reference, canonical: babelCode, noxcturnal: result.code };
}

function canonicalize(source: string, filename: string): string {
  const ast = babel.parseSync(source, {
    babelrc: false,
    configFile: false,
    filename,
    parserOpts: { plugins: ['jsx', 'decorators-legacy'] },
    sourceType: 'unambiguous',
  });
  if (ast == null) throw new Error(`Could not canonicalize ${filename}`);
  scrubPrinterDetails(ast);
  return generate(ast, { comments: false, compact: false }).code.trim();
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

async function execute(
  source: string,
  globals: Record<string, unknown> | (() => Record<string, unknown>) = {},
): Promise<ExecutionOutcome> {
  const provided = typeof globals === 'function' ? globals() : structuredClone(globals);
  const context = vm.createContext({
    ...provided,
    console,
    globalThis: undefined,
    setTimeout,
    Symbol,
  });
  context.globalThis = context;
  try {
    new vm.Script(source, { filename: 'alignment-output.js' }).runInContext(context, {
      timeout: 1_000,
    });
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const value = await Promise.race([
      Promise.resolve(context.__result),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Alignment result timed out')), 1_000);
      }),
    ]).finally(() => clearTimeout(timeout));
    return { status: 'returned', value: encode(value) };
  } catch (error) {
    return { status: 'threw', error: errorDetails(error) };
  }
}

function encode(value: unknown, seen = new Set<object>()): EncodedValue {
  if (value === undefined) return { type: 'undefined' };
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return { type: 'number', value: 'NaN' };
    if (value === Infinity) return { type: 'number', value: 'Infinity' };
    if (value === -Infinity) return { type: 'number', value: '-Infinity' };
    if (Object.is(value, -0)) return { type: 'number', value: '-0' };
    return { type: 'number', value: String(value) };
  }
  if (typeof value === 'bigint') return { type: 'bigint', value: String(value) };
  if (typeof value === 'symbol') return { type: 'symbol', value: value.description ?? '' };
  if (typeof value === 'function') {
    return { type: 'object', entries: [], prototype: `function:${value.name}` };
  }
  if (seen.has(value)) throw new Error('Alignment result contains a cycle');
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      return {
        type: 'array',
        items: Array.from({ length: value.length }, (_, index) =>
          index in value ? encode(value[index], seen) : { type: 'undefined' },
        ),
      };
    }
    const tag = Object.prototype.toString.call(value);
    if (tag === '[object Map]') {
      return {
        type: 'map',
        entries: [...(value as Map<unknown, unknown>)].map(([key, item]) => [
          encode(key, seen),
          encode(item, seen),
        ]),
      };
    }
    if (tag === '[object Set]') {
      return { type: 'set', values: [...(value as Set<unknown>)].map(item => encode(item, seen)) };
    }
    if (tag.endsWith('Error]')) return { type: 'error', ...errorDetails(value) };
    const prototype = Object.getPrototypeOf(value) as { constructor?: { name?: string } } | null;
    return {
      type: 'object',
      entries: Object.keys(value)
        .sort()
        .map(key => [key, encode((value as Record<string, unknown>)[key], seen)]),
      prototype: prototype?.constructor?.name ?? null,
    };
  } finally {
    seen.delete(value);
  }
}

function decode(value: EncodedValue): unknown {
  if (value === null || typeof value !== 'object') return value;
  switch (value.type) {
    case 'undefined':
      return undefined;
    case 'number':
      if (value.value === 'NaN') return NaN;
      if (value.value === 'Infinity') return Infinity;
      if (value.value === '-Infinity') return -Infinity;
      if (value.value === '-0') return -0;
      return Number(value.value);
    case 'bigint':
      return BigInt(value.value);
    case 'symbol':
      return Symbol(value.value);
    case 'array':
      return value.items.map(decode);
    case 'map':
      return new Map(value.entries.map(([key, item]) => [decode(key), decode(item)]));
    case 'set':
      return new Set(value.values.map(decode));
    case 'error':
      return { name: value.name, message: value.message };
    case 'object':
      return Object.fromEntries(value.entries.map(([key, item]) => [key, decode(item)]));
  }
}

function errorDetails(error: unknown): { name: string; message: string } {
  if (error != null && typeof error === 'object') {
    const candidate = error as { name?: unknown; message?: unknown };
    return { name: String(candidate.name ?? 'Error'), message: String(candidate.message ?? error) };
  }
  return { name: typeof error, message: String(error) };
}
