// SPEC.md §11: generated from references/en/Week-4-Self-Organization.md (the {#clustering} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const coreMaterial = `
### 3.1 Organizing without a center

**Self-CHOP** (Misra pp. 28-29, following IBM's terms for an *autonomic system*):

| Property | Meaning |
|---|---|
| Self-configure | Change the relations between components to stay alive or run faster |
| Self-heal | Detect or anticipate a fault, then repair it |
| Self-optimize | Monitor components and tune resources automatically |
| Self-protect | Anticipate, recognize, and fend off attacks |

Four further properties are *self-aware*, *self-adapt*, *self-evolve*, and *self-anticipate*. In a MANET, energy is less of an issue than in a sensor network because batteries can be recharged (p. 28).

**The hidden terminal** (Misra 2.2.1, pp. 30-31, Figure 2.2, citing Tobagi and Kleinrock). A sends to B while C sends to D on the same channel. A and C cannot hear each other, so neither knows a collision happened, and B receives a truncated message or corrupted data. This is a common trap for every self-configuring and self-healing scheme. *Terminal* here means node.

Two solutions (Misra pp. 30-31). With *RTS/CTS*, A sends an RTS and waits for B's CTS, retrying until the CTS arrives or time runs out; IEEE 802.11 uses it, and it suits unpredictable traffic. With *timeslots* (TDMA), every node has its own sending schedule, which guarantees QoS per node; the schedule is recomputed when a node joins or leaves, and it suits a uniform load per node. The price of TDMA is high schedule computation time and, in a dense network, a long gap between two turns of the same node. The same approach applies to frequency bands and CDMA codes.

**LCA clustering** (Misra pp. 31-32). Baker and Ephremides proposed a two-level model. The node with the highest ID among its neighbors that do not yet have a cluster head declares itself a cluster head. A node connected to two or more cluster heads becomes a gateway. The rest are ordinary nodes, one hop from their cluster head. Choosing the minimum number of cluster heads is NP-hard, which is why the ID rule is used. LCA is paired with LAA (the *link activation algorithm*) to schedule links between nodes. Variations use the lowest ID or the node with the most neighbors.

Example: on the network 9-4, 9-2, 9-6, 6-8, 8-3, 8-5, nodes 9 and 8 become cluster heads, and node 6, connected to both, becomes a gateway.

**Early protocols** (Misra pp. 31-32). LCA, DEA, and Layer Net periodically discard their topology information and rebuild from scratch. SWAN adjusts gradually: it looks for new connections in a random-access period and drops those that do not answer. DEA uses clique partitions; Layer Net builds a layered spanning tree from a starting node, where a node's layer number equals its hop distance from the root and schedules are built layer by layer like a breadth-first search.

**Self-healing** (Misra pp. 33-35, Figures 2.3 and 2.4). A system moves between three states: *acceptable* (the network works as intended), *degraded* (part of it works, part does not, for example because nodes moved or died), and *failed* (the network's function depends on the failed part, so everything stops). Recovery returns it to acceptable, for example by moving nodes to the affected area. The five steps when a fault appears:

| Step | What the system does |
|---|---|
| Monitor | Observe the system's behavior and chosen indicators |
| Detect | Decide when behavior leaves its normal range |
| Diagnose | Judge whether the deviation really is a fault |
| Decide | Change or repair the diagnosed fault |
| Prevent | Anticipate the next fault from the monitored indicators |

The idea was inspired by studies of the immune system (Forrest et al.); a system that needs outside intervention is *assisted-healing*. A system keeps itself healthy through redundancy (duplicating key components), probing (special components that collect current information about others), and log analysis (judging its own performance and watching for typical symptoms) (p. 34). Recovery can use duplicated components, isolation and reconfiguration, or Byzantine agreement by voting on outputs.

**A backbone** (Misra 2.3, pp. 35-36). Using a subset of nodes as a communication backbone means fewer routes, less routing overhead, and less broadcast redundancy, and the other nodes can sleep and wake when needed. The routers drain their power faster and must be replaced when it runs low. Choosing backbone nodes can be modeled as a linear program with a binary variable per node. Misra notes that hierarchical structures such as *link clusters* and *dominating sets* are not yet fast enough at providing redundancy for real-time networks (p. 36).
`.trim()
