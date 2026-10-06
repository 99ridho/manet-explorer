// SPEC.md §20: the Scenario tab for §10.7. Hand-written; the network is the seed of SPEC §10.7.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    A: 'first laptop at the front table',
    B: 'laptop at the middle table',
    C: 'laptop at the back table',
  },
  scenario: `*Illustrative scenario: the network here is A, B, and C, with a second group P and Q, and the story below gives those nodes a job. The course slides do not describe this workshop.*

## The situation

A village library runs a weekend coding workshop, and the internet is down. The students' laptops still form an ad hoc network to share files, the kind of temporary local network Week 1 lists for meetings and classrooms (Loo pp. 8-9). Every laptop needs an address that no other laptop uses, or files would arrive at the wrong one. There is no router and no DHCP server to hand addresses out.

To keep every address on screen, this network has only 16 addresses, 1 to 16. That is this demo's choice.

## Who's who

- **A, B, C**: laptops at the front, middle, and back tables, already configured.
- **P, Q** (faded, on the right): two laptops in the reading room next door. They formed their own small network and chose their own addresses.
- **D** and any other new letter: a student who arrives late.

## Why this is hard

A server cannot be counted on in a network whose shape keeps changing (Misra p. 337). Two schemes from Week 4 avoid one:

- **Buddy** splits the address space among the nodes. A newcomer gets half of the pool held by the node it meets, so nobody else has to be asked. A node that leaves hands its pool back; a node that vanishes takes its pool with it (Misra pp. 338-339).
- **Query-based DAD** lets the newcomer pick an address at random and ask the whole network whether anyone uses it. Silence after several tries means the address is free. It cannot guarantee uniqueness while the network is split in two (Misra pp. 337-341).

## Try this

1. Keep **Buddy** selected. Choose **Join**, type \`D C\`, and press **Go**. C splits its range and D takes an address without asking anyone.
2. Choose **Leave**, type \`C\`, and press **Go**. C hands its addresses to B before it goes. Press **Reset** and try **Crash** with \`C\`: this time the addresses are lost.
3. The reading room opens its door. Choose **Merge partition** and press **Go**. Two pairs of laptops turn out to share an address, and each conflict is resolved by joining again.
4. Switch to **Query-based DAD** and run **Join** \`D C\`, then **Merge partition**. Count the AREQ and AREP messages in the **control** live field.

Read the **Why** line under each step. It says the reason for what happens.`,
}
