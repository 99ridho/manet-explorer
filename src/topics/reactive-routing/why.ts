// SPEC.md §20: the reason behind each step of §10.3, in plain words. One function per step kind.

export const WHY = {
  needPair: () =>
    'A search needs two ends: the radio that has something to send and the radio it wants to reach.',
  start: (src: string, dst: string) =>
    `${src} keeps no route to ${dst} in advance. AODV and DSR only search when a radio has data to send, so the search starts now.`,
  restart: () => 'A new request number lets every radio tell this search apart from the earlier ones.',
  broadcastAodv: (v: string, dst: string) =>
    `${v} does not know where ${dst} is, so it asks every radio in range at once. One broadcast reaches all of them.`,
  broadcastDsr: (v: string, dst: string) =>
    `${v} does not know where ${dst} is, so it asks every radio in range at once. The copy lists the radios it has passed, so the answer can carry the whole route.`,
  inRecord: (n: string) => `${n} is already on this copy's list. Passing it through ${n} again would send it around in a loop.`,
  duplicate: (n: string) =>
    `${n} already passed this request on. Repeating it would only add traffic, and the request would circle the network.`,
  reversePath: (n: string, src: string, dst: string) =>
    n === dst
      ? `${dst} remembers who it heard from, so its answer can start back toward ${src} along the same radios.`
      : `${n} remembers who it heard from, so the answer from ${dst} can retrace the same radios back to ${src}.`,
  addSelf: (dst: string) => `Each radio adds its name to the list, so the copy that reaches ${dst} holds the full route.`,
  arrivedAodv: (src: string, dst: string) => `${dst} is the radio ${src} is looking for, so it stops the request here and answers.`,
  arrivedDsr: (dst: string) =>
    `Copies can reach ${dst} along different chains of radios, and each list that arrives is one possible route.`,
  floodOver: () => 'Every radio that heard the request has passed it on once, so the search stops by itself.',
  noRoute: (src: string, dst: string) =>
    `No chain of radios in range connects ${src} and ${dst}, so the request runs out of radios to pass it on.`,
  pickFirst: (dst: string) => `The first copy to arrive came over the quickest chain of radios, so ${dst} answers that one.`,
  pickOnly: (dst: string) => `Only one list reached ${dst}, so that list is the route.`,
  rrepDsr: (src: string, dst: string) =>
    `${src} asked, so the answer has to get back to ${src}. ${dst} sends it along the listed radios in reverse order.`,
  cache: (src: string) => `With the route stored, ${src} can send data now and later without searching again.`,
  rrepHop: (prev: string, dst: string) =>
    `${prev} learns which neighbor leads to ${dst}. Each radio keeps only that one next step, not the whole route.`,
  noRouteSend: (src: string, dst: string) =>
    `Data cannot leave without a route, and ${src} has none stored for ${dst}.`,
  lookupAodv: (v: string, dst: string) =>
    `${v} only knows its next step toward ${dst}, so it checks its own table before passing the packet on.`,
  lookupDsr: (v: string) => `In DSR the packet carries the whole route, so ${v} reads the next name from the packet and needs no table.`,
  sendBroken: (v: string, nxt: string) =>
    `A radio can only hand a packet to a neighbor still in range. With ${v}-${nxt} broken, the packet has nowhere to go.`,
  forward: (v: string, nxt: string) => `${nxt} is in range of ${v}, so one transmission carries the packet across this hop.`,
  delivered: (dst: string) => `${dst} is the destination, so it keeps the packet instead of passing it on.`,
  noLink: () => 'Only two radios that are linked right now can lose their link.',
  linkBreaks: (u: string, v: string) =>
    `${u} and ${v} are now out of each other's range, so no packet can cross between them.`,
  unused: (u: string, v: string) =>
    `The current route does not cross ${u}-${v}, so traffic keeps flowing and no radio has to change anything.`,
  rerrAtSource: (src: string) => `${src} noticed the break itself, so there is no radio upstream to warn.`,
  rerrUp: (src: string) =>
    `The radios between ${src} and the break still think the route works. The RERR warns them, so they stop sending into a dead end.`,
  deleteAodv: (n: string) => `A route through a broken link only loses packets, so ${n} throws it away.`,
  deleteDsr: (src: string) => `${src} stored the whole route, and that route crosses the broken link, so the stored route has to go.`,
  rerrDown: (down: string) => `${down} lost the link too, so it warns the radios on its side in the same way.`,
  done: (src: string) =>
    `${src} searches again the next time it has data. The new request number keeps leftover copies of the old search from being mistaken for the new one.`,
}
