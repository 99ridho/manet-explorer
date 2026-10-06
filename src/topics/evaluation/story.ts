// SPEC.md §20: the Scenario tab for §10.9. Hand-written; the network is the seed of SPEC §10.9.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    A: 'lamp at the west gate',
    B: 'lamp by the mosque',
    C: 'lamp by the school',
    D: 'lamp at the bridge',
    E: 'lamp at the market',
    F: 'lamp by the clinic',
    G: 'lamp by the pond',
    H: 'lamp at the east gate',
  },
  scenario: `*Illustrative scenario: the network here is eight nodes, A to H, and the story below gives those nodes a job. The course slides do not describe this village.*

## The situation

A village plans solar street lamps with small radios, so a fault report from any lamp can reach the village office. Before buying hundreds of lamps, the engineers test the plan on a model. Week 6 explains why: a real experiment with many nodes is expensive, and some setups cannot be tested in the field at all, so researchers simulate a simplified model first (Loo pp. 39 and 58).

To save battery, only a few lamps should stay awake and relay messages, while the rest sleep. Those awake lamps form a *backbone*.

## Who's who

- **A, H**: lamps at the west and east gates.
- **B, C**: lamps by the mosque and the school, on either side of the road.
- **D**: the lamp at the bridge, between the two halves of the village.
- **E**: the lamp at the market.
- **F, G**: lamps by the clinic and the pond.

## Why model first

A *unit disk graph* links two lamps when they are within range and never otherwise; it is simple, but even a small obstacle breaks it. A *quasi unit disk graph* adds a band where a link may or may not exist, to imitate small obstacles such as trees (Loo pp. 40-42). On whichever graph the model gives, a *connected dominating set* picks the backbone: every lamp is in the set or next to a member, and the members are connected. Finding the smallest one is NP-complete, so a local rule is used: Wu's marking process (Loo pp. 45-46) and Wu and Li's pruning rule (Misra pp. 128-129).

## Try this

1. Keep **Unit disk graph** selected. Choose **Build links** and press **Go** to see which lamps can hear each other.
2. Choose **Connected dominating set** and press **Go**. Watch lamps get marked as candidates, then watch B and F step down because a neighbor does their job. The backbone is C, D, E, G.
3. Switch to **Quasi unit disk graph** and run **Build links** again. Pairs in the uncertain band now depend on a random draw.
4. Choose **Metrics over seeds**, type \`5\`, and press **Go**. The same comparison runs on five layouts, and the whiskers show how much the result swings. q = 0.8 and the radius of 2 for this run are this demo's choices.

Read the **Why** line under each step. It says the reason for what happens.`,
}
