// Generated from apps/test-suite/tests/JSBlockScoping.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { transformOutcome } from '../transform';

test('001 JS Block Scoping > basic block scoping > nested let declarations create independent scopes', async () => {
  const source =
    '() => {\n        let x = 1;\n        {\n          let x = 2;\n          expect(x).toBe(2);\n          {\n            let x = 3;\n            expect(x).toBe(3);\n            x++;\n            expect(x).toBe(4);\n          }\n        }\n        expect(x).toBe(1);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x = 1;
      {
        var _x = 2;
        expect(_x).toBe(2);
        {
          var _x2 = 3;
          expect(_x2).toBe(3);
          _x2++;
          expect(_x2).toBe(4);
        }
      }
      expect(x).toBe(1);
    };"
  `);
});

test('002 JS Block Scoping > basic block scoping > closures in nested blocks capture correct binding', async () => {
  const source =
    '() => {\n        expect(\n          (() => {\n            let sum = 0;\n            let a = 0;\n            {\n              let a = 10;\n              for (let i = 0; i < a; i++) {\n                let a = 1;\n                sum += (() => a)();\n              }\n            }\n            return sum;\n          })()\n        ).toBe(10);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      expect(
        (() => {
          var sum = 0;
          var a = 0;
          {
            var _a = 10;
            var _loopResult;
            var _loop = i => {
              var _a2 = 1;
              sum += (() => _a2)();
              return {
                type: 'normal',
                vars: [i],
              };
            };
            for (var i = 0; i < _a; i++) {
              _loopResult = _loop(i);
              i = _loopResult.vars[0];
            }
          }
          return sum;
        })(),
      ).toBe(10);
    };"
  `);
});

test('003 JS Block Scoping > basic block scoping > inner scope shadows outer function scope', async () => {
  const source =
    "() => {\n        function test() {\n          let value = 'outer';\n          return (function () {\n            let value = 'inner';\n            return value;\n          })();\n        }\n        expect(test()).toBe('inner');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      function test() {
        var value = 'outer';
        return (function () {
          var _value = 'inner';
          return _value;
        })();
      }
      expect(test()).toBe('inner');
    };"
  `);
});

test('004 JS Block Scoping > basic block scoping > let in loop body shadows outer let', async () => {
  const source =
    '() => {\n        let x = 0;\n        for (;;) {\n          let x = 1;\n          expect(x).toBe(1);\n          break;\n        }\n        expect(x).toBe(0);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x = 0;
      for (;;) {
        var _x = 1;
        expect(_x).toBe(1);
        break;
      }
      expect(x).toBe(0);
    };"
  `);
});

test('005 JS Block Scoping > basic block scoping > const in block is not visible outside', async () => {
  const source =
    "() => {\n        {\n          const a = 1;\n          expect(a).toBe(1);\n        }\n        expect(typeof a).toBe('undefined');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      {
        var _a = 1;
        expect(_a).toBe(1);
      }
      expect(typeof a).toBe('undefined');
    };"
  `);
});

test('006 JS Block Scoping > basic block scoping > let in block is not visible outside', async () => {
  const source =
    "() => {\n        {\n          let b = 2;\n          expect(b).toBe(2);\n        }\n        expect(typeof b).toBe('undefined');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      {
        var _b = 2;
        expect(_b).toBe(2);
      }
      expect(typeof b).toBe('undefined');
    };"
  `);
});

test('007 JS Block Scoping > basic block scoping > if-block scoping', async () => {
  const source =
    "() => {\n        let x = 'outer';\n        if (true) {\n          let x = 'inner';\n          expect(x).toBe('inner');\n        }\n        expect(x).toBe('outer');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x = 'outer';
      if (true) {
        var _x = 'inner';
        expect(_x).toBe('inner');
      }
      expect(x).toBe('outer');
    };"
  `);
});

test('008 JS Block Scoping > for loop scoping > let in for-loop head does not leak', async () => {
  const source =
    '() => {\n        expect(\n          (function () {\n            let a = 1;\n            for (let a = 0; a < 8; a++) {}\n            return a;\n          })()\n        ).toBe(1);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      expect(
        (function () {
          var a = 1;
          for (var _a = 0; _a < 8; _a++) {}
          return a;
        })(),
      ).toBe(1);
    };"
  `);
});

test('009 JS Block Scoping > for loop scoping > multiple let declarations in for-loop head do not leak', async () => {
  const source =
    "() => {\n        for (let i = 0, x = 2; i < 5; i++);\n        expect(typeof i).toBe('undefined');\n        expect(typeof x).toBe('undefined');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      for (var _i = 0, _x = 2; _i < 5; _i++);
      expect(typeof i).toBe('undefined');
      expect(typeof x).toBe('undefined');
    };"
  `);
});

test('010 JS Block Scoping > for loop scoping > closures capture per-iteration let binding in for loop', async () => {
  const source =
    '() => {\n        var fns = [];\n        for (let i = 0; i < 10; i++) {\n          fns.push(function () {\n            return i;\n          });\n          i += 1;\n        }\n        expect(fns[0]()).toBe(1);\n        expect(fns[1]()).toBe(3);\n        expect(fns[2]()).toBe(5);\n        expect(fns[3]()).toBe(7);\n        expect(fns[4]()).toBe(9);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var fns = [];
      var _loopResult;
      var _loop = i => {
        fns.push(function () {
          return i;
        });
        i += 1;
        return {
          type: 'normal',
          vars: [i],
        };
      };
      for (var i = 0; i < 10; i++) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
      }
      expect(fns[0]()).toBe(1);
      expect(fns[1]()).toBe(3);
      expect(fns[2]()).toBe(5);
      expect(fns[3]()).toBe(7);
      expect(fns[4]()).toBe(9);
    };"
  `);
});

test('011 JS Block Scoping > for loop scoping > closures with splice and index mutation in for loop', async () => {
  const source =
    '() => {\n        let data = [true, false, false, true, false];\n        for (let index = 0; index < data.length; index++) {\n          let item = data[index];\n          if (!item) {\n            data.splice(index, 1);\n            index--;\n            continue;\n          }\n          let fn = function () {\n            item;\n          };\n        }\n        expect(data.every((item) => item)).toBe(true);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var data = [true, false, false, true, false];
      var _loopResult;
      var _loop = index => {
        var item = data[index];
        if (!item) {
          data.splice(index, 1);
          index--;
          return {
            type: 'continue',
            vars: [index],
          };
        }
        var fn = function () {
          item;
        };
        return {
          type: 'normal',
          vars: [index],
        };
      };
      for (var index = 0; index < data.length; index++) {
        _loopResult = _loop(index);
        index = _loopResult.vars[0];
        if (_loopResult.type === 'continue') continue;
      }
      expect(data.every(item => item)).toBe(true);
    };"
  `);
});

test('012 JS Block Scoping > for loop scoping > each for-loop iteration gets its own let binding', async () => {
  const source =
    '() => {\n        var funcs = [];\n        for (let i = 0; i < 5; i++) {\n          funcs.push(() => i);\n        }\n        expect(funcs[0]()).toBe(0);\n        expect(funcs[1]()).toBe(1);\n        expect(funcs[2]()).toBe(2);\n        expect(funcs[3]()).toBe(3);\n        expect(funcs[4]()).toBe(4);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var funcs = [];
      var _loopResult;
      var _loop = i => {
        funcs.push(() => i);
        return {
          type: 'normal',
          vars: [i],
        };
      };
      for (var i = 0; i < 5; i++) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
      }
      expect(funcs[0]()).toBe(0);
      expect(funcs[1]()).toBe(1);
      expect(funcs[2]()).toBe(2);
      expect(funcs[3]()).toBe(3);
      expect(funcs[4]()).toBe(4);
    };"
  `);
});

test('013 JS Block Scoping > for loop scoping > const in for-of creates per-iteration binding', async () => {
  const source =
    '() => {\n        var funcs = [];\n        for (const val of [10, 20, 30]) {\n          funcs.push(() => val);\n        }\n        expect(funcs[0]()).toBe(10);\n        expect(funcs[1]()).toBe(20);\n        expect(funcs[2]()).toBe(30);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var funcs = [];
      var _loopResult;
      var _loop = val => {
        funcs.push(() => val);
        return {
          type: 'normal',
          vars: [val],
        };
      };
      for (var val of [10, 20, 30]) {
        _loopResult = _loop(val);
        val = _loopResult.vars[0];
      }
      expect(funcs[0]()).toBe(10);
      expect(funcs[1]()).toBe(20);
      expect(funcs[2]()).toBe(30);
    };"
  `);
});

test('014 JS Block Scoping > for loop scoping > const in for-in creates per-iteration binding (hermes#575)', async () => {
  const source =
    "() => {\n        const target = {\n          a: 'a',\n          b: 'b',\n          c: 'c',\n        };\n        const copy = {};\n        let keys = '';\n        for (const prop in target) {\n          keys += ' ' + prop;\n          Object.defineProperty(copy, prop, {\n            get: () => target[prop],\n            enumerable: true,\n          });\n        }\n        expect(copy.a).toBe('a');\n        expect(copy.b).toBe('b');\n        expect(copy.c).toBe('c');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var target = {
        a: 'a',
        b: 'b',
        c: 'c',
      };
      var copy = {};
      var keys = '';
      var _loopResult;
      var _loop = prop => {
        keys += ' ' + prop;
        Object.defineProperty(copy, prop, {
          get: () => target[prop],
          enumerable: true,
        });
        return {
          type: 'normal',
          vars: [prop],
        };
      };
      for (var prop in target) {
        _loopResult = _loop(prop);
        prop = _loopResult.vars[0];
      }
      expect(copy.a).toBe('a');
      expect(copy.b).toBe('b');
      expect(copy.c).toBe('c');
    };"
  `);
});

test('015 JS Block Scoping > for loop scoping > let in for-in creates per-iteration binding', async () => {
  const source =
    "() => {\n        const obj = { x: 1, y: 2, z: 3 };\n        var funcs = [];\n        for (let key in obj) {\n          funcs.push(() => key);\n        }\n        var results = funcs.map((f) => f());\n        expect(results).toContain('x');\n        expect(results).toContain('y');\n        expect(results).toContain('z');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var obj = {
        x: 1,
        y: 2,
        z: 3,
      };
      var funcs = [];
      var _loopResult;
      var _loop = key => {
        funcs.push(() => key);
        return {
          type: 'normal',
          vars: [key],
        };
      };
      for (var key in obj) {
        _loopResult = _loop(key);
        key = _loopResult.vars[0];
      }
      var results = funcs.map(f => f());
      expect(results).toContain('x');
      expect(results).toContain('y');
      expect(results).toContain('z');
    };"
  `);
});

test('016 JS Block Scoping > for loop scoping > destructuring with defaults in for-of', async () => {
  const source =
    "() => {\n        var fields = [{ name: 'title' }, { name: 'content' }];\n        for (let { name, value = 'Default value' } of fields) {\n          expect(value).toBe('Default value');\n        }\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var fields = [{ name: 'title' }, { name: 'content' }];
      for (var { name, value = 'Default value' } of fields) {
        expect(value).toBe('Default value');
      }
    };"
  `);
});

test('017 JS Block Scoping > labels and control flow > labeled break with closures in for-in', async () => {
  const source =
    '() => {\n        var heh = [];\n        var nums = [1, 2, 3];\n\n        loop1: for (let i in nums) {\n          let num = nums[i];\n          heh.push((x) => x * num);\n          if (num >= 2) {\n            break loop1;\n          }\n        }\n        expect(heh.length).toBe(2);\n        expect(heh[0](2)).toBe(2);\n        expect(heh[1](4)).toBe(8);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var heh = [];
      var nums = [1, 2, 3];
      var _loopResult;
      var _loop = i => {
        var num = nums[i];
        heh.push(x => x * num);
        if (num >= 2) {
          return {
            type: 'break',
            vars: [i],
          };
        }
        return {
          type: 'normal',
          vars: [i],
        };
      };
      loop1: for (var i in nums) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
        if (_loopResult.type === 'break') break loop1;
      }
      expect(heh.length).toBe(2);
      expect(heh[0](2)).toBe(2);
      expect(heh[1](4)).toBe(8);
    };"
  `);
});

test('018 JS Block Scoping > labels and control flow > nested loops with labeled continue and closures', async () => {
  const source =
    '() => {\n        var stack = [];\n        loop1: for (let j = 0; j < 10; j++) {\n          for (let i = 0; i < 10; i++) {\n            stack.push(() => [i, j]);\n            continue loop1;\n          }\n        }\n        expect(stack[0]()).toEqual([0, 0]);\n        expect(stack[1]()).toEqual([0, 1]);\n        expect(stack[4]()).toEqual([0, 4]);\n        expect(stack[9]()).toEqual([0, 9]);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var stack = [];
      var _loopResult;
      var _loop = j => {
        var _loopResult6;
        var _loop5 = i => {
          stack.push(() => [i, j]);
          return {
            type: 'return',
            value: {
              type: 'continue',
              vars: [j],
            },
            vars: [i],
          };
          return {
            type: 'normal',
            vars: [i],
          };
        };
        for (var i = 0; i < 10; i++) {
          _loopResult6 = _loop5(i);
          i = _loopResult6.vars[0];
          if (_loopResult6.type === 'return') return _loopResult6.value;
        }
        return {
          type: 'normal',
          vars: [j],
        };
      };
      loop1: for (var j = 0; j < 10; j++) {
        _loopResult = _loop(j);
        j = _loopResult.vars[0];
        if (_loopResult.type === 'continue') continue loop1;
      }
      expect(stack[0]()).toEqual([0, 0]);
      expect(stack[1]()).toEqual([0, 1]);
      expect(stack[4]()).toEqual([0, 4]);
      expect(stack[9]()).toEqual([0, 9]);
    };"
  `);
});

test('019 JS Block Scoping > labels and control flow > nested loops with inner break and closures', async () => {
  const source =
    '() => {\n        var stack = [];\n        for (let j = 0; j < 10; j++) {\n          for (let i = 0; i < 10; i++) {\n            stack.push(() => [i, j]);\n            break;\n          }\n        }\n        expect(stack[0]()).toEqual([0, 0]);\n        expect(stack[1]()).toEqual([0, 1]);\n        expect(stack[9]()).toEqual([0, 9]);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var stack = [];
      var _loopResult;
      var _loop = j => {
        var _loopResult6;
        var _loop5 = i => {
          stack.push(() => [i, j]);
          return {
            type: 'break',
            vars: [i],
          };
          return {
            type: 'normal',
            vars: [i],
          };
        };
        for (var i = 0; i < 10; i++) {
          _loopResult6 = _loop5(i);
          i = _loopResult6.vars[0];
          if (_loopResult6.type === 'break') break;
        }
        return {
          type: 'normal',
          vars: [j],
        };
      };
      for (var j = 0; j < 10; j++) {
        _loopResult = _loop(j);
        j = _loopResult.vars[0];
      }
      expect(stack[0]()).toEqual([0, 0]);
      expect(stack[1]()).toEqual([0, 1]);
      expect(stack[9]()).toEqual([0, 9]);
    };"
  `);
});

test('020 JS Block Scoping > labels and control flow > triple-nested loops with labeled continue and closures', async () => {
  const source =
    '() => {\n        var stack = [];\n        loop1: for (let j = 0; j < 10; j++) {\n          loop2: for (let i = 0; i < 10; i++) {\n            for (let x = 0; x < 10; x++) {\n              stack.push(() => [j, i, x]);\n              continue loop2;\n            }\n          }\n        }\n        expect(stack[0]()).toEqual([0, 0, 0]);\n        expect(stack[1]()).toEqual([0, 1, 0]);\n        expect(stack[9]()).toEqual([0, 9, 0]);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var stack = [];
      var _loopResult;
      var _loop = j => {
        var _loopResult7;
        var _loop6 = i => {
          var _loopResult9;
          var _loop8 = x => {
            stack.push(() => [j, i, x]);
            return {
              type: 'return',
              value: {
                type: 'continue',
                vars: [i],
              },
              vars: [x],
            };
            return {
              type: 'normal',
              vars: [x],
            };
          };
          for (var x = 0; x < 10; x++) {
            _loopResult9 = _loop8(x);
            x = _loopResult9.vars[0];
            if (_loopResult9.type === 'return') return _loopResult9.value;
          }
          return {
            type: 'normal',
            vars: [i],
          };
        };
        loop2: for (var i = 0; i < 10; i++) {
          _loopResult7 = _loop6(i);
          i = _loopResult7.vars[0];
          if (_loopResult7.type === 'continue') continue loop2;
        }
        return {
          type: 'normal',
          vars: [j],
        };
      };
      loop1: for (var j = 0; j < 10; j++) {
        _loopResult = _loop(j);
        j = _loopResult.vars[0];
      }
      expect(stack[0]()).toEqual([0, 0, 0]);
      expect(stack[1]()).toEqual([0, 1, 0]);
      expect(stack[9]()).toEqual([0, 9, 0]);
    };"
  `);
});

test('021 JS Block Scoping > labels and control flow > labeled break exits all nested loops', async () => {
  const source =
    '() => {\n        var stack = [];\n        loop1: for (let j = 0; j < 10; j++) {\n          for (let i = 0; i < 10; i++) {\n            stack.push(() => [i, j]);\n            break loop1;\n          }\n        }\n        expect(stack.length).toBe(1);\n        expect(stack[0]()).toEqual([0, 0]);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var stack = [];
      var _loopResult;
      var _loop = j => {
        var _loopResult6;
        var _loop5 = i => {
          stack.push(() => [i, j]);
          return {
            type: 'return',
            value: {
              type: 'break',
              vars: [j],
            },
            vars: [i],
          };
          return {
            type: 'normal',
            vars: [i],
          };
        };
        for (var i = 0; i < 10; i++) {
          _loopResult6 = _loop5(i);
          i = _loopResult6.vars[0];
          if (_loopResult6.type === 'return') return _loopResult6.value;
        }
        return {
          type: 'normal',
          vars: [j],
        };
      };
      loop1: for (var j = 0; j < 10; j++) {
        _loopResult = _loop(j);
        j = _loopResult.vars[0];
        if (_loopResult.type === 'break') break loop1;
      }
      expect(stack.length).toBe(1);
      expect(stack[0]()).toEqual([0, 0]);
    };"
  `);
});

test('022 JS Block Scoping > switch statements > const in switch case block is accessible', async () => {
  const source =
    '() => {\n        if (true) {\n          const x = 1;\n          switch (x) {\n            case 1: {\n              expect(x).toBe(1);\n              break;\n            }\n          }\n        }\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      if (true) {
        var x = 1;
        switch (x) {
          case 1: {
            expect(x).toBe(1);
            break;
          }
        }
      }
    };"
  `);
});

test('023 JS Block Scoping > switch statements > labeled break inside switch exits outer loop', async () => {
  const source =
    '() => {\n        var i;\n        the_loop: for (i = 0; i < 10; i++) {\n          switch (i) {\n            case 3: {\n              break the_loop;\n            }\n          }\n          const z = 3;\n          (() => z)();\n        }\n        expect(i).toBe(3);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var i;
      var _loopResult;
      var _loop = () => {
        switch (i) {
          case 3: {
            return {
              type: 'break',
              vars: [],
            };
          }
        }
        var z = 3;
        (() => z)();
        return {
          type: 'normal',
          vars: [],
        };
      };
      the_loop: for (i = 0; i < 10; i++) {
        _loopResult = _loop();
        if (_loopResult.type === 'break') break the_loop;
      }
      expect(i).toBe(3);
    };"
  `);
});

test('024 JS Block Scoping > switch statements > switch break does not exit for loop', async () => {
  const source =
    '() => {\n        var i;\n        for (i = 0; i < 10; i++) {\n          switch (i) {\n            case 1: {\n              break;\n            }\n          }\n          const z = 3;\n          (() => z)();\n        }\n        expect(i).toBe(10);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var i;
      var _loopResult;
      var _loop = () => {
        switch (i) {
          case 1: {
            break;
          }
        }
        var z = 3;
        (() => z)();
        return {
          type: 'normal',
          vars: [],
        };
      };
      for (i = 0; i < 10; i++) {
        _loopResult = _loop();
      }
      expect(i).toBe(10);
    };"
  `);
});

test('025 JS Block Scoping > switch statements > continue in switch case continues loop', async () => {
  const source =
    '() => {\n        var j = 0;\n        var i;\n        for (i = 0; i < 10; i++) {\n          switch (i) {\n            case 0: {\n              continue;\n            }\n          }\n          j++;\n          const z = 3;\n          (() => z)();\n        }\n        expect(j).toBe(9);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var j = 0;
      var i;
      var _loopResult;
      var _loop = () => {
        switch (i) {
          case 0: {
            return {
              type: 'continue',
              vars: [],
            };
          }
        }
        j++;
        var z = 3;
        (() => z)();
        return {
          type: 'normal',
          vars: [],
        };
      };
      for (i = 0; i < 10; i++) {
        _loopResult = _loop();
        if (_loopResult.type === 'continue') continue;
      }
      expect(j).toBe(9);
    };"
  `);
});

test('026 JS Block Scoping > switch statements > nested loop inside switch with break', async () => {
  const source =
    '() => {\n        var j = 0;\n        var i;\n        for (i = 0; i < 10; i++) {\n          switch (i) {\n            case 0: {\n              for (var k = 0; k < 10; k++) {\n                const z = 3;\n                (() => z)();\n                j++;\n                break;\n              }\n              break;\n            }\n          }\n          const z = 3;\n          (() => z)();\n        }\n        expect(j).toBe(1);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var j = 0;
      var i;
      var _loopResult;
      var _loop = () => {
        switch (i) {
          case 0: {
            var _loopResult7;
            var _loop6 = () => {
              var _z = 3;
              (() => _z)();
              j++;
              return {
                type: 'break',
                vars: [],
              };
              return {
                type: 'normal',
                vars: [],
              };
            };
            for (var k = 0; k < 10; k++) {
              _loopResult7 = _loop6();
              if (_loopResult7.type === 'break') break;
            }
            break;
          }
        }
        var z = 3;
        (() => z)();
        return {
          type: 'normal',
          vars: [],
        };
      };
      for (i = 0; i < 10; i++) {
        _loopResult = _loop();
      }
      expect(j).toBe(1);
    };"
  `);
});

test('027 JS Block Scoping > switch statements > let in switch cases are block-scoped', async () => {
  const source =
    "() => {\n        let result;\n        switch (1) {\n          case 1: {\n            let x = 'one';\n            result = x;\n            break;\n          }\n          case 2: {\n            let x = 'two';\n            result = x;\n            break;\n          }\n        }\n        expect(result).toBe('one');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var result;
      switch (1) {
        case 1: {
          var x = 'one';
          result = x;
          break;
        }
        case 2: {
          var _x = 'two';
          result = _x;
          break;
        }
      }
      expect(result).toBe('one');
    };"
  `);
});

test('028 [upstream xit] JS Block Scoping > temporal dead zone > reference before let declaration throws', async () => {
  const source =
    '() => {\n        expect(() => {\n          i;\n          let i;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      expect(() => {
        i;
        var i;
      }).toThrow();
    };"
  `);
});

test('029 [upstream xit] JS Block Scoping > temporal dead zone > let x = x throws ReferenceError', async () => {
  const source =
    '() => {\n        expect(() => {\n          let x = x;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      expect(() => {
        var x = x;
      }).toThrow();
    };"
  `);
});

test('030 JS Block Scoping > temporal dead zone > const reassignment throws TypeError', async () => {
  const source =
    '() => {\n        expect(() => {\n          const x = 0;\n          x = 1;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
      "var _readOnlyValue;
      function _readOnlyError(r) {
        throw new TypeError('"' + r + '" is read-only');
      }
      () => {
        expect(() => {
          var x = 0;
          (1, _readOnlyError('x'));
        }).toThrow();
      };"
    `);
});

test('031 JS Block Scoping > temporal dead zone > assignment before const declaration throws', async () => {
  const source =
    '() => {\n        expect(() => {\n          x = 1;\n          const x = 0;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
      "var _readOnlyValue;
      function _readOnlyError(r) {
        throw new TypeError('"' + r + '" is read-only');
      }
      () => {
        expect(() => {
          (1, _readOnlyError('x'));
          var x = 0;
        }).toThrow();
      };"
    `);
});

test('032 JS Block Scoping > temporal dead zone > closure called before const declaration throws', async () => {
  const source =
    '() => {\n        expect(() => {\n          (() => {\n            x = 1;\n          })();\n          const x = 0;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
      "var _readOnlyValue;
      function _readOnlyError(r) {
        throw new TypeError('"' + r + '" is read-only');
      }
      () => {
        expect(() => {
          (() => {
            (1, _readOnlyError('x'));
          })();
          var x = 0;
        }).toThrow();
      };"
    `);
});

test('033 JS Block Scoping > temporal dead zone > deferred closure called after const declaration throws TypeError', async () => {
  const source =
    '() => {\n        expect(() => {\n          const call = (() => {\n            return () => {\n              x = 1;\n            };\n          })();\n          const x = 0;\n          call();\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
      "var _readOnlyValue;
      function _readOnlyError(r) {
        throw new TypeError('"' + r + '" is read-only');
      }
      () => {
        expect(() => {
          var call = (() => {
            return () => {
              (1, _readOnlyError('x'));
            };
          })();
          var x = 0;
          call();
        }).toThrow();
      };"
    `);
});

test('034 [upstream xit] JS Block Scoping > temporal dead zone > let is undefined before initialization in same scope', async () => {
  const source =
    '() => {\n        expect(() => {\n          expect(y).toBeUndefined();\n          let y = 1;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      expect(() => {
        expect(y).toBeUndefined();
        var y = 1;
      }).toThrow();
    };"
  `);
});

test('035 JS Block Scoping > temporal dead zone > typeof on TDZ variable does not throw', async () => {
  const source =
    "() => {\n        // typeof is special - it doesn't throw even in TDZ in some engines\n        // but per spec it should throw for let/const. We just check it doesn't crash.\n        let didThrow = false;\n        try {\n          typeof tdz_var;\n          let tdz_var = 1;\n        } catch (e) {\n          didThrow = true;\n        }\n        // Either behavior is acceptable for this edge case\n        expect(typeof didThrow).toBe('boolean');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      // typeof is special - it doesn't throw even in TDZ in some engines
      // but per spec it should throw for let/const. We just check it doesn't crash.
      var didThrow = false;
      try {
        typeof tdz_var;
        var tdz_var = 1;
      } catch (e) {
        didThrow = true;
      }
      // Either behavior is acceptable for this edge case
      expect(typeof didThrow).toBe('boolean');
    };"
  `);
});

test('036 [upstream xit] JS Block Scoping > temporal dead zone > TDZ applies per-block', async () => {
  const source =
    "() => {\n        let x = 'outer';\n        {\n          expect(() => {\n            return x;\n            let x = 'inner';\n          }).toThrow();\n        }\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x = 'outer';
      {
        expect(() => {
          return _x;
          var _x = 'inner';
        }).toThrow();
      }
    };"
  `);
});

test('037 JS Block Scoping > temporal dead zone > function hoisting is not affected by TDZ', async () => {
  const source =
    '() => {\n        expect(() => {\n          foo();\n          function foo() {}\n        }).not.toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      expect(() => {
        foo();
        function foo() {}
      }).not.toThrow();
    };"
  `);
});

test('038 JS Block Scoping > closures in loops > var in for-loop shares binding (baseline)', async () => {
  const source =
    '() => {\n        var funcs = [];\n        for (var i = 0; i < 5; i++) {\n          funcs.push(() => i);\n        }\n        // All closures see the same i = 5\n        expect(funcs[0]()).toBe(5);\n        expect(funcs[4]()).toBe(5);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var funcs = [];
      for (var i = 0; i < 5; i++) {
        funcs.push(() => i);
      }
      // All closures see the same i = 5
      expect(funcs[0]()).toBe(5);
      expect(funcs[4]()).toBe(5);
    };"
  `);
});

test('039 JS Block Scoping > closures in loops > let in for-loop gives per-iteration binding', async () => {
  const source =
    '() => {\n        var funcs = [];\n        for (let i = 0; i < 5; i++) {\n          funcs.push(() => i);\n        }\n        expect(funcs[0]()).toBe(0);\n        expect(funcs[1]()).toBe(1);\n        expect(funcs[2]()).toBe(2);\n        expect(funcs[3]()).toBe(3);\n        expect(funcs[4]()).toBe(4);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var funcs = [];
      var _loopResult;
      var _loop = i => {
        funcs.push(() => i);
        return {
          type: 'normal',
          vars: [i],
        };
      };
      for (var i = 0; i < 5; i++) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
      }
      expect(funcs[0]()).toBe(0);
      expect(funcs[1]()).toBe(1);
      expect(funcs[2]()).toBe(2);
      expect(funcs[3]()).toBe(3);
      expect(funcs[4]()).toBe(4);
    };"
  `);
});

test('040 JS Block Scoping > closures in loops > let in for-loop with setTimeout pattern', async () => {
  const source =
    '() => {\n        var results = [];\n        var callbacks = [];\n        for (let i = 0; i < 3; i++) {\n          callbacks.push(() => {\n            results.push(i);\n          });\n        }\n        callbacks.forEach((cb) => cb());\n        expect(results).toEqual([0, 1, 2]);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var results = [];
      var callbacks = [];
      var _loopResult;
      var _loop = i => {
        callbacks.push(() => {
          results.push(i);
        });
        return {
          type: 'normal',
          vars: [i],
        };
      };
      for (var i = 0; i < 3; i++) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
      }
      callbacks.forEach(cb => cb());
      expect(results).toEqual([0, 1, 2]);
    };"
  `);
});

test('041 JS Block Scoping > closures in loops > const in for-of with async-like closures', async () => {
  const source =
    "() => {\n        var tasks = [];\n        for (const item of ['a', 'b', 'c']) {\n          tasks.push(() => item);\n        }\n        expect(tasks.map((t) => t())).toEqual(['a', 'b', 'c']);\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var tasks = [];
      var _loopResult;
      var _loop = item => {
        tasks.push(() => item);
        return {
          type: 'normal',
          vars: [item],
        };
      };
      for (var item of ['a', 'b', 'c']) {
        _loopResult = _loop(item);
        item = _loopResult.vars[0];
      }
      expect(tasks.map(t => t())).toEqual(['a', 'b', 'c']);
    };"
  `);
});

test('042 JS Block Scoping > closures in loops > let in for-loop with nested closures', async () => {
  const source =
    '() => {\n        var outer = [];\n        for (let i = 0; i < 3; i++) {\n          var inner = [];\n          for (let j = 0; j < 3; j++) {\n            inner.push(() => [i, j]);\n          }\n          outer.push(inner);\n        }\n        expect(outer[0][0]()).toEqual([0, 0]);\n        expect(outer[0][2]()).toEqual([0, 2]);\n        expect(outer[2][1]()).toEqual([2, 1]);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var outer = [];
      var _loopResult;
      var _loop = i => {
        var inner = [];
        var _loopResult7;
        var _loop6 = j => {
          inner.push(() => [i, j]);
          return {
            type: 'normal',
            vars: [j],
          };
        };
        for (var j = 0; j < 3; j++) {
          _loopResult7 = _loop6(j);
          j = _loopResult7.vars[0];
        }
        outer.push(inner);
        return {
          type: 'normal',
          vars: [i],
        };
      };
      for (var i = 0; i < 3; i++) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
      }
      expect(outer[0][0]()).toEqual([0, 0]);
      expect(outer[0][2]()).toEqual([0, 2]);
      expect(outer[2][1]()).toEqual([2, 1]);
    };"
  `);
});

test('043 JS Block Scoping > closures in loops > let in while loop with closure', async () => {
  const source =
    '() => {\n        var funcs = [];\n        let i = 0;\n        while (i < 3) {\n          let captured = i;\n          funcs.push(() => captured);\n          i++;\n        }\n        expect(funcs[0]()).toBe(0);\n        expect(funcs[1]()).toBe(1);\n        expect(funcs[2]()).toBe(2);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var funcs = [];
      var i = 0;
      var _loopResult;
      var _loop = () => {
        var captured = i;
        funcs.push(() => captured);
        i++;
        return {
          type: 'normal',
          vars: [],
        };
      };
      while (i < 3) {
        _loopResult = _loop();
      }
      expect(funcs[0]()).toBe(0);
      expect(funcs[1]()).toBe(1);
      expect(funcs[2]()).toBe(2);
    };"
  `);
});

test('044 JS Block Scoping > closures in loops > let in for-in with closure captures each key', async () => {
  const source =
    "() => {\n        var obj = { a: 1, b: 2, c: 3 };\n        var funcs = [];\n        for (let k in obj) {\n          funcs.push(() => k);\n        }\n        var keys = funcs.map((f) => f()).sort();\n        expect(keys).toEqual(['a', 'b', 'c']);\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var obj = {
        a: 1,
        b: 2,
        c: 3,
      };
      var funcs = [];
      var _loopResult;
      var _loop = k => {
        funcs.push(() => k);
        return {
          type: 'normal',
          vars: [k],
        };
      };
      for (var k in obj) {
        _loopResult = _loop(k);
        k = _loopResult.vars[0];
      }
      var keys = funcs.map(f => f()).sort();
      expect(keys).toEqual(['a', 'b', 'c']);
    };"
  `);
});

test('045 JS Block Scoping > Hermes issues > for-in closure with Object.defineProperty (hermes#575)', async () => {
  const source =
    '() => {\n        const target = { x: 10, y: 20, z: 30 };\n        const proxy = {};\n        for (const key in target) {\n          Object.defineProperty(proxy, key, {\n            get: () => target[key],\n            enumerable: true,\n          });\n        }\n        expect(proxy.x).toBe(10);\n        expect(proxy.y).toBe(20);\n        expect(proxy.z).toBe(30);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var target = {
        x: 10,
        y: 20,
        z: 30,
      };
      var proxy = {};
      var _loopResult;
      var _loop = key => {
        Object.defineProperty(proxy, key, {
          get: () => target[key],
          enumerable: true,
        });
        return {
          type: 'normal',
          vars: [key],
        };
      };
      for (var key in target) {
        _loopResult = _loop(key);
        key = _loopResult.vars[0];
      }
      expect(proxy.x).toBe(10);
      expect(proxy.y).toBe(20);
      expect(proxy.z).toBe(30);
    };"
  `);
});

test('046 JS Block Scoping > Hermes issues > block-scoped shadow does not affect outer closure (hermes#1599)', async () => {
  const source =
    '() => {\n        function repro(t) {\n          const lambda = () => {\n            // Under the Hermes bug, t would be undefined here due to\n            // the const t declaration in the if-block below\n            const result = t === 42;\n            if (result) {\n              const t = 69;\n              void t; // use it to prevent removal\n            }\n            return result;\n          };\n          return lambda();\n        }\n        expect(repro(42)).toBe(true);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      function repro(t) {
        var lambda = () => {
          // Under the Hermes bug, t would be undefined here due to
          // the const t declaration in the if-block below
          var result = t === 42;
          if (result) {
            var _t = 69;
            void _t;
          }
          return result;
        };
        return lambda();
      }
      expect(repro(42)).toBe(true);
    };"
  `);
});

test('047 JS Block Scoping > Hermes issues > deeply nested shadow does not affect outer reference', async () => {
  const source =
    "() => {\n        function test(value) {\n          const check = () => {\n            const captured = value;\n            if (true) {\n              if (true) {\n                const value = 'shadow';\n                void value;\n              }\n            }\n            return captured;\n          };\n          return check();\n        }\n        expect(test('original')).toBe('original');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      function test(value) {
        var check = () => {
          var captured = value;
          if (true) {
            if (true) {
              var _value = 'shadow';
              void _value;
            }
          }
          return captured;
        };
        return check();
      }
      expect(test('original')).toBe('original');
    };"
  `);
});

test('048 JS Block Scoping > Hermes issues > multiple shadows in different blocks', async () => {
  const source =
    "() => {\n        function test(x) {\n          const fn = () => x;\n          {\n            const x = 'a';\n            void x;\n          }\n          {\n            const x = 'b';\n            void x;\n          }\n          return fn();\n        }\n        expect(test(42)).toBe(42);\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      function test(x) {
        var fn = () => x;
        {
          var _x = 'a';
          void _x;
        }
        {
          var _x2 = 'b';
          void _x2;
        }
        return fn();
      }
      expect(test(42)).toBe(42);
    };"
  `);
});

test('049 JS Block Scoping > assignment and mutation > let allows reassignment', async () => {
  const source = '() => {\n        let x = 1;\n        x = 2;\n        expect(x).toBe(2);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x = 1;
      x = 2;
      expect(x).toBe(2);
    };"
  `);
});

test('050 JS Block Scoping > assignment and mutation > const does not allow reassignment', async () => {
  const source =
    '() => {\n        expect(() => {\n          const x = 1;\n          x = 2;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
      "var _readOnlyValue;
      function _readOnlyError(r) {
        throw new TypeError('"' + r + '" is read-only');
      }
      () => {
        expect(() => {
          var x = 1;
          (2, _readOnlyError('x'));
        }).toThrow();
      };"
    `);
});

test('051 JS Block Scoping > assignment and mutation > const object properties can be mutated', async () => {
  const source =
    '() => {\n        const obj = { a: 1 };\n        obj.a = 2;\n        expect(obj.a).toBe(2);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var obj = { a: 1 };
      obj.a = 2;
      expect(obj.a).toBe(2);
    };"
  `);
});

test('052 JS Block Scoping > assignment and mutation > const array elements can be mutated', async () => {
  const source =
    '() => {\n        const arr = [1, 2, 3];\n        arr[0] = 10;\n        expect(arr[0]).toBe(10);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var arr = [1, 2, 3];
      arr[0] = 10;
      expect(arr[0]).toBe(10);
    };"
  `);
});

test('053 JS Block Scoping > assignment and mutation > const += throws TypeError', async () => {
  const source =
    '() => {\n        expect(() => {\n          const a = 1;\n          a += 2;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
      "var _readOnlyValue;
      function _readOnlyError(r) {
        throw new TypeError('"' + r + '" is read-only');
      }
      () => {
        expect(() => {
          var a = 1;
          ((_readOnlyValue = a), (_readOnlyValue += 2), _readOnlyError('a'));
        }).toThrow();
      };"
    `);
});

test('054 JS Block Scoping > assignment and mutation > const++ throws TypeError', async () => {
  const source =
    '() => {\n        expect(() => {\n          const a = 1;\n          a++;\n        }).toThrow();\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
      "var _readOnlyValue;
      function _readOnlyError(r) {
        throw new TypeError('"' + r + '" is read-only');
      }
      () => {
        expect(() => {
          var a = 1;
          ((_readOnlyValue = a), _readOnlyValue++, _readOnlyError('a'));
        }).toThrow();
      };"
    `);
});

test('055 JS Block Scoping > edge cases > let in try-catch blocks', async () => {
  const source =
    "() => {\n        let x = 'outer';\n        try {\n          let x = 'try';\n          expect(x).toBe('try');\n          throw new Error('test');\n        } catch (e) {\n          let x = 'catch';\n          expect(x).toBe('catch');\n        } finally {\n          let x = 'finally';\n          expect(x).toBe('finally');\n        }\n        expect(x).toBe('outer');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x = 'outer';
      try {
        var _x = 'try';
        expect(_x).toBe('try');
        throw new Error('test');
      } catch (e) {
        var _x3 = 'catch';
        expect(_x3).toBe('catch');
      } finally {
        var _x2 = 'finally';
        expect(_x2).toBe('finally');
      }
      expect(x).toBe('outer');
    };"
  `);
});

test('056 JS Block Scoping > edge cases > let in labeled block', async () => {
  const source =
    "() => {\n        let x = 'outer';\n        block: {\n          let x = 'inner';\n          expect(x).toBe('inner');\n          break block;\n        }\n        expect(x).toBe('outer');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x = 'outer';
      block: {
        var _x = 'inner';
        expect(_x).toBe('inner');
        break block;
      }
      expect(x).toBe('outer');
    };"
  `);
});

test('057 JS Block Scoping > edge cases > const declaration in case block does not leak to other cases', async () => {
  const source =
    "() => {\n        function test(val) {\n          switch (val) {\n            case 1: {\n              const x = 'one';\n              return x;\n            }\n            case 2: {\n              const x = 'two';\n              return x;\n            }\n            default: {\n              const x = 'default';\n              return x;\n            }\n          }\n        }\n        expect(test(1)).toBe('one');\n        expect(test(2)).toBe('two');\n        expect(test(3)).toBe('default');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      function test(val) {
        switch (val) {
          case 1: {
            var x = 'one';
            return x;
          }
          case 2: {
            var _x = 'two';
            return _x;
          }
          default: {
            var _x2 = 'default';
            return _x2;
          }
        }
      }
      expect(test(1)).toBe('one');
      expect(test(2)).toBe('two');
      expect(test(3)).toBe('default');
    };"
  `);
});

test('058 JS Block Scoping > edge cases > block scoping with comma operator', async () => {
  const source =
    "() => {\n        let x;\n        {\n          let a = 1,\n            b = 2;\n          x = a + b;\n        }\n        expect(x).toBe(3);\n        expect(typeof a).toBe('undefined');\n        expect(typeof b).toBe('undefined');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x;
      {
        var _a = 1,
          _b = 2;
        x = _a + _b;
      }
      expect(x).toBe(3);
      expect(typeof a).toBe('undefined');
      expect(typeof b).toBe('undefined');
    };"
  `);
});

test('059 JS Block Scoping > edge cases > for loop with let and complex update expression', async () => {
  const source =
    '() => {\n        var results = [];\n        for (let i = 0; i < 6; i += 2) {\n          results.push(() => i);\n        }\n        expect(results[0]()).toBe(0);\n        expect(results[1]()).toBe(2);\n        expect(results[2]()).toBe(4);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var results = [];
      var _loopResult;
      var _loop = i => {
        results.push(() => i);
        return {
          type: 'normal',
          vars: [i],
        };
      };
      for (var i = 0; i < 6; i += 2) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
      }
      expect(results[0]()).toBe(0);
      expect(results[1]()).toBe(2);
      expect(results[2]()).toBe(4);
    };"
  `);
});

test('060 JS Block Scoping > edge cases > immediately invoked closure in for loop captures correct value', async () => {
  const source =
    '() => {\n        var results = [];\n        for (let i = 0; i < 3; i++) {\n          results.push(\n            (\n              (val) => () =>\n                val\n            )(i)\n          );\n        }\n        expect(results[0]()).toBe(0);\n        expect(results[1]()).toBe(1);\n        expect(results[2]()).toBe(2);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var results = [];
      for (var i = 0; i < 3; i++) {
        results.push(
          (
            val => () =>
              val
          )(i),
        );
      }
      expect(results[0]()).toBe(0);
      expect(results[1]()).toBe(1);
      expect(results[2]()).toBe(2);
    };"
  `);
});

test('061 JS Block Scoping > edge cases > let in arrow function parameter default does not leak', async () => {
  const source =
    "() => {\n        let x = 'outer';\n        const fn = (\n          val = (() => {\n            let x = 'default';\n            return x;\n          })()\n        ) => val;\n        expect(fn()).toBe('default');\n        expect(x).toBe('outer');\n      }";
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var x = 'outer';
      var fn = (
        val = (() => {
          var _x = 'default';
          return _x;
        })(),
      ) => val;
      expect(fn()).toBe('default');
      expect(x).toBe('outer');
    };"
  `);
});

test('062 JS Block Scoping > edge cases > nested for loops with same variable name', async () => {
  const source =
    '() => {\n        var outer = [];\n        var inner = [];\n        for (let i = 0; i < 3; i++) {\n          outer.push(() => i);\n          for (let i = 10; i < 13; i++) {\n            inner.push(() => i);\n          }\n        }\n        expect(outer[0]()).toBe(0);\n        expect(outer[1]()).toBe(1);\n        expect(outer[2]()).toBe(2);\n        expect(inner[0]()).toBe(10);\n        expect(inner[1]()).toBe(11);\n        expect(inner[2]()).toBe(12);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var outer = [];
      var inner = [];
      var _loopResult;
      var _loop = i => {
        outer.push(() => i);
        var _loopResult6;
        var _loop5 = i => {
          inner.push(() => i);
          return {
            type: 'normal',
            vars: [i],
          };
        };
        for (var _i = 10; _i < 13; _i++) {
          _loopResult6 = _loop5(_i);
          _i = _loopResult6.vars[0];
        }
        return {
          type: 'normal',
          vars: [i],
        };
      };
      for (var i = 0; i < 3; i++) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
      }
      expect(outer[0]()).toBe(0);
      expect(outer[1]()).toBe(1);
      expect(outer[2]()).toBe(2);
      expect(inner[0]()).toBe(10);
      expect(inner[1]()).toBe(11);
      expect(inner[2]()).toBe(12);
    };"
  `);
});

test('063 JS Block Scoping > edge cases > for-of with let and break', async () => {
  const source =
    '() => {\n        var funcs = [];\n        for (const x of [1, 2, 3, 4, 5]) {\n          funcs.push(() => x);\n          if (x === 3) break;\n        }\n        expect(funcs.length).toBe(3);\n        expect(funcs[0]()).toBe(1);\n        expect(funcs[1]()).toBe(2);\n        expect(funcs[2]()).toBe(3);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var funcs = [];
      var _loopResult;
      var _loop = x => {
        funcs.push(() => x);
        if (x === 3)
          return {
            type: 'break',
            vars: [x],
          };
        return {
          type: 'normal',
          vars: [x],
        };
      };
      for (var x of [1, 2, 3, 4, 5]) {
        _loopResult = _loop(x);
        x = _loopResult.vars[0];
        if (_loopResult.type === 'break') break;
      }
      expect(funcs.length).toBe(3);
      expect(funcs[0]()).toBe(1);
      expect(funcs[1]()).toBe(2);
      expect(funcs[2]()).toBe(3);
    };"
  `);
});

test('064 JS Block Scoping > edge cases > closure captures let after mutation within same iteration', async () => {
  const source =
    '() => {\n        var funcs = [];\n        for (let i = 0; i < 3; i++) {\n          let val = i;\n          val *= 10;\n          funcs.push(() => val);\n        }\n        expect(funcs[0]()).toBe(0);\n        expect(funcs[1]()).toBe(10);\n        expect(funcs[2]()).toBe(20);\n      }';
  expect(await transformOutcome(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "() => {
      var funcs = [];
      var _loopResult;
      var _loop = i => {
        var val = i;
        val *= 10;
        funcs.push(() => val);
        return {
          type: 'normal',
          vars: [i],
        };
      };
      for (var i = 0; i < 3; i++) {
        _loopResult = _loop(i);
        i = _loopResult.vars[0];
      }
      expect(funcs[0]()).toBe(0);
      expect(funcs[1]()).toBe(10);
      expect(funcs[2]()).toBe(20);
    };"
  `);
});
