// SPEC.md §20: the Scenario tab for §10.5. Hand-written; the network is the Week 3 slide seed.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    S: 'sensor on the north shore',
    F: 'sensor by the boathouse',
    A: 'sensor on the west shore',
    B: 'sensor on the south shore',
    C: 'sensor by the dam',
    E: 'sensor on the east shore',
    D: 'gateway at the farm office',
  },
  scenario: `*Illustrative scenario: the course slides draw this network as nodes S, A to F, and D, and the story below gives those nodes a job. The slides do not describe this reservoir.*

## The situation

A farm watches its water with small sensors placed around a reservoir. Each sensor has a GPS chip, so it knows where it is, and every reading goes to a gateway at the farm office (D). The sensors keep no routing tables. Each one only knows where its neighbors are and where the gateway is.

The reservoir sits between the north shore and the gateway. No sensor floats on the water, so the straight line from S to D crosses an empty gap.

## Who's who

- **S**: the sensor on the north shore, which has a reading to send.
- **D**: the gateway at the farm office.
- **F**: a sensor by the boathouse, northwest of S.
- **A, B, C, E**: sensors on the west shore, the south shore, by the dam, and on the east shore.

Hover over a node to see its position and its distance to D.

## Why route by position

A sensor that knows positions needs only a neighbor table, not a routing table, and a topology change matters only when its own neighbors change (Misra 7.2, pp. 153-154). The simple rule is *greedy forwarding*: hand the packet to the neighbor closest to the destination. It fails at a *void*, a gap where no neighbor is closer, even though a path around the gap exists. GPSR then walks around the gap's edge (perimeter mode) and goes back to greedy once the packet is closer than where it got stuck (Misra 7.3.2, pp. 161-165).

## Try this

1. Keep **Greedy with perimeter** selected. Choose **Route**, type \`S D\`, and press **Go**. Watch S find that both of its neighbors are farther from D than S itself: the reservoir is in the way.
2. Step on and watch the packet walk clockwise along the shore, S, A, B, C, until C is closer to D than S was. From there greedy forwarding takes it to E and D.
3. Switch to **Greedy only** and route \`S D\` again. The packet is dropped at S, although a path exists.
4. Press **Randomize** and route between the two nodes it marks, to see whether that network has a void.

Read the **Why** line under each step. It says the reason for what happens.`,
}
