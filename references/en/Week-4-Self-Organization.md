---
week: 4
title: Self-Organization, Node Cooperation, and Address Allocation
source: references/id/minggu-04.md
status: draft
books:
  - Misra, Woungang & Misra (2009), Guide to Wireless Ad Hoc Networks, chapters 2, 3, and 14
---

# Week 4: Self-Organization, Node Cooperation, and Address Allocation

Course: Integrasi Jaringan Mandiri/Mobile, Universitas Negeri Jakarta
Lecturer: Muhammad Ridho Kurniawan Pratama, M.T.I.

Translated from the Week 4 slides. Every claim carries the book and page the slide cites. This file is a draft until the lecturer reviews it (SPEC.md Section 11).

---

## 1. Learning Outcomes

After this week, a student can:

- Explain self-configuration and self-healing, the hidden terminal problem, and LCA clustering.
- Compare virtual-currency and reputation approaches to selfish nodes.
- Compare stateful, stateless, and hybrid address allocation without DHCP.

---

## 2. Real-World Usage

*Self-configuring* means the nodes form a connected network on their own; *self-healing* means that structure recovers when a node or link fails (Misra chapter 2). A network that organizes itself has two mechanisms: finding routes between nodes, and updating the topology by detecting node or link failures and optimizing the routes it found (Misra p. 29).

The designer has to accept some conditions (Misra 2.2.2, p. 31): nodes are placed at random, not in a grid or regular pattern; the wireless channel has more errors and collisions than a cable; and batteries, memory, and computing power are limited, so the number of actions a node takes must be small.

Forwarding other nodes' packets drains a node's battery with no direct benefit. In civilian MANETs, selfish behavior is the most common form of non-cooperation (Misra chapter 3). Nodes are assumed rational: they do not always want to break the protocol, but they will not waste their resources voluntarily (pp. 44-45).

Every node needs a unique address before it can take part in routing. DHCP needs a central server, and that server may be out of reach (Misra chapter 14).

---

## 3. Core Material

### 3.1 Organizing without a center {#clustering}

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

### 3.2 Selfish nodes

**Motives** (Misra pp. 44-45): using other nodes' services without returning the favor; saving the energy spent sending, receiving, and processing traffic; and preventing other nodes from getting the service they should. A node may also exploit an incentive scheme for material gain.

**Two approaches** (Misra 3.2 and 3.3, pp. 45-53). *Virtual currency* pays nodes to forward packets (Nuglets, Sprite); Nuglets needs *tamper-proof hardware* in every node, and nodes at the edge of the network struggle to earn credit, the *location privilege problem*, because central nodes get more packets to forward. *Reputation* has neighbors observe each other's behavior (CONFIDANT, CORE, OCEAN) and isolates uncooperative nodes from routes, but it is vulnerable to false accusations and false praise.

**Nuglets** (Misra 3.2.1.1, pp. 45-46). In the *packet purse* model the source loads the packet with nuglets and each intermediate node takes some; it discourages useless traffic, but estimating how many nuglets are enough is hard, and a packet that runs out on the way is dropped. In the *packet trade* model intermediate nodes buy and sell the packet and the destination pays the total; the source need not estimate the cost, but nothing stops a node from flooding the network. The amount a node takes can depend on the energy used, its battery state, and its own nuglets.

**Pricing** (Misra p. 46). A fixed fee per hop pays every forwarder the same, ignores energy and battery state, and is easy to add to any routing protocol, but it is inflexible. An auction has candidate next hops submit sealed bids, and the lowest bidder forwards; energy use is more even and the network lives longer, but the scheme is complex and adds overhead and latency. Auctions work only with multipath routing, because a node needs several paths to the same destination.

**Sprite** (Misra pp. 46-48, Figure 3.2) uses credit and a *Credit Clearance Service* (CCS). A node that receives a message keeps a receipt and reports it when it connects to the CCS. The sender, not the destination, is charged, so the destination cannot be flooded. A node counts as having forwarded only if the next node reports to the CCS. Sprite handles three kinds of cheating: keeping the receipt without forwarding, not reporting a receipt in collusion with the sender, and forwarding the receipt without the message.

**CONFIDANT** (Misra pp. 48-50, Figure 3.3) extends a reactive protocol to detect and isolate uncooperative nodes. Its *monitor* works like a neighborhood watch; its *trust manager* keeps an alarm table, trust levels, and a list of friends who receive alarms; its *path manager* re-ranks paths and deletes paths with uncooperative nodes. A rating changes only with enough evidence and past a threshold, so an ordinary collision is not taken as cheating.

**CORE** (Misra pp. 50-51) measures a node's contribution with three kinds of reputation: *subjective*, from its own observations through a *watchdog*; *indirect*, from other nodes, of which only positive information is spread; and *functional*, tied to a specific function with a weight per function. Values are normalized from minus one to plus one, so good behavior can be rewarded. A node can bank good reputation first and then stop cooperating for a while.

**OCEAN** (Misra pp. 51-52) uses only direct observation of neighbors, with no second-hand reputation. Ratings start neutral; a positive action adds one and a negative action subtracts two. A node below a threshold goes on a faulty list and is avoided through the RREQ's *avoid-list*; it leaves the list after a period of silence, but its rating is not raised. The original paper's threshold is minus forty. With no reputation exchange, trust management is simpler, but recognizing a misbehaving neighbor takes longer.

| System | Source of ratings | Range |
|---|---|---|
| CONFIDANT | Own observation plus alarms from friends | Negative only |
| CORE | Own observation plus positive reputation from others | Minus one to plus one |
| OCEAN | Direct observation of neighbors only | Up one, down two, with a threshold |

**Open problems** (Misra 3.3, pp. 52-54). Nuglets needs tamper-proof hardware so nodes cannot raise their own balance; Sprite's CCS does not suit a self-organized network and is a single point of failure; without initial trust, a reputation system can be shaken by false accusations or praise. Another research issue is the Sybil attack, one node using many identities (p. 53), covered again in Week 8. Selfishness is not always wrong (p. 54): a node may hold back to keep power for a more critical application, and a node that is the only link between two groups has a reason to pick its traffic. An incentive system has to balance encouraging cooperation against wasting resources.

### 3.3 Unique addresses without DHCP {#address-allocation}

**Why traditional schemes do not fit** (Misra 14.2.3, p. 337). Stateful allocation needs a server, but the topology keeps changing and a central server may be unreachable. Stateless allocation assumes every node is reachable by one-hop broadcast. MAC addresses are not always unique: they can be changed, not every device has one, and they reveal a node's identity. Zeroconf does *duplicate address detection* (DAD) through ARP, which may not work in a MANET, and a 48-bit MAC address is too long for an IPv4 address.

**MANETconf and query-based DAD** (Misra 14.3.1.1 and 14.3.2.1, pp. 337-341). In MANETconf (stateful), a new node asks for an address through an *initiator*, the initiator asks every node for permission, and the address is granted when all agree; MANETconf handles network partitions and merges. In query-based DAD (stateless), a node picks a random address and sends an AREQ for it; if no AREP comes back after several tries, it uses the address. QDAD repeats the AREQ up to a retry limit, and it fails if the delay is unbounded during a partition.

**MANETconf in detail** (Misra pp. 337-338). Each configured node keeps an *allocated* table of every address in use and a *pending* table of addresses whose allocation has started but not finished. A single negative answer makes the initiator start over with another address. A new node enters by broadcasting a *Neighbor-Query*; with no answer, it assumes it is the first node and gives itself an address.

**Partitions and merges** (Misra p. 338). Each partition has an ID made of the lowest address in use and a UUID. Two nodes that meet exchange partition IDs; if the IDs differ, a merge is happening. The address tables are combined, and an address that appears in both must be replaced on one side. The node that should give way is the one with fewer or shorter-lived TCP connections, so ongoing communication is not disturbed.

**Buddy** (Misra pp. 338-339). The Buddy protocol splits the address table among all nodes, so no node needs permission. The node a newcomer contacts gives it half of its address pool (binary splitting). A node that leaves properly returns its pool to a neighbor to merge again. A node that vanishes suddenly takes its pool with it, so nodes need periodic synchronization. The main weakness: the address space is used unevenly if many new nodes join in one small area. The remedies are allocation from far away and collecting idle addresses.

**Prophet and Prime DHCP** (Misra pp. 339-341, Figure 14.1). These compute addresses instead of asking for them. In Prophet, a node uses a stateful sequence function, and each new node receives one number and one seed; collisions cannot be ruled out entirely. In Prime DHCP, every node acts as a DHCP proxy and uses a prime-numbering algorithm: in PNAA the root has address 1 and hands out primes, and a node with address X hands out multiples of X by prime factors no smaller than X's largest prime factor. Both need only one-hop broadcast, so their communication overhead is much smaller.

**Weak and passive DAD** (Misra 14.3.2.2 and 14.3.2.3, pp. 341-343). *Weak DAD* allows duplicate addresses as long as packets do not reach the wrong node: each node creates a unique key at start-up and spreads it with its address in routing packets, and the routing load grows with the key length; if two nodes happen to pick the same address and key, weak DAD cannot detect it. *Passive DAD* detects conflicts from existing routing traffic, adds no new control packets, uses the sequence-number rules of link-state packets, and must take care when sequence numbers wrap around. *Strong DAD* cannot be guaranteed when the delay between nodes is unbounded, which is exactly what often happens when a network splits and merges.

**PACMAN** (Misra p. 343) chooses addresses probabilistically and detects conflicts passively. The node assigns itself an address on joining (the stateless side) while an allocation table is still kept so addresses are almost always unique (the stateful side). A conflict is resolved with an ACN message sent as unicast toward where the conflicting routing packet came from. Conflicts are possible when many nodes join at once, for example when two networks merge, before the allocation table is current.

**Four metrics** (Misra 14.4, pp. 343-344):

| Metric | What it measures |
|---|---|
| Allocation latency | Time from the start of configuration until the node has an address |
| Communication overhead | Number of control packets, broadcast and unicast |
| Scalability | The more multihop communication, the worse it scales |
| Complexity | A scheme that is too complex is unrealistic for mobile devices |

Kim et al. built an analytical model to compare QDAD, MANETconf, token-based schemes, and neighbor-based schemes on the first two metrics.

---

## 4. Summary

| Idea | Core point |
|---|---|
| Hidden terminal | Two senders that cannot hear each other can collide at the receiver |
| LCA | A simple ID rule is enough to form clusters without a center |
| Self-healing | Monitor, detect, diagnose, decide, prevent |
| Cooperation | Incentives pay for service; reputation isolates the uncooperative |
| Addresses | Stateful asks permission, stateless checks for duplicates, hybrids combine both |

Week 5 moves down a layer: how node movement and signal propagation are modeled, and what that means for every protocol covered so far.
