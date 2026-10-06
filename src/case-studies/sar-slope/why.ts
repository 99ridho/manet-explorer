// SPEC.md §20: the reason behind each step of §19.1, in plain words. One function per step kind.

export const WHY = {
  needTeam: () => 'Reports start at a team radio, so the run needs T1, T2, or T3.',
  start: (src: string) => `${src} has a report but no route to the base camp. The radios only search when someone has data, so the search starts now.`,
  silent: (v: string, from: string) =>
    `${from} did not choose ${v} as a relay, because its chosen relays already reach the radios beyond. A repeat from ${v} would mostly add duplicates.`,
  transmitSrc: (v: string) => `${v} does not know the way to G, so it asks every radio in range at once.`,
  transmitFlood: (v: string) => `${v} repeats the request once, as every radio does in blind flooding, so it spreads up the slope.`,
  transmitMpr: (v: string) => `${v} was chosen as a relay by the radio it heard from, so it repeats the request once.`,
  dup: (n: string) => `${n} has heard this request before. Each extra copy uses the shared channel and can collide with other traffic.`,
  first: (n: string, src: string) => `${n} remembers who it heard from, so G's answer can retrace the same radios back to ${src}.`,
  noRoute: () => 'No chain of radios in range reaches G, so the request runs out of radios to pass it on.',
  rrep: (prev: string) => `${prev} learns which neighbor leads to G. Each radio keeps only that next step, not the whole route.`,
  noTableRoute: (src: string) => `Reports cannot leave without a route, and ${src} has none stored.`,
  lookup: (v: string) => `${v} only knows its next step toward G, so it checks its own table before passing the report on.`,
  forward: (v: string, nxt: string) => `${nxt} is in range of ${v}, so one transmission carries the report across this hop.`,
  delivered: () => 'G is the gateway to the outside, so the report has arrived.',
  needRadio: () => 'Only a radio that is still on the slope can walk away, and the gateway stays at base camp.',
  before: (u: string) => `${u} still has its links on this step, so you can see which radios are about to lose it.`,
  gone: (u: string) => `${u} is out of everyone's range, so every link it had is gone.`,
  rerr: (src: string) => `The radios between ${src} and the gap still think the route works. The RERR warns them so they stop sending into nothing.`,
  delete: (n: string) => `A route through a radio that left only loses reports, so ${n} throws it away.`,
  cut: (u: string) => `Every path from the team to G went through ${u}. A relay like that is the one the team cannot afford to lose.`,
  ok: () => 'Another chain of radios still connects the team to G, so a new search will find it.',
}
