import { FIELD_KEY_IDS } from '../generated/event-schema.js';
import { alias, array } from '../pipeline/route-utils.js';
import {
  isProvenanceCode,
  makeSourceFragment,
  realizeContent,
  sourceFragmentBelongsTo,
} from './fragments.js';
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
} from '../types.js';
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
} from '../contracts/visitor.js';
import type { NativeTransformSession } from './session.js';
import type { RouteCapabilities } from '../pipeline/types.js';

export type { RouteCapabilities } from '../pipeline/types.js';

export function childRoleIsDeclared(roles: readonly string[], requestedRole: string): boolean {
  for (const role of roles) {
    if (role === requestedRole || role === '*') return true;
  }
  return false;
}

export function eventIsSkipped(
  event: NativeEvent,
  ranges: readonly { start: number; end: number }[] | undefined,
): boolean {
  if (!ranges) return false;
  for (const range of ranges) {
    if (event.start > range.start && event.end <= range.end) return true;
  }
  return false;
}

export type PathState = { stopped: boolean; skipped?: { start: number; end: number }[] };
export type PathRuntime = {
  session: NativeTransformSession;
  context: PluginContext;
  edits: EditCommand[];
  owner: string;
  nextOrder: () => number;
  state: PathState;
  nested: (target: NativeEvent, visitor: readonly DefinedVisitor<any>[], value: any) => void;
  widen: (target: NativeEvent, types: string[], scopeOnly: boolean) => void;
  parent: (target: NativeEvent, id: number, ancestryDepth: number) => NativeNodePath | null;
  children: (target: NativeEvent, ancestryDepth: number) => NativeNodePath[];
  allowsChild: (type: string, role: string) => boolean;
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
): NativeNodePath {
  return new NodePathImpl(runtime, event, ancestryDepth);
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
    return (this.lazyScope ??= makeScope(
      this.runtime,
      this.event.scopeId,
      this.event.scopeParentId ?? null,
    ));
  }
  getSource(): SourceFragment {
    return makeSourceFragment(this.runtime.session, this.event.start, this.event.end);
  }
  sourceText(): string {
    return this.runtime.session.source.slice(this.event.start, this.event.end);
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
    return selectChildRole(this, key, this.childrenUnchecked());
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
    const memberPath = this.node.memberPath;
    return (
      typeof memberPath === 'string' &&
      (memberPath === pattern || (allowPartial && memberPath.startsWith(`${pattern}.`)))
    );
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
    const flush = (gapEnd: number) => {
      if (glue.length > 0 || gapEnd > cursor) {
        const shared = {
          kind: 'Replace' as const,
          start: cursor,
          end: gapEnd,
          mapping: glue.length === 0 ? ('Sourceless' as const) : glueMapping,
          names: glueNames.length > 0 ? glueNames : undefined,
          owner: this.runtime.owner,
          order: this.runtime.nextOrder(),
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
    this.#edit('Replace', joinFragments(code as readonly (string | CodeFragment)[]));
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
    this.runtime.edits.push({
      kind,
      start: offset,
      end: offset,
      ...realizeContent(this.runtime.session, content, this.#degraded, prefix, suffix),
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
    });
  }
  #degraded = (message: string, target: SourceFragment): void => {
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
    });
  }
  unshiftContainer(key: 'body', code: Code | readonly Code[]): void {
    if (key !== 'body') throw new Error(`Unsupported container: ${key}`);
    this.#insert(
      'AppendRight',
      Number((this.event as NativeEvent & Record<string, unknown>).bodyStart ?? this.event.start),
      code,
    );
  }
  pushContainer(key: 'body', code: Code | readonly Code[]): void {
    if (key !== 'body') throw new Error(`Unsupported container: ${key}`);
    this.#insert(
      'PrependLeft',
      Number((this.event as NativeEvent & Record<string, unknown>).bodyEnd ?? this.event.end),
      code,
    );
  }
  addComment(position: 'leading' | 'trailing' | 'inner', content: string, line = false): void {
    const comment = line ? `//${content}\n` : `/*${content}*/`;
    if (position === 'leading') this.insertBefore(comment);
    else if (position === 'trailing') this.insertAfter(comment);
    else this.prependToBody(comment);
  }
  buildCodeFrameError(message: string): NativeTransformError {
    return new NativeTransformError(message, [
      { code: 'plugin-error', message, start: this.event.start, end: this.event.end },
    ]);
  }
  prependToBody(content: Code): void {
    this.#insert(
      'AppendRight',
      Number((this.event as NativeEvent & Record<string, unknown>).bodyStart ?? this.event.start),
      content,
    );
  }
  appendToBody(content: Code): void {
    this.#insert(
      'PrependLeft',
      Number((this.event as NativeEvent & Record<string, unknown>).bodyEnd ?? this.event.end),
      content,
    );
  }
  skip(): void {
    this.runtime.assertControl('skip');
    (this.runtime.state.skipped ??= []).push({ start: this.event.start, end: this.event.end });
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
function isMemberExpressionType(type: string): boolean {
  return alias('MemberExpression', type);
}
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
      const references = session.globalReferences(name);
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
      const directives = session
        .nodes(['Directive'])
        .filter(
          event =>
            event.scopeId === id && event.start >= owner.node.start && event.end <= owner.node.end,
        );
      const offset = directives.reduce(
        (end, directive) => Math.max(end, directive.end),
        Number(
          (owner instanceof NodePathImpl
            ? (owner.event as NativeEvent & Record<string, unknown>).bodyStart
            : undefined) ?? owner.start,
        ),
      );
      runtime.edits.push({
        kind: 'AppendLeft',
        start: offset,
        end: offset,
        ...realizeContent(
          runtime.session,
          content,
          undefined,
          directives.length === 0 ? '' : '\n',
          '\n',
        ),
        owner: runtime.owner,
        order: runtime.nextOrder(),
      });
    },
    generateUid: name => session.generateUid(name),
    rename(name, replacement = session.generateUid(name)) {
      const binding = resolve(name);
      if (!binding) throw new Error(`Cannot rename unbound identifier ${name}`);
      if (!/^[$A-Z_a-z][$\w]*$/.test(replacement))
        throw new Error(`Invalid identifier: ${replacement}`);
      const nodes = [binding.declaration, ...binding.references].filter(
        (node): node is NodeSummary | NodeView => node != null,
      );
      const shorthandParentIds = [
        ...new Set(
          nodes.flatMap(node => {
            const view = node as NodeView;
            return view.parentId != null && isShorthandPropertyType(view.parentType)
              ? [view.parentId]
              : [];
          }),
        ),
      ];
      const parentStarts = new Map(
        session
          .inspect(shorthandParentIds.map(nodeId => ({ nodeId, fields: [] })))
          .map(parent => [parent.id, parent.start]),
      );
      for (const node of nodes) {
        const view = node as NodeView;
        const preservesShorthandKey =
          view.parentId != null && parentStarts.get(view.parentId) === view.start;
        runtime.edits.push({
          kind: 'Replace',
          start: node.start!,
          end: node.end!,
          content: preservesShorthandKey ? `${name}: ${replacement}` : replacement,
          mapping: 'AnchorBoundaries',
          names: [name],
          owner: runtime.owner,
          order: runtime.nextOrder(),
        });
      }
      return replacement;
    },
  };
  runtime.scopeCache.set(id, scope);
  return scope;
}

function scopeOwnerPath(runtime: PathRuntime, scopeId: number): NativeNodePath | null {
  const owner = runtime.session
    .nodes(['Program', 'Function', 'ArrowFunctionExpression'])
    .find(
      event =>
        event.scopeId === scopeId &&
        (event.type === 'Program' ||
          event.type === 'Function' ||
          event.type === 'ArrowFunctionExpression'),
    );
  return owner ? pathForId(runtime, owner.id) : null;
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
      const event =
        binding.declaration == null ? undefined : runtime.session.event(binding.declaration.id);
      return (scope = makeScope(runtime, binding.scopeId, event?.scopeParentId ?? null));
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
    mapping: values.some(value => typeof value !== 'string' && value.mapping === 'identity')
      ? 'identity'
      : 'anchor-boundaries',
    names: values.flatMap(value => (typeof value === 'string' ? [] : [...(value.names ?? [])])),
  };
}

const LIST_CHILD_ROLES = new Set([
  'arguments',
  'body',
  'declarations',
  'decorators',
  'directives',
  'elements',
  'params',
  'properties',
  'specifiers',
]);
function selectChildRole(
  path: NodePathImpl,
  key: string,
  children: readonly NativeNodePath[],
): NativeNodePath | readonly NativeNodePath[] | null {
  const type = path.node.type;
  const at = (index: number) => children[index] ?? null;
  const last = () => children.at(-1) ?? null;
  if (key === 'body') {
    if (
      type === 'Program' ||
      type === 'BlockStatement' ||
      type === 'FunctionBody' ||
      type === 'ClassBody' ||
      type === 'TSModuleBlock'
    )
      return children;
    if (type === 'DoWhileStatement') return at(0);
    return last();
  }
  if (key === 'arguments' && (type === 'CallExpression' || type === 'NewExpression'))
    return children.slice(1);
  if (key === 'callee' && (type === 'CallExpression' || type === 'NewExpression')) return at(0);
  if (key === 'declarations' && type === 'VariableDeclaration')
    return children.filter(child => child.node.type === 'VariableDeclarator');
  if (key === 'specifiers' && (type === 'ImportDeclaration' || type === 'ExportNamedDeclaration'))
    return children.filter(child => child.node.type.endsWith('Specifier'));
  if (key === 'directives' && (type === 'Program' || type === 'FunctionBody'))
    return children.filter(child => child.node.type === 'Directive');
  if (
    key === 'decorators' &&
    (type === 'Class' ||
      type === 'MethodDefinition' ||
      type === 'PropertyDefinition' ||
      type === 'FormalParameter')
  )
    return children.filter(child => child.node.type === 'Decorator');
  if (
    key === 'properties' &&
    (type === 'ObjectExpression' || type === 'ObjectPattern' || type === 'ObjectAssignmentTarget')
  )
    return children;
  if (
    key === 'elements' &&
    (type === 'ArrayExpression' || type === 'ArrayPattern' || type === 'ArrayAssignmentTarget')
  )
    return children;
  if (key === 'params' && alias('Function', type)) {
    const parameters = children.find(child => child.node.type === 'FormalParameters');
    return parameters instanceof NodePathImpl ? parameters.childrenUnchecked() : [];
  }
  if (
    key === 'id' &&
    (type === 'VariableDeclarator' ||
      type === 'Function' ||
      type === 'Class' ||
      type === 'TSEnumDeclaration' ||
      type === 'TSInterfaceDeclaration' ||
      type === 'TSTypeAliasDeclaration')
  )
    return at(0);
  if (key === 'init' && type === 'VariableDeclarator') return children.length > 1 ? last() : null;
  if (key === 'expression' && type === 'ExpressionStatement') return at(0);
  if (
    (key === 'key' || key === 'value') &&
    (type === 'ObjectProperty' ||
      type === 'BindingProperty' ||
      type === 'AssignmentTargetPropertyProperty')
  )
    return key === 'key' ? at(0) : last();
  if ((key === 'object' || key === 'property') && isMemberExpressionType(type))
    return key === 'object' ? at(0) : last();
  if (
    (key === 'left' || key === 'right') &&
    (type === 'BinaryExpression' ||
      type === 'LogicalExpression' ||
      type === 'AssignmentExpression' ||
      type === 'PrivateInExpression')
  )
    return key === 'left' ? at(0) : last();
  if (
    key === 'argument' &&
    (type === 'UnaryExpression' ||
      type === 'UpdateExpression' ||
      type === 'AwaitExpression' ||
      type === 'YieldExpression' ||
      type === 'ReturnStatement' ||
      type === 'ThrowStatement' ||
      type === 'SpreadElement')
  )
    return at(0);
  if (
    key === 'test' &&
    (type === 'IfStatement' ||
      type === 'ConditionalExpression' ||
      type === 'WhileStatement' ||
      type === 'DoWhileStatement' ||
      type === 'ForStatement' ||
      type === 'SwitchStatement')
  )
    return type === 'DoWhileStatement' ? last() : at(0);
  if (key === 'consequent' && (type === 'IfStatement' || type === 'ConditionalExpression'))
    return at(1);
  if (key === 'alternate' && (type === 'IfStatement' || type === 'ConditionalExpression'))
    return at(2);
  if (key === 'block' && type === 'TryStatement')
    return children.find(child => child.node.type === 'BlockStatement') ?? null;
  if (key === 'handler' && type === 'TryStatement')
    return children.find(child => child.node.type === 'CatchClause') ?? null;
  if (key === 'finalizer' && type === 'TryStatement') {
    const blocks = children.filter(child => child.node.type === 'BlockStatement');
    return blocks.length > 1 ? blocks[1] : null;
  }
  if (key === 'superClass' && type === 'Class') {
    const candidates = children.filter(
      child =>
        child.node.type !== 'Decorator' &&
        child.node.type !== 'ClassBody' &&
        !child.node.type.startsWith('TS'),
    );
    return typeof path.node.name === 'string' ? (candidates[1] ?? null) : (candidates[0] ?? null);
  }
  if (
    (key === 'key' || key === 'value') &&
    (type === 'MethodDefinition' || type === 'PropertyDefinition' || type === 'AccessorProperty')
  )
    return key === 'key'
      ? (children.find(child => child.node.type !== 'Decorator') ?? null)
      : last();
  if (key === 'source' && (type.startsWith('Import') || type.startsWith('Export')))
    return children.find(child => child.node.type === 'StringLiteral') ?? null;
  if (
    key === 'declaration' &&
    (type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration')
  )
    return (
      children.find(
        child => !child.node.type.endsWith('Specifier') && child.node.type !== 'StringLiteral',
      ) ?? null
    );
  if (LIST_CHILD_ROLES.has(key)) return [];
  throw new Error(`${type} does not expose child role ${JSON.stringify(key)}`);
}
function isShorthandPropertyType(type: string | undefined): boolean {
  return (
    type === 'ObjectProperty' ||
    type === 'BindingProperty' ||
    type === 'AssignmentTargetPropertyIdentifier'
  );
}
export function locationOffset(source: string, position: SourceLocation['start']): number {
  const lines = source.split('\n');
  let offset = 0;
  for (let line = 1; line < position.line; line++) offset += (lines[line - 1]?.length ?? 0) + 1;
  return offset + position.column;
}
