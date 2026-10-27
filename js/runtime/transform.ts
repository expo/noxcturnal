import { nativeManifest, shareManifest } from '../native/manifest';
import { resolve } from 'node:path';
import { classifyForTransform, parserFilename, sourceHints } from '../adapters/classification';
import { selectParserAdapter } from '../adapters/registry';
import { compilePhasePlan } from '../pipeline/compile';
import { closeDefinitionScope } from '../pipeline/define';
import type { CompiledRouteTemplate, PreparedPhase } from '../pipeline/types';
import {
  accumulateRetention,
  compileNestedVisitor,
  createRetentionFacts,
  nestedManifest,
  prepareApplicablePhase,
} from '../pipeline/routes';
import { Bailout, createDispatcher } from './dispatch';
import { SourceVersionStore } from './source-versions';
import { ArtifactDemand, hasSemanticDemand } from '../pipeline/artifacts';
import type { IntentRegistration } from './fragments';
import {
  native,
  nativePreflightOptions,
  type NativePreflightResultOutput,
  type NativeParsedSourceBinding,
} from '../native/binding';
import { decodeRoutedEnvelope, type RoutedEventBatch } from '../protocol/events';
import { MAX_COMPILED_ROUTES, packRouteManifest } from '../protocol/manifest';
import type {
  Diagnostic,
  EditCommand,
  FunctionMap,
  NativeBailoutResult,
  NativeTransformResult,
  NativeVlqMap,
  TransformOptions,
  TransformResult,
} from '../types';
import {
  NativePipeline,
  NativePlugin,
  TransformDecision,
  NativeTransformError,
} from '../contracts/visitor';
import { NativeTransformSession } from './session';
import { commitWithDedupe } from './editor';
import { TransformSyntaxError } from '../errors';

const NATIVE_PARSE_FAILURE_PREFIX = '__NOXCTURNAL_PARSE_FAILURE__:';

interface NativeParseFailurePayload {
  source?: string;
  message: string;
  line: number;
  column: number;
  operation: 'indexed-session' | 'routed-materialization' | 'function-map' | 'native-phase';
}

function nativeParseFailure(error: unknown): NativeParseFailurePayload | null {
  // N-API errors can originate in a different realm from this runtime.
  if (typeof error !== 'object' || error === null || !('message' in error)) return null;
  const { message } = error;
  if (typeof message !== 'string' || !message.startsWith(NATIVE_PARSE_FAILURE_PREFIX)) return null;
  try {
    const payload = JSON.parse(message.slice(NATIVE_PARSE_FAILURE_PREFIX.length));
    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof payload.message !== 'string' ||
      !Number.isInteger(payload.line) ||
      payload.line < 1 ||
      !Number.isInteger(payload.column) ||
      payload.column < 0 ||
      (payload.source !== undefined && typeof payload.source !== 'string') ||
      !['indexed-session', 'routed-materialization', 'function-map', 'native-phase'].includes(
        payload.operation,
      )
    )
      return null;
    return payload;
  } catch {
    return null;
  }
}

function syntaxError(
  payload: NativeParseFailurePayload,
  filename: string,
  source: string,
): TransformSyntaxError {
  const { codeFrameColumns } = require('@babel/code-frame') as typeof import('@babel/code-frame');
  const loc = { line: payload.line, column: payload.column };
  const frame = codeFrameColumns(
    source,
    { start: { line: loc.line, column: loc.column + 1 } },
    { highlightCode: true },
  );
  return new TransformSyntaxError(
    `${filename}: ${payload.message} (${loc.line}:${loc.column + 1})`,
    filename,
    loc,
    frame,
  );
}

/** Convert one internal native phase result into its public runtime disposition. */
export function assertNativePhaseCompleted(
  result: NativePreflightResultOutput,
  phase: string,
  diagnostics: Diagnostic[],
): void {
  for (const message of result.diagnostics)
    diagnostics.push({
      code:
        result.status === 'complete'
          ? 'native-transform'
          : result.status === 'unsupported'
            ? 'unsupported'
            : 'native-transform-error',
      message,
      phase,
    });
  switch (result.status) {
    case 'complete':
      return;
    case 'unsupported':
      throw new Bailout(`${phase}:${result.reason ?? 'unsupported'}`);
    case 'error': {
      const reason = result.reason ?? 'native-phase-error';
      throw new NativeTransformError(
        `Native phase ${phase} failed: ${reason}`,
        diagnostics,
        [phase],
        { phase, reason, loc: result.errorLocation },
      );
    }
  }
}

interface RetainedPlan {
  futureSubscriptions: ReadonlySet<string>;
  retentionManifest: Buffer;
}

interface RetainedChainNode {
  children: WeakMap<PreparedPhase, RetainedChainNode>;
  plan?: RetainedPlan;
}

type NativePhaseBatchEntry = {
  phase: NativePipeline['phases'][number];
  index: number;
};

/** Select one maximal run of native phases without deciding how it executes. */
function nativePhaseBatch(
  pipeline: NativePipeline,
  start: number,
): readonly NativePhaseBatchEntry[] {
  const batch: NativePhaseBatchEntry[] = [];
  for (
    let index = start;
    index < pipeline.phases.length && pipeline.phases[index].native != null;
    index++
  ) {
    batch.push({ phase: pipeline.phases[index], index });
  }
  return batch;
}

const SEMANTIC_ROUTE_FIELDS = new Set([
  'global',
  'read',
  'write',
  'bindingScopeId',
  'calleeGlobal',
  'rootGlobal',
]);

function routeFieldNeedsSemantics(nodeType: string, field: string): boolean {
  return SEMANTIC_ROUTE_FIELDS.has(field) && (field !== 'write' || nodeType === 'Identifier');
}

function phaseArtifactDemand(base: ArtifactDemand, prepared: PreparedPhase): ArtifactDemand {
  let demand = base;
  if (prepared.includeParent) demand |= ArtifactDemand.StructuralParents;
  if (prepared.structuralParentTypes.length > 0) demand |= ArtifactDemand.StructuralChildren;
  if (prepared.includeScope) demand |= ArtifactDemand.LexicalScopes;
  if (prepared.retentionCapabilities & (1 << 1)) demand |= ArtifactDemand.DirectScalarFields;
  if (prepared.retentionCapabilities & (1 << 5)) demand |= ArtifactDemand.ModuleFacts;
  if (
    prepared.retentionCapabilities & ((1 << 0) | (1 << 2)) ||
    prepared.compiledRoutes.some(
      route =>
        route.payloadFields.some(field => routeFieldNeedsSemantics(route.nodeType, field)) ||
        Object.keys(route.predicates).some(field =>
          routeFieldNeedsSemantics(route.nodeType, field),
        ),
    )
  )
    demand |= ArtifactDemand.BindingsReferences;
  return demand;
}

const retainedChainRoot: RetainedChainNode = { children: new WeakMap() };

/** Walk (and extend) the interned chain of prepared phase shapes. */
function retainedChains(
  shape: PreparedPhase,
  parent: RetainedChainNode = retainedChainRoot,
): RetainedChainNode {
  let node = parent.children.get(shape);
  if (node == null) {
    node = { children: new WeakMap() };
    parent.children.set(shape, node);
  }
  return node;
}

function buildRetainedPlan(
  prepared: PreparedPhase,
  lookahead: readonly PreparedPhase[],
): RetainedPlan {
  const futureSubscriptions = new Set<string>();
  const facts = createRetentionFacts();
  const retainedRoutes: CompiledRouteTemplate[] = [...prepared.compiledRoutes];
  let futureRetentionCapabilities = 0;
  let retainScope = prepared.includeScope;
  accumulateRetention(facts, prepared.activePlugins, prepared.plans);
  for (const future of lookahead) {
    for (const subscription of future.subscriptions) futureSubscriptions.add(subscription);
    retainedRoutes.push(...future.compiledRoutes);
    futureRetentionCapabilities |= future.retentionCapabilities;
    retainScope ||= future.includeScope;
    accumulateRetention(facts, future.activePlugins, future.plans);
  }
  return {
    futureSubscriptions,
    retentionManifest: shareManifest(
      packRouteManifest(
        retainedRoutes.map((route, id) => ({ ...route, id })),
        prepared.includeParent,
        retainScope,
        prepared.retentionCapabilities | futureRetentionCapabilities,
        facts.childRoles,
        facts.fields,
        facts.ancestorFields,
        [...facts.ancestorTypes],
        [...facts.ancestorChildParentTypes],
        facts.ancestryDepth,
      ),
    ),
  };
}

interface PreparedState {
  plugin: NativePlugin<any, any>;
  state: any;
  cleaned?: boolean;
}

/** Complete every prepared cleanup, even when JavaScript throws a nullish value. */
function cleanupStates(
  states: readonly PreparedState[],
  reason: 'complete' | 'bailout' | 'error',
): void {
  let failed = false;
  let firstError: unknown;
  for (const entry of states) {
    if (entry.cleaned) continue;
    entry.cleaned = true;
    try {
      entry.plugin.cleanup?.(reason, entry.state);
    } catch (error) {
      if (!failed) firstError = error;
      failed = true;
    }
  }
  if (failed) throw firstError;
}

function transformFailure(error: unknown, diagnostics: Diagnostic[]): NativeTransformError {
  if (error instanceof NativeTransformError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const owners =
    typeof error === 'object' && error != null && 'owners' in error
      ? (error as { owners?: readonly string[] }).owners
      : undefined;
  return new NativeTransformError(
    message,
    [...diagnostics, { code: 'native-transform-error', message }],
    owners,
    { cause: error },
  );
}

/** Execute a native pipeline synchronously. */
export function transform(
  source: string,
  filename: string,
  pipeline: NativePipeline,
  options: TransformOptions = {},
): TransformResult {
  // Any pipeline reaching a transform was defined before it, so this is where
  // program configuration stops and per-file discovery begins.
  closeDefinitionScope();
  const phasePlan = compilePhasePlan(pipeline);
  const originalSource = source;
  let parseFilename = parserFilename(filename, options.parser);
  let parser = classifyForTransform(parseFilename, source);
  let flowErasureDiagnostic: Diagnostic | undefined;
  let adapterMap: NativeVlqMap | null = null;
  let adapterMetadata: Record<string, unknown> | undefined;
  // Native erasure runs ahead of the auto-selected adapter. It preserves
  // retained source spans and lowers runtime Flow constructs. Hermes parser
  // gaps need an adapter; JavaScript parseability cannot prove Flow semantics
  // are unchanged. Fatal erasure failures propagate.
  //
  // An adapter the caller names by hand wins outright: naming one is how a
  // caller pins which implementation runs, and silently overriding that would
  // make the option meaningless.
  if (!parser.supported && parser.syntax === 'flow' && options.parserAdapter == null) {
    const erased = native.nativeFlowErase(source, filename);
    if (erased.status === 'erased' && erased.code != null) {
      source = erased.code;
      adapterMap = erased.map ?? null;
      // Flow files routinely contain JSX, and the erased source still carries
      // its `@flow` comment, so the syntax has to be declared rather than
      // re-derived.
      parseFilename = parserFilename(filename, 'jsx');
      parser = classifyForTransform(parseFilename, source, 'jsx');
    } else {
      flowErasureDiagnostic = {
        code: erased.reason ?? erased.status,
        message: erased.detail ?? erased.reason ?? 'Native Flow erasure is unavailable.',
        phase: 'flow-erasure',
      };
    }
  }
  if (!parser.supported) {
    const adapter = selectParserAdapter(options.parserAdapter, parser);
    if (options.parserAdapter != null && adapter == null)
      throw new Error(`Parser adapter is not registered: ${options.parserAdapter}`);
    if (adapter) {
      const adapted = adapter.compile(source, filename, options);
      if (adapted.status === 'unsupported')
        return {
          status: 'bailout',
          reason: adapted.reason,
          source: originalSource,
          diagnostics: flowErasureDiagnostic
            ? [flowErasureDiagnostic, ...(adapted.diagnostics ?? [])]
            : (adapted.diagnostics ?? []),
        };
      source = adapted.code;
      adapterMap = adapted.map;
      adapterMetadata = adapted.metadata;
      parseFilename = parserFilename(filename, adapted.syntax);
      // The adapter's declared output syntax is authoritative even when it
      // intentionally preserves an `@flow` comment in otherwise plain JS.
      parser = classifyForTransform(parseFilename, source, adapted.syntax);
    }
  }
  if (!parser.supported) {
    const prepared: PreparedState[] = [];
    let hints: ReadonlySet<string> | undefined;
    let preparationComplete = false;
    try {
      for (const phase of pipeline.phases)
        for (const plugin of phase.plugins ?? []) {
          const prepareContext = {
            filename,
            options,
            parser,
            sourceHints: (hints ??= sourceHints(source)),
            pluginData: options.pluginData,
          };
          prepared.push({ plugin, state: plugin.createState?.(prepareContext) });
        }
      preparationComplete = true;
      cleanupStates(prepared, 'bailout');
      return {
        status: 'bailout',
        reason: parser.reason,
        source: originalSource,
        diagnostics: flowErasureDiagnostic ? [flowErasureDiagnostic] : [],
      };
    } catch (error) {
      // A preparation failure remains primary; cleanup still visits every peer.
      try {
        cleanupStates(prepared, 'error');
      } catch {}
      throw preparationComplete
        ? transformFailure(error, []).setSourceContext(
            resolve(options.projectRoot ?? process.cwd(), filename),
            originalSource,
          )
        : error;
    }
  }
  if (adapterMap != null && pipeline.phases.some(phase => phase.native?.reactCompiler != null)) {
    return {
      status: 'bailout',
      reason: 'react-compiler-original-source-required',
      source: originalSource,
      diagnostics: [],
    };
  }
  const sourceVersions = new SourceVersionStore(originalSource);
  let currentVersion = sourceVersions.original;
  if (source !== originalSource || adapterMap != null) {
    currentVersion = sourceVersions.commit(currentVersion, {
      codeChanged: source !== originalSource,
      mapChanged: adapterMap != null,
    });
    sourceVersions.cacheRenderedText(currentVersion, source);
  }
  // An all-native pipeline has no visitor phase, so it never needs the source
  // text in JS: the whole run collapses into one `runNativePipeline` crossing,
  // no resident session object required.
  const allNative =
    pipeline.phases.length > 0 && pipeline.phases.every(phase => phase.native != null);
  // Metro consumes function-map positions after source-map symbolication, so
  // they belong to the transform's input source, not to the final generated
  // JavaScript. Babel's function-map plugin likewise collects from the input AST
  // before transformation begins.
  let initialFunctionMap: FunctionMap | null = null;
  // The resident source: native phases and visitor commits mutate it in place
  // and accumulate their map layers natively, so the intermediate phase source
  // and per-phase map layers never cross the boundary — only the final composed
  // map, and the source text a visitor phase asks for, do. A mixed pipeline needs
  // it across its JS phases; an all-native one does not.
  // Visitor-only analysis pipelines never produce a resident layer. Avoid
  // copying their source into a second native session merely to return it
  // unchanged at the end; create the session lazily if a visitor actually edits.
  let pipelineSession =
    !allNative && pipeline.phases.some(phase => phase.native != null)
      ? new native.NativePipelineSession(parseFilename, source)
      : null;
  // Rendered text is an optional artifact of the current source version. Native
  // work leaves it resident; a visitor or final output materializes and caches
  // it on that exact immutable version.
  const currentSource = (): string => {
    const cached = sourceVersions.renderedText(currentVersion);
    if (cached != null) return cached;
    const materialized = pipelineSession!.sourceText();
    sourceVersions.cacheRenderedText(currentVersion, materialized);
    return materialized;
  };
  let inputMap = options.inputSourceMap ?? null;
  if (adapterMap != null) {
    inputMap =
      inputMap == null
        ? adapterMap
        : {
            mappings: native.composeMappings(
              adapterMap.mappings,
              inputMap.mappings,
              adapterMap.names.length,
            ),
            names: [...adapterMap.names, ...inputMap.names],
          };
  }
  let finalMap: NativeTransformResult['map'] | null = null;
  const metadata: Record<string, unknown> = {};
  if (adapterMetadata != null) metadata.sourceAdapter = adapterMetadata;
  const diagnostics: Diagnostic[] = [];
  const intents = new Map<string, IntentRegistration>();
  const provenance = { degradations: 0 };
  const allStates: PreparedState[] = [];
  let openSession: NativeTransformSession | null = null;
  let reusableSession: NativeTransformSession | null = null;
  let retainedThroughPhase = -1;
  const usesSyntax = pipeline.phases.some(phase =>
    phase.plugins?.some(plugin => plugin.contract?.syntax != null),
  );
  let syntaxSource: string | null = null;
  let syntaxFacts: ReadonlySet<string> | null = null;
  let parsedSource: NativeParsedSourceBinding | null = null;
  let reusableRoutedBatch: { manifest: Buffer; batch: RoutedEventBatch } | null = null;
  // Record one native run's per-phase results into diagnostics/metadata and bail
  // on the first phase that did not complete. Shared by the mixed-pipeline loop
  // and the all-native single-call path.
  const applyNativeResults = (
    results: readonly NativePreflightResultOutput[],
    batch: readonly NativePhaseBatchEntry[],
  ): void => {
    for (let resultIndex = 0; resultIndex < results.length; resultIndex++) {
      const result = results[resultIndex];
      const { phase: batchPhase } = batch[resultIndex];
      if (result.functionMap != null) initialFunctionMap ??= result.functionMap;
      if (result.status === 'complete' && result.changed)
        currentVersion = sourceVersions.commit(currentVersion, {
          codeChanged: true,
          mapChanged: true,
        });
      if (result.status === 'complete' && result.helpersUsed.length > 0)
        metadata.nativeHelpers = [
          ...((metadata.nativeHelpers as string[] | undefined) ?? []),
          ...result.helpersUsed,
        ];
      assertNativePhaseCompleted(result, batchPhase.name, diagnostics);
    }
  };
  // The shared success tail: plugin cleanup, final metadata, and the completed
  // result. The current version/final map are already set by the loop or the
  // all-native path.
  const completeResult = (): TransformResult => {
    cleanupStates(allStates, 'complete');
    if (options.functionMap && initialFunctionMap == null)
      throw new Error('Input function map was not collected');
    return {
      status: 'complete',
      code: currentSource(),
      map: finalMap ?? { mappings: '', names: [] },
      functionMap: initialFunctionMap,
      metadata,
      diagnostics,
    };
  };
  try {
    if (pipeline.phases.length === 0) {
      if (options.functionMap) {
        parsedSource = new native.NativeParsedSource(source, parseFilename);
        initialFunctionMap = parsedSource.functionMap();
        parsedSource.validate();
        parsedSource = null;
      } else native.validateProgram(source, parseFilename);
    }
    // All-native fast path: one crossing runs every phase and returns the final
    // products directly. Using NativePipelineSession here would add session
    // construction and a terminal crossing without providing a JS observer.
    if (allNative) {
      const batch = nativePhaseBatch(pipeline, 0);
      const pipelineResult = native.runNativePipeline(
        parseFilename,
        source,
        batch.map(({ phase }, index) => ({
          ...nativePreflightOptions(phase.native!),
          functionMap: options.functionMap && index === 0,
          sourceFilename: filename,
        })),
        inputMap?.mappings,
        inputMap?.names,
      );
      applyNativeResults(pipelineResult.results, batch); // throws on any bail
      sourceVersions.cacheRenderedText(currentVersion, pipelineResult.code!);
      if (pipelineResult.map != null) {
        finalMap = pipelineResult.map;
      } else if (inputMap != null) {
        finalMap = inputMap;
      }
      return completeResult();
    }
    for (let phaseIndex = 0; phaseIndex < pipeline.phases.length; phaseIndex++) {
      const phase = pipeline.phases[phaseIndex];
      const executionPlan = phasePlan[phaseIndex];
      if (phase.native != null) {
        parsedSource?.close();
        parsedSource = null;
        reusableSession?.close();
        reusableSession = null;
        reusableRoutedBatch = null;
        openSession = null;
        // Collect the run of consecutive native phases and execute them in a
        // single crossing: native phases hand the source and their map layers
        // along resident, never bouncing back to JS between themselves. The
        // for-loop's `++` resumes at the first non-native phase after the run.
        const batch = nativePhaseBatch(pipeline, phaseIndex);
        phaseIndex = batch.at(-1)!.index;
        const results = pipelineSession!.runNativePhases(
          batch.map(({ phase: batchPhase }, index) => ({
            ...nativePreflightOptions(batchPhase.native!),
            functionMap: options.functionMap && initialFunctionMap == null && index === 0,
            sourceFilename: filename,
          })),
        );
        // The rendered source stays resident; materialized lazily only if a later
        // visitor phase needs its text, or once at the end.
        applyNativeResults(results, batch);
        continue;
      }
      // A visitor phase reads source text, so materialize the resident source
      // once for this phase; `observationSource` and the edit-boundary checks
      // below then compare against a real, current string.
      const materializedSource = currentSource();
      const observationSource = materializedSource;
      // Skipped phases can carry a session past its bounded retention window.
      // Unchanged text alone does not authorize capabilities beyond that window.
      if (
        reusableSession &&
        (reusableSession.source !== observationSource || phaseIndex > retainedThroughPhase)
      ) {
        reusableSession.close();
        reusableSession = null;
        reusableRoutedBatch = null;
      }
      const edits: EditCommand[] = [];
      if (
        (usesSyntax && syntaxSource !== observationSource) ||
        (options.functionMap && initialFunctionMap == null)
      ) {
        parsedSource?.close();
        parsedSource = new native.NativeParsedSource(observationSource, parseFilename);
        if (options.functionMap && initialFunctionMap == null)
          initialFunctionMap = parsedSource.functionMap();
        if (usesSyntax) syntaxFacts = new Set(parsedSource.syntaxFacts());
        syntaxSource = observationSource;
      }
      const prepared = prepareApplicablePhase(phase, syntaxFacts);
      // A syntax requirement rejects the entire plugin, including lifecycle work.
      // Keep a pending parse for the next active phase, or validate it at the end.
      if (usesSyntax && prepared.activePlugins.length === 0) continue;
      const {
        activePlugins,
        plans,
        subscriptions,
        includeParent,
        includeScope,
        requiresIndexBase,
        runtimeEditEffect,
        compiledRoutes,
        dispatchRoutes,
        manifest,
      } = prepared;
      if (subscriptions.has('*')) {
        if (!options.allowBroadVisitors) throw new Bailout('broad-catch-all-visitor');
        diagnostics.push({
          code: 'broad-visitor',
          message: 'Catch-all visitor disables the optimized subscription path.',
          phase: phase.name,
        });
      }
      // The retained plan — future subscriptions, retention capabilities, and the
      // packed retention manifest — is a function of this phase's plan shape and
      // the shapes of the phases that observe the same source after it. Those
      // shapes are interned, so the whole derivation is cached on their identity
      // chain instead of being repacked for every file.
      const retainedSession = reusableSession;
      let futureSubscriptions: ReadonlySet<string>;
      let retentionManifest: Buffer;
      if (retainedSession == null) {
        const lookahead: PreparedPhase[] = [];
        let chain = retainedChains(prepared);
        let retainedRouteCount = prepared.compiledRoutes.length;
        // Bound speculative retention to eight later visitor phases and the
        // manifest's route budget. A phase may edit; only its actual outcome
        // decides whether this index survives.
        retainedThroughPhase = phaseIndex;
        for (
          let futureIndex = phaseIndex + 1;
          futureIndex < Math.min(pipeline.phases.length, phaseIndex + 9);
          futureIndex++
        ) {
          if (phasePlan[futureIndex].requiresPrintedInput) break;
          const futurePrepared = prepareApplicablePhase(pipeline.phases[futureIndex], syntaxFacts);
          if (retainedRouteCount + futurePrepared.compiledRoutes.length > MAX_COMPILED_ROUTES)
            break;
          retainedRouteCount += futurePrepared.compiledRoutes.length;
          lookahead.push(futurePrepared);
          chain = retainedChains(futurePrepared, chain);
          retainedThroughPhase = futureIndex;
        }
        const retained = (chain.plan ??= buildRetainedPlan(prepared, lookahead));
        ({ futureSubscriptions, retentionManifest } = retained);
      } else {
        // The retained session was opened with the capabilities through retainedThroughPhase.
        // Later phases reuse that native index and do not rebuild progressively
        // shorter suffix plans.
        futureSubscriptions = new Set();
        retentionManifest = manifest;
      }
      const nextPhase = pipeline.phases[phaseIndex + 1];
      const canReuseForNextPhase =
        phaseIndex + 1 === pipeline.phases.length ||
        (phaseIndex + 1 <= retainedThroughPhase &&
          nextPhase?.native == null &&
          !phasePlan[phaseIndex + 1].requiresPrintedInput);
      const artifactDemand = phaseArtifactDemand(executionPlan.artifactDemand, prepared);
      const requiresIndex =
        retainedSession != null ||
        requiresIndexBase ||
        includeParent ||
        includeScope ||
        futureSubscriptions.size > 0 ||
        retainedThroughPhase > phaseIndex ||
        hasSemanticDemand(artifactDemand);
      // Parsed/index artifacts live exactly as long as their retained native
      // session. If orchestration dropped that owner, the generic planner must
      // not report a logical cache hit for the version.
      if (retainedSession == null) sourceVersions.dropParsedArtifacts(currentVersion);
      sourceVersions.ensure(currentVersion, artifactDemand, requiresIndex);
      const session: NativeTransformSession =
        retainedSession ??
        new NativeTransformSession(
          observationSource,
          parseFilename,
          // `parseFilename` is already normalized, including an adapter's
          // authoritative JS/JSX output mode. Do not apply the caller's original
          // parser override a second time inside NativeTransformSession.
          {
            ...options,
            parser: 'auto',
          },
          requiresIndex ? retentionManifest : undefined,
          requiresIndex ? manifest : undefined,
          true,
          parsedSource ?? undefined,
        );
      if (requiresIndex) parsedSource = null;
      reusableSession = null;
      openSession = session;
      let batch: RoutedEventBatch;
      {
        const cachedRouted = reusableRoutedBatch as {
          manifest: Buffer;
          batch: RoutedEventBatch;
        } | null;
        if (cachedRouted?.manifest.equals(manifest)) {
          batch = cachedRouted.batch;
        } else {
          if (requiresIndex) {
            batch = session.nextRoutedPacked(manifest);
          } else {
            const routedBuffer =
              parsedSource != null
                ? parsedSource.materializeRouted(nativeManifest(manifest))
                : native.materializeRoutedBuffer(
                    observationSource,
                    parseFilename,
                    nativeManifest(manifest),
                  );
            parsedSource = null;
            batch = decodeRoutedEnvelope(routedBuffer);
          }
        }
        reusableRoutedBatch = null;
      }
      if (requiresIndex || includeParent || includeScope)
        session.reserveEventCache(batch.nodeCount);
      if (batch.includeParent) session.seedSummaries(batch.parentSummaries);
      const dispatch = createDispatcher(
        session,
        filename,
        phase,
        activePlugins,
        plans,
        batch,
        edits,
        metadata,
        diagnostics,
        requiresIndex || includeParent || includeScope,
        compiledRoutes,
        dispatchRoutes,
        intents,
        provenance,
        { compileNestedVisitor, nestedManifest },
        options.pluginData,
      );
      let phaseSourceHints: ReadonlySet<string> | undefined;
      for (const plugin of activePlugins) {
        const state = plugin.createState?.({
          filename,
          options,
          parser,
          sourceHints: (phaseSourceHints ??= sourceHints(observationSource)),
          pluginData: options.pluginData,
        });
        allStates.push({ plugin, state, cleaned: false });
        dispatch.contexts.get(plugin)!.state = state;
        plugin.pre?.(dispatch.contexts.get(plugin)!.context, state);
      }
      const decisions = new Map<NativePlugin<any, any>, TransformDecision>();
      for (const plugin of activePlugins) {
        const entry = dispatch.contexts.get(plugin)!;
        const decision = plugin.analyze?.(entry.context, entry.state) ?? {
          status: 'supported',
          analysis: undefined,
        };
        decisions.set(plugin, decision);
        if (decision.status === 'unsupported') {
          if (decision.location)
            diagnostics.push({
              code: 'unsupported',
              message: decision.reason,
              plugin: plugin.name,
              phase: phase.name,
              start: session.locationOffset(decision.location.start),
              end: session.locationOffset(decision.location.end),
            });
          throw new Bailout(`${plugin.name}:${decision.reason}`);
        }
        if (decision.status === 'irrelevant') entry.stopped = true;
      }
      // Analysis may reject a plugin using semantic facts. Its visitors no longer
      // need structural hydration; pre/analyze nested traversals hydrate themselves.
      session.prefetchRoutedChildren(
        batch,
        dispatchRoutes.map(route =>
          route.members
            .filter(member => !dispatch.contexts.get(member.plugin)!.stopped)
            .map(member => member.capabilities),
        ),
      );
      for (const plugin of activePlugins) {
        const decision = decisions.get(plugin)!;
        if (decision.status === 'supported') {
          const entry = dispatch.contexts.get(plugin)!;
          plugin.apply?.(entry.context, decision.analysis, entry.state);
        }
      }
      dispatch.run();
      for (const plugin of activePlugins)
        plugin.post?.(dispatch.contexts.get(plugin)!.context, dispatch.contexts.get(plugin)!.state);
      for (const plugin of activePlugins) {
        const pluginEffect = plugin.editEffect;
        if (pluginEffect === 'none' && edits.some(edit => edit.owner === plugin.name))
          throw new Error(`${plugin.name}: plugin declared edit effect none but emitted edits`);
      }
      if (runtimeEditEffect === 'none' && edits.length > 0)
        throw new Error(`${phase.name}: phase declared edit effect none but emitted edits`);
      dispatch.flushInsertions();
      const effectiveEdits: EditCommand[] = edits;
      if (effectiveEdits.length === 0) {
        if (canReuseForNextPhase) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
        } else {
          session.close();
          openSession = null;
        }
        continue;
      }
      // The edits address the resident source directly, so the commit renders
      // in the pipeline session: the new source and the map layer stay resident,
      // and the chain composes once at the end.
      pipelineSession ??= new native.NativePipelineSession(parseFilename, currentSource());
      const residentPipeline = pipelineSession;
      const committed = commitWithDedupe(effectiveEdits, data =>
        residentPipeline.commitDecoded(data, options.sourceMapMode),
      );
      const codeChanged = committed.codeChanged;
      const mapChanged = committed.mapChanged;
      const resultingVersion = sourceVersions.commit(currentVersion, {
        codeChanged,
        mapChanged,
      });
      currentVersion = resultingVersion;
      // The rendered source stays resident; a following native phase reads it
      // without a crossing, and a following visitor phase materializes it lazily.
      if (!codeChanged) {
        if (canReuseForNextPhase) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
          openSession = session;
        } else {
          session.close();
          openSession = null;
        }
        continue;
      }
      session.close();
      reusableRoutedBatch = null;
      openSession = null;
      // Opening the next phase creates the explicit render/reparse boundary.
    }
    parsedSource?.validate();
    parsedSource = null;
    reusableSession?.close();
    openSession = null;
    // The single terminal crossing: the resident source becomes the final code
    // and every retained layer composes into the final map — with the input map
    // folded in natively — in one call.
    if (pipelineSession == null) {
      // No native phase and no visitor edit: nothing crossed into the resident
      // pipeline and no map layer needs composing.
      finalMap = inputMap;
      return completeResult();
    }
    const finished = pipelineSession.finish(inputMap?.mappings, inputMap?.names);
    sourceVersions.cacheRenderedText(currentVersion, finished.code);
    if (finished.map != null) {
      finalMap = finished.map;
    } else if (inputMap != null) {
      // No pipeline layer: the input/adapter map is the whole map.
      finalMap = inputMap;
    }
    return completeResult();
  } catch (error) {
    parsedSource?.close();
    openSession?.close();
    let parseFailure = nativeParseFailure(error);
    let bailout = error instanceof Bailout;
    try {
      cleanupStates(allStates, bailout ? 'bailout' : 'error');
    } catch (cleanupError) {
      // Fatal work remains primary. Failed cleanup turns a compatibility bailout
      // into a fatal result, rather than hiding a resource-release failure.
      if (bailout) {
        error = cleanupError;
        bailout = false;
        parseFailure = nativeParseFailure(error);
      }
    }
    if (bailout) {
      return {
        status: 'bailout',
        reason: (error as Bailout).message,
        source: originalSource,
        diagnostics,
      } satisfies NativeBailoutResult;
    }
    if (parseFailure != null)
      throw syntaxError(
        parseFailure,
        resolve(options.projectRoot ?? process.cwd(), filename),
        parseFailure.source ?? currentSource(),
      );
    const failure = transformFailure(error, diagnostics);
    if (failure.filename != null) throw failure;
    if (failure.reason === 'plugin-error' && failure.loc != null && pipelineSession != null)
      failure.loc =
        pipelineSession.originalPosition(failure.loc.line, failure.loc.column) ?? undefined;
    if (failure.loc != null && adapterMap != null)
      failure.loc =
        native.originalSourcePosition(adapterMap.mappings, failure.loc.line, failure.loc.column) ??
        undefined;
    throw failure.setSourceContext(
      resolve(options.projectRoot ?? process.cwd(), filename),
      originalSource,
    );
  }
}
