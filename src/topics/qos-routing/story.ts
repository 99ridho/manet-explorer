// SPEC.md §20: the Scenario tab for §10.10. Hand-written; the network is the Week 7 slide seed.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    A: 'village health post',
    B: 'relay on the school roof',
    C: 'relay on the water tower',
    D: 'relay on the hill',
    E: 'district hospital',
  },
  scenario: `*Illustrative scenario: the course slides draw this network as nodes A to E, and the story below gives those nodes a job. The slides do not describe these villages. The bandwidths, delivery ratios, and batteries on the links and nodes are this demo's example values.*

## The situation

A nurse at a village health post (A) wants a video call with a doctor at the district hospital (E). The call needs 3 Mbps. Between the two sit three solar-powered relays that pass traffic along. The shortest path is not automatically the right one: one link may be too slow for video, another may lose packets, and a relay may be low on battery.

## Who's who

- **A**: the village health post, where the call starts.
- **E**: the district hospital.
- **B, C**: relays on the school roof and the water tower, the long way round.
- **D**: a relay on the hill, the short way, with a slow, lossy link to the health post.

## Why the measure matters

A QoS route promises a level of service, such as a minimum bandwidth or a maximum delay (Misra pp. 282-284). Each measure picks a different path on the same network. Counting hops ignores link quality. *ETX* counts the expected transmissions, so a path of reliable links can beat a shorter path of weak ones. For energy, the path with the least total energy can still drain one critical relay first, so lasting longest is a different goal (Loo p. 203).

## Try this

1. Switch to **Hop count**. Choose **Find path**, type \`A E\`, and press **Go**. The fewest hops go through the hill relay D.
2. Switch to **Bandwidth** and run **Find path** with \`A E 3\`. The A-D link offers only 2 Mbps, so the call has to go the long way: A, B, C, E.
3. Switch to **ETX** and run **Find path** with \`A E\`. The long way needs fewer transmissions in total than the short, lossy one.
4. Choose **Send packets**, type \`20\`, and press **Go**. Relay B starts with the least battery and runs out at packet 20, which breaks the path.
5. Switch to **Energy**, run **Find path** \`A E\`, then send 20 packets. This path avoids B, and its weakest relay still has battery left.

Read the **Why** line under each step. It says the reason for what happens.`,
}
