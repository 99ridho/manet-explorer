// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const reactiveNs3 = ns3Script(
  'reactive-routing',
  `The script runs ns-3's AODV or DSR on the seed network, with the slide's links set as explicit losses. S sends a UDP echo to D every second. At 10 s the last link of S's route breaks, and the script prints the route before and after.

- **AODV** finds S, A, C, D first and S, B, E, D after the break, as in the visualizer. The script turns off AODV's expanding ring search, so one RREQ floods the whole network, as it does in the visualizer.
- **DSR** in ns-3 finds S, B, E, D first. Which copy of the request reaches D first depends on random delays and the MAC, not on node order as in the visualizer, so the script breaks E-D instead and DSR repairs over S, A, C, D.

The broadcast count includes route errors and repeated requests, so it is higher than the visualizer's count of RREQ transmissions.`,
)
