// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const attacksNs3 = ns3Script(
  'routing-attacks',
  `The script runs a small DSR-style discovery: S floods an RREQ that records its path, and D answers every copy. S keeps every route in order of arrival, uses the first, and runs a watchdog: after each packet it listens for its next hop to pass the packet on.

- **Black hole**: M answers at once with a route through itself and drops every data packet. After M's fourth miss S reports it and switches to S, A, B, D, as in the visualizer.
- **Wormhole**: M1 and M2 share a real cable outside the radio channel, and the route through the tunnel arrives first, as in the visualizer. The visualizer counts a forward into the tunnel as heard; in ns-3, S cannot hear a cable, so the watchdog reports M1 even though every packet arrives.
- **No attacker**: S uses S, A, B, D from the start.

Mainline ns-3 has neither attack nor a watchdog; the script carries both.`,
)
