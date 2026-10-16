// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const addressNs3 = ns3Script(
  'address-allocation',
  `D joins the seed network next to C. D has no IP address while it asks, so the protocol runs over raw link-layer frames. Once D has an address, the script configures it on D's Wi-Fi interface as 10.0.0.k.

- **Buddy**: C offers its range, D picks C, C keeps 13 to 14 and gives 15 to 16, and D takes 15, as in the visualizer.
- **Query-based DAD**: D draws an address and floods an AREQ for it three times. Run with \`--first=11\` to pick B's address and watch B answer with an AREP.

The draw comes from ns-3's random stream, not the visualizer's, so D picks a different first address. Mainline ns-3 has no MANET address allocation; both schemes are part of the script.`,
)
