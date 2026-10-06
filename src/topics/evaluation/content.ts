// SPEC.md §11: generated from references/en/Week-6-Modeling-Simulation.md (§2 and the {#evaluation} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const realWorldUsage = `
A model is a simplified representation of a real system, and a simulation runs that model to observe its behavior. The research community uses simulators because a MANET can have hundreds of nodes moving over a wide area, funding daily experiments with hundreds of moving nodes is unrealistic, and some applications cannot be tested in the field at all (Loo pp. 39 and 58). The challenge is balancing detail and speed: the more OSI layers a simulator models, the slower it runs.

Results must be read with care. Loo chapter 4 compares AODV, DSR, and OLSR on one test bench, and OLSR comes out both best and worst depending on the metric (section 3.3). The same chapter gives two different statements about delay, and the lesson is to check the results section, not only the conclusion, and to name the source when quoting.
`.trim()

export const coreMaterial = `
### 3.1 Models simplify the network

**Algorithms without a map** (Loo 3.1.1, p. 39). Finding a minimum dominating set or CDS is NP-complete, so it cannot be solved exactly; approximations with heuristics are the only realistic choice. The algorithm must also be distributed, with no global knowledge, working only through messages to neighbors. Another example is *vertex cover*, placing robots at the corners of a maze so each robot is seen by another. Real concerns such as battery life and mobility are added later as adjustments.

**Five graph models** (Loo 3.2.1, pp. 40-43):

| Model | What it captures | What it leaves out |
|---|---|---|
| Unit disk graph | The geometry of radio transmission | Obstacles, signal quality, node weights |
| Quasi UDG | Probabilistic links through a parameter q | Otherwise the same as UDG |
| Undirected graph | Suits many kinds of network | Geometry; assumes every link is two-way |
| Directed graph | Nodes with different transmission ranges | Geometry, node and edge weights |
| Weighted graph | Node and edge weights, for example energy | Transmission geometry, so it is pessimistic |

Node weights can be mobility, energy, or degree; edge weights can be signal strength or distance; *cost* is sometimes used for weight.

**UDG** (Loo 3.2.1.1, pp. 40-41 and 68). Every node has a disc of radius 1, and two nodes are linked if they are at most 1 apart. It is simple, captures radio broadcast, and is open to theoretical analysis, but even a small obstacle disrupts it and signal quality is not modeled. UDG remains popular for areas without obstacles; because it has no node weights, it does not suit route selection by remaining energy.

**Quasi UDG** (Loo pp. 41-42). Every node has two discs, of radius 1 and radius q. Below q a link always exists; between q and 1 a link may or may not exist, which is the probabilistic part; above 1 there is none. Tuning q imitates small obstacles in the network area, and QUDG with q = 1 is a UDG again. Sinalgo is among the simulators that provide both UDG and QUDG.

**Topology control** (Loo 3.2.2, pp. 43-53). These models look for a subset of nodes or links enough to keep the network working. An *independent set* is a set of nodes that are not neighbors of one another; a *dominating set* has every node in the set or next to a member (the CDS of Week 3); a *spanning tree* connects every node without cycles. A common limit is that all these models are studied on simple network models (p. 68). Loo also covers *graph matching*, *vertex cover*, and *Steiner trees*.

**Independent sets** (Loo 3.2.2.1, pp. 43-45, Figure 3.6). A *maximal* independent set cannot be extended but is not necessarily the largest; a *maximum* independent set has the most nodes, and finding one is NP-hard; a *weighted* one maximizes total weight instead of size. They are used for facility placement and backbone formation, and chosen nodes can become *cluster heads*. Chatterjee's algorithm uses ID comparison and IamInTheSet and NotInTheSet messages.

**Dominating sets** (Loo 3.2.2.2, pp. 45-46, Figure 3.8). In an *independent DS* no two members are neighbors, so no two cluster heads sit side by side. In a *weakly connected DS* the weakly induced subgraph stays connected, so cluster heads can communicate. In a *connected DS* the members are connected to each other, which makes broadcast and a virtual backbone easy. Wu's three-step algorithm: each node finds its neighbor set, exchanges it with its neighbors, and marks itself as in the CDS if it has two neighbors that are not neighbors of each other.

**Spanning trees** (Loo 3.2.2.3, pp. 46-48, Figures 3.10 and 3.11). Spanning trees carry data from a source to a sink and support multicast. In Gallager's algorithm every node starts as its own fragment, and fragments merge over their smallest outgoing edge; a lower-level fragment is absorbed at once, and equal-level fragments merge into the next level. Erciyes's algorithm builds a clustered tree from a root with a *depth* parameter that sets the cluster diameter: a receiver with nhops zero becomes a subroot, one below the depth an intermediate node, and one equal to the depth a leaf.

**Interference** (Loo pp. 50-51, Figures 3.15 and 3.16). *Sender-centric*: how many nodes does one link disturb? An edge's coverage is the union of two discs; LIFE activates edges from the smallest coverage up, and LISE adds a distance factor so links do not get too long. *Receiver-centric*: how many nodes can disturb one node? Interference is the number of discs that contain the node; this has been shown to give lower-interference topologies, and NCC connects components to their nearest neighbors. The old assumption that low node degree automatically lowers interference proved wrong, so newer algorithms handle interference explicitly, and recent work uses SINR models rather than graph-theory models.

### 3.3 Reading evaluation results

**The three most used metrics** (Misra 4.3.4, pp. 86-87). The *packet delivery ratio*: how reliably the protocol carries data from source to destination. The *end-to-end delay*: the time from source to destination, including route discovery. The *control overhead*: the number of routing messages sent to maintain routes. Misra also names processing overhead and memory. For mobility, Misra chapter 10 (p. 250) adds protocol-independent metrics: link duration and path availability.

**Loo chapter 4's test bench** (Loo 4.5.1, pp. 81-82). Network sizes: 50 nodes in a 500 m square, 100 nodes in 750 m, 250 nodes in 1 km. Devices: a 40 MHz processor, 512 KB of memory, a channel below 1 Mbps, 2.4 GHz, 50 m range. Traffic: Poisson with a mean inter-arrival time of 30 seconds, exponential packet sizes with a mean of 1024 bits, injected 100 seconds after the start to random destinations. Node failures are forced so the network's response to topology change is measured.

**OLSR wins one way and loses another** (Loo 4.5.3-4.5.5 and 4.6, pp. 84-97). OLSR has the most stable and lowest routing traffic, stays stable with many nodes and frequent failures, is judged by Loo best for almost every parameter, and does not depend on the node count. But it has the highest MAC load because it is proactive and uses the most throughput of the three: at 100 nodes, 110 Kbps against 80 Kbps for AODV and DSR; at 250 nodes, 200 Kbps for OLSR and 180 Kbps for the other two, so the gap narrows as the network grows. AODV is best when data traffic is injected. Whether a protocol is best or worst depends on the metric.

**Two delay figures in one book** (Loo pp. 94 and 97). In section 4.5.6, DSR and OLSR approach zero while AODV stays at about 1 second after convergence. In the conclusion, 4.6, all protocols are said to approach zero, with a worst case of 1 to 3 milliseconds. The difference may be because the results section covers the 250-node mobile topology with failures while the conclusion summarizes every scenario.

**Before running a simulation** (adapted from Misra 1.3.5, p. 22). The protocol must tolerate packet loss; if it does not, fix the protocol. Path loss and shadowing parameters must match the scenario, antenna height included. Check the resulting topology's density, diameter, partitions, and bridges before drawing conclusions. Misra also suggests testing with various loads and traffic distributions, and checking that the scenario given to the simulator is the one you meant to test (recall the Berlin data in Week 1).

**Required content of a simulation report** (Loo pp. 60 and 81-82; Misra pp. 22 and 272-273):

| Part | What must be there |
|---|---|
| Network model | The graph or propagation model, and why it was chosen |
| Scenario | Node count, area, transmission range, movement pattern, traffic pattern |
| Simulator parameters | Simulator version, every parameter value, and your changes |
| Repetition | Number of replications, random seeds, and how replication was done |
| Results | Metrics with their spread, not only means |
| Limitations | What was not modeled and how it affects the conclusions |
`.trim()
