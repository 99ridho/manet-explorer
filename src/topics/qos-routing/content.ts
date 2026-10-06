// SPEC.md §11: generated from references/en/Week-7-QoS-Congestion-Energy.md (the {#qos-routing} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const coreMaterial = `
### 3.1 Promising service without guarantees

**What is promised** (Misra pp. 282-284): minimum bandwidth and maximum acceptable delay; *jitter*, the variation in delay between packets caused by changing queues at each node; and the maximum tolerated packet loss rate.

**Hard and soft state** (Misra 12.2.7, p. 284). With *hard state*, routes and reservations stay fixed for the session, which guarantees QoS for that time; it suits wired networks with fixed paths and is too rigid for a changing topology. With *soft state*, reservations are refreshed by the data packets passing through, and if no packet arrives before a timer expires the resources are released, fully distributed; it suits a MANET whose paths change fast. A data packet that reaches a router with no reservation triggers admission control and a new reservation; the connection lasts as long as the timer, not the session.

**Six reasons QoS is hard in a MANET** (Misra 12.3, pp. 284-286):

| Challenge | Consequence |
|---|---|
| Dynamic topology | Paths break often; QoS sessions must be rebuilt and packets miss deadlines |
| Error-prone channel | Attenuation, interference, and fading make delivery guarantees hard |
| No central coordination | Protocols use only local information; overhead rises |
| Imprecise state information | Routing decisions can be wrong |
| Limited resources | Memory and battery limit how much QoS state can be kept |
| Hidden terminal | Collisions force retransmissions, which strict flows cannot afford |

Many QoS routing problems are NP-complete, so they call for heuristics that load the node's processor.

**What changes test results** (Misra 12.4, pp. 286-287): node mobility (minimum and maximum speed, speed pattern, pause time); network size and traffic (the larger the network, the harder state is to spread, and the number and kind of traffic sources matter); and transmit power (more power means more neighbors, but also more interference and more one-way links).

**IntServ and DiffServ** (Misra 12.5.1-12.5.2, pp. 287-290). IntServ keeps state for every flow at every router, has two classes (*Guaranteed* and *Controlled Load*), uses RSVP for signaling, and gives quantitative per-flow guarantees but is hard to scale. DiffServ has a limited number of aggregate service classes; edge routers mark the DS field in the IP header, core routers forward by PHB, and core routers keep no per-flow state. Both were designed for the Internet and need adapting for a MANET.

**FQMW** (Misra pp. 290-292, Figure 12.4) was the first model designed for MANETs. It serves the highest priority per flow and the other classes per class. Its node roles are ingress (sends), core (forwards), and egress (receives), unrelated to physical position. A *traffic conditioner* at the ingress re-marks, drops, or shapes packets to the traffic profile. Open questions remain: how many sessions can be served per flow, and the DS field has only 8 bits. FQMW was later developed into RBSD.

**SWAN** (Misra pp. 292-293, Figure 12.5) differentiates service without per-flow state. It has an admission controller, a packet classifier, and a rate controller; best-effort traffic is held back so real-time flows get the bandwidth they need; and its feedback is MAC delay, not packet loss as in TCP. Its guarantees are weak, admission is tested only at the source with probe packets, and the bandwidth estimate ignores best-effort traffic.

**INSIGNIA** (Misra pp. 294-295, Figures 12.6 and 12.7) was the first signaling protocol designed for MANETs. Control information rides in-band in the IP options of every data packet, because separate signaling such as RSVP is too heavy and competes with data for the channel. When resources run short, a flow is downgraded to best effort without a rejection message. Flow state is soft state refreshed by passing signaling, and scheduling uses channel-aware *weighted round-robin*.

**QoS routing** (Misra 12.8, p. 298, Figure 12.9). QoS routing looks for the best feasible path from source to destination that meets a set of constraints. Example: a flow from A to E asks for 3 Mbps. Path A-D-E is shorter but lacks the capacity, so QoS routing picks A-B-C-E despite its extra hop. The difficulties are the overhead of storing state, link information that goes stale quickly, and routes that can break after a reservation is made.

| Class | What it relies on | Guarantee it can give |
|---|---|---|
| Needs a collision-free MAC | TDMA or similar | Pseudo-hard: hard except when the channel or nodes change |
| Needs a contention MAC | Statistical estimates of resources | Soft, probabilistic |
| MAC-independent | Estimates of node and link state | No promise, only better averages |

(Misra 12.8.1, pp. 299-300, Figure 12.10.) Truly hard QoS guarantees are possible only on wired networks. Misra also groups protocols as *coupled* or *decoupled* from the QoS provisioning mechanism (pp. 300-301).

### 3.2 Delay and congestion, misunderstood

**Controlling delay** (Misra 13.1, p. 311). On 802.11, bandwidth is much narrower than on a comparable wired network; the channel's error behavior and capacity keep changing, so hard guarantees are nearly impossible; and user movement causes fading, so quality can drop fast. The chapter therefore adapts the application's service class with feedback control instead of promising fixed numbers.

| Layer and component | Job |
|---|---|
| Middleware: Classifier, Monitor, Priority Adaptor | Map priorities to service classes and watch for delay violations |
| Network: Queue Management | Manage buffers, mark or drop packets |
| Network: Differentiated Scheduler | Choose which packet goes and share bandwidth between flows |
| MAC: MAC scheduler | Order channel access between nodes |

(Misra 13.3, pp. 313-314.) The MAC and network schedulers are designed together because they are bound to each other. Delay is measured by timestamping packets and averaging a number of round-trip measurements (pp. 314-315).

**TCP misreads loss** (Misra 15.4.1, pp. 363-364). Routes break when nodes move, and TCP reads the delay of finding a new route as congestion. Packets can be lost to the channel, not to a full queue. CSMA/CA is unfair in the short term, so packets go out in bursts. TCP assumes congestion when three data packets go unacknowledged or on a timeout, then backs off hard and restarts with *slow start*, even though the route may already be back.

**ELFN** (Misra 15.5.1.1, p. 367). When the MAC layer fails to retransmit, it tells the routing layer, which sends an ELFN to the source. TCP then freezes its congestion variables, window size included, until the route recovers. The weakness: every retransmission failure is blamed on mobility, although it may be real congestion, for example in a hidden terminal case. ATP takes another approach: the sending rate follows delay feedback instead of a window, so traffic does not burst (p. 368).

**Congestion is local** (Misra 15.4.2.2, pp. 365-366, Figure 15.2). On a chain A-B-C-D-E-F, links A-B and E-F can send at the same time, but link C-D can send only while both are quiet. If every link is saturated, C-D almost never gets a turn: the simulation Misra cites shows its throughput at only about 1 % of the total. This is the *flow in the middle* problem. Congestion in a MANET is not even as on a wired LAN; it depends on node position, and a small shift in position can remove the unfairness.

**ETX beats hop count** (Misra 15.5.2, pp. 368-369). Fewer hops means longer hops, and link quality falls with distance. ETX is one divided by the product of the forward and reverse success probabilities. Each node broadcasts probe packets periodically and computes the loss rate from its neighbors' records. ETX leads to shorter hops and more of them, yet its TCP throughput is still better than hop-count routing. Week 1 already used ETX to read the Berlin data.

**Choosing an approach** (Misra 15.6.1, p. 370). A mobile network is prone to false alarms, so it needs control messages such as ELFN. In a static network, breaks from distance are rare, and link-quality-aware routing is enough, so standard TCP can be used without much change. Misra also calls for standardizing the flow of control information from the routing layer to TCP, because MANET routing protocols vary so much.

### 3.3 Energy-aware routing

**Two goals** (Loo p. 203). *Total energy*: minimize all the energy used for one communication task. *Network lifetime*: maximize the time until the first node runs out of power. Both look for a path that minimizes some energy-related cost. The difference matters: the path with the lowest total energy can drain one critical node faster.

**Single-cost approaches** (Loo 8.2.1, pp. 203-204, citing Chang and Tassiulas, Toh, LEAR, and Span). The link cost follows the initial energy and the sending node's current energy; nodes whose energy is nearly gone are left out of route selection; transmit power is controlled, and nodes may sleep or join the backbone. Other metrics named are remaining battery combined with neighbor count, and the expected number of retransmissions for reliable delivery.

**Single cost and multicost** (Loo 8.1 and 8.3, pp. 202-210). A single-cost scheme gives each link one scalar metric, possibly a combination of load, energy, and interference, usually yields one path per node pair, and struggles to support QoS differentiation. A multicost scheme gives each link a vector of cost parameters, collects the non-dominated candidate paths, and picks the best with an optimization function; Loo's results show more balanced energy use. A path's cost is computed by applying an associative operator to each component of the links' cost vectors, and the optimal path minimizes the optimization function. Finding a path with two or more cost constraints is generally NP-complete, so existing algorithms use heuristics and polynomial-time approximations, and multicost problems are less studied in wireless networks even though their energy constraints are real (Loo p. 204).

**Energy-efficient broadcast and multicast** (Loo 8.2.2, pp. 204-206). Augmentation algorithms start from an empty set and grow it into a tree: MST and SPT (the minimum-energy spanning tree and the shortest-path tree via Dijkstra); BIP adds one node at a time, the one with the smallest added cost; BAIP adds several at once; GPBE uses new nodes per unit of power. Local search algorithms improve an existing tree step by step: *Sweep* removes transmissions made unnecessary by the broadcast nature of radio; *EWMA* and *LESS* raise one node's power if that lets other nodes stop transmitting; *r-shrink* shrinks each node's radius until fewer than r nodes hear it. They stop when no further improvement is found, and most assume transmit power can be adjusted.
`.trim()
