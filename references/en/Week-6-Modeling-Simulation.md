---
week: 6
title: Modeling, Simulation, and Performance Evaluation
source: references/id/minggu-06.md
status: draft
books:
  - Loo, Lloret & Ortiz (2012), Mobile Ad Hoc Networks, chapters 3 and 4
  - Misra, Woungang & Misra (2009), Guide to Wireless Ad Hoc Networks, chapters 1, 4, and 11
---

# Week 6: Modeling, Simulation, and Performance Evaluation

Course: Integrasi Jaringan Mandiri/Mobile, Universitas Negeri Jakarta
Lecturer: Muhammad Ridho Kurniawan Pratama, M.T.I.

Translated from the Week 6 slides. Every claim carries the book and page the slide cites. This file is a draft until the lecturer reviews it (SPEC.md Section 11).

---

## 1. Learning Outcomes

After this week, a student can:

- Compare the graph models used for MANETs and what each one leaves out.
- Explain independent sets, dominating sets, and spanning trees as topology control.
- Choose a simulator with its limits in mind.
- Read an evaluation critically and write the methodology section of a simulation report.

---

## 2. Real-World Usage

A model is a simplified representation of a real system, and a simulation runs that model to observe its behavior. The research community uses simulators because a MANET can have hundreds of nodes moving over a wide area, funding daily experiments with hundreds of moving nodes is unrealistic, and some applications cannot be tested in the field at all (Loo pp. 39 and 58). The challenge is balancing detail and speed: the more OSI layers a simulator models, the slower it runs.

Results must be read with care. Loo chapter 4 compares AODV, DSR, and OLSR on one test bench, and OLSR comes out both best and worst depending on the metric (section 3.3). The same chapter gives two different statements about delay, and the lesson is to check the results section, not only the conclusion, and to name the source when quoting.

---

## 3. Core Material

### 3.1 Models simplify the network {#evaluation}

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

### 3.2 Choosing a simulator

| Simulator | Main trait | Note |
|---|---|---|
| ns-2 | C++ for protocols, OTcl for scenarios | Event-driven, single thread; has a *mobilenode* class |
| TOSSIM | Simulator for TinyOS applications | Focused on sensor networks; mica platform only |
| OPNET | Commercial, free licence for education | Used in Loo chapter 4 to compare AODV, DSR, OLSR |
| OMNeT++ | Nested C++ modules configured with NED | Eclipse-based IDE; supports parallel simulation |
| GloMoSim | Written in Parsec, layered like OSI | Does not support wired networks yet |
| Sinalgo | Focused on verifying network algorithms | Handles more than 100,000 nodes; has UDG and QUDG |

(Loo 3.3.3-3.3.7, pp. 59-65.) ns-3, the successor to ns-2, is mentioned on Loo p. 66 but not covered in detail.

**Running ns-2** (Loo 3.3.3.2, p. 60). Add the protocol in C++ and OTcl to the ns-2 source; write an OTcl scenario script with the nodes, their movement, and the start and end times; collect results from the built-in trace file or from the protocol's own output. A *trace* records every packet that arrives, leaves, or is dropped; a *monitor* records aggregates such as packet and byte counts. When setting up nodes you must choose the channel type, radio propagation model, network interface type, and antenna model; the MAC type, interface queue type and size, and link layer type; and the initial positions, movement pattern, area, and start and end times (p. 60). This is also the list to report in the final project.

**Limits of ns-2** (Loo 3.3.8, pp. 65-66, Table 3.6). The area is flat and empty, with no buildings, people, or vehicles. Transmission capacity drops from full to zero the moment a node leaves coverage. The simulation becomes very heavy above a few hundred nodes; Loo gives a limit of about 500. Its class hierarchy is complex and can take weeks to learn, and results must be traced by parsing output files.

**Other simulators' ceilings** (Loo pp. 65-67). TOSSIM handles thousands of sensor nodes and models bit-level interference but has no mobility in version 2.x; its *bridging* lets tested code run directly on mote hardware. OMNeT++ is easy to extend through its Eclipse IDE but is limited to about 2,000 nodes. OPNET has a fast, complete engine but is commercial and slower to follow new wireless networks. All of them are weak at modeling the environment's effect on propagation.

**Writing your own** (Loo 3.3.2, pp. 58-59). It fits when existing simulators are inadequate; the implementation is simple (one thread per node, shared memory between nodes, an adjacency matrix for the topology). But there is no standard environment, comparative studies become less trustworthy, mutual exclusion must be handled, and movement scenarios must be built from scratch by changing the neighbor matrix in a plausible way. For the final project it makes sense only to test one algorithm, not to compare protocols.

### 3.3 Reading evaluation results {#evaluation}

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

---

## 4. Summary

| Idea | Core point |
|---|---|
| A model is a choice | Each graph model captures something and ignores something else |
| Topology control | Independent sets, dominating sets, and spanning trees reduce load |
| Simulators have limits | Node count, propagation detail, and ease of development |
| The metric picks the winner | PDR, delay, and overhead can point to different protocols |
| Documentation | Without parameters and seeds, results cannot be checked |

Week 7 uses these metrics again from the side of service guarantees: QoS, delay, congestion, and energy.
