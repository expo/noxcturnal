import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
async function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const kind of ['break', 'errors', 'async disposal', 'for-await']) {
  const asynchronous = kind === 'async disposal' || kind === 'for-await';
  const source = `const log=[];const resource={${asynchronous ? 'async [Symbol.asyncDispose]()' : '[Symbol.dispose]()'}{${asynchronous ? 'await 0;' : ''}log.push('dispose');${kind === 'errors' ? `throw new Error('dispose');` : ''}}};const iterable={[Symbol.iterator](){return{next(){return{value:resource,done:false};},return(){log.push('close');${kind === 'errors' ? `throw new Error('close');` : 'return {done:true};'}}};}};globalThis.result=(async()=>{try{outer:for ${kind === 'for-await' ? 'await ' : ''}(${asynchronous ? 'await using' : 'using'} value of iterable){log.push('body');${kind === 'errors' ? `throw new Error('body');` : 'break outer;'}}}catch(error){log.push(error.name);${kind === 'errors' ? `log.push(error.error?.message,error.suppressed?.message);` : ''}}return log;})();`;
  const expected =
    kind === 'errors'
      ? ['body', 'dispose', 'close', 'SuppressedError', 'dispose', 'body']
      : ['body', 'dispose', 'close'];
  test.skipIf(!nativeSupported)(`${kind}, native`, () => {
    expect(
      JSON.parse(
        execFileSync(
          nativeNode,
          [
            '--eval',
            source +
              `;Promise.resolve(globalThis.result).then(result=>console.log(JSON.stringify(result)),error=>{console.error(error);process.exitCode=1;});`,
          ],
          { encoding: 'utf8', timeout: 5000 },
        ),
      ),
    ).toEqual(expected);
  });
  for (const lower of [false, true])
    test.each(['inline', 'runtime'] as const)(`${kind}, lower=${lower}, %s`, async mode => {
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-explicit-resource-management'),
          ...(lower
            ? [
                require(
                  kind === 'for-await'
                    ? '@babel/plugin-transform-async-generator-functions'
                    : '@babel/plugin-transform-for-of',
                ),
              ]
            : []),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ],
      })!.code!;
      expect(await run(reference)).toEqual(
        asynchronous && !(kind === 'for-await' && lower) ? ['close', 'TypeError'] : expected,
      );
      const code = compile(source, {
        transforms: {
          explicitResourceManagement: true,
          forOf: lower && kind !== 'for-await',
          asyncGeneratorFunctions: lower && kind === 'for-await',
        },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/\busing\s+value\b/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      if (lower)
        expect(code).not.toMatch(kind === 'for-await' ? /for\s+await\s*\(/ : /for\s*\([^;]*\bof\b/);
      expect(await run(code)).toEqual(expected);
      if (lower) {
        const iteration = {
          forOf: kind !== 'for-await',
          asyncGeneratorFunctions: kind === 'for-await',
        };
        for (const phases of [
          [{ explicitResourceManagement: true }, iteration],
          [iteration, { explicitResourceManagement: true }],
        ]) {
          let staged = source;
          for (const transforms of phases)
            staged = compile(staged, { transforms, helpers: { mode, version: '7.29.7' } });
          expect(staged).not.toMatch(/\busing\s+value\b/);
          expect(await run(staged)).toEqual(expected);
        }
      }
    });
}
