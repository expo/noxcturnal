import type { NativeEditor } from '../contracts/visitor';
import { packEdits } from '../protocol/edits';
import type { EditCommand } from '../types';

type EditKind = EditCommand['kind'];

interface EditorSession {
  readonly source: string;
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
  const leading = () => source.length - source.trimStart().length;
  const trailing = () => source.length - source.trimEnd().length;
  return {
    append: content => push('Suffix', source.length, source.length, content),
    prepend: content => push('Prefix', 0, 0, content),
    appendLeft: (offset, content) => push('AppendLeft', offset, offset, content),
    prependLeft: (offset, content) => push('PrependLeft', offset, offset, content),
    appendRight: (offset, content) => push('AppendRight', offset, offset, content),
    prependRight: (offset, content) => push('PrependRight', offset, offset, content),
    update: (start, end, content) => push('Replace', start, end, content),
    overwrite: (start, end, content) => push('Replace', start, end, content),
    remove: (start, end) => push('Remove', start, end),
    move(start, end, destination) {
      if (destination > start && destination < end)
        throw new Error('move destination cannot be inside moved range');
      edits.push({ kind: 'Move', start, end, destination, owner, order: nextOrder() });
    },
    reset(start, end) {
      for (let index = edits.length - 1; index >= 0; index--)
        if (edits[index].owner === owner && edits[index].start >= start && edits[index].end <= end)
          edits.splice(index, 1);
    },
    indent(prefix = '  ') {
      push(
        'Replace',
        0,
        source.length,
        source
          .split(/(?<=\n)/)
          .map(line => (line.trim() ? prefix + line : line))
          .join(''),
      );
    },
    trim() {
      this.trimStart();
      this.trimEnd();
    },
    trimStart() {
      const count = leading();
      if (count) push('Remove', 0, count);
    },
    trimEnd() {
      const count = trailing();
      if (count) push('Remove', source.length - count, source.length);
    },
    addSourceMapLocation(offset) {
      push('AddSourceMapLocation', offset, offset);
    },
    hasChanged: () => edits.some(edit => edit.owner === owner),
    replace(search, replacement) {
      lowerReplacements(source, search, replacement, false, (start, end, content) =>
        push('Replace', start, end, content),
      );
    },
    replaceAll(search, replacement) {
      lowerReplacements(source, search, replacement, true, (start, end, content) =>
        push('Replace', start, end, content),
      );
    },
    slice: (start, end) => source.slice(start, end),
    toString: () => session.commit(edits).code,
    isEmpty: () => source.trim().length === 0,
  };
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

function lowerReplacements(
  source: string,
  search: string | RegExp,
  replacement: string | ((match: string, ...groups: string[]) => string),
  all: boolean,
  emit: (start: number, end: number, content: string) => void,
): void {
  const expression =
    typeof search === 'string'
      ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), all ? 'g' : '')
      : new RegExp(search.source, all && !search.global ? `${search.flags}g` : search.flags);
  let match: RegExpExecArray | null;
  while ((match = expression.exec(source))) {
    const content =
      typeof replacement === 'function'
        ? replacement(match[0], ...match.slice(1).map(value => value ?? ''))
        : match[0].replace(expression, replacement);
    emit(match.index, match.index + match[0].length, content);
    if (!all || !expression.global) break;
    if (match[0] === '') expression.lastIndex++;
  }
}
