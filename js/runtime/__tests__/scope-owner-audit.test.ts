import { transformSync, type NodePath } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const cases = [
  { type: 'ForStatement', name: 'index', source: 'for(let index=0;index<2;index++){}' },
  { type: 'CatchClause', name: 'error', source: 'try{throw 1}catch(error){}' },

  { type: 'BlockStatement', name: 'local', source: '{let local=3;}' },
  { type: 'SwitchStatement', name: 'local', source: 'switch(1){case 1:let local=3;break;}' },
  { type: 'ForInStatement', name: 'key', source: 'for(let key in {}){}' },
  { type: 'ForOfStatement', name: 'item', source: 'for(let item of []){}' },
  { type: 'ClassExpression', name: 'Inner', source: 'const C=class Inner{};' },
  { type: 'StaticBlock', name: 'local', source: 'class C{static{var local=3;}}' },
  { type: 'FunctionDeclaration', name: 'param', source: 'function f(param){}' },
  { type: 'ArrowFunctionExpression', name: 'param', source: 'const f=param=>param;' },
] as const;
describe.each(cases)('$type owner scope', entry => {
  let nox: unknown, babel: unknown;
  beforeAll(() => {
    transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      plugins: [
        () => ({
          visitor: {
            [entry.type](path: NodePath) {
              babel = path.scope.hasBinding(entry.name);
            },
          },
        }),
      ],
    });
    const plugin = defineNativePlugin({
      name: 'owner-scope-audit',
      visitors: [
        defineVisitor(entry.type, { scope: true }, path => {
          nox = path.scope.hasBinding(entry.name);
        }),
      ],
    });
    const result = transform(
      entry.source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'inspect', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    expect(typeof nox).toBe('boolean');
  });
  test('Babel sees the scope-owned binding', () => expect(babel).toBe(true));
  const check =
    entry.type === 'FunctionDeclaration' || entry.type === 'ArrowFunctionExpression'
      ? test
      : test.fails;
  check('owner path exposes its local binding', () => expect(nox).toBe(true));
});
