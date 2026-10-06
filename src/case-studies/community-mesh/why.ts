// SPEC.md §20: the reason behind each step of §19.3, in plain words. The flood's steps explain
// themselves in src/lib/dsr-flood.ts.

export const WHY = {
  candidate: () => 'S keeps every route an answer brought, so it can compare them by hops and by ETX before choosing.',
  noAnswer: () => 'Without an answer, S knows no route to the gateway.',
  pickHop: () => 'Fewest hops looks cheapest, but a hop count says nothing about how often each link loses packets.',
  pickEtx: () => 'ETX counts the expected transmissions, so four strong links can cost less than two weak ones.',
  joined: () => 'M can only join once; it is already part of the mesh.',
  appears: () => 'Anyone can put a router on a roof and join an open community mesh, so S starts hearing M at once.',
  advertise: () => 'A perfect link straight to the gateway would beat every honest route, so a mesh that trusts every claim will send its traffic to M.',
  packets: () => 'Deliver sends 1 to 30 packets, one at a time.',
  noRoute: () => 'Packets follow a found route, and there is none yet.',
  drop: () => 'M pulled the route toward itself on purpose. It throws the data away, and nothing tells S the packet was lost.',
  lost: (v: string, nxt: string) =>
    `Each try on ${v}-${nxt} needs the packet and its acknowledgment to arrive. After 4 failed tries ${v} gives up, so a weak link loses packets.`,
  delivered: () => 'Every hop got the packet through, sometimes after retries; the count shows how many transmissions it took.',
  silence: (v: string) => `${v} handed the packet on and listened, but M stayed quiet. One miss can be a collision, so the watchdog only counts it.`,
  report: (v: string) =>
    `That is too many misses to be bad luck, so ${v} reports M. The threshold keeps one unlucky collision from accusing an honest router.`,
  reroute: () => 'Routes through a reported router are avoided, so S switches to the honest route with the smallest ETX.',
  noOther: () => 'S knows no route without M, so it has nothing safer to switch to.',
  total: () => 'The share of packets that arrived is the packet delivery ratio, one of the three numbers Week 6 uses to judge a protocol.',
}
