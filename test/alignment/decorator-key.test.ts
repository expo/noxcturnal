import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { transformSync } from '@babel/core';
import decorators from '@babel/plugin-proposal-decorators';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'identifier',
    key: 'value',
    select: '"value"',
    type: 'string',
    text: 'value',
    effects: [],
  },
  { name: 'numeric literal', key: '1', select: '1', type: 'number', text: '1', effects: [] },
  { name: 'string literal', key: '"1"', select: '1', type: 'string', text: '1', effects: [] },
  { name: 'computed number', key: '[1]', select: '1', type: 'number', text: '1', effects: [] },
  {
    name: 'computed string',
    key: '["value"]',
    select: '"value"',
    type: 'string',
    text: 'value',
    effects: [],
  },
  {
    name: 'computed template',
    key: '[`value`]',
    select: '"value"',
    type: 'string',
    text: 'value',
    effects: [],
  },
  {
    name: 'dynamic string',
    key: '[keyName]',
    select: '"value"',
    type: 'string',
    text: 'value',
    effects: [],
  },
  { name: 'symbol', key: '[token]', select: 'token', type: 'symbol', text: 'token', effects: [] },
  {
    name: 'side-effecting key',
    key: '[getKey()]',
    select: '"value"',
    type: 'string',
    text: 'value',
    effects: ['key'],
  },
];
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', code)(context, require);
  return context.result;
}
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-decorator-key-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source);
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      experimentalDecorators: true,
      types: [],
      skipLibCheck: true,
    });
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([]);
    let output = '';
    program.emit(undefined, (name, text) => {
      if (name.endsWith('.js')) output = text;
    });
    expect(output).not.toContain('@dec');
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases) {
  describe(entry.name, () => {
    const source = `const log=[];const keyName='value';const token=Symbol('token');function getKey(){log.push('key');return 'value'}
 function dec(target,key,descriptor){log.push(['decorate',typeof key,key===token?'token':String(key)]);const original=descriptor.value;return {...descriptor,enumerable:true,value(){return original.call(this)+1}}}
 class C{@dec
 ${entry.key}(){return 7}}
 const c=new C();const descriptor=Object.getOwnPropertyDescriptor(C.prototype,${entry.select});(globalThis as any).result=[log,c[${entry.select}](),descriptor.enumerable,descriptor.configurable,descriptor.writable];`;
    const expected = [
      [...entry.effects, ['decorate', entry.type, entry.text]],
      8,
      true,
      true,
      true,
    ];
    beforeAll(() => {
      expect(ts.version).toBe('5.9.3');
      expect(observe(reference(source))).toEqual(expected);
    });
    for (const mode of ['inline', 'runtime'] as const) {
      for (const classes of [false, true]) {
        test(`preserves key and descriptor, ${mode}, classes=${classes}`, () => {
          const code = compile(
            source,
            {
              typescript: 'strip',
              transforms: { legacyDecorators: true, ...(classes ? { classes: true } : {}) },
              helpers: { mode, version: '7.29.7' },
            },
            'input.ts',
          );
          expect(code).not.toContain('@dec');
          if (classes) expect(code).not.toMatch(/class\s+C\b/);
          expect(observe(code)).toEqual(expected);
        });
      }
    }
    if (!entry.key.startsWith('['))
      test('matches Babel on the shared noncomputed method subset', () => {
        const input = source.replace('(globalThis as any)', 'globalThis');
        const code = transformSync(input, {
          configFile: false,
          babelrc: false,
          plugins: [[decorators, { legacy: true }]],
        })!.code!;
        expect(code).not.toContain('@dec');
        expect(observe(code)).toEqual(expected);
      });
  });
}
