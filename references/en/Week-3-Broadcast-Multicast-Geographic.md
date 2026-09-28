---
week: 3
title: Broadcast, Multicast, and Geographic Routing
source: references/id/minggu-03.md
status: draft
books:
  - Misra, Woungang & Misra (2009), Guide to Wireless Ad Hoc Networks, chapters 5, 6, and 7
---

# Week 3: Broadcast, Multicast, and Geographic Routing

Course: Integrasi Jaringan Mandiri/Mobile, Universitas Negeri Jakarta
Lecturer: Muhammad Ridho Kurniawan Pratama, M.T.I.

Translated from the Week 3 slides. Every claim carries the book and page the slide cites. This file is a draft until the lecturer reviews it (SPEC.md Section 11).

---

## 1. Learning Outcomes

After this week, a student can:

- Explain the broadcast storm and the local mechanisms that reduce it, including MPR selection.
- Compare tree-based and mesh-based multicast, and flat and overlay structures.
- Trace greedy geographic forwarding and explain how a packet gets around a void.

---

## 2. Real-World Usage

Broadcast is the basis of communication in an ad hoc network, route discovery included (Misra chapter 6). Every RREQ of Week 2 is a broadcast, so the cost of broadcasting is paid on every route discovery.

The radio makes broadcast expensive (Misra p. 99). A transmission reaches only the nodes in range, so a message still has to be forwarded (the medium is *semi-broadcast*); one transmission uses bandwidth up to twice the transmission range (the *interference area*); and bandwidth, processing power, and energy are far smaller than on a wired network. As a result, counting retransmissions matters much more here than on a wired network.

Multicast sends one data stream to a group of receivers. The wired protocols (PIM, DVMRP, CBT, MOSPF) were designed for wired networks and do not handle what a MANET brings: no infrastructure, the semi-broadcast medium, radio interference, limited resources, fast topology change, and mobility (Misra pp. 98-99).

Geographic routing uses node positions instead of routing tables. Geocast delivers to every node inside a region, which suits a warning to every node in a district (Misra pp. 175-176), and it is widely used to spread queries in sensor networks.

---

## 3. Core Material

### 3.1 Broadcast without a storm {#broadcast}

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

Example: node A has one-hop neighbors B, D, E and two-hop neighbors C, G, F. C is reachable only through B, so B becomes an MPR. Of the rest, D covers G and F, so D becomes an MPR. Every two-hop node is now covered, so E is not needed, and only B and D forward A's broadcasts. A node is *covered* by A if it receives a message that started at A, directly or through forwarding. OLSR uses this mechanism (Week 2). The weakness of MPR: the selection depends on the source, so a relay has to know who broadcast before it (p. 128).

**Dominating sets** (Misra 6.2.3, pp. 128-129). A *dominating set* is a set such that every node of the network is in it or neighbors a member. An *intermediate* node has two neighbors that are not neighbors of each other. Under Wu and Li's rules 1 and 2, a node is removed from the set if its neighbors are already covered by another neighbor with a larger ID; using neighbor degree instead of ID makes the set smaller. A node with a unique neighbor is always chosen, as with MPR. The term CDS returns in Week 6 as a topology control model.

**Clusters** (Misra 6.2.6, pp. 129-131, Figure 6.3). *Active clustering*: nodes exchange control messages to elect clusterheads, clusters form without waiting for data traffic, there is no formation delay, and the control overhead is the largest. *Passive clustering*: cluster formation rides on existing data traffic, neighbor information comes from promiscuous reception, there are no clusters before traffic flows, and it is frugal but has a delay before clusters form. In cluster-based broadcast only *clusterheads* and *gateways* rebroadcast. Clusterheads can be elected by lowest or highest ID; Week 4 goes deeper.

**Power control** (Misra 6.3, pp. 133-134). With adjustable transmit radius, the power needed grows with distance to the power alpha, with alpha between 2 and 6. Fewer nodes hear each transmission, so duplicates, contention, and collisions fall; the price is that one high-power transmission becomes two or more low-power ones. Misra's analogy (p. 134): in a crowded room it is better for everyone to whisper than to shout. The mechanism needs node coordinates from GPS or estimated from beacon signal strength.

**RNG and MST** (Misra pp. 134-137, Figures 6.4-6.7). In the RNG, two nodes are linked if the *lune* between them contains no other node. The MST is the connected graph with the smallest total edge weight; its broadcast paths are cheaper than the RNG's. The MST is a subgraph of the RNG, and the local MST lies between the two. A pure MST has no alternative paths, so it is not fault tolerant; the local MST restores part of that tolerance. The minimum transmit radius that keeps the network connected equals the longest edge of the MST (p. 137).

**Reliability** (Misra 6.4, pp. 139-142). Blind flooding is more reliable precisely because every node repeats the packet. The reliability of optimized broadcast drops sharply under background traffic. Schemes such as DCB use multiple forwarders and retransmission up to a retry limit. RMST uses the local MST plus 802.11 unicast to get RTS/CTS and MAC acknowledgment without changing the standard; the number of retransmissions before a timeout is usually 4 to 7.

### 3.2 Multicast in mobile networks

**Membership** (Misra pp. 98-99). A node that wants a given stream announces itself with a *join* message; a node no longer interested leaves with a *leave* message.

**Tree and mesh** (Misra 5.3.1, pp. 102-104). A tree has one path from the source to each receiver; a *source tree* is one tree per source and group pair, a *shared tree* one tree for the whole group; a few broken links can cut off a large part of a tree. A mesh has several paths from sender to each receiver, so data can arrive by different paths; it tolerates topology change better and uses more bandwidth than a tree. With a shared tree the source need not be part of the structure; it only needs an entry point such as the root or the nearest tree member. Misra chapter 4 adds that tree protocols give lower end-to-end delay than mesh protocols.

**Flat and overlay** (Misra p. 103). In a flat structure every node can help build the multicast structure, every node must know the multicast protocol, and multicast data is sent by broadcast (ODMRP, MOLSR, MAODV). In an overlay only group members build a virtual structure, other nodes just forward encapsulated data, and the structure uses acknowledged *unicast tunnels* (MOST, AMRoute). An overlay tolerates failures better and is more reliable, because unicast has acknowledgments that broadcast lacks.

| Protocol | Structure | Flat or overlay | Standalone |
|---|---|---|---|
| MOLSR | Source tree | Flat | No, needs OLSR |
| MAODV | Shared tree | Flat | No, needs AODV |
| ODMRP | Mesh | Flat | Yes |
| MOST | Shared tree | Overlay | No, needs OLSR |

(Misra Table 5.1, p. 104. The original also lists FGMP and MCEDAR as mesh and flat, AMRoute as shared tree and overlay, and DDM as source tree and flat.)

**ODMRP** (Misra 5.3.2.1, pp. 104-105, Figure 5.2). The source periodically floods a Join Query, and each node records where it came from. Receivers answer with a Join Reply along the reverse path, and the nodes the Join Reply passes become the *forwarding group*: only they forward multicast data. There is no leave message: a receiver simply stops replying, and nodes that are no longer refreshed drop out of the mesh. ODMRP is standalone, needs no unicast protocol underneath, and can also be used for unicast. A node processes a Join Reply only if its address is in the message's next-hop list.

**MOLSR** (Misra pp. 105-106, Figure 5.3) builds one tree per source and group from OLSR's topology knowledge. SOURCE_CLAIM: the source announces itself through OLSR's optimized flooding. CONFIRM_PARENT: a group member chooses its next hop toward the source as its parent and sends this message. LEAVE: a leaf that leaves tells its parent, and unused branches remove themselves. Branches are built backward from members to the source, and OLSR's control messages detect topology changes, which trigger tree updates.

**MAODV** (Misra pp. 106-108, Figure 5.4) builds one shared tree per group with AODV-like messages: RREQ looks for the tree, RREP answers, and MACT activates the chosen route. A group leader holds the group sequence number and broadcasts it in Group Hello messages. To repair a branch, the downstream node searches again with an *expanding ring search* toward a member closer to the leader. A node that asks to join and gets no answer after some attempts makes itself group leader; only leaf nodes may prune themselves.

**MOST** (Misra pp. 108-109) is an overlay protocol on OLSR. Each member computes the group's *minimum shared spanning tree* itself with Prim's algorithm, which requires every member to have the same view of the topology, so neighbor lists are announced. A leaving node keeps forwarding during a transition period so the tree does not break. The tree's edges are unicast tunnels, and the tree is recomputed periodically.

**Choosing and measuring** (Misra 5.2, pp. 100-102). Define the problem first: the number of groups, client density per group, number of sources and their traffic rate; the QoS, delivery reliability, and mobility support required; and whether the protocol stands alone or needs a particular unicast protocol. If nearly every node is a group member, optimized broadcast is better than multicast, and many groups and sources hurt protocols that build a structure per source and group. Performance criteria are delivery ratio and sustainable throughput, delay, overhead (bandwidth, memory for control state, algorithmic complexity), and the time to add a member, remove one, and recover from topology change. Misra notes that no IETF document yet recommends a single MANET multicast protocol (p. 109).

### 3.3 Routing with coordinates {#geographic-routing}

**Two assumptions** (Misra pp. 154-155). Every node knows its position, from GPS or from relative coordinates found by localization, and the source knows the destination's position, written in the packet header so intermediate nodes know it too. A *location service*, centralized or distributed, keeps positions up to date. Without one, the source can flood a search packet and the destination answers with its position; in a sensor network a static sink can broadcast its position once.

**Localization** (Misra pp. 154-155, Figure 7.1). An *anchor* (also *beacon* or *landmark*) is a node that knows its position. *Lateration* needs distances to three non-collinear anchors for a 2D position and four for 3D. Distance comes from signal strength or time-difference of arrival. With no anchor at all, nodes build a local coordinate system from trigonometric relations among themselves.

**Greedy forwarding** (Misra pp. 157-158, Figure 7.2). S learns its neighbors' positions from periodic beacons and D's position from the packet header. Next-hop criteria include *MFR*, the neighbor with the most progress toward D, which minimizes hop count; *NFP*, the nearest neighbor that still makes progress, which reduces collisions when transmit power is adjustable; and a random choice among neighbors that make progress. A neighbor that does not move toward D is never chosen.

| Criterion | Basis | Goal |
|---|---|---|
| MFR | Largest progress | Fewer hops |
| NFP | Nearest that still progresses | Fewer collisions |
| Random | Random among those that progress | Balance progress and reliability |
| Compass | Direction closest to the S-D line | Shorter spatial distance |
| MAR | Largest distance advance | Fewer hops, loop-free |
| NC | Nearest that is closer to the destination | Fewer collisions, loop-free |

(Misra pp. 157-161 and Table 7.1, p. 162.) *Progress* is measured by projection onto the S-D line; *advance* by the reduction in distance to the destination. Other criteria in the book's table use remaining energy and packet error rate.

**Progress-based criteria can loop** (Misra pp. 158-159, Figure 7.3). If A and B are neighbors and each has positive progress relative to the other, A chooses B, B chooses A, and the packet circles between them. Advance-based criteria such as MAR and NC do not have this problem, because the distance to the destination shrinks at every hop. The delivery guarantee here is at the topology level only; MAC collisions and congestion are not considered.

**Voids** (Misra 7.3.2, pp. 161-165, Figures 7.4-7.6). When S is closer to D than all its neighbors, greedy forwarding cannot progress, even though a path exists around the gap. Planar-graph solutions follow the edges of a *face* of the graph with the right-hand rule. A wireless graph must first be planarized, for example with the RNG or the Gabriel graph; GPSR uses this as *perimeter routing*. Greedy mode resumes once the packet reaches a node closer to D than the node where the void occurred. There are six categories of void solutions: planar-graph, topology-based, link reversal, geometric, heuristic, and hybrid.

**Before going around** (Misra pp. 161-162). A *transient* void appears because a node is asleep, a collision happened, or a node has not yet come into range; it only adds delay and disappears as conditions change. Flooding is the simplest fix for a void, guaranteed to deliver but wasteful. Planarization is needed because wireless network graphs are generally not planar; without it, the walked path can contain loops.

**Coordinates for groups** (Misra 7.4, pp. 173-177, Figures 7.12 and 7.13). In geographic multicast, packets are copied at intermediate nodes and the tree forms on the way rather than in advance; a node can be a *void node* for one destination and not for another. In geocast, every node in a region receives the packet, and the header only needs the region's coordinates; once inside the region, the packet usually spreads by *region flooding*. Flooding-based geocast protocols include LBM and GeoGRID; unicast-based ones include GeoTORA and GAMER.

**What each approach pays** (Misra 7.2, pp. 153-154):

| Aspect | Topology-based (AODV, OLSR) | Geographic routing |
|---|---|---|
| Information used | Link connectivity | Node and destination positions |
| Routing table | Needed | Not needed; a neighbor table is enough |
| When the topology changes | Routes must be updated | Matters only if the sender's neighbors change |
| Extra requirements | Control messages for routes | GPS or localization, plus a location service |
| Weak point | Control overhead | Voids and position error |

Misra also notes that designing a location service for highly mobile nodes can be harder than geographic forwarding itself.

---

## 4. Summary

| Idea | Core point |
|---|---|
| Broadcast storm | Blind flooding is wasteful but the most reliable |
| Local approaches | One- or two-hop information is enough to cut rebroadcasts |
| MPR and dominating sets | Two ways to choose who may forward |
| Tree and mesh | Bandwidth savings against tolerance of broken links |
| Greedy and voids | Positions replace routing tables, at the price of void handling |

Week 4 approaches clusters and dominating sets from another side: how nodes organize themselves, and what happens when some nodes refuse to cooperate.
