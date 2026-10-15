import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import optional from '@babel/plugin-transform-optional-chaining';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

// Opt-in real-browser coverage: a JS object cannot emulate [[IsHTMLDDA]].
// Set NOXCTURNAL_AUDIT_CHROMIUM to a Chromium/headless-shell executable.
const browser = process.env.NOXCTURNAL_AUDIT_CHROMIUM;
const cases = [
  {
    name: 'computed property effects',
    source: `let effects=0;document.all.auditMarker=3;globalThis.result=[document.all?.[(effects++,'auditMarker')],effects];`,
    strict: [3, 1],
    loose: [null, 0],
  },
  {
    name: 'callable HTMLAllCollection arguments and continuation',
    source: `let effects=0;globalThis.result=[document.all?.((effects++,'probe'))?.id,effects];`,
    strict: ['probe', 1],
    loose: [null, 0],
    babelStrict: { error: 'TypeError' },
  },
  {
    name: 'bound callable HTMLAllCollection needs no method receiver',
    source: `let effects=0;const all=document.all;globalThis.result=[all?.((effects++,'probe'))?.id,effects];`,
    strict: ['probe', 1],
    loose: [null, 0],
  },
  {
    name: 'method receiver through an optional base',
    source: `globalThis.result=[document.all?.namedItem('probe')?.id];`,
    strict: ['probe'],
    loose: [null],
  },
  {
    name: 'deletion and computed key effects',
    source: `let effects=0;document.all.auditMarker=3;const removed=delete document.all?.[(effects++,'auditMarker')];globalThis.result=[removed,effects,Object.hasOwn(document.all,'auditMarker')];`,
    strict: [true, 1, false],
    loose: [true, 0, true],
  },
];
function observe(code: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-htmldda-'));
  try {
    const filename = join(directory, 'index.html');
    const html = `<div id="probe"></div><script>
      const controls=[typeof document.all, document.all==null, document.all===undefined, typeof document.all.call];
      try { ${code}\n } catch (error) { globalThis.result={error:error.name}; }
      const output=document.createElement('pre');output.id='audit-result';
      output.textContent=JSON.stringify({controls,result:globalThis.result});document.body.append(output);
    </script>`;
    writeFileSync(filename, html);
    const child = spawnSync(browser!, ['--headless', '--dump-dom', pathToFileURL(filename).href], {
      encoding: 'utf8',
      timeout: 15_000,
    });
    expect(child.error).toBeUndefined();
    expect(child.signal).toBeNull();
    expect(child.status, child.stderr).toBe(0);
    const match = child.stdout.match(/<pre id="audit-result">([^<]+)<\/pre>/);
    expect(match, child.stdout).not.toBeNull();
    const observation = JSON.parse(match![1]);
    expect(observation.controls).toEqual(['undefined', true, false, 'undefined']);
    return observation.result;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
describe.skipIf(!browser)('real-browser HTMLDDA optional chains', () => {
  for (const loose of [false, true]) {
    describe.each(cases)(`$name: loose=${loose}`, entry => {
      let actual: unknown;
      const expected = loose ? entry.loose : (entry.babelStrict ?? entry.strict);
      beforeAll(() => {
        expect(observe(entry.source)).toEqual(entry.strict);
        const reference = transformSync(entry.source, {
          configFile: false,
          babelrc: false,
          plugins: [[optional, { loose }]],
        })!.code!;
        expect(observe(reference)).toEqual(expected);
        const code = compile(entry.source, { transforms: { optionalChaining: { loose } } });
        expect(code).not.toContain('?.');
        expect(code).not.toContain('@babel/runtime');
        if (!loose && entry.babelStrict) {
          expect(reference).toContain('.call(');
          expect(code).toContain('.call(');
        }
        actual = observe(code);
      });
      test('honors the selected strict or no-document-all assumption', () =>
        expect(actual).toEqual(expected));
    });
  }
});
