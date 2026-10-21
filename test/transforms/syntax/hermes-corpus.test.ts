import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {},
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'class declarations in finally blocks > static field on a class declared in finally',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > instance field on a class declared in finally',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > private method on a class declared in finally',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > class with computed key declared in finally',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > class with extends declared in finally',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > multiple classes declared in the same finally',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > class declared in a nested block inside finally',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > class expression assigned in finally',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > control: class outside try/finally',
    source: `() => {
        class C {
          static x = 42;
        }
        expect(C.x).toBe(42);
      }`,
    output: `() => {
  class C {
    static x = 42;
  }
  expect(C.x).toBe(42);
};`,
  },
  {
    title: 'class declarations in finally blocks > control: class inside try block (not finally)',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'class declarations in finally blocks > control: class inside catch block (not finally)',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'super in object literal accessors > non-computed getter reads super',
    source: `() => {
        const o = {
          get a() {
            return super.m;
          },
        };
        Object.setPrototypeOf(o, { m: 12 });
        expect(o.a).toBe(12);
      }`,
    output: `() => {
  const o = {
    get a() {
      return super.m;
    },
  };
  Object.setPrototypeOf(o, { m: 12 });
  expect(o.a).toBe(12);
};`,
  },
  {
    title: 'super in object literal accessors > non-computed setter writes super',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title:
      'super in object literal accessors > non-computed getter with string-literal key reads super',
    source: `() => {
        const o = {
          get 'weird key'() {
            return super.m;
          },
        };
        Object.setPrototypeOf(o, { m: 'ok' });
        expect(o['weird key']).toBe('ok');
      }`,
    output: `() => {
  const o = {
    get 'weird key'() {
      return super.m;
    },
  };
  Object.setPrototypeOf(o, { m: 'ok' });
  expect(o['weird key']).toBe('ok');
};`,
  },
  {
    title: 'super in object literal accessors > paired getter/setter on the same key',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'super in object literal accessors > getter reaches super through a nested arrow',
    source: `() => {
        const o = {
          get a() {
            return (() => super.m)();
          },
        };
        Object.setPrototypeOf(o, { m: 7 });
        expect(o.a).toBe(7);
      }`,
    output: `() => {
  const o = {
    get a() {
      return (() => super.m)();
    },
  };
  Object.setPrototypeOf(o, { m: 7 });
  expect(o.a).toBe(7);
};`,
  },
  {
    title: 'super in object literal accessors > control: computed getter with super',
    source: `() => {
        const o = {
          get ['a']() {
            return super.m;
          },
        };
        Object.setPrototypeOf(o, { m: 1 });
        expect(o.a).toBe(1);
      }`,
    output: `() => {
  const o = {
    get ['a']() {
      return super.m;
    },
  };
  Object.setPrototypeOf(o, { m: 1 });
  expect(o.a).toBe(1);
};`,
  },
  {
    title: 'super in object literal accessors > control: getter without super',
    source: `() => {
        const o = {
          get a() {
            return 3;
          },
        };
        expect(o.a).toBe(3);
      }`,
    output: `() => {
  const o = {
    get a() {
      return 3;
    },
  };
  expect(o.a).toBe(3);
};`,
  },
  {
    title: 'super in object literal accessors > control: class accessor with super',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
  {
    title: 'super in object literal accessors > control: nested object accessor owns its own super',
    source: `() => {
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
      }`,
    output: `() => {
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
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
