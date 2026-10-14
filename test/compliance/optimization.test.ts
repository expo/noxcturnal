import { beforeAll, describe, expect, test } from 'vitest';
import { compile, execute, executeModule, importCode } from './runtime';

test('constant folding preserves arithmetic and coercion results', () => {
  const result = execute<{ result: unknown[] }>(
    `globalThis.result = [1 + 2 * 3, 'value:' + 4, !0, 8 >>> 2, null == undefined];`,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([7, 'value:4', true, 2, true]);
});

test('constant folding preserves short-circuit side effects', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const read = value => (calls.push(value), value);
      globalThis.result = [false && read('and'), true || read('or'), true ? read('yes') : read('no'), calls];
    `,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([false, true, 'yes', ['yes']]);
});

test('dead-code elimination retains live functions and side-effecting initializers', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      function dead() { calls.push('dead'); }
      function live(value) { return value + 1; }
      const retained = (calls.push('initializer'), () => 9);
      globalThis.result = [live(2), retained(), calls];
    `,
    { optimize: { deadCodeElimination: true } },
  );
  expect(result.result).toEqual([3, 9, ['initializer']]);
});

test('combined folding and elimination preserve the selected branch', () => {
  const result = execute<{ result: number }>(
    `
      function unused() { return 0; }
      function selected() { return 1 + 2 * 3; }
      if (1) globalThis.result = selected(); else globalThis.result = unused();
    `,
    { optimize: { constantFolding: true, deadCodeElimination: true } },
  );
  expect(result.result).toBe(7);
});

test('constant folding respects shadowed undefined and wraps bitwise operands', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function inspect(undefined, Infinity, NaN) {
        return [
          void 0,
          1 / 0,
          0 / 0,
          4294967296 | 0,
          4294967295 | 0,
          4294967296 >>> 0,
        ];
      }
      globalThis.result = inspect('shadowed', 'shadowed', 'shadowed');
    `,
    { optimize: { constantFolding: true } },
  );
  expect(result.result.slice(0, 2)).toEqual([undefined, Infinity]);
  expect(Number.isNaN(result.result[2])).toBe(true);
  expect(result.result.slice(3)).toEqual([0, -1, 0]);
});

test('dead-function elimination preserves bindings observable through direct eval', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function inspect() {
        const hidden = () => 42;
        return eval('hidden()');
      }
      globalThis.result = [inspect()];
    `,
    { optimize: { deadCodeElimination: true } },
  );
  expect(result.result).toEqual([42]);
});

test('dead-function elimination preserves valid for-loop initializers', () => {
  const result = execute<{ result: boolean }>(
    `
      let ran = false;
      for (let unused = () => 1; !ran; ran = true) {}
      globalThis.result = ran;
    `,
    { optimize: { deadCodeElimination: true } },
  );
  expect(result.result).toBe(true);
});

test('constant folding preserves Annex B bindings from unreachable if functions', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let threw = false;
      let value = 'initial';
      if (false) function hidden() {}
      try { value = hidden; } catch (error) { threw = error instanceof ReferenceError; }
      globalThis.result = [value, threw];
    `,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([undefined, false]);
});

test('constant folding uses UTF-16 code-unit ordering for strings', () => {
  const result = execute<{ result: boolean[] }>(
    `globalThis.result = ['\\u{10000}' < '\\uE000', '\\uE000' < '\\u{10000}'];`,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([true, false]);
});

test('constant folding follows ECMAScript StringNumericLiteral parsing', () => {
  const largeBinary =
    '0001101100000000000001001011101011011100011011001011010011000101111011000000101000111001101111110010100111111101101';
  const result = execute<{ result: unknown[] }>(
    `globalThis.result = [!+'inf', !+'-inf', !!+'Infinity', +'0x10', +'0b10', +'0o10', !+'1_0', '-inf' < 0, +'1\\u00a0', !+'\\ufeff', +'0b${largeBinary}'];`,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([
    true,
    true,
    true,
    16,
    2,
    8,
    true,
    false,
    1,
    true,
    Number(`0b${largeBinary}`),
  ]);
});

test('constant folding preserves signed zero semantics', () => {
  const result = execute<{ result: number[] }>(
    `globalThis.result = [1 / -0, 1 / +'-0', 1 / ((0 * -1) ** 3), 1 / ((0 * -1) ** 2)];`,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([-Infinity, -Infinity, -Infinity, Infinity]);
});

// A raw-source substring check must not hide escaped direct eval from analysis.
describe('escaped direct eval preserves dynamically referenced functions', () => {
  const source = String.raw`
    function inspect() {
      const hidden = () => 42;
      return \u0065val('hidden()');
    }
    globalThis.result = inspect();
  `;
  let code: string;
  beforeAll(() => {
    code = compile(source, { optimize: { deadCodeElimination: true } });
  });
  const run = (input: string) => {
    const context: Record<string, unknown> = {};
    new Function('globalThis', input)(context);
    return context.result;
  };
  test('native execution', () => {
    expect(run(source)).toBe(42);
  });
  test.fails('transformed execution', () => {
    expect(run(code)).toBe(42);
  });
});

// Constant folding must preserve reference/value distinctions and declaration
// instantiation as well as the selected expression's apparent value.
const foldingComplianceCases = [
  {
    name: 'typeof retains a conditional unresolved-reference error',
    source: `
      let result;
      try {
        result = typeof (true ? __audit_missing_binding__ : 0);
      } catch (e) {
        result = e.name;
      }
      globalThis.result = result;
    `,
    expected: 'ReferenceError',
    knownFailure: true,
  },
  {
    name: 'folded eval callee stays indirect',
    source: `
      function read() {
        const secret = 1;
        return (true ? eval : null)('typeof secret');
      }
      globalThis.result = read();
    `,
    expected: 'undefined',
    knownFailure: true,
  },
  {
    name: 'folding does not create a strict directive',
    source: `
      function read() {
        'use ' + 'strict';
        return this === undefined;
      }
      globalThis.result = read();
    `,
    expected: false,
    knownFailure: false,
  },
  {
    name: 'string folding preserves isolated surrogates',
    source: String.raw`const value='\uD800' + 'x';globalThis.result=[value.length,value.charCodeAt(0),value.charCodeAt(1)];`,
    expected: [2, 0xd800, 120],
    knownFailure: true,
  },
  {
    name: 'surrogate comparison uses UTF16',
    source: String.raw`globalThis.result=['\uD800' < '\uE000','\uD800'==='\uFFFD'];`,
    expected: [true, false],
    knownFailure: true,
  },
  {
    name: 'unreachable var binding survives',
    source: `
      function read() {
        if (false) {
          var hidden = 1;
        }
        try {
          return hidden;
        } catch (e) {
          return e.name;
        }
      }
      globalThis.result = read();
    `,
    expected: undefined,
    knownFailure: true,
  },
  {
    name: 'unreachable block function binding survives',
    source: `
      function read() {
        if (false) {
          function hidden() {}
        }
        try {
          return hidden;
        } catch (e) {
          return e.name;
        }
      }
      globalThis.result = read();
    `,
    expected: undefined,
    knownFailure: true,
  },
  {
    name: 'conditional callee remains unbound',
    source: `
      const obj = {
        method() {
          'use strict';
          return this === obj;
        },
      };
      globalThis.result = (true ? obj.method : null)();
    `,
    expected: false,
    knownFailure: true,
  },
  {
    name: 'logical callee remains unbound',
    source: `
      const obj = {
        method() {
          'use strict';
          return this === obj;
        },
      };
      globalThis.result = (false || obj.method)();
    `,
    expected: false,
    knownFailure: true,
  },
  {
    name: 'delete conditional does not delete selected property',
    source: `
      const obj = { value: 1 };
      globalThis.result = [delete (true ? obj.value : 0), obj.value];
    `,
    expected: [true, 1],
    knownFailure: true,
  },
  {
    name: 'folded anonymous function stays unnamed',
    source: `
      const value = true ? function () {} : null;
      globalThis.result = value.name;
    `,
    expected: '',
    knownFailure: true,
  },
  {
    name: 'exponentiation preserves NaN for unit bases with NaN or infinite exponents',
    source: `
      globalThis.result = [
        1 ** (1 / 0),
        1 ** (-1 / 0),
        1 ** (0 / 0),
        1 ** 'x',
        (-1) ** (1 / 0),
        (-1) ** (-1 / 0),
        true ** (1 / 0),
        true ** (-1 / 0),
        true ** (0 / 0),
        true ** 'x',
      ];
    `,
    expected: Array(10).fill(NaN),
    knownFailure: true,
  },
  {
    name: 'folding a leading string expression does not create strict directive',
    source: `
 function read(){'use '+'strict';return this===undefined;}
 globalThis.result=read();
    `,
    expected: false,
    knownFailure: false,
  },
  {
    name: 'folding a conditional tag preserves value invocation',
    source: `
 const object={tag(){'use strict';return this===undefined;}};
 globalThis.result=(true?object.tag:null)\`text\`;
    `,
    expected: true,
    knownFailure: true,
  },
  {
    name: 'folding a conditional optional call preserves value invocation',
    source: `
 const object={method(){'use strict';return this===undefined;}};
 globalThis.result=(true?object.method:null)?.();
    `,
    expected: true,
    knownFailure: true,
  },
  {
    name: 'typeof class expressions retain static initializer effects',
    source: `
 const events=[];globalThis.result=[typeof class{static{events.push('static');}},events];
    `,
    expected: ['function', ['static']],
    knownFailure: false,
  },
  {
    name: 'constant folding retains object numeric coercion',
    source: `
 const events=[];globalThis.result=[+{valueOf(){events.push('valueOf');return 2;}},events];
    `,
    expected: [2, ['valueOf']],
    knownFailure: false,
  },
  {
    name: 'constant folding retains computed class key coercion',
    source: `
 const events=[];const key={toString(){events.push('key');return 'value';}};globalThis.result=[typeof class{[key](){}},events];
    `,
    expected: ['function', ['key']],
    knownFailure: false,
  },
];

describe.each(foldingComplianceCases)('$name', ({ source, expected, knownFailure }) => {
  let code: string;
  beforeAll(() => {
    code = compile(source, { optimize: { constantFolding: true } });
  });
  const run = (input: string) => {
    const context: Record<string, unknown> = {};
    new Function('globalThis', input)(context);
    return context.result;
  };
  test('native execution', () => {
    expect(run(source)).toEqual(expected);
  });
  const transformedTest = knownFailure ? test.fails : test;
  transformedTest('transformed execution', () => {
    expect(run(code)).toEqual(expected);
  });
});

// Module exports are observable roots even without a local call expression.
test.each([
  { name: 'named export', source: 'function read(){return 1;}export {read};' },
  {
    name: 'default export specifier',
    source: 'function read(){return 1;}export {read as default};',
  },
  { name: 'anonymous default declaration', source: 'export default function(){return 1;}' },
])('dead-function elimination retains $name', async ({ source }) => {
  const native = await importCode(source);
  const transformed = await executeModule(source, { optimize: { deadCodeElimination: true } });
  expect(Object.keys(transformed)).toEqual(Object.keys(native));
  const key = Object.keys(native)[0];
  expect((native[key] as () => number)()).toBe(1);
  expect((transformed[key] as () => number)()).toBe(1);
});

// Exponentiation has implementation-approximated finite results; its mandatory
// exceptional values are covered separately above rather than treated as exact
// cross-engine comparisons here.
test.each([
  '+',
  '-',
  '*',
  '/',
  '%',
  '<',
  '<=',
  '>',
  '>=',
  '==',
  '!=',
  '===',
  '!==',
  '|',
  '&',
  '^',
  '<<',
  '>>',
  '>>>',
])('constant-folding primitive matrix for %s', operator => {
  const values = [
    '0',
    '-0',
    '1',
    '-1',
    '1.5',
    '1e21',
    '1e-7',
    '9007199254740991',
    '(1/0)',
    '(-1/0)',
    '(0/0)',
    'null',
    'true',
    'false',
    "''",
    "'2'",
    "'x'",
  ];
  const expressions = values.flatMap(left =>
    values.map(right => `((${left}) ${operator} (${right}))`),
  );
  const source = `globalThis.result=[${expressions.join(',')}];`;
  const native: { result?: unknown[] } = {};
  new Function('globalThis', source)(native);
  const transformed = execute<{ result: unknown[] }>(source, {
    optimize: { constantFolding: true },
  }).result;
  const differences = expressions.flatMap((expression, index) =>
    Object.is(native.result![index], transformed[index])
      ? []
      : [{ expression, expected: native.result![index], actual: transformed[index] }],
  );
  expect(differences).toEqual([]);
});

const bigintAuditOperands = [
  '-2n',
  '0n',
  '1n',
  '2n',
  '9007199254740993n',
  '-1',
  '0',
  '1',
  '2',
  '1.5',
  '(0/0)',
  "'2'",
  "'x'",
  'true',
  'false',
  'null',
];
const bigintAuditOperators = [
  '+',
  '-',
  '*',
  '/',
  '%',
  '&',
  '|',
  '^',
  '<',
  '<=',
  '>',
  '>=',
  '==',
  '!=',
  '===',
  '!==',
];
test.each(bigintAuditOperators)(
  'mixed BigInt constant folding preserves %s results and exceptions',
  operator => {
    const expressions = bigintAuditOperands.flatMap(left =>
      bigintAuditOperands.map(right => `(${left}) ${operator} (${right})`),
    );
    const source = `globalThis.result=[${expressions.map(expression => `(()=>{try{return ['value', ${expression}];}catch(error){return ['error',error.name];}})()`).join(',')}];`;
    const native: Record<string, unknown> = {};
    new Function('globalThis', source)(native);
    const transformed = execute(source, { optimize: { constantFolding: true } });
    const expected = native.result as unknown[];
    const actual = transformed.result as unknown[];
    for (let index = 0; index < expressions.length; index++)
      expect(actual[index], expressions[index]).toEqual(expected[index]);
  },
);

const eliminationComplianceCases = [
  {
    name: 'dead function elimination preserves Annex B outer assignments',
    source: `
 function run(){var value=0;{function value(){return 2;}}return typeof value;}globalThis.result=run();
    `,
    expected: 'function',
    knownFailure: true,
  },
  {
    name: 'dead function elimination preserves Annex B outer bindings',
    source: `
 function run(){{function value(){return 2;}}return value();}globalThis.result=run();
    `,
    expected: 2,
    knownFailure: false,
  },
  {
    name: 'dead function elimination preserves with environment setter effects',
    source: `
 const events=[];const object={set value(value){events.push(typeof value);}};with(object){var value=function(){};}globalThis.result=events;
    `,
    expected: ['function'],
    knownFailure: true,
  },
  {
    name: 'dead function elimination retains unused class static initialization',
    source: `
 const events=[];const Unused=class{static{events.push('static');}};globalThis.result=events;
    `,
    expected: ['static'],
    knownFailure: false,
  },
  {
    name: 'dead function elimination preserves assignments to matching catch parameters',
    source: `
 try{throw 1;}catch(value){var value=function(){return 2;};globalThis.result=typeof value;}
    `,
    expected: 'function',
    knownFailure: false,
  },
  {
    name: 'dead function elimination preserves arrow assignments to matching catch parameters',
    source: `
 try{throw 1;}catch(value){var value=()=>2;globalThis.result=value();}
    `,
    expected: 2,
    knownFailure: false,
  },
  {
    name: 'dead function elimination preserves ordinary catch-local function uses',
    source: `
 try{throw 1;}catch(error){const value=()=>2;globalThis.result=value()+error;}
    `,
    expected: 3,
    knownFailure: false,
  },
];

describe.each(eliminationComplianceCases)('$name', ({ source, expected, knownFailure }) => {
  let code: string;
  beforeAll(() => {
    code = compile(source, { optimize: { deadCodeElimination: true } });
  });
  const run = (input: string) => {
    const context: Record<string, unknown> = {};
    new Function('globalThis', input)(context);
    return context.result;
  };
  test('native execution', () => {
    expect(run(source)).toEqual(expected);
  });
  const transformedTest = knownFailure ? test.fails : test;
  transformedTest('transformed execution', () => {
    expect(run(code)).toEqual(expected);
  });
});
