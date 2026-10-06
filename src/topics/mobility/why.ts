// SPEC.md §20: the reason behind each step of §10.8, in plain words. One function per step kind.

export const WHY = {
  ticks: () => 'A tick is one step of time. Up to 40 keeps the run short enough to step through.',
  tickRwp: () => 'Every searcher walks toward a random point of their own, so distances keep changing and links appear and break.',
  tickRpgm: () =>
    'Each team walks its route together, and members only wander a little around their team, so links inside a team mostly survive.',
  done: () =>
    'These numbers come from the movement alone, before any protocol runs. Frequent link changes and short-lived links mean routes keep breaking.',
  empty: () => 'The share comes from recorded positions, and none exist before the first tick.',
  count: () => 'Counting the positions of every tick shows where the nodes actually spent their time.',
  share: () =>
    'The centre quarter covers a quarter of the area. A share well above 25 % shows random waypoint pulling nodes toward the middle, a known flaw (Misra p. 241).',
}
