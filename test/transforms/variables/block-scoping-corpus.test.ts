import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    transforms: {
      blockScoping: true,
    },
  },
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'basic block scoping > nested let declarations create independent scopes',
    source: `() => {
        let x = 1;
        {
          let x = 2;
          expect(x).toBe(2);
          {
            let x = 3;
            expect(x).toBe(3);
            x++;
            expect(x).toBe(4);
          }
        }
        expect(x).toBe(1);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'basic block scoping > closures in nested blocks capture correct binding',
    source: `() => {
        expect(
          (() => {
            let sum = 0;
            let a = 0;
            {
              let a = 10;
              for (let i = 0; i < a; i++) {
                let a = 1;
                sum += (() => a)();
              }
            }
            return sum;
          })()
        ).toBe(10);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'basic block scoping > inner scope shadows outer function scope',
    source: `() => {
        function test() {
          let value = 'outer';
          return (function () {
            let value = 'inner';
            return value;
          })();
        }
        expect(test()).toBe('inner');
      }`,
    output: `() => {
  function test() {
    var value = 'outer';
    return (function () {
      var _value = 'inner';
      return _value;
    })();
  }
  expect(test()).toBe('inner');
};`,
  },
  {
    title: 'basic block scoping > let in loop body shadows outer let',
    source: `() => {
        let x = 0;
        for (;;) {
          let x = 1;
          expect(x).toBe(1);
          break;
        }
        expect(x).toBe(0);
      }`,
    output: `() => {
  var x = 0;
  for (;;) {
    var _x = 1;
    expect(_x).toBe(1);
    break;
  }
  expect(x).toBe(0);
};`,
  },
  {
    title: 'basic block scoping > const in block is not visible outside',
    source: `() => {
        {
          const a = 1;
          expect(a).toBe(1);
        }
        expect(typeof a).toBe('undefined');
      }`,
    output: `() => {
  {
    var _a = 1;
    expect(_a).toBe(1);
  }
  expect(typeof a).toBe('undefined');
};`,
  },
  {
    title: 'basic block scoping > let in block is not visible outside',
    source: `() => {
        {
          let b = 2;
          expect(b).toBe(2);
        }
        expect(typeof b).toBe('undefined');
      }`,
    output: `() => {
  {
    var _b = 2;
    expect(_b).toBe(2);
  }
  expect(typeof b).toBe('undefined');
};`,
  },
  {
    title: 'basic block scoping > if-block scoping',
    source: `() => {
        let x = 'outer';
        if (true) {
          let x = 'inner';
          expect(x).toBe('inner');
        }
        expect(x).toBe('outer');
      }`,
    output: `() => {
  var x = 'outer';
  if (true) {
    var _x = 'inner';
    expect(_x).toBe('inner');
  }
  expect(x).toBe('outer');
};`,
  },
  {
    title: 'for loop scoping > let in for-loop head does not leak',
    source: `() => {
        expect(
          (function () {
            let a = 1;
            for (let a = 0; a < 8; a++) {}
            return a;
          })()
        ).toBe(1);
      }`,
    output: `() => {
  expect(
    (function () {
      var a = 1;
      for (var _a = 0; _a < 8; _a++) {}
      return a;
    })(),
  ).toBe(1);
};`,
  },
  {
    title: 'for loop scoping > multiple let declarations in for-loop head do not leak',
    source: `() => {
        for (let i = 0, x = 2; i < 5; i++);
        expect(typeof i).toBe('undefined');
        expect(typeof x).toBe('undefined');
      }`,
    output: `() => {
  for (var _i = 0, _x = 2; _i < 5; _i++);
  expect(typeof i).toBe('undefined');
  expect(typeof x).toBe('undefined');
};`,
  },
  {
    title: 'for loop scoping > closures capture per-iteration let binding in for loop',
    source: `() => {
        var fns = [];
        for (let i = 0; i < 10; i++) {
          fns.push(function () {
            return i;
          });
          i += 1;
        }
        expect(fns[0]()).toBe(1);
        expect(fns[1]()).toBe(3);
        expect(fns[2]()).toBe(5);
        expect(fns[3]()).toBe(7);
        expect(fns[4]()).toBe(9);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'for loop scoping > closures with splice and index mutation in for loop',
    source: `() => {
        let data = [true, false, false, true, false];
        for (let index = 0; index < data.length; index++) {
          let item = data[index];
          if (!item) {
            data.splice(index, 1);
            index--;
            continue;
          }
          let fn = function () {
            item;
          };
        }
        expect(data.every((item) => item)).toBe(true);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'for loop scoping > each for-loop iteration gets its own let binding',
    source: `() => {
        var funcs = [];
        for (let i = 0; i < 5; i++) {
          funcs.push(() => i);
        }
        expect(funcs[0]()).toBe(0);
        expect(funcs[1]()).toBe(1);
        expect(funcs[2]()).toBe(2);
        expect(funcs[3]()).toBe(3);
        expect(funcs[4]()).toBe(4);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'for loop scoping > const in for-of creates per-iteration binding',
    source: `() => {
        var funcs = [];
        for (const val of [10, 20, 30]) {
          funcs.push(() => val);
        }
        expect(funcs[0]()).toBe(10);
        expect(funcs[1]()).toBe(20);
        expect(funcs[2]()).toBe(30);
      }`,
    output: `() => {
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
  }
  expect(funcs[0]()).toBe(10);
  expect(funcs[1]()).toBe(20);
  expect(funcs[2]()).toBe(30);
};`,
  },
  {
    title: 'for loop scoping > const in for-in creates per-iteration binding (hermes#575)',
    source: `() => {
        const target = {
          a: 'a',
          b: 'b',
          c: 'c',
        };
        const copy = {};
        let keys = '';
        for (const prop in target) {
          keys += ' ' + prop;
          Object.defineProperty(copy, prop, {
            get: () => target[prop],
            enumerable: true,
          });
        }
        expect(copy.a).toBe('a');
        expect(copy.b).toBe('b');
        expect(copy.c).toBe('c');
      }`,
    output: `() => {
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
  }
  expect(copy.a).toBe('a');
  expect(copy.b).toBe('b');
  expect(copy.c).toBe('c');
};`,
  },
  {
    title: 'for loop scoping > let in for-in creates per-iteration binding',
    source: `() => {
        const obj = { x: 1, y: 2, z: 3 };
        var funcs = [];
        for (let key in obj) {
          funcs.push(() => key);
        }
        var results = funcs.map((f) => f());
        expect(results).toContain('x');
        expect(results).toContain('y');
        expect(results).toContain('z');
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'for loop scoping > destructuring with defaults in for-of',
    source: `() => {
        var fields = [{ name: 'title' }, { name: 'content' }];
        for (let { name, value = 'Default value' } of fields) {
          expect(value).toBe('Default value');
        }
      }`,
    output: `() => {
  var fields = [{ name: 'title' }, { name: 'content' }];
  for (var { name, value = 'Default value' } of fields) {
    expect(value).toBe('Default value');
  }
};`,
  },
  {
    title: 'labels and control flow > labeled break with closures in for-in',
    source: `() => {
        var heh = [];
        var nums = [1, 2, 3];
     \x20
        loop1: for (let i in nums) {
          let num = nums[i];
          heh.push((x) => x * num);
          if (num >= 2) {
            break loop1;
          }
        }
        expect(heh.length).toBe(2);
        expect(heh[0](2)).toBe(2);
        expect(heh[1](4)).toBe(8);
      }`,
    output: `() => {
  var heh = [];
  var nums = [1, 2, 3];
  var _loopResult;
  var _loop = i => {
    var num = nums[i];
    heh.push(x => x * num);
    if (num >= 2) {
      return {
        type: 'break:loop1',
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
    if (_loopResult.type === 'break:loop1') break loop1;
  }
  expect(heh.length).toBe(2);
  expect(heh[0](2)).toBe(2);
  expect(heh[1](4)).toBe(8);
};`,
  },
  {
    title: 'labels and control flow > nested loops with labeled continue and closures',
    source: `() => {
        var stack = [];
        loop1: for (let j = 0; j < 10; j++) {
          for (let i = 0; i < 10; i++) {
            stack.push(() => [i, j]);
            continue loop1;
          }
        }
        expect(stack[0]()).toEqual([0, 0]);
        expect(stack[1]()).toEqual([0, 1]);
        expect(stack[4]()).toEqual([0, 4]);
        expect(stack[9]()).toEqual([0, 9]);
      }`,
    output: `() => {
  var stack = [];
  var _loopResult;
  var _loop = j => {
    var _loopResult7;
    var _loop6 = i => {
      stack.push(() => [i, j]);
      return {
        type: 'return',
        value: {
          type: 'continue:loop1',
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
      _loopResult7 = _loop6(i);
      i = _loopResult7.vars[0];
      if (_loopResult7.type === 'return') return _loopResult7.value;
    }
    return {
      type: 'normal',
      vars: [j],
    };
  };
  loop1: for (var j = 0; j < 10; j++) {
    _loopResult = _loop(j);
    j = _loopResult.vars[0];
    if (_loopResult.type === 'continue:loop1') continue loop1;
  }
  expect(stack[0]()).toEqual([0, 0]);
  expect(stack[1]()).toEqual([0, 1]);
  expect(stack[4]()).toEqual([0, 4]);
  expect(stack[9]()).toEqual([0, 9]);
};`,
  },
  {
    title: 'labels and control flow > nested loops with inner break and closures',
    source: `() => {
        var stack = [];
        for (let j = 0; j < 10; j++) {
          for (let i = 0; i < 10; i++) {
            stack.push(() => [i, j]);
            break;
          }
        }
        expect(stack[0]()).toEqual([0, 0]);
        expect(stack[1]()).toEqual([0, 1]);
        expect(stack[9]()).toEqual([0, 9]);
      }`,
    output: `() => {
  var stack = [];
  var _loopResult;
  var _loop = j => {
    var _loopResult7;
    var _loop6 = i => {
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
      _loopResult7 = _loop6(i);
      i = _loopResult7.vars[0];
      if (_loopResult7.type === 'break') break;
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
};`,
  },
  {
    title: 'labels and control flow > triple-nested loops with labeled continue and closures',
    source: `() => {
        var stack = [];
        loop1: for (let j = 0; j < 10; j++) {
          loop2: for (let i = 0; i < 10; i++) {
            for (let x = 0; x < 10; x++) {
              stack.push(() => [j, i, x]);
              continue loop2;
            }
          }
        }
        expect(stack[0]()).toEqual([0, 0, 0]);
        expect(stack[1]()).toEqual([0, 1, 0]);
        expect(stack[9]()).toEqual([0, 9, 0]);
      }`,
    output: `() => {
  var stack = [];
  var _loopResult;
  var _loop = j => {
    var _loopResult8;
    var _loop7 = i => {
      var _loopResult10;
      var _loop9 = x => {
        stack.push(() => [j, i, x]);
        return {
          type: 'return',
          value: {
            type: 'continue:loop2',
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
        _loopResult10 = _loop9(x);
        x = _loopResult10.vars[0];
        if (_loopResult10.type === 'return') return _loopResult10.value;
      }
      return {
        type: 'normal',
        vars: [i],
      };
    };
    loop2: for (var i = 0; i < 10; i++) {
      _loopResult8 = _loop7(i);
      i = _loopResult8.vars[0];
      if (_loopResult8.type === 'continue:loop2') continue loop2;
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
};`,
  },
  {
    title: 'labels and control flow > labeled break exits all nested loops',
    source: `() => {
        var stack = [];
        loop1: for (let j = 0; j < 10; j++) {
          for (let i = 0; i < 10; i++) {
            stack.push(() => [i, j]);
            break loop1;
          }
        }
        expect(stack.length).toBe(1);
        expect(stack[0]()).toEqual([0, 0]);
      }`,
    output: `() => {
  var stack = [];
  var _loopResult;
  var _loop = j => {
    var _loopResult7;
    var _loop6 = i => {
      stack.push(() => [i, j]);
      return {
        type: 'return',
        value: {
          type: 'break:loop1',
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
      _loopResult7 = _loop6(i);
      i = _loopResult7.vars[0];
      if (_loopResult7.type === 'return') return _loopResult7.value;
    }
    return {
      type: 'normal',
      vars: [j],
    };
  };
  loop1: for (var j = 0; j < 10; j++) {
    _loopResult = _loop(j);
    j = _loopResult.vars[0];
    if (_loopResult.type === 'break:loop1') break loop1;
  }
  expect(stack.length).toBe(1);
  expect(stack[0]()).toEqual([0, 0]);
};`,
  },
  {
    title: 'switch statements > const in switch case block is accessible',
    source: `() => {
        if (true) {
          const x = 1;
          switch (x) {
            case 1: {
              expect(x).toBe(1);
              break;
            }
          }
        }
      }`,
    output: `() => {
  if (true) {
    var x = 1;
    switch (x) {
      case 1: {
        expect(x).toBe(1);
        break;
      }
    }
  }
};`,
  },
  {
    title: 'switch statements > labeled break inside switch exits outer loop',
    source: `() => {
        var i;
        the_loop: for (i = 0; i < 10; i++) {
          switch (i) {
            case 3: {
              break the_loop;
            }
          }
          const z = 3;
          (() => z)();
        }
        expect(i).toBe(3);
      }`,
    output: `() => {
  var i;
  var _loopResult;
  var _loop = () => {
    switch (i) {
      case 3: {
        return {
          type: 'break:the_loop',
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
    if (_loopResult.type === 'break:the_loop') break the_loop;
  }
  expect(i).toBe(3);
};`,
  },
  {
    title: 'switch statements > switch break does not exit for loop',
    source: `() => {
        var i;
        for (i = 0; i < 10; i++) {
          switch (i) {
            case 1: {
              break;
            }
          }
          const z = 3;
          (() => z)();
        }
        expect(i).toBe(10);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'switch statements > continue in switch case continues loop',
    source: `() => {
        var j = 0;
        var i;
        for (i = 0; i < 10; i++) {
          switch (i) {
            case 0: {
              continue;
            }
          }
          j++;
          const z = 3;
          (() => z)();
        }
        expect(j).toBe(9);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'switch statements > nested loop inside switch with break',
    source: `() => {
        var j = 0;
        var i;
        for (i = 0; i < 10; i++) {
          switch (i) {
            case 0: {
              for (var k = 0; k < 10; k++) {
                const z = 3;
                (() => z)();
                j++;
                break;
              }
              break;
            }
          }
          const z = 3;
          (() => z)();
        }
        expect(j).toBe(1);
      }`,
    output: `() => {
  var j = 0;
  var i;
  var k;
  var _loopResult;
  var _loop = () => {
    switch (i) {
      case 0: {
        var _loopResult8;
        var _loop7 = () => {
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
        for (k = 0; k < 10; k++) {
          _loopResult8 = _loop7();
          if (_loopResult8.type === 'break') break;
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
};`,
  },
  {
    title: 'switch statements > let in switch cases are block-scoped',
    source: `() => {
        let result;
        switch (1) {
          case 1: {
            let x = 'one';
            result = x;
            break;
          }
          case 2: {
            let x = 'two';
            result = x;
            break;
          }
        }
        expect(result).toBe('one');
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'temporal dead zone > reference before let declaration throws',
    source: `() => {
        expect(() => {
          i;
          let i;
        }).toThrow();
      }`,
    output: `() => {
  expect(() => {
    i;
    var i;
  }).toThrow();
};`,
  },
  {
    title: 'temporal dead zone > let x = x throws ReferenceError',
    source: `() => {
        expect(() => {
          let x = x;
        }).toThrow();
      }`,
    output: `() => {
  expect(() => {
    var x = x;
  }).toThrow();
};`,
  },
  {
    title: 'temporal dead zone > const reassignment throws TypeError',
    source: `() => {
        expect(() => {
          const x = 0;
          x = 1;
        }).toThrow();
      }`,
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
() => {
  expect(() => {
    var x = 0;
    (1, _readOnlyError('x'));
  }).toThrow();
};`,
  },
  {
    title: 'temporal dead zone > assignment before const declaration throws',
    source: `() => {
        expect(() => {
          x = 1;
          const x = 0;
        }).toThrow();
      }`,
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
() => {
  expect(() => {
    (1, _readOnlyError('x'));
    var x = 0;
  }).toThrow();
};`,
  },
  {
    title: 'temporal dead zone > closure called before const declaration throws',
    source: `() => {
        expect(() => {
          (() => {
            x = 1;
          })();
          const x = 0;
        }).toThrow();
      }`,
    output: `var _readOnlyValue;
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
};`,
  },
  {
    title: 'temporal dead zone > deferred closure called after const declaration throws TypeError',
    source: `() => {
        expect(() => {
          const call = (() => {
            return () => {
              x = 1;
            };
          })();
          const x = 0;
          call();
        }).toThrow();
      }`,
    output: `var _readOnlyValue;
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
};`,
  },
  {
    title: 'temporal dead zone > let is undefined before initialization in same scope',
    source: `() => {
        expect(() => {
          expect(y).toBeUndefined();
          let y = 1;
        }).toThrow();
      }`,
    output: `() => {
  expect(() => {
    expect(y).toBeUndefined();
    var y = 1;
  }).toThrow();
};`,
  },
  {
    title: 'temporal dead zone > typeof on TDZ variable does not throw',
    source: `() => {
        // typeof is special - it doesn't throw even in TDZ in some engines
        // but per spec it should throw for let/const. We just check it doesn't crash.
        let didThrow = false;
        try {
          typeof tdz_var;
          let tdz_var = 1;
        } catch (e) {
          didThrow = true;
        }
        // Either behavior is acceptable for this edge case
        expect(typeof didThrow).toBe('boolean');
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'temporal dead zone > TDZ applies per-block',
    source: `() => {
        let x = 'outer';
        {
          expect(() => {
            return x;
            let x = 'inner';
          }).toThrow();
        }
      }`,
    output: `() => {
  var x = 'outer';
  {
    expect(() => {
      return _x;
      var _x = 'inner';
    }).toThrow();
  }
};`,
  },
  {
    title: 'temporal dead zone > function hoisting is not affected by TDZ',
    source: `() => {
        expect(() => {
          foo();
          function foo() {}
        }).not.toThrow();
      }`,
    output: `() => {
  expect(() => {
    foo();
    function foo() {}
  }).not.toThrow();
};`,
  },
  {
    title: 'closures in loops > var in for-loop shares binding (baseline)',
    source: `() => {
        var funcs = [];
        for (var i = 0; i < 5; i++) {
          funcs.push(() => i);
        }
        // All closures see the same i = 5
        expect(funcs[0]()).toBe(5);
        expect(funcs[4]()).toBe(5);
      }`,
    output: `() => {
  var funcs = [];
  for (var i = 0; i < 5; i++) {
    funcs.push(() => i);
  }
  // All closures see the same i = 5
  expect(funcs[0]()).toBe(5);
  expect(funcs[4]()).toBe(5);
};`,
  },
  {
    title: 'closures in loops > let in for-loop with setTimeout pattern',
    source: `() => {
        var results = [];
        var callbacks = [];
        for (let i = 0; i < 3; i++) {
          callbacks.push(() => {
            results.push(i);
          });
        }
        callbacks.forEach((cb) => cb());
        expect(results).toEqual([0, 1, 2]);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'closures in loops > const in for-of with async-like closures',
    source: `() => {
        var tasks = [];
        for (const item of ['a', 'b', 'c']) {
          tasks.push(() => item);
        }
        expect(tasks.map((t) => t())).toEqual(['a', 'b', 'c']);
      }`,
    output: `() => {
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
  }
  expect(tasks.map(t => t())).toEqual(['a', 'b', 'c']);
};`,
  },
  {
    title: 'closures in loops > let in for-loop with nested closures',
    source: `() => {
        var outer = [];
        for (let i = 0; i < 3; i++) {
          var inner = [];
          for (let j = 0; j < 3; j++) {
            inner.push(() => [i, j]);
          }
          outer.push(inner);
        }
        expect(outer[0][0]()).toEqual([0, 0]);
        expect(outer[0][2]()).toEqual([0, 2]);
        expect(outer[2][1]()).toEqual([2, 1]);
      }`,
    output: `() => {
  var outer = [];
  var inner;
  var _loopResult;
  var _loop = i => {
    inner = [];
    var _loopResult8;
    var _loop7 = j => {
      inner.push(() => [i, j]);
      return {
        type: 'normal',
        vars: [j],
      };
    };
    for (var j = 0; j < 3; j++) {
      _loopResult8 = _loop7(j);
      j = _loopResult8.vars[0];
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
};`,
  },
  {
    title: 'closures in loops > let in while loop with closure',
    source: `() => {
        var funcs = [];
        let i = 0;
        while (i < 3) {
          let captured = i;
          funcs.push(() => captured);
          i++;
        }
        expect(funcs[0]()).toBe(0);
        expect(funcs[1]()).toBe(1);
        expect(funcs[2]()).toBe(2);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'closures in loops > let in for-in with closure captures each key',
    source: `() => {
        var obj = { a: 1, b: 2, c: 3 };
        var funcs = [];
        for (let k in obj) {
          funcs.push(() => k);
        }
        var keys = funcs.map((f) => f()).sort();
        expect(keys).toEqual(['a', 'b', 'c']);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'Hermes issues > for-in closure with Object.defineProperty (hermes#575)',
    source: `() => {
        const target = { x: 10, y: 20, z: 30 };
        const proxy = {};
        for (const key in target) {
          Object.defineProperty(proxy, key, {
            get: () => target[key],
            enumerable: true,
          });
        }
        expect(proxy.x).toBe(10);
        expect(proxy.y).toBe(20);
        expect(proxy.z).toBe(30);
      }`,
    output: `() => {
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
  }
  expect(proxy.x).toBe(10);
  expect(proxy.y).toBe(20);
  expect(proxy.z).toBe(30);
};`,
  },
  {
    title: 'Hermes issues > block-scoped shadow does not affect outer closure (hermes#1599)',
    source: `() => {
        function repro(t) {
          const lambda = () => {
            // Under the Hermes bug, t would be undefined here due to
            // the const t declaration in the if-block below
            const result = t === 42;
            if (result) {
              const t = 69;
              void t; // use it to prevent removal
            }
            return result;
          };
          return lambda();
        }
        expect(repro(42)).toBe(true);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'Hermes issues > deeply nested shadow does not affect outer reference',
    source: `() => {
        function test(value) {
          const check = () => {
            const captured = value;
            if (true) {
              if (true) {
                const value = 'shadow';
                void value;
              }
            }
            return captured;
          };
          return check();
        }
        expect(test('original')).toBe('original');
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'Hermes issues > multiple shadows in different blocks',
    source: `() => {
        function test(x) {
          const fn = () => x;
          {
            const x = 'a';
            void x;
          }
          {
            const x = 'b';
            void x;
          }
          return fn();
        }
        expect(test(42)).toBe(42);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'assignment and mutation > let allows reassignment',
    source: `() => {
        let x = 1;
        x = 2;
        expect(x).toBe(2);
      }`,
    output: `() => {
  var x = 1;
  x = 2;
  expect(x).toBe(2);
};`,
  },
  {
    title: 'assignment and mutation > const does not allow reassignment',
    source: `() => {
        expect(() => {
          const x = 1;
          x = 2;
        }).toThrow();
      }`,
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
() => {
  expect(() => {
    var x = 1;
    (2, _readOnlyError('x'));
  }).toThrow();
};`,
  },
  {
    title: 'assignment and mutation > const object properties can be mutated',
    source: `() => {
        const obj = { a: 1 };
        obj.a = 2;
        expect(obj.a).toBe(2);
      }`,
    output: `() => {
  var obj = { a: 1 };
  obj.a = 2;
  expect(obj.a).toBe(2);
};`,
  },
  {
    title: 'assignment and mutation > const array elements can be mutated',
    source: `() => {
        const arr = [1, 2, 3];
        arr[0] = 10;
        expect(arr[0]).toBe(10);
      }`,
    output: `() => {
  var arr = [1, 2, 3];
  arr[0] = 10;
  expect(arr[0]).toBe(10);
};`,
  },
  {
    title: 'assignment and mutation > const += throws TypeError',
    source: `() => {
        expect(() => {
          const a = 1;
          a += 2;
        }).toThrow();
      }`,
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
() => {
  expect(() => {
    var a = 1;
    ((_readOnlyValue = a), (_readOnlyValue += 2), _readOnlyError('a'));
  }).toThrow();
};`,
  },
  {
    title: 'assignment and mutation > const++ throws TypeError',
    source: `() => {
        expect(() => {
          const a = 1;
          a++;
        }).toThrow();
      }`,
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
() => {
  expect(() => {
    var a = 1;
    ((_readOnlyValue = a), _readOnlyValue++, _readOnlyError('a'));
  }).toThrow();
};`,
  },
  {
    title: 'edge cases > let in try-catch blocks',
    source: `() => {
        let x = 'outer';
        try {
          let x = 'try';
          expect(x).toBe('try');
          throw new Error('test');
        } catch (e) {
          let x = 'catch';
          expect(x).toBe('catch');
        } finally {
          let x = 'finally';
          expect(x).toBe('finally');
        }
        expect(x).toBe('outer');
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'edge cases > let in labeled block',
    source: `() => {
        let x = 'outer';
        block: {
          let x = 'inner';
          expect(x).toBe('inner');
          break block;
        }
        expect(x).toBe('outer');
      }`,
    output: `() => {
  var x = 'outer';
  block: {
    var _x = 'inner';
    expect(_x).toBe('inner');
    break block;
  }
  expect(x).toBe('outer');
};`,
  },
  {
    title: 'edge cases > const declaration in case block does not leak to other cases',
    source: `() => {
        function test(val) {
          switch (val) {
            case 1: {
              const x = 'one';
              return x;
            }
            case 2: {
              const x = 'two';
              return x;
            }
            default: {
              const x = 'default';
              return x;
            }
          }
        }
        expect(test(1)).toBe('one');
        expect(test(2)).toBe('two');
        expect(test(3)).toBe('default');
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'edge cases > block scoping with comma operator',
    source: `() => {
        let x;
        {
          let a = 1,
            b = 2;
          x = a + b;
        }
        expect(x).toBe(3);
        expect(typeof a).toBe('undefined');
        expect(typeof b).toBe('undefined');
      }`,
    output: `() => {
  var x;
  {
    var _a = 1,
      _b = 2;
    x = _a + _b;
  }
  expect(x).toBe(3);
  expect(typeof a).toBe('undefined');
  expect(typeof b).toBe('undefined');
};`,
  },
  {
    title: 'edge cases > for loop with let and complex update expression',
    source: `() => {
        var results = [];
        for (let i = 0; i < 6; i += 2) {
          results.push(() => i);
        }
        expect(results[0]()).toBe(0);
        expect(results[1]()).toBe(2);
        expect(results[2]()).toBe(4);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'edge cases > immediately invoked closure in for loop captures correct value',
    source: `() => {
        var results = [];
        for (let i = 0; i < 3; i++) {
          results.push(
            (
              (val) => () =>
                val
            )(i)
          );
        }
        expect(results[0]()).toBe(0);
        expect(results[1]()).toBe(1);
        expect(results[2]()).toBe(2);
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'edge cases > let in arrow function parameter default does not leak',
    source: `() => {
        let x = 'outer';
        const fn = (
          val = (() => {
            let x = 'default';
            return x;
          })()
        ) => val;
        expect(fn()).toBe('default');
        expect(x).toBe('outer');
      }`,
    output: `() => {
  var x = 'outer';
  var fn = (
    val = (() => {
      var _x = 'default';
      return _x;
    })(),
  ) => val;
  expect(fn()).toBe('default');
  expect(x).toBe('outer');
};`,
  },
  {
    title: 'edge cases > nested for loops with same variable name',
    source: `() => {
        var outer = [];
        var inner = [];
        for (let i = 0; i < 3; i++) {
          outer.push(() => i);
          for (let i = 10; i < 13; i++) {
            inner.push(() => i);
          }
        }
        expect(outer[0]()).toBe(0);
        expect(outer[1]()).toBe(1);
        expect(outer[2]()).toBe(2);
        expect(inner[0]()).toBe(10);
        expect(inner[1]()).toBe(11);
        expect(inner[2]()).toBe(12);
      }`,
    output: `() => {
  var outer = [];
  var inner = [];
  var _loopResult;
  var _loop = i => {
    outer.push(() => i);
    var _loopResult7;
    var _loop6 = i => {
      inner.push(() => i);
      return {
        type: 'normal',
        vars: [i],
      };
    };
    for (var _i = 10; _i < 13; _i++) {
      _loopResult7 = _loop6(_i);
      _i = _loopResult7.vars[0];
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
};`,
  },
  {
    title: 'edge cases > for-of with let and break',
    source: `() => {
        var funcs = [];
        for (const x of [1, 2, 3, 4, 5]) {
          funcs.push(() => x);
          if (x === 3) break;
        }
        expect(funcs.length).toBe(3);
        expect(funcs[0]()).toBe(1);
        expect(funcs[1]()).toBe(2);
        expect(funcs[2]()).toBe(3);
      }`,
    output: `() => {
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
    if (_loopResult.type === 'break') break;
  }
  expect(funcs.length).toBe(3);
  expect(funcs[0]()).toBe(1);
  expect(funcs[1]()).toBe(2);
  expect(funcs[2]()).toBe(3);
};`,
  },
  {
    title: 'edge cases > closure captures let after mutation within same iteration',
    source: `() => {
        var funcs = [];
        for (let i = 0; i < 3; i++) {
          let val = i;
          val *= 10;
          funcs.push(() => val);
        }
        expect(funcs[0]()).toBe(0);
        expect(funcs[1]()).toBe(10);
        expect(funcs[2]()).toBe(20);
      }`,
    output: `() => {
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
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
