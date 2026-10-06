// SPEC.md §20: the Scenario tab for §10.4. Hand-written; the network is the Week 3 slide seed.
import type { TopicStory } from '@/types/story'

export const story: TopicStory = {
  cast: {
    A: "principal's phone",
    B: 'teacher in the library',
    D: 'teacher in the lab',
    E: 'teacher in the canteen',
    C: 'guard at the back gate',
    G: 'guard at the parking lot',
    F: 'teacher on the sports field',
  },
  scenario: `*Illustrative scenario: the course slides draw this network as nodes A to G, and the story below gives those nodes a job. The slides do not describe this school.*

## The situation

A school runs an evacuation drill with no Wi-Fi or phone signal. The principal (A) has to tell everyone on the grounds at once. The staff phones pass messages for each other, but each phone only reaches the phones near it, so the alarm has to be repeated along the way.

## Who's who

- **A**: the principal's phone, the source of the alarm.
- **B, D, E**: teachers in the library, the lab, and the canteen, in range of A.
- **C, G, F**: the guard at the back gate, the guard at the parking lot, and the teacher on the sports field, two hops from A.

## Why not let everyone repeat it

The simplest way is *blind flooding*: every phone that hears the alarm for the first time repeats it once. On a shared radio channel that causes redundant repeats, phones competing for the channel, and collisions (Misra pp. 122-123). With *multipoint relays* (MPRs), the principal's phone chooses the few neighbors that together reach everyone two hops away, and only those repeat the alarm (Misra pp. 126-127). The price: blind flooding is more reliable, precisely because everyone repeats (Misra pp. 139-142).

## Try this

1. Keep **MPR relays** selected. Choose **Select MPRs**, type \`A\`, and press **Go**. The gate guard (C) is reachable only through the library (B), and the parking lot (G) only through the lab (D), so B and D become relays. The canteen (E) stays silent.
2. Choose **Broadcast**, type \`A\`, and press **Go**. Count the transmissions and duplicates in the live fields.
3. Switch to **Blind flooding** and run **Broadcast** from \`A\` again. Every phone now repeats the alarm. Compare the counts: the same people hear it, at a higher cost.
4. Switch back to **MPR relays**. The lab loses contact with the sports field: choose **Remove link**, type \`D F\`, and press **Go**. A now needs the canteen (E) as a relay too.

Read the **Why** line under each step. It says the reason for what happens.`,
}
