import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { buildSync, transformSync as transport } from 'esbuild';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const browser = process.env.NOXCTURNAL_AUDIT_CHROMIUM;
const roots = {
  '17': process.env.NOXCTURNAL_AUDIT_REACT17_ROOT,
  '18': process.env.NOXCTURNAL_AUDIT_REACT18_ROOT,
  '19': process.env.NOXCTURNAL_AUDIT_REACT_ROOT,
};
const versions = { '17': '17.0.2', '18': '18.3.1', '19': '19.3.0' };
const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
const sources = ['before', 'after'].map(
  tag => `export function useValue(value) {'use memo';return {value,tag:${JSON.stringify(tag)}}}`,
);
function observe(codes: string[], target: keyof typeof roots) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-source-reset-'));
  try {
    const packages = createRequire(join(roots[target]!, 'audit.cjs'));
    expect(packages('react/package.json').version).toBe(versions[target]);
    expect(packages('react-dom/package.json').version).toBe(versions[target]);
    const runtime = target === '19' ? 'react/compiler-runtime' : 'react-compiler-runtime';
    if (target !== '19')
      expect(packages('react-compiler-runtime/package.json').version).toBe('1.0.0');
    const bodies = codes.map(code => transport(code, { format: 'cjs' }).code);
    const entry = `
 const React=require(${JSON.stringify(packages.resolve('react'))});
 const ReactDOM=require(${JSON.stringify(packages.resolve('react-dom'))});
 ${target === '17' ? '' : `const {createRoot}=require(${JSON.stringify(packages.resolve('react-dom/client'))});`}
 const runtime=require(${JSON.stringify(packages.resolve(runtime))});
 const errors=[],dom=[],objects=[];
 function load(code){const module={exports:{}};new Function('module','require',code)(module,name=>{if(name!==${JSON.stringify(runtime)})throw Error(name);return runtime});return module.exports.useValue}
 let useValue=load(${JSON.stringify(bodies[0])});
 function App({value}){const result=useValue(value);objects.push(result);return React.createElement('span',null,result.tag+':'+result.value)}
 const container=document.createElement('div');document.body.append(container);
 const root=${target === '17' ? `{render:element=>ReactDOM.render(element,container),unmount:()=>ReactDOM.unmountComponentAtNode(container)}` : `createRoot(container,{onUncaughtError(error){errors.push(error.message)}})`};
 function render(value){ReactDOM.flushSync(()=>root.render(React.createElement(App,{value})));dom.push(container.textContent)}
 render(1);render(1);
 // HMR replaces the custom hook implementation while its calling component and
 // hook positions remain stable. No Refresh runtime clears the cache for us.
 useValue=load(${JSON.stringify(bodies[1])});render(1);render(1);render(2);
 const result={dom,reusedBefore:objects[0]===objects[1],reusedAfter:objects[2]===objects[3],changedOnEdit:objects[1]!==objects[2],errors};
 ReactDOM.flushSync(()=>root.unmount());
 const out=document.createElement('pre');out.id='audit-result';out.textContent=JSON.stringify(result);document.body.append(out);
 `;
    const bundled = buildSync({
      stdin: { contents: entry, resolveDir: process.cwd() },
      bundle: true,
      write: false,
      platform: 'browser',
      format: 'iife',
      define: { 'process.env.NODE_ENV': '"development"' },
    }).outputFiles[0].text;
    const filename = join(directory, 'index.html');
    writeFileSync(
      filename,
      `<body><script>${bundled.replaceAll('</script', '<\\/script')}</script></body>`,
    );
    const child = spawnSync(browser!, ['--headless', '--dump-dom', pathToFileURL(filename).href], {
      encoding: 'utf8',
      timeout: 15000,
      maxBuffer: 5000000,
    });
    expect(child.error).toBeUndefined();
    expect(child.signal).toBeNull();
    expect(child.status, child.stderr).toBe(0);
    const match = child.stdout.match(/<pre id="audit-result">([^<]+)<\/pre>/);
    expect(match, child.stderr).not.toBeNull();
    return JSON.parse(match![1]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
const expected = (reset: boolean) => ({
  dom: [
    'before:1',
    'before:1',
    reset ? 'after:1' : 'before:1',
    reset ? 'after:1' : 'before:1',
    'after:2',
  ],
  reusedBefore: true,
  reusedAfter: true,
  changedOnEdit: reset,
  errors: [],
});
for (const target of ['17', '18', '19'] as const) {
  describe.skipIf(!browser || !roots[target])(
    `source-edit cache invalidation, React ${target}`,
    () => {
      for (const enableResetCacheOnSourceFileChanges of [false, true]) {
        describe(`reset=${enableResetCacheOnSourceFileChanges}`, () => {
          let actual: unknown;
          beforeAll(() => {
            const options = {
              compilationMode: 'infer' as const,
              panicThreshold: 'none' as const,
              target,
              enableResetCacheOnSourceFileChanges,
            };
            const reference = sources.map(
              source =>
                transformSync(source, {
                  filename: 'input.js',
                  configFile: false,
                  babelrc: false,
                  plugins: [
                    [
                      referenceRequire('babel-plugin-react-compiler'),
                      { ...options, environment: { enableResetCacheOnSourceFileChanges } },
                    ],
                  ],
                })!.code!,
            );
            const code = sources.map(source => compile(source, { reactCompiler: options }));
            for (const output of [...reference, ...code])
              expect(output).toContain(
                target === '19' ? 'react/compiler-runtime' : 'react-compiler-runtime',
              );
            expect(observe(sources, target)).toEqual({
              ...expected(true),
              reusedBefore: false,
              reusedAfter: false,
            });
            expect(observe(reference, target)).toEqual(
              expected(enableResetCacheOnSourceFileChanges),
            );
            actual = observe(code, target);
            expect(actual).toEqual(expected(false));
          });
          (enableResetCacheOnSourceFileChanges ? test.fails : test)(
            'resets retained memo values only when requested',
            () => expect(actual).toEqual(expected(enableResetCacheOnSourceFileChanges)),
          );
        });
      }
    },
  );
}
