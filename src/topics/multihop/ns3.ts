// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const multihopNs3 = ns3Script(
  'multihop',
  `The script places the six nodes of the seed network on an 802.11b ad hoc channel, 50 m per unit, and has each node broadcast 50 hellos. A link is a pair where each node heard the other.

- **Unit disk**: ns-3's range model passes every frame within 100 m and none beyond, so the hellos find the same seven links as **Build links**.
- **Shadowing**: a log-distance loss with a fresh 4 dB fade on every frame. Each link now has a delivery ratio in each direction, so the script prints the ETX of each link, and a far pair such as A-D sometimes gets through. The visualizer draws one fade per pair instead, so its links are either there or not.`,
)
