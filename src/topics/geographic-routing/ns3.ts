// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const geoNs3 = ns3Script(
  'geographic-routing',
  `Beacons carry each node's position, so every node knows where its neighbors are. The packet carries D's position, its mode, and where greedy forwarding got stuck, and each node picks the next hop from its own neighbor table. The rules are the visualizer's: greedy toward D, a clockwise walk over the Gabriel graph at a void, and greedy again once a node is closer to D than the stuck node.

The output follows the visualizer step for step: the void at S, the walk through A and B to C, then greedy through E to D. With **Greedy only** the packet dies at S.

Mainline ns-3 has no geographic routing module, so the script carries its own. Each hop is a unicast frame, which the MAC acknowledges and retries.`,
)
