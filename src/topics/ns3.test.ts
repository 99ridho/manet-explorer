// Contract for SPEC.md §7.3, the ns-3 tab: every topic ships a script, its argument matches the
// variant toggle, every variant has captured output, and where ns-3 reproduces a seed result that a
// topic's operations.test.ts pins, the captured output shows it.
import { describe, expect, it } from 'vitest'
import { topics } from './registry'

// Lines each captured run must contain, by `<slug>.<variant>`; the same results the visualizer
// pins on the same seed. Mobility has none: ns-3 draws its own random stream, and the notes say so.
const AGREES: Record<string, (string | RegExp)[]> = {
  'multihop.disk': ['7 links among 6 nodes'],
  'proactive-routing.default': [/M3\s+M4\s+3\s/],
  'reactive-routing.aodv': ['through S A C D', 'link C-D breaks', 'through S B E D'],
  'broadcast.mpr': ["A's MPRs: B D", '3 transmissions'],
  'broadcast.flooding': ["A's MPRs: B D"],
  'geographic-routing.perimeter': ['switches to perimeter mode', 'delivered after 5 hops: S A B C E D'],
  'geographic-routing.none': ['greedy forwarding drops the packet'],
  'clustering.highest': ['node 9 is a cluster head', 'node 8 is a cluster head', 'node 6 joins head 9, gateway'],
  'clustering.lowest': [2, 3, 4, 5, 6].map((h) => `node ${h} is a cluster head`),
  'address-allocation.buddy': ['C keeps 13 to 14', 'D takes address 15'],
  'address-allocation.qdad': ['3 AREQs got no AREP'],
  'evaluation.udg': ['links: A-B A-C B-C B-D C-D D-E E-F E-G F-G F-H G-H (11)'],
  'qos-routing.bandwidth': ['path A B C E'],
  'qos-routing.etx': ['path A B C E (ETX 3.70'],
  'qos-routing.energy': ['path A D E'],
  'qos-routing.hop': ['path A D E'],
  'routing-attacks.blackhole': ['S uses the first route to arrive: S M D', 'S reports M and switches to S A B D'],
  'routing-attacks.wormhole': ['S uses the first route to arrive: S M1 M2 D'],
  'routing-attacks.none': ['S uses the first route to arrive: S A B D'],
}

describe.each(topics.map((t) => [t.slug, t] as const))('%s ns-3 script', (slug, topic) => {
  const script = topic.ns3!

  it('ships a script whose argument follows the variant toggle', () => {
    expect(script, 'every topic has an ns-3 script').toBeDefined()
    expect(script.file).toBe(`${slug}.cc`)
    expect(script.source).toMatch(/^\/\/ Week \d/)
    expect(script.source).toContain('int\nmain(')
    if (script.arg) {
      expect(script.arg).toBe(topic.variant?.id)
      expect(Object.keys(script.outputs)).toEqual(topic.variant?.options.map((o) => o.value))
    } else {
      // A mechanism ns-3 runs one way only (DSDV sends both kinds of update) has one output.
      expect(Object.keys(script.outputs)).toEqual(['default'])
    }
  })

  it('has captured output for every run, with the results the visualizer pins', () => {
    for (const [key, output] of Object.entries(script.outputs)) {
      expect(output.trim().length, `${slug}.${key} output`).toBeGreaterThan(0)
      for (const line of AGREES[`${slug}.${key}`] ?? []) expect(output, `${slug}.${key}`).toMatch(line)
    }
  })

  it('says where ns-3 meets the visualizer', () => {
    expect(script.notes).toMatch(/visualizer/)
  })

  it('meets the copy floor', () => {
    for (const [where, text] of [['source', script.source], ['notes', script.notes], ...Object.entries(script.outputs)]) {
      expect(text, `${where}: no em dash`).not.toMatch(/\u2014/)
      expect(text, `${where}: no spaced double hyphen`).not.toMatch(/\s-{2}\s/)
      expect(text, `${where}: no arrow glyph`).not.toMatch(/[\u2192\u2190\u21d2]/)
    }
  })
})
