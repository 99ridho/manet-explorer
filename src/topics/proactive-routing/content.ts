// SPEC.md §11: generated from references/en/Week-2-Routing.md (the {#proactive-routing} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const coreMaterial = `
### 3.1 Why MANET routing is hard

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

### 3.2 Proactive protocols: DSDV, WRP, CGSR, FSR, OLSR

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
`.trim()
