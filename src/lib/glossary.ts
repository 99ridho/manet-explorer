// SPEC.md §20: finds glossary terms in a piece of text, first occurrence of each term only.
import { glossary, type GlossaryEntry } from '@/content/glossary'

export type GlossarySegment = string | { text: string; entry: GlossaryEntry }

interface Pattern {
  spelling: string
  entry: GlossaryEntry
  re: RegExp
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Longest spelling first, so "next hop" wins over "hop" and "route cache" over "route".
const PATTERNS: Pattern[] = glossary
  .flatMap((entry) =>
    entry.match.map((spelling) => ({
      spelling,
      entry,
      // Acronyms match case-sensitively; ordinary words in any case.
      re: new RegExp(`(?<![\\w-])${escape(spelling)}(?![\\w-])`, spelling === spelling.toUpperCase() ? 'g' : 'gi'),
    })),
  )
  .sort((a, b) => b.spelling.length - a.spelling.length)

/** Which block marked each term first. Keyed by block, so rendering a block twice marks the same terms. */
export type GlossaryClaims = Map<string, string | number>

/** Splits `text` into plain runs and term runs, marking only terms no earlier block has claimed. */
export function splitGlossary(text: string, claims: GlossaryClaims, block: string | number = 0): GlossarySegment[] {
  const hits: { start: number; end: number; entry: GlossaryEntry }[] = []
  for (const p of PATTERNS) {
    const owner = claims.get(p.entry.term)
    if (owner !== undefined && owner !== block) continue
    if (hits.some((h) => h.entry === p.entry)) continue
    p.re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = p.re.exec(text))) {
      const start = m.index
      const end = start + m[0].length
      if (hits.some((h) => start < h.end && end > h.start)) continue
      hits.push({ start, end, entry: p.entry })
      claims.set(p.entry.term, block)
      break
    }
  }
  hits.sort((a, b) => a.start - b.start)
  const out: GlossarySegment[] = []
  let at = 0
  for (const h of hits) {
    if (h.start > at) out.push(text.slice(at, h.start))
    out.push({ text: text.slice(h.start, h.end), entry: h.entry })
    at = h.end
  }
  if (at < text.length) out.push(text.slice(at))
  return out
}
