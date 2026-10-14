import { parseSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform, type FunctionMap } from '../../index';
import { native } from '../../native/binding';

// Metro function maps encode column/name deltas and a line delta on each row's
// first segment, rather than the five fields of an ordinary source map.
function frames(map: FunctionMap) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let line = 1;
  let name = 0;
  const result: { line: number; column: number; name: string }[] = [];
  for (const row of map.mappings.split(';')) {
    let column = 0;
    for (const [index, segment] of row.split(',').entries()) {
      const values: number[] = [];
      let value = 0;
      let shift = 0;
      for (const character of segment) {
        const digit = alphabet.indexOf(character);
        if (digit < 0) throw new Error('Invalid function map digit');
        value |= (digit & 31) << shift;
        if (digit & 32) {
          shift += 5;
          continue;
        }
        values.push((value & 1 ? -1 : 1) * (value >>> 1));
        value = 0;
        shift = 0;
      }
      expect(values).toHaveLength(index === 0 ? 3 : 2);
      column += values[0];
      name += values[1];
      if (index === 0) line += values[2];
      result.push({ line, column, name: map.names[name] });
    }
  }
  return result;
}

const separators = [
  { name: 'LF', text: '\n', fails: false },
  { name: 'CRLF', text: '\r\n', fails: false },
  { name: 'CR', text: '\r', fails: true },
  { name: 'LS', text: '\u2028', fails: true },
  { name: 'PS', text: '\u2029', fails: true },
];
describe.each(separators)('function frame after $name', entry => {
  let actual: ReturnType<typeof frames>;
  beforeAll(() => {
    const source = `void '🙂';${entry.text}function named(){}`;
    const statement = parseSync(source, { babelrc: false, configFile: false })!.program.body[1];
    expect(statement.type).toBe('FunctionDeclaration');
    expect(statement.loc!.start.line).toBe(2);
    expect(statement.loc!.start.column).toBe(0);
    const standalone = native.generateFunctionMap(source, 'input.js');
    const result = transform(source, 'input.js', defineNativePipeline({ phases: [] }), {
      functionMap: true,
    });
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(result.functionMap).toEqual(standalone);
    actual = frames(standalone).filter(frame => frame.name === 'named');
    expect(actual).toEqual([
      { name: 'named', line: entry.fails ? 1 : 2, column: entry.fails ? 11 : 0 },
    ]);
  });
  (entry.fails ? test.fails : test)(
    'named frame begins at the parsed function location through both APIs',
    () => {
      expect(actual).toEqual([{ name: 'named', line: 2, column: 0 }]);
    },
  );
});

test('both function-map entry paths preserve blank lines and UTF-16 columns', () => {
  const source = "\n\nvoid '🙂'; function named(){}";
  const standalone = native.generateFunctionMap(source, 'input.js');
  const result = transform(source, 'input.js', defineNativePipeline({ phases: [] }), {
    functionMap: true,
  });
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.functionMap).toEqual(standalone);
  expect(frames(standalone).filter(frame => frame.name === 'named')).toEqual([
    { name: 'named', line: 3, column: 11 },
  ]);
});

test.each([
  { name: 'setter', source: 'class C { set value(v) {} }', expected: 'C#set__value' },
  {
    name: 'JSX child callback',
    source: 'const view = <View>{() => 1}</View>;',
    expected: 'View.props.children',
  },
  {
    name: 'React.useCallback',
    source: 'const memo = React.useCallback(() => 1, []);',
    expected: 'memo',
  },
])('$name inference agrees across function-map entry paths', ({ source, expected }) => {
  const standalone = native.generateFunctionMap(source, 'input.jsx');
  const result = transform(source, 'input.jsx', defineNativePipeline({ phases: [] }), {
    functionMap: true,
  });
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.functionMap).toEqual(standalone);
  expect(standalone.names).toContain(expected);
});

test('repeated function names reuse one name entry while retaining both frame starts', () => {
  const map = native.generateFunctionMap(
    '{ function named(){} }\n{ function named(){} }',
    'input.js',
  );
  expect(map.names.filter(name => name === 'named')).toHaveLength(1);
  expect(frames(map).filter(frame => frame.name === 'named')).toEqual([
    { name: 'named', line: 1, column: 2 },
    { name: 'named', line: 2, column: 2 },
  ]);
});

test('wrapped hashbang normalization preserves function frame coordinates', () => {
  const source = '(function wrapper(){\n#!/usr/bin/env node\nfunction named(){}\n})();';
  const map = native.generateFunctionMap(source, 'input.js');
  const commentControl = native.generateFunctionMap(source.replace('#!', '//'), 'input.js');
  expect(map).toEqual(commentControl);
  expect(frames(map).filter(frame => frame.name === 'named')).toEqual([
    { name: 'named', line: 3, column: 0 },
  ]);
});
