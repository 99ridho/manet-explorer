// SPEC.md §11: generated from references/en/Week-5-Mobility-Propagation.md (§2 and the {#mobility} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const realWorldUsage = `
A mobility model can mislead at three levels (Misra 10.4, p. 249). The absolute value: an overhead of 5 % in simulation can become 50 % in the field. The direction of change: in simulation throughput rises as range grows, in the field it falls. The ranking: protocol A wins under one model and loses under another. Because a MANET depends on intermediate nodes, the mobility model matters far more than in single-hop networks such as WLAN and cellular (p. 250).

The evidence (Misra chapter 10, p. 249, citing study [7]): AODV delivers 84 % under high-speed random waypoint, against 59 % for DSDV in the same scenario; under RPGM, DSDV delivers 97 % and AODV about 87 %. If the mobility model does not match the real scenario, the conclusion "protocol A is better than B" can reverse in deployment. This is also a problem for IETF standardization work, which compares proposals through simulation.

Group models fit real groups (Misra pp. 244-245): military units, SAR teams, campus groups. Changing only the group trajectories gives different scenarios: groups that barely move and never meet (military units in separate areas), overlapping trajectories (disaster recovery), and the same trajectory at different times (groups visiting a museum or exhibition one after another).
`.trim()

export const coreMaterial = `
### 3.1 The choice of model changes the result

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
`.trim()
