// SPEC.md §20: the Scenario tab for §10.3. Hand-written; the network is the Week 2 slide seed.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    S: 'volunteer at the riverbank',
    A: 'volunteer on the bridge',
    B: 'volunteer at the mosque',
    C: 'volunteer at the school',
    E: 'volunteer at the market',
    D: 'field clinic',
  },
  scenario: `*Illustrative scenario: the course slides draw this network as nodes S, A, B, C, E, and D, and the story below gives those nodes a job. The slides do not describe this village.*

## The situation

A river has flooded a village, and the phone towers are down. Volunteers spread across the village carry handheld radios that can pass messages for each other. A radio reaches only the radios close to it, so a message to someone far away has to hop from radio to radio.

The volunteer at the riverbank (S) finds an injured person and needs to tell the field clinic (D). S cannot reach D directly. The message has to go through other volunteers, and nobody has a map of who can hear whom.

## Who's who

- **S**: the volunteer at the riverbank, who has the message.
- **D**: the field clinic, which needs it.
- **A, B, C, E**: volunteers at the bridge, the mosque, the school, and the market. Their radios pass messages along.

## Why search only when needed

Most of the time nobody is sending anything. A reactive protocol such as AODV or DSR finds a route only when a radio has data, so the radios stay quiet in between; the price is a wait before the first message goes out (Loo 2.2-2.3, pp. 20-22). The other family, proactive protocols, keeps every route ready all the time and pays for it with regular control messages even when no one sends data.

## Try this

1. Keep **AODV** selected. Choose **Discover route**, type \`S D\`, and press **Go**. Step through with the arrow keys. Watch S ask everyone in range, then watch each radio pass the request on once and ignore the copies it hears again. The live fields count the RREQ transmissions.
2. When the request reaches D, watch the answer (the RREP) travel back. Each radio it passes learns one thing: which neighbor leads to D.
3. Choose **Send data**, type \`S D\`, and press **Go**. The message follows the route hop by hop, and each radio checks only its own table.
4. The volunteer at the school walks away from the clinic. Choose **Break link**, type \`C D\`, and press **Go**. Watch the RERR warn the radios that still rely on that link.
5. Run **Discover route** \`S D\` again. The new route avoids the school.
6. Switch to **DSR** and repeat. This time the request carries a list of every radio it passed, and the data packet carries the whole route in its header.

Read the **Why** line under each step. It says the reason a radio does what it does.`,
}
