// SPEC.md §20: the reason behind each step of §10.4, in plain words. One function per step kind.

export const WHY = {
  needNode: () => 'Each node chooses its own relays, so the selection needs one node to work for.',
  alone: (u: string) => `${u} hears no one, so there is nobody who could relay for it.`,
  sets: (u: string) =>
    `${u} knows its neighbors and their neighbors from HELLO messages. Its MPRs must reach every two-hop neighbor, because only the MPRs will repeat its broadcasts.`,
  noTwoHop: (u: string) => `Every node ${u} can reach already hears ${u} directly.`,
  noMpr: () => 'With no node two hops away, a relay would only repeat what everyone already heard.',
  unique: (u: string, c: string, n: string) =>
    `${n} is the only neighbor that reaches ${c}. Without ${n} as a relay, ${c} would never get ${u}'s broadcasts.`,
  covered: () => 'Two-hop neighbors that these MPRs already reach need no other relay.',
  noneFixed: () => 'Every two-hop neighbor has more than one way in, so the choice is still open.',
  greedy: () => 'Taking the neighbor that covers the most uncovered nodes keeps the relay set small.',
  done: () => 'Every node two hops away now has a relay. The other neighbors stay silent, and that saves transmissions.',
  allNeeded: () => 'Each neighbor is needed to reach some two-hop node, so all of them have to relay.',
  needSource: () => 'A broadcast starts at one node, the source.',
  silent: (v: string, heardFrom: string) =>
    `${heardFrom} did not choose ${v} as a relay, because its MPRs already reach the nodes two hops away. A repeat from ${v} would mostly make duplicates.`,
  source: (v: string) => `${v} is the source, so it transmits first.`,
  relayFlood: (v: string) => `${v} repeats the packet once, as every node does in blind flooding, so the packet spreads without any planning.`,
  relayMpr: (v: string) => `${v} was chosen as an MPR by the node it heard the packet from, so it repeats the packet once.`,
  noNeighbor: (v: string) => `A transmission only reaches nodes in range, and ${v} has none.`,
  dup: (n: string) => `${n} has heard this packet before. On a shared channel each extra copy costs airtime and can collide with other packets.`,
  first: (n: string) => `${n} keeps this first copy and remembers it, so it can recognize later copies as duplicates.`,
  total: () => 'Reaching every node is the goal; transmissions and duplicates are what the broadcast cost.',
  needLink: () => 'A link is named by the two nodes at its ends.',
  noLink: () => 'Only a link that exists can disappear.',
  linkGone: () =>
    'The lost link may have been how a node reached a two-hop neighbor, so every node rebuilds its relay choice from fresh HELLO messages.',
  unchanged: () => 'The lost link was not needed to reach any two-hop neighbor, so every relay choice still works.',
  changed: (w: string) => `The neighbors around ${w} changed, so ${w} chooses the relays that now cover its two-hop neighbors.`,
}
