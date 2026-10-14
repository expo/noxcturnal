import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import {
  classify,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
} from '../../index';
import { classifyForTransform } from '../classification';

describe.each(['d.ts', 'd.mts', 'd.cts', 'ts', 'mts', 'cts'])(
  '%s declaration classification',
  extension => {
    const filename = `input.${extension}`;
    const source = 'export declare const value: number;';
    const declaration = extension.startsWith('d.');
    let actual: string[];
    beforeAll(() => {
      const reference = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
      expect(reference.isDeclarationFile).toBe(declaration);
      const publicRoute = classify(filename, source);
      const internalRoute = classifyForTransform(filename, source);
      expect(publicRoute.supported).toBe(true);
      expect(internalRoute.supported).toBe(true);
      let prepared: string | undefined;
      let visits = 0;
      const plugin = defineNativePlugin({
        name: 'observe-declaration-route',
        createState({ parser }) {
          prepared = parser.syntax;
        },
        visitors: [
          defineVisitor('Program', {}, () => {
            visits++;
          }),
        ],
      });
      const result = transform(
        source,
        filename,
        defineNativePipeline({
          phases: [{ name: 'observe', plugins: [plugin] }],
        }),
      );
      expect(result.status).toBe('complete');
      expect(visits).toBe(1);
      expect(prepared).toBeDefined();
      actual = [publicRoute.syntax, internalRoute.syntax, prepared!];
    });
    (extension === 'd.mts' || extension === 'd.cts' ? test.fails : test)(
      'distinguishes declaration files from implementation files',
      () => expect(actual).toEqual(Array(3).fill(declaration ? 'dts' : 'ts')),
    );
  },
);
