---
week: 8
title: Security and Trust
source: references/id/minggu-08.md
status: draft
books:
  - Misra, Woungang & Misra (2009), Guide to Wireless Ad Hoc Networks, chapters 17, 18, and 19
---

# Week 8: Security and Trust

Course: Integrasi Jaringan Mandiri/Mobile, Universitas Negeri Jakarta
Lecturer: Muhammad Ridho Kurniawan Pratama, M.T.I.

Translated from the Week 8 slides, Parts 1 and 2. Part 3 of the slides is the final project brief, which is outside this explorer's scope (SPEC.md Section 2); only its security measurement plan (section 2 below) and its eight-week summary (section 4) are kept, because they close the lecture material. Every claim carries the book and page the slide cites. This file is a draft until the lecturer reviews it (SPEC.md Section 11).

---

## 1. Learning Outcomes

After this week, a student can:

- Describe routing attacks from their elements: sinking, rushing, spoofing, replay, and modification.
- Explain the black hole, gray hole, and wormhole attacks.
- Compare anomaly-based and misuse-based detection, and explain the watchdog and its limits.
- Describe the parts of a trust system and the decisions it makes.

---

## 2. Real-World Usage

The routing protocols of Weeks 2 and 3 assume every node is honest. Attackers exploit that assumption (Misra chapter 18).

Prevention alone is not enough. Nodes must detect misbehavior and decide whom to trust (Misra chapters 17 and 19).

The security project direction in the course asks students to run the same scenario with and without attacking nodes and to measure the drop in packet delivery ratio, the rise in delay, and the change in control overhead, then to add a detection mechanism and measure how much of the loss it recovers. A reference figure from Misra (p. 445): the watchdog and pathrater raise throughput by 17 % when 40 % of nodes misbehave, at an overhead of 9 to 17 percent.

---

## 3. Core Material

### 3.1 Attacks on routing {#routing-attacks}

**Attack elements** (Misra Figure 18.1). Misra divides attacks into three levels: scenario, behavior, and element. Common elements:

- *Sinking*: a node deliberately drops packets, to save battery or to damage routing.
- *Rushing*: in reactive protocols only, the attacker forwards the RREQ faster so it gets onto the route. It works because a node forwards only the first RREQ it receives (recall AODV in Week 2).
- *Spoofing*: the attacker poses as another node by forging the source address.
- *Replay*: sending old routing messages again.
- *Modifying*: changing the content of messages, such as sequence numbers.

**Black hole** (Misra 18.4.3.1, pp. 460-461, Figure 18.2). M claims to have a route to D, so S sends its data through M, and M drops every packet without a trace. The *gray hole* variant drops only part of the traffic, which makes it harder to detect. Misra also gives the example of M forging another node's identity so an honest node takes the blame.

**Wormhole** (Misra 18.4.3.2, pp. 461-462, Figure 18.3). Two malicious nodes in two different areas build a tunnel, and routing messages from one area are replayed in the other. Nodes believe the route through the tunnel is the shortest, although the attacker controls all its traffic. Because the traffic is tunneled, encryption and access control do not prevent the attack. Having captured the link, the attacker can be passive (traffic analysis, location tracking) or active (dropping and manipulating traffic). Passive attacks are especially dangerous for military applications.

**Other scenarios** (Misra 18.4.3.3-18.4.3.6, pp. 462-463):

| Scenario | How it works |
|---|---|
| Network partitioning | A malicious node removes routes so part of the network becomes unreachable |
| Cache poisoning | Adding, removing, or changing routes in a neighbor's cache |
| Selfishness | A node refuses to forward to save battery and bandwidth |
| Sleep deprivation | Flooding the victim with junk routing messages until its power is gone |

Detecting a partition statistically is actually easy, but the attacker can hide it behind lower-layer attacks such as *jamming* or *MAC flooding*. In a dense network, selfishness only lowers efficiency; in a sparse one, it makes part of the area unreachable.

**Threat analysis in three stages** (Misra 18.5, pp. 463-464), with OLSR as the example: study the implementation (how malicious information spreads and how far each message type reaches); derive the cause and effect between attack behavior and the disruption it causes; and assess the risk of each routing message type from those findings. Students can use this framework to analyze their chosen protocol in the final project, not only to measure the performance drop.

### 3.2 Detection and trust {#routing-attacks}

**Intrusion detection** (Misra 17.2, pp. 428-429). *Anomaly-based* detection models normal behavior and treats deviation as intrusion; it can detect attacks not seen before, but false positives can be high. *Misuse-based* (signature) detection matches activity against attack signatures; it is efficient with few false positives, but it cannot detect new attacks and its signature database needs frequent updates. A third approach, *specification-based*, detects violations of the protocol specification and has been applied to many MANET routing protocols, AODV included (p. 436).

**IDS in a MANET** (Misra 17.3, pp. 429-430). There is no central point, such as a router or gateway, from which to watch all traffic; each node sees only part. Under mobility it is hard to tell a compromised node from one that has not received an update. Distributed IDS agents must save bandwidth, processing, and power. So a MANET IDS is usually distributed and cooperative: every node runs an agent and exchanges evidence with its neighbors or its cluster head.

**The watchdog** (Misra 17.4.2.1, pp. 444-445), the earliest mechanism for detecting misbehaving nodes. A node keeps a copy of a packet and listens to check that the next node really forwards it. If the failure count passes a threshold, the node is reported to the source. The *pathrater* chooses the most reliable path, not the shortest, from each node's rating. The simulation results: throughput rises 17 % when 40 % of nodes misbehave under moderate mobility, with an overhead of 9 to 17 percent. Its weaknesses: it cannot detect collaborative attacks or partial dropping, and it suits only *source routing* protocols.

**When the watchdog judges wrongly** (Misra pp. 444-446). Ambiguous collisions or collisions at the receiver hide a forward from the listener. A node can adjust its transmit power so the watcher thinks the packet was sent. A node can falsely accuse another node of misbehaving. The watchdog also keeps forwarding packets for misbehaving nodes, which helps them; the *nodes bearing grudges* scheme answers this by refusing to forward their packets (pp. 445-446).

**Trust management** (Misra 19.3.1-19.3.2, pp. 478-479). *Trust* is a prediction of a node's future actions; *reputation* is an opinion based on its past actions. A trust system has an evidence manager (collects and groups evidence of behavior), a mathematical model (turns evidence into opinion and predicts the next interaction), and a policy manager (sets decision rules, for example whether to include a node in a route). CONFIDANT from Week 4 is a reputation system analyzed in section 19.4.4.

**Kinds of evidence** (Misra pp. 479-480). *Hard evidence* is credentials such as digital certificates, evaluated with cryptography, with a simple policy (the identity matches or it does not); it suits organizations with a central authority. *Soft evidence* is observed behavior, gathered by passive monitoring, acknowledgments, or IDS; it can handle new kinds of attack without changing the protocol, but needs a mathematical model to turn it into opinion. Because a MANET has no hierarchy or central authority, its trust systems are almost always decentralized and installed in every node.

**Trust decisions** (Misra p. 480). A node decides whether to accept or reject a newly discovered route and which path to use; whether to send or forward packets on behalf of other nodes; and whether to accept or ignore a recommendation, and whether to warn other nodes. The mathematical models vary: graph-based, entropy-based, and Bayesian. Recommendations between nodes create indirect relationships without a higher authority.

---

## 4. Summary

| Weeks | What carries into the project |
|---|---|
| 1-2 | A MANET has no infrastructure; routes are built proactively, reactively, or hybrid |
| 3-4 | Frugal broadcast, multicast, positions, clusters, and node cooperation |
| 5-6 | Mobility and propagation models, simulators, and evaluation metrics |
| 7 | QoS, delay, congestion, and energy efficiency |
| 8 | Attacks, detection, and trust as the last layer |

The final project asks for two things at once: a clear question and a methodology that others can check.
