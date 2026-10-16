// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const broadcastNs3 = ns3Script(
  'broadcast',
  `HELLOs carry each node's neighbor list, so every node learns its two-hop neighbors and picks MPRs by greedy set cover, the visualizer's rule. A picks B and D, as in the visualizer. Then A broadcasts one message.

- **MPR relays**: B and D relay, 3 transmissions in all, as in the visualizer.
- **Blind flooding**: every node relays its first copy.

Broadcast frames get no ACK and no retry. B and D cannot hear each other, so when both relay, their copies collide at A, and the duplicates the visualizer counts at A never arrive. Under blind flooding D and E collide at F the same way, and F can miss the message altogether: the broadcast storm. Run with \`--jitter=50\` to spread the relays out and compare.`,
)
