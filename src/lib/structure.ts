// SPEC.md §7 `structure`: representations are keyed by variant value, or by `default` alone
// when every variant shares one representation (complexity's problem choice changes the count,
// not the array).
import type { Representation, StructureSpec } from '@/types/step-engine'

export function representationKey(structure: StructureSpec, variant?: string): string {
  return variant !== undefined && variant in structure.representations ? variant : 'default'
}

export function activeRepresentation(structure: StructureSpec, variant?: string): Representation | undefined {
  return structure.representations[representationKey(structure, variant)]
}
