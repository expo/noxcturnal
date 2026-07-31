// Generated from apps/test-suite/tests/JSHermesMisc.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { transformOutcome } from '../transform';

test('001 JS Hermes Misc > class declarations in finally blocks > static field on a class declared in finally', async () => {
  const source =
    '() => {\n        function f() {\n          try {\n            throw 1;\n          } catch (_) {\n          } finally {\n            class C {\n              static x = 42;\n            }\n            return C.x;\n          }\n        }\n        expect(f()).toBe(42);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f() {
        try {
          throw 1;
        } catch (_) {
        } finally {
          class C {
            static x = 42;
          }
          return C.x;
        }
      }
      expect(f()).toBe(42);
    };"
  `);
});

test('002 JS Hermes Misc > class declarations in finally blocks > instance field on a class declared in finally', async () => {
  const source =
    '() => {\n        function f() {\n          try {\n            throw 1;\n          } catch (_) {\n          } finally {\n            class C {\n              y = 7;\n            }\n            return new C().y;\n          }\n        }\n        expect(f()).toBe(7);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f() {
        try {
          throw 1;
        } catch (_) {
        } finally {
          class C {
            y = 7;
          }
          return new C().y;
        }
      }
      expect(f()).toBe(7);
    };"
  `);
});

test('003 JS Hermes Misc > class declarations in finally blocks > private method on a class declared in finally', async () => {
  const source =
    "() => {\n        function f() {\n          try {\n            throw 1;\n          } catch (_) {\n          } finally {\n            class C {\n              #m() {\n                return 'private';\n              }\n              call() {\n                return this.#m();\n              }\n            }\n            return new C().call();\n          }\n        }\n        expect(f()).toBe('private');\n      }";
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f() {
        try {
          throw 1;
        } catch (_) {
        } finally {
          class C {
            #m() {
              return 'private';
            }
            call() {
              return this.#m();
            }
          }
          return new C().call();
        }
      }
      expect(f()).toBe('private');
    };"
  `);
});

test('004 JS Hermes Misc > class declarations in finally blocks > class with computed key declared in finally', async () => {
  const source =
    "() => {\n        function f() {\n          const k = 'computed';\n          try {\n            throw 1;\n          } catch (_) {\n          } finally {\n            class C {\n              [k] = 99;\n            }\n            return new C().computed;\n          }\n        }\n        expect(f()).toBe(99);\n      }";
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f() {
        const k = 'computed';
        try {
          throw 1;
        } catch (_) {
        } finally {
          class C {
            [k] = 99;
          }
          return new C().computed;
        }
      }
      expect(f()).toBe(99);
    };"
  `);
});

test('005 JS Hermes Misc > class declarations in finally blocks > class with extends declared in finally', async () => {
  const source =
    "() => {\n        class Base {\n          base() {\n            return 'base';\n          }\n        }\n        function f() {\n          try {\n            throw 1;\n          } catch (_) {\n          } finally {\n            class C extends Base {\n              child() {\n                return 'child';\n              }\n            }\n            const c = new C();\n            return c.base() + ':' + c.child();\n          }\n        }\n        expect(f()).toBe('base:child');\n      }";
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      class Base {
        base() {
          return 'base';
        }
      }
      function f() {
        try {
          throw 1;
        } catch (_) {
        } finally {
          class C extends Base {
            child() {
              return 'child';
            }
          }
          const c = new C();
          return c.base() + ':' + c.child();
        }
      }
      expect(f()).toBe('base:child');
    };"
  `);
});

test('006 JS Hermes Misc > class declarations in finally blocks > multiple classes declared in the same finally', async () => {
  const source =
    "() => {\n        function f() {\n          try {\n            throw 1;\n          } catch (_) {\n          } finally {\n            class A {\n              tag() {\n                return 'a';\n              }\n            }\n            class B extends A {\n              tag() {\n                return super.tag() + 'b';\n              }\n            }\n            return new B().tag();\n          }\n        }\n        expect(f()).toBe('ab');\n      }";
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f() {
        try {
          throw 1;
        } catch (_) {
        } finally {
          class A {
            tag() {
              return 'a';
            }
          }
          class B extends A {
            tag() {
              return super.tag() + 'b';
            }
          }
          return new B().tag();
        }
      }
      expect(f()).toBe('ab');
    };"
  `);
});

test('007 JS Hermes Misc > class declarations in finally blocks > class declared in a nested block inside finally', async () => {
  const source =
    "() => {\n        function f(cond) {\n          try {\n            throw 1;\n          } catch (_) {\n          } finally {\n            if (cond) {\n              class C {\n                static v = 'inner';\n              }\n              return C.v;\n            }\n            return 'fallback';\n          }\n        }\n        expect(f(true)).toBe('inner');\n        expect(f(false)).toBe('fallback');\n      }";
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f(cond) {
        try {
          throw 1;
        } catch (_) {
        } finally {
          if (cond) {
            class C {
              static v = 'inner';
            }
            return C.v;
          }
          return 'fallback';
        }
      }
      expect(f(true)).toBe('inner');
      expect(f(false)).toBe('fallback');
    };"
  `);
});

test('008 JS Hermes Misc > class declarations in finally blocks > class expression assigned in finally', async () => {
  const source =
    '() => {\n        function f() {\n          try {\n            throw 1;\n          } catch (_) {\n          } finally {\n            const C = class {\n              static v = 5;\n            };\n            return C.v;\n          }\n        }\n        expect(f()).toBe(5);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f() {
        try {
          throw 1;
        } catch (_) {
        } finally {
          const C = class {
            static v = 5;
          };
          return C.v;
        }
      }
      expect(f()).toBe(5);
    };"
  `);
});

test('009 JS Hermes Misc > class declarations in finally blocks > control: class outside try/finally', async () => {
  const source =
    '() => {\n        class C {\n          static x = 42;\n        }\n        expect(C.x).toBe(42);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      class C {
        static x = 42;
      }
      expect(C.x).toBe(42);
    };"
  `);
});

test('010 JS Hermes Misc > class declarations in finally blocks > control: class inside try block (not finally)', async () => {
  const source =
    '() => {\n        function f() {\n          try {\n            class C {\n              static x = 42;\n            }\n            return C.x;\n          } catch (_) {\n            return -1;\n          }\n        }\n        expect(f()).toBe(42);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f() {
        try {
          class C {
            static x = 42;
          }
          return C.x;
        } catch (_) {
          return -1;
        }
      }
      expect(f()).toBe(42);
    };"
  `);
});

test('011 JS Hermes Misc > class declarations in finally blocks > control: class inside catch block (not finally)', async () => {
  const source =
    '() => {\n        function f() {\n          try {\n            throw 1;\n          } catch (_) {\n            class C {\n              static x = 42;\n            }\n            return C.x;\n          }\n        }\n        expect(f()).toBe(42);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      function f() {
        try {
          throw 1;
        } catch (_) {
          class C {
            static x = 42;
          }
          return C.x;
        }
      }
      expect(f()).toBe(42);
    };"
  `);
});

test('012 JS Hermes Misc > super in object literal accessors > non-computed getter reads super', async () => {
  const source =
    '() => {\n        const o = {\n          get a() {\n            return super.m;\n          },\n        };\n        Object.setPrototypeOf(o, { m: 12 });\n        expect(o.a).toBe(12);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      const o = {
        get a() {
          return super.m;
        },
      };
      Object.setPrototypeOf(o, { m: 12 });
      expect(o.a).toBe(12);
    };"
  `);
});

test('013 JS Hermes Misc > super in object literal accessors > non-computed setter writes super', async () => {
  const source =
    '() => {\n        const target = { _m: 0 };\n        const o = {\n          set a(v) {\n            super.m = v;\n          },\n        };\n        Object.setPrototypeOf(o, {\n          set m(v) {\n            target._m = v;\n          },\n        });\n        o.a = 99;\n        expect(target._m).toBe(99);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      const target = { _m: 0 };
      const o = {
        set a(v) {
          super.m = v;
        },
      };
      Object.setPrototypeOf(o, {
        set m(v) {
          target._m = v;
        },
      });
      o.a = 99;
      expect(target._m).toBe(99);
    };"
  `);
});

test('014 JS Hermes Misc > super in object literal accessors > non-computed getter with string-literal key reads super', async () => {
  const source =
    "() => {\n        const o = {\n          get 'weird key'() {\n            return super.m;\n          },\n        };\n        Object.setPrototypeOf(o, { m: 'ok' });\n        expect(o['weird key']).toBe('ok');\n      }";
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      const o = {
        get 'weird key'() {
          return super.m;
        },
      };
      Object.setPrototypeOf(o, { m: 'ok' });
      expect(o['weird key']).toBe('ok');
    };"
  `);
});

test('015 JS Hermes Misc > super in object literal accessors > paired getter/setter on the same key', async () => {
  const source =
    '() => {\n        const store = { _v: 0 };\n        const o = {\n          get a() {\n            return super.m;\n          },\n          set a(v) {\n            super.m = v;\n          },\n        };\n        Object.setPrototypeOf(o, {\n          get m() {\n            return store._v;\n          },\n          set m(v) {\n            store._v = v;\n          },\n        });\n        o.a = 5;\n        expect(o.a).toBe(5);\n        expect(store._v).toBe(5);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      const store = { _v: 0 };
      const o = {
        get a() {
          return super.m;
        },
        set a(v) {
          super.m = v;
        },
      };
      Object.setPrototypeOf(o, {
        get m() {
          return store._v;
        },
        set m(v) {
          store._v = v;
        },
      });
      o.a = 5;
      expect(o.a).toBe(5);
      expect(store._v).toBe(5);
    };"
  `);
});

test('016 JS Hermes Misc > super in object literal accessors > getter reaches super through a nested arrow', async () => {
  const source =
    '() => {\n        const o = {\n          get a() {\n            return (() => super.m)();\n          },\n        };\n        Object.setPrototypeOf(o, { m: 7 });\n        expect(o.a).toBe(7);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      const o = {
        get a() {
          return (() => super.m)();
        },
      };
      Object.setPrototypeOf(o, { m: 7 });
      expect(o.a).toBe(7);
    };"
  `);
});

test('017 JS Hermes Misc > super in object literal accessors > control: computed getter with super', async () => {
  const source =
    "() => {\n        const o = {\n          get ['a']() {\n            return super.m;\n          },\n        };\n        Object.setPrototypeOf(o, { m: 1 });\n        expect(o.a).toBe(1);\n      }";
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      const o = {
        get ['a']() {
          return super.m;
        },
      };
      Object.setPrototypeOf(o, { m: 1 });
      expect(o.a).toBe(1);
    };"
  `);
});

test('018 JS Hermes Misc > super in object literal accessors > control: getter without super', async () => {
  const source =
    '() => {\n        const o = {\n          get a() {\n            return 3;\n          },\n        };\n        expect(o.a).toBe(3);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      const o = {
        get a() {
          return 3;
        },
      };
      expect(o.a).toBe(3);
    };"
  `);
});

test('019 JS Hermes Misc > super in object literal accessors > control: class accessor with super', async () => {
  const source =
    '() => {\n        class Base {\n          get m() {\n            return 8;\n          }\n        }\n        class C extends Base {\n          get a() {\n            return super.m;\n          }\n        }\n        expect(new C().a).toBe(8);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      class Base {
        get m() {
          return 8;
        }
      }
      class C extends Base {
        get a() {
          return super.m;
        }
      }
      expect(new C().a).toBe(8);
    };"
  `);
});

test('020 JS Hermes Misc > super in object literal accessors > control: nested object accessor owns its own super', async () => {
  const source =
    '() => {\n        const o = {\n          get a() {\n            return {\n              get b() {\n                return super.m;\n              },\n            };\n          },\n        };\n        const inner = o.a;\n        Object.setPrototypeOf(inner, { m: 4 });\n        expect(inner.b).toBe(4);\n      }';
  expect(await transformOutcome(source, 'input.js', {})).toMatchInlineSnapshot(`
    "() => {
      const o = {
        get a() {
          return {
            get b() {
              return super.m;
            },
          };
        },
      };
      const inner = o.a;
      Object.setPrototypeOf(inner, { m: 4 });
      expect(inner.b).toBe(4);
    };"
  `);
});
