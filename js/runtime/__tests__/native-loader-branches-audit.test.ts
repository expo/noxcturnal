import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { expect, test } from 'vitest';

// Execute the actual loader in isolation without loading foreign-architecture
// addons. This checks resolution decisions, not the binaries' ABI compatibility.
const compiled = ts.transpileModule(
  readFileSync(new URL('../../native/binding.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

const targets = [
  ['darwin', 'arm64', undefined, 'darwin-arm64'],
  ['darwin', 'x64', undefined, 'darwin-x64'],
  ['win32', 'arm64', undefined, 'win32-arm64-msvc'],
  ['win32', 'x64', undefined, 'win32-x64-msvc'],
  ['linux', 'arm64', '2.35', 'linux-arm64-gnu'],
  ['linux', 'x64', '2.35', 'linux-x64-gnu'],
  ['linux', 'arm64', undefined, 'linux-arm64-musl'],
  ['linux', 'x64', undefined, 'linux-x64-musl'],
] as const;

function load(
  platform: string,
  arch: string,
  glibc: string | undefined,
  directory: string,
  resolve: (specifier: string) => unknown,
  reportOverride?: { value: unknown },
) {
  const exports: Record<string, unknown> = {};
  runInNewContext(compiled, {
    exports,
    __dirname: directory,
    process: {
      platform,
      arch,
      report: reportOverride
        ? reportOverride.value
        : { getReport: () => ({ header: { glibcVersionRuntime: glibc } }) },
    },
    require(specifier: string) {
      if (specifier === 'node:path') return platform === 'win32' ? path.win32 : path.posix;
      return resolve(specifier);
    },
  });
  return exports.native;
}

for (const [platform, arch, glibc, suffix] of targets) {
  for (const layout of ['js/native', 'dist']) {
    test(`native loader ${suffix} from ${layout}: local precedence and package fallback`, () => {
      const paths = platform === 'win32' ? path.win32 : path.posix;
      const root = platform === 'win32' ? 'C:\\fixture' : '/fixture';
      const directory = paths.join(root, layout);
      const local = paths.join(root, `noxcturnal.${suffix}.node`);
      const optional = `@noxcturnal/noxcturnal-${suffix}`;
      const binding = {};
      let attempts: string[] = [];
      expect(
        load(platform, arch, glibc, directory, specifier => {
          attempts.push(specifier);
          return binding;
        }),
      ).toBe(binding);
      expect(attempts).toEqual([local]);

      attempts = [];
      expect(
        load(platform, arch, glibc, directory, specifier => {
          attempts.push(specifier);
          if (specifier === local)
            throw Object.assign(new Error('missing local addon'), { code: 'MODULE_NOT_FOUND' });
          return binding;
        }),
      ).toBe(binding);
      expect(attempts).toEqual([local, optional]);
    });
  }
}

for (const code of ['ERR_DLOPEN_FAILED', 'EACCES']) {
  test(`native loader preserves ${code} without trying another binary`, () => {
    const error = Object.assign(new Error('cannot load local addon'), { code });
    const attempts: string[] = [];
    expect(() =>
      load('darwin', 'arm64', undefined, '/fixture/dist', specifier => {
        attempts.push(specifier);
        throw error;
      }),
    ).toThrow(error);
    expect(attempts).toEqual(['/fixture/noxcturnal.darwin-arm64.node']);
  });
}

test('native loader propagates the optional-package failure after missing local addon', () => {
  const missingLocal = Object.assign(new Error('missing local addon'), {
    code: 'MODULE_NOT_FOUND',
  });
  const missingPackage = Object.assign(new Error('missing optional package'), {
    code: 'MODULE_NOT_FOUND',
  });
  const attempts: string[] = [];
  expect(() =>
    load('linux', 'x64', '2.35', '/fixture/dist', specifier => {
      attempts.push(specifier);
      throw attempts.length === 1 ? missingLocal : missingPackage;
    }),
  ).toThrow(missingPackage);
  expect(attempts).toEqual([
    '/fixture/noxcturnal.linux-x64-gnu.node',
    '@noxcturnal/noxcturnal-linux-x64-gnu',
  ]);
});

for (const [name, report] of [
  ['absent report', undefined],
  ['absent getReport', {}],
  ['undefined report result', { getReport: () => undefined }],
  ['absent header', { getReport: () => ({}) }],
  ['empty header', { getReport: () => ({ header: {} }) }],
] as const) {
  test(`native loader selects its musl fallback with ${name}`, () => {
    const attempts: string[] = [];
    const binding = {};
    expect(
      load(
        'linux',
        'x64',
        '2.35',
        '/fixture/dist',
        specifier => {
          attempts.push(specifier);
          return binding;
        },
        { value: report },
      ),
    ).toBe(binding);
    expect(attempts).toEqual(['/fixture/noxcturnal.linux-x64-musl.node']);
  });
}

test('native loader preserves diagnostic-report failure before resolving an addon', () => {
  const error = new Error('diagnostic report unavailable');
  const attempts: string[] = [];
  expect(() =>
    load(
      'linux',
      'x64',
      '2.35',
      '/fixture/dist',
      specifier => {
        attempts.push(specifier);
        return {};
      },
      {
        value: {
          getReport() {
            throw error;
          },
        },
      },
    ),
  ).toThrow(error);
  expect(attempts).toEqual([]);
});

test('native loader preserves optional-package dlopen failure', () => {
  const error = Object.assign(new Error('optional addon cannot load'), {
    code: 'ERR_DLOPEN_FAILED',
  });
  const attempts: string[] = [];
  expect(() =>
    load('linux', 'x64', '2.35', '/fixture/dist', specifier => {
      attempts.push(specifier);
      if (attempts.length === 1)
        throw Object.assign(new Error('absent'), { code: 'MODULE_NOT_FOUND' });
      throw error;
    }),
  ).toThrow(error);
  expect(attempts).toEqual([
    '/fixture/noxcturnal.linux-x64-gnu.node',
    '@noxcturnal/noxcturnal-linux-x64-gnu',
  ]);
});

test('native loader constructs the unsupported-platform path without claiming a shipped target', () => {
  const error = Object.assign(new Error('unsupported optional target'), {
    code: 'MODULE_NOT_FOUND',
  });
  const attempts: string[] = [];
  expect(() =>
    load('freebsd', 'x64', undefined, '/fixture/dist', specifier => {
      attempts.push(specifier);
      throw error;
    }),
  ).toThrow(error);
  expect(attempts).toEqual([
    '/fixture/noxcturnal.freebsd-x64.node',
    '@noxcturnal/noxcturnal-freebsd-x64',
  ]);
});
