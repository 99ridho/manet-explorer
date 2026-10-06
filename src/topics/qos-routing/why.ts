// SPEC.md §20: the reason behind each step of §10.10, in plain words. One function per step kind.

export const WHY = {
  needPair: () => 'A path search needs the node where the data starts and the node it goes to.',
  needRequest: () => 'A bandwidth request needs the two ends and how many Mbps the data stream needs.',
  prune: (b: number, need: number) => `Data that needs ${need} Mbps would stall on a link that offers ${b}, so the search ignores this link.`,
  settleHop: (src: string, dst: string) =>
    `The search visits nodes in order of their distance from ${src}, so the first time it reaches ${dst} it holds a path with the fewest hops.`,
  reachedHop: (n: string, v: string) => `${n} had not been reached yet, so the way through ${v} is the shortest way to it.`,
  sameHop: (n: string) => `${n} was already reached in as few hops or fewer, so this way is no better.`,
  foundHop: () => 'Fewest hops is the simplest measure, but it says nothing about how good each link is.',
  foundBandwidth: () => 'Every link on this path can carry the requested bandwidth, even if a shorter path exists.',
  none: () => 'No chain of usable links connects the two ends, so the request cannot be met.',
  settleEtx: () =>
    'The search always continues from the node with the lowest total so far, so a node it settles can never be reached more cheaply later.',
  settleEnergy: () =>
    'The search continues from the node whose weakest relay is strongest, so the path it builds avoids nearly empty batteries.',
  reachedEtx: (n: string, v: string) =>
    `A weak link needs many retries, so its ETX is high. Through ${v}, the expected transmissions to ${n} are fewer than on any way found before.`,
  reachedEnergy: (n: string, v: string) => `Through ${v}, the weakest battery on the way to ${n} is stronger than on any way found before.`,
  sameEtx: (n: string, v: string) => `The way through ${v} would need more expected transmissions than ${n}'s best so far.`,
  sameEnergy: (n: string, v: string) => `Through ${v}, ${n} would depend on a weaker battery than on its best way so far.`,
  foundEtx: () => 'More hops over reliable links can need fewer transmissions in total than fewer hops over weak links.',
  foundEnergy: () => 'Avoiding nearly empty relays keeps every node alive longer, even when the path is not the shortest.',
  packets: () => 'Send packets runs 1 to 50 packets, one at a time.',
  noPath: () => 'Packets follow the path found last, and there is none yet.',
  broken: () => 'A relay with an empty battery cannot forward anything, so packets on this path would be lost.',
  packet: () => 'Forwarding takes energy, so every packet costs each relay one unit of battery.',
  down: (r: string) =>
    `${r}'s battery is empty, so it switches off. One empty relay breaks the whole path, which is why network lifetime differs from total energy (Loo p. 203).`,
}
