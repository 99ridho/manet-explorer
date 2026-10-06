// SPEC.md §11: generated from references/en/Week-4-Self-Organization.md (the {#address-allocation} subsections of §3).
// Do not edit: regenerate with `node scripts/extract-content.mjs` after the reference changes.

export const coreMaterial = `
### 3.3 Unique addresses without DHCP

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
`.trim()
