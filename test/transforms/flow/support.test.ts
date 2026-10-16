import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { expect, test } from 'vitest';
import { native } from '../../../js/native/binding';
import { defineNativePipeline, transform } from '../../../js/index';
import { flowTest, transformSource } from '../transform';

flowTest('lowers async components with await and refs through the public native path', async () => {
  const code = await transformSource(
    `// @flow
    const before = Read;
    export default async component Read(ref?: Ref, value: number = (1: number)) {
      return await Promise.resolve([value, ref]);
    }`,
    'input.js',
    {},
  );
  expect(code).toContain('const Read = React.forwardRef(Read_withRef);');
  expect(code.indexOf('const Read =')).toBeLessThan(code.indexOf('const before ='));
  expect(code).toContain('async function Read_withRef({ value = 1 }, ref)');
  expect(code).toContain('return await Promise.resolve([value, ref]);');
  expect(code).toContain('export default Read;');
});

test.each([
  ['record constructor', 'record R { value: number = 17 }', 'constructor'],
  ['copied component default', 'component C(value: number = 17) { return value; }', '17'],
])('keeps generated %s text sourceless', (_name, declaration, token) => {
  const result = native.nativeFlowErase(`// café 🦉\n${declaration}`, 'fixture.js', 'character');
  expect(result.status).toBe('erased');
  const offset = result.code!.indexOf(token);
  expect(offset).toBeGreaterThanOrEqual(0);
  const lines = result.code!.slice(0, offset).split('\n');
  const map = new TraceMap({ version: 3, sources: ['fixture.js'], ...result.map! });
  expect(originalPositionFor(map, { line: lines.length, column: lines.at(-1)!.length })).toEqual({
    source: null,
    line: null,
    column: null,
    name: null,
  });
});

test('composes retained record method mappings through class-property lowering', () => {
  const source = `// @flow café 🦉
record R {
  value: number = 17,
  static ready: boolean = true,
  read(): string { return "é🦉"; }
}`;
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'fields', native: { transforms: { classProperties: { loose: false } } } }],
    }),
    { sourceMapMode: 'character' },
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') return;
  expect(result.code).not.toContain('static ready');
  expect(result.code).not.toContain('record R');
  const position = (text: string) => {
    const offset = text.indexOf('return');
    expect(offset).toBeGreaterThanOrEqual(0);
    const lines = text.slice(0, offset).split('\n');
    return { line: lines.length, column: lines.at(-1)!.length };
  };
  const map = new TraceMap({ version: 3, sources: ['fixture.js'], ...result.map });
  expect(originalPositionFor(map, position(result.code))).toEqual({
    source: 'fixture.js',
    ...position(source),
    name: null,
  });
});

flowTest(
  'Flow erasure preserves decorators until the selected native decorator phase',
  async () => {
    const source =
      '// @flow\nclass Example { @dec field: number; @dec method(x: number): number { return x; } }';
    const preserved = await transformSource(source, 'input.js', {});
    expect(preserved).toContain('@dec');
    expect(preserved).not.toContain(': number');
    const lowered = await transformSource(source, 'input.js', {
      helpers: { mode: 'inline' },
      transforms: { legacyDecorators: true, classProperties: { loose: false } },
    });
    expect(lowered).not.toContain('@dec');
    expect(lowered).toContain('dec');
  },
);

test.each([
  [
    'async component body',
    '// café 🦉\nasync component Read(value: number) { return await Promise.resolve(value); }',
    'await',
  ],
  [
    'relocated ref component body',
    '// café 🦉\nconst before = Read;\ncomponent Read(ref?: Ref) { return "é"; }',
    'return',
  ],
  [
    'record method body',
    '// café 🦉\nrecord R { x: number, read(): number { return this.x; } static value: string = "é", }',
    'return',
  ],
  [
    'record static initializer',
    '// café 🦉\nrecord R { x: number, read(): number { return this.x; } static value: string = "é", }',
    '"é"',
  ],
  ['decorator expression', '// café 🦉\nclass R { @dec value: number; }', '@dec'],
])('maps retained %s bytes to their original positions', (_name, source, token) => {
  const result = native.nativeFlowErase(source, 'fixture.js', 'character');
  expect(result.status).toBe('erased');
  const position = (text: string) => {
    const offset = text.indexOf(token);
    expect(offset).toBeGreaterThanOrEqual(0);
    const lines = text.slice(0, offset).split('\n');
    return { line: lines.length, column: lines.at(-1)!.length };
  };
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map!.names,
    mappings: result.map!.mappings,
  });
  expect(originalPositionFor(map, position(result.code!))).toEqual({
    source: 'fixture.js',
    ...position(source),
    name: null,
  });
});
