// SPEC.md §20: the Scenario tab for §10.2. Hand-written; the network is the Week 2 slide seed.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    M1: 'registration tent',
    M2: 'triage tent',
    M3: 'pharmacy tent',
    M4: 'surgery tent',
    M5: 'kitchen tent',
    M6: 'supply tent',
  },
  scenario: `*Illustrative scenario: the course slides give this network as the table of node M2 for nodes M1 to M6, and the story below gives those nodes a job. The slides do not describe this field hospital.*

## The situation

After an earthquake, a field hospital is set up in six tents. Each tent has a radio, and the radios pass messages for each other. The tents stay where they are for days, and a nurse who needs medicine from the pharmacy should not wait while the network searches for a route.

## Who's who

- **M1**: the registration tent.
- **M2**: the triage tent, whose routing table you see under the network.
- **M3**: the pharmacy tent.
- **M4**: the surgery tent.
- **M5**: the kitchen tent.
- **M6**: the supply tent.

## Why keep every route ready

A proactive protocol such as DSDV keeps a route to every tent at all times, so a message can leave the moment someone sends it. Loo calls proactive routing best for networks whose nodes rarely or never move (Loo 2.2-2.3, pp. 20-22). The price is steady control traffic: tables go out periodically and whenever something important changes, and Loo notes that this overhead is why DSDV does not suit large networks (Loo p. 28).

DSDV keeps routes fresh with *sequence numbers*. Each tent stamps news about itself with a number it raises over time, and a route with a newer number replaces an older one (Misra pp. 66-67).

## Try this

1. Keep **Incremental** selected. Choose **Advertise**, type \`M4\`, and press **Go**. M4's tables are already up to date, so it has nothing new to say.
2. The pharmacy moves next to the supply tent. Choose **Move node**, type \`M3 M6\`, and press **Go**. Watch M3 lose its old neighbor, raise its sequence number, and the news spread tent by tent. At the end, the triage tent (M2) reaches the pharmacy through M4 in 3 hops.
3. Press **Reset**, switch to **Full dump**, and move M3 next to M6 again. Compare the **rowsSent** live field: a full dump repeats rows that did not change (Misra p. 66).
4. Use the buttons under the network to read another tent's table.

Read the **Why** line under each step. It says the reason for what happens.`,
}
