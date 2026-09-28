---
week: 5
title: Mobility and Radio Propagation
source: references/id/minggu-05.md
status: draft
books:
  - Misra, Woungang & Misra (2009), Guide to Wireless Ad Hoc Networks, chapters 9, 10, and 11
---

# Week 5: Mobility and Radio Propagation

Course: Integrasi Jaringan Mandiri/Mobile, Universitas Negeri Jakarta
Lecturer: Muhammad Ridho Kurniawan Pratama, M.T.I.

Translated from the Week 5 slides. Every claim carries the book and page the slide cites. This file is a draft until the lecturer reviews it (SPEC.md Section 11).

---

## 1. Learning Outcomes

After this week, a student can:

- Explain how the choice of mobility model can change a simulation's conclusions.
- Describe random waypoint, its known flaws, and group mobility (RPGM).
- Compare free space, two-ray ground, shadowing, and fading propagation models.
- List what a simulation report must document to be repeatable.

---

## 2. Real-World Usage

A mobility model can mislead at three levels (Misra 10.4, p. 249). The absolute value: an overhead of 5 % in simulation can become 50 % in the field. The direction of change: in simulation throughput rises as range grows, in the field it falls. The ranking: protocol A wins under one model and loses under another. Because a MANET depends on intermediate nodes, the mobility model matters far more than in single-hop networks such as WLAN and cellular (p. 250).

The evidence (Misra chapter 10, p. 249, citing study [7]): AODV delivers 84 % under high-speed random waypoint, against 59 % for DSDV in the same scenario; under RPGM, DSDV delivers 97 % and AODV about 87 %. If the mobility model does not match the real scenario, the conclusion "protocol A is better than B" can reverse in deployment. This is also a problem for IETF standardization work, which compares proposals through simulation.

Group models fit real groups (Misra pp. 244-245): military units, SAR teams, campus groups. Changing only the group trajectories gives different scenarios: groups that barely move and never meet (military units in separate areas), overlapping trajectories (disaster recovery), and the same trajectory at different times (groups visiting a museum or exhibition one after another).

---

## 3. Core Material

### 3.1 The choice of model changes the result {#mobility}

**Classes of models** (Misra 10.2, pp. 238-240). Models are judged by realism, ease of variation, and complexity. *Stochastic* models are unconstrained random movement such as random waypoint: easy to use, not realistic. *Hybrid* models include group models, obstacle models, and trace-based models. *Detailed and real-trace* models are built for a specific scenario or recorded from users, such as the CRAWDAD collection. The more realistic a model, the harder it is to reuse for another scenario.

**Random waypoint** (Misra 10.3.1.1, pp. 240-241, Figure 10.2). A node picks a random destination inside a rectangle and a random speed between vmin and vmax. On arrival it pauses for a random time, then picks a new destination. RWP is the most used model in the literature, because it is simple and available in nearly every simulator. It is easy to vary: to go from students on a campus to taxis in a city, change the speed range and pause time; for a larger campus, enlarge the rectangle.

**Known flaws of RWP** (Misra p. 241). Nodes are more often in the middle than at the edges; the fix is to take the initial positions from the stationary distribution. With vmin at zero, nodes can choose a very small speed and the average speed keeps falling; the fix is to bound vmin. RWP produces an exponential decay of inter-meeting times, while real traces follow a power law; removing the rectangle's boundary, or making it very large, turns RWP's inter-meeting times into a power law too.

**Other random models** (Misra 10.3.1.2-10.3.1.4, pp. 241-244). *Random walk*: random direction and speed each step, like Brownian motion, and nodes tend to stay near their start; at the edge a node can bounce or wrap to the other side. *Random direction*: a node walks to the edge of the area, then picks a new direction; its stationary distribution is uniform. *Smooth mobility*: speed and direction change gradually, and the world is a torus with no edge. All three are as unrealistic as RWP, but smooth mobility avoids abrupt turns.

**RWP and RPGM** (Misra 10.3.2, pp. 244-245, Figure 10.6). In RWP each node moves alone; it is available in almost every simulator, it is hard to picture a real scenario that matches it, and it is good for early tests but not for final conclusions. In *Reference Point Group Mobility* nodes are divided into groups; a group model moves the group's center, and an individual model moves each node within the group. In RPGM the individual model is RWP inside a disc around the group's reference point, with no pause, while the center moves along a predetermined path. Different kinds of nodes, such as infantry and drones, are modeled as separate groups with their own speeds and pauses. Another group model is based on social networks: nodes tend to head where their "friends" are.

**Obstacles** (Misra 10.3.3, pp. 245-246, Figure 10.7). With a *Voronoi diagram*, buildings are polygons and nodes walk the paths between them by the shortest route. In the *Manhattan* model nodes move only on a grid; at an intersection they go straight with probability 0.5 and turn with 0.25. In the *freeway* model nodes follow road lanes, cannot overtake, and have acceleration and braking limits. A campus model with obstacles gives AODV performance far from RWP and RDM, because buildings also block signals.

**Detailed models** (Misra 10.3.4-10.3.5, pp. 246-248). STRAW uses real street maps with each segment's speed limit for vehicles. CORSIM models lane changes, traffic lights, and driving style, and TRANSIMS adds pedestrians. Trace-based models use statistics from real traces to generate similar new traces. Misra's open question: which parameters actually matter to imitate, for example inter-arrival time, hotspots, group size, inter-meeting time, and the distributions of pause and speed.

**Protocol-independent metrics** (Misra pp. 249-250). These come straight from the movement trace, without running a protocol:

| Metric | What it measures |
|---|---|
| Spatial dependence | How similar the speeds of nearby nodes are |
| Temporal dependence | How similar one node's speed is at two nearby times |
| Relative speed | The speed difference between two nodes |
| Number of link changes | How many times a link between two nodes forms and breaks |
| Link duration | How long a link lasts on average after it forms |
| Path availability | The share of time a path exists between a pair of nodes |

Low path availability usually ends in low throughput or high delay. A military column or a car convoy has very high spatial dependence.

**Controlled and uncontrolled mobility** (Misra 9.3.1, pp. 213-214, Figure 9.2). Without control, applications ride on the devices' natural movement, nodes wait until they meet another node, meetings can be rare and hard to predict, and the result is a low delivery ratio and a long delay. With control, nodes deliberately change their paths for communication, paths are computed to minimize delivery delay, and the number of relays is limited by a layered path structure; this needs nodes whose movement can be directed. In uncontrolled schemes such as *epidemic routing*, messages spread everywhere, so they compete for buffers and drain node energy.

### 3.2 Signals are not circles

**Three propagation events** (Misra 11.3, pp. 261-262, Figure 11.1). *Reflection*: the wave bounces off objects much larger than its wavelength. *Diffraction*: the wave bends at the edge of an obstacle, so a node behind it can still connect. *Scattering*: rough surfaces scatter energy in every direction. Indoors, long corridors act like waveguides. The many paths of different lengths are what cause *fading*.

**Large and small scale** (Misra pp. 262-263, Figure 11.2). Large-scale models describe power change over long distances and long time spans (free space, two-ray ground, shadowing) and are used by nearly every network simulator. Small-scale models react to movement of a single wavelength, and the signal changes even when a node does not move (Rayleigh and Ricean fading); they are often called fading models.

| Model | Assumption | Note from the book |
|---|---|---|
| Free space | Power falls with the square of distance | Used most often because it is simple |
| Two-ray ground | Direct path plus one ground reflection | Power falls with the fourth power of distance; depends on antenna height |
| Shadowing | Logarithmic path loss plus random variation | The exponent n can reach 6 indoors |
| Fading | Fast variation from multipath | Rayleigh without a dominant line of sight, Ricean with one |

(Misra 11.3.1-11.3.4, pp. 262-264.) Free space accounts for transmit power, antenna gain, and distance; two-ray ground does not depend on frequency but depends on the heights of sender and receiver.

**Inside ns-2** (Misra pp. 263-264). Below a crossover distance ns-2 uses free space and above it two-ray ground. For a WLAN with devices 1.3 m high, the crossover is about 170 m. In ns-2, sender and receiver must be at the same height. The 170 m figure is a sanity check: if the simulation area is much smaller, in practice only free space applies, and the results are too optimistic.

**Shadowing** (Misra p. 264). Log-normal shadowing adds randomness around the mean. The path loss at distance d equals a reference value plus 10n log(d / d0). The more obstacles, the larger n; up to 6 is reasonable indoors. A Gaussian random variable with some standard deviation is added to the formula. Real measurements show the actual value scattered normally around the prediction, so even a nearby node can miss a packet.

**Site-specific models** (Misra 11.3.5, pp. 264-266). All the models above give a roughly circular range that does not depend on location. With ray tracing, obstacles are drawn in a graphical editor and an algorithm computes propagation; simulation can slow down by a factor of a hundred. The CosMos framework combines movement zones and obstacle zones in one scenario (pp. 265-266).

**Simulator support** (Misra Table 11.3, p. 276): free space is in every package; two-ray ground in nearly all, except ns-3 and OMNeT++'s mobility framework; shadowing only in some; Ricean or Rayleigh only in some; site-specific in none natively, with GloMoSim offering a path-loss matrix. Mobility support (Misra 11.5.3, p. 275, Table 11.1) is usually limited to the simplest random models, mainly random waypoint; group, obstacle, and social models are usually missing, so researchers build scenarios from whatever model happens to exist and the results can be biased. The way out is to use traces from external tools such as BonnMotion (which supports Manhattan and RPGM), ANSim, CosMos, MGP, or OMM (pp. 275-276).

**What a report must document** (Misra 11.5.1, pp. 272-273):

| Item | Why |
|---|---|
| Every parameter value | So others know exactly which scenario ran |
| Changes to the simulator | Patches should be shared so results can be reproduced |
| Choice of input data | Value ranges and output data need discussion, not just display |
| Number of replications | Including how replication was done and the kind of simulation |
| Random generator seed | Without it, the simulation cannot be repeated exactly |
| Spread of results | Use standard deviation or confidence intervals, not only means |

If publication space is short, the details go in a separate technical report.

### 3.3 Mobility is not always harmful

**Three levels of mobility** (Misra 9.3.2, pp. 215-216). Node level: the node itself moves, for example mounted on a car or a drone. Information level: the observed event moves, for example smoke from a moving truck. User level: the receiver of the information moves, so the relevant information changes, for example traffic toward the nearest hospital.

**Sparse networks** (Misra pp. 216-217). In a sparse network an end-to-end path may never exist. The sender is never in range of the receiver and does not know its position. *Carrier nodes* store a message first and hand it to the next node, as in *epidemic routing* and *message ferrying*. Their goals are to spread messages probabilistically, reduce resources per message, and maximize the share of messages that finally arrive. A long-range radio instead would use too much energy.

**Why movement helps** (Misra 9.3.3.3, pp. 219-220). Traditional routing relies on permanent links; here it relies on brief meetings. Each meeting counts as a logical link, so the dynamic graph has more links, and the chance of a logical path between two nodes rises. In a network that often splits, permanent-link schemes do not fit, because routes must be found again every time a link breaks.

**Capacity** (Misra 9.3.4, pp. 220-221). In a static network (Gupta and Kumar), throughput per node falls with the square root of the number of nodes per unit area. In a mobile network (Grossglauser and Tse), with a loose delay tolerance, throughput per node can stay constant. The gain is paid for with larger delay; the key is short-range transmission, handing the packet to the nearest node and delivering it when the carrier happens to be close. Adding relays instead is far more expensive: for 100 senders, at least 4,476 relay nodes are needed to raise capacity fivefold, while with mobility each sender and receiver pair can get a fixed share of bandwidth. The conditions are strict: the destination is assumed fixed, there must be enough mobile nodes, and the relays per packet must be limited.

**Security** (Misra 9.3.5, p. 222). Mobility also helps build secure relationships with no PKI and no server, even at the network's start: two nodes that want to communicate securely simply come close to exchange credentials. This applies at almost every layer, from MAC to application, and imitates people, who come close before sharing a secret. Week 8 covers trust and *security associations* in depth.

---

## 4. Summary

| Idea | Core point |
|---|---|
| The model decides the result | Protocol rankings can reverse just because of the mobility model |
| Random waypoint | Easy to use, but crowds the center and has the vmin trap |
| Group models | The group trajectories decide which scenario is imitated |
| Propagation | Free space is the most optimistic; shadowing is closer to reality |
| Documentation | Parameters, patches, seeds, replications, and spread must be recorded |

Week 6 uses all of this to build an honest simulation scenario and read its results with the right metrics.
