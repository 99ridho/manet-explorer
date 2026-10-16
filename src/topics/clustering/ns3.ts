// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const clusterNs3 = ns3Script(
  'clustering',
  `HELLOs carry node ids. A node declares itself a cluster head when no undecided neighbor ranks before it; an undecided node that hears heads joins the best-ranked one and says so, which lets its neighbors decide next. A member that hears two or more heads is a gateway.

The result matches the visualizer under both rules. Every message goes out three times because broadcasts get no ACK. Without the repeats, 3 and 5 can announce at the same moment under the lowest-ID rule, collide at 8, and leave 8 in the wrong cluster. The visualizer elects one node at a time, so it never meets this problem.

Mainline ns-3 has no clustering module; the election is part of the script.`,
)
