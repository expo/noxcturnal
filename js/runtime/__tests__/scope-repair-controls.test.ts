import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { NativeTransformSession } from '../session';

function run(source: string) {
  const globalThis: { result?: unknown } = {};
  new Function('globalThis', source)(globalThis);
  return globalThis.result;
}
function edit(source: string, visitors: any[]) {
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [
        { name: 'edit', plugins: [defineNativePlugin({ name: 'scope-controls', visitors })] },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  return result.code;
}

for (const [type, source] of [
  ['StaticBlock', 'class C{static /* { comment } */ {globalThis.result=a+b}}'],
  ['ArrowFunctionExpression', 'const f=()=>a+b;globalThis.result=[f(),f()]'],
  ['ArrowFunctionExpression', 'const f=()=>({value:a+b});globalThis.result=f().value'],
  ['Function', 'function f(){"use strict";return a+b}globalThis.result=f()'],
  ['CatchClause', 'try{throw 1}catch(error){globalThis.result=a+b+error-1}'],
  ['ForStatement', 'globalThis.result=[];for(let i=0;i<2;i++)globalThis.result.push(++a+b-1)'],
  ['ForOfStatement', 'globalThis.result=[];for(let i of [0,1]){globalThis.result.push(++a+b-1)}'],
] as const) {
  test(`repeated push: ${type} ${source}`, () => {
    const code = edit(source, [
      defineVisitor(type, { scope: true }, path => {
        path.scope.push('var a=1');
        path.scope.push('var b=2 // trailing comment');
      }),
    ]);
    expect(run(code)).toEqual(
      source.includes('result=[]') || source.includes('[f(),f()]') ? [3, 3] : 3,
    );
    if (type === 'ArrowFunctionExpression') expect(code.split('return (').length - 1).toBe(1);
    if (type === 'ForStatement') expect(code.split('{').length - 1).toBe(1);
  });
}

for (const separate of [false, true]) {
  test(`multiple exported bindings, separate routes=${separate}`, async () => {
    const renameA = defineVisitor('Program', { scope: true }, path => {
      path.scope.rename('a', 'x');
      if (!separate) path.scope.rename('b', 'y');
    });
    const visitors = [renameA];
    if (separate)
      visitors.push(
        defineVisitor('Program', { scope: true, comments: 'inner' }, path => {
          path.scope.rename('b', 'y');
        }),
      );
    const code = edit('export let a=1,b=2; export function update(){a++;b++}', visitors);
    const module = await import(
      `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${crypto.randomUUID()}`
    );
    expect([module.a, module.b]).toEqual([1, 2]);
    module.update();
    expect([module.a, module.b]).toEqual([2, 3]);
    expect(Object.keys(module).sort()).toEqual(['a', 'b', 'update']);
  });
}

for (const source of [
  'const {outer:{value=9}}={outer:{value:3}};globalThis.result=value',
  'const key="value";const {[key]:value}={value:3};globalThis.result=value',
  'var value=3;for(var value of []){};var value;globalThis.result=value',
  'let value=3;function f(value){return value}globalThis.result=value+f(4)-4',
])
  test(`rename identity: ${source}`, () => {
    const code = edit(source, [
      defineVisitor('Program', { scope: true }, path => {
        path.scope.rename('value', 'renamed');
      }),
    ]);
    expect(code).not.toBe(source);
    expect(run(code)).toBe(3);
  });

for (const spelling of [
  String.raw`\u005ftemp`,
  String.raw`_temp\u0032`,
  String.raw`_t\u{65}mp`,
  String.raw`_temp\u{32}`,
]) {
  test(`UID decoded spelling ${spelling}`, () => {
    const session = new NativeTransformSession(`const ${spelling}=1`, 'input.js');
    try {
      const names = [session.generateUid('temp'), session.generateUid('temp')];
      expect(names).not.toContain(
        spelling.replace(/\\u(?:\{([\da-f]+)\}|([\da-f]{4}))/gi, (_, a, b) =>
          String.fromCodePoint(parseInt(a ?? b, 16)),
        ),
      );
    } finally {
      session.close();
    }
  });
}
for (const source of [
  String.raw`// \u{110000}`,
  String.raw`// \u{xyz}`,
  String.raw`// \uD801\uDC00`,
  String.raw`// \u{10400}`,
]) {
  test(`UID malformed/non-ASCII comment ${source}`, () => {
    const session = new NativeTransformSession(source, 'input.js');
    try {
      expect(session.generateUid('temp')).toBe('_temp');
    } finally {
      session.close();
    }
  });
}

test('cold binding scope ancestry terminates and bulk globals remain lexical-only', () => {
  edit('function outer(){function inner(){return external}}', [
    defineVisitor('Identifier', { scope: true, fields: ['name'] }, path => {
      if (path.node.name !== 'external') return;
      expect(path.scope.getBinding('outer')!.scope!.getProgramParent().parent).toBeNull();
      expect(path.scope.getBindings(['external'])).toEqual([]);
      expect(path.scope.getBinding('external')!.references[0].read).toBe(true);
    }),
  ]);
});

test('conflicting repeated rename rejects rather than corrupting a binding', () => {
  expect(() =>
    edit('const value=1;globalThis.result=value', [
      defineVisitor('Program', { scope: true }, path => {
        path.scope.rename('value', 'first');
        path.scope.rename('value', 'second');
      }),
    ]),
  ).toThrow();
});

for (const source of [
  'const value=3;const {x=value}={};globalThis.result=x',
  'const value=3;let x;({x=value}={});globalThis.result=x',
])
  test(`default RHS reference rename ${source}`, () =>
    expect(
      run(
        edit(source, [
          defineVisitor('Program', { scope: true }, path => {
            path.scope.rename('value', 'renamed');
          }),
        ]),
      ),
    ).toBe(3));

test('push separates ASI-sensitive statements and original body', () => {
  const source = 'function f(){(function(){globalThis.result.push(3)})()}globalThis.result=[];f()';
  const code = edit(source, [
    defineVisitor('Function', { scope: true }, path => {
      if (path.start !== 0) return;
      path.scope.push('const a=()=>globalThis.result.push(1)');
      path.scope.push('(a)()');
    }),
  ]);
  expect(run(code)).toEqual([1, 3]);
});
test('distinct plugins share one export rewrite for one declaration', async () => {
  const plugin = (pluginName: string, name: string, target: string) =>
    defineNativePlugin({
      name: pluginName,
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          path.scope.rename(name, target);
        }),
      ],
    });
  const result = transform(
    'export let a=1,b=2; export function update(){a++;b++}',
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'edit',
          plugins: [plugin('same-name', 'a', 'x'), plugin('same-name', 'b', 'y')],
        },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code.split('export {').length - 1).toBe(1);
  expect(result.code).toContain('x as a');
  expect(result.code).toContain('y as b');
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}#${crypto.randomUUID()}`
  );
  expect([module.a, module.b]).toEqual([1, 2]);
  module.update();
  expect([module.a, module.b]).toEqual([2, 3]);
  expect(Object.keys(module).sort()).toEqual(['a', 'b', 'update']);
});
test('distinct plugins cannot rename one binding to two names', () => {
  const plugin = (target: string) =>
    defineNativePlugin({
      name: 'rename',
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          path.scope.rename('value', target);
        }),
      ],
    });
  expect(() =>
    transform(
      'const value=1;globalThis.result=value',
      'input.js',
      defineNativePipeline({
        phases: [{ name: 'edit', plugins: [plugin('first'), plugin('second')] }],
      }),
    ),
  ).toThrow(/overlapping edits/);
});

for (const source of [
  'try{throw {value:3}}catch({value}){globalThis.result=value}',
  'try{throw 3}catch(value){globalThis.result=value}',
])
  test(`catch ownership ${source}`, () => {
    const code = edit(source, [
      defineVisitor('CatchClause', { scope: true }, path => {
        expect(path.scope.hasBinding('value')).toBe(true);
        expect(path.scope.path!.type).toBe('BlockStatement');
        expect(path.scope.parent!.id).not.toBe(path.scope.id);
        path.scope.rename('value', 'renamed');
        path.scope.push('const extra=1');
      }),
    ]);
    expect(run(code)).toBe(3);
  });
for (const [label, type, source, opens] of [
  ['arrow', 'ArrowFunctionExpression', 'const f=()=>a+b;globalThis.result=[f(),f()]', 'return ('],
  [
    'loop',
    'ForStatement',
    'globalThis.result=[];for(let i=0;i<2;i++)globalThis.result.push(a+b)',
    '{',
  ],
] as const)
  test(`distinct plugins share one ${label} wrapper`, () => {
    const make = (text: string) =>
      defineNativePlugin({
        name: 'same',
        visitors: [
          defineVisitor(type, { scope: true }, path => {
            path.scope.push(text);
          }),
        ],
      });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [{ name: 'edit', plugins: [make('var a=1'), make('var b=2')] }],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(run(result.code)).toEqual([3, 3]);
    expect(result.code.split(opens).length - 1).toBe(1);
  });
test('ordinary scope list pushes from distinct same-name plugins compose', () => {
  const make = (text: string) =>
    defineNativePlugin({
      name: 'same',
      visitors: [defineVisitor('Function', { scope: true }, path => path.scope.push(text))],
    });
  const result = transform(
    'function f(){return a+b}globalThis.result=f()',
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'edit', plugins: [make('const a=1'), make('const b=2')] }],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status === 'complete') expect(run(result.code)).toBe(3);
});

for (const content of [
  '(()=>globalThis.result=3)()',
  '[3].forEach(x=>globalThis.result=x)',
  '`value`;globalThis.result=3',
  '+(globalThis.result=3)',
])
  test(`scope push directive ASI ${content}`, () => {
    const code = edit('function f(){"use strict"\nreturn 1}f()', [
      defineVisitor('Function', { scope: true }, path => {
        path.scope.push(content);
      }),
    ]);
    expect(run(code)).toBe(3);
    expect(code.indexOf('"use strict"')).toBeLessThan(code.indexOf(content));
  });

test('static block insertion stays inside the owned block', () => {
  const code = edit('class C{static /* { comment } */ {globalThis.result=a}}\nlet a=9', [
    defineVisitor('StaticBlock', { scope: true }, path => {
      path.scope.push('let a=1');
    }),
  ]);
  expect(run(code)).toBe(1);
  const inserted = code.indexOf('let a=1');
  expect(inserted).toBeGreaterThan(code.indexOf('static'));
  expect(inserted).toBeLessThan(code.indexOf('globalThis.result'));
  expect(code).toContain('/* { comment } */');
});
test('class scope push inserts in the enclosing block, not the class body', () => {
  const code = edit(
    'function f(){ {const C=class Inner{m(){return a}};return new C().m()} } globalThis.result=f()',
    [
      defineVisitor('Class', { scope: true }, path => {
        if (!path.scope.hasBinding('Inner')) return;
        path.scope.push('var a=1');
      }),
    ],
  );
  expect(run(code)).toBe(1);
  const functionBrace = code.indexOf('{');
  const blockBrace = code.indexOf('{', functionBrace + 1);
  const inserted = code.indexOf('var a=1');
  expect(inserted).toBeGreaterThan(blockBrace);
  expect(inserted).toBeLessThan(code.indexOf('class Inner'));
  expect(code).not.toMatch(/class Inner\{[^}]*var a/);
});
test('switch scope push inserts in the function, not before the first case', () => {
  const code = edit('function f(){ {switch(1){case 1:return a}} } globalThis.result=f()', [
    defineVisitor('SwitchStatement', { scope: true }, path => {
      path.scope.push('var a=1');
    }),
  ]);
  expect(run(code)).toBe(1);
  const functionBrace = code.indexOf('{');
  const blockBrace = code.indexOf('{', functionBrace + 1);
  const inserted = code.indexOf('var a=1');
  expect(inserted).toBeGreaterThan(functionBrace);
  expect(inserted).toBeLessThan(blockBrace);
  expect(code).not.toMatch(/switch\(1\)\{\s*var a/);
});
test('switch inside a static block inserts in that static block', () => {
  const code = edit('class C{static /* { */ {switch(1){case 1:globalThis.result=a}}}', [
    defineVisitor('SwitchStatement', { scope: true }, path => {
      path.scope.push('let a=1');
    }),
  ]);
  expect(run(code)).toBe(1);
  const inserted = code.indexOf('let a=1');
  expect(inserted).toBeGreaterThan(code.indexOf('static'));
  expect(inserted).toBeLessThan(code.indexOf('switch'));
});
test('concise arrow push parenthesizes the returned expression once', () => {
  const code = edit('const f=()=>(a,{value:b});globalThis.result=[f(),f()]', [
    defineVisitor('ArrowFunctionExpression', { scope: true }, path => {
      path.scope.push('var a=1');
      path.scope.push('var b=3');
    }),
  ]);
  expect(run(code)).toEqual([{ value: 3 }, { value: 3 }]);
  expect(code.split('return (').length - 1).toBe(1);
  expect(code).toContain('return (');
  expect(code).toContain('{value:b}');
});
