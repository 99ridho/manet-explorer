// SPEC.md §20: the reason behind each step of §19.2, in plain words. One function per step kind.

export const WHY = {
  joinInput: () => 'A new volunteer needs a new id and a volunteer already in the camp to stand next to.',
  arrive: (u: string) => `${u}'s radio reaches only the volunteers close by, so it can only ask those for an address.`,
  skip: (n: string) => `${n} holds only its own address, so it has nothing to give away. The next neighbor may have spare addresses.`,
  wait: (u: string) => `Every neighbor of ${u} has given its spare addresses away. The space is used unevenly, Buddy's known weakness (Misra pp. 338-339).`,
  split: (via: string) => `With no DHCP server, the radios share out the addresses themselves. ${via} gives away half of its biggest range.`,
  hand: (via: string) => `${via} keeps the half that contains its own address, so its address stays valid.`,
  address: (u: string) => `A range has only one holder, so nobody else uses the first address of ${u}'s range. No other radio has to be asked.`,
  joinsHead: (u: string, h: string) => `${u} can hear head ${h}, so it becomes a member and the existing clusters stay as they are.`,
  newHead: (u: string) => `${u} hears no cluster head, so no cluster can take it in and it leads its own.`,
  noneToElect: () => 'Only radios with an address take part in an election, and none has one.',
  head: (v: string) => `No undecided neighbor of ${v} has a higher id, so nobody nearby outranks it. Each radio can apply this rule on its own.`,
  headAlone: (v: string) => `Every neighbor of ${v} already belongs to a cluster, so ${v} leads a cluster of one.`,
  member: (n: string, v: string) => `${n} is one hop from head ${v}, so ${v} can reach it directly and coordinate it.`,
  gateway: (n: string) => `${n} hears two cluster heads, so it can carry messages between their clusters.`,
  elected: () => 'Only cluster heads and gateways relay between clusters. Ordinary members talk to their own head.',
  ticks: () => 'A tick is one step of the day. Up to 30 keeps the run short enough to step through.',
  calm: () => 'The volunteers moved, but each member is still in range of its head, so no cluster has to change.',
  changes: () =>
    'Some volunteers walked out of their head\'s range. Each one joins a head it can still hear, or leads a new cluster if it hears none.',
  done: () => 'Every new head means a reorganized cluster. Fewer new heads means the clusters stayed stable.',
}
