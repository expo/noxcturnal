import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);
const readers = [
  `object => object.#value`,
  `function (object) { return object.#value }`,
  `({ read(object) { return object.#value } }).read`,
  `(class { static read(object) { return object.#value } }).read`,
];

async function run(source: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', source)(context, require);
  return await context.result;
}

for (const mode of ['inline', 'runtime'] as const) {
  for (const reader of readers) {
    test(`suspended class keys capture distinct private tokens: ${reader} (${mode})`, async () => {
      const source = `
        const events = [], pairs = [];
        function* make() {
          for (let value = 1; value <= 2; value++) {
            let read;
            const C = class {
              #value = value;
              [(events.push('before:' + value), read = ${reader}, 'first')]() {}
              [yield 'pause:' + value]() {}
              [(events.push('after:' + value), 'last')]() {}
            };
            pairs.push([C, read]);
          }
        }
        const iterator = make();
        events.push(iterator.next().value);
        events.push(iterator.next('middle').value);
        iterator.next('middle');
        const [[A, readA], [B, readB]] = pairs;
        let cross;
        try { readA(new B()); cross = 'accepted'; } catch (error) { cross = error.name; }
        globalThis.result = [events, readA(new A()), readB(new B()), cross];
      `;
      const expected = [
        ['before:1', 'pause:1', 'after:1', 'before:2', 'pause:2', 'after:2'],
        1,
        2,
        'TypeError',
      ];
      expect(await run(source)).toEqual(expected);
      const code = compile(source, {
        transforms: { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/#value|\bclass\s*\{/);
      expect(await run(code)).toEqual(expected);
    });
  }

  test(`async class keys retain scheduling and concurrent activation identity (${mode})`, async () => {
    const source = `
      globalThis.result = (async () => {
        const events = [];
        async function make(value) {
          let read;
          const C = class {
            #value = value;
            [(read = object => object.#value, events.push('before:' + value), 'first')]() {}
            [await (events.push('await:' + value), Promise.resolve('middle'))]() {}
            [(events.push('after:' + value), 'last')]() {}
          };
          events.push('done:' + value);
          return [C, read];
        }
        const first = make(1), second = make(2);
        Promise.resolve().then(() => events.push('tick'));
        const [[A, readA], [B, readB]] = await Promise.all([first, second]);
        let cross;
        try { readB(new A()); cross = 'accepted'; } catch (error) { cross = error.name; }
        return [events, readA(new A()), readB(new B()), cross];
      })();
    `;
    const expected = await run(source);
    const code = compile(source, {
      transforms: { classes: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(await run(code)).toEqual(expected);
  });
}

for (const mode of ['inline', 'runtime'] as const) {
  test(`suspending object keys preserve method home objects and ordered effects (${mode})`, async () => {
    const source = `
      const events = [];
      function* make() {
        const out = [];
        for (let n = 0; n < 2; n++) {
          let holder;
          const C = class {
            #value = n;
            [(holder = {
              __proto__: { base: 4 },
              ...{ get copied() { events.push('spread:' + n); return n; } },
              read(o) { return super.base + o.#value },
              [yield n]: (events.push('value:' + n), n),
              [{ [Symbol.toPrimitive]() { events.push('coerce:' + n); return 'last'; } }]: 1,
            }, 'key')]() {}
          };
          out.push([C, holder]);
        }
        return [out.map(([C, holder]) => holder.read(new C())), events,
          out.map(([, holder]) => [holder.read.name, holder.copied])];
      }
      const iterator = make();
      events.push('yield:' + iterator.next().value);
      events.push('yield:' + iterator.next('a').value);
      globalThis.result = iterator.next('b').value;
    `;
    const expected = await run(source);
    expect(expected).toEqual([
      [4, 5],
      ['spread:0', 'yield:0', 'value:0', 'coerce:0', 'spread:1', 'yield:1', 'value:1', 'coerce:1'],
      [
        ['read', 0],
        ['read', 1],
      ],
    ]);
    const code = compile(source, {
      transforms: { classes: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(await run(code)).toEqual(expected);
  });
}

for (const mode of ['inline', 'runtime'] as const) {
  for (const suspendedPart of ['key', 'heritage'] as const) {
    test(`nested class ${suspendedPart} suspension retains outer private environment (${mode})`, async () => {
      const nested =
        suspendedPart === 'key'
          ? `class { [yield n]() {} read(object) { return object.#value } }`
          : `class extends (yield n) { read(object) { return object.#value } }`;
      const source = `
        function* make() {
          const pairs = [];
          for (let n = 0; n < 2; n++) {
            let Holder;
            const C = class {
              #value = n;
              [(Holder = ${nested}, 'key')]() {}
            };
            pairs.push([C, Holder]);
          }
          return pairs.map(([C, Holder]) => new Holder().read(new C()));
        }
        const iterator = make();
        iterator.next();
        iterator.next(${suspendedPart === 'key' ? "'a'" : 'Object'});
        globalThis.result = iterator.next(${suspendedPart === 'key' ? "'b'" : 'Object'}).value;
      `;
      expect(await run(source)).toEqual([0, 1]);
      const code = compile(source, {
        transforms: { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/#value|\bclass\s*\{/);
      expect(await run(code)).toEqual([0, 1]);
    });
  }
}

for (const mode of ['inline', 'runtime'] as const) {
  for (const suspension of ['yield', 'await'] as const) {
    for (const location of ['key', 'heritage'] as const) {
      for (const capture of [true, false]) {
        test(`focused private lowering: nested ${suspension}/${location}, capture=${capture} (${mode})`, async () => {
          const suspend =
            suspension === 'yield'
              ? 'yield n'
              : `await Promise.resolve(${location === 'key' ? 'n' : 'Object'})`;
          const nested = `class Nested ${location === 'heritage' ? `extends (${suspend})` : ''} {
            ${location === 'key' ? `[${suspend}]() {}` : ''}
            read(object) { return ${capture ? 'object.#value()' : '7'} }
          }`;
          const body = `
            const pairs = [];
            for (let n = 0; n < 2; n++) {
              let Holder;
              const C = class Outer {
                #value() { return n; }
                [(Holder = ${nested}, 'key')]() {}
              };
              pairs.push([C, Holder]);
            }
            return pairs.map(([C, Holder]) => new Holder().read(new C()));
          `;
          const source =
            suspension === 'yield'
              ? `function* make() { ${body} }
               const iterator = make(); iterator.next();
               iterator.next(${location === 'key' ? "'a'" : 'Object'});
               globalThis.result = iterator.next(${location === 'key' ? "'b'" : 'Object'}).value;`
              : `async function make() { ${body} } globalThis.result = make();`;
          const expected = capture ? [0, 1] : [7, 7];
          expect(await run(source)).toEqual(expected);
          const code = compile(source, {
            transforms: { privateMethods: true },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(code).not.toContain('#value');
          if (capture) expect(code).not.toContain('class Nested');
          else expect(code).toContain('class Nested');
          expect(await run(code)).toEqual(expected);
        });
      }
    }
  }
}
