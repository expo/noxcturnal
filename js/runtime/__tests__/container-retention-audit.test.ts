import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

for (const method of [
  'unshiftContainer',
  'pushContainer',
  'prependToBody',
  'appendToBody',
] as const) {
  test(`${method}: bodyless nodes use raw node boundaries`, () => {
    let visits = 0;
    const visitor = defineVisitor('NumericLiteral', {}, path => {
      visits++;
      if (method === 'unshiftContainer' || method === 'pushContainer') {
        path[method]('body', '/* inserted */');
      } else {
        path[method]('/* inserted */');
      }
    });
    const result = transform(
      '1;',
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'edit',
            plugins: [defineNativePlugin({ name: 'bodyless', visitors: [visitor] })],
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bodyless bailout');
    expect(visits).toBe(1);
    const prepend = method === 'unshiftContainer' || method === 'prependToBody';
    expect(result.code).toBe(prepend ? '/* inserted */1;' : '1/* inserted */;');
  });
  for (const retained of [false, true]) {
    describe(`${method}: body offsets retained=${retained}`, () => {
      let output: string;
      const prepend = method === 'unshiftContainer' || method === 'prependToBody';
      const source = 'function f(){return 1;}';
      const expected = prepend
        ? 'function f(){/* inserted */return 1;}'
        : 'function f(){return 1;/* inserted */}';
      beforeAll(() => {
        let visits = 0;
        const visitor = defineVisitor(
          'Function',
          { fields: retained ? ['bodyStart', 'bodyEnd'] : [] },
          path => {
            visits++;
            if (method === 'unshiftContainer' || method === 'pushContainer') {
              path[method]('body', '/* inserted */');
            } else {
              path[method]('/* inserted */');
            }
          },
        );
        const result = transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'edit',
                plugins: [defineNativePlugin({ name: 'container', visitors: [visitor] })],
              },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error('Unexpected container bailout');
        expect(visits).toBe(1);
        output = result.code;
        expect(output).toBe(
          retained ? expected : prepend ? `/* inserted */${source}` : `${source}/* inserted */`,
        );
      });
      (retained ? test : test.fails)('inserts inside the requested body', () => {
        expect(output).toBe(expected);
      });
    });
  }

  for (const route of ['BlockStatement', 'FunctionBody'] as const) {
    describe(`${method}: ${route} body`, () => {
      let output: string;
      const prefix = route === 'FunctionBody' ? 'function f()' : '';
      const source = `${prefix}{1;}`;
      const prepend = method === 'unshiftContainer' || method === 'prependToBody';
      const expected = prepend ? `${prefix}{/* inserted */1;}` : `${prefix}{1;/* inserted */}`;
      beforeAll(() => {
        let visits = 0;
        const visitor = defineVisitor(route, {}, path => {
          visits++;
          if (method === 'unshiftContainer' || method === 'pushContainer') {
            path[method]('body', '/* inserted */');
          } else {
            path[method]('/* inserted */');
          }
        });
        const result = transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'edit',
                plugins: [defineNativePlugin({ name: 'block-container', visitors: [visitor] })],
              },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error('Unexpected block bailout');
        expect(visits).toBe(1);
        output = result.code;
        expect(output).toBe(prepend ? `${prefix}/* inserted */{1;}` : `${source}/* inserted */`);
      });
      test.fails('inserts within the braces of the body', () => expect(output).toBe(expected));
    });
  }

  for (const concise of [false, true]) {
    describe(`${method}: concise arrow=${concise}`, () => {
      let valid: boolean;
      beforeAll(() => {
        let visits = 0;
        const source = concise ? 'const f=()=>1;' : 'const f=()=>{return 1;};';
        const visitor = defineVisitor(
          'ArrowFunctionExpression',
          { fields: ['bodyStart', 'bodyEnd'] },
          path => {
            visits++;
            if (method === 'unshiftContainer' || method === 'pushContainer') {
              path[method]('body', 'var inserted=0;');
            } else {
              path[method]('var inserted=0;');
            }
          },
        );
        const result = transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'edit',
                plugins: [defineNativePlugin({ name: 'arrow-container', visitors: [visitor] })],
              },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error('Unexpected arrow bailout');
        expect(visits).toBe(1);
        expect(() => new Function(source)).not.toThrow();
        try {
          new Function(result.code);
          valid = true;
        } catch (error) {
          expect(error).toBeInstanceOf(SyntaxError);
          valid = false;
        }
        expect(valid).toBe(!concise);
        if (!concise) expect(new Function(`${result.code}return f();`)()).toBe(1);
      });
      test(
        concise
          ? 'characterizes unsupported expression-body insertion'
          : 'inserts statements into an existing block body',
        () => expect(valid).toBe(!concise),
      );
    });
  }
}
