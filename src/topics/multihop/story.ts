// SPEC.md §20: the Scenario tab for §10.1. Hand-written; the network is the Week 1 slide seed.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    A: 'rooftop router, house A',
    B: 'rooftop router, house B',
    C: 'router by the riverbank',
    D: 'router across the river',
    E: 'rooftop router, house E',
    F: 'rooftop router, house F',
  },
  scenario: `*Illustrative scenario: the course slides draw this network as nodes A to F, and the story below gives those nodes a job. The slides do not describe this neighborhood.*

## The situation

Six households on two sides of a river share one community network. Each house has a small Wi-Fi router on its roof, and the routers pass traffic for each other, so no internet company has to lay a cable. Week 1 gives a real example of this kind of network: the open community networks of Berlin and Leipzig (Misra chapter 1).

Houses A, B, and C stand on one bank, and D, E, and F on the other. Only the routers at C and D are close enough to reach across the water.

## Who's who

- **A, B**: rooftop routers on the near bank.
- **C**: the router by the riverbank.
- **D**: the router just across the river.
- **E, F**: rooftop routers on the far bank.

## Why this matters

A message from A to F cannot jump straight across. It hops from router to router, and every router works as both a host and a router (Loo p. 5). Some routers and links matter more than others: a *bridge* is a link whose loss splits the network, and an *articulation point* is a router whose loss does the same (Misra Definition 1.4, p. 6). In the real Berlin network so many links were bridges that route discovery often failed (Misra pp. 16 and 22).

## Try this

1. Choose **Build links** and press **Go**. Each pair of routers is checked: close enough, a link; too far, none. With **Unit disk** the links match the slide exactly.
2. Choose **Find bridges** and press **Go**. Step through the search and watch it find the weak spots: the link across the river, C-D, and the two routers at its ends, C and D.
3. Choose **Link ETX**, type \`C D 0.8 0.5\`, and press **Go**. Rain over the river makes the C-D link drop packets. The step shows how many tries one delivery takes on average.
4. Switch to **Shadowing** and run **Build links** again. Walls and trees now weaken each signal by a random amount, so some links appear or vanish.

Read the **Why** line under each step. It says the reason for what happens.`,
}
