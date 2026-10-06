// Hand-written case study copy (SPEC.md §19.0), not generated. Every cost or property it states
// is quoted from the week reference it names; the scenario itself is illustrative.

export const scenario = `## The problem

*Illustrative scenario, set by Week 5's check question about volunteer search-and-rescue teams; the course references do not describe this camp.* Volunteers arrive at a disaster relief camp in three teams of three: 9, 4, and 2; 8, 6, and 3; and 7, 5, and 1. There is no DHCP server, so every radio has to get a unique address from the radios already there, and the network organizes itself into clusters. During the day the teams move around the camp, and the camp coordinator wants to know how often the clusters have to reorganize.

## What the network has to do

1. Give every volunteer a unique address without a server.
2. Group the radios into clusters, so control traffic stays local.
3. Keep those clusters together while people move, and say how often they had to change.

## Try it in the simulator

The camp starts with every address handed out by Buddy joins in arrival order, and with clusters elected by the highest-ID rule: heads 9, 8, and 7, with 6 and 5 as gateways. Open the Addresses view to see who holds which part of the 256 addresses.

Run Volunteer joins with 10 1. Radio 1 holds only its own address, and so does 7, so the newcomer has to ask 5. That is the uneven use of the address space Week 4 warns about.

Then run Advance the day for 20 ticks under each movement. With teams moving together the clusters hold, and no new head is elected; with everyone moving alone, members lose their heads. Finish with the Metrics run, which compares delivery under both movements on the same seed.
`

export const reasoning = `## Addresses without a server

Week 4 explains why DHCP does not fit: stateful allocation needs a server, but the topology keeps changing and a central server may be unreachable (Misra p. 337). Buddy splits the address space among the nodes instead. The node a newcomer contacts hands over half of its pool, and nobody else is asked (Misra pp. 338-339). MANETconf asks every node for permission (Misra pp. 337-338), and query-based DAD fails when the delay across a partition has no bound (Misra pp. 337-341). In a camp where teams wander out of range, asking nobody is the property that matters.

The price shows on the seed. Addresses were handed out where people arrived, so radio 1 ends up holding only its own address, and the next newcomer near 1 has to look further. Week 4 names exactly this weakness: the space is used unevenly when many newcomers join in one small area (Misra pp. 338-339).

## Clusters keep control traffic local

A flat network is simpler, but Week 1 notes that its scalability drops as nodes are added, because control messages spread through the whole network (Loo pp. 12-14). Highest-ID clustering elects a head in each neighborhood, and a radio that hears two heads becomes a gateway (Misra pp. 31-32).

## Test with movement that looks like the camp

Volunteers move as teams. Week 5 recommends group models for exactly that, naming SAR teams among them (Misra pp. 244-245), while random waypoint is easy to use but hard to match to any real scenario. Testing the camp with independent random waypoint movement makes members drift away from their heads, and the elections counter shows the cost.

## Report what someone else can check

Week 6 lists what a simulation report needs: the scenario, every parameter, the seeds, the number of runs, and results with their spread rather than a single mean (Loo pp. 60 and 81-82; Misra pp. 22 and 272-273). The simulator prints its seed in every metrics caption for that reason.
`
