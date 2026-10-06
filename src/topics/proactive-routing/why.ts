// SPEC.md §20: the reason behind each step of §10.2, in plain words. One function per step kind.

export const WHY = {
  unknown: () => 'Only a node in this network has a table to send.',
  sendFull: (u: string) =>
    `${u} sends its whole table, so every neighbor can check all its routes against it. The unchanged rows cost airtime but carry no news.`,
  sendChanged: (u: string) =>
    `Only the rows that changed since ${u}'s last update carry news, so ${u} sends just those and saves airtime.`,
  empty: (u: string) => `Nothing changed since ${u}'s last update, so the neighbors already know everything ${u} could tell them.`,
  added: (n: string, u: string, dest: string) => `${n} knew no way to ${dest}. ${u} is in range and has a route there, so going through ${u} works.`,
  newer: (n: string, dest: string) =>
    `A higher sequence number is fresher news that started at ${dest} itself, so ${n} trusts it over its older route.`,
  fewer: (n: string) => `Both routes are equally fresh, so ${n} takes the one with fewer hops.`,
  keep: (n: string, u: string, dest: string) =>
    `${u}'s route to ${dest} is neither fresher nor shorter than the one ${n} has, so ${n} has no reason to change.`,
  sent: (u: string) => `Every neighbor of ${u} has now compared ${u}'s rows with its own table.`,
  moveInput: () => 'A move needs the node that walks away and the node it ends up next to.',
  moved: (u: string) => `${u}'s radio only reaches nearby nodes, so moving changes who its neighbors are.`,
  stale: (v: string) => `A route whose next hop is out of range would lose every packet, so ${v} drops it right away.`,
  seq: (u: string) =>
    `The higher number marks this as fresh news about ${u}, so every node that hears it will replace its older route to ${u}.`,
  fullToNewcomer: (u: string, n: string) =>
    `Incremental updates carry only changes, so ${u} would never hear about routes that stayed the same. ${n} sends it everything once.`,
  settled: () => 'A node only speaks up when its table changes, so once a round changes nothing, the network has settled.',
}
