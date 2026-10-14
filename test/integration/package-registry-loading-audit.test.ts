import { execFileSync } from 'node:child_process';
import { beforeAll, describe, expect, test } from 'vitest';

for (const { directory, executable, architecture } of [
  {
    directory: process.env.NOXCTURNAL_AUDIT_REGISTRY_ROOT,
    executable: process.execPath,
    architecture: 'arm64',
  },
  {
    directory: process.env.NOXCTURNAL_AUDIT_REGISTRY_X64_ROOT,
    executable: process.env.NOXCTURNAL_AUDIT_X64_NODE ?? process.execPath,
    architecture: 'x64',
  },
])
  describe.skipIf(!directory)(`isolated registry-installed darwin-${architecture} package`, () => {
    let actual: {
      architecture: string;
      version: string;
      nativeVersion: string;
      loadedFromOptional: boolean;
      value: number;
      syntax: string;
      esm: unknown;
    };
    beforeAll(() => {
      const script = `
      import {createRequire} from 'node:module';
      const require=createRequire(import.meta.url);
      const assert=require('node:assert/strict');
      const fs=require('node:fs');
      const path=require('node:path');
      (async()=>{
        const api=require('noxcturnal');
        const native=require.resolve('@noxcturnal/noxcturnal-darwin-'+process.arch);
        const nativeVersion=JSON.parse(fs.readFileSync(path.join(path.dirname(native),'package.json'),'utf8')).version;
        const result=api.transform('function read(value=3){return value}globalThis.result=read();','fixture.js',api.defineNativePipeline({phases:[{name:'parameters',native:{transforms:{parameters:true},helpers:{mode:'inline'}}}]}));
        assert.equal(result.status,'complete');
        assert(!/read\\(value\\s*=/.test(result.code));
        const context={};new Function('globalThis',result.code)(context);
        const loaded=Object.keys(require.cache).filter(file=>file.endsWith('.node'));
        let esm;try{const module=await import('noxcturnal');esm={loaded:typeof module.transform}}catch(error){esm={name:error.name,message:error.message}}
        console.log(JSON.stringify({architecture:process.arch,version:require('noxcturnal/package.json').version,nativeVersion,loadedFromOptional:loaded.length===1&&loaded[0]===native,value:context.result,syntax:api.classify('fixture.ts','const x:number=3').syntax,esm}));
      })().catch(error=>{console.error(error);process.exitCode=1});
    `;
      actual = JSON.parse(
        execFileSync(executable, ['--input-type=module', '--eval', script], {
          cwd: directory,
          encoding: 'utf8',
          timeout: 30_000,
        }),
      );
      expect(actual.esm).toEqual({
        name: 'ReferenceError',
        message: '__dirname is not defined in ES module scope',
      });
    });
    test('loads the exact host optional package rather than a repository binary', () => {
      expect([
        actual.architecture,
        actual.version,
        actual.nativeVersion,
        actual.loadedFromOptional,
      ]).toEqual([architecture, '0.1.1', '0.1.1', true]);
    });
    test('executes the published native transformation and classification', () => {
      expect([actual.value, actual.syntax]).toEqual([3, 'ts']);
    });
    test.fails('loads the published ESM entry', () => {
      expect(actual.esm).toEqual({ loaded: 'function' });
    });
  });
