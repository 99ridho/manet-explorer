import { describe, expect, it } from 'vitest'
import { glossary } from '@/content/glossary'
import { splitGlossary } from './glossary'

describe('glossary', () => {
  it('has unique terms and spellings, each with a definition', () => {
    const terms = glossary.map((g) => g.term)
    expect(new Set(terms).size).toBe(terms.length)
    const spellings = glossary.flatMap((g) => g.match.map((m) => m.toLowerCase()))
    expect(new Set(spellings).size).toBe(spellings.length)
    for (const g of glossary) {
      expect(g.match.length).toBeGreaterThan(0)
      expect(g.definition.length).toBeGreaterThan(0)
    }
  })

  it('marks the first occurrence of each term, longest spelling first', () => {
    const segs = splitGlossary('A looks up D in its table: next hop C. The hop count grows.', new Map())
    const marked = segs.filter((s) => typeof s !== 'string').map((s) => s.text)
    expect(marked).toEqual(['next hop', 'hop'])
    const again = splitGlossary('The RREQ and the RREQ again.', new Map())
    expect(again.filter((s) => typeof s !== 'string')).toHaveLength(1)
    expect(again.map((s) => (typeof s === 'string' ? s : s.text)).join('')).toBe('The RREQ and the RREQ again.')
  })

  it('skips terms an earlier block claimed, and marks the same terms when a block renders twice', () => {
    const claims = new Map<string, string | number>()
    expect(splitGlossary('The RREQ spreads.', claims, 'a')).toHaveLength(3)
    expect(splitGlossary('The RREQ spreads.', claims, 'b')).toEqual(['The RREQ spreads.'])
    expect(splitGlossary('The RREQ spreads.', claims, 'a')).toHaveLength(3)
  })

  it('matches acronyms by case', () => {
    expect(splitGlossary('an aodv node', new Map()).filter((s) => typeof s !== 'string').map((s) => s.text)).toEqual(['node'])
  })

  it('does not match inside a hyphenated link name or another word', () => {
    expect(splitGlossary('Link C-D breaks; the linked pair', new Map()).filter((s) => typeof s !== 'string').map((s) => s.text)).toEqual(['Link'])
    expect(splitGlossary('hopping', new Map())).toEqual(['hopping'])
  })
})
