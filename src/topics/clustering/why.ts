// SPEC.md §20: the reason behind each step of §10.6, in plain words. One function per step kind.

export const WHY = {
  allPlaced: () => 'Elect only places nodes without a cluster head, and every node already has one.',
  head: (v: string, rule: 'highest' | 'lowest') =>
    `No undecided neighbor of ${v} has a ${rule === 'highest' ? 'higher' : 'lower'} id, so nobody nearby outranks it. A fixed rule like this lets each node decide locally, with no organizer.`,
  headAlone: (v: string) => `Every neighbor of ${v} already belongs to a cluster, so ${v} has no one to join and leads a cluster of one.`,
  member: (n: string, v: string) => `${n} is one hop from head ${v}, so ${v} can reach it directly and coordinate it.`,
  gateway: (n: string) => `${n} hears two cluster heads, so it can carry messages between their clusters.`,
  done: () => 'Only cluster heads and gateways relay between clusters. Ordinary members talk to their own head.',
  needNode: () => 'Only a node that is in the network can leave it.',
  left: (u: string) => `${u} switched off or walked away, so its links are gone and every node that relied on it has to adjust.`,
  rejoin: (n: string, h: string) => `${n} lost its head but can still hear ${h}, so joining ${h} needs no new election.`,
  orphan: (n: string) => `${n} hears no cluster head at all, so it has to take part in a new election.`,
  gateways: () => 'The clusters changed, so each member checks again how many heads it can hear.',
  joinInput: () => 'A new node needs a number as its id and at least one existing node it can hear.',
  exists: () => 'Ids must be unique, or two nodes would answer to the same name.',
  missing: () => 'A link needs a node at each end, and that one is not in the network.',
  added: (u: string) => `${u} does not start a new election for everyone. It only looks at the heads it can already hear.`,
  joins: (u: string, h: string) => `${u} can hear head ${h}, so it becomes a member and the existing clusters stay as they are.`,
  newHead: (u: string) => `${u} hears no cluster head, so no cluster can take it in and it leads its own.`,
}
