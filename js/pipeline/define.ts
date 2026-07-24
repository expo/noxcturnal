import type {
  DefinedNativePlugin,
  NativePipeline,
  NativePipelineDefinition,
  NativePluginDefinition,
  PluginContract,
} from '../contracts/visitor.js';

/** Define and freeze a reusable plugin, including its visitor table. */
export function defineNativePlugin<
  State = undefined,
  Options = undefined,
  Analysis = unknown,
  const Contract extends PluginContract = PluginContract,
>(
  plugin: NativePluginDefinition<State, Options, Analysis, Contract>,
): DefinedNativePlugin<State, Options, Analysis, Contract> {
  if ('visitor' in plugin)
    throw new Error(
      `${plugin.name}: the visitor-object form was removed; define typed visitors with defineVisitor and pass them as visitors`,
    );
  const definition = {
    ...plugin,
    visitors: plugin.visitors == null ? undefined : Object.freeze([...plugin.visitors]),
    contract: plugin.contract == null ? undefined : Object.freeze({ ...plugin.contract }),
  } as DefinedNativePlugin<State, Options, Analysis, Contract>;
  Object.defineProperty(definition, 'withOptions', {
    enumerable: false,
    value: (options: Options) => defineNativePlugin({ ...plugin, options }),
  });
  return Object.freeze(definition);
}

export function defineNativePipeline(pipeline: NativePipelineDefinition): NativePipeline {
  return Object.freeze({
    phases: Object.freeze(
      pipeline.phases.map(phase =>
        Object.freeze({ ...phase, plugins: Object.freeze([...phase.plugins]) }),
      ),
    ),
  });
}
