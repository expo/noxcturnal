import fs from 'node:fs';
import path from 'node:path';
import babel from '@babel/core';
import { describe, expect, test } from 'vitest';

type Status = 'aligned' | 'consumer-owned' | 'excluded';

type InventoryEntry = {
  transform: string;
  status: Status;
  testFile?: string;
  profiles: readonly string[];
  options?: string;
  reason?: string;
};

// Reviewed against babel-preset-expo 56.0.13 at Expo commit 17aeb68d6bd.
// The preset is an inventory source only: alignment invokes each transform directly.
const inventory: InventoryEntry[] = [
  {
    transform: 'flow-strip-types',
    status: 'aligned',
    testFile: 'flow/type-stripping.test.ts',
    profiles: ['all'],
  },
  { transform: 'flow-enums', status: 'aligned', testFile: 'flow/enums.test.ts', profiles: ['all'] },
  {
    transform: 'flow-components',
    status: 'aligned',
    testFile: 'flow/components.test.ts',
    profiles: ['all'],
  },
  {
    transform: 'flow-hooks',
    status: 'aligned',
    testFile: 'flow/hooks.test.ts',
    profiles: ['all'],
  },
  {
    transform: 'flow-match',
    status: 'aligned',
    testFile: 'flow/match.test.ts',
    profiles: ['all'],
  },
  {
    transform: 'typescript',
    status: 'aligned',
    testFile: 'typescript/type-stripping.test.ts',
    profiles: ['all'],
    options: 'allowNamespaces',
  },
  {
    transform: 'react-jsx',
    status: 'aligned',
    testFile: 'jsx/automatic.test.ts',
    profiles: ['all'],
    options: 'automatic by default',
  },
  {
    transform: 'react-jsx-development',
    status: 'aligned',
    testFile: 'jsx/development.test.ts',
    profiles: ['all'],
    options: 'classic development',
  },
  {
    transform: 'react-pure-annotations',
    status: 'aligned',
    testFile: 'jsx/pure-annotations.test.ts',
    profiles: ['all'],
  },
  {
    transform: 'block-scoping',
    status: 'aligned',
    testFile: 'variables/block-scoping.test.ts',
    profiles: ['hermes-v0', 'hermes-v1', 'webview'],
  },
  {
    transform: 'classes',
    status: 'aligned',
    testFile: 'classes/classes.test.ts',
    profiles: ['hermes-v0', 'webview'],
  },
  {
    transform: 'class-properties',
    status: 'aligned',
    testFile: 'classes/class-properties.test.ts',
    profiles: ['hermes-v0', 'webview'],
    options: 'loose',
  },
  {
    transform: 'class-static-block',
    status: 'aligned',
    testFile: 'classes/static-block.test.ts',
    profiles: ['hermes-v0', 'hermes-v1', 'web', 'webview'],
    options: 'loose',
  },
  {
    transform: 'private-methods',
    status: 'aligned',
    testFile: 'classes/private-methods.test.ts',
    profiles: ['hermes-v0', 'web', 'webview'],
    options: 'loose',
  },
  {
    transform: 'private-property-in-object',
    status: 'aligned',
    testFile: 'classes/private-property-in-object.test.ts',
    profiles: ['hermes-v0', 'web', 'webview'],
    options: 'loose',
  },
  {
    transform: 'unicode-regex',
    status: 'aligned',
    testFile: 'regexp/unicode.test.ts',
    profiles: ['hermes-v0', 'webview'],
  },
  {
    transform: 'named-capturing-groups-regex',
    status: 'aligned',
    testFile: 'regexp/named-capture-groups.test.ts',
    profiles: ['hermes-v0', 'webview'],
  },
  {
    transform: 'destructuring',
    status: 'aligned',
    testFile: 'destructuring/destructuring.test.ts',
    profiles: ['hermes-v0', 'webview'],
    options: 'useBuiltIns',
  },
  {
    transform: 'async-generator-functions',
    status: 'aligned',
    testFile: 'functions/async-generators.test.ts',
    profiles: ['hermes-v0', 'hermes-v1', 'webview'],
  },
  {
    transform: 'async-to-generator',
    status: 'aligned',
    testFile: 'functions/async-functions.test.ts',
    profiles: ['hermes-v0', 'webview'],
  },
  {
    transform: 'parameters',
    status: 'aligned',
    testFile: 'functions/parameters.test.ts',
    profiles: ['hermes-v0', 'webview'],
  },
  {
    transform: 'for-of',
    status: 'aligned',
    testFile: 'loops/for-of.test.ts',
    profiles: ['webview'],
  },
  {
    transform: 'optional-catch-binding',
    status: 'aligned',
    testFile: 'errors/optional-catch-binding.test.ts',
    profiles: ['webview'],
  },
  {
    transform: 'optional-chaining',
    status: 'aligned',
    testFile: 'operators/optional-chaining.test.ts',
    profiles: ['webview'],
    options: 'loose',
  },
  {
    transform: 'nullish-coalescing-operator',
    status: 'aligned',
    testFile: 'operators/nullish-coalescing.test.ts',
    profiles: ['webview'],
    options: 'loose',
  },
  {
    transform: 'logical-assignment-operators',
    status: 'aligned',
    testFile: 'operators/logical-assignment.test.ts',
    profiles: ['webview'],
    options: 'loose',
  },
  {
    transform: 'object-rest-spread',
    status: 'aligned',
    testFile: 'objects/object-rest-spread.test.ts',
    profiles: ['hermes-v0 default engine', 'web', 'server'],
    options: 'loose, useBuiltIns',
  },
  {
    transform: 'export-namespace-from',
    status: 'aligned',
    testFile: 'modules/export-namespace-from.test.ts',
    profiles: ['all'],
  },
  { transform: 'react-display-name', status: 'consumer-owned', profiles: ['hermes-v0', 'webview'] },
  {
    transform: 'fix-hermes-v1-async-arrow-non-simple-params',
    status: 'consumer-owned',
    profiles: ['hermes-v1'],
  },
  {
    transform: 'fix-hermes-v1-super-in-object-accessor',
    status: 'consumer-owned',
    profiles: ['hermes-v1'],
  },
  {
    transform: 'fix-hermes-v1-class-in-finally',
    status: 'consumer-owned',
    profiles: ['hermes-v1'],
  },
  { transform: 'transform-runtime', status: 'excluded', profiles: ['all'] },
  { transform: 'proposal-export-default-from', status: 'consumer-owned', profiles: ['all'] },
  { transform: 'modules-commonjs', status: 'consumer-owned', profiles: ['metro'] },
  { transform: 'define-plugin', status: 'consumer-owned', profiles: ['all'] },
  {
    transform: 'minify-platform-select',
    status: 'consumer-owned',
    profiles: ['production'],
  },
  { transform: 'inline-env-vars', status: 'consumer-owned', profiles: ['metro client'] },
  { transform: 'inline-manifest', status: 'consumer-owned', profiles: ['metro'] },
  { transform: 'expo-router', status: 'consumer-owned', profiles: ['installed'] },
  { transform: 'server-metadata', status: 'consumer-owned', profiles: ['expo-router'] },
  { transform: 'server-data-loaders', status: 'consumer-owned', profiles: ['expo-router'] },
  { transform: 'client-module-proxy', status: 'consumer-owned', profiles: ['all'] },
  { transform: 'server-actions', status: 'consumer-owned', profiles: ['react-server'] },
  { transform: 'restricted-react-api', status: 'consumer-owned', profiles: ['react-server'] },
  { transform: 'use-dom-directive', status: 'consumer-owned', profiles: ['client'] },
  {
    transform: 'environment-restricted-imports',
    status: 'consumer-owned',
    profiles: ['all'],
  },
  { transform: 'widgets', status: 'consumer-owned', profiles: ['installed'] },
  { transform: 'detect-dynamic-exports', status: 'consumer-owned', profiles: ['static ESM'] },
  { transform: 'import-meta', status: 'consumer-owned', profiles: ['all'] },
  {
    transform: 'warn-on-deep-rn-imports',
    status: 'consumer-owned',
    profiles: ['development'],
  },
  {
    transform: 'react-compiler',
    status: 'excluded',
    profiles: ['opt-in'],
    reason: 'Version-coupled native conformance suite',
  },
  {
    transform: 'react-refresh',
    status: 'excluded',
    profiles: ['development'],
    reason: 'Separate native conformance suite',
  },
  { transform: 'react-native-codegen', status: 'excluded', profiles: ['native'] },
  { transform: 'lazy-decorators', status: 'excluded', profiles: ['all'] },
  { transform: 'reanimated/worklets', status: 'excluded', profiles: ['installed'] },
  { transform: 'react-native-web', status: 'excluded', profiles: ['web'] },
];

describe('babel-preset-expo transform inventory', () => {
  test('pins the reviewed preset version', () => {
    expect(require('babel-preset-expo/package.json').version).toBe('56.0.13');
  });

  test('classifies every entry once', () => {
    const names = inventory.map(entry => entry.transform);
    expect(new Set(names).size).toBe(names.length);
  });

  test('keeps an executable test for every aligned entry', () => {
    const root = path.dirname(new URL(import.meta.url).pathname);
    for (const entry of inventory) {
      if (entry.status !== 'aligned') continue;
      expect(entry.testFile, entry.transform).toBeTruthy();
      expect(fs.existsSync(path.resolve(root, entry.testFile!)), entry.transform).toBe(true);
    }
  });

  test.each([
    [
      'hermes-v0',
      {},
      [
        'transform-block-scoping',
        'transform-class-properties',
        'transform-class-static-block',
        'transform-private-methods',
        'transform-private-property-in-object',
        'transform-unicode-regex',
        'transform-classes',
        'transform-named-capturing-groups-regex',
        'transform-destructuring',
        'transform-async-generator-functions',
        'transform-async-to-generator',
        'transform-parameters',
        'transform-react-display-name',
      ],
    ],
    [
      'hermes-v1',
      { dev: true },
      [
        'fix-hermes-v1-async-arrow-non-simple-params',
        'fix-hermes-v1-super-in-object-accessor',
        'fix-hermes-v1-class-in-finally',
        'transform-block-scoping',
        'transform-class-static-block',
        'transform-async-generator-functions',
      ],
    ],
    [
      'web',
      {},
      [
        'transform-class-static-block',
        'transform-private-methods',
        'transform-private-property-in-object',
      ],
    ],
    [
      'webview',
      {},
      [
        'transform-block-scoping',
        'transform-class-properties',
        'transform-class-static-block',
        'transform-classes',
        'transform-private-methods',
        'transform-private-property-in-object',
        'transform-unicode-regex',
        'transform-named-capturing-groups-regex',
        'transform-destructuring',
        'transform-async-generator-functions',
        'transform-async-to-generator',
        'transform-for-of',
        'transform-parameters',
        'transform-react-display-name',
        'transform-optional-catch-binding',
        'transform-optional-chaining',
        'transform-nullish-coalescing-operator',
        'transform-logical-assignment-operators',
      ],
    ],
  ] as const)('detects %s syntax-profile drift', (config, options, expected) => {
    expect(resolveConfigPluginKeys(config, options)).toEqual(expected);
  });

  test.each([
    [
      'production automatic',
      { dev: false, jsxRuntime: 'automatic' },
      ['transform-react-jsx', 'transform-react-pure-annotations'],
    ],
    [
      'development classic',
      { dev: true, jsxRuntime: 'classic' },
      ['transform-react-jsx/development'],
    ],
  ] as const)('detects React config drift for %s', (_name, options, expected) => {
    expect(resolveConfigPluginKeys('react', options)).toEqual(expected);
  });
});

function resolveConfigPluginKeys(config: string, options: object): string[] {
  const preset = require(`babel-preset-expo/build/configs/${config}`);
  const resolved = babel.loadOptions({
    babelrc: false,
    configFile: false,
    filename: '/alignment/input.jsx',
    presets: [[preset, options]],
  });
  if (resolved == null) throw new Error(`Could not resolve Expo ${config} config`);
  const plugins = (resolved as { plugins: Array<{ key: string }> }).plugins;
  return plugins.map(plugin => plugin.key);
}
