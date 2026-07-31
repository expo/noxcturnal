import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

function ranges(moduleName) {
  const { data } = require(`regenerate-unicode-properties/${moduleName}`).characters;
  assert.equal(data.length % 2, 0, `${moduleName} has malformed interval data`);
  const result = [];
  for (let index = 0; index < data.length; index += 2) {
    result.push(
      `    (0x${data[index].toString(16).toUpperCase()}, 0x${(data[index + 1] - 1).toString(16).toUpperCase()}),`,
    );
  }
  return result.join('\n');
}

function unicodePropertyFallbacks() {
  const properties = [
    {
      aliases: [
        'Script:Zzzz',
        'Script:Unknown',
        'Script_Extensions:Zzzz',
        'Script_Extensions:Unknown',
      ],
      module: 'Script/Unknown.js',
    },
    {
      aliases: [
        'Script:Berf',
        'Script:Beria_Erfe',
        'Script_Extensions:Berf',
        'Script_Extensions:Beria_Erfe',
      ],
      module: 'Script_Extensions/Beria_Erfe.js',
    },
    {
      aliases: ['General_Category:Zl', 'General_Category:Line_Separator'],
      module: 'General_Category/Line_Separator.js',
    },
    {
      aliases: ['General_Category:Zp', 'General_Category:Paragraph_Separator'],
      module: 'General_Category/Paragraph_Separator.js',
    },
    { aliases: ['Script:Sidt', 'Script:Sidetic'], module: 'Script/Sidetic.js' },
    { aliases: ['Script:Tayo', 'Script:Tai_Yo'], module: 'Script/Tai_Yo.js' },
    { aliases: ['Script:Tols', 'Script:Tolong_Siki'], module: 'Script/Tolong_Siki.js' },
    {
      aliases: ['Script_Extensions:Sidt', 'Script_Extensions:Sidetic'],
      module: 'Script_Extensions/Sidetic.js',
    },
    {
      aliases: ['Script_Extensions:Tayo', 'Script_Extensions:Tai_Yo'],
      module: 'Script_Extensions/Tai_Yo.js',
    },
    {
      aliases: ['Script_Extensions:Tols', 'Script_Extensions:Tolong_Siki'],
      module: 'Script_Extensions/Tolong_Siki.js',
    },
    {
      aliases: ['Changes_When_NFKC_Casefolded'],
      module: 'Binary_Property/Changes_When_NFKC_Casefolded.js',
    },
  ];
  const constants = properties
    .map(
      ({ module }, index) =>
        `const UNICODE_PROPERTY_FALLBACK_${index}: &[(u32, u32)] = &[\n${ranges(module)}\n];`,
    )
    .join('\n\n');
  const arms = properties
    .map(
      ({ aliases }, index) =>
        `        ${aliases.map(JSON.stringify).join(' | ')} => Some(UNICODE_PROPERTY_FALLBACK_${index}),`,
    )
    .join('\n');
  return `${constants}

pub(crate) fn unicode_property_supplemental_ranges(property: &str) -> Option<&'static [(u32, u32)]> {
    match property {
${arms}
        _ => None,
    }
}`;
}

function unicodeIgnoreCaseMappings() {
  const rewritePattern = require('regexpu-core');
  const mappings = require('regexpu-core/data/iu-mappings.js');
  const rows = [];
  for (const codePoint of mappings.keys()) {
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) continue;
    const source =
      codePoint <= 0xffff
        ? `\\u${codePoint.toString(16).padStart(4, '0')}`
        : `\\u{${codePoint.toString(16)}}`;
    const atom = rewritePattern(source, 'iu', { unicodeFlag: 'transform' });
    if (atom.toLowerCase() === source.toLowerCase()) continue;
    if (codePoint > 0xffff) {
      const mapped = mappings.get(codePoint);
      assert.equal(
        typeof mapped,
        'number',
        `unexpected astral /iu mapping for U+${codePoint.toString(16)}`,
      );
      rows.push({
        atom,
        astralClassAddition: `\\u{${mapped.toString(16).toUpperCase()}}`,
        codePoint,
      });
      continue;
    }
    assert.match(atom, /^\[.*\]$/, `unexpected BMP /iu expansion for U+${codePoint.toString(16)}`);
    const classBody = atom.slice(1, -1);
    const classAddition = [...classBody.matchAll(/\\u[0-9A-Fa-f]{4}|\\x[0-9A-Fa-f]{2}|\\.|[^\\]/gu)]
      .map(match => match[0])
      .filter(token => {
        if (token.startsWith('\\u')) return Number.parseInt(token.slice(2), 16) !== codePoint;
        if (token.startsWith('\\x')) return Number.parseInt(token.slice(2), 16) !== codePoint;
        if (token.startsWith('\\')) return token.codePointAt(1) !== codePoint;
        return token.codePointAt(0) !== codePoint;
      })
      .join('');
    rows.push({ atom, classAddition, classBody, codePoint });
  }
  const arms = key =>
    rows
      .filter(row => row[key] !== undefined)
      .map(
        row =>
          `        0x${row.codePoint.toString(16).toUpperCase()} => Some(${JSON.stringify(row[key])}),`,
      )
      .join('\n');
  return `pub(crate) fn unicode_ignore_case_atom(code_point: u32) -> Option<&'static str> {
    match code_point {
${arms('atom')}
        _ => None,
    }
}

pub(crate) fn unicode_ignore_case_bmp_class_addition(code_point: u32) -> Option<&'static str> {
    match code_point {
${arms('classAddition')}
        _ => None,
    }
}

pub(crate) fn unicode_ignore_case_bmp_class_body(code_point: u32) -> Option<&'static str> {
    match code_point {
${arms('classBody')}
        _ => None,
    }
}

pub(crate) fn unicode_ignore_case_astral_class_addition(code_point: u32) -> Option<&'static str> {
    match code_point {
${arms('astralClassAddition')}
        _ => None,
    }
}`;
}

function unicodeStringProperties() {
  const rewritePattern = require('regexpu-core');
  const properties = [
    'Emoji_Keycap_Sequence',
    'Basic_Emoji',
    'RGI_Emoji_Modifier_Sequence',
    'RGI_Emoji_Flag_Sequence',
    'RGI_Emoji_Tag_Sequence',
    'RGI_Emoji_ZWJ_Sequence',
    'RGI_Emoji',
  ];
  const patternArms = properties
    .map(property => {
      const pattern = rewritePattern(`\\p{${property}}`, 'v', { unicodeSetsFlag: 'transform' });
      return `        ${JSON.stringify(property)} => Some(${JSON.stringify(pattern)}),`;
    })
    .join('\n');
  const memberConstants = properties
    .map(property => {
      const { characters, strings } = require(
        `regenerate-unicode-properties/Property_of_Strings/${property}.js`,
      );
      const characterRanges = [];
      for (let index = 0; index < characters.data.length; index += 2) {
        characterRanges.push(
          `    (0x${characters.data[index].toString(16).toUpperCase()}, 0x${(characters.data[index + 1] - 1).toString(16).toUpperCase()}),`,
        );
      }
      const constant = property.replaceAll(/(?<!^)([A-Z])/g, '_$1').toUpperCase();
      return `const ${constant}_RANGES: &[(u32, u32)] = &[\n${characterRanges.join('\n')}\n];
const ${constant}_STRINGS: &[&str] = &[\n${strings.map(value => `    ${JSON.stringify(value)},`).join('\n')}\n];`;
    })
    .join('\n\n');
  const memberArms = properties
    .map(property => {
      const constant = property.replaceAll(/(?<!^)([A-Z])/g, '_$1').toUpperCase();
      return `        ${JSON.stringify(property)} => Some(UnicodeStringProperty { ranges: ${constant}_RANGES, strings: ${constant}_STRINGS }),`;
    })
    .join('\n');
  return `pub(crate) const UNICODE_STRING_PROPERTIES: &[&str] = &[
${properties.map(property => `    ${JSON.stringify(property)},`).join('\n')}
];

pub(crate) fn unicode_string_property_pattern(property: &str) -> Option<&'static str> {
    match property {
${patternArms}
        _ => None,
    }
}

pub(crate) struct UnicodeStringProperty {
    pub(crate) ranges: &'static [(u32, u32)],
    pub(crate) strings: &'static [&'static str],
}

${memberConstants}

pub(crate) fn unicode_string_property_members(property: &str) -> Option<UnicodeStringProperty> {
    match property {
${memberArms}
        _ => None,
    }
}`;
}

const unformatted = `// Generated by scripts/generate-regexp-unicode-properties.mjs.
// Source: regenerate-unicode-properties, pinned in package.json alongside Babel.

${unicodePropertyFallbacks()}

${unicodeIgnoreCaseMappings()}

${unicodeStringProperties()}
`;
const output = execFileSync('rustfmt', ['--edition', '2024', '--emit', 'stdout'], {
  encoding: 'utf8',
  input: unformatted,
});

const destination = join(root, 'src/generated/regexp_unicode_properties.rs');
if (check) {
  assert.equal(await readFile(destination, 'utf8'), output, `${destination} is stale`);
} else {
  await writeFile(destination, output);
}
