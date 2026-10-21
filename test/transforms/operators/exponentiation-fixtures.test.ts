import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'exponentiation operator — assignment (input)',
    source: `var num = 1;
num **= 2;
;
`,
    filename: 'input.js',
    output: `var num = 1;
num = Math.pow(num, 2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
      },
    ],
  },
  {
    title: 'exponentiation operator — binary (input)',
    source: `2 ** 2;
`,
    filename: 'input.js',
    output: 'Math.pow(2, 2);',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
      },
    ],
  },
  {
    title: 'exponentiation operator — comprehensive (exec)',
    source: `expect(2 ** 3).toBe(8);
expect(3 * (2 ** 3)).toBe(24);
var x = 2;
expect(2 ** ++x).toBe(8);
expect(2 ** -1 * 2).toBe(1);

var calls = 0;
var q = {q: 3};
var o = {
  get p() {
    calls++;
    return q;
  }
};

o.p.q **= 2;
expect(calls).toBe(1);
expect(o.p.q).toBe(9);

expect(2 ** (3 ** 2)).toBe(512);
expect(2 ** (3 ** 2)).toBe(512);
`,
    filename: 'exec.js',
    output: `var _o$p;
expect(Math.pow(2, 3)).toBe(8);
expect(3 * Math.pow(2, 3)).toBe(24);
var x = 2;
expect(Math.pow(2, ++x)).toBe(8);
expect(Math.pow(2, -1) * 2).toBe(1);
var calls = 0;
var q = { q: 3 };
var o = {
  get p() {
    calls++;
    return q;
  },
};
((_o$p = o.p), (_o$p['q'] = Math.pow(_o$p['q'], 2)));
expect(calls).toBe(1);
expect(o.p.q).toBe(9);
expect(Math.pow(2, Math.pow(3, 2))).toBe(512);
expect(Math.pow(2, Math.pow(3, 2))).toBe(512);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
      },
    ],
  },
  {
    title: 'exponentiation operator — memoise object in default args (input)',
    source: `function fn(a, b = a.b.c **= 2) {

}
`,
    filename: 'input.js',
    output: `function fn(
  a,
  b = (() => {
    var _a$b;
    return ((_a$b = a.b), (_a$b['c'] = Math.pow(_a$b['c'], 2)));
  })(),
) {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
      },
    ],
  },
  {
    title: 'exponentiation operator — memoise object (exec)',
    source: `var counters = 0;
Object.defineProperty(global, "reader", {
  get: function () {
    counters += 1;
    return { x: 2 };
  },
  configurable: true
});
reader.x **= 2;
expect(counters).toBe(1);
`,
    filename: 'exec.js',
    output: `var _reader;
var counters = 0;
Object.defineProperty(global, 'reader', {
  get: function () {
    counters += 1;
    return { x: 2 };
  },
  configurable: true,
});
((_reader = reader), (_reader['x'] = Math.pow(_reader['x'], 2)));
expect(counters).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
      },
    ],
  },
  {
    title: 'exponentiation operator — memoise object (input)',
    source: `reader.x **= 2;
`,
    filename: 'input.js',
    output: `var _reader;
((_reader = reader), (_reader['x'] = Math.pow(_reader['x'], 2)));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 4349 keep super (input)',
    source: `foo = {
  bar() {
    return super.baz **= 12;
  }
}
`,
    filename: 'input.js',
    output: `foo = {
  bar() {
    return (super['baz'] = Math.pow(super['baz'], 12));
  },
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 4403 (input)',
    source: `var a, b;
a[\`\${b++}\`] **= 1;
`,
    filename: 'input.js',
    output: `var _ref;
var a, b;
a[(_ref = \`\${b++}\`)] = Math.pow(a[_ref], 1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exponentiationOperator: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
