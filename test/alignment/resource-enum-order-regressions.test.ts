import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
const nativeSupported = spawnSync(nativeNode, ['--eval', '{using r=null;}']).status === 0;
const cases = [
  [
    'numeric and string exports',
    `export enum A{X=(log.push('enum'),2),Y=3,S='text'}log.push(A.X,A.Y,A.S);`,
    ['enum', 2, 3, 'text'],
  ],
  ['separate named export', `enum A{X=(log.push('enum'),2)}export {A};log.push(A.X);`, ['enum', 2]],
  [
    'merged enums',
    `export enum A{X=(log.push('first'),2)}log.push(A.X);export enum A{Y=(log.push('second'),3)}log.push(A.X,A.Y);`,
    ['first', 2, 'second', 2, 3],
  ],
  [
    'default and later resource',
    `export default (log.push('default'),3);export enum A{X=(log.push('enum'),2)}using later={[Symbol.dispose](){log.push('later-dispose')}};`,
    ['default', 'enum', 'later-dispose'],
  ],
  [
    'initializer throws',
    `export enum A{X=(()=>{log.push('enum');throw new RangeError('enum')})()}`,
    ['enum'],
  ],
] as const;
for (const [name, body, effects] of cases) {
  for (const mode of ['native', 'inline', 'runtime'] as const) {
    test.skipIf(mode === 'native' && !nativeSupported)(`${name}, ${mode}`, () => {
      const source = `import {log} from './state.mjs';export {log};log.push('before');using resource={[Symbol.dispose](){log.push('dispose')}};${body}`;
      const reference = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
      }).outputText;
      const code =
        mode === 'native'
          ? reference
          : compile(
              source,
              {
                typescript: 'strip',
                transforms: { explicitResourceManagement: true },
                helpers: { mode, version: '7.29.7' },
              },
              'input.ts',
            );
      if (mode !== 'native') expect(code).not.toMatch(/\b(?:using|enum)\s+(?:resource|A)\b/);
      const dir = mkdtempSync(join(process.cwd(), '.resource-enum-'));
      try {
        writeFileSync(join(dir, 'state.mjs'), 'export const log=[];');
        const run = (code: string) => {
          const file = join(dir, 'input.mjs');
          writeFileSync(file, code);
          const script = `import {log} from ${JSON.stringify(pathToFileURL(join(dir, 'state.mjs')).href)};try{await import(${JSON.stringify(pathToFileURL(file).href)})}catch(e){log.push(e.name)}console.log(JSON.stringify(log));`;
          return JSON.parse(
            execFileSync(
              mode === 'native' ? nativeNode : process.execPath,
              ['--input-type=module', '--eval', script],
              {
                encoding: 'utf8',
              },
            ),
          );
        };
        const expected = [
          'before',
          ...effects,
          'dispose',
          ...(name === 'initializer throws' ? ['RangeError'] : []),
        ];
        expect(run(code)).toEqual(expected);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
}
