import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);
async function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', 'require', code)(context, require);
  return await context.result;
}

describe.each(['inline', 'runtime'] as const)('%s async lowering', mode => {
  const helpers = { mode, version: '7.29.7' } as const;
  test.each([false, true])(
    'preserves simple method arguments aliasing, generator=%s',
    async generator => {
      const source = `const owner = { async ${generator ? '*' : ''}read(a) { a = 4; ${generator ? 'yield' : 'return'} arguments[0]; } };
      globalThis.result = ${generator ? 'owner.read(1).next().then(result => result.value)' : 'owner.read(1)'};`;
      expect(
        await run(
          compile(source, {
            helpers,
            transforms: { asyncFunctions: true, asyncGeneratorFunctions: true },
          }),
        ),
      ).toBe(4);
    },
  );

  test('keeps generator defaults synchronous while ordinary method defaults reject', async () => {
    const source = `const log = [];
      const owner = {
        async read({x}) { return x; },
        async *values({x}) { yield x; }
      };
      try { const promise = owner.read(null); log.push('promise'); promise.catch(() => log.push('rejected')); } catch { log.push('wrong-sync'); }
      try { owner.values(null); } catch { log.push('sync'); }
      globalThis.result = Promise.resolve().then(() => log);`;
    expect(
      await run(
        compile(source, {
          helpers,
          transforms: { asyncFunctions: true, asyncGeneratorFunctions: true },
        }),
      ),
    ).toEqual(['promise', 'sync', 'rejected']);
  });

  test('keeps renamed arguments references across nested ordinary functions', async () => {
    const source = `let arguments = 7;
      function read() { return arguments; }
      globalThis.result = (async () => {
        const before = read();
        function nested() { return () => arguments; }
        return [before, arguments, nested()()];
      })();`;
    // A normal function owns its implicit arguments, even inside an async arrow.
    const code = compile(source, { helpers, transforms: { asyncFunctions: true } });
    const result = (await run(code)) as unknown[];
    expect(result[1]).toBe(7);
    expect(Object.prototype.toString.call(result[0])).toBe('[object Arguments]');
    expect(Object.prototype.toString.call(result[2])).toBe('[object Arguments]');
  });

  test('renames an outer lexical arguments binding without stranding earlier references', async () => {
    const source = `let arguments = 7;
      const before = arguments;
      globalThis.result = (async () => [before, arguments])();`;
    expect(await run(compile(source, { helpers, transforms: { asyncFunctions: true } }))).toEqual([
      7, 7,
    ]);
  });

  test('captures new.target independently for nested constructors', async () => {
    const source = `function Outer() {
      this.read = async () => {
        function Inner() { this.read = async () => new.target === Inner; }
        return [new.target === Outer, await new Inner().read()];
      };
    }
    globalThis.result = new Outer().read();`;
    expect(await run(compile(source, { helpers, transforms: { asyncFunctions: true } }))).toEqual([
      true,
      true,
    ]);
  });

  test('preserves unselected async generator method captures', async () => {
    const source = `const owner = { value: 3, async *read(a) { await 0; yield [this.value, arguments[0]]; } };
      async function call() { return (await owner.read(7).next()).value; }
      globalThis.result = call();`;
    const code = compile(source, { helpers, transforms: { asyncFunctions: true } });
    expect(code).toMatch(/async\s*\*read/);
    expect(await run(code)).toEqual([3, 7]);
  });

  test.each([
    'super[key()]++',
    '++super[key()]',
    'super[key()] += await Promise.resolve(2)',
    '[super[key()]] = [5]',
  ])('preserves computed super write order: %s', async expression => {
    const source = `const log = []; function key() { log.push('key'); return 'x'; }
      const owner = { __proto__: { get x() { log.push('get'); return 2n; }, set x(v) { log.push(['set', String(v)]); } },
        async read() { const value = ${expression.replace('Promise.resolve(2)', 'Promise.resolve(2n)')}; return [String(value), log]; }
      }; globalThis.result = owner.read();`;
    expect(await run(compile(source, { helpers, transforms: { asyncFunctions: true } }))).toEqual(
      await run(source),
    );
  });
  test.each([false, true])(
    'retains object-key coercion timing through suspension, generator=%s',
    async generator => {
      for (const expression of [
        'super[key] += VALUE',
        'super[key]++',
        '++super[key]',
        '[super[key]] = [VALUE]',
        'super[key] = VALUE',
      ]) {
        const source = `const log = [];
        const key = { [Symbol.toPrimitive]() { log.push('key'); return 'x'; } };
        function rhs() { log.push('rhs'); return 3; }
        const owner = { __proto__: { get x() { log.push('get'); return 2; }, set x(value) { log.push(['set', value]); } },
          async ${generator ? '*' : ''}read() { const result = ${expression.replace('VALUE', generator ? '(yield rhs())' : '(await rhs())')}; return [result, log]; }
        };
        globalThis.result = ${generator ? `(async () => { const it = owner.read(); let step = await it.next(); if (!step.done) step = await it.next(step.value); return step.value; })()` : 'owner.read()'};`;
        expect(
          await run(
            compile(source, {
              helpers,
              transforms: { asyncFunctions: true, asyncGeneratorFunctions: true },
            }),
          ),
        ).toEqual(await run(source));
      }
    },
  );
  test.each([
    '(super.x as number) += await Promise.resolve(3)',
    'super.x!++',
    '++(super.x as number)',
  ])('lowers TypeScript-wrapped super targets: %s', async expression => {
    const source = `const log = []; class B { get x() { return 2; } set x(value) { log.push(value); } }
      class C extends B { async read() { return [${expression}, log]; } }
      globalThis.result = new C().read();`;
    const nativeSource = source.replaceAll(' as number', '').replaceAll('!', '');
    const code = compile(
      source,
      { typescript: 'strip', helpers, transforms: { asyncFunctions: true } },
      'input.ts',
    );
    expect(await run(code)).toEqual(await run(nativeSource));
  });
  test('keeps class initializer new.target separate from the enclosing constructor', async () => {
    const source = `function Factory() {
      return class Inner {
        field = async () => new.target;
        static field = async () => new.target;
        static { this.block = async () => new.target; }
        nested = new (function Nested() { this.read = async () => new.target; })();
      };
    }
    const C = new Factory(); const instance = new C();
    globalThis.result = Promise.all([instance.field(), C.field(), C.block(), instance.nested.read()]).then(values => values.map(value => value?.name));`;
    expect(await run(compile(source, { helpers, transforms: { asyncFunctions: true } }))).toEqual(
      await run(source),
    );
  });

  test('keeps new.target in class computed keys and heritage in the outer environment', async () => {
    const source = `function Factory() {
      const reads = [];
      class Inner extends (reads.push(async () => new.target), Object) {
        [(reads.push(async () => new.target), 'field')] = 1;
        [(reads.push(async () => new.target), 'method')]() {}
        static [(reads.push(async () => new.target), 'staticField')] = 2;
      }
      this.reads = reads;
    }
    globalThis.result = Promise.all(new Factory().reads.map(read => read())).then(values => values.map(value => value === Factory));`;
    expect(await run(compile(source, { helpers, transforms: { asyncFunctions: true } }))).toEqual(
      await run(source),
    );
  });

  test('keeps auto-accessor initializer new.target at its class boundary', async () => {
    const source = `function Factory() { return class Inner {
      accessor field = async () => new.target;
      static accessor field = async () => new.target;
    }; }
    const C = new Factory(); globalThis.result = Promise.all([new C().field(), C.field()]);`;
    // Auto-accessors have no native syntax oracle in Node 22. A second compilation
    // lowers only the remaining class syntax after async conversion has completed.
    const code = compile(source, { helpers, transforms: { asyncFunctions: true } });
    const lowered = compile(code, { helpers, transforms: { classes: true } });
    expect(await run(lowered)).toEqual([undefined, undefined]);
  });
  test('keeps top-level class new.target captures defined', async () => {
    const source = `class C { field = async () => new.target; static field = async () => new.target; static { this.block = async () => new.target; } }
      globalThis.result = Promise.all([new C().field(), C.field(), C.block()]);`;
    expect(await run(compile(source, { helpers, transforms: { asyncFunctions: true } }))).toEqual(
      await run(source),
    );
  });

  test('retains nested class receiver captures inside a derived constructor', async () => {
    const source = `class B {} class C extends B { constructor() {
      class Inner { field = async () => [this, new.target]; static field = async () => [this, new.target]; }
      super(); this.Inner = Inner;
    } }
    const Inner = new C().Inner; const instance = new Inner();
    globalThis.result = Promise.all([instance.field(), Inner.field()]).then(([a,b]) => [a[0] === instance, a[1], b[0] === Inner, b[1]]);`;
    expect(await run(compile(source, { helpers, transforms: { asyncFunctions: true } }))).toEqual(
      await run(source),
    );
  });
});

for (const mode of ['inline', 'runtime'] as const) {
  test.each([
    {
      name: 'unbraced condition',
      body: `if ((arguments = [7], true)) return (async () => arguments[0])();`,
    },
    {
      name: 'braced condition',
      body: `if ((arguments = [7], true)) { return (async () => arguments[0])(); }`,
    },
    {
      name: 'write after arrow creation',
      body: `const later = async () => arguments[0]; arguments = [7]; return later();`,
    },
    {
      name: 'write through converted arrow',
      body: `const write = async () => { arguments = [7]; }; return write().then(() => arguments[0]);`,
    },
  ])(
    `preserves live implicit arguments in async arrows: $name, helpers=${mode}`,
    async ({ body }) => {
      const source = `function read() { ${body} } globalThis.result = read(9);`;
      expect(await run(source)).toBe(7);
      const code = compile(source, {
        helpers: { mode, version: '7.29.7' },
        transforms: { asyncFunctions: true },
      });
      expect(code).not.toContain('async ()');
      expect(await run(code)).toBe(7);
    },
  );
}
