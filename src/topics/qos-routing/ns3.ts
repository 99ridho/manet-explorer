// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const qosNs3 = ns3Script(
  'qos-routing',
  `The script picks A's path to E by the chosen metric from the visualizer's example values, installs it as static routes, and sends a packet every 0.5 s for 300 s. Each link loses each frame, data or ACK, at its example delivery ratio, and the MAC retries what it loses. Each node runs on a battery of 5 J per unit (a demo value), drained by the time its radio spends in each state.

- **ETX** and **Bandwidth** choose A, B, C, E, as in the visualizer. It costs the fewest frames, but B starts with the smallest battery and runs out partway through, and the packets after that never arrive.
- **Energy** and **Hop count** choose A, D, E. Its links are worse, so the radios send far more frames, but the path does not depend on B.

ns-3's radios draw current even when idle, so B's battery runs out under every metric; it matters only when B is on the path. The radio runs at 1 Mbps on every link, so the bandwidth values only decide the path.`,
)
