import type { NativeIndexedSessionBinding } from '../native/binding';
import { coerceFieldValue } from '../protocol/events';
import type { NativeEvent, NodeView, QueryResult } from '../types';

export function toNodeView(event: NativeEvent): NodeView {
  if (event.fields.length === 0) return event as unknown as NodeView;
  const node = event as NativeEvent & Record<string, unknown>;
  for (const field of event.fields) {
    node[field.key] =
      typeof field.value === 'string'
        ? coerceFieldValue(field.key, event.type, field.value)
        : field.value;
  }
  return node as NodeView;
}

export function adaptBindingFact(
  fact: ReturnType<NativeIndexedSessionBinding['queryBindings']>[number],
): QueryResult['bindings'][number] {
  return {
    name: fact.name,
    scopeId: fact.scopeId,
    declaration:
      fact.declarationId == null
        ? null
        : {
            id: fact.declarationId,
            type: 'Identifier',
            start: fact.declarationStart!,
            end: fact.declarationEnd!,
            parentId: fact.declarationParentId,
          },
    references: fact.references.map(reference => ({
      id: reference.id,
      type: 'Identifier',
      start: reference.start,
      end: reference.end,
      scopeId: reference.scopeId,
      parentId: reference.parentId,
      parentType: reference.parentType,
      parentStart: reference.parentStart,
      name: fact.name,
      bindingScopeId: fact.scopeId,
      read: reference.read,
      write: reference.write,
      memberWrite: reference.memberWrite,
    })),
  };
}
