// SPEC.md §11: generated from references/en/Week-3-Broadcast-Multicast-Geographic.md (§2 and the {#broadcast} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const realWorldUsage = `
Broadcast is the basis of communication in an ad hoc network, route discovery included (Misra chapter 6).

The radio makes broadcast expensive (Misra p. 99). A transmission reaches only the nodes in range, so a message still has to be forwarded (the medium is *semi-broadcast*); one transmission uses bandwidth up to twice the transmission range (the *interference area*); and bandwidth, processing power, and energy are far smaller than on a wired network. As a result, counting retransmissions matters much more here than on a wired network.

Multicast sends one data stream to a group of receivers. The wired protocols (PIM, DVMRP, CBT, MOSPF) were designed for wired networks and do not handle what a MANET brings: no infrastructure, the semi-broadcast medium, radio interference, limited resources, fast topology change, and mobility (Misra pp. 98-99).

Geographic routing uses node positions instead of routing tables. Geocast delivers to every node inside a region, and it is widely used to spread queries in sensor networks (Misra pp. 173-177).
`.trim()

export const coreMaterial = `
### 3.1 Broadcast without a storm

**Blind flooding** (Misra Figure 6.1, pp. 122-123). In *blind flooding*, every node that receives a packet for the first time rebroadcasts it at once. In a CSMA/CA network this causes three problems: *redundant rebroadcasts*, because every neighbor already has the packet; *medium contention*, because neighboring nodes compete for the channel at the same moment; and *collisions*, because broadcasts do not use RTS/CTS. On a four-node diamond where A broadcasts and B and C both rebroadcast, D receives two copies, although two transmissions (A, then B) would have reached everyone.

**Global and local approaches** (Misra 6.1.2, pp. 123-124, and p. 145). A global approach needs the whole network's topology to find the most energy-efficient broadcast tree; computing the optimal tree is NP-hard and maintaining it is unrealistic. A local approach needs only one- or two-hop neighbor information, is distributed (each node decides for itself), adapts when the topology changes, and performs close to the global approach. Every mechanism below is local.

**Heuristics** (Misra p. 124), from Ni et al. and Tseng et al. *Counter-based*: a node does not rebroadcast once it has heard the same packet a threshold number of times. *Distance- or location-based*: a node computes the extra area it would cover, which needs GPS or signal strength. *Probabilistic*: the node rebroadcasts at random, possibly weighted by node density or remaining battery. The more often a node hears the same packet, the less extra coverage its own rebroadcast adds. Heuristic performance depends heavily on the chosen parameters and thresholds.

**Neighbor coverage** (Misra pp. 125-126). Node j, receiving a packet from node i, computes its coverage set Cj = Nj minus Ni minus {i}. In *self-pruning*, if Cj is empty, i has already reached all of j's neighbors, so j does not rebroadcast. In *SBA*, the node with more neighbors goes first, through a delay of DNmax divided by Dj. In *dominant pruning*, the sender attaches to the packet the list of nodes that must forward it. Finding the minimum forwarding list is equivalent to *minimum set cover*, which is NP-complete, so a greedy heuristic is used. Two-hop information comes from beacons, and Misra lists six problems that make it less accurate (p. 125).

**Multipoint relays** (Misra pp. 126-127, Figure 6.2). A node chooses its MPRs with a greedy set cover:

| Step | What it does |
|---|---|
| 1 | Find the two-hop nodes reachable through only one neighbor; that neighbor becomes an MPR |
| 2 | Determine the set covered by the MPRs chosen so far |
| 3 | From the remaining neighbors, choose the one that covers the most uncovered two-hop nodes |
| 4 | Repeat from step 2 until every two-hop node is covered |

Example: node A has one-hop neighbors B, D, E and two-hop neighbors C, G, F. C is reachable only through B, and G only through D, so step 1 makes both B and D MPRs. D also covers F, so every two-hop node is now covered, E is not needed, and only B and D forward A's broadcasts. A node is *covered* by A if it receives a message that started at A, directly or through forwarding. OLSR uses this mechanism (Week 2). The weakness of MPR: the selection depends on the source, so a relay has to know who broadcast before it (p. 128).

**Dominating sets** (Misra 6.2.3, pp. 128-129). A *dominating set* is a set such that every node of the network is in it or neighbors a member. An *intermediate* node has two neighbors that are not neighbors of each other. Under Wu and Li's rules 1 and 2, a node is removed from the set if its neighbors are already covered by another neighbor with a larger ID; using neighbor degree instead of ID makes the set smaller. A node with a unique neighbor is always chosen, as with MPR. The term CDS returns in Week 6 as a topology control model.

**Clusters** (Misra 6.2.6, pp. 129-131, Figure 6.3). *Active clustering*: nodes exchange control messages to elect clusterheads, clusters form without waiting for data traffic, there is no formation delay, and the control overhead is the largest. *Passive clustering*: cluster formation rides on existing data traffic, neighbor information comes from promiscuous reception, there are no clusters before traffic flows, and it is frugal but has a delay before clusters form. In cluster-based broadcast only *clusterheads* and *gateways* rebroadcast. Clusterheads can be elected by lowest or highest ID; Week 4 goes deeper.

**Power control** (Misra 6.3, pp. 133-134). With adjustable transmit radius, the power needed grows with distance to the power alpha, with alpha between 2 and 6. Fewer nodes hear each transmission, so duplicates, contention, and collisions fall; the price is that one high-power transmission becomes two or more low-power ones. Misra's analogy (p. 134): in a crowded room it is better for everyone to whisper than to shout. The mechanism needs node coordinates from GPS or estimated from beacon signal strength.

**RNG and MST** (Misra pp. 134-137, Figures 6.4-6.7). In the RNG, two nodes are linked if the *lune* between them contains no other node. The MST is the connected graph with the smallest total edge weight; its broadcast paths are cheaper than the RNG's. The MST is a subgraph of the RNG, and the local MST lies between the two. A pure MST has no alternative paths, so it is not fault tolerant; the local MST restores part of that tolerance. The minimum transmit radius that keeps the network connected equals the longest edge of the MST (p. 137).

**Reliability** (Misra 6.4, pp. 139-142). Blind flooding is more reliable precisely because every node repeats the packet. The reliability of optimized broadcast drops sharply under background traffic. Schemes such as DCB use multiple forwarders and retransmission up to a retry limit. RMST uses the local MST plus 802.11 unicast to get RTS/CTS and MAC acknowledgment without changing the standard; the number of retransmissions before a timeout is usually 4 to 7.
`.trim()
