// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const evaluationNs3 = ns3Script(
  'evaluation',
  `The script first prints the seed network's links under the chosen model. The unit disk gives the visualizer's 11 links; the quasi unit disk keeps a pair between q × range and the range only when a fair draw says so, and ns-3's draw differs from the visualizer's, so its links differ too.

Then it repeats one experiment over ten seeds: 10 nodes at random in a 6 × 4 area, AODV, and three flows of ten packets. Each line is one seed, and the last line gives the mean with its standard deviation. A layout where no flow finds a route delivers 0 % and pulls the mean down, so the standard deviation is far larger than the gap between the two models.`,
)
