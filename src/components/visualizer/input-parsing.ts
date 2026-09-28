// Parses the OperationBar's text input into the shape each `inputKind` expects (types/step-engine.ts).
import type { ArrayInput, EdgeInput, KeyInput, OperationDefinition, TextInput } from '@/types/step-engine'

export type ParsedInput =
  | { ok: true; value: KeyInput | ArrayInput | EdgeInput | TextInput | undefined }
  | { ok: false; error: string }

const INT = /^-?\d+$/

export function parseInput(kind: OperationDefinition['inputKind'], raw: string): ParsedInput {
  const text = raw.trim()
  switch (kind) {
    case 'none':
      return { ok: true, value: undefined }
    case 'key': {
      if (!INT.test(text)) return { ok: false, error: 'Enter a whole number, e.g. 42.' }
      return { ok: true, value: Number(text) }
    }
    case 'array': {
      if (text === '') return { ok: false, error: 'Enter comma-separated numbers, e.g. 5, 3, 8.' }
      const parts = text.split(/[,\s]+/).filter(Boolean)
      if (!parts.every((p) => INT.test(p))) return { ok: false, error: 'Every item must be a whole number.' }
      return { ok: true, value: parts.map(Number) }
    }
    case 'edge': {
      const m = /^([A-Za-z0-9]+)\s*(?:-|->|\s)\s*([A-Za-z0-9]+)$/.exec(text)
      if (!m) return { ok: false, error: 'Enter an edge as A-B (or "A B").' }
      return { ok: true, value: { from: m[1], to: m[2] } }
    }
    case 'text': {
      if (text === '') return { ok: false, error: 'The field is empty. Type a value, then press Go.' }
      return { ok: true, value: text }
    }
  }
}

export const INPUT_PLACEHOLDER: Record<OperationDefinition['inputKind'], string> = {
  key: 'Key, e.g. 42',
  array: 'e.g. 5, 3, 8, 1',
  edge: 'e.g. A-B',
  text: 'e.g. S D',
  none: '',
}
