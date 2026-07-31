import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {},
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'class declarations in finally blocks > static field on a class declared in finally',
    '() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C {\n        static x = 42;\n      }\n      return C.x;\n    }\n  }\n  expect(f()).toBe(42);\n}',
    '() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C {\n        static x = 42;\n      }\n      return C.x;\n    }\n  }\n  expect(f()).toBe(42);\n};',
  ],
  [
    'class declarations in finally blocks > instance field on a class declared in finally',
    '() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C {\n        y = 7;\n      }\n      return new C().y;\n    }\n  }\n  expect(f()).toBe(7);\n}',
    '() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C {\n        y = 7;\n      }\n      return new C().y;\n    }\n  }\n  expect(f()).toBe(7);\n};',
  ],
  [
    'class declarations in finally blocks > private method on a class declared in finally',
    "() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C {\n        #m() {\n          return 'private';\n        }\n        call() {\n          return this.#m();\n        }\n      }\n      return new C().call();\n    }\n  }\n  expect(f()).toBe('private');\n}",
    "() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C {\n        #m() {\n          return 'private';\n        }\n        call() {\n          return this.#m();\n        }\n      }\n      return new C().call();\n    }\n  }\n  expect(f()).toBe('private');\n};",
  ],
  [
    'class declarations in finally blocks > class with computed key declared in finally',
    "() => {\n  function f() {\n    const k = 'computed';\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C {\n        [k] = 99;\n      }\n      return new C().computed;\n    }\n  }\n  expect(f()).toBe(99);\n}",
    "() => {\n  function f() {\n    const k = 'computed';\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C {\n        [k] = 99;\n      }\n      return new C().computed;\n    }\n  }\n  expect(f()).toBe(99);\n};",
  ],
  [
    'class declarations in finally blocks > class with extends declared in finally',
    "() => {\n  class Base {\n    base() {\n      return 'base';\n    }\n  }\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C extends Base {\n        child() {\n          return 'child';\n        }\n      }\n      const c = new C();\n      return c.base() + ':' + c.child();\n    }\n  }\n  expect(f()).toBe('base:child');\n}",
    "() => {\n  class Base {\n    base() {\n      return 'base';\n    }\n  }\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class C extends Base {\n        child() {\n          return 'child';\n        }\n      }\n      const c = new C();\n      return c.base() + ':' + c.child();\n    }\n  }\n  expect(f()).toBe('base:child');\n};",
  ],
  [
    'class declarations in finally blocks > multiple classes declared in the same finally',
    "() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class A {\n        tag() {\n          return 'a';\n        }\n      }\n      class B extends A {\n        tag() {\n          return super.tag() + 'b';\n        }\n      }\n      return new B().tag();\n    }\n  }\n  expect(f()).toBe('ab');\n}",
    "() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      class A {\n        tag() {\n          return 'a';\n        }\n      }\n      class B extends A {\n        tag() {\n          return super.tag() + 'b';\n        }\n      }\n      return new B().tag();\n    }\n  }\n  expect(f()).toBe('ab');\n};",
  ],
  [
    'class declarations in finally blocks > class declared in a nested block inside finally',
    "() => {\n  function f(cond) {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      if (cond) {\n        class C {\n          static v = 'inner';\n        }\n        return C.v;\n      }\n      return 'fallback';\n    }\n  }\n  expect(f(true)).toBe('inner');\n  expect(f(false)).toBe('fallback');\n}",
    "() => {\n  function f(cond) {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      if (cond) {\n        class C {\n          static v = 'inner';\n        }\n        return C.v;\n      }\n      return 'fallback';\n    }\n  }\n  expect(f(true)).toBe('inner');\n  expect(f(false)).toBe('fallback');\n};",
  ],
  [
    'class declarations in finally blocks > class expression assigned in finally',
    '() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      const C = class {\n        static v = 5;\n      };\n      return C.v;\n    }\n  }\n  expect(f()).toBe(5);\n}',
    '() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n    } finally {\n      const C = class {\n        static v = 5;\n      };\n      return C.v;\n    }\n  }\n  expect(f()).toBe(5);\n};',
  ],
  [
    'class declarations in finally blocks > control: class outside try/finally',
    '() => {\n  class C {\n    static x = 42;\n  }\n  expect(C.x).toBe(42);\n}',
    '() => {\n  class C {\n    static x = 42;\n  }\n  expect(C.x).toBe(42);\n};',
  ],
  [
    'class declarations in finally blocks > control: class inside try block (not finally)',
    '() => {\n  function f() {\n    try {\n      class C {\n        static x = 42;\n      }\n      return C.x;\n    } catch (_) {\n      return -1;\n    }\n  }\n  expect(f()).toBe(42);\n}',
    '() => {\n  function f() {\n    try {\n      class C {\n        static x = 42;\n      }\n      return C.x;\n    } catch (_) {\n      return -1;\n    }\n  }\n  expect(f()).toBe(42);\n};',
  ],
  [
    'class declarations in finally blocks > control: class inside catch block (not finally)',
    '() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n      class C {\n        static x = 42;\n      }\n      return C.x;\n    }\n  }\n  expect(f()).toBe(42);\n}',
    '() => {\n  function f() {\n    try {\n      throw 1;\n    } catch (_) {\n      class C {\n        static x = 42;\n      }\n      return C.x;\n    }\n  }\n  expect(f()).toBe(42);\n};',
  ],
  [
    'super in object literal accessors > non-computed getter reads super',
    '() => {\n  const o = {\n    get a() {\n      return super.m;\n    },\n  };\n  Object.setPrototypeOf(o, { m: 12 });\n  expect(o.a).toBe(12);\n}',
    '() => {\n  const o = {\n    get a() {\n      return super.m;\n    },\n  };\n  Object.setPrototypeOf(o, { m: 12 });\n  expect(o.a).toBe(12);\n};',
  ],
  [
    'super in object literal accessors > non-computed setter writes super',
    '() => {\n  const target = { _m: 0 };\n  const o = {\n    set a(v) {\n      super.m = v;\n    },\n  };\n  Object.setPrototypeOf(o, {\n    set m(v) {\n      target._m = v;\n    },\n  });\n  o.a = 99;\n  expect(target._m).toBe(99);\n}',
    '() => {\n  const target = { _m: 0 };\n  const o = {\n    set a(v) {\n      super.m = v;\n    },\n  };\n  Object.setPrototypeOf(o, {\n    set m(v) {\n      target._m = v;\n    },\n  });\n  o.a = 99;\n  expect(target._m).toBe(99);\n};',
  ],
  [
    'super in object literal accessors > non-computed getter with string-literal key reads super',
    "() => {\n  const o = {\n    get 'weird key'() {\n      return super.m;\n    },\n  };\n  Object.setPrototypeOf(o, { m: 'ok' });\n  expect(o['weird key']).toBe('ok');\n}",
    "() => {\n  const o = {\n    get 'weird key'() {\n      return super.m;\n    },\n  };\n  Object.setPrototypeOf(o, { m: 'ok' });\n  expect(o['weird key']).toBe('ok');\n};",
  ],
  [
    'super in object literal accessors > paired getter/setter on the same key',
    '() => {\n  const store = { _v: 0 };\n  const o = {\n    get a() {\n      return super.m;\n    },\n    set a(v) {\n      super.m = v;\n    },\n  };\n  Object.setPrototypeOf(o, {\n    get m() {\n      return store._v;\n    },\n    set m(v) {\n      store._v = v;\n    },\n  });\n  o.a = 5;\n  expect(o.a).toBe(5);\n  expect(store._v).toBe(5);\n}',
    '() => {\n  const store = { _v: 0 };\n  const o = {\n    get a() {\n      return super.m;\n    },\n    set a(v) {\n      super.m = v;\n    },\n  };\n  Object.setPrototypeOf(o, {\n    get m() {\n      return store._v;\n    },\n    set m(v) {\n      store._v = v;\n    },\n  });\n  o.a = 5;\n  expect(o.a).toBe(5);\n  expect(store._v).toBe(5);\n};',
  ],
  [
    'super in object literal accessors > getter reaches super through a nested arrow',
    '() => {\n  const o = {\n    get a() {\n      return (() => super.m)();\n    },\n  };\n  Object.setPrototypeOf(o, { m: 7 });\n  expect(o.a).toBe(7);\n}',
    '() => {\n  const o = {\n    get a() {\n      return (() => super.m)();\n    },\n  };\n  Object.setPrototypeOf(o, { m: 7 });\n  expect(o.a).toBe(7);\n};',
  ],
  [
    'super in object literal accessors > control: computed getter with super',
    "() => {\n  const o = {\n    get ['a']() {\n      return super.m;\n    },\n  };\n  Object.setPrototypeOf(o, { m: 1 });\n  expect(o.a).toBe(1);\n}",
    "() => {\n  const o = {\n    get ['a']() {\n      return super.m;\n    },\n  };\n  Object.setPrototypeOf(o, { m: 1 });\n  expect(o.a).toBe(1);\n};",
  ],
  [
    'super in object literal accessors > control: getter without super',
    '() => {\n  const o = {\n    get a() {\n      return 3;\n    },\n  };\n  expect(o.a).toBe(3);\n}',
    '() => {\n  const o = {\n    get a() {\n      return 3;\n    },\n  };\n  expect(o.a).toBe(3);\n};',
  ],
  [
    'super in object literal accessors > control: class accessor with super',
    '() => {\n  class Base {\n    get m() {\n      return 8;\n    }\n  }\n  class C extends Base {\n    get a() {\n      return super.m;\n    }\n  }\n  expect(new C().a).toBe(8);\n}',
    '() => {\n  class Base {\n    get m() {\n      return 8;\n    }\n  }\n  class C extends Base {\n    get a() {\n      return super.m;\n    }\n  }\n  expect(new C().a).toBe(8);\n};',
  ],
  [
    'super in object literal accessors > control: nested object accessor owns its own super',
    '() => {\n  const o = {\n    get a() {\n      return {\n        get b() {\n          return super.m;\n        },\n      };\n    },\n  };\n  const inner = o.a;\n  Object.setPrototypeOf(inner, { m: 4 });\n  expect(inner.b).toBe(4);\n}',
    '() => {\n  const o = {\n    get a() {\n      return {\n        get b() {\n          return super.m;\n        },\n      };\n    },\n  };\n  const inner = o.a;\n  Object.setPrototypeOf(inner, { m: 4 });\n  expect(inner.b).toBe(4);\n};',
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
