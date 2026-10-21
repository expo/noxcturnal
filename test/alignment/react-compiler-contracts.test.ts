import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { buildSync, transformSync as transport, transformSync as transportModule } from 'esbuild';
import { beforeAll, describe, expect, test } from 'vitest';
import { NativeTransformError } from '../../js';
import { compile } from '../compliance/runtime';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

describe('react compiler diagnostics', () => {
  const require = createRequire(import.meta.url);
  const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
  const cases = [
    {
      name: 'noncritical unsupported syntax',
      source: `export function App({value}) {class Box {} return <div>{value}</div>}`,
      diagnostic: /Inline.*class.*declarations are not supported/i,
      critical: false,
    },
    {
      name: 'noncritical local class instance',
      source: `export function App({value}) {class Box {read(){return value}} return <div>{new Box().read()}</div>}`,
      diagnostic: /Inline.*class.*declarations are not supported/i,
      critical: false,
    },
    {
      name: 'critical ref mutation',
      source: `import {useRef} from 'react'; export function App({value}) {const ref=useRef(value);ref.current=value;return <div>{value}</div>}`,
      diagnostic: /ref.*during render/i,
      critical: true,
    },
  ];

  // These rejected functions stay uncompiled. A minimal element/ref implementation
  // observes their preserved JS behavior; actual memo-runtime tests live separately.
  function observe(code: string) {
    const module = { exports: {} as { App?: (props: { value: number }) => unknown } };
    const react = {
      createElement: (type: string, props: unknown, value: unknown) => ({ type, props, value }),
      useRef: (current: unknown) => ({ current }),
    };
    new Function(
      'module',
      'exports',
      'require',
      'React',
      transport(code, { loader: 'jsx', format: 'cjs' }).code,
    )(
      module,
      module.exports,
      (name: string) => {
        expect(name).toBe('react');
        return react;
      },
      react,
    );
    return module.exports.App!({ value: 7 });
  }

  for (const entry of cases) {
    for (const jsx of ['preserve', 'classic'] as const) {
      for (const panicThreshold of ['none', 'critical_errors', 'all_errors'] as const) {
        describe(`${entry.name}, JSX=${jsx}, threshold=${panicThreshold}`, () => {
          const shouldThrow =
            panicThreshold === 'all_errors' ||
            (entry.critical && panicThreshold === 'critical_errors');
          let actual: unknown;
          beforeAll(() => {
            const reference = () =>
              transformSync(entry.source, {
                filename: 'input.jsx',
                configFile: false,
                babelrc: false,
                parserOpts: { plugins: ['jsx'] },
                plugins: [
                  [
                    referenceRequire('babel-plugin-react-compiler'),
                    {
                      compilationMode: 'infer',
                      panicThreshold,
                      target: '19',
                      environment: { enableResetCacheOnSourceFileChanges: false },
                    },
                  ],
                  ...(jsx === 'classic'
                    ? [referenceRequire('@babel/plugin-transform-react-jsx')]
                    : []),
                ],
              })!.code!;
            if (shouldThrow) expect(reference).toThrow(entry.diagnostic);
            else {
              const code = reference();
              expect(code).not.toContain('compiler-runtime');
              expect(observe(code)).toEqual({ type: 'div', props: null, value: 7 });
            }
            try {
              const code = compile(
                entry.source,
                {
                  reactCompiler: {
                    compilationMode: 'infer',
                    panicThreshold,
                    target: '19',
                    enableResetCacheOnSourceFileChanges: false,
                  },
                  jsx,
                },
                'input.jsx',
              );
              expect(code).not.toContain('compiler-runtime');
              if (jsx === 'classic') expect(code).not.toContain('<div>');
              else expect(code).toContain('<div>');
              actual = observe(code);
            } catch (error) {
              expect(error).toBeInstanceOf(NativeTransformError);
              const failure = error as NativeTransformError;
              expect(failure.reason).toBe('transform-error');
              expect(JSON.stringify(failure.diagnostics)).toMatch(entry.diagnostic);
              actual = 'transform-error';
            }
            expect(actual).toEqual(
              shouldThrow ? 'transform-error' : { type: 'div', props: null, value: 7 },
            );
          });
          test('honors diagnostic severity and continues selected JSX lowering', () => {
            expect(actual).toEqual(
              shouldThrow ? 'transform-error' : { type: 'div', props: null, value: 7 },
            );
          });
        });
      }
    }
  }
});

describe('react compiler directives', () => {
  const require = createRequire(import.meta.url);
  const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
  const cases = [
    ['ordinary', '', ''],
    ['explicit memo', "'use memo';", ''],
    ['legacy memo', "'use forget';", ''],
    ['default opt out', "'use no memo';", ''],
    ['legacy opt out', "'use no forget';", ''],
    ['custom opt out', "'skip optimization';", ''],
    ['memo then opt out', "'use memo';'use no memo';", ''],
    ['opt out then memo', "'use no memo';'use memo';", ''],
    ['escaped memo', String.raw`'use\x20memo';`, ''],
    ['escaped opt out', String.raw`'use\x20no memo';`, ''],
    ['module memo', '', "'use memo';"],
    ['escaped module opt out', '', String.raw`'use\x20no memo';`],
    ['unicode escaped memo', String.raw`'use\u0020memo';`, ''],
    ['escaped custom opt out', String.raw`'skip\x20optimization';`, ''],
    ['module opt out', '', "'use no memo';"],
    ['directive after statement', "void 0;'use no memo';", ''],
  ] as const;
  for (const compilationMode of ['infer', 'syntax', 'annotation', 'all'] as const) {
    describe.each(cases)(`compiler ${compilationMode}: %s`, (_name, body, module) => {
      let actual: boolean;
      let expected: boolean;
      beforeAll(() => {
        const source = `${module} export function App({value}) {${body} return <div>{value}</div>}`;
        const options = {
          compilationMode,
          panicThreshold: 'none' as const,
          target: '19' as const,
          enableResetCacheOnSourceFileChanges: false,
          customOptOutDirectives: ['skip optimization', 'use no memo', 'skip optimization'],
        };
        const reference = transformSync(source, {
          filename: 'input.jsx',
          configFile: false,
          babelrc: false,
          parserOpts: { plugins: ['jsx'] },
          plugins: [
            [
              referenceRequire('babel-plugin-react-compiler'),
              {
                ...options,
                customOptOutDirectives: ['use no memo', 'use no forget', 'skip optimization'],
                environment: { enableResetCacheOnSourceFileChanges: false },
              },
            ],
          ],
        })!.code!;
        const code = compile(source, { reactCompiler: options, jsx: 'preserve' }, 'input.jsx');
        expected = reference.includes('react/compiler-runtime');
        actual = code.includes('react/compiler-runtime');
        expect(code).toContain('<div>');
      });
      test('matches the pinned directive boundary', () => expect(actual).toBe(expected));
    });
  }
});

describe('react compiler recovery', () => {
  const require = createRequire(import.meta.url);
  const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
  const compiler = {
    compilationMode: 'infer',
    panicThreshold: 'none',
    target: '19',
    enableResetCacheOnSourceFileChanges: false,
  } as const;
  const warning = `export function App({value}) {class Box {} return <div>{value}</div>}`;
  const critical = `import {useRef} from 'react';export function App({value}) {const ref=useRef(value);ref.current=value;return <div>{value}</div>}`;
  const field = `class Owner {value=7;read(){return this.value}} globalThis.result=new Owner().read();`;
  function babel(
    source: string,
    plugins: NonNullable<import('@babel/core').TransformOptions['plugins']>,
  ) {
    return transformSync(source, {
      filename: 'input.jsx',
      configFile: false,
      babelrc: false,
      parserOpts: { plugins: ['jsx'] },
      plugins: [
        [
          referenceRequire('babel-plugin-react-compiler'),
          { ...compiler, environment: { enableResetCacheOnSourceFileChanges: false } },
        ],
        ...plugins,
        referenceRequire('@babel/plugin-transform-react-jsx'),
      ],
    })!.code!;
  }
  function observe(code: string) {
    const state: { result?: number } = {};
    const registrations: string[] = [];
    const module = { exports: {} };
    new Function(
      'module',
      'exports',
      'require',
      'globalThis',
      '$RefreshReg$',
      transport(code, { format: 'cjs' }).code,
    )(
      module,
      module.exports,
      (name: string) => (name === 'react' ? {} : require(name)),
      state,
      (_value: unknown, id: string) => registrations.push(id),
    );
    return { value: state.result, registrations };
  }
  for (const mode of ['inline', 'runtime'] as const) {
    for (const compact of [false, true]) {
      describe(`warning recovery helper accounting, ${mode}, compact=${compact}`, () => {
        let actual: unknown;
        beforeAll(() => {
          const source = warning + field;
          const reference = babel(source, [
            [referenceRequire('@babel/plugin-transform-class-properties'), { loose: false }],
          ]);
          expect(observe(reference).value).toBe(7);
          const plan = {
            reactCompiler: compiler,
            jsx: 'classic' as const,
            transforms: { classProperties: { loose: false } },
            helpers: { mode, version: '7.29.7' },
            compact,
          };
          // Error diagnostics stop Oxc before class lowering; recovery then runs it once.
          const errorControl = compile(critical + field, plan, 'input.jsx');
          expect(observe(errorControl).value).toBe(7);
          const noCompiler = compile(source, { ...plan, reactCompiler: undefined }, 'input.jsx');
          expect(observe(noCompiler).value).toBe(7);
          const code = compile(source, plan, 'input.jsx');
          expect(code).not.toMatch(/value\s*=\s*7/);
          if (mode === 'inline') {
            expect(code).toContain('babelHelpers.defineProperty');
            actual = observe(code).value;
          } else {
            expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
            expect(code).toContain('@babel/runtime/helpers/defineProperty');
            actual = observe(code).value;
            expect(actual).toBe(7);
          }
        });
        test('preserves helpers requested before warning recovery', () => expect(actual).toBe(7));
      });
    }
  }
  for (const emitFullSignatures of [false, true]) {
    describe(`warning recovery Refresh registration, full signatures=${emitFullSignatures}`, () => {
      let actual: unknown;
      beforeAll(() => {
        const reference = babel(warning, [
          [referenceRequire('react-refresh/babel'), { skipEnvCheck: true, emitFullSignatures }],
        ]);
        expect(observe(reference).registrations).toEqual(['App']);
        const plan = {
          reactCompiler: compiler,
          reactRefresh: { emitFullSignatures },
          jsx: 'classic' as const,
        };
        expect(
          observe(compile(warning, { ...plan, reactCompiler: undefined }, 'input.jsx'))
            .registrations,
        ).toEqual(['App']);
        const code = compile(warning, plan, 'input.jsx');
        actual = observe(code).registrations;
        expect(actual).toEqual(['App']);
      });
      test('registers the component once', () => expect(actual).toEqual(['App']));
    });
  }
});

describe('react compiler render', () => {
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
                  plugins: [
                    [require('@babel/plugin-transform-react-jsx'), { runtime: 'automatic' }],
                  ],
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
});

describe('react compiler source reset', () => {
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
  function observe(codes: string[], target: keyof typeof roots, siblings = false) {
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
 function load(code){const module={exports:{}};new Function('module','require','React',code)(module,name=>{if(name!==${JSON.stringify(runtime)})throw Error(name);return runtime},React);return module.exports.useValue}
 let useValue=load(${JSON.stringify(bodies[0])}); let sourceTag='before';
 function App({value}){const result=useValue(value);const [tail]=React.useState('tail');if(tail!=='tail')errors.push('caller state changed');objects.push(result);return React.createElement('span',null,typeof result==='object' ? result.tag+':'+result.value : sourceTag+':'+result)}
 const container=document.createElement('div');document.body.append(container);
 const root=${target === '17' ? `{render:element=>ReactDOM.render(element,container),unmount:()=>ReactDOM.unmountComponentAtNode(container)}` : `createRoot(container,{onUncaughtError(error){errors.push(error.message)}})`};
 function render(value){ReactDOM.flushSync(()=>root.render(${siblings ? `[React.createElement(App,{value,key:'a'}),React.createElement(App,{value,key:'b'})]` : `React.createElement(App,{value})`}));dom.push(container.textContent)}
 render(1);render(1);
 // HMR replaces the custom hook implementation while its calling component and
 // hook positions remain stable. No Refresh runtime clears the cache for us.
 useValue=load(${JSON.stringify(bodies[1])});sourceTag='after';render(1);render(1);render(2);
 const stride=${siblings ? 2 : 1};
 const result={dom,reusedBefore:objects[0]===objects[stride],reusedAfter:objects[2*stride]===objects[3*stride],changedOnEdit:objects[stride]!==objects[2*stride],errors${siblings ? ",independent:(typeof objects[0]!=='object'||objects[0]!==objects[1]) && (typeof objects[4]!=='object'||objects[4]!==objects[5])" : ''}};
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
      const child = spawnSync(
        browser!,
        ['--headless', '--dump-dom', pathToFileURL(filename).href],
        {
          encoding: 'utf8',
          timeout: 15000,
          maxBuffer: 5000000,
        },
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
              expect(actual).toEqual(expected(enableResetCacheOnSourceFileChanges));
            });
            test('resets retained memo values only when requested', () =>
              expect(actual).toEqual(expected(enableResetCacheOnSourceFileChanges)));
          });
        }
      },
    );
  }

  for (const target of ['17', '18', '19'] as const) {
    describe.skipIf(!browser || !roots[target])(
      `source reset cache boundaries, React ${target}`,
      () => {
        for (const change of [
          'unchanged',
          'grow',
          'shrink',
          'grow from zero',
          'shrink to zero',
          'outlined callbacks',
        ] as const) {
          test(`${change} cache layout retains two mounted component caches`, () => {
            const small = (tag: string) =>
              `export function useValue(value){'use memo';return {value,tag:${JSON.stringify(tag)}}}`;
            const large = (tag: string) =>
              `export function useValue(value){'use memo';const extra={value};return {value,tag:${JSON.stringify(tag)},extra}}`;
            const zero = `export function useValue(value){'use memo';return value}`;
            const callbacks = (tag: string) => `export function useValue(value){'use memo';
            React.useReducer((state)=>state,0,()=>0);return {value,tag:${JSON.stringify(tag)}}}`;
            const inputs =
              change === 'outlined callbacks'
                ? [callbacks('before'), callbacks('after')]
                : change === 'grow from zero'
                  ? [zero, small('after')]
                  : change === 'shrink to zero'
                    ? [small('before'), zero]
                    : change === 'unchanged'
                      ? [small('before'), small('before')]
                      : change === 'grow'
                        ? [small('before'), large('after')]
                        : [large('before'), small('after')];
            const options = {
              compilationMode: 'infer' as const,
              panicThreshold: 'none' as const,
              target,
              enableResetCacheOnSourceFileChanges: true,
            };
            const code = inputs.map(input => compile(input, { reactCompiler: options }));
            const slots = code.map(output => Number(output.match(/_c\((\d+)\)/)![1]));
            if (change.startsWith('grow')) expect(slots[1]).toBeGreaterThan(slots[0]);
            else if (change.startsWith('shrink')) expect(slots[1]).toBeLessThan(slots[0]);
            else if (change === 'unchanged') expect(code[1]).toBe(code[0]);
            if (change === 'outlined callbacks')
              for (const output of code) expect(output.match(/_c\(/g)).toHaveLength(1);
            const reference = inputs.map(
              input =>
                transformSync(input, {
                  filename: 'input.js',
                  configFile: false,
                  babelrc: false,
                  plugins: [
                    [
                      referenceRequire('babel-plugin-react-compiler'),
                      { ...options, environment: { enableResetCacheOnSourceFileChanges: true } },
                    ],
                  ],
                })!.code!,
            );
            const result = { ...expected(change !== 'unchanged'), independent: true };
            if (change === 'unchanged') result.dom[4] = 'before:2';
            result.dom = result.dom.map(value => value + value);
            expect(observe(reference, target, true)).toEqual(result);
            expect(observe(code, target, true)).toEqual(result);
          });
        }
      },
    );
  }
});
