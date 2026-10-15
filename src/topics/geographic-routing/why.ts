// SPEC.md §20: the reason behind each step of §10.5, in plain words. One function per step kind.

export const WHY = {
  needPair: () => 'Routing needs two ends: the node that sends and the node whose position the packet heads for.',
  planarize: () =>
    'Walking around a gap only works on links that do not cross each other. The Gabriel graph drops crossing links and keeps the network connected.',
  planarAll: () => 'The walk around a gap needs links that do not cross, and none of these links cross, so all of them stay.',
  choose: (n: string, dst: string) =>
    `A node knows only its neighbors' positions and where ${dst} is. ${n} is closer to ${dst} than the node holding the packet, so it is progress.`,
  greedy: (dst: string) => `One hop to the chosen neighbor brings the packet closer to ${dst}, with no routing table needed.`,
  void: (v: string, dst: string) =>
    `Every neighbor of ${v} is farther from ${dst}, so there is a gap ahead. Perimeter mode walks along the edge of the gap instead.`,
  drop: (v: string) => `Without a recovery rule, ${v} has nowhere closer to send the packet, even if a longer way around exists.`,
  stuck: (dst: string) => `The walk went all the way around and found no node closer to ${dst}, so no path reaches it.`,
  perimeter: () =>
    'Taking the next link clockwise keeps the gap on one side and traces its edge, like walking around a lake with one hand on the shore.',
  faceChange: (dst: string) =>
    `That link crosses the straight line to ${dst} closer to ${dst}, so the walk moves onto the next face to keep following that line.`,
  nextFace: () => 'After skipping the crossing link, the sweep goes on clockwise and takes the next link it meets.',
  walkHop: () => 'The packet follows the chosen link, one hop along the edge of the gap.',
  resume: (v: string) => `${v} is closer than the node where the packet got stuck, so the gap is behind it and the greedy rule works again.`,
  deliver: (dst: string) => `${dst} is the destination, so the packet stops here.`,
}
