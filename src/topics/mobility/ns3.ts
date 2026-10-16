// SPEC.md §7.3: the ns-3 tab. The script and its output come from ns3/; the notes say where they meet the visualizer.
import { ns3Script } from '@/lib/ns3'

export const mobilityNs3 = ns3Script(
  'mobility',
  `The script moves 8 nodes with ns-3's random waypoint model, or in two groups built from ns-3's hierarchical model: a reference point that walks the four corners and members that wander within 1 unit of it. It samples positions once a second for 200 s and reports how often links changed, how long a link lasted, how many node pairs had a path, and the share of time spent in the centre quarter.

Under RPGM the reference points walk the edge of the area, so nobody enters the centre quarter, and the two groups stay at opposite corners, so no link ever changes. Under random waypoint the nodes crowd toward the middle, the effect **Where nodes spend time** shows. The numbers differ from the visualizer's because ns-3 draws its own random stream.`,
)
