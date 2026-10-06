// SPEC.md §20: plain-words definitions shown when a student taps a term in narration or a scenario.
// `match` lists the spellings to find; acronyms match case-sensitively, words in any case.

export interface GlossaryEntry {
  term: string
  match: string[]
  definition: string
}

export const glossary: GlossaryEntry[] = [
  {
    term: 'MANET',
    match: ['MANET', 'MANETs'],
    definition:
      'Mobile ad hoc network: devices that talk to each other directly, with no access point or central administrator. Each device works as both a host and a router (Loo p. 5).',
  },
  {
    term: 'node',
    match: ['node', 'nodes'],
    definition: 'One device in the network: a phone, a laptop, a radio. On the canvas it is a circle with a label.',
  },
  {
    term: 'link',
    match: ['link', 'links'],
    definition: 'Two nodes close enough to hear each other directly. On the canvas it is a line between them.',
  },
  {
    term: 'radio range',
    match: ['radio range', 'in range', 'out of range'],
    definition: 'How far a node can be heard. Hover over a node on the canvas to see its range as a circle.',
  },
  {
    term: 'neighbor',
    match: ['neighbor', 'neighbors'],
    definition: 'A node within radio range, so the two share a link.',
  },
  {
    term: 'hop',
    match: ['hop', 'hops'],
    definition: 'One transmission from a node to a neighbor. A route of three hops passes through two nodes in between.',
  },
  {
    term: 'route',
    match: ['route', 'routes'],
    definition: 'The chain of nodes a packet follows from its source to its destination.',
  },
  {
    term: 'next hop',
    match: ['next hop'],
    definition: 'The neighbor a node hands a packet to on the way to a destination. A node can know its next hop without knowing the rest of the route.',
  },
  {
    term: 'packet',
    match: ['packet', 'packets'],
    definition: 'One message sent over the network: data, or a control message that protocols use to find and fix routes.',
  },
  {
    term: 'broadcast',
    match: ['broadcast', 'broadcasts'],
    definition: 'One transmission that every neighbor in range hears at once, instead of a message to one chosen neighbor.',
  },
  {
    term: 'flood',
    match: ['flood', 'flooding'],
    definition: 'Every node that hears a message broadcasts it once more, so the message spreads across the whole network.',
  },
  {
    term: 'AODV',
    match: ['AODV'],
    definition: 'Ad hoc On-demand Distance Vector routing. A reactive protocol: each node on a route remembers only the next hop toward the destination.',
  },
  {
    term: 'DSR',
    match: ['DSR'],
    definition: 'Dynamic Source Routing. A reactive protocol: the source stores the whole route and writes it into every data packet.',
  },
  {
    term: 'reactive protocol',
    match: ['reactive protocol', 'reactive protocols'],
    definition: 'A routing protocol that looks for a route only when a node has data to send (Loo 2.2-2.3, pp. 20-22).',
  },
  {
    term: 'proactive protocol',
    match: ['proactive protocol', 'proactive protocols'],
    definition: 'A routing protocol that keeps a route to every destination ready all the time, even when no data flows (Loo 2.2-2.3, pp. 20-22).',
  },
  {
    term: 'RREQ',
    match: ['RREQ'],
    definition: 'Route request. The message a source floods to ask the network for a route to a destination.',
  },
  {
    term: 'RREP',
    match: ['RREP'],
    definition: 'Route reply. The answer the destination sends back toward the source once a route request reaches it.',
  },
  {
    term: 'RERR',
    match: ['RERR'],
    definition: 'Route error. The warning a node sends when a link on a route breaks, so other nodes stop using that route.',
  },
  {
    term: 'route cache',
    match: ['route cache'],
    definition: 'Where a DSR node stores whole routes it has learned, so it can reuse them without searching again.',
  },
  {
    term: 'request id',
    match: ['request id', 'request number'],
    definition: 'A number the source gives each new search. Nodes use it to tell a fresh request from a copy they have already handled.',
  },
]
