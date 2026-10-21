import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { buildSync, transformSync as transportModule } from 'esbuild';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const browser = process.env.NOXCTURNAL_AUDIT_CHROMIUM;
const reactRoot = process.env.NOXCTURNAL_AUDIT_REACT_ROOT;
const roots = {
  '17': process.env.NOXCTURNAL_AUDIT_REACT17_ROOT,
  '18': process.env.NOXCTURNAL_AUDIT_REACT18_ROOT,
  '19': reactRoot,
};
const versions = { '17': '17.0.2', '18': '18.3.1', '19': '19.3.0' };
const runtimeName = (target: keyof typeof roots) =>
  target === '19' ? 'react/compiler-runtime' : 'react-compiler-runtime';
const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
const source = `export function App({label}){'use memo';const value={label};return <Probe value={value}/>}`;
function observe(
  code: string,
  scenario?: 'suspend' | 'interrupt',
  target: keyof typeof roots = '19',
) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-compiler-'));
  try {
    const packages = createRequire(join(roots[target]!, 'audit.cjs'));
    expect(packages('react/package.json').version).toBe(versions[target]);
    expect(packages('react-dom/package.json').version).toBe(versions[target]);
    if (target !== '19')
      expect(packages('react-compiler-runtime/package.json').version).toBe('1.0.0');
    const body = transportModule(code, { format: 'cjs' }).code;
    const entry = `
      const React=require(${JSON.stringify(packages.resolve('react'))});
      ${target === '17' ? '' : `const {createRoot}=require(${JSON.stringify(packages.resolve('react-dom/client'))});`}
      const ReactDOM=require(${JSON.stringify(packages.resolve('react-dom'))});
      const {flushSync}=require(${JSON.stringify(packages.resolve('react-dom'))});
      const runtimes={'react':React,[${JSON.stringify(runtimeName(target))}]:require(${JSON.stringify(packages.resolve(runtimeName(target)))}),'react/jsx-runtime':require(${JSON.stringify(packages.resolve('react/jsx-runtime'))})};
      const values=[], errors=[], counts=[], dom=[], attempts=[];
      let blocked=true,release;const pending=new Promise(resolve=>{release=resolve});
      function Probe({value}){attempts.push(value.label);if(${Boolean(scenario)} && value.label==='C' && blocked)throw pending;values.push(value);return React.createElement('span',null,value.label)}
      const module={exports:{}};
      new Function('module','require','Probe',${JSON.stringify(body)})(module,name=>{if(!(name in runtimes))throw Error(name);return runtimes[name]},Probe);
      const App=module.exports.App;
      const container=document.createElement('div');document.body.append(container);
      const root=${target === '17' ? `{render:element=>ReactDOM.render(element,container),unmount:()=>ReactDOM.unmountComponentAtNode(container)}` : `createRoot(container,{onUncaughtError(error){errors.push(error.message)}})`};
      function render(first,second=true){flushSync(()=>root.render(React.createElement(React.Fragment,null,React.createElement(App,{key:'first',label:first}),second?React.createElement(App,{key:'second',label:'A'}):null)));counts.push(values.length);dom.push(container.textContent)}
      (async()=>{
      let result;
      ${
        scenario
          ? `
        const stages=[];
        const tree=label=>React.createElement(React.Suspense,{fallback:React.createElement('em',null,'waiting')},React.createElement(App,{label}));
        flushSync(()=>root.render(tree('A')));stages.push(container.innerText);
        if(${JSON.stringify(scenario === 'suspend')}){
          flushSync(()=>root.render(tree('C')));stages.push(container.innerText);
          blocked=false;release();await pending;
          flushSync(()=>root.render(tree('C')));stages.push(container.innerText);
        }else{
          React.startTransition(()=>root.render(tree('C')));
          await new Promise(resolve=>setTimeout(resolve,50));stages.push(container.innerText);
          flushSync(()=>root.render(tree('B')));stages.push(container.innerText);
          blocked=false;release();await new Promise(resolve=>setTimeout(resolve,100));
          flushSync(()=>{});stages.push(container.innerText);
        }
        result={stages,attemptedSuspend:attempts.includes('C'),errors};
      `
          : `
        render('A');const first=values[0],second=values[1];
        render('A');render('B');render('B');render('B',false);render('B');
        result={counts,dom,independent:first!==second,remounted:values.at(-1)!==second,errors};
      `
      }
      flushSync(()=>root.unmount());
      const output=document.createElement('pre');output.id='audit-result';output.textContent=JSON.stringify(result);document.body.append(output);
      })();
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
    const child = spawnSync(
      browser!,
      [
        '--headless',
        '--dump-dom',
        ...(scenario ? ['--virtual-time-budget=2000'] : []),
        pathToFileURL(filename).href,
      ],
      { encoding: 'utf8', timeout: 15_000, maxBuffer: 5_000_000 },
    );
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
const expected = {
  counts: [2, 2, 3, 3, 3, 4],
  dom: ['AA', 'AA', 'BA', 'BA', 'B', 'BA'],
  independent: true,
  remounted: true,
  errors: [],
};
for (const target of ['17', '18', '19'] as const) {
  describe.skipIf(!browser || !roots[target])(
    `React Compiler actual renders: target ${target}`,
    () => {
      for (const compilationMode of ['infer', 'syntax', 'annotation', 'all'] as const) {
        for (const enableResetCacheOnSourceFileChanges of [false, true]) {
          describe(`${compilationMode}, source reset=${enableResetCacheOnSourceFileChanges}`, () => {
            let actual: unknown;
            beforeAll(() => {
              const baseline = transformSync(source, {
                filename: 'input.jsx',
                configFile: false,
                babelrc: false,
                plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'automatic' }]],
              })!.code!;
              const native = observe(baseline, undefined, target);
              expect(native.dom).toEqual(expected.dom);
              expect(native.errors).toEqual([]);
              expect(native.counts).toEqual([2, 4, 6, 8, 9, 11]);
              const reference = transformSync(source, {
                filename: 'input.jsx',
                configFile: false,
                babelrc: false,
                plugins: [
                  [
                    referenceRequire('babel-plugin-react-compiler'),
                    {
                      compilationMode,
                      panicThreshold: 'none',
                      target,
                      environment: { enableResetCacheOnSourceFileChanges },
                    },
                  ],
                  [require('@babel/plugin-transform-react-jsx'), { runtime: 'automatic' }],
                ],
              })!.code!;
              expect(reference).toContain(runtimeName(target));
              expect(observe(reference, undefined, target)).toEqual(expected);
              const code = compile(
                source,
                {
                  reactCompiler: {
                    compilationMode,
                    panicThreshold: 'none',
                    target,
                    enableResetCacheOnSourceFileChanges,
                  },
                  jsx: 'automatic',
                },
                'input.jsx',
              );
              expect(code).toContain(runtimeName(target));
              expect(code).not.toContain('<Probe');
              actual = observe(code, undefined, target);
            });
            test('reuses equal inputs, invalidates changes, isolates instances and discards unmounted caches', () =>
              expect(actual).toEqual(expected));
          });
        }
      }
    },
  );
}

describe.skipIf(!browser || !reactRoot)('React Compiler suspended/abandoned renders', () => {
  for (const scenario of ['suspend', 'interrupt'] as const) {
    for (const enableResetCacheOnSourceFileChanges of [false, true]) {
      test(`${scenario}, source reset=${enableResetCacheOnSourceFileChanges}`, () => {
        const expected = {
          stages: scenario === 'suspend' ? ['A', 'waiting', 'C'] : ['A', 'A', 'B', 'B'],
          attemptedSuspend: true,
          errors: [],
        };
        const baseline = transformSync(source, {
          filename: 'input.jsx',
          configFile: false,
          babelrc: false,
          plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'automatic' }]],
        })!.code!;
        expect(observe(baseline, scenario)).toEqual(expected);
        const reference = transformSync(source, {
          filename: 'input.jsx',
          configFile: false,
          babelrc: false,
          plugins: [
            [
              referenceRequire('babel-plugin-react-compiler'),
              {
                compilationMode: 'infer',
                panicThreshold: 'none',
                target: '19',
                environment: { enableResetCacheOnSourceFileChanges },
              },
            ],
            [require('@babel/plugin-transform-react-jsx'), { runtime: 'automatic' }],
          ],
        })!.code!;
        expect(reference).toContain('react/compiler-runtime');
        expect(observe(reference, scenario)).toEqual(expected);
        const code = compile(
          source,
          {
            reactCompiler: {
              compilationMode: 'infer',
              panicThreshold: 'none',
              target: '19',
              enableResetCacheOnSourceFileChanges,
            },
            jsx: 'automatic',
          },
          'input.jsx',
        );
        expect(code).toContain('react/compiler-runtime');
        expect(code).not.toContain('<Probe');
        expect(observe(code, scenario)).toEqual(expected);
      });
    }
  }
});
