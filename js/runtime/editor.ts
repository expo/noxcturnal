import { native } from '../native/binding';
import type { NativeEditor } from '../contracts/visitor';
import { packEdits } from '../protocol/edits';
import type { EditCommand } from '../types';

type EditKind = EditCommand['kind'];

interface EditorSession {
  readonly source: string;
  readonly sourceTextOperations?: InstanceType<typeof native.NativeSourceText>;
  commit(edits: EditCommand[], mode?: string): { code: string };
}

export function commitWithDedupe<Committed extends object>(
  edits: EditCommand[],
  commit: (data: Buffer) => Committed,
): Committed & { edits: EditCommand[]; deduped: number } {
  try {
    return { ...commit(packEdits(edits)), edits, deduped: 0 };
  } catch (error) {
    const { edits: deduped, dropped } = dedupeConvergentEdits(edits);
    if (dropped > 0) {
      try {
        return { ...commit(packEdits(deduped)), edits: deduped, deduped: dropped };
      } catch (retryError) {
        throw attributeEditConflict(retryError, deduped);
      }
    }
    throw attributeEditConflict(error, edits);
  }
}

export function createEditor(
  session: EditorSession,
  edits: EditCommand[],
  owner: string,
  nextOrder: () => number,
): NativeEditor {
  const source = session.source;
  const push = (kind: EditKind, start: number, end: number, content?: string) =>
    edits.push({ kind, start, end, content, owner, order: nextOrder() });
  // Replacing a range is an ordinary replacement whichever method asked for it, so
  // these agree with `overwrite`'s default rather than leaving the text unmapped.
  const replaceRange = (start: number, end: number, content: string) =>
    edits.push({
      kind: 'Replace',
      start,
      end,
      content,
      mapping: 'AnchorStart',
      owner,
      order: nextOrder(),
    });
  let text: InstanceType<typeof native.NativeSourceText> | undefined;
  const operations = () =>
    session.sourceTextOperations ?? (text ??= new native.NativeSourceText(source));
  let whitespace: number[] | undefined;
  const margins = () => (whitespace ??= operations().whitespace());
  const replace = (
    search: string | RegExp,
    replacement: string | ((match: string, ...groups: string[]) => string),
    all: boolean,
  ) => {
    const flags = typeof search === 'string' ? undefined : search.flags;
    // `String#replace` replaces every match of a global expression, and a sticky
    // expression resumes at `lastIndex`. Global search still starts at zero.
    const sticky = flags?.includes('y') === true && flags.includes('g') === false;
    const matches = operations().matches(
      typeof search === 'string' ? search : search.source,
      flags,
      all || flags?.includes('g') === true,
      typeof replacement === 'string' ? replacement : undefined,
      sticky ? search.lastIndex : undefined,
    );
    for (const match of matches)
      replaceRange(
        match.start,
        match.end,
        typeof replacement === 'function'
          ? replacement(match.captures[0]!, ...match.captures.slice(1))
          : match.content!,
      );
  };
  return {
    append: content => push('Suffix', source.length, source.length, content),
    prepend: content => push('Prefix', 0, 0, content),
    appendLeft: (offset, content) => push('AppendLeft', offset, offset, content),
    prependLeft: (offset, content) => push('PrependLeft', offset, offset, content),
    appendRight: (offset, content) => push('AppendRight', offset, offset, content),
    prependRight: (offset, content) => push('PrependRight', offset, offset, content),
    update: (start, end, content) => replaceRange(start, end, content),
    overwrite: (start, end, content, mapping) =>
      edits.push({
        kind: 'Replace',
        start,
        end,
        content,
        mapping: editorMappingPolicy(mapping),
        owner,
        order: nextOrder(),
      }),
    remove: (start, end) => push('Remove', start, end),
    move(start, end, destination) {
      if (destination > start && destination < end)
        throw new Error('move destination cannot be inside moved range');
      edits.push({ kind: 'Move', start, end, destination, owner, order: nextOrder() });
    },
    reset(start, end) {
      let write = 0;
      for (const edit of edits) {
        if (edit.owner === owner && edit.start >= start && edit.end <= end) continue;
        edits[write++] = edit;
      }
      edits.length = write;
    },
    indent(prefix = '  ') {
      push('Replace', 0, source.length, operations().indent(prefix));
    },
    trim() {
      this.trimStart();
      this.trimEnd();
    },
    trimStart() {
      const count = margins()[0]!;
      if (count) push('Remove', 0, count);
    },
    trimEnd() {
      const count = margins()[1]!;
      if (count) push('Remove', source.length - count, source.length);
    },
    addSourceMapLocation(offset) {
      push('AddSourceMapLocation', offset, offset);
    },
    hasChanged: () => edits.some(edit => edit.owner === owner),
    replace(search, replacement) {
      replace(search, replacement, false);
    },
    replaceAll(search, replacement) {
      replace(search, replacement, true);
    },
    slice: (start, end) => source.slice(start, end),
    toString: () => session.commit(edits).code,
    isEmpty: () => margins()[0] === source.length,
  };
}

// An ordinary replacement maps to the start of the range it replaced. Output is
// unmapped only when a caller says the text is generated, so omitting the policy
// cannot silently drop a mapping.
function editorMappingPolicy(
  value?: 'sourceless' | 'anchor-start' | 'anchor-boundaries' | 'identity',
): EditCommand['mapping'] {
  switch (value) {
    case 'sourceless':
      return 'Sourceless';
    case 'anchor-boundaries':
      return 'AnchorBoundaries';
    case 'identity':
      return 'Identity';
    case 'anchor-start':
    default:
      return 'AnchorStart';
  }
}

function attributeEditConflict(error: unknown, edits: readonly EditCommand[]): unknown {
  if (!(error instanceof Error)) return error;
  const match =
    /overlapping edits at (\d+)\.\.(\d+) and (\d+)\.\.(\d+)/.exec(error.message) ??
    /(?:copied|moved) range in edit (\d+)\.\.(\d+) partially overlaps edit (\d+)\.\.(\d+)/.exec(
      error.message,
    ) ??
    /circular source copy in edit (\d+)\.\.(\d+) through edit (\d+)\.\.(\d+)/.exec(error.message) ??
    /overlapping moved ranges at (\d+)\.\.(\d+) and (\d+)\.\.(\d+)/.exec(error.message) ??
    /move of (\d+)\.\.(\d+) lands inside moved range (\d+)\.\.(\d+)/.exec(error.message) ??
    /moved range at (\d+)\.\.(\d+) is partially overlapped by edit at (\d+)\.\.(\d+)/.exec(
      error.message,
    ) ??
    /moved range at (\d+)\.\.(\d+) conflicts with covering edit at (\d+)\.\.(\d+)/.exec(
      error.message,
    ) ??
    /edit at (\d+)\.\.(\d+) copies removed range (\d+)\.\.(\d+)/.exec(error.message);
  if (!match) return error;
  const findEdit = (start: number, end: number, exclude?: EditCommand) =>
    edits.find(
      edit =>
        edit !== exclude &&
        Math.min(edit.start, edit.end) === start &&
        Math.max(edit.start, edit.end) === end,
    );
  const sameRange = match[1] === match[3] && match[2] === match[4];
  const firstEdit = findEdit(Number(match[1]), Number(match[2]));
  const secondEdit = findEdit(
    Number(match[3]),
    Number(match[4]),
    sameRange ? firstEdit : undefined,
  );
  const first = firstEdit?.owner ?? 'unknown';
  const owners =
    sameRange && secondEdit == null ? [first] : [first, secondEdit?.owner ?? 'unknown'];
  error.message +=
    owners.length === 1 ? ` (owner: ${first})` : ` (owners: ${owners[0]}, ${owners[1]})`;
  (error as Error & { owners?: readonly string[] }).owners = owners;
  return error;
}

function identicalContentParts(
  a: readonly (string | { start: number; end: number })[],
  b: readonly (string | { start: number; end: number })[],
): boolean {
  return (
    a.length === b.length &&
    a.every((part, index) => {
      const other = b[index];
      if (typeof part === 'string' || typeof other === 'string') return part === other;
      return part.start === other.start && part.end === other.end;
    })
  );
}

function identicalConvergentEdit(a: EditCommand, b: EditCommand): boolean {
  if (a.kind !== b.kind || a.content !== b.content || a.destination !== b.destination) return false;
  if ((a.mapping ?? 'Sourceless') !== (b.mapping ?? 'Sourceless')) return false;
  const aNames = a.names ?? [];
  const bNames = b.names ?? [];
  if (aNames.length !== bNames.length || aNames.some((name, index) => name !== bNames[index]))
    return false;
  if (a.contentParts == null || b.contentParts == null)
    return a.contentParts == null && b.contentParts == null;
  return identicalContentParts(a.contentParts, b.contentParts);
}

function dedupeConvergentEdits(edits: readonly EditCommand[]): {
  edits: EditCommand[];
  dropped: number;
} {
  const byRange = new Map<string, EditCommand>();
  const kept: EditCommand[] = [];
  let dropped = 0;
  for (const edit of edits) {
    if (edit.end === edit.start) {
      kept.push(edit);
      continue;
    }
    const key = `${Math.min(edit.start, edit.end)}:${Math.max(edit.start, edit.end)}`;
    const first = byRange.get(key);
    if (first && identicalConvergentEdit(first, edit)) {
      dropped++;
      continue;
    }
    if (!first) byRange.set(key, edit);
    kept.push(edit);
  }
  return { edits: kept, dropped };
}
