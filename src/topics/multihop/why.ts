// SPEC.md §20: the reason behind each step of §10.1, in plain words. One function per step kind.

export const WHY = {
  linkedDisk: (p: string, q: string) => `${p} and ${q} are close enough for each signal to reach the other, so they can talk directly.`,
  apartDisk: (p: string, q: string) =>
    `A radio signal fades with distance. Past the range, ${q} cannot pick up ${p}'s signal, so the two need other routers in between.`,
  linkedShadow: () =>
    'Walls and trees weaken a signal by a random amount. Even after that loss the signal arrives strong enough, so the link exists.',
  apartShadow: (p: string, q: string) => `With the random loss added, ${p}'s signal reaches ${q} too weak to read, so there is no link.`,
  built: () => 'The links decide who can talk directly. Every other pair has to pass messages over several hops.',
  enter: (v: string) =>
    `The search numbers each router in the order it reaches it. low[${v}] will record the earliest router ${v} can get back to by a shortcut.`,
  tree: (v: string, w: string) => `${w} has no number yet, so the search walks from ${v} to ${w} and explores everything beyond it.`,
  backLink: (v: string, w: string) =>
    `${w} was reached earlier, so ${v}-${w} is a shortcut back. ${v} remembers the earliest router it can reach this way.`,
  backFromChild: (v: string, w: string) => `A shortcut found anywhere beyond ${w} also helps ${v}, so ${v} keeps the smaller low value.`,
  bridge: (v: string, w: string) =>
    `Nothing beyond ${w} has a shortcut back to ${v} or earlier, so ${v}-${w} is the only way across. If it fails, the network splits in two.`,
  cut: (v: string, w: string) =>
    `Every way from ${w}'s side back to the rest passes through ${v}. If ${v} switches off, ${w}'s side is cut off.`,
  rootCut: (v: string) =>
    `The search had to start more than one branch from ${v}, so those branches meet only at ${v}. Without ${v} they cannot reach each other.`,
  resultWeak: () =>
    'Bridges and articulation points are the weak spots: losing one splits the network, so they are where a backup link helps most.',
  resultNone: () => 'Any single link or router can fail here and the rest still reach each other.',
  etxInput: () => 'ETX needs a link and how often a packet gets through in each direction, as two numbers from 0 to 1.',
  etxNoLink: (p: string, q: string) => `ETX measures a link that exists. ${p} and ${q} never hear each other, so there is nothing to measure.`,
  etxCycle: () => 'A transfer only counts when the data arrives and its acknowledgment comes back, so both directions have to succeed.',
  etxZero: () => 'If one direction never delivers, no number of retries ever completes a transfer.',
  etx: () => 'A weak link has to repeat the same packet. ETX is how many tries one delivery takes on average.',
  etxStore: (p: string, q: string) => `With ETX on ${p}-${q}, a routing protocol can prefer reliable links over links that only look short.`,
}
