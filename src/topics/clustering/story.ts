// SPEC.md §20: the Scenario tab for §10.6. Hand-written; the network is the Week 4 slide seed.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    '9': 'radio at the north camp',
    '4': 'radio at the lake',
    '2': 'radio at the kitchen',
    '6': 'radio on the path',
    '8': 'radio at the south camp',
    '3': 'radio at the archery range',
    '5': 'radio at the first-aid post',
  },
  scenario: `*Illustrative scenario: the course slides draw this network as nodes numbered 9, 4, 2, 6, 8, 3, and 5, and the story below gives those nodes a job. The slides do not describe this camp.*

## The situation

A scout jamboree spreads over a large field with no phone signal. Seven scout leaders carry radios, and each radio has a serial number printed on it. If every radio talked to every other radio as an equal, every message would flood the whole field. Instead the radios split into small groups, each with one coordinator.

## Who's who

- **9, 4, 2**: radios at the north camp, the lake, and the kitchen.
- **6**: a radio on the path between the two camps.
- **8, 3, 5**: radios at the south camp, the archery range, and the first-aid post.

The numbers are the radios' ids, and the election uses them.

## Why form clusters

In a *hierarchical* network, a *cluster head* manages each cluster and links it to the others, which scales better than a flat network where every control message spreads everywhere (Loo 1.8.2, pp. 12-14). Finding the fewest cluster heads is NP-hard, so LCA uses a simple local rule: the node with the highest id among its undecided neighbors becomes a cluster head, and a node that hears two or more heads becomes a *gateway* (Misra pp. 31-32). The weak point: while a head is down, its cluster cannot reach the rest (Loo pp. 13-14).

## Try this

1. Keep **Highest ID** selected. Choose **Elect** and press **Go**. Radio 9 outranks its neighbors and becomes a head, then 8 does. Radio 6 hears both, so it becomes the gateway between the two camps.
2. The north camp's leader goes home. Choose **Node leaves**, type \`9\`, and press **Go**. Watch 6 join head 8, and 4 and 2 become heads of their own.
3. Press **Reset**, run **Elect** again, then choose **Node joins** and type \`7 6 8\`. A new radio arrives near the path and simply joins the head it can hear.
4. Switch to **Lowest ID** and run **Elect**. The same field ends up with many more, smaller clusters.

Read the **Why** line under each step. It says the reason for what happens.`,
}
