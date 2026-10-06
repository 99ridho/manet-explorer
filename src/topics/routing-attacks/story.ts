// SPEC.md §20: the Scenario tab for §10.11. Hand-written; the networks are the Week 8 slide seeds.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    S: 'aid volunteer in the field',
    A: 'volunteer radio',
    B: 'volunteer radio',
    C: 'volunteer radio',
    D: 'aid command post',
    M: 'radio taken over by an attacker',
    M1: 'attacker radio near the field',
    M2: 'attacker radio near the post',
  },
  scenario: `*Illustrative scenario: the course slides draw these networks as nodes S, A, B, C, D, and M (or M1 and M2), and the story below gives those nodes a job. The slides do not describe this operation.*

## The situation

After a storm, aid volunteers report supply needs from the field to a command post over a radio network that passes messages from radio to radio. The routing protocols from Weeks 2 and 3 assume every radio is honest (Misra chapter 18). Here one radio is not: an attacker has taken it over and wants the reports to disappear.

## Who's who

- **S**: a volunteer in the field, who sends the reports.
- **D**: the aid command post.
- **A, B, C**: honest volunteer radios along the real path.
- **M** (Black hole): a radio the attacker controls.
- **M1, M2** (Wormhole): two attacker radios, one near the field and one near the post, joined by a hidden link of their own.

## How the attacks work

A **black hole** claims a route to D that it does not have, so S sends its data through it, and it drops every packet without a trace (Misra pp. 460-461). A **wormhole** is two attackers who replay routing messages from one area in another, so the route through their tunnel looks shortest. Encryption does not stop it, because the traffic is only tunneled, not read (Misra pp. 461-462).

A **watchdog** is a defense: a node that hands a packet on keeps listening to check that the next node forwards it, and a node that keeps failing is reported and avoided (Misra pp. 444-445).

## Try this

1. Keep **Black hole** selected. Choose **Discover route** and press **Go**. M answers first with a short route it does not have, and S believes it.
2. Choose **Send packets**, type \`5\`, and press **Go**. Every report disappears at M, and nothing tells S.
3. Press **Randomize** to restore the scene (this topic has no random networks), run **Discover route** again, then choose **Send with watchdog** and type \`10\`. After M's fourth miss it is reported, and S switches to the honest route through A and B. The threshold of 3 is this demo's choice.
4. Switch to **Wormhole**, run **Discover route**, then **Send packets** \`5\`. Every report arrives, yet every one crossed the attackers' tunnel.
5. Switch to **No attacker** and repeat, to see the network as it should behave.

Read the **Why** line under each step. It says the reason for what happens.`,
}
