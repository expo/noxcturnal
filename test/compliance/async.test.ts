import { spawnSync } from 'node:child_process';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, execute } from './runtime';

test('async functions preserve await, rejection, this, and finally', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const receiver = {
        value: 4,
        async read(input) {
          const log = [];
          try {
            log.push(await input);
            throw new Error('expected');
          } catch (error) {
            log.push(error.message, this.value);
          } finally {
            log.push('finally');
          }
          return log;
        },
      };
      globalThis.result = receiver.read(Promise.resolve(2));
    `,
    { transforms: { asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([2, 'expected', 4, 'finally']);
});

test('async generators preserve await, yield, delegation, and return values', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      async function* nested() { yield await Promise.resolve(2); return 3; }
      async function* values() {
        yield 1;
        const returned = yield* nested();
        yield returned;
      }
      globalThis.result = (async () => {
        const output = [];
        for await (const value of values()) output.push(value);
        return output;
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([1, 2, 3]);
});

test('for-await awaits values and closes the iterator after break', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          let value = 0;
          return {
            next() { calls.push('next'); return { value: Promise.resolve(++value), done: false }; },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      globalThis.result = (async () => {
        for await (const value of iterable) { calls.push(value); break; }
        return calls;
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['next', 1, 'return']);
});

test('await-using disposes resources after completion and before rejection escapes', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      globalThis.result = (async () => {
        try {
          await using resource = {
            async [Symbol.asyncDispose]() { calls.push('dispose'); },
          };
          calls.push('body');
          throw new Error('failure');
        } catch (error) {
          calls.push(error.message);
        }
        return calls;
      })();
    `,
    { transforms: { explicitResourceManagement: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['body', 'dispose', 'failure']);
});

test('await using reads asyncDispose once, preserves its receiver, and awaits completion', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      const resource = {
        value: 42,
        get [Symbol.asyncDispose]() {
          calls.push('get');
          return async function () {
            calls.push(['start', this === resource, this.value]);
            await Promise.resolve();
            calls.push('finish');
          };
        },
      };
      globalThis.result = (async () => {
        { await using value = resource; calls.push(value === resource); }
        calls.push('after');
        return calls;
      })();
    `,
    { transforms: { explicitResourceManagement: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([
    'get',
    true,
    ['start', true, 42],
    'finish',
    'after',
  ]);
});

test('async arrows preserve lexical this and arguments across await', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      function make(prefix) {
        return async (value = this.value) => [prefix, await value, arguments[0], this.value];
      }
      const read = make.call({ value: Promise.resolve(4) }, 'prefix');
      globalThis.result = read.call({ value: 99 });
    `,
    { transforms: { parameters: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['prefix', 4, 'prefix', expect.any(Promise)]);
  expect(await (await result.result)[3]).toBe(4);
});

test('separate async invocations do not share arguments or generator state', async () => {
  const result = execute<{ result: Promise<number[]> }>(
    `
      async function read(value) {
        await Promise.resolve();
        return value;
      }
      globalThis.result = Promise.all([read(1), read(2), read(3)]);
    `,
    { transforms: { asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([1, 2, 3]);
});

test('async functions assimilate thenables with specified suspension ordering', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const log = [];
      const thenable = {
        get then() {
          log.push('get:then');
          return resolve => { log.push('call:then'); resolve(42); };
        },
      };
      async function read() {
        log.push('start');
        const value = await thenable;
        log.push('after:await');
        return value;
      }
      const promise = read();
      log.push('after:call');
      globalThis.result = promise.then(value => [value, log]);
    `,
    { transforms: { asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([
    42,
    ['start', 'get:then', 'after:call', 'call:then', 'after:await'],
  ]);
});

test('async functions convert synchronous throws to rejection and adopt without reusing promises', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const original = Promise.resolve(42);
      async function adopt() { return original; }
      async function fail() { throw new Error('failure'); }
      let synchronousThrow = false;
      let failed;
      try { failed = fail(); } catch { synchronousThrow = true; }
      const adopted = adopt();
      globalThis.result = Promise.all([
        adopted,
        failed.catch(error => error.message),
      ]).then(([value, message]) => [value, message, synchronousThrow, adopted !== original]);
    `,
    { transforms: { asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([42, 'failure', false, true]);
});

test('async function forms preserve Babel names, lengths, and constructability', () => {
  const result = execute<{ result: unknown[] }>(
    `
      async function declared(a, b = 1, c) {}
      const inferred = async function (a, b) {};
      const object = { async read(a) {} };
      const arrow = async (a, b = 1) => a;
      const functions = [declared, inferred, object.read, arrow];
      const constructErrors = functions.map(value => {
        try { Reflect.construct(value, []); return false; }
        catch (error) { return error instanceof TypeError; }
      });
      globalThis.result = [
        functions.map(value => [value.name, value.length]),
        constructErrors,
      ];
    `,
    { transforms: { asyncFunctions: true } },
  );
  expect(result.result).toEqual([
    [
      ['declared', 1],
      ['inferred', 2],
      ['read', 1],
      ['arrow', 1],
    ],
    [false, false, true, false],
  ]);
});

test('async generators accept thrown errors and run finally blocks on return', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const log = [];
      async function* values() {
        try {
          try { yield 1; } catch (error) { log.push(error.message); yield 2; }
          yield 3;
        } finally {
          log.push('finally');
        }
      }
      globalThis.result = (async () => {
        const iterator = values();
        const first = await iterator.next();
        const second = await iterator.throw(new Error('injected'));
        const returned = await iterator.return(9);
        return [first.value, second.value, returned.value, returned.done, log];
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([1, 2, 9, true, ['injected', 'finally']]);
});

test('async generators serialize queued requests and await yielded values', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      async function* values() {
        try {
          calls.push('start');
          const sent = yield Promise.resolve(1);
          calls.push(['sent', sent]);
          yield await Promise.resolve(sent * 2);
          return 9;
        } finally {
          calls.push('finally');
        }
      }
      globalThis.result = (async () => {
        const iterator = values();
        const first = iterator.next();
        const second = iterator.next(3);
        const returned = iterator.return(7);
        const results = await Promise.all([first, second, returned]);
        return [results.map(result => [result.value, result.done]), calls];
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([
    [
      [1, false],
      [6, false],
      [7, true],
    ],
    ['start', ['sent', 3], 'finally'],
  ]);
});

test('for-await closes a synchronous iterator when an awaited value rejects', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() { calls.push('next'); return { value: Promise.reject(new Error('failure')), done: false }; },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      globalThis.result = (async () => {
        try { for await (const value of iterable) void value; }
        catch (error) { calls.push(error.message); }
        return calls;
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['next', 'failure']);
});

test('for-await validates async iterator next and return results', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const inspect = async kind => {
        const calls = [];
        const iterable = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                calls.push('next');
                return Promise.resolve(kind === 'next' ? 1 : { value: 1, done: false });
              },
              return() { calls.push('return'); return Promise.resolve(1); },
            };
          },
        };
        let errorName;
        try { for await (const value of iterable) { calls.push(value); break; } }
        catch (error) { errorName = error.name; }
        return [errorName, calls];
      };
      globalThis.result = Promise.all([inspect('next'), inspect('return')]);
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([
    ['TypeError', ['next']],
    ['TypeError', ['next', 1, 'return']],
  ]);
});

// Compile separately so expected failures only cover observable execution.
const additionalComplianceCases = [
  {
    name: 'for await ignores iterator acquisition methods own call properties',
    source: `
      globalThis.result = (async () => {
        const output = [];
        for (const symbol of [Symbol.asyncIterator, Symbol.iterator]) {
          function acquire() { return [1][Symbol.iterator](); }
          acquire.call = () => [2][Symbol.iterator]();
          const source = { [symbol]: acquire };
          for await (const value of source) output.push(value);
        }
        return output;
      })();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [1, 1],
    knownFailure: true,
  },
  {
    name: 'for await rejects noncallable async iterator hooks with call properties',
    source: `
      globalThis.result = (async () => {
        try {
          const source = {
            [Symbol.asyncIterator]: { call() { return [1][Symbol.iterator](); } },
          };
          for await (const value of source) {}
          return 'accepted';
        } catch (error) { return error.name; }
      })();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'for-await captures the next method once',
    source: `
      globalThis.result = (async () => {
        const events = [];
        let i = 0;
        const iterable = {
          [Symbol.asyncIterator]() {
            return {
              get next() {
                events.push('get');
                return async () => ({ value: ++i, done: i > 2 });
              },
            };
          },
        };
        const values = [];
        for await (const value of iterable) values.push(value);
        return [events, values];
      })();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
    expected: [['get'], [1, 2]],
    knownFailure: true,
  },
  {
    name: 'for-await reads the return method once when closing',
    source: `
      globalThis.result = (async () => {
        const events = [];
        const iterable = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return Promise.resolve({ value: 1, done: false });
              },
              get return() {
                events.push('get');
                return async function () {
                  events.push('call');
                  return {};
                };
              },
            };
          },
        };
        for await (const value of iterable) break;
        return events;
      })();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
    expected: ['get', 'call'],
    knownFailure: true,
  },
  {
    name: 'async default errors reject without synchronous throw',
    source: `
 const events=[];
 async function read(value=(()=>{throw new Error('default');})()) { return value; }
 let promise;
 try { promise=read(); events.push('returned'); } catch(error) { events.push('throw:'+error.message); }
 globalThis.result=Promise.resolve(promise).then(()=>events,error=>{events.push('reject:'+error.message);return events;});
    `,
    plan: { transforms: { asyncFunctions: true } },
    expected: ['returned', 'reject:default'],
    knownFailure: false,
  },
  {
    name: 'async generator defaults run at call time',
    source: `
 const events=[];
 async function* values(value=(events.push('default'),1)) { events.push('body'); yield value; }
 const iterator=values();events.push('called');
 globalThis.result=iterator.next().then(result=>[result.value,events]);
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [1, ['default', 'called', 'body']],
    knownFailure: false,
  },
  {
    name: 'async functions remain nonconstructable',
    source: `
 async function read() { return 1; }
 let result;
 try { new read(); result='constructed'; } catch(error) { result=error.name; }
 globalThis.result=[result,Object.hasOwn(read,'prototype')];
    `,
    plan: { transforms: { asyncFunctions: true } },
    expected: ['TypeError', false],
    knownFailure: true,
  },
  {
    name: 'async delegation captures next once',
    source: `
 const events=[];let index=0;
 const source={ [Symbol.asyncIterator](){return{ get next(){events.push('get');return async()=>({value:++index,done:index>1});} };} };
 async function* values(){yield* source;}
 globalThis.result=(async()=>{const iterator=values();const first=await iterator.next();const last=await iterator.next();return[first.value,last.done,events];})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [1, true, ['get']],
    knownFailure: true,
  },
  {
    name: 'async delegation closes when throw method missing',
    source: `
 const events=[];
 const source={ [Symbol.asyncIterator](){return{next(){return Promise.resolve({value:1,done:false});},return(){events.push('return');return Promise.resolve({done:true});}};} };
 async function* values(){yield* source;}
 globalThis.result=(async()=>{const iterator=values();await iterator.next();try{await iterator.throw(new Error('injected'));}catch(error){events.push(error.name);}return events;})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: ['return', 'TypeError'],
    knownFailure: false,
  },
  {
    name: 'await ignores overridden then on a native promise',
    source: `
 const events=[];
 const promise=Promise.resolve(3);
 promise.then=()=>{events.push('then');throw new Error('override');};
 async function read(){try{return [await promise,events];}catch(error){return [error.message,events];}}
 globalThis.result=read().then(value=>value,error=>['outer:'+error.message,events]);
    `,
    plan: { transforms: { asyncFunctions: true } },
    expected: [3, []],
    knownFailure: true,
  },
  {
    name: 'async delegation defers throw and return lookup',
    source: `
 const events=[];
 const source={ [Symbol.asyncIterator](){return{
   next(){return Promise.resolve({value:1,done:true});},
   get throw(){events.push('throw');return undefined;},
   get return(){events.push('return');return undefined;}
 };} };
 async function* values(){yield* source;}
 globalThis.result=values().next().then(()=>events);
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [],
    knownFailure: true,
  },
  {
    name: 'async delegation forwards throw to synchronous iterator',
    source: `
 const events=[];
 const source={ [Symbol.iterator](){return{
   next(){return {value:1,done:false};},
   throw(error){events.push('throw:'+error.message);return {value:2,done:false};},
   return(){events.push('return');return {value:3,done:true};}
 };} };
 async function* values(){yield* source;}
 globalThis.result=(async()=>{const iterator=values();await iterator.next();const result=await iterator.throw(new Error('injected'));return[result.value,result.done,events];})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [2, false, ['throw:injected']],
    knownFailure: true,
  },
  {
    name: 'for-await treats null synchronous return as absent',
    source: `
 const source={[Symbol.iterator](){return{next(){return{value:1,done:false};},return:null};}};
 globalThis.result=(async()=>{try{for await(const value of source)break;return 'complete';}catch(error){return error.name;}})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: 'complete',
    knownFailure: true,
  },
  {
    name: 'for-await does not close after async value getter throws',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({done:false,get value(){events.push('get:value');throw new Error('value');}});},return(){events.push('return');return Promise.resolve({done:true});}};}};
 globalThis.result=(async()=>{try{for await(const value of source)void value;}catch(error){events.push(error.message);}return events;})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: ['get:value', 'value'],
    knownFailure: true,
  },
  {
    name: 'for-await does not close after async done getter throws',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({get done(){events.push('get:done');throw new Error('done');}});},return(){events.push('return');return Promise.resolve({done:true});}};}};
 globalThis.result=(async()=>{try{for await(const value of source)void value;}catch(error){events.push(error.message);}return events;})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: ['get:done', 'done'],
    knownFailure: false,
  },
  {
    name: 'for-await preserves body throw over rejected async return',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({done:false,value:1});},return(){events.push('return');return Promise.reject(new Error('close'));}};}};
 globalThis.result=(async()=>{try{for await(const value of source)throw new Error('body');}catch(error){events.push(error.message);}return events;})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: ['return', 'body'],
    knownFailure: false,
  },
  {
    name: 'async-from-sync next receives no argument in for-await',
    source: `
 const events=[];const source={[Symbol.iterator](){return{next(){events.push(arguments.length);return{done:true};}};}};
 globalThis.result=(async()=>{for await(const value of source)void value;return events;})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [0],
    knownFailure: false,
  },
  {
    name: 'async delegation awaits synchronous final value',
    source: `
 const source={[Symbol.iterator](){return{next(){return{value:Promise.resolve(3),done:true};}};}};
 async function* values(){return yield* source;}
 globalThis.result=values().next();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: { value: 3, done: true },
    knownFailure: false,
  },
  {
    name: 'async delegation reads done once for yielded result',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({get done(){events.push('done');return false;},get value(){events.push('value');return 3;}});}};}};
 async function* values(){yield* source;}
 globalThis.result=values().next().then(result=>[result.value,result.done,events]);
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [3, false, ['done', 'value']],
    knownFailure: true,
  },
  {
    name: 'async delegation reads done once for completed result',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({get done(){events.push('done');return true;},get value(){events.push('value');return 3;}});}};}};
 async function* values(){return yield* source;}
 globalThis.result=values().next().then(result=>[result.value,result.done,events]);
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [3, true, ['done', 'value']],
    knownFailure: true,
  },
  {
    name: 'async default parameter errors reject returned promises',
    source: `
 function fail(){throw new Error('default');}async function read(value=fail()){return value;}
 globalThis.result=(async()=>{const events=[];try{const promise=read();events.push('returned');try{await promise;}catch(error){events.push(error.message);}}catch(error){events.push('sync',error.message);}return events;})();
    `,
    plan: { transforms: { asyncFunctions: true } },
    expected: ['returned', 'default'],
    knownFailure: false,
  },
  {
    name: 'async destructured parameter errors reject returned promises',
    source: `
 async function read({value}){return value;}
 globalThis.result=(async()=>{const events=[];try{const promise=read(null);events.push('returned');try{await promise;}catch(error){events.push(error.name);}}catch(error){events.push('sync',error.name);}return events;})();
    `,
    plan: { transforms: { asyncFunctions: true } },
    expected: ['returned', 'TypeError'],
    knownFailure: false,
  },
  {
    name: 'async parameter initialization runs before returning promise',
    source: `
 const events=[];async function read(value=events.push('default')){events.push('body');}
 const promise=read();events.push('returned');globalThis.result=promise.then(()=>events);
    `,
    plan: { transforms: { asyncFunctions: true } },
    expected: ['default', 'body', 'returned'],
    knownFailure: false,
  },
  {
    name: 'async functions ignore lexical Promise bindings',
    source: `
 const Promise=null;async function read(){return 1;}
 try{globalThis.result=read().then(value=>value);}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { asyncFunctions: true } },
    expected: 1,
    knownFailure: true,
  },
  {
    name: 'async functions ignore lexical undefined bindings when returning',
    source: `
 const undefined=99;async function read(){}
 globalThis.result=read().then(value=>value===void 0);
    `,
    plan: { transforms: { asyncFunctions: true } },
    expected: true,
    knownFailure: false,
  },
  {
    name: 'async generators ignore lexical Promise bindings',
    source: `
 const Promise=null;async function* read(){yield 1;}
 try{globalThis.result=read().next().then(result=>result.value);}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: 1,
    knownFailure: true,
  },
  {
    name: 'async generator methods reject invalid receivers through promises',
    source: `
 async function* values(){yield 1;}
 globalThis.result=(async()=>{const events=[];const iterator=values();for(const method of ['next','return','throw']){try{const promise=iterator[method].call({});events.push(method+':returned');try{await promise;}catch(error){events.push(error.name);}}catch(error){events.push(method+':sync:'+error.name);}}return events;})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [
      'next:returned',
      'TypeError',
      'return:returned',
      'TypeError',
      'throw:returned',
      'TypeError',
    ],
    knownFailure: true,
  },
  {
    name: 'async generator methods reject objects spoofing invoke',
    source: `
 async function* values(){yield 1;}
 globalThis.result=(async()=>{const events=[];const fake={_invoke(){events.push('fake');return Promise.resolve({done:true,value:9});}};try{await values().next.call(fake);events.push('accepted');}catch(error){events.push(error.name);}return events;})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: ['TypeError'],
    knownFailure: true,
  },
  {
    name: 'async generator instances inherit from the function prototype',
    source: `
 async function* values(){yield 1;}globalThis.result=Object.getPrototypeOf(values())===values.prototype;
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: true,
    knownFailure: true,
  },
  {
    name: 'async generator next can be borrowed between valid generators',
    source: `
 async function* first(){yield 1;}async function* second(){yield 2;}
 globalThis.result=first().next.call(second()).then(result=>result.value);
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: 2,
    knownFailure: false,
  },
  {
    name: 'async generator async iterator method remains generic',
    source: `
 async function* values(){yield 1;}const receiver={};globalThis.result=values()[Symbol.asyncIterator].call(receiver)===receiver;
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: true,
    knownFailure: false,
  },
  {
    name: 'async generator return awaits its value before executing finally',
    source: `
 const events=[];async function* values(){try{yield 1;}finally{events.push('finally');}}
 globalThis.result=(async()=>{const iterator=values();await iterator.next();const value={then(resolve){events.push('then');resolve(2);}};const result=await iterator.return(value);return [events,result];})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [['then', 'finally'], { value: 2, done: true }],
    knownFailure: true,
  },
  {
    name: 'async generator return rejection reaches the suspended yield catch',
    source: `
 const events=[];async function* values(){try{yield 1;}catch(error){events.push(error.message);return 3;}finally{events.push('finally');}}
 globalThis.result=(async()=>{const iterator=values();await iterator.next();const value={then(resolve,reject){events.push('then');reject(new Error('rejected'));}};try{const result=await iterator.return(value);return [events,result];}catch(error){return [events,error.message];}})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [['then', 'rejected', 'finally'], { value: 3, done: true }],
    knownFailure: true,
  },
  {
    name: 'completed async generators await return values',
    source: `
 async function* values(){}
 globalThis.result=(async()=>{const iterator=values();await iterator.next();return iterator.return(Promise.resolve(2));})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: { value: 2, done: true },
    knownFailure: false,
  },
  {
    name: 'async generator return can yield from finally before completion',
    source: `
 async function* values(){try{yield 1;}finally{yield 3;}}
 globalThis.result=(async()=>{const iterator=values();await iterator.next();const first=await iterator.return(Promise.resolve(2));const second=await iterator.next();return [first,second];})();
    `,
    plan: { transforms: { asyncGeneratorFunctions: true } },
    expected: [
      { value: 3, done: false },
      { value: 2, done: true },
    ],
    knownFailure: false,
  },
];

describe.each(additionalComplianceCases)('$name', ({ source, plan, expected, knownFailure }) => {
  let code: string;
  beforeAll(() => {
    code = compile(source, plan);
  });
  const run = async (input: string) => {
    const context: Record<string, unknown> = {};
    new Function('globalThis', input)(context);
    return await context.result;
  };
  test('native execution', async () => {
    expect(await run(source)).toEqual(expected);
  });
  const transformedTest = knownFailure ? test.fails : test;
  transformedTest('transformed execution', async () => {
    expect(await run(code)).toEqual(expected);
  });
});

// Isolate helper-generated unhandled rejections from the Vitest process.
function observeDelegationCompletion(source: string): unknown {
  const script = `
    const context = {};
    let status = 'pending', value;
    const unhandled = [];
    process.on('unhandledRejection', error => unhandled.push(error.name));
    new Function('globalThis', ${JSON.stringify(source)})(context);
    Promise.resolve(context.result).then(
      result => { status = 'settled'; value = result; },
      error => { status = 'rejected'; value = error.name; },
    );
    setImmediate(() => process.stdout.write(JSON.stringify({ status, value, unhandled })));
  `;
  const child = spawnSync(process.execPath, [], {
    input: script,
    encoding: 'utf8',
    timeout: 3000,
  });
  expect(child.error).toBeUndefined();
  expect(child.status, child.stderr).toBe(0);
  return JSON.parse(child.stdout);
}

const invalidDelegationResults = [
  {
    name: 'async delegation validates return before reading done',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({value:1,done:false});},return(){return Promise.resolve(1);}};}};
 async function* values(){yield* source;}
 globalThis.result=(async()=>{const iterator=values();await iterator.next();try{await iterator.return(3);}catch(error){events.push(error.name);}return events;})();
    `,
    expected: ['TypeError'],
  },
  {
    name: 'async delegation rejects primitive next result',
    source: `
 const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve(1);}};}};
 async function* values(){yield* source;}
 globalThis.result=(async()=>{try{await values().next();return 'accepted';}catch(error){return error.name;}})();
    `,
    expected: 'TypeError',
  },
];
describe.each(invalidDelegationResults)('$name', ({ source, expected }) => {
  let native: unknown;
  let transformed: unknown;
  beforeAll(() => {
    const code = compile(source, { transforms: { asyncGeneratorFunctions: true } });
    native = observeDelegationCompletion(source);
    transformed = observeDelegationCompletion(code);
  });
  const outcome = { status: 'settled', value: expected, unhandled: [] };
  test('native execution rejects through the consumer promise', () => {
    expect(native).toEqual(outcome);
  });
  test.fails('transformed execution rejects through the consumer promise', () => {
    expect(transformed).toEqual(outcome);
  });
});
