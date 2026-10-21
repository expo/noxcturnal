import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);

const cases = [
  {
    name: 'async function constructability',
    source: `async function read() {
  return 1;
}
let result;
try {
  new read();
  result = 'constructed';
} catch (error) {
  result = error.name;
}
globalThis.result = [result, Object.hasOwn(read, 'prototype')];`,
    generator: false,
    expected: ['constructed', true],
  },
  {
    name: 'an own then override escapes the lowered async catch',
    source: `const events = [];
const promise = Promise.resolve(3);
promise.then = () => {
  events.push('then');
  throw new Error('override');
};
async function read() {
  try {
    return [await promise, events];
  } catch (error) {
    return [error.message, events];
  }
}
globalThis.result = read().then(
  (value) => value,
  (error) => ['outer:' + error.message, events],
);`,
    generator: false,
    expected: ['outer:override', ['then']],
  },
  {
    name: 'lowered async generator methods reject invalid receivers synchronously',
    source: `async function* values() {
  yield 1;
}
globalThis.result = (async () => {
  const events = [];
  const iterator = values();
  for (const method of ['next', 'return', 'throw']) {
    try {
      const promise = iterator[method].call({});
      events.push(method + ':returned');
      try {
        await promise;
      } catch (error) {
        events.push(error.name);
      }
    } catch (error) {
      events.push(method + ':sync:' + error.name);
    }
  }
  return events;
})();`,
    generator: true,
    expected: ['next:sync:TypeError', 'return:sync:TypeError', 'throw:sync:TypeError'],
  },
  {
    name: 'async generator public dispatch',
    source: `async function* values() {
  yield 1;
}
globalThis.result = (async () => {
  const events = [];
  const fake = {
    _invoke() {
      events.push('fake');
      return Promise.resolve({ done: true, value: 9 });
    },
  };
  try {
    await values().next.call(fake);
    events.push('accepted');
  } catch (error) {
    events.push(error.name);
  }
  return events;
})();`,
    generator: true,
    expected: ['fake', 'accepted'],
  },
  {
    name: 'async generator prototype representation',
    source: `async function* values() {
  yield 1;
}
globalThis.result = Object.getPrototypeOf(values()) === values.prototype;`,
    generator: true,
    expected: false,
  },
  {
    name: 'async delegation repeated next lookup',
    source: `const events = [];
let index = 0;
const source = {
  [Symbol.asyncIterator]() {
    return {
      get next() {
        events.push('get');
        return async () => ({ value: ++index, done: index > 1 });
      },
    };
  },
};
async function* values() {
  yield* source;
}
globalThis.result = (async () => {
  const iterator = values();
  const first = await iterator.next();
  const last = await iterator.next();
  return [first.value, last.done, events];
})();`,
    generator: true,
    expected: [1, true, ['get', 'get']],
  },
  {
    name: 'async delegation defers throw and return lookup',
    source: `const events = [];
const source = {
  [Symbol.asyncIterator]() {
    return {
      next() {
        return Promise.resolve({ value: 1, done: true });
      },
      get throw() {
        events.push('throw');
        return undefined;
      },
      get return() {
        events.push('return');
        return undefined;
      },
    };
  },
};
async function* values() {
  yield* source;
}
globalThis.result = values()
  .next()
  .then(() => events);`,
    generator: true,
    expected: ['throw', 'return'],
  },
  {
    name: 'async delegation reads done once for yielded result',
    source: `const events = [];
const source = {
  [Symbol.asyncIterator]() {
    return {
      next() {
        return Promise.resolve({
          get done() {
            events.push('done');
            return false;
          },
          get value() {
            events.push('value');
            return 3;
          },
        });
      },
    };
  },
};
async function* values() {
  yield* source;
}
globalThis.result = values()
  .next()
  .then((result) => [result.value, result.done, events]);`,
    generator: true,
    expected: [3, false, ['done', 'done', 'value']],
  },
  {
    name: 'async delegation reads done once for completed result',
    source: `const events = [];
const source = {
  [Symbol.asyncIterator]() {
    return {
      next() {
        return Promise.resolve({
          get done() {
            events.push('done');
            return true;
          },
          get value() {
            events.push('value');
            return 3;
          },
        });
      },
    };
  },
};
async function* values() {
  return yield* source;
}
globalThis.result = values()
  .next()
  .then((result) => [result.value, result.done, events]);`,
    generator: true,
    expected: [3, true, ['done', 'done', 'value']],
  },
  {
    name: 'async delegation closes when throw method missing',
    source: `const events = [];
const source = {
  [Symbol.asyncIterator]() {
    return {
      next() {
        return Promise.resolve({ value: 1, done: false });
      },
      return() {
        events.push('return');
        return Promise.resolve({ done: true });
      },
    };
  },
};
async function* values() {
  yield* source;
}
globalThis.result = (async () => {
  const iterator = values();
  await iterator.next();
  try {
    await iterator.throw(new Error('injected'));
  } catch (error) {
    events.push(error.name);
  }
  return events;
})();`,
    generator: true,
    expected: ['return', 'TypeError'],
  },
];

async function observe(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  expect(Object.hasOwn(context, 'result'), 'fixture must assign its observation').toBe(true);
  return await context.result;
}

describe.each(cases)('$name', entry => {
  test.each(['inline', 'runtime'] as const)('%s async helper behavior', async mode => {
    const code = compile(entry.source, {
      transforms: entry.generator ? { asyncGeneratorFunctions: true } : { asyncFunctions: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toMatch(entry.generator ? /async\s+function\s*\*/ : /async\s+function/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    else expect(code).not.toContain('require(');
    expect(await observe(code)).toEqual(entry.expected);
  });
});

test.each(['inline', 'runtime'] as const)(
  '%s async arrows retain constructor new.target',
  async mode => {
    const source = `
  function A() {
    this.read = async () => { await 0; return new.target === A; };
  }
  globalThis.result = new A().read();
`;
    const code = compile(source, {
      transforms: { asyncFunctions: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s*\(/);
    expect(await observe(code)).toBe(true);
  },
);
