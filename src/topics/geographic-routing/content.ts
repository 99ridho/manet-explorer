// SPEC.md §11: generated from references/en/Week-3-Broadcast-Multicast-Geographic.md (the {#geographic-routing} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const coreMaterial = `
### 3.3 Routing with coordinates

**Two assumptions** (Misra pp. 154-155). Every node knows its position, from GPS or from relative coordinates found by localization, and the source knows the destination's position, written in the packet header so intermediate nodes know it too. A *location service*, centralized or distributed, keeps positions up to date. Without one, the source can flood a search packet and the destination answers with its position; in a sensor network a static sink can broadcast its position once.

**Localization** (Misra pp. 154-155, Figure 7.1). An *anchor* (also *beacon* or *landmark*) is a node that knows its position. *Lateration* needs distances to three non-collinear anchors for a 2D position and four for 3D. Distance comes from signal strength or time-difference of arrival. With no anchor at all, nodes build a local coordinate system from trigonometric relations among themselves.

**Greedy forwarding** (Misra pp. 157-158, Figure 7.2). S learns its neighbors' positions from periodic beacons and D's position from the packet header. Next-hop criteria include *MFR*, the neighbor with the most progress toward D, which minimizes hop count; *NFP*, the nearest neighbor that still makes progress, which reduces collisions when transmit power is adjustable; and a random choice among neighbors that make progress.

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
`.trim()
