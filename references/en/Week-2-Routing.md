---
week: 2
title: Routing in MANETs
source: references/id/minggu-02.md
status: reviewed
books:
  - Loo, Lloret & Ortiz (2012), Mobile Ad Hoc Networks, chapter 2 (pp. 19-36)
  - Misra, Woungang & Misra (2009), Guide to Wireless Ad Hoc Networks, chapter 4 (pp. 59-96)
---

# Week 2: Routing in MANETs

Course: Integrasi Jaringan Mandiri/Mobile, Universitas Negeri Jakarta
Lecturer: Muhammad Ridho Kurniawan Pratama, M.T.I.

Translated from the Week 2 slides. Every claim carries the book and page the slide cites. This file is a draft until the lecturer reviews it (SPEC.md Section 11).

---

## 1. Learning Outcomes

After this week, a student can:

- Explain why wired routing is not enough: a MANET's topology changes, links can work in one direction only, and there is no central control.
- Tell proactive, reactive, and hybrid routing apart: when routes are prepared, and what the overhead costs.
- Trace AODV route discovery, from the flooded RREQ to the RREP that returns to the source.
- Choose a protocol for a scenario by mobility, network size, and traffic pattern.

---

## 2. Real-World Usage

In a MANET there are no dedicated routers. A node that sends data also forwards packets for other nodes, and every host takes part in finding and maintaining routes (Loo 2.6, pp. 31-32).

Routing only becomes a problem when there is a choice. With three nodes in a line, A and C each know B, so both simply use B, and no routing protocol is needed (Misra Example 4.1, pp. 61-62). Add a fourth node D, and a packet from A to C can go A-B-C, A-D-C, A-D-B-C, or A-B-D-C; now a protocol must pick one path and update it as nodes move (Misra Example 4.2, pp. 62-63). Misra stresses that giving every node the full topology is not efficient for a MANET.

Where the protocols fit (Misra 4.4, pp. 88-89): in a network that is relatively static, proactive protocols are efficient because keeping the topology pays off; as mobility rises, reactive protocols work better, and they are also preferred under heavy traffic. Misra suggests AODV, DSR, and OLSR for small networks and TORA, LANMAR, and ZRP for large ones, and concludes that no single protocol suits every situation and that a hybrid approach is often the right one. Militaries move in groups, and Misra names LANMAR and OLSR as suited to group movement (pp. 86-87).

---

## 3. Core Material

### 3.1 Why MANET routing is hard {#proactive-routing #reactive-routing}

**Design requirements** (Misra 4.3.1, pp. 63-64).

- *Distributed.* Each node makes routing decisions with its neighbors; there is no central entity to wait for. Misra adds that a protocol that is distributed but virtually centralized can be a good idea.
- *Ready for one-way links.* The radio's physical conditions can make a link work in one direction only, so a protocol must not assume every link is two-way.
- *Power-aware.* The routing load should be spread evenly over the participating nodes, because they all run on batteries.
- *Security-aware.* The wireless medium is easy to attack, so authentication, non-repudiation, and encryption are needed.
- *Leaning hybrid.* Misra suggests protocols be more reactive than proactive to keep overhead down.
- *QoS-aware.* A protocol should know a route's delay and throughput and estimate how long the route will last.

No single protocol meets all of these at once.

**Three techniques behind every protocol** (Loo 2.1, p. 20, Figure 2.1). *Hop count*: each node keeps the next hop toward each destination in its routing table. *Link state*: each node keeps the full topology and computes shortest paths from link costs. *Source routing*: every data packet carries its own route in its header. The two base algorithms are Bellman-Ford for distance vector and Dijkstra for link state (Loo p. 32).

**Proactive and reactive** (Loo 2.2-2.3, pp. 20-22; Misra 4.3.2, pp. 64-65). A *proactive* (table-driven) protocol keeps a route to every destination in its table, spreads the topology periodically and on change, and pays a high control overhead that runs even with no data; it suits networks with low mobility, and Loo calls it best for networks whose nodes rarely or never move. A *reactive* (on-demand) protocol looks for a route only when a source has data, discovers it by flooding an RREQ, has low overhead but a delay before the first packet goes out, and maintains the route until it is no longer used.

| Aspect | Proactive | Reactive | Hybrid |
|---|---|---|---|
| Network organization | Flat or hierarchical | Flat | Hierarchical |
| Topology dissemination | Periodic | On demand | Both |
| Route latency | Always available | Discovery delay | Both |
| Mobility handling | Periodic updates | Route maintenance | Both |
| Communication overhead | High | Low | Medium |

(Loo Table 2.1, p. 23)

**By receiver** (Misra 4.3.2, pp. 65-66). *Unicast*: one source to one destination. *Multicast*: one transmission for a group of destinations, copied only where paths branch. *Geocast*: every node inside a geographic region receives it. Multicast protocols are tree-based or mesh-based: a mesh uses several routes, a tree only one, and a tree's delay is lower. Week 3 covers all three.

### 3.2 Proactive protocols: DSDV, WRP, CGSR, FSR, OLSR {#proactive-routing}

DSDV, WRP, CGSR, FSR, and OLSR keep a route to every destination at all times; they differ in how they spread topology information (Loo 2.5.4-2.5.5; Misra 4.3.3.1, pp. 66-74).

**DSDV** (Misra pp. 66-67; Loo p. 28). DSDV is Bellman-Ford adapted to MANETs. Every node keeps every destination with its hop count and a *sequence number* created by the destination. A route with a newer sequence number replaces an older one, which prevents loops and stale routes. Tables are sent periodically, and sent at once when something important changes. Loo lists the weaknesses (p. 28): the overhead is large, so DSDV does not suit large networks, and DSDV works only with two-way links.

Node M2's forwarding table in Misra Example 4.3 (p. 67):

| Destination | Next hop | Metric | Sequence number |
|---|---|---|---|
| M1 | M1 | 1 | S593_M1 |
| M2 | M2 | 0 | S983_M2 |
| M3 | M3 | 1 | S193_M3 |
| M4 | M4 | 1 | S233_M4 |
| M5 | M4 | 2 | S243_M5 |
| M6 | M4 | 2 | S053_M6 |

The original table also has an *install time* column, used to delete stale routes, and a *stable data* column. If M3 moves close to M6, only M2's row for M3 changes, and M2 learns of it through M4.

**Full dump and incremental updates** (Misra p. 66). A full dump sends the whole routing table to the neighbors; it goes out rarely while nodes stay put, is used again when nodes move often, and is expensive in bandwidth. An incremental update sends only the changed entries, suits a fairly stable network, and avoids needless traffic, but under high mobility it swells toward the size of an NPDU. When nodes move often, the incremental update approaches the NPDU size, so a full dump makes more sense (Misra's question 3, p. 92).

**WRP** (Misra pp. 67-69). WRP is a *path-finding* algorithm: a shortest-path algorithm that also keeps the second-to-last hop. Each node keeps four data structures, including a distance and routing table (the distance to each destination through each neighbor, plus the predecessor and successor on the chosen path), a link-cost table (the relay cost through each neighbor and the time since its last message), and a message retransmission list (MRL) that records neighbors that have not acknowledged an update so it can be resent. Keeping predecessor and successor helps detect loops and avoid *count-to-infinity* (p. 68). With no change, a neighbor sends an empty Hello to show it is still connected.

**CGSR** (Misra pp. 69-70, Example 4.4, Figure 4.5). CGSR treats the network as clusters. A cluster head is chosen by an election algorithm, and each node keeps a cluster member table. A gateway is a node within range of two or more cluster heads. A packet goes from a node to its cluster head, to a gateway, to the next cluster head, and on to the destination. CGSR runs on DSDV, so its overhead equals DSDV's; frequent cluster-head changes consume resources.

**GSR and FSR** (Misra pp. 70-71, Example 4.5, Figure 4.6). GSR exchanges link-state vectors with neighbors only, without flooding; FSR builds on GSR. The fisheye idea: a node has the most accurate information about nodes close to it, and updates about distant nodes less often. A *scope* is the set of nodes reachable within a given number of hops from the center node. As a packet nears its destination, the route information available becomes more accurate. FSR shrinks update messages without giving up being proactive.

**OLSR** (Loo 2.5.4, pp. 26-28; Misra pp. 73-74). Each node sends Hello messages with TTL 1 to learn its one-hop neighbors. From them it chooses its *multipoint relays* (MPRs): a subset of neighbors enough to reach every two-hop neighbor. MPRs are chosen among one-hop neighbors with two-way links. Only MPRs forward topology information, and every node computes shortest paths with Dijkstra. MPRs play two roles (Loo p. 28): only a node's MPRs forward its broadcast packets, which cuts retransmissions, and an MPR announces the list of nodes that chose it (its *selectors*) to the whole network, which cuts packet size. This is why OLSR is much cheaper than pure link state, which floods every link.

### 3.3 Reactive protocols: AODV, DSR, TORA {#reactive-routing}

AODV, DSR, and TORA look for a route only when a source has data; the cost moves from periodic messages to a discovery delay (Loo 2.5.1-2.5.3; Misra 4.3.3.2, pp. 73-79).

**AODV route discovery** (Misra p. 78, Example 4.11; Loo p. 23). S wants to send to D but has no route, so S broadcasts an RREQ. Every node that receives the RREQ for the first time records which neighbor it came from and broadcasts it again. Later copies are dropped. The recorded neighbors form the *reverse path* to S. D answers with an RREP sent as unicast along the reverse path, and every node on that path now keeps the next hop toward D. AODV uses the *destination sequence number* to pick the most recent route. Loo (p. 23) notes a weakness: an intermediate node can keep a stale entry if its sequence number is higher but not the latest.

**AODV route maintenance** (Loo p. 23). When a link in the middle of a route breaks, the nodes at both ends of the broken link send an RERR to the ends of the route. The end nodes delete the route entries that use that link. The source starts a new discovery with a new broadcast ID and the destination's previous sequence number. AODV does not repair the route locally, unlike CBRP and NAMP in Misra (pp. 77 and 83). Route entries that are not used soon are deleted by a timer.

**AODV and DSR compared** (Loo 2.5.1-2.5.2, pp. 23-25; Misra pp. 77-79). In AODV each node keeps a next hop per destination, entries expire if unused, Hello messages identify neighbors, and the destination sequence number picks the newest route. In DSR the packet header holds the full route (*source routing*), a *route cache* reduces repeated flooding, an intermediate node can answer an RREQ from its cache, and the header grows with the route length. A DSR node processes an RREQ only if it has not processed it before and its address is not already in the route record.

**DSR route record** (Misra Example 4.10, pp. 77-78, Figure 4.10). Every node that forwards the RREQ adds its address to the route record in the header. The destination receives the request over two paths and picks one from the records; the reply travels the reverse path, and the source stores the full route in its route cache. In Misra's example the chosen route is S1, S2, S4, S5, S7, and each hop keeps the best route with the fewest hops. DSR's weaknesses: the header grows, and RREQ flooding can reach every node (Loo p. 25).

**TORA** (Loo pp. 25-26, Figure 2.6). TORA uses *link reversal* and builds a directed acyclic graph (DAG) rooted at the destination. Links get an up or down direction from the relative *height* of neighboring nodes. TORA has three functions: route creation, route maintenance, and route erasure. It assumes every node has a synchronized clock, and oscillation can occur. Control messages go only to the few nodes near a topology change. Misra (p. 76) adds that TORA often chooses the most practical route rather than the shortest. Its oscillation problem resembles *count-to-infinity*.

**Metrics other than hops** (Misra pp. 73-76). ABR counts *associativity ticks* from beacons: a high value means a node is relatively still, and the count resets when a neighbor leaves range; if several routes are equally stable, ABR takes the one with the fewest hops (Example 4.8). SSA chooses routes over strong channels from neighbors' signal strength (pp. 75-76). Link-quality metrics come back through ETX in Weeks 1 and 8.

### 3.4 Hybrid protocols and choosing one

Hybrid protocols are proactive near a node and reactive for distant destinations (Loo 2.4 and 2.5.6; Misra 4.3.3.3 and 4.3.4).

**ZRP** (Loo pp. 28-29, Figure 2.8). Each node's zone is measured in hops from it. The zone radius sets how much of the network is maintained proactively. Inside the zone, IARP, a link-state protocol, keeps routes to every node, so nearby routes are ready at once. A destination outside the zone is found by sending a query to the *peripheral nodes*, the nodes exactly one zone radius away, rather than by flooding every node. A peripheral node checks its own zone and, if the destination is not there, passes the query to its own peripheral nodes until the destination is found; the reply returns to the source as unicast. Loo notes that ZRP reduces both delay and routing overhead. Misra (pp. 80-81) adds *query control*: nodes already covered by another zone are marked so the query does not circle the same area.

**SHARP** (Misra pp. 81-82, Example 4.12, Figure 4.12). SHARP adjusts how much route information it spreads proactively. Proactive zones form on their own around destinations that are often requested, and the destinations requested most get the largest zones; the zone radius sets the proactive and reactive mix per destination. A rarely used destination gets no proactive zone and is found reactively.

**DHAR and ADV** (Misra pp. 79-80). DHAR partitions the network into clusters with two-level routing, and level-two updates travel only to neighboring clusters. ADV adapts the frequency and size of updates to the network's load and mobility, and advertises routes only to nodes that are currently the receiver of an active connection, marked by *init-connection* and *end-connection* packets.

**Seven protocols from the two books** (Loo 2.3 and 2.5, pp. 21-29; Misra pp. 66-81):

| Protocol | Type | Route information | Weakness per the books |
|---|---|---|---|
| DSDV | Proactive | Table of every destination plus sequence numbers | Large overhead, unsuited to large networks |
| WRP | Proactive | Four tables, including the MRL | Four data structures at every node |
| FSR | Proactive | Link state with fisheye scopes | Less accurate information about distant nodes |
| OLSR | Proactive | Topology through MPRs, Dijkstra | Control messages keep running without data |
| AODV | Reactive | Next hop per destination | Stale entries at intermediate nodes |
| DSR | Reactive | Full route in the header | Header grows with route length |
| ZRP | Hybrid | Proactive in the zone, reactive outside | Performance depends on the zone radius |

**Usage profile** (Loo Table 2.2, p. 24):

| Protocol | Route mechanism | Network size | Mobility |
|---|---|---|---|
| AODV | Next hop | Large | Good |
| DSR | Source routing | Small | Poor |
| TORA | Next hop | Medium | Poor |
| OLSR | Next hop | Large | Good |
| DSDV | Next hop | Large | Good |
| ZRP | Mixed | Large | Good |

In that table only TORA provides backup routes, only AQOR supports QoS, and none of these protocols has built-in security support.

**Evaluation criteria** (Misra 4.3.4, pp. 86-87): end-to-end delay and the number of control messages sent; processing overhead and memory at each node; and the packet delivery ratio, a measure of reliability. Week 6 uses these again, and they are required metrics for the final project report.

**Mobility factors** (Misra 4.3.4.1, pp. 86-87). Nodes have no speed limit, and high speed degrades many protocols. A node can move away from all its neighbors; its departure is detected by *hard state* (the node announces it leaves) or *soft state* (a time-out). Movement can be individual or in groups; military MANETs move in groups. Week 5 covers mobility models in full.

**Channel factors** (Misra 4.3.4.2, p. 87). Network activity takes about 10 % of a laptop's power and up to 50 % on handheld devices, from Kravets and Krishnan (1998). A good protocol keeps packet transmissions and maintenance overhead down, and wireless links are error-prone, so a routing strategy must limit the impact of lost packets. Loo pp. 33-34 closes the chapter with the features a new protocol should have, including backup paths.

---

## 4. Summary

| Idea | Core point |
|---|---|
| Three classes | Proactive is ready, reactive is frugal, hybrid mixes both |
| Three techniques | Hop count, link state, and source routing |
| Where the cost goes | Proactive pays in periodic messages, reactive pays in discovery delay |
| MPR | Cuts retransmissions and the size of broadcast packets |
| Choosing | Mobility, network size, and traffic pattern decide |

Week 3 uses the MPR idea again to reduce flooding in broadcast, then moves on to multicast and geographic routing.
