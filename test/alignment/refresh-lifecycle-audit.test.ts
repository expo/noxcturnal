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
import { nativePreflightOptions } from '../../js/native/binding';

// Supply Chromium and a directory containing matching react/react-dom packages.
const browser = process.env.NOXCTURNAL_AUDIT_CHROMIUM;
const reactRoot = process.env.NOXCTURNAL_AUDIT_REACT_ROOT;
const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
const forms = [
  'export compiled reset on',
  'export compiled reset off',
  'export declaration',
  'export variable',
  'export default named',
  'export default wrapper',
  'block hook',
  'declaration',
  'arrow',
  'expression',
  'memo',
  'forwardRef',
  'custom hook',
  'reset directive',
  'nested memo',
  'member custom hook',
  'builtin-named custom hook',
  'nested member custom hook',
  'local custom hook',
  'JSX-used factory',
] as const;
function source(form: (typeof forms)[number], label: string, changed = false) {
  const hooks = `const [value,setValue]=React.useState(1);${changed ? 'React.useState(2);' : ''}globalThis.update=setValue;`;
  const result = `return React.createElement('div',null,${JSON.stringify(label)}+value);`;
  switch (form) {
    case 'export compiled reset on':
    case 'export compiled reset off':
      return `export function App(){const [value,setValue]=React.useState(1);${changed ? 'React.useState(2);' : ''}const text=${JSON.stringify(label)}+value;return React.createElement(Probe,{text,setValue})}`;
    case 'export declaration':
      return `export function App(){${hooks}${result}}`;
    case 'export variable':
      return `export const App=()=>{${hooks}${result}};`;
    case 'export default named':
      return `export default function App(){${hooks}${result}}`;
    case 'export default wrapper':
      return `export default React.memo(function App(){${hooks}${result}});`;
    case 'block hook':
      return `function App(){{${hooks}${result}}}`;
    case 'nested memo':
      return `const App=React.memo(React.forwardRef(function App(props,ref){${hooks}${result}}));`;
    case 'builtin-named custom hook':
      return `function useCounter(){${hooks}return value}const Hooks={useState:useCounter};function App(){const value=Hooks.useState();${result}}`;
    case 'member custom hook':
      return `function useCounter(){${hooks}return value}const Hooks={useCounter};function App(){const value=Hooks.useCounter();${result}}`;
    case 'nested member custom hook':
      return `function useCounter(){${hooks}return value}const Hooks={group:{useCounter}};function App(){const value=Hooks.group.useCounter();${result}}`;
    case 'local custom hook':
      return `function App(){function useCounter(){${hooks}return value}const value=useCounter();${result}}`;
    case 'JSX-used factory':
      return `function make(){return function Inner(){${hooks}${result}}}const App=make();const element=<App/>;`;
    case 'reset directive':
      return `// @refresh reset\nfunction App(){${hooks}${result}}`;
    case 'declaration':
      return `function App(){${hooks}${result}}`;
    case 'arrow':
      return `const App=()=>{${hooks}${result}};`;
    case 'expression':
      return `const App=function(){${hooks}${result}};`;
    case 'memo':
      return `const App=React.memo(function App(){${hooks}${result}});`;
    case 'forwardRef':
      return `const App=React.forwardRef(function App(props,ref){${hooks}${result}});`;
    case 'custom hook':
      return `function useCounter(){${hooks}return value}function App(){const value=useCounter();${result}}`;
  }
}
function observe(versions: string[], hookMismatch = false, module = false) {
  if (module) versions = versions.map(code => transportModule(code, { format: 'cjs' }).code);
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-refresh-'));
  try {
    const packages = createRequire(join(reactRoot!, 'audit.cjs'));
    expect(packages('react/package.json').version).toBe('19.3.0');
    expect(packages('react-dom/package.json').version).toBe('19.3.0');
    const entry = `
      const Refresh=require(${JSON.stringify(referenceRequire.resolve('react-refresh/runtime'))});
      Refresh.injectIntoGlobalHook(globalThis);
      const React=require(${JSON.stringify(packages.resolve('react'))});
      const {createRoot}=require(${JSON.stringify(packages.resolve('react-dom/client'))});
      const {flushSync}=require(${JSON.stringify(packages.resolve('react-dom'))});
      const versions=${JSON.stringify(versions)};
      const compilerRuntime=require(${JSON.stringify(packages.resolve('react/compiler-runtime'))});
      function Probe({text,setValue}){globalThis.update=setValue;return React.createElement('div',null,text)}
      function load(code){const module={exports:{}};return new Function('React','$RefreshReg$','$RefreshSig$','module','require','Probe',code+${JSON.stringify(module ? ';return module.exports.default ?? module.exports.App;' : ';return App;')})(React,(type,id)=>Refresh.register(type,'audit:'+id),Refresh.createSignatureFunctionForTransform,module,name=>{if(name==='react/compiler-runtime')return compilerRuntime;throw Error(name)},Probe)}
      const container=document.createElement('div');document.body.append(container);
      const errors=[];const root=createRoot(container,{onUncaughtError(error){errors.push(error.message)}});const observations=[];
      try{
        const App=load(versions[0]);flushSync(()=>root.render(React.createElement(App)));observations.push(container.textContent);
        flushSync(()=>globalThis.update(7));observations.push(container.textContent);
        load(versions[1]);flushSync(()=>Refresh.performReactRefresh());observations.push(container.textContent);
        load(versions[2]);flushSync(()=>Refresh.performReactRefresh());observations.push(container.textContent);
        flushSync(()=>root.unmount());
      }catch(error){observations.push({error:error.name,message:error.message})}
      const output=document.createElement('pre');output.id='audit-result';output.textContent=JSON.stringify({observations,errors});document.body.append(output);
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
      timeout: 15_000,
      maxBuffer: 5_000_000,
    });
    expect(child.error).toBeUndefined();
    expect(child.signal).toBeNull();
    expect(child.status, child.stderr).toBe(0);
    const match = child.stdout.match(/<pre id="audit-result">([^<]+)<\/pre>/);
    expect(match, child.stderr).not.toBeNull();
    const result = JSON.parse(match![1]);
    expect(result.errors).toEqual(
      hookMismatch ? ['Rendered more hooks than during the previous render.'] : [],
    );
    return result.observations;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
describe.skipIf(!browser || !reactRoot)('real React Refresh lifecycle', () => {
  for (const emitFullSignatures of [false, true]) {
    describe.each(forms)('%s', form => {
      let actual: unknown;
      beforeAll(() => {
        expect(referenceRequire('react-refresh/package.json').version).toBe('0.18.0');
        const sources = [
          source(form, 'before:'),
          source(form, 'after:'),
          source(form, 'changed:', true),
        ];
        const reference = sources.map(
          input =>
            transformSync(input, {
              filename: 'input.jsx',
              configFile: false,
              babelrc: false,
              plugins: [
                ...(form.startsWith('export compiled')
                  ? [
                      [
                        referenceRequire('babel-plugin-react-compiler'),
                        {
                          compilationMode: 'infer',
                          panicThreshold: 'none',
                          target: '19',
                          environment: { enableResetCacheOnSourceFileChanges: form.endsWith('on') },
                        },
                      ],
                    ]
                  : []),
                ...(form === 'JSX-used factory'
                  ? [require('@babel/plugin-transform-react-jsx')]
                  : []),
                [
                  referenceRequire('react-refresh/babel'),
                  { skipEnvCheck: true, emitFullSignatures },
                ],
              ],
            })!.code!,
        );
        if (form.startsWith('export compiled'))
          for (const code of reference) expect(code).toContain('react/compiler-runtime');
        expect(
          observe(reference, form === 'builtin-named custom hook', form.startsWith('export ')),
        ).toEqual([
          'before:1',
          'before:7',
          form === 'reset directive' ||
          form === 'local custom hook' ||
          form === 'nested member custom hook'
            ? 'after:1'
            : 'after:7',
          form === 'builtin-named custom hook' ? '' : 'changed:1',
        ]);
        if (form.startsWith('export compiled')) {
          const input = sources[0];
          const reactCompiler = {
            compilationMode: 'infer' as const,
            panicThreshold: 'none' as const,
            target: '19' as const,
            enableResetCacheOnSourceFileChanges: form.endsWith('on'),
          };
          expect(compile(input, { reactCompiler })).toContain('react/compiler-runtime');
          expect(compile(input, { reactRefresh: { emitFullSignatures } })).toContain(
            '$RefreshSig$',
          );
          const separated = sources.map(source =>
            compile(compile(source, { reactCompiler }), { reactRefresh: { emitFullSignatures } }),
          );
          expect(observe(separated, false, true)).toEqual([
            'before:1',
            'before:7',
            'after:7',
            'changed:1',
          ]);
          const binding = Object.keys(require.cache).find(filename =>
            /noxcturnal\.[^/]+\.node$/.test(filename),
          );
          expect(binding).toBeTypeOf('string');
          const options = nativePreflightOptions({
            reactCompiler,
            reactRefresh: { emitFullSignatures },
          });
          const child = spawnSync(process.execPath, [], {
            encoding: 'utf8',
            timeout: 5000,
            input: `const native=require(${JSON.stringify(binding)});const result=native.runNativePipeline('input.jsx',${JSON.stringify(input)},[${JSON.stringify(options)}]);process.stdout.write(JSON.stringify(result));`,
          });
          expect(child.error).toBeUndefined();
          expect(child.status).not.toBe(0);
          if (process.platform !== 'win32') expect(child.signal).toBe('SIGABRT');
          expect(child.stderr).toContain('jsx/refresh.rs:395');
          expect(child.stderr).toContain('assertion `left == right` failed');
          expect(child.stderr).toMatch(/left: 12\s+right: 10/);
          actual = { compileAbort: true };
          return;
        }
        const output = sources.map(input =>
          compile(input, {
            reactRefresh: { emitFullSignatures },
            ...(form === 'JSX-used factory' ? { jsx: 'classic' as const } : {}),
          }),
        );
        for (const code of output) {
          expect(code).toContain('$RefreshReg$');
          if (form === 'block hook') expect(code).not.toContain('$RefreshSig$');
          else expect(code).toContain('$RefreshSig$');
        }
        actual = observe(
          output,
          form === 'builtin-named custom hook' || form === 'block hook',
          form.startsWith('export '),
        );
        if (form === 'block hook') expect(actual).toEqual(['before:1', 'before:7', 'after:7', '']);
        if (form === 'reset directive')
          expect(actual).toEqual(['before:1', 'before:7', 'after:7', 'changed:1']);
      });
      (form === 'reset directive' || form === 'block hook' || form.startsWith('export compiled')
        ? test.fails
        : test)(
        `preserves compatible state and resets changed hooks; full signatures=${emitFullSignatures}`,
        () =>
          expect(actual).toEqual([
            'before:1',
            'before:7',
            form === 'reset directive' || form === 'local custom hook' ? 'after:1' : 'after:7',
            form === 'builtin-named custom hook' ? '' : 'changed:1',
          ]),
      );
    });
  }
});

const releaseBinding = process.env.NOXCTURNAL_AUDIT_RELEASE_BINDING;
describe.skipIf(!browser || !reactRoot || !releaseBinding)(
  'release Compiler/Refresh initializer changes',
  () => {
    for (const emitFullSignatures of [false, true]) {
      for (const enableResetCacheOnSourceFileChanges of [false, true]) {
        describe(`full signatures=${emitFullSignatures}, source reset=${enableResetCacheOnSourceFileChanges}`, () => {
          let actual: unknown;
          beforeAll(() => {
            const sources = [
              ['before:', 1],
              ['after:', 1],
              ['changed:', 9],
            ].map(
              ([label, initial]) =>
                `export function App(){const [value,setValue]=React.useState(${initial});const text=${JSON.stringify(label)}+value;return React.createElement(Probe,{text,setValue})}`,
            );
            const reference = sources.map(
              input =>
                transformSync(input, {
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
                    [
                      referenceRequire('react-refresh/babel'),
                      { skipEnvCheck: true, emitFullSignatures },
                    ],
                  ],
                })!.code!,
            );
            expect(observe(reference, false, true)).toEqual([
              'before:1',
              'before:7',
              'after:7',
              'changed:7',
            ]);
            const refreshOnly = sources.map(
              input =>
                transformSync(input, {
                  filename: 'input.jsx',
                  configFile: false,
                  babelrc: false,
                  plugins: [
                    [
                      referenceRequire('react-refresh/babel'),
                      { skipEnvCheck: true, emitFullSignatures },
                    ],
                  ],
                })!.code!,
            );
            expect(observe(refreshOnly, false, true)).toEqual([
              'before:1',
              'before:7',
              'after:7',
              'changed:9',
            ]);
            const nativeRefreshOnly = sources.map(input =>
              compile(input, { reactRefresh: { emitFullSignatures } }),
            );
            expect(observe(nativeRefreshOnly, false, true)).toEqual([
              'before:1',
              'before:7',
              'after:7',
              'changed:9',
            ]);
            const options = nativePreflightOptions({
              reactCompiler: {
                compilationMode: 'infer',
                panicThreshold: 'none',
                target: '19',
                enableResetCacheOnSourceFileChanges,
              },
              reactRefresh: { emitFullSignatures },
            });
            const output = sources.map(input => {
              const child = spawnSync(process.execPath, [], {
                encoding: 'utf8',
                timeout: 5000,
                input: `const native=require(${JSON.stringify(releaseBinding)});const result=native.runNativePipeline('input.jsx',${JSON.stringify(input)},[${JSON.stringify(options)}]);process.stdout.write(JSON.stringify(result));`,
              });
              expect(child.error).toBeUndefined();
              expect(child.signal).toBeNull();
              expect(child.status, child.stderr).toBe(0);
              const result = JSON.parse(child.stdout);
              expect(result.code).toContain('react/compiler-runtime');
              expect(result.code).toContain('$RefreshSig$');
              return result.code as string;
            });
            actual = observe(output, false, true);
          });
          test('matches the compiler/Refresh initializer-signature limitation', () =>
            expect(actual).toEqual(['before:1', 'before:7', 'after:7', 'changed:7']));
        });
      }
    }
  },
);
