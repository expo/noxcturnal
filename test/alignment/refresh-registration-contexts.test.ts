import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { buildSync, transformSync as transportModule } from 'esbuild';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';
import { nativePreflightOptions } from '../../js/native/binding';

describe('refresh lifecycle', () => {
  // Supply Chromium and a directory containing matching react/react-dom packages.
  const browser = process.env.NOXCTURNAL_AUDIT_CHROMIUM;
  const reactRoot = process.env.NOXCTURNAL_AUDIT_REACT_ROOT;
  const require = createRequire(import.meta.url);
  const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
  const forms = [
    'export compiled reset on',
    'export compiled reset off',
    'export compiled reset comment',
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
      case 'export compiled reset comment':
        return `export function App(){${form.endsWith('comment') ? '/* @refresh reset */' : ''}const [value,setValue]=React.useState(1);${changed ? 'React.useState(2);' : ''}const text=${JSON.stringify(label)}+value;return React.createElement(Probe,{text,setValue})}`;
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
      const child = spawnSync(
        browser!,
        ['--headless', '--dump-dom', pathToFileURL(filename).href],
        {
          encoding: 'utf8',
          timeout: 15_000,
          maxBuffer: 5_000_000,
        },
      );
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
                            environment: {
                              enableResetCacheOnSourceFileChanges: form.endsWith('on'),
                            },
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
            form.endsWith('reset comment') ||
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
            expect(child.status, child.stderr).toBe(0);
            const fused = sources.map(source =>
              compile(source, {
                reactCompiler,
                reactRefresh: { emitFullSignatures },
              }),
            );
            actual = observe(fused, false, true);
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
            expect(code).toContain('$RefreshSig$');
          }
          actual = observe(
            output,
            form === 'builtin-named custom hook',
            form.startsWith('export '),
          );
        });
        test(`preserves compatible state and resets changed hooks; full signatures=${emitFullSignatures}`, () =>
          expect(actual).toEqual([
            'before:1',
            'before:7',
            form === 'reset directive' ||
            form.endsWith('reset comment') ||
            form === 'local custom hook'
              ? 'after:1'
              : 'after:7',
            form === 'builtin-named custom hook' ? '' : 'changed:1',
          ]));
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
});

describe('refresh member path', () => {
  const require = createRequire(import.meta.url);
  const source = 'function App(){const [value]=useState(3);return value}globalThis.result=App();';
  function execute(code: string) {
    const registrations: string[] = [];
    let setup = 0;
    let calls = 0;
    const register = (_component: unknown, name: string) => {
      registrations.push(name);
    };
    const signature = () => {
      setup++;
      return () => {
        calls++;
      };
    };
    const runtime = { register, signature, hooks: { register, signature } };
    const context: { result?: number } = {};
    new Function(
      'runtime',
      'register',
      'signature',
      '$RefreshReg$',
      '$RefreshSig$',
      'useState',
      'globalThis',
      code,
    )(runtime, register, signature, register, signature, (value: number) => [value], context);
    return [context.result, registrations, setup, calls];
  }
  describe.each([
    {
      name: 'identifiers',
      options: { refreshReg: 'register', refreshSig: 'signature' },
    },
    {
      name: 'single member',
      options: { refreshReg: 'runtime.register', refreshSig: 'runtime.signature' },
    },
    { name: 'nested registration', options: { refreshReg: 'runtime.hooks.register' } },
    { name: 'nested signature', options: { refreshSig: 'runtime.hooks.signature' } },
  ])('$name', entry => {
    let actual: unknown;
    let expected: unknown;
    beforeAll(() => {
      const babel = transformSync(source, {
        babelrc: false,
        configFile: false,
        sourceType: 'script',
        plugins: [[require('react-refresh/babel'), { ...entry.options, skipEnvCheck: true }]],
      })!.code!;
      expected = execute(babel);
      expect(expected).toEqual([3, ['App'], 1, 2]);
      const nox = compile(source, { reactRefresh: entry.options });
      expect(nox).toContain('_s');
      actual = execute(nox);
    });
    test('calls the complete configured member path', () => {
      expect(actual).toEqual(expected);
    });
  });

  for (const depth of ['runtime.hooks', 'runtime.hooks.callbacks']) {
    test(`executes import.meta.${depth} callback paths`, async () => {
      const options = {
        refreshReg: `import.meta.${depth}.register`,
        refreshSig: `import.meta.${depth}.signature`,
      };
      const input =
        'function App(){const [value]=useState(3);return value}export const value=App();';
      const reference = transformSync(input, {
        babelrc: false,
        configFile: false,
        plugins: [[require('react-refresh/babel'), { ...options, skipEnvCheck: true }]],
      })!.code!;
      const actual = compile(input, { reactRefresh: options }, 'input.mjs');
      const prefix = `const observed={registrations:[],setup:0,calls:0};
      const callbacks={register(type,id){observed.registrations.push(id)},signature(){observed.setup++;return ()=>{observed.calls++}}};
      import.meta.runtime={hooks:${depth.endsWith('callbacks') ? '{callbacks}' : 'callbacks'}};
      const useState=value=>[value];`;
      for (const code of [reference, actual]) {
        const result = await importCode(prefix + code + ';export {observed};');
        expect(result.value).toBe(3);
        expect(result.observed).toEqual({ registrations: ['App'], setup: 1, calls: 2 });
      }
    });
  }
});

describe('refresh registration boundaries', () => {
  const require = createRequire(import.meta.url);
  const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
  const cases = [
    ['anonymous default function', 'export default function(){return null}'],
    ['anonymous default arrow', 'export default ()=>null;'],
    ['class declaration', 'class App{}'],
    ['multiple declarators', 'const App=()=>null,Other=()=>null;'],
    ['lowercase function', 'function app(){return null}'],
    ['nested declaration', 'function outer(){function App(){return null}return App}outer();'],
    ['higher-order arrow', 'const App=()=>()=>null;'],
    [
      'require-like factory',
      'function requireComponent(v){return v}const App=requireComponent(()=>null);',
    ],
    ['unconsumed tagged factory', 'const tag=()=>()=>null;const App=tag`component`;'],
    ['uninitialized declaration', 'let App;'],
    ['destructured binding', 'const {App}={App:()=>null};'],
  ] as const;
  function observe(code: string) {
    const registrations: string[] = [];
    const module = { exports: {} };
    const body = transportModule(code, { format: 'cjs' }).code;
    new Function('module', '$RefreshReg$', '$RefreshSig$', body)(
      module,
      (_component: unknown, id: string) => registrations.push(id),
      () => () => {},
    );
    return registrations;
  }
  for (const emitFullSignatures of [false, true]) {
    describe.each(cases)('%s', (_name, source) => {
      test(`retains the Babel registration boundary; full signatures=${emitFullSignatures}`, () => {
        const reference = transformSync(source, {
          configFile: false,
          babelrc: false,
          plugins: [
            [referenceRequire('react-refresh/babel'), { skipEnvCheck: true, emitFullSignatures }],
          ],
        })!.code!;
        expect(observe(reference)).toEqual([]);
        const code = compile(source, { reactRefresh: { emitFullSignatures } });
        expect(observe(code)).toEqual([]);
        // A registered neighbor proves Refresh is enabled for the same input/options.
        const control = compile(`${source}\nfunction Neighbor(){return null}`, {
          reactRefresh: { emitFullSignatures },
        });
        expect(observe(control)).toEqual(['Neighbor']);
      });
    });
  }
});

describe('refresh scope regressions', () => {
  const require = createRequire(import.meta.url);
  const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
  function signatures(code: string) {
    const found: { name: string; key: string; reset: boolean }[] = [];
    new Function('require', '$RefreshReg$', '$RefreshSig$', code)(
      (name: string) => {
        expect(name).toBe('react/compiler-runtime');
        return { c: () => [] };
      },
      () => {},
      () =>
        (fn: Function, key: string, reset = false) => {
          if (fn) found.push({ name: fn.name, key, reset });
          return fn;
        },
    );
    return found;
  }
  for (const emitFullSignatures of [false, true]) {
    describe(`Refresh signature ownership, full=${emitFullSignatures}`, () => {
      test.each([
        ['nested blocks', 'function App(){{{useState(0)}}}', true],
        ['static block', 'function App(){class C{static {useState(0)}}return C}', false],
        ['nested static block', 'function App(){{class C{static {{useState(0)}}}}}', false],
        ['instance field Babel boundary', 'function App(){class C{x=useState(0)}return C}', true],
        [
          'static field Babel boundary',
          'function App(){class C{static x=useState(0)}return C}',
          true,
        ],
        [
          'nested function boundary',
          'function App(){function Inner(){useState(0)}return Inner}',
          false,
        ],
        [
          'inner function in static block',
          'function App(){class C{static {function Inner(){useState(0)}}}return C}',
          false,
        ],
        [
          'string is not a reset comment',
          'const text="@refresh reset"; function App(){useState(0)}',
          true,
        ],
        ['trailing reset comment', 'function App(){useState(0)} /* @refresh reset */', true],
        ['nested reset comment', 'function App(){/* @refresh reset */useState(0)}', true],
      ])('%s', (_name, source, hasSignature) => {
        const options = { emitFullSignatures };
        const babel = transformSync(source as string, {
          babelrc: false,
          configFile: false,
          plugins: [[referenceRequire('react-refresh/babel'), { ...options, skipEnvCheck: true }]],
        })!.code!;
        const actual = compile(source as string, { reactRefresh: options });
        expect(signatures(actual)).toEqual(signatures(babel));
        expect(signatures(actual).some(signature => signature.name === 'App')).toBe(hasSignature);
      });
    });
  }

  for (const emitFullSignatures of [false, true]) {
    test(`generated reducer signatures compile and track added hooks, full=${emitFullSignatures}`, () => {
      const source = (additional: boolean) => `function App(){'use memo';
      const [value]=React.useReducer((state)=>state,1);
      ${additional ? 'React.useReducer((state)=>state,2);' : ''}
      return React.createElement('div',null,value);}`;
      const outputs = [false, true].map(additional =>
        compile(source(additional), {
          reactCompiler: {
            compilationMode: 'annotation',
            panicThreshold: 'none',
            target: '19',
            enableResetCacheOnSourceFileChanges: false,
          },
          reactRefresh: { emitFullSignatures },
        }),
      );
      for (const output of outputs) {
        expect(output).toContain('react/compiler-runtime');
        expect(output).toContain('$RefreshSig$');
      }
      // These module imports are not executed: registration/signature callbacks
      // observe function metadata only, independently of the actual renderer tests.
      const observed = outputs.map(output => signatures(output.replace(/^import[^;]+;\s*/m, '')));
      expect(observed[0]).toHaveLength(1);
      expect(observed[1]).toHaveLength(1);
      expect(observed[1][0].key).not.toBe(observed[0][0].key);
    });
  }
});
