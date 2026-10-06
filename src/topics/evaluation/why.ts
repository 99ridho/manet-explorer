// SPEC.md §20: the reason behind each step of §10.9, in plain words. One function per step kind.

export const WHY = {
  linked: (p: string, q: string) => `${p} and ${q} are close enough for each signal to reach the other, so the model gives them a link.`,
  apart: () => 'Past the radio range no signal arrives, so the model gives no link.',
  between: () =>
    'Between the inner and the outer radius a small obstacle may or may not block the signal, so a random draw decides. That is how the quasi unit disk graph imitates obstacles.',
  built: () => 'Everything after this runs on these links, so a different link rule can change every result that follows.',
  marked: (v: string) =>
    `${v} sits between two nodes that cannot hear each other, so a message between them may need ${v}. That makes ${v} a backbone candidate.`,
  notMarked: (v: string) => `All of ${v}'s neighbors hear each other directly, so no message ever needs ${v} to pass between them.`,
  kept: (v: string) => `No other candidate does ${v}'s job, so dropping ${v} could leave a gap in the backbone.`,
  pruned: (v: string, u: string) =>
    `${u} reaches ${v} and all of ${v}'s neighbors, so ${v} adds nothing. Requiring the larger id stops two nodes from each dropping the other.`,
  result: () =>
    'Every node is in the set or next to a member, and the members are connected, so they can carry every broadcast while the others sleep.',
  seeds: () => 'One run on one layout can be luck, so the comparison repeats over 1 to 10 seeds.',
  seed: () => 'Each seed places the nodes differently, so the delivery ratio changes from seed to seed even for the same graph model.',
  spread: () =>
    'A mean alone hides how much results swing between layouts. The standard deviation shows that spread, which is why a report gives it next to every mean.',
}
