// SPEC.md §20: the reason behind each step of §10.11, in plain words. The flood's steps explain
// themselves in src/lib/dsr-flood.ts, which the community mesh shares.

export const WHY = {
  noAnswer: () => 'Without an answer, the source knows no route to the destination.',
  pick: () => 'The source trusts the first answer, assuming it came over the quickest path. An attacker counts on exactly that habit.',
  packets: () => 'This sends 1 to 20 packets, one at a time.',
  noRoute: () => 'Packets follow a discovered route, and there is none yet.',
  drop: (v: string) => `${v} pulled the route toward itself on purpose. It throws the data away, and nothing tells the source the packet was lost.`,
  tunnel: () =>
    'The tunnel delivers the packet, so nothing looks wrong. The attackers still sit on the route and can delay or drop traffic whenever they choose.',
  delivered: () => 'The packet reached the destination, so it stops here.',
  heard: (v: string, nxt: string) => `${v} listens after handing the packet on. Hearing ${nxt} forward it shows ${nxt} did its job.`,
  silence: (v: string, nxt: string) =>
    `${v} kept a copy and listened, but ${nxt} stayed quiet. One miss can be a collision, so the watchdog only counts it.`,
  report: (v: string, nxt: string) =>
    `That is too many misses to be bad luck, so ${v} reports ${nxt}. The threshold keeps one unlucky collision from accusing an honest node.`,
  reroute: (nxt: string) => `Routes through a reported node are avoided, so the source switches to a route it already knows that leaves ${nxt} out.`,
  noOther: () => 'The source learned no other route, so it has nothing safer to switch to.',
}
