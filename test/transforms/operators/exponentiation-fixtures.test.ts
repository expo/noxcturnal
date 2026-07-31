import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  'var num = 1;\nnum = Math.pow(num, 2);',
  'Math.pow(2, 2);',
  "var _o$p;\nexpect(Math.pow(2, 3)).toBe(8);\nexpect(3 * Math.pow(2, 3)).toBe(24);\nvar x = 2;\nexpect(Math.pow(2, ++x)).toBe(8);\nexpect(Math.pow(2, -1) * 2).toBe(1);\nvar calls = 0;\nvar q = { q: 3 };\nvar o = {\n  get p() {\n    calls++;\n    return q;\n  },\n};\n((_o$p = o.p), (_o$p['q'] = Math.pow(_o$p['q'], 2)));\nexpect(calls).toBe(1);\nexpect(o.p.q).toBe(9);\nexpect(Math.pow(2, Math.pow(3, 2))).toBe(512);\nexpect(Math.pow(2, Math.pow(3, 2))).toBe(512);",
  "var _a$b;\nfunction fn(a, b = ((_a$b = a.b), (_a$b['c'] = Math.pow(_a$b['c'], 2)))) {}",
  "var _reader;\nvar counters = 0;\nObject.defineProperty(global, 'reader', {\n  get: function () {\n    counters += 1;\n    return { x: 2 };\n  },\n  configurable: true,\n});\n((_reader = reader), (_reader['x'] = Math.pow(_reader['x'], 2)));\nexpect(counters).toBe(1);",
  "var _reader;\n((_reader = reader), (_reader['x'] = Math.pow(_reader['x'], 2)));",
  "foo = {\n  bar() {\n    return (super['baz'] = Math.pow(super['baz'], 12));\n  },\n};",
  'var _ref;\nvar a, b;\n((_ref = `${b++}`), (a[_ref] = Math.pow(a[_ref], 1)));',
] as const;

export const fixtureCases = [
  {
    title: 'exponentiation operator — assignment (input)',
    source: 'var num = 1;\nnum **= 2;\n;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'exponentiation operator — binary (input)',
    source: '2 ** 2;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'exponentiation operator — comprehensive (exec)',
    source:
      'expect(2 ** 3).toBe(8);\nexpect(3 * (2 ** 3)).toBe(24);\nvar x = 2;\nexpect(2 ** ++x).toBe(8);\nexpect(2 ** -1 * 2).toBe(1);\n\nvar calls = 0;\nvar q = {q: 3};\nvar o = {\n  get p() {\n    calls++;\n    return q;\n  }\n};\n\no.p.q **= 2;\nexpect(calls).toBe(1);\nexpect(o.p.q).toBe(9);\n\nexpect(2 ** (3 ** 2)).toBe(512);\nexpect(2 ** (3 ** 2)).toBe(512);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'exponentiation operator — memoise object in default args (input)',
    source: 'function fn(a, b = a.b.c **= 2) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'exponentiation operator — memoise object (exec)',
    source:
      'var counters = 0;\nObject.defineProperty(global, "reader", {\n  get: function () {\n    counters += 1;\n    return { x: 2 };\n  },\n  configurable: true\n});\nreader.x **= 2;\nexpect(counters).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'exponentiation operator — memoise object (input)',
    source: 'reader.x **= 2;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'regression — 4349 keep super (input)',
    source: 'foo = {\n  bar() {\n    return super.baz **= 12;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'regression — 4403 (input)',
    source: 'var a, b;\na[`${b++}`] **= 1;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
