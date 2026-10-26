import type { TraversalEvent } from '../protocol/events';
import { native } from '../native/binding';
import { EDIT_OWNER, type OwnedEdit } from './editor';
import { CHILD_ROLES, FIELD_KEY_IDS } from '../generated/event-schema';
import { alias, array } from '../pipeline/route-utils';
import {
  isFragmentList,
  isProvenanceCode,
  makeSourceFragment,
  realizeContent,
  type RealizedContent,
  sourceFragmentBelongsTo,
} from './fragments';
import type {
  ControlFlowCapability,
  EditCommand,
  NativeEvent,
  NativeFieldKey,
  NodeOfType,
  NodeSummary,
  NodeView,
  QueryResult,
  SourceLocation,
} from '../types';
import {
  NativeTransformError,
  type Code,
  type CodeFragment,
  type CompositeFragment,
  type DefinedVisitor,
  type NativeBinding,
  type NativeNodePath,
  type NativeScope,
  type PluginContext,
  type SnapshotOptions,
  type SourceFragment,
} from '../contracts/visitor';
import type { NativeTransformSession } from './session';
import type { RouteCapabilities } from '../pipeline/types';

export type { RouteCapabilities } from '../pipeline/types';

export function childRoleIsDeclared(roles: readonly string[], requestedRole: string): boolean {
  return roles.includes(requestedRole);
}

/** Identifier and static/computed member nodes are the only patterns `matchesPattern` can match. */
function patternField(type: string): 'name' | 'memberPath' | undefined {
  if (type === 'Identifier') return 'name';
  if (type === 'StaticMemberExpression' || type === 'ComputedMemberExpression') return 'memberPath';
  return undefined;
}

export function eventIsSkipped(event: NativeEvent, skipped: SkipState | undefined): boolean {
  if (!skipped) return false;
  const position =
    (event as TraversalEvent).traversalEnd != null
      ? event.sequence
      : skipped.intervals?.[event.id * 2];
  if (position == null) throw new Error('missing structural skip bounds');
  const active = skipped.active;
  if (active) {
    if (position > active.start && position < active.end) return true;
    if (event.side === 'exit' && event.id === active.id) {
      skipped.active = undefined;
      return false;
    }
  }
  const ranges = skipped.ranges;
  while (skipped.cursor < ranges.length && ranges[skipped.cursor].end <= position) {
    skipped.cursor++;
  }
  const range = ranges[skipped.cursor];
  if (!range || position < range.start || position >= range.end) return false;
  skipped.active = range;
  if (position === range.start) return false;
  return true;
}

export type SkipRange = { id: number; start: number; end: number };
export type SkipState = {
  intervals?: Uint32Array;
  ranges: SkipRange[];
  cursor: number;
  active?: SkipRange;
};

export function resetSkippedTraversal(skipped: SkipState | undefined): void {
  if (!skipped) return;
  skipped.cursor = 0;
  skipped.active = undefined;
}

function addSkippedRange(
  state: PathState,
  id: number,
  start: number,
  end: number,
  intervals?: Uint32Array,
): void {
  const skipped = (state.skipped ??= { ranges: [], cursor: 0 });
  if (intervals) skipped.intervals = intervals;
  const ranges = skipped.ranges;
  const last = ranges.at(-1);
  if (!last || last.end <= start) {
    const range = { id, start, end };
    ranges.push(range);
    skipped.active = range;
    skipped.cursor = Math.min(skipped.cursor, ranges.length - 1);
    return;
  }
  if (last.start <= start) {
    // The existing interval owns the earlier traversal root.
    if (end > last.end) last.end = end;
    skipped.active = last;
    skipped.cursor = Math.min(skipped.cursor, ranges.length - 1);
    return;
  }
  let index = ranges.findIndex(range => range.end > start);
  if (index < 0) index = ranges.length;
  let mergedId = id;
  let mergedStart = start;
  let mergedEnd = end;
  let removeEnd = index;
  while (removeEnd < ranges.length && ranges[removeEnd].start < mergedEnd) {
    if (ranges[removeEnd].start < mergedStart) mergedId = ranges[removeEnd].id;
    mergedStart = Math.min(mergedStart, ranges[removeEnd].start);
    mergedEnd = Math.max(mergedEnd, ranges[removeEnd].end);
    removeEnd++;
  }
  const range = { id: mergedId, start: mergedStart, end: mergedEnd };
  ranges.splice(index, removeEnd - index, range);
  skipped.active = range;
  skipped.cursor = Math.min(skipped.cursor, index);
}

export type PathState = { stopped: boolean; skipped?: SkipState };
export type PathRuntime = {
  session: NativeTransformSession;
  context: PluginContext;
  edits: OwnedEdit[];
  ownerIdentity?: object;
  owner: string;
  nextOrder: () => number;
  state: PathState;
  nested: (target: NativeEvent, visitor: readonly DefinedVisitor<any>[], value: any) => void;
  widen: (target: NativeEvent, types: string[], scopeOnly: boolean) => void;
  parent: (target: NativeEvent, id: number, ancestryDepth: number) => NativeNodePath | null;
  children: (target: NativeEvent, ancestryDepth: number, role?: string) => NativeNodePath[];
  allowsAncestry: () => boolean;
  allowsScope: () => boolean;
  scopeCache: Map<number, NativeScope>;
  pathCache: (NativeNodePath | undefined)[] | undefined;
  cacheAncestorPaths: boolean;
  ancestryDepthLimit: number;
  assertControl: (capability: ControlFlowCapability) => void;
  capabilities: RouteCapabilities;
  provenance: { degradations: number };
};
export function makePath(
  runtime: PathRuntime,
  event: NativeEvent,
  ancestryDepth = 0,
  deliveredRoute = false,
): NativeNodePath {
  return new NodePathImpl(runtime, event, ancestryDepth, deliveredRoute);
}

export class NodePathImpl implements NativeNodePath {
  // Plain properties instead of #private fields: this class is allocated once per
  // route delivery, and private-field initialization is measurably slower in V8.
  private lazyNode: NodeView | undefined = undefined;
  private lazyParent: NodeSummary | null | undefined = undefined;
  private lazyScope: NativeScope | undefined = undefined;
  constructor(
    readonly runtime: PathRuntime,
    readonly event: NativeEvent,
    readonly ancestryDepth: number,
    readonly deliveredRoute = false,
  ) {}
  get id(): number {
    return this.event.id;
  }
  get type(): string {
    return this.event.type;
  }
  get start(): number {
    return this.event.start;
  }
  get end(): number {
    return this.event.end;
  }
  get node(): NodeView {
    if (!this.lazyNode) {
      // Scalar capability boundaries are enforced by DerivedNodePath's TypeScript
      // view. The shared phase record may contain another visitor's field union;
      // returning it directly keeps ancestor reads allocation-free at runtime.
      this.lazyNode = this.runtime.session.nodeView(this.event);
    }
    return this.lazyNode;
  }
  get context(): PluginContext {
    return this.runtime.context;
  }
  get parent(): NodeSummary | null {
    this.#assertAncestry();
    return (this.lazyParent ??=
      this.event.parentId == null
        ? null
        : { id: this.event.parentId, type: this.event.parentType! });
  }
  get parentPath(): NativeNodePath | null {
    this.#assertAncestry();
    if (!this.#canReachParent()) return null;
    return this.event.parentId == null
      ? null
      : this.runtime.parent(this.event, this.event.parentId, this.ancestryDepth + 1);
  }
  get scope(): NativeScope {
    if (!this.runtime.allowsScope())
      throw new Error(`${this.runtime.owner}: undeclared scope semantics`);
    if (this.lazyScope) return this.lazyScope;
    const id = this.runtime.session.ownedScopeId(this.event.id) ?? this.event.scopeId;
    return (this.lazyScope = makeScope(this.runtime, id, this.runtime.session.scopeParentId(id)));
  }

  getSource(): SourceFragment {
    return makeSourceFragment(this.runtime.session, this.event.start, this.event.end);
  }
  withDeclarationName(name: string): CompositeFragment {
    let identifier: CodeFragment;
    try {
      identifier = this.runtime.context.code.identifier(name);
    } catch (cause) {
      throw this.#pluginError(`Invalid declaration identifier: ${name}`, cause);
    }
    const metadata = this.event as NativeEvent & Record<string, unknown>;
    const anchor = metadata.declarationNameAnchor;
    if (
      (this.event.type !== 'Function' && this.event.type !== 'Class') ||
      typeof anchor !== 'number' ||
      anchor < this.event.start ||
      anchor > this.event.end ||
      typeof metadata.declarationNamePrefix !== 'boolean'
    ) {
      throw this.buildCodeFrameError(
        'withDeclarationName only supports anonymous function and class declarations with native metadata',
      );
    }
    const parts: (string | CodeFragment | SourceFragment)[] = [
      makeSourceFragment(this.runtime.session, this.event.start, anchor),
    ];
    if (metadata.declarationNamePrefix) parts.push(' ');
    parts.push(identifier);
    parts.push(makeSourceFragment(this.runtime.session, anchor, this.event.end));
    return Object.freeze({ kind: 'composite', parts: Object.freeze(parts) });
  }
  sourceText(): string {
    return this.runtime.session.source.slice(this.event.start, this.event.end);
  }
  getComments(relation: 'inner') {
    if (
      !this.deliveredRoute ||
      relation !== 'inner' ||
      this.runtime.capabilities.comments !== relation
    ) {
      throw this.#pluginError(
        `undeclared comment relation ${relation} (declare comments: 'inner' on the visitor contract)`,
      );
    }
    return this.event.comments ?? [];
  }
  snapshot(options: SnapshotOptions = {}): Readonly<NodeView> {
    const fields = options.fields;
    let source = this.node as NodeView & Record<string, unknown>;
    if (fields) {
      for (const field of fields)
        if (!FIELD_KEY_IDS.has(field)) throw new Error(`unknown snapshot field ${field}`);
      const missing = fields.filter(field => !(field in source));
      if (missing.length > 0) {
        const inspected = this.runtime.session.inspect([
          { nodeId: this.event.id, fields: fields as NativeFieldKey[] },
        ])[0];
        if (inspected) Object.assign(source, inspected);
      }
    }
    const snapshot: Record<string, unknown> = {
      id: source.id,
      type: source.type,
      start: source.start,
      end: source.end,
      scopeId: source.scopeId,
    };
    if (source.scopeParentId != null) snapshot.scopeParentId = source.scopeParentId;
    for (const field of fields ?? Object.keys(source)) {
      if (!(field in snapshot) && field in source) snapshot[field] = source[field];
    }
    if (options.ancestry === 'none') {
      delete snapshot.parentId;
      delete snapshot.parentType;
      delete snapshot.parentStart;
    }
    if (options.ancestry === 'parent' && this.event.parentId != null) {
      snapshot.parentId = this.event.parentId;
      snapshot.parentType = this.event.parentType;
    }
    return Object.freeze(snapshot) as Readonly<NodeView>;
  }
  getLocation(): SourceLocation {
    return this.runtime.session.sourceLocation(this.event.start, this.event.end);
  }
  is<TType extends string>(type: TType): this is NativeNodePath<NodeOfType<TType>> {
    return type === this.event.type;
  }
  childrenUnchecked(): readonly NativeNodePath[] {
    return this.runtime.children(this.event, this.ancestryDepth);
  }
  getChildren(): readonly NativeNodePath[] {
    this.#assertChildRole('*');
    return this.childrenUnchecked();
  }
  get(key: string): NativeNodePath | readonly NativeNodePath[] | null {
    this.#assertChildRole(key);
    if (key === '*') return this.childrenUnchecked();
    const declaration = CHILD_ROLES[this.node.type]?.[key];
    if (declaration == null)
      throw new Error(`${this.node.type} does not expose child role ${JSON.stringify(key)}`);
    const children = this.runtime.children(this.event, this.ancestryDepth, key);
    return declaration.list ? children : (children[0] ?? null);
  }
  getChild(key: string): NativeNodePath | null {
    const value = this.get(key);
    if (Array.isArray(value)) throw new Error(`${this.node.type}.${key} is a child list`);
    return value as NativeNodePath | null;
  }
  getChildList(key: string): readonly NativeNodePath[] {
    const value = this.get(key);
    if (!Array.isArray(value)) throw new Error(`${this.node.type}.${key} is not a child list`);
    return value;
  }
  matchesPattern(pattern: string, allowPartial = false): boolean {
    const capabilities = this.runtime.capabilities;
    const fields =
      this.ancestryDepth > 0
        ? capabilities.ancestorFields?.[this.type]
        : this.deliveredRoute
          ? capabilities.declaredFields
          : capabilities.childFields?.[this.type];
    // Super, spread elements, and other non-members cannot match. An identifier
    // reached through a memberPath declaration is not a static chain either:
    // `Icon.select({})` and `other({})` share one Expression callee contract.
    const field = patternField(this.type);
    if (field == null) return false;
    if (!fields?.includes(field)) {
      if (field === 'name' && fields?.includes('memberPath')) return false;
      throw this.#pluginError(`matchesPattern requires declared field ${field}`);
    }
    const memberPath = this.node[field];
    // This validates the small pattern contract, never JavaScript source.
    if (pattern.includes('\\'))
      for (let i = 0; i < pattern.length; i++)
        if (pattern[i] === '\\' && pattern[++i] !== '.' && pattern[i] !== '\\') return false;
    if (!pattern.length || typeof memberPath !== 'string') return false;
    return memberPath === pattern || (allowPartial && memberPath.startsWith(`${pattern}.`));
  }
  #assertChildRole(role: string): void {
    const rules =
      this.ancestryDepth === 0
        ? this.runtime.capabilities.childRules
        : this.runtime.capabilities.ancestorChildRules;
    if (!childRoleIsDeclared(rules?.[this.event.type] ?? [], role))
      throw new Error(`${this.runtime.owner}: undeclared child role ${this.node.type}.${role}`);
  }
  #assertAncestry(): void {
    if (!this.runtime.allowsAncestry())
      throw new Error(`${this.runtime.owner}: undeclared ancestry access`);
  }
  #canReachParent(): boolean {
    return this.ancestryDepth < this.runtime.ancestryDepthLimit;
  }
  findParent(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null {
    this.#assertAncestryMethod('findParent');
    let parent = this.parentPath;
    while (parent) {
      if (predicate(parent)) return parent;
      parent = parent.parentPath;
    }
    return null;
  }
  find(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null {
    this.#assertAncestryMethod('find');
    let current: NativeNodePath | null = this;
    while (current) {
      if (predicate(current)) return current;
      current = current.parentPath;
    }
    return null;
  }
  getFunctionParent(): NativeNodePath | null {
    this.#assertAncestryMethod('getFunctionParent');
    return this.findParent(parent => alias('Function', parent.node.type));
  }
  getProgramParent(): NativeNodePath | null {
    this.#assertAncestryMethod('getProgramParent');
    return this.findParent(parent => parent.node.type === 'Program');
  }
  #assertAncestryMethod(
    method: 'findParent' | 'find' | 'getFunctionParent' | 'getProgramParent',
  ): void {
    const mode = this.runtime.capabilities.ancestry?.mode;
    const allowed =
      typeof mode === 'number' ||
      (method === 'findParent' || method === 'find'
        ? mode === 'findParent' || mode === 'functionParent' || mode === 'programParent'
        : method === 'getFunctionParent'
          ? mode === 'functionParent' || mode === 'programParent'
          : mode === 'programParent');
    if (!allowed)
      throw new Error(
        `${this.runtime.owner}: ancestry mode ${String(mode)} does not allow ${method}`,
      );
  }
  #edit(kind: EditKind, content?: string | CodeFragment): void {
    this.runtime.edits.push({
      kind,
      start: this.event.start,
      end: this.event.end,
      content: typeof content === 'string' ? content : content?.code,
      mapping: typeof content === 'string' ? 'Sourceless' : mappingPolicy(content?.mapping),
      names:
        typeof content === 'string' ? undefined : content?.names ? [...content.names] : undefined,
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
      [EDIT_OWNER]: this.runtime.ownerIdentity,
    });
  }
  /** Lower a provenance-carrying replacement into gap edits around kept source ranges.
   *
   * Source fragments that lie inside the replaced range, in order, survive in place:
   * no edit covers them, so other plugins' edits within those ranges compose instead
   * of conflicting, and their source mappings stay exact. Fragments that cannot be
   * kept (other session, out of range or order) degrade to plain-text copies.
   */
  #replaceStructured(fragment: SourceFragment | CompositeFragment): void {
    const parts = fragment.kind === 'source' ? [fragment] : fragment.parts;
    const session = this.runtime.session;
    const end = this.event.end;
    let cursor = this.event.start;
    let glue: (string | { start: number; end: number })[] = [];
    let glueHasCopy = false;
    let glueMapping: EditCommand['mapping'] = 'Sourceless';
    let glueNames: string[] = [];
    const degraded = this.#degraded;
    // All gap edits lowered from one structured replacement share an order. This
    // lets deferred source copies distinguish sibling gaps from unrelated edits
    // while preserving the original ordering against other commands.
    const order = this.runtime.nextOrder();
    const flush = (gapEnd: number) => {
      if (glue.length > 0 || gapEnd > cursor) {
        const shared = {
          kind: 'Replace' as const,
          start: cursor,
          end: gapEnd,
          mapping: glue.length === 0 ? ('Sourceless' as const) : glueMapping,
          names: glueNames.length > 0 ? glueNames : undefined,
          owner: this.runtime.owner,
          order,
          [EDIT_OWNER]: this.runtime.ownerIdentity,
        };
        if (glueHasCopy) this.runtime.edits.push({ ...shared, contentParts: glue });
        else this.runtime.edits.push({ ...shared, content: glue.join('') });
      }
      cursor = gapEnd;
      glue = [];
      glueHasCopy = false;
      glueMapping = 'Sourceless';
      glueNames = [];
    };
    for (const part of parts) {
      if (typeof part === 'string') {
        if (part) glue.push(part);
        continue;
      }
      if ('kind' in part) {
        const sameSession = sourceFragmentBelongsTo(part, session);
        if (sameSession && part.start >= cursor && part.end <= end && part.start <= part.end) {
          flush(part.start);
          cursor = part.end;
        } else if (sameSession) {
          degraded(
            `source fragment ${part.start}..${part.end} cannot be kept in place ` +
              '(out of order or outside the replaced range); deferred to a commit-time copy',
            part,
          );
          glue.push({ start: part.start, end: part.end });
          glueHasCopy = true;
          if (glueMapping === 'Sourceless') glueMapping = 'AnchorBoundaries';
        } else {
          degraded(
            `source fragment ${part.start}..${part.end} comes from another phase; copied as text`,
            part,
          );
          if (part.text()) glue.push(part.text());
          if (glueMapping === 'Sourceless') glueMapping = 'AnchorBoundaries';
        }
        continue;
      }
      if (part.code) glue.push(part.code);
      const policy = mappingPolicy(part.mapping);
      if (policy !== 'Sourceless') glueMapping = policy;
      if (part.names) glueNames.push(...part.names);
    }
    flush(end);
  }

  replaceWith(code: Code): void {
    if (typeof code !== 'string' && isProvenanceCode(code)) this.#replaceStructured(code);
    else this.#edit('Replace', code);
  }
  replaceWithMultiple(code: readonly Code[]): void {
    if (code.some(value => typeof value !== 'string' && isProvenanceCode(value))) {
      const parts: (string | CodeFragment | SourceFragment)[] = [];
      code.forEach((value, index) => {
        if (index > 0) parts.push('\n');
        if (typeof value === 'string' || !isProvenanceCode(value)) parts.push(value);
        else if (value.kind === 'source') parts.push(value);
        else parts.push(...value.parts);
      });
      this.#replaceStructured({ kind: 'composite', parts });
      return;
    }
    const fragments = code as readonly (string | CodeFragment)[];
    if (fragments.length === 1) {
      const fragment = fragments[0]!;
      this.#edit(
        'Replace',
        typeof fragment === 'string' ? { code: fragment, mapping: 'anchor-boundaries' } : fragment,
      );
      return;
    }
    const first = fragments[0];
    const policy =
      typeof first === 'string' ? 'anchor-boundaries' : (first?.mapping ?? 'sourceless');
    let separate = false;
    for (const value of fragments) {
      if (
        (typeof value === 'string' ? 'anchor-boundaries' : (value.mapping ?? 'sourceless')) !==
          policy ||
        (typeof value !== 'string' && value.names?.length)
      ) {
        separate = true;
        break;
      }
    }
    if (separate) {
      // Keep one ranged replacement for conflicts, with preceding zero-width
      // replacement runs at the same affinity. They form one deduplication unit.
      const order = this.runtime.nextOrder();
      let separatorNeeded = false;
      fragments.forEach((value, index) => {
        if (separatorNeeded)
          this.runtime.edits.push({
            kind: 'Replace',
            start: this.event.start,
            end: this.event.start,
            content: '\n',
            mapping: 'Sourceless',
            owner: this.runtime.owner,
            order,
            [EDIT_OWNER]: this.runtime.ownerIdentity,
          });
        const mapping =
          typeof value === 'string' ? 'AnchorBoundaries' : mappingPolicy(value.mapping);
        const text = typeof value === 'string' ? value : value.code;
        // A sourceless separator can share the preceding sourceless run. Mapped
        // runs retain a separate separator so its provenance stays unmapped.
        const absorbSeparator = mapping === 'Sourceless' && index < fragments.length - 1;
        this.runtime.edits.push({
          kind: 'Replace',
          start: this.event.start,
          end: index === fragments.length - 1 ? this.event.end : this.event.start,
          content: absorbSeparator ? text + '\n' : text,
          mapping,
          names: typeof value === 'string' || !value.names ? undefined : [...value.names],
          owner: this.runtime.owner,
          order,
          [EDIT_OWNER]: this.runtime.ownerIdentity,
        });
        separatorNeeded = !absorbSeparator;
      });
      return;
    }
    this.#edit('Replace', joinFragments(fragments));
  }
  update(code: Code): void {
    this.replaceWith(code);
  }
  overwrite(code: Code): void {
    this.replaceWith(code);
  }
  remove(): void {
    this.#edit('Remove');
  }
  #insert(
    kind: EditKind,
    offset: number,
    content: Code | readonly Code[],
    prefix = '',
    suffix = '',
  ): void {
    if (typeof content === 'string' || (!isFragmentList(content) && !('kind' in content))) {
      const fragment = typeof content === 'string' ? undefined : content;
      this.runtime.edits.push({
        kind,
        start: offset,
        end: offset,
        content: prefix + (typeof content === 'string' ? content : fragment!.code) + suffix,
        mapping: fragment ? mappingPolicy(fragment.mapping) : undefined,
        names: fragment?.names ? [...fragment.names] : undefined,
        owner: this.runtime.owner,
        order: this.runtime.nextOrder(),
        [EDIT_OWNER]: this.runtime.ownerIdentity,
      });
      return;
    }
    if (
      isFragmentList(content) ||
      (typeof content !== 'string' && 'kind' in content && content.kind === 'composite')
    ) {
      const parts: Code[] = [];
      if (prefix) parts.push(prefix);
      if (isFragmentList(content)) {
        content.forEach((part, index) => {
          if (index > 0) parts.push('\n');
          parts.push(part);
        });
      } else {
        parts.push(...content.parts);
      }
      if (suffix) parts.push(suffix);
      if (kind === 'PrependLeft' || kind === 'PrependRight' || kind === 'Prefix') parts.reverse();
      for (const part of parts) this.#insert(kind, offset, part);
      return;
    }
    this.runtime.edits.push({
      kind,
      start: offset,
      end: offset,
      ...realizeContent(this.runtime.session, content, this.#degraded, prefix, suffix),
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
      [EDIT_OWNER]: this.runtime.ownerIdentity,
    });
  }
  #degraded = (_message: string, _target: SourceFragment): void => {
    this.runtime.provenance.degradations++;
  };
  insertBefore(content: Code): void {
    this.#insert('PrependRight', this.event.start, content);
  }
  insertAfter(content: Code): void {
    this.#insert('AppendLeft', this.event.end, content);
  }
  moveTo(destination: number): void {
    if (destination > this.event.start && destination < this.event.end)
      throw new Error('move destination cannot be inside the moved node');
    this.runtime.edits.push({
      kind: 'Move',
      start: this.event.start,
      end: this.event.end,
      destination,
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
      [EDIT_OWNER]: this.runtime.ownerIdentity,
    });
  }
  #bodyOffset(prepend: boolean): number {
    if (this.event.type === 'BlockStatement' || this.event.type === 'FunctionBody')
      return prepend ? this.event.start + 1 : this.event.end - 1;
    const metadata = this.event as NativeEvent & Record<string, unknown>;
    return Number(
      metadata[prepend ? 'bodyStart' : 'bodyEnd'] ?? (prepend ? this.event.start : this.event.end),
    );
  }
  unshiftContainer(key: 'body', code: Code | readonly Code[]): void {
    if (key !== 'body') throw new Error(`Unsupported container: ${key}`);
    this.#insert('AppendRight', this.#bodyOffset(true), code);
  }
  pushContainer(key: 'body', code: Code | readonly Code[]): void {
    if (key !== 'body') throw new Error(`Unsupported container: ${key}`);
    this.#insert('PrependLeft', this.#bodyOffset(false), code);
  }
  addComment(position: 'leading' | 'trailing' | 'inner', content: string, line = false): void {
    // New line terminators can change return/yield/throw and postfix grammar.
    // Inline comments use a single-line block, without requiring hidden ancestry.
    const safeLine =
      line && position === 'leading' && this.runtime.session.startsLine(this.event.start);
    const escaped = content.replace(/\*\//g, '* /').replace(/[\r\n\u2028\u2029]/g, ' ');
    const comment = safeLine ? `//${escaped}\n` : `/*${escaped}*/`;
    if (position === 'leading') this.insertBefore(comment);
    else if (position === 'trailing') this.insertAfter(comment);
    else this.prependToBody(comment);
  }
  buildCodeFrameError(message: string): NativeTransformError {
    return this.#pluginError(message);
  }
  prependToBody(content: Code): void {
    this.unshiftContainer('body', content);
  }
  appendToBody(content: Code): void {
    this.pushContainer('body', content);
  }

  #pluginError(message: string, cause?: unknown): NativeTransformError {
    return new NativeTransformError(
      message,
      [
        {
          code: 'plugin-error',
          message,
          plugin: this.runtime.owner,
          phase: this.runtime.context.phase,
          start: this.event.start,
          end: this.event.end,
        },
      ],
      undefined,
      {
        cause,
        phase: this.runtime.context.phase,
        reason: 'plugin-error',
        loc: this.getLocation().start,
      },
    );
  }
  skip(): void {
    this.runtime.assertControl('skip');
    const event = this.event as TraversalEvent;
    if (event.traversalEnd != null) {
      addSkippedRange(
        this.runtime.state,
        event.id,
        event.traversalStart ?? event.sequence,
        event.traversalEnd,
      );
    } else {
      // Indexed routes, including projected children and ancestors, load their
      // bulk table once on demand, never through per-node native queries.
      const intervals = this.runtime.session.traversalIntervals();
      addSkippedRange(
        this.runtime.state,
        event.id,
        intervals[event.id * 2]!,
        intervals[event.id * 2 + 1]!,
        intervals,
      );
    }
  }
  stop(): void {
    this.runtime.assertControl('stop');
    this.runtime.state.stopped = true;
  }
  traverse<State>(visitors: readonly DefinedVisitor<State>[], state?: State): void {
    this.runtime.assertControl('nested-traverse');
    this.runtime.nested(this.event, visitors, state);
  }
  subscribeWithin(types: string | readonly string[]): void {
    this.runtime.assertControl('dynamic-subscriptions');
    this.runtime.widen(this.event, array(types), false);
  }
  subscribeForScope(types: string | readonly string[]): void {
    this.runtime.assertControl('dynamic-subscriptions');
    this.runtime.widen(this.event, array(types), true);
  }
  unsupported(reason: string): never {
    return this.runtime.context.unsupported(reason);
  }
}

type EditKind = EditCommand['kind'];
function mappingPolicy(value?: CodeFragment['mapping']): EditCommand['mapping'] {
  return (
    {
      sourceless: 'Sourceless',
      'anchor-start': 'AnchorStart',
      'anchor-boundaries': 'AnchorBoundaries',
      identity: 'Identity',
    } as const
  )[value ?? 'sourceless'];
}

type ScopeEdits = {
  exports: Map<number, { positions: Map<string, number>; parts: string[] }>;
  push?: OwnedEdit & { contentParts?: NonNullable<RealizedContent['contentParts']> };
};
// One phase shares an edit list across plugins and route runtimes. Structural
// wrappers and export clauses are keyed by that list so separate plugins cannot
// each emit another wrapper or another `export { ... }` for the same scope.
const scopeEditTransactions = new WeakMap<OwnedEdit[], Map<number, ScopeEdits>>();
function scopeEdits(runtime: PathRuntime, id: number): ScopeEdits {
  let transactions = scopeEditTransactions.get(runtime.edits);
  if (!transactions) scopeEditTransactions.set(runtime.edits, (transactions = new Map()));
  let edits = transactions.get(id);
  if (!edits) transactions.set(id, (edits = { exports: new Map() }));
  return edits;
}
function insertionTarget(
  session: NativeTransformSession,
  scopeId: number,
): {
  id: number;
  metadata: NonNullable<ReturnType<NativeTransformSession['scopeMetadata']>>;
} | null {
  let id = scopeId;
  let metadata = session.scopeMetadata(id);
  // Modes 4 and 5 store the host scope id in the start word.
  if (metadata && (metadata.kind === 4 || metadata.kind === 5)) {
    id = metadata.start;
    metadata = session.scopeMetadata(id);
  }
  if (!metadata || metadata.kind === 3 || metadata.kind === 4 || metadata.kind === 5) return null;
  return { id, metadata };
}

function makeScope(runtime: PathRuntime, id: number, parentId: number | null): NativeScope {
  const cached = runtime.scopeCache.get(id);
  if (cached) return cached;
  const session = runtime.session;
  const resolve = (name: string): QueryResult['bindings'][number] | undefined => {
    return session.resolveBinding(name, id);
  };

  let parentScope: NativeScope | undefined;
  let ownerPath: NativeNodePath | null | undefined;
  const scope: NativeScope = {
    id,
    parentId,
    get parent() {
      return parentId == null
        ? null
        : (parentScope ??= makeScope(runtime, parentId, session.scopeParentId(parentId)));
    },
    get path() {
      return ownerPath === undefined ? (ownerPath = scopeOwnerPath(runtime, id)) : ownerPath;
    },
    hasBinding: name => session.resolveBindingScope(name, id) != null,
    hasGlobal: name => session.globalReferences(name).length > 0,
    getBinding(name) {
      const binding = resolve(name);
      if (binding) return makeBinding(runtime, binding);
      const references = session.globalBindingReferences(name);
      if (references.length > 0)
        return { name, global: true, declaration: null, references, path: null, scope: null };
      return null;
    },
    getBindings(names) {
      const bindings = session.resolveBindings(names, id);
      return bindings.map(binding => makeBinding(runtime, binding));
    },
    getProgramParent() {
      let current: NativeScope = this;
      while (current.parent) current = current.parent;
      return current;
    },
    push(content) {
      const owner = this.path;
      if (!owner) throw new Error(`Cannot find owner path for scope ${id}`);
      const target = insertionTarget(session, id);
      if (!target) throw new Error(`Scope ${id} has no statement insertion body`);
      const { metadata } = target;
      const wrapping = metadata.kind === 1 || metadata.kind === 2;
      const edits = scopeEdits(runtime, target.id);
      const suffix = metadata.kind === 1 ? '\n;\nreturn (' : '\n;\n';
      if (!edits.push) {
        edits.push = {
          kind: 'AppendLeft',
          start: metadata.start,
          end: metadata.start,
          ...realizeContent(session, content, undefined, wrapping ? '{\n' : '\n;\n', suffix),
          owner: runtime.owner,
          order: runtime.nextOrder(),
          [EDIT_OWNER]: runtime.ownerIdentity,
        };
        runtime.edits.push(edits.push);
        if (wrapping)
          runtime.edits.push({
            kind: 'AppendLeft',
            start: metadata.end,
            end: metadata.end,
            content: metadata.kind === 1 ? ');}' : '}',
            owner: runtime.owner,
            order: runtime.nextOrder(),
            [EDIT_OWNER]: runtime.ownerIdentity,
          });
        return;
      }
      // Keep a single push in its compact form. On repetition, append to parts
      // without realizing or copying contributions already queued by this phase.
      let parts = edits.push.contentParts;
      if (parts == null) {
        parts = [edits.push.content!.slice(0, -suffix.length)];
        edits.push.content = undefined;
        edits.push.contentParts = parts;
      } else {
        const tail = parts.pop() as string;
        const preceding = tail.slice(0, -suffix.length);
        if (preceding) parts.push(preceding);
      }
      parts.push('\n\n;\n\n');
      const realized = realizeContent(session, content);
      if (realized.content != null) parts.push(realized.content);
      else for (const part of realized.contentParts) parts.push(part);
      parts.push(suffix);
    },
    generateUid: name => session.generateUid(name),
    rename(name, replacement = session.generateUid(name)) {
      const bindingScopeId = session.resolveBindingScope(name, id);
      if (bindingScopeId == null) throw new Error(`Cannot rename unbound identifier ${name}`);
      native.validateIdentifier(replacement);
      const plan = session.bindingRenamePlan(name, bindingScopeId);
      for (const target of plan.targets) {
        const content =
          target.kind === 1
            ? `${name}: ${replacement}`
            : target.kind === 2
              ? `${name} as ${replacement}`
              : target.kind === 3
                ? `${replacement} as ${name}`
                : replacement;
        runtime.edits.push({
          kind: 'Replace',
          start: target.start,
          end: target.end,
          content,
          mapping: 'AnchorBoundaries',
          names: [name],
          owner: runtime.owner,
          order: runtime.nextOrder(),
          [EDIT_OWNER]: runtime.ownerIdentity,
        });
      }
      const exportEdits = scopeEdits(runtime, bindingScopeId).exports;
      for (const declaration of plan.exports) {
        let entry = exportEdits.get(declaration.start);
        if (!entry) {
          const parts = ['\nexport { '];
          const positions = new Map<string, number>();
          for (const external of session.bindingRenameExportNames(declaration.start)) {
            if (positions.size > 0) parts.push(', ');
            positions.set(external, parts.length);
            parts.push(external);
          }
          parts.push(' };');
          const edit: OwnedEdit = {
            kind: 'AppendLeft',
            start: declaration.end,
            end: declaration.end,
            contentParts: parts,
            owner: runtime.owner,
            order: runtime.nextOrder(),
            [EDIT_OWNER]: runtime.ownerIdentity,
          };
          entry = { positions, parts };
          exportEdits.set(declaration.start, entry);
          runtime.edits.push(
            {
              kind: 'Replace',
              start: declaration.start,
              end: declaration.start + 6,
              content: '',
              owner: runtime.owner,
              order: runtime.nextOrder(),
              [EDIT_OWNER]: runtime.ownerIdentity,
            },
            edit,
          );
        }
        entry.parts[entry.positions.get(name)!] =
          name === replacement ? name : `${replacement} as ${name}`;
      }
      return replacement;
    },
  };
  runtime.scopeCache.set(id, scope);
  return scope;
}

function scopeOwnerPath(runtime: PathRuntime, scopeId: number): NativeNodePath | null {
  const owner = runtime.session.scopeMetadata(scopeId);
  return owner ? pathForId(runtime, owner.ownerId) : null;
}

function makeBinding(
  runtime: PathRuntime,
  binding: QueryResult['bindings'][number],
): NativeBinding {
  let path: NativeNodePath | null | undefined;
  let scope: NativeScope | null | undefined;
  return {
    ...binding,
    global: false,
    get path() {
      return path === undefined ? (path = bindingOwnerPath(runtime, binding.declaration)) : path;
    },
    get scope() {
      if (scope !== undefined) return scope;
      return (scope = makeScope(
        runtime,
        binding.scopeId,
        runtime.session.scopeParentId(binding.scopeId),
      ));
    },
  };
}

function bindingOwnerPath(
  runtime: PathRuntime,
  declaration: NodeSummary | null,
): NativeNodePath | null {
  let parentId = declaration?.parentId;
  let fallback: NativeNodePath | null =
    declaration == null ? null : pathForId(runtime, declaration.id);
  while (parentId != null) {
    const event = runtime.session.event(parentId);
    if (!event) break;
    const path = makePath(runtime, event);
    fallback = path;
    if (isBindingOwnerType(event.type)) return path;
    parentId = event.parentId;
  }
  return fallback;
}
function pathForId(runtime: PathRuntime, nodeId: number): NativeNodePath | null {
  const event = runtime.session.event(nodeId);
  return event ? makePath(runtime, event) : null;
}
function isBindingOwnerType(type: string): boolean {
  return (
    type === 'VariableDeclarator' ||
    type === 'Function' ||
    type === 'Class' ||
    type === 'ImportSpecifier' ||
    type === 'ImportDefaultSpecifier' ||
    type === 'ImportNamespaceSpecifier' ||
    type === 'FormalParameter' ||
    type === 'FormalParameterRest' ||
    type === 'CatchParameter'
  );
}

function joinFragments(values: readonly (string | CodeFragment)[]): CodeFragment {
  return {
    code: values.map(value => (typeof value === 'string' ? value : value.code)).join('\n'),
    mapping:
      typeof values[0] === 'string' ? 'anchor-boundaries' : (values[0]?.mapping ?? 'sourceless'),
    names: values.flatMap(value => (typeof value === 'string' ? [] : [...(value.names ?? [])])),
  };
}
