import { expect, test } from 'vitest';
import { execute, executeModule } from './runtime';

test('async Flow components and hooks preserve suspension, defaults, results, and rejections', async () => {
  const { result } = execute<{ result: Promise<unknown[]> }>(
    `// @flow
    const calls = [];
    async component Read(value: number = (2: number)) {
      calls.push('start:' + value);
      const result: number = await Promise.resolve(value * 2);
      calls.push('end:' + value);
      return result;
    }
    async hook useFailure(): Promise<void> { throw Error('hook failure'); }
    globalThis.result = (async () => {
      const pending = Read({});
      calls.push('pending');
      const value = await pending;
      try { await useFailure(); } catch (error) { calls.push(error.message); }
      return [value, calls];
    })();`,
    {},
  );
  await expect(result).resolves.toEqual([4, ['start:2', 'pending', 'end:2', 'hook failure']]);
});

test('ref components are available before declaration without leaving their lexical block', () => {
  const { result } = execute<{ result: unknown[] }>(
    `// @flow
    const calls = [];
    const React = { forwardRef(render) { calls.push(render.name); return render; } };
    const before = [First, Second];
    component First(ref?: Ref, value: number = (3: number)) { return [value, ref]; }
    component Second(ref?: Ref, ...{other, extra = (4: number)}: Props) { return [other, extra, ref]; }
    const outer = First;
    let nested;
    { const early = First; component First(ref?: Ref) { return ref; } nested = early({}, 'inner'); }
    globalThis.result = [before[0]({}, 'one'), before[1]({other: 2}, 'two'), nested,
      outer === First, calls];`,
    {},
  );
  expect(result).toEqual([
    [3, 'one'],
    [2, 4, 'two'],
    'inner',
    true,
    ['First_withRef', 'Second_withRef', 'First_withRef'],
  ]);
});

test('exported ref components preserve named and default bindings before declaration', async () => {
  const result = await executeModule(
    `// @flow
    const React = { forwardRef(render) { return render; } };
    export const before = Named;
    export component Named(ref?: Ref, value: number = 1) { return [value, ref]; }
    export default async component Default(ref?: Ref) { return await Promise.resolve(ref); }
  `,
    {},
  );
  expect(result.before).toBe(result.Named);
  expect((result.Named as Function)({}, 'named')).toEqual([1, 'named']);
  await expect((result.default as Function)({}, 'default')).resolves.toBe('default');
});

test('ref wrappers stay inside their class static block', () => {
  const { result } = execute<{ result: unknown[] }>(
    `// @flow
    const React = { forwardRef: render => render };
    const C = 'outer';
    class A {
      static {
        const captured = 2;
        const before = C;
        component C(ref?: Ref) { return [captured, ref]; }
        this.value = before({}, 'first');
      }
      static {
        const before = C;
        component C(ref?: Ref) { return ref; }
        this.other = before({}, 'second');
      }
    }
    globalThis.result = [A.value, A.other, C];`,
    {},
  );
  expect(result).toEqual([[2, 'first'], 'second', 'outer']);
});

test.each([
  ['rest only', '', '', 'a // trailing\n'],
  ['rest after prop', 'value: number, ', 'value, ', 'a // trailing\n'],
  ['trailing comma', '', '', 'a, // trailing\n'],
] as const)(
  'destructured component %s preserves line-comment termination',
  (_name, params, values, rest) => {
    const { result } = execute<{ result: unknown[] }>(
      `// @flow
    component C(${params}...{${rest}}: Props) { return [${values}a]; }
    globalThis.result = C({value: 1, a: 2});`,
      {},
    );
    expect(result).toEqual(params ? [1, 2] : [2]);
  },
);

test('component bindings preserve escaped spellings and avoid occupied internal names', () => {
  const { result } = execute<{ result: unknown[] }>(
    `// @flow
    const React = {forwardRef(render) { return render; }};
    const Read\\u005fwithRef = 7;
    const before = Read;
    component R\\u0065ad("ref" as ref?: Ref, external as v\\u0061lue: number = (2: number)) {
      return [value, ref, Read_withRef];
    }
    globalThis.result = [before({}, 'ref'), before.name];`,
    {},
  );
  expect(result).toEqual([[2, 'ref', 7], 'Read_withRef$0']);
});

test('the generated empty props parameter does not shadow an app binding', () => {
  const { result } = execute<{ result: unknown[] }>(
    `// @flow
    const React = {forwardRef(render) { return render; }};
    const _$$empty_props_placeholder$$ = 7;
    component Read(ref?: Ref) { return [_$$empty_props_placeholder$$, ref]; }
    globalThis.result = Read({}, 'ref');`,
    {},
  );
  expect(result).toEqual([7, 'ref']);
});

test('ref wrappers precede earlier JSX uses of the component', () => {
  const { result } = execute<{ result: unknown[] }>(
    `// @flow
    const calls = [];
    const React = {
      forwardRef(render) { calls.push('wrapped'); return render; },
      createElement(type, props) { return type(props, 'ref'); },
    };
    const before = <Read value={3} />;
    component Read(ref?: Ref, value: number) { return [value, ref]; }
    globalThis.result = [before, calls];`,
    { jsx: 'classic' },
  );
  expect(result).toEqual([[3, 'ref'], ['wrapped']]);
});

test('Flow records preserve defaults, instance properties, methods, statics, and spread evaluation', () => {
  const { result } = execute<{ result: unknown[] }>(
    `// @flow
    const calls = [];
    const read = value => { calls.push(value); return value; };
    record Point<T> implements Readable<T> {
      x: T,
      y: number = read(2),
      default: string = 'default',
      "label": string = 'label',
      1: number = 10,
      static count: number = read(1),
      sum(): number { return this.x + this.y; }
      static create(x: number) { return Point {x}; }
    }
    const value = Point<number> {x: read(3), ...{label: read('custom')}};
    value.x = 5;
    const second = Point.create(7);
    let missing;
    try { new Point(); } catch (error) { missing = error instanceof TypeError; }
    const descriptor = Object.getOwnPropertyDescriptor(value, 'x');
    globalThis.result = [calls, value instanceof Point, value.sum(), value.default, value.label,
      value[1], Point.count, second.sum(), Object.keys(value), descriptor.writable,
      descriptor.enumerable, descriptor.configurable, missing];`,
    {},
  );
  expect(result).toEqual([
    [1, 3, 'custom', 2, 2],
    true,
    7,
    'default',
    'custom',
    10,
    1,
    9,
    ['1', 'x', 'y', 'default', 'label'],
    true,
    true,
    true,
    true,
  ]);
});

test('record constructor locals avoid strict keywords and generated-name collisions', () => {
  const { result } = execute<{ result: unknown[] }>(
    `// @flow
    const $$gen\\u0024r0 = 7;
    record Keys { let: number, arguments: number, eval: number, "x": number = $$gen\\u0024r0, }
    const value = Keys {let: 1, arguments: 2, eval: 3};
    globalThis.result = [value.let, value.arguments, value.eval, value.x];`,
    {},
  );
  expect(result).toEqual([1, 2, 3, 7]);
});

test('record assignments use each default when numeric and bigint keys alias', () => {
  const { result } = execute<{ result: number[] }>(
    `// @flow
    record R { 1: number = 2, 1n: number = 3, }
    const calls = [];
    Object.defineProperty(R.prototype, '1', {set(value) { calls.push(value); }});
    R {};
    globalThis.result = calls;`,
    {},
  );
  expect(result).toEqual([2, 3]);
});

test('decorated Flow classes retain typed fields and execute native legacy decorators', () => {
  const { result } = execute<{ result: unknown[] }>(
    `// @flow
    const calls = [];
    function field(target, key) { calls.push('field:' + key); }
    function method(target, key, descriptor) {
      calls.push('method:' + key);
      const original = descriptor.value;
      descriptor.value = function () { return original.call(this) * 2; };
      return descriptor;
    }
    function decorate(Class) { calls.push('class'); Class.tag = 'decorated'; return Class; }
    @decorate
    class Example<T> {
      @field missing: number;
      @field value: number = 3;
      @method read(): number { return this.value; }
    }
    const value = new Example();
    globalThis.result = [calls, value.read(), Object.hasOwn(value, 'missing'), value.missing,
      Example.tag];`,
    { transforms: { legacyDecorators: true, classProperties: { loose: false } } },
  );
  expect(result).toEqual([
    ['field:missing', 'field:value', 'method:read', 'class'],
    6,
    true,
    undefined,
    'decorated',
  ]);
});
