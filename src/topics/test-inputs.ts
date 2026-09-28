// Shared by structure.test.ts and pseudocode.test.ts so both drive the same branches.
// Every input runs on the fresh seed; branches that need a prior state (Send after Discover,
// Break link on a route) are covered by each topic's own operations.test.ts.
export const INPUTS: Record<string, unknown[]> = {
  'multihop/link-etx': ['C D 0.8 0.5', 'C D 0 0.5', 'A D 0.8 0.5', 'C D 2 0.5', 'nonsense'],
  'reactive-routing/discover-aodv': ['S D', 'S', 'S S'],
  'reactive-routing/discover-dsr': ['S D', 'X Y'],
  'reactive-routing/send-aodv': ['S D', 'bad'],
  'reactive-routing/send-dsr': ['S D'],
  'reactive-routing/break-link': ['C D', 'A E', 'S B'],
}
