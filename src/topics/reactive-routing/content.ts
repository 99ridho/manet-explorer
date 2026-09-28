// SPEC.md §11: generated from references/en/Week-2-Routing.md (§2 and the {#reactive-routing} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const realWorldUsage = `
In a MANET there are no dedicated routers. A node that sends data also forwards packets for other nodes, and every host takes part in finding and maintaining routes (Loo 2.6, pp. 31-32).

Routing only becomes a problem when there is a choice. With three nodes in a line, A and C each know B, so both simply use B, and no routing protocol is needed (Misra Example 4.1, pp. 61-62). Add a fourth node D, and a packet from A to C can go A-B-C, A-D-C, A-D-B-C, or A-B-D-C; now a protocol must pick one path and update it as nodes move (Misra Example 4.2, pp. 62-63). Misra stresses that giving every node the full topology is not efficient for a MANET.

Where the protocols fit (Misra 4.4, pp. 88-89): in a network that is relatively static, proactive protocols are efficient because keeping the topology pays off; as mobility rises, reactive protocols work better, and they are also preferred under heavy traffic. Misra suggests AODV, DSR, and OLSR for small networks and TORA, LANMAR, and ZRP for large ones, and concludes that no single protocol suits every situation and that a hybrid approach is often the right one. Militaries move in groups, and Misra names LANMAR and OLSR as suited to group movement (pp. 86-87).
`.trim()

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

### 3.3 Reactive protocols: AODV, DSR, TORA

AODV, DSR, and TORA look for a route only when a source has data; the cost moves from periodic messages to a discovery delay (Loo 2.5.1-2.5.3; Misra 4.3.3.2, pp. 73-79).

**AODV route discovery** (Misra p. 78, Example 4.11; Loo p. 23). S wants to send to D but has no route, so S broadcasts an RREQ. Every node that receives the RREQ for the first time records which neighbor it came from and broadcasts it again. Later copies are dropped. The recorded neighbors form the *reverse path* to S. D answers with an RREP sent as unicast along the reverse path, and every node on that path now keeps the next hop toward D. AODV uses the *destination sequence number* to pick the most recent route. Loo (p. 23) notes a weakness: an intermediate node can keep a stale entry if its sequence number is higher but not the latest.

**AODV route maintenance** (Loo p. 23). When a link in the middle of a route breaks, the nodes at both ends of the broken link send an RERR to the ends of the route. The end nodes delete the route entries that use that link. The source starts a new discovery with a new broadcast ID and the destination's previous sequence number. AODV does not repair the route locally, unlike CBRP and NAMP in Misra (pp. 77 and 83). Route entries that are not used soon are deleted by a timer.

**AODV and DSR compared** (Loo 2.5.1-2.5.2, pp. 23-25; Misra pp. 77-79). In AODV each node keeps a next hop per destination, entries expire if unused, Hello messages identify neighbors, and the destination sequence number picks the newest route. In DSR the packet header holds the full route (*source routing*), a *route cache* reduces repeated flooding, an intermediate node can answer an RREQ from its cache, and the header grows with the route length. A DSR node processes an RREQ only if it has not processed it before and its address is not already in the route record.

**DSR route record** (Misra Example 4.10, pp. 77-78, Figure 4.10). Every node that forwards the RREQ adds its address to the route record in the header. The destination receives the request over two paths and picks one from the records; the reply travels the reverse path, and the source stores the full route in its route cache. In Misra's example the chosen route is S1, S2, S4, S5, S7, and each hop keeps the best route with the fewest hops. DSR's weaknesses: the header grows, and RREQ flooding can reach every node (Loo p. 25).

**TORA** (Loo pp. 25-26, Figure 2.6). TORA uses *link reversal* and builds a directed acyclic graph (DAG) rooted at the destination. Links get an up or down direction from the relative *height* of neighboring nodes. TORA has three functions: route creation, route maintenance, and route erasure. It assumes every node has a synchronized clock, and oscillation can occur. Control messages go only to the few nodes near a topology change. Misra (p. 76) adds that TORA often chooses the most practical route rather than the shortest. Its oscillation problem resembles *count-to-infinity*.

**Metrics other than hops** (Misra pp. 73-76). ABR counts *associativity ticks* from beacons: a high value means a node is relatively still, and the count resets when a neighbor leaves range; if several routes are equally stable, ABR takes the one with the fewest hops (Example 4.8). SSA chooses routes over strong channels from neighbors' signal strength (pp. 75-76). Link-quality metrics come back through ETX in Weeks 1 and 8.
`.trim()
