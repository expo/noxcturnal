import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transformSync } from '@babel/core';
import decorators from '@babel/plugin-proposal-decorators';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const source = `const log=[];function mark(label){log.push('eval:'+label);return function(...args){log.push('apply:'+label+':'+String(args[1])+':'+args.length)}}
@mark('class') class C {
 @mark('static-method') static read(@mark('static-param') value){}
 @mark('instance-method') read(@mark('instance-param') value){}
 @mark('static-field') static field=1;
 @mark('instance-field') field=2;
 constructor(@mark('constructor-param') value){}
}(globalThis as any).result=log;`;
const instance = [
  'eval:instance-method',
  'eval:instance-param',
  'apply:instance-param:read:3',
  'apply:instance-method:read:3',
  'eval:instance-field',
  'apply:instance-field:field:3',
];
const statics = [
  'eval:static-method',
  'eval:static-param',
  'apply:static-param:read:3',
  'apply:static-method:read:3',
  'eval:static-field',
  'apply:static-field:field:3',
];
const constructor = [
  'eval:class',
  'eval:constructor-param',
  'apply:constructor-param:undefined:3',
  'apply:class:undefined:1',
];
const expected = [...instance, ...statics, ...constructor];
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', code)(context, require);
  return context.result;
}
function typescript() {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-decorator-order-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source);
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      experimentalDecorators: true,
      useDefineForClassFields: false,
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
    expect(output).not.toContain('@mark');
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
let reference: unknown;
beforeAll(() => {
  expect(ts.version).toBe('5.9.3');
  reference = observe(typescript());
  expect(reference).toEqual(expected);
});
for (const mode of ['inline', 'runtime'] as const) {
  for (const classes of [false, true]) {
    describe(`legacy decorator grouping, ${mode}, classes=${classes}`, () => {
      let actual: unknown;
      beforeAll(() => {
        const code = compile(
          source,
          {
            typescript: 'strip',
            transforms: {
              legacyDecorators: true,
              ...(classes ? { classes: true, classProperties: { loose: true } } : {}),
            },
            helpers: { mode, version: '7.29.7' },
          },
          'input.ts',
        );
        expect(code).not.toContain('@mark');
        expect(code).not.toContain(' as any');
        if (classes) expect(code).not.toMatch(/class\s+C\b/);
        actual = observe(code);
        expect(actual).toEqual(expected);
      });
      test('groups instance decorators before static decorators and constructor decorators', () =>
        expect(actual).toEqual(reference));
    });
  }
}
// Babel has its own legacy factory-evaluation model and no parameter-decorator ABI.
// Keep this comparison explicit rather than use Babel as a TypeScript oracle.
test('characterizes Babel legacy evaluation on the shared method-only subset', () => {
  const input = `const log=[];function mark(label){log.push('eval:'+label);return function(...args){log.push('apply:'+label+':'+String(args[1])+':'+args.length)}} @mark('class') class C {@mark('static-method') static read(){} @mark('instance-method') read(){}}globalThis.result=log;`;
  const code = transformSync(input, {
    configFile: false,
    babelrc: false,
    plugins: [[decorators, { legacy: true }]],
  })!.code!;
  expect(code).not.toContain('@mark');
  expect(observe(code)).toEqual([
    'eval:class',
    'eval:static-method',
    'eval:instance-method',
    'apply:static-method:read:3',
    'apply:instance-method:read:3',
    'apply:class:undefined:1',
  ]);
});
