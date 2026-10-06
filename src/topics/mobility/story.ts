// SPEC.md §20: the Scenario tab for §10.8. Hand-written; the network is the seed of SPEC §10.8.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    A: 'searcher, team 1',
    B: 'searcher, team 1',
    C: 'searcher, team 1',
    D: 'searcher, team 1',
    E: 'searcher, team 2',
    F: 'searcher, team 2',
    G: 'searcher, team 2',
    H: 'searcher, team 2',
  },
  scenario: `*Illustrative scenario: the network here is eight nodes, A to H, placed by seed 5, and the story below gives those nodes a job. The course slides do not describe this search.*

## The situation

A hiker is missing in a forest, and eight volunteers search for them, each with a radio. The radios pass messages for each other, so whether a message gets through depends on where everyone is standing at that moment. As the searchers walk, links appear and break.

Before choosing a routing protocol for this search, the organizers want to know how the network will behave. A simulation needs a *mobility model*: a rule for how the nodes move.

## Who's who

- **A, B, C, D**: the searchers of team 1.
- **E, F, G, H**: the searchers of team 2.

The area (10 × 6), the radio range (2.5), the speeds, and the pauses are this demo's choices; the Protocol tab lists them.

## Why the model matters

**Random waypoint** (RWP) lets each searcher walk alone to a random point, pause, and pick another. It is the most used model because it is simple, but it is hard to picture a real scenario that matches it, and it crowds nodes toward the middle of the area (Misra pp. 240-241). **Reference Point Group Mobility** (RPGM) moves each team's center along a path while its members wander a little around it, which fits real groups such as SAR teams (Misra pp. 244-245). The choice can reverse a conclusion: in one study AODV beat DSDV under random waypoint, and DSDV beat AODV under RPGM (Misra p. 249).

## Try this

1. Keep **Random waypoint** selected. Choose **Advance**, type \`10\`, and press **Go**. Watch the links that appear and break each tick, and read the summary at the end.
2. Advance another \`30\` ticks, then choose **Where nodes spend time** and press **Go**. Compare the share in the centre quarter with the 25 % an even spread would give.
3. Switch to **Group (RPGM)** and advance \`10\` ticks. Teams move together, so the links inside a team last longer. Compare the **changes** and **lasts** live fields.
4. Choose **Metrics run** and press **Go**. The same four message flows run under both models, and the bars compare delivery, delay, and overhead.

Read the **Why** line under each step. It says the reason for what happens.`,
}
