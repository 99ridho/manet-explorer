// SPEC.md §11: generated from references/en/Week-1-Introduction.md (§2 and the {#multihop} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const realWorldUsage = `
A MANET is used precisely where infrastructure is missing (Loo 1.6, pp. 8-10).

- **Military.** Soldiers, vehicles, and command posts that keep moving need to communicate. The network can be set up quickly without planning or infrastructure, which suits troops on the move, and fast-moving objects such as aircraft, tanks, and warships need fast and reliable communication. Loo lists reliability, efficiency, security, and multicast routing support as the requirements (p. 8).
- **Emergency response.** A medical team at a disaster site has no time to lay cables and install network equipment. In a search-and-rescue operation, packets travel from one client device to the next until they reach a gateway. Loo notes that this can stretch a WLAN's reach from hundreds of feet to several miles, depending on how many wireless users are around (pp. 8-9, Figure 1.5). Voice dominates this traffic, so the real-time demand is high.
- **Temporary local networks.** Sharing data in a meeting, a conference, or a classroom without an installed network (pp. 8-9).
- **Personal area networks.** A Bluetooth piconet has 8 active devices (one master, the rest slaves), up to 255 devices in parked mode, and a typical range of 10 m, up to 100 m in ideal conditions (p. 9). A PAN centers on one person, while a WLAN serves many users; the first device in a piconet becomes the master (pp. 9-10, Figure 1.6).
- **Community networks.** Misra chapter 1 measures open community mesh networks (Freifunk) in Berlin and Leipzig. These are not laboratory testbeds, and their shape turns out to differ from the models most studies use (section 3.2 below).

Not every ad hoc node moves (Loo p. 6). Laptops and PDAs talking directly are mobile nodes; a sensor network scattered over a wide area is a *fixed ad hoc network* whose topology changes because sensors run out of power, not because they move; relay points installed temporarily where they are needed are semi-mobile.
`.trim()

export const coreMaterial = `
### 3.1 Networks without an access point

**Two kinds of wireless network** (Loo 1.2, pp. 4-5, Figures 1.1 and 1.2). In an infrastructure network, clients connect through an access point (AP), the AP bridges the wireless and wired networks, and a client does not forward packets for other clients: an office, home, or airport WLAN. In an ad hoc network, nodes communicate directly, peer to peer, with no AP or wired network, and every node is ready to forward packets for other nodes: between vehicles, ships, or buildings. Loo explains that *ad hoc* carries no negative meaning here; it only describes a network whose situation keeps changing.

**The radio channel** (Loo 1.2, p. 5). 802.11a uses 5.15-5.35 GHz; 802.11b and 802.11g use 2.4-2.58 GHz. Beyond some distance the received power drops until reception is no longer possible. At the MAC layer, Bluetooth uses 802.15 and WLAN uses 802.11 to share the medium. Range is not a sharp line; Week 5 covers more realistic propagation models.

**Definition.** "A wireless ad hoc network is a collection of two or more wireless devices that can communicate with each other without the help of a central administrator. Each node works as both a host and a router." (translated from Loo, Lloret & Ortiz 2012, p. 5)

**What the definition implies** (Loo 1.3, pp. 5-6). Because nobody registers the nodes, each node does these jobs itself: it discovers its neighbors by announcing itself and listening to others' announcements; it learns which services exist and their attributes; and it keeps its routing information up to date as the set of nodes changes. On a campus, DHCP and DNS both need a server; Week 4 covers how nodes get addresses without one.

**Multihop** (Loo 1.3, pp. 6-7, Figure 1.3). If A and C are out of each other's range and B is within range of both, B forwards packets from A to C. There is no central administration. When one node moves out of range, the affected nodes simply ask for a new route: delay rises a little, but the network keeps working. Loo writes that the network does not collapse because one node moves away.

**Why routing protocols compromise** (Loo p. 6). A dynamic medium, fast and unpredictable topology changes, limited batteries, and mobility make MANET routing hard. Most proposals pursue one goal, such as lower delay or lower overhead, and give up another, such as scalability or route reliability. This is why Weeks 2 and 3 cover many protocols rather than one winner.

**A short history** (Loo 1.4, p. 7). 1972: PRNET, a packet radio network tested for battlefield communication, used with ALOHA and a form of distance vector routing. 1980s: SURAN (Survivable Adaptive Radio Networks) aimed at small, cheap, low-power devices, scalability, and survivability. 1990s: laptops and mobile devices spread, the IEEE 802.11 subcommittee adopted the term *ad hoc network*, and GloMo and NTDR continued the military research.

**Five characteristics and their consequences** (Loo 1.7, pp. 10-11):

| Characteristic | Consequence for protocol design |
|---|---|
| Distributed operation | All nodes share routing and security |
| Low bandwidth, high bit error rate | Control messages must be frugal; fading and interference affect the channel |
| Battery-powered | Every transmission and every forward drains power |
| Exposed to attack | Eavesdropping, spoofing, and denial of service are easier |
| Dynamic topology | Links break and form unpredictably |

Loo also lists the upside (p. 11): the network is easy and fast to deploy, because no infrastructure has to be installed first, and it depends less on fixed infrastructure.

**Four bases of classification** (Loo 1.8, pp. 11-17). Loo notes that the literature has no generally accepted classification.

| Basis | Classes |
|---|---|
| Communication | Single-hop, multihop |
| Topology | Flat, hierarchical (clusters), aggregate (zones) |
| Node configuration | Homogeneous, heterogeneous |
| Coverage area | BAN, PAN, LAN, MAN, WAN |

- *Single-hop and multihop* (1.8.1, pp. 11-12). In a single-hop network every node is in range of every other, no intermediate node is needed, and the whole network can move as one group without changing who talks to whom; it is the simplest class. In a multihop network some nodes are too far apart, intermediate nodes forward traffic, and the main problem is node mobility; it is the most studied class and needs routing that adapts to fast topology change.
- *Flat and hierarchical* (1.8.2, pp. 12-14). In a flat network all nodes have the same duties and control messages spread through the whole network; it suits very dynamic topologies, but scalability drops as the node count grows. A hierarchical network is divided into clusters with a master node that manages each cluster and links it to others; it suits low mobility and scales better, but the master is a weak point. While a master is down, its cluster cannot send to or receive from the rest of the network (pp. 13-14). In the aggregate class, the network is divided into zones, each node has a node ID and a zone ID, and each zone can be flat or hierarchical (p. 14).
- *Homogeneous and heterogeneous* (1.8.3, pp. 14-15). Homogeneous nodes share the same processor, memory, and peripherals, as in wireless sensor networks, which makes localization easier. Heterogeneous nodes differ in resources and policies, not every node can offer the same service, and protocols must tolerate the difference.
- *Coverage area* (1.8.4, pp. 15-17): BAN, 1-2 m, devices worn on the body; PAN, up to 10 m, 2.4-10.6 GHz; LAN, 802.11 WLAN in homes, offices, and public spaces; MAN, WiMAX 802.16, up to 50 km and up to 70 Mbps; WAN, MBWA 802.20, up to 100 Mbps with very high mobility. Loo notes that multihop wireless MANs and WANs still face open problems in addressing, routing, location management, and security.

### 3.2 Theory and practice

**Three ways to test a protocol** (Misra 1.2, pp. 4-5). A simulator is cheap and fast, so it is used early, but its results depend entirely on the model. An emulator runs real software on real nodes, but packet delivery is still computed. A testbed is closest to reality but expensive and limited in node count: MIT Roofnet had 30-40 nodes, the UCSB mesh 25, Dartmouth 33; the ORBIT emulator uses an indoor grid of 20 × 20 nodes.

**A model can miss what matters** (Misra Example 1.1, p. 4). An IBM study planned to run IEEE 802.15.4 on Mote nodes for a logistics network. The node processor could not serve every interrupt from the MAC layer, and above 1 packet per node per second the network collapsed. The simulator did not show this, because simulators usually do not model each node's processing speed.

**The six parts of a network model** (Misra 1.1, pp. 2-3):

| Sub-model | What it defines |
|---|---|
| Node | Number of interfaces, energy source, memory, GPS or not |
| Placement and mobility | Initial positions and movement pattern |
| Radio | Frequency, bandwidth, transmit power, reception threshold, MAC function |
| Signal propagation | How the signal weakens and how the environment affects it |
| Packet loss | Loss from the channel, collisions, or an added error model |
| Traffic | Which nodes send, to whom, in what pattern |

A combined model stacks all six, for example 100 nodes placed uniformly in 1 km², a Rayleigh fading channel, 802.11b cards, and 10 FTP flows. Weeks 5 and 6 use this list again.

**Placement** (Misra 1.3.1.1, pp. 6-7). *Uniform*: nodes spread at random over an area. *Grid*: nodes at grid intersections, with no bridges or articulation points. *Random waypoint*: a node heads to a random point, pauses, then picks a new destination. Two early assumptions about random waypoint proved wrong: nodes do not stay uniformly distributed, and the average speed is far below the arithmetic mean of vmin and vmax. Random waypoint crowds nodes toward the center (details in Week 5).

**Propagation** (Misra 1.3.1.2, pp. 8-9). In the *path loss* model, power falls with distance to the power alpha, where alpha is 2 in free space and larger with obstacles; a link exists when the distance is below a radius R and not otherwise, a rough approximation. The *shadowing* model adds normally distributed random variation, so even a nearby node can miss a packet and a distant node with line of sight can still connect; it does not handle correlated shadowing. Example 1.2 (p. 9): a thick concrete building cuts every link through it while the open space beside it gives long range.

**Bridges and articulation points** (Misra Definition 1.4, p. 6). A *bridge* is a link whose removal increases the number of components of the network. An *articulation point* is a node whose removal increases the number of components. Both decide how well a network survives a failure: while the only path between two parts is down, those parts cannot reach each other. A node of degree one is a *pendant vertex*; removing it does not split the network. Week 3 uses these terms again for broadcast.

**Real networks are sparser** (Misra Table 1.2 and 1.3.4.2, pp. 14-15). The average node degree is 4.02 in the Berlin network and 7.62 under the random waypoint model, and 23.8 % of Berlin nodes are articulation points. Bridges make up 12-20 % of Berlin's links, against about 2 % in the uniform model and none in the grid model. The Berlin samples average 315 nodes and the Leipzig samples 587 (Table 1.1, p. 10).

**The reasons are social** (Misra p. 17). New participants join where connectivity is already good; participants are usually content with one link to the network, so pendant nodes are common; and users reject poor links, for example ETX above 10. Because the reasons are sociological, the authors expect similar patterns in other open multihop networks such as Hanover.

**ETX: the cost of one link** (Misra Definitions 1.5 and 1.6, p. 6). The link quality w(p,q) is the probability that a packet from p reaches q in one cycle without retransmission. The probability that a full send-and-reply cycle succeeds is w(p,q) times w(q,p). ETX, the expected number of transmissions, is 1 divided by that product. Example: if w(p,q) = 0.8 and w(q,p) = 0.5, then ETX = 1 / 0.4 = 2.5 transmissions. In Berlin, 5.3 % of bridges have link quality below 0.1 and 22.6 % below 0.5 (p. 22).

**Route discovery in Berlin** (Misra pp. 16 and 22). Berlin's open multihop network has more than 300 nodes. On the first route discovery, fewer than 30 % of nodes are reached on average, and the probability of finding a route after four attempts is 0.469. The cause is the many bridges, some of them low quality. In the simulation literature, the first route discovery reaches about 60 % of nodes even at the highest mobility and load, and above 80 % in other scenarios. Sending the RREQ as unicast across bridges raises the probability of finding a route above 0.9.

**Real traffic is uneven** (Misra 1.3.4.4, pp. 19-21, Tables 1.3 and 1.4). At Berlin's main gateway the average node uses about 1.3 GB per month, one node produced 55 GB in a month, and about 75 % of nodes use less than 1 GB per month, so the load sits on a small share of nodes. Of four simulation studies compared, only one had a load comparable to the real network. The authors suggest varied traffic types and uneven distributions. In Example 1.5 (pp. 20-21), an intensive scenario of 4 flows at 100 packets per second for 10 seconds carries 4,000 packets, and a balanced scenario of 4 flows at 35 packets per second for 100 seconds carries 14,000; because the intensive flows start at random times, in more than 70 % of cases their peak load is lower than the balanced scenario's.

**The lesson** (Misra p. 1 and 1.4, p. 23). Real topologies have low node density and many bridges and articulation points; real traffic is highly asymmetric between nodes; so a protocol that does well in simulation can behave differently in the field. Week 6 gives the full checklist to run before a simulation.
`.trim()
