// SPEC.md §20: the reason behind each step of §10.7, in plain words. One function per step kind.

export const WHY = {
  joinInput: () => 'Joining needs the newcomer\'s name and a neighbor that already has an address.',
  full: (via: string) => `${via} holds only its own address, so it has nothing left to give away.`,
  split: (via: string) =>
    `With no DHCP server, the nodes share out the addresses themselves. ${via} gives away half of the biggest range it holds.`,
  hand: (via: string) => `${via} keeps the half that contains its own address, so its address stays valid.`,
  address: (x: string) =>
    `A range has only one holder, so nobody else uses the first address of ${x}'s range. No other node has to be asked.`,
  pick: (x: string) => `With no server to ask, ${x} guesses an address and then checks whether another node already uses it.`,
  flood: (x: string, a: number) => `${x} asks every node it can reach whether ${a} is taken. A flood reaches them all without knowing where they are.`,
  owner: (owner: string, x: string) =>
    `Two nodes with one address would get each other's packets, so ${owner} objects and ${x} has to guess again.`,
  repick: (x: string) => `The old guess is taken, so ${x} tries another random address.`,
  silence: (x: string) => `A reply can get lost on the radio, so one silent try proves nothing. ${x} asks again until the limit.`,
  take: (x: string) =>
    `After repeated silence, ${x} assumes nobody uses the address. A node that is out of reach right now could still be using it.`,
  needNode: () => 'Only a node in the network can leave it.',
  noBuddy: (u: string) => `${u} has nobody to hand its addresses to, so they would be lost if it left now.`,
  handBack: (u: string) => `${u} gives its addresses back before leaving, so another node can hand them out again.`,
  merged: (b: string) => `Ranges that touch become one range, so ${b} can split it for later newcomers.`,
  gone: (u: string) => `Every address ${u} held has a new holder, so none is lost.`,
  crash: (u: string) => `A crashed node sends no goodbye, so no node takes over the addresses ${u} held.`,
  leak: () => 'Nobody knows these addresses are free, so they stay unused until a periodic check finds them.',
  alreadyMerged: () => 'The partition can merge only once; after that it is part of the network.',
  meet: () => 'The two groups chose their addresses without hearing each other, so the same address may now exist twice.',
  conflict: (x: string) => `Two nodes with one address would each get the other's packets, so ${x} gives its address up.`,
  noVia: (x: string) => `${x} has no configured neighbor to get a new address from.`,
  resolved: () =>
    'Every address is unique again. The nodes only knew to check because they noticed the merge, which is why MANETconf gives each partition an id.',
  noConflict: () => 'The two groups happened to choose different addresses, so no node has to change.',
}
