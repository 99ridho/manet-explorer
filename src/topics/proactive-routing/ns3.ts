// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const proactiveNs3 = ns3Script(
  'proactive-routing',
  `The script runs ns-3's DSDV on the seed network, with the slide's links set as explicit losses. It prints M2's table once the tables settle, moves M3 next to M6 at 45 s, and prints M2's table again.

M2's row for M3 ends with next hop M4 and 3 hops, as in the visualizer: M2 learns of the move through M4. ns-3 counts sequence numbers up from 0 in steps of 2, so they do not match the slide's values.

ns-3's DSDV always sends both kinds of update, a full dump every 15 s and an incremental update when a route changes, so this script takes no variant argument. It counts the updates that carried every row and the ones that carried fewer.`,
)
