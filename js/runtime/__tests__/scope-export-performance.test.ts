import { expect, test, vi } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { NativeTransformSession } from '../session';

const load = (source: string) =>
  import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${crypto.randomUUID()}`
  );

for (const [label, source] of [
  ['grouped and redeclared', 'export var a=1,b=2;var a;export function update(){a++;b++}'],
  [
    'separate with unrelated locals',
    'export let a=1;let untouched=9;export let b=2;export function update(){a++;b++}',
  ],
  ['destructuring', 'export let {a,b}={a:1,b:2};export function update(){a++;b++}'],
  [
    'escaped identifier',
    String.raw`export let \u0061=1;export let b=2;export function update(){a++;b++}`,
  ],
] as const) {
  test(`indexed export rename preserves module identity: ${label}`, async () => {
    const plugins = ['a', 'b'].map(name =>
      defineNativePlugin({
        name: `rename-${name}`,
        visitors: [
          defineVisitor('Program', { scope: true }, path => {
            path.scope.rename(name, `renamed_${name}`);
          }),
        ],
      }),
    );
    const result = transform(
      source,
      'input.mjs',
      defineNativePipeline({ phases: [{ name: 'rename', plugins }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    const original = await load(source);
    const renamed = await load(result.code);
    expect(Object.keys(renamed)).toEqual(Object.keys(original));
    expect([renamed.a, renamed.b]).toEqual([original.a, original.b]);
    original.update();
    renamed.update();
    expect([renamed.a, renamed.b]).toEqual([original.a, original.b]);
  });
}

test('one export group transfers its names once across partial renames in different plugins', async () => {
  const count = 100;
  const source = `export let ${Array.from({ length: count }, (_, i) => `value${i}=${i}`).join(',')};`;
  const names = vi.spyOn(NativeTransformSession.prototype, 'bindingRenameExportNames');
  try {
    const plugins = [0, 1].map(parity =>
      defineNativePlugin({
        name: `rename-${parity}`,
        visitors: [
          defineVisitor('Program', { scope: true }, path => {
            for (let i = parity; i < count; i += 4) path.scope.rename(`value${i}`, `renamed${i}`);
          }),
        ],
      }),
    );
    const result = transform(
      source,
      'input.mjs',
      defineNativePipeline({ phases: [{ name: 'rename', plugins }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(names).toHaveBeenCalledTimes(1);
    expect(result.code.split('export {').length - 1).toBe(1);
    const module = await load(result.code);
    expect(Object.keys(module)).toHaveLength(count);
    for (let i = 0; i < count; i++) expect(module[`value${i}`]).toBe(i);
  } finally {
    names.mockRestore();
  }
});

test('renaming a parameter in an export-heavy module leaves exports alone', async () => {
  const source =
    Array.from({ length: 100 }, (_, i) => `export const public${i}=${i};`).join('') +
    'function f(value){return value}export const result=f(7);';
  const names = vi.spyOn(NativeTransformSession.prototype, 'bindingRenameExportNames');
  try {
    const plugin = defineNativePlugin({
      name: 'rename-parameter',
      visitors: [
        defineVisitor('Function', { scope: true }, path => path.scope.rename('value', 'renamed')),
      ],
    });
    const result = transform(
      source,
      'input.mjs',
      defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(names).not.toHaveBeenCalled();
    expect(result.code).not.toContain('export {');
    const module = await load(result.code);
    expect(module.result).toBe(7);
    expect(Object.keys(module)).toHaveLength(101);
  } finally {
    names.mockRestore();
  }
});
