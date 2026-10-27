import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import type { PreflightTransforms } from '../../js';
import { compile } from './runtime';

const cases = [
  {
    name: 'if condition updates arguments before arrow creation',
    body: `if ((arguments = [7], true))
      out.push(((value = arguments[0]) => value)());`,
    expected: [7],
  },
  {
    name: 'for test updates arguments on each iteration',
    body: `for (var i = 0; (arguments = [i], i < 2); i++)
      out.push(((value = arguments[0]) => value)());`,
    expected: [0, 1],
  },
  {
    name: 'while test updates arguments on each iteration',
    body: `var i = 0;
      while ((arguments = [i++], i < 3))
        out.push(((value = arguments[0]) => value)());`,
    expected: [0, 1],
  },
  {
    name: 'loop-local arguments shadows the function arguments',
    body: `for (const arguments of [[1], [2]])
      out.push(((value = arguments[0]) => value)());`,
    expected: [1, 2],
  },
];

for (const mode of ['parameters', 'object-rest parameters'] as const) {
  const transforms: PreflightTransforms =
    mode === 'parameters'
      ? { parameters: true }
      : { objectRestSpread: { loose: true, useBuiltIns: true } };
  test.each(cases)(
    `keeps ${mode} capture initialization at the arrow: $name`,
    ({ body, expected }) => {
      const selectedBody =
        mode === 'parameters'
          ? body
          : body.replace('(value = arguments[0]) => value', '({...value} = arguments) => value[0]');
      const source = `function read() {
      const out = [];
      ${selectedBody}
      return out;
    }
    globalThis.result = read(9);`;
      expect(runInNewContext(source)).toEqual(expected);
      const code = compile(source, { transforms });
      if (mode === 'parameters') expect(code).not.toMatch(/\(\s*value\s*=/);
      else expect(code).not.toContain('...value');
      expect(runInNewContext(code)).toEqual(expected);
    },
  );

  test(`keeps ${mode} arguments live after the lowered arrow is created`, () => {
    const arrow =
      mode === 'parameters'
        ? '(value = arguments[0]) => value'
        : '({...value} = arguments) => value[0]';
    const source = `function read() {
      const later = ${arrow};
      arguments = [7];
      return later();
    }
    globalThis.result = read(9);`;
    expect(runInNewContext(source)).toBe(7);
    expect(runInNewContext(compile(source, { transforms }))).toBe(7);
  });

  test(`writes through ${mode} arrows update the owning arguments binding`, () => {
    const arrow =
      mode === 'parameters'
        ? '(value = 7) => (arguments = [value])'
        : '({...value} = {value: 7}) => (arguments = [value.value])';
    const source = `function read() {
      const write = ${arrow};
      write();
      return arguments[0];
    }
    globalThis.result = read(9);`;
    expect(runInNewContext(source)).toBe(7);
    expect(runInNewContext(compile(source, { transforms }))).toBe(7);
  });
}

test('braced parameter capture placement control', () => {
  const source = `function read() {
    const out = [];
    for (var i = 0; (arguments = [i], i < 2); i++) {
      out.push(((value = arguments[0]) => value)());
    }
    return out;
  }
  globalThis.result = read(9);`;
  expect(runInNewContext(source)).toEqual([0, 1]);
  expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toEqual([0, 1]);
});

for (const declaration of ['var', 'let', 'const']) {
  test(`defers ${declaration} arguments initialization until invocation`, () => {
    const source = `function read() {
      const later = (v = arguments[0]) => v;
      ${declaration} arguments = [7];
      return [later(), later.name];
    }
    globalThis.result = read(9);`;
    expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toEqual([
      7,
      'later',
    ]);
  });
}

test.each([
  [
    'object property',
    'const holder = {later: (v = arguments[0]) => v}; const later = holder.later;',
  ],
  ['assignment', 'let later; later = (v = arguments[0]) => v;'],
])('preserves inferred names for %s captures', (_, declaration) => {
  const source = `function read() { ${declaration} arguments = [7]; return [later(), later.name]; }
    globalThis.result = read(9);`;
  expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toEqual([
    7,
    'later',
  ]);
});

test.each([
  [
    'destructuring write',
    `const later = (v=0) => ({arguments} = {arguments:[7]}); later(); return arguments[0];`,
    7,
  ],
  [
    'nested ordinary function',
    `const later = (v=arguments[0]) => [v, (function(){return arguments[0]})(3)]; arguments=[7]; return later();`,
    [7, 3],
  ],
  [
    'owner eval write',
    `const later = (v=arguments[0]) => v; eval('arguments=[7]'); return later();`,
    7,
  ],
  [
    'bare call receiver',
    `const later = (v=0) => arguments(); arguments=function(){'use strict';return this===undefined}; return later();`,
    true,
  ],
  [
    'parameter initializer',
    `return (function(value=((v=arguments[0])=>v)()){return value})(undefined);`,
    undefined,
  ],
])('preserves %s with lexical capture', (_, body, expected) => {
  const source = `function read(){${body}} globalThis.result=read(9);`;
  expect(runInNewContext(source)).toEqual(expected);
  expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toEqual(expected);
});

test('defers absent top-level arguments reads and preserves typeof', () => {
  const source = `const later=(v=0)=>arguments; const type=(v=0)=>typeof arguments;
    globalThis.result=type(); try { later(); } catch(error){globalThis.result += ':'+error.name;}`;
  expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toBe(
    'undefined:ReferenceError',
  );
});

test.each([{ parameters: true }, { asyncFunctions: true }])(
  'leaves direct eval calls to ordinary arrow lowering: %o',
  transforms => {
    const source = `function read(){const later=async (v=0)=>eval('arguments[0]'); arguments=[7]; return later();}`;
    const code = compile(source, { transforms });
    expect(code).toContain('eval(');
    if ('parameters' in transforms) expect(code).not.toMatch(/async\s*\(v\s*=/);
    else expect(code).not.toMatch(/async\s*\(/);
  },
);

test.each([
  `function read(later=(v=arguments[0])=>v){return later.name} globalThis.result=read();`,
  `function read(){const [later=(v=arguments[0])=>v]=[]; arguments=[7]; return later.name} globalThis.result=read();`,
  `function read(){const holder={['__proto__']:(v=arguments[0])=>v}; arguments=[7]; return holder.__proto__.name} globalThis.result=read();`,
])('preserves inferred names in capture defaults: %s', source => {
  expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toBe(
    runInNewContext(source),
  );
});

test.each([
  `const f=(x=1)=>eval('x'); globalThis.result=f();`,
  `const f=(x=1)=>eval?.('1'); globalThis.result=f();`,
  `function read(){const eval=x=>x; return ((x=1)=>eval(x))();} globalThis.result=read();`,
])('does not reject eval in arrows left intact by object rest: %s', source => {
  expect(
    runInNewContext(
      compile(source, { transforms: { objectRestSpread: { loose: true, useBuiltIns: true } } }),
    ),
  ).toBe(1);
});

test.each([
  `'later'`,
  `Symbol('later')`,
  `({[Symbol.toPrimitive](hint){calls.push(hint); return 'later'}})`,
])('preserves dynamic inferred names and coerces keys once: %s', key => {
  const source = `function read(){const calls=[];const key=${key};
    const holder={[key]:(v=arguments[0])=>v};arguments=[7];
    const name=Reflect.ownKeys(holder)[0];return [holder[name](),holder[name].name,calls];}
    globalThis.result=read(9);`;
  expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toEqual(
    runInNewContext(source),
  );
});

test('uses runtime property-key helpers for computed capture names', () => {
  const source = `function read(){let calls=0;const key={[Symbol.toPrimitive](){calls++;return 'later'}};
    const holder={[key]:(v=arguments[0])=>v};arguments=[7];return [holder.later(),holder.later.name,calls];}
    globalThis.result=read(9);`;
  const code = compile(source, {
    transforms: { parameters: true },
    helpers: { mode: 'runtime', version: '7.29.7' },
  });
  expect(code).toContain('@babel/runtime/helpers/toPropertyKey');
  expect(runInNewContext(code, { require: createRequire(import.meta.url) })).toEqual([
    7,
    'later',
    1,
  ]);
});

test('a parameter named eval can update the owning arguments binding', () => {
  const source = `function read(eval){const later=(v=arguments[1])=>v;eval('arguments=[0,7]');return later()}
    globalThis.result=read(globalThis.eval,9);`;
  expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toBe(7);
});

test('resolved eval calls follow ordinary converted-arrow behavior', () => {
  const source = `function read(eval){return (v=0)=>eval('arguments[0]')}
    globalThis.result=read(globalThis.eval)(9);`;
  // Converted functions expose their own call arguments to direct eval.
  expect(runInNewContext(compile(source, { transforms: { parameters: true } }))).toBe(9);
});
