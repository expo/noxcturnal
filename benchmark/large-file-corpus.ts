export type LargeFileShape =
  | 'shallow'
  | 'nested'
  | 'functions'
  | 'dependencies'
  | 'sparse-edits'
  | 'dense-edits';

export interface LargeFileFixture {
  readonly shape: LargeFileShape;
  readonly minimumBytes: number;
  readonly source: string;
}

const LARGE_FILE_SIZES = [
  256 * 1024,
  650 * 1024,
  1024 * 1024,
  2 * 1024 * 1024,
  5 * 1024 * 1024,
] as const;

const LARGE_FILE_SHAPES: readonly LargeFileShape[] = [
  'shallow',
  'nested',
  'functions',
  'dependencies',
  'sparse-edits',
  'dense-edits',
];

export function generateLargeFileSource(minimumBytes: number, shape: LargeFileShape): string {
  const lines: string[] = [];
  let bytes = 0;
  for (let index = 0; bytes < minimumBytes; index++) {
    const line =
      shape === 'nested'
        ? `export const nested${index}=((((source${index}+${index})*2)-1)??0);\n`
        : shape === 'functions'
          ? `export const function${index}=function named${index}(value){return value+${index}};\n`
          : shape === 'dependencies'
            ? `const dependency${index}=require("dependency-${index % 128}");\n`
            : shape === 'sparse-edits'
              ? `export const ${index % 100 === 0 ? 'EDIT_' : ''}value${index}=source${index};\n`
              : shape === 'dense-edits'
                ? `export const EDIT_value${index}=source${index};\n`
                : `export const generatedValue${index}=source${index}+${index};\n`;
    lines.push(line);
    bytes += Buffer.byteLength(line);
  }
  return lines.join('');
}

export function buildLargeFileCorpus(): readonly LargeFileFixture[] {
  return LARGE_FILE_SIZES.flatMap(minimumBytes =>
    LARGE_FILE_SHAPES.map(shape => ({
      shape,
      minimumBytes,
      source: generateLargeFileSource(minimumBytes, shape),
    })),
  );
}
