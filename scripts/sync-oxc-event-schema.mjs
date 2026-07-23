import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(
  execFileSync('cargo', ['metadata', '--format-version', '1'], { cwd: root, encoding: 'utf8' }),
);
const oxc = metadata.packages.find(pkg => pkg.name === 'oxc_ast');
if (!oxc) throw new Error('cargo metadata did not contain oxc_ast');
const source = fs.readFileSync(
  path.join(path.dirname(oxc.manifest_path), 'src/generated/ast_kind.rs'),
  'utf8',
);
const body = /pub enum AstType \{([\s\S]*?)\n\}/.exec(source)?.[1];
if (!body) throw new Error('Could not read Oxc AstType variants');
const variants = [...body.matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*=\s*\d+,/gm)].map(
  match => match[1],
);
const publicName = variant =>
  variant === 'IdentifierName' ||
  variant === 'IdentifierReference' ||
  variant === 'BindingIdentifier'
    ? 'Identifier'
    : variant;
const nodeTypes = [...new Set(variants.map(publicName))];
const schemaFile = path.join(root, 'protocol/event-schema.json');
const previous = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
const next = `${JSON.stringify({ nodeTypes, astKinds: Object.fromEntries(variants.map(variant => [variant, publicName(variant)])), predicateFields: previous.predicateFields, fieldKeys: previous.fieldKeys }, null, 2)}\n`;
if (process.argv[2] === '--check') {
  // Compare parsed content rather than bytes: the checked-in file is rewritten by the
  // repository formatter, which changes whitespace without changing the schema.
  if (
    JSON.stringify(JSON.parse(fs.readFileSync(schemaFile, 'utf8'))) !==
    JSON.stringify(JSON.parse(next))
  )
    throw new Error('protocol/event-schema.json is stale against oxc_ast; run pnpm codegen');
} else {
  fs.writeFileSync(schemaFile, next);
}
