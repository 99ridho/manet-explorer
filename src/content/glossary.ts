// SPEC.md §20: plain-words definitions shown when a student taps a term in narration or a scenario.
// `match` lists the spellings to find; acronyms match case-sensitively, words in any case.

export interface GlossaryEntry {
  term: string
  match: string[]
  definition: string
}

export const glossary: GlossaryEntry[] = [
  {
    term: 'MANET',
    match: ['MANET', 'MANETs'],
    definition:
      'Mobile ad hoc network: devices that talk to each other directly, with no access point or central administrator. Each device works as both a host and a router (Loo p. 5).',
  },
  {
    term: 'node',
    match: ['node', 'nodes'],
    definition: 'One device in the network: a phone, a laptop, a radio. On the canvas it is a circle with a label.',
  },
  {
    term: 'link',
    match: ['link', 'links'],
    definition: 'Two nodes close enough to hear each other directly. On the canvas it is a line between them.',
  },
  {
    term: 'radio range',
    match: ['radio range', 'in range', 'out of range'],
    definition: 'How far a node can be heard. Hover over a node on the canvas to see its range as a circle.',
  },
  {
    term: 'neighbor',
    match: ['neighbor', 'neighbors'],
    definition: 'A node within radio range, so the two share a link.',
  },
  {
    term: 'hop',
    match: ['hop', 'hops'],
    definition: 'One transmission from a node to a neighbor. A route of three hops passes through two nodes in between.',
  },
  {
    term: 'route',
    match: ['route', 'routes'],
    definition: 'The chain of nodes a packet follows from its source to its destination.',
  },
  {
    term: 'next hop',
    match: ['next hop'],
    definition: 'The neighbor a node hands a packet to on the way to a destination. A node can know its next hop without knowing the rest of the route.',
  },
  {
    term: 'packet',
    match: ['packet', 'packets'],
    definition: 'One message sent over the network: data, or a control message that protocols use to find and fix routes.',
  },
  {
    term: 'broadcast',
    match: ['broadcast', 'broadcasts'],
    definition: 'One transmission that every neighbor in range hears at once, instead of a message to one chosen neighbor.',
  },
  {
    term: 'flood',
    match: ['flood', 'flooding'],
    definition: 'Every node that hears a message broadcasts it once more, so the message spreads across the whole network.',
  },
  {
    term: 'AODV',
    match: ['AODV'],
    definition: 'Ad hoc On-demand Distance Vector routing. A reactive protocol: each node on a route remembers only the next hop toward the destination.',
  },
  {
    term: 'DSR',
    match: ['DSR'],
    definition: 'Dynamic Source Routing. A reactive protocol: the source stores the whole route and writes it into every data packet.',
  },
  {
    term: 'reactive protocol',
    match: ['reactive protocol', 'reactive protocols'],
    definition: 'A routing protocol that looks for a route only when a node has data to send (Loo 2.2-2.3, pp. 20-22).',
  },
  {
    term: 'proactive protocol',
    match: ['proactive protocol', 'proactive protocols'],
    definition: 'A routing protocol that keeps a route to every destination ready all the time, even when no data flows (Loo 2.2-2.3, pp. 20-22).',
  },
  {
    term: 'RREQ',
    match: ['RREQ'],
    definition: 'Route request. The message a source floods to ask the network for a route to a destination.',
  },
  {
    term: 'RREP',
    match: ['RREP'],
    definition: 'Route reply. The answer the destination sends back toward the source once a route request reaches it.',
  },
  {
    term: 'RERR',
    match: ['RERR'],
    definition: 'Route error. The warning a node sends when a link on a route breaks, so other nodes stop using that route.',
  },
  {
    term: 'route cache',
    match: ['route cache'],
    definition: 'Where a DSR node stores whole routes it has learned, so it can reuse them without searching again.',
  },
  {
    term: 'request id',
    match: ['request id', 'request number'],
    definition: 'A number the source gives each new search. Nodes use it to tell a fresh request from a copy they have already handled.',
  },
  {
    term: 'relay',
    match: ['relay', 'relays'],
    definition: 'A node that passes on a packet meant for someone else.',
  },
  {
    term: 'duplicate',
    match: ['duplicate', 'duplicates'],
    definition: 'A second copy of a packet a node already has. It costs airtime and brings nothing new.',
  },
  {
    term: 'acknowledgment',
    match: ['acknowledgment', 'ACK'],
    definition: 'A short reply that tells the sender a packet arrived. Without it, the sender tries again.',
  },
  {
    term: 'bridge',
    match: ['bridge', 'bridges'],
    definition: 'A link whose loss splits the network into two parts that cannot reach each other (Misra Definition 1.4, p. 6).',
  },
  {
    term: 'articulation point',
    match: ['articulation point', 'articulation points'],
    definition: 'A node whose loss splits the network into parts that cannot reach each other (Misra Definition 1.4, p. 6).',
  },
  {
    term: 'unit disk',
    match: ['unit disk', 'unit disk graph'],
    definition: 'A link model: two nodes are linked when they are within range and never otherwise.',
  },
  {
    term: 'quasi unit disk graph',
    match: ['quasi unit disk graph'],
    definition: 'A link model with an uncertain band: near nodes always link, far nodes never do, and in between a link may or may not exist (Loo pp. 41-42).',
  },
  {
    term: 'shadowing',
    match: ['shadowing'],
    definition: 'A link model that adds a random loss to every signal, so a near node can miss a packet and a far one can still connect (Misra pp. 8-9).',
  },
  {
    term: 'ETX',
    match: ['ETX'],
    definition: 'Expected transmission count: how many tries one delivery over a link takes on average, 1 divided by the delivery ratios of both directions multiplied (Misra p. 6).',
  },
  {
    term: 'DSDV',
    match: ['DSDV'],
    definition: 'Destination-Sequenced Distance Vector. A proactive protocol: every node keeps a route to every destination and shares its table with its neighbors.',
  },
  {
    term: 'sequence number',
    match: ['sequence number', 'sequence numbers'],
    definition: 'A number a node attaches to news about itself and raises over time. A higher number marks the fresher route.',
  },
  {
    term: 'full dump',
    match: ['full dump'],
    definition: 'An update that sends the whole routing table, changed or not (Misra p. 66).',
  },
  {
    term: 'incremental update',
    match: ['incremental update', 'incremental updates'],
    definition: 'An update that sends only the routes that changed since the last one (Misra p. 66).',
  },
  {
    term: 'HELLO',
    match: ['HELLO'],
    definition: 'A short message a node broadcasts now and then so its neighbors know it is there and whom it can hear.',
  },
  {
    term: 'MPR',
    match: ['MPR', 'MPRs', 'multipoint relays'],
    definition: 'Multipoint relay. A neighbor a node chooses to repeat its broadcasts; together its MPRs reach every node two hops away.',
  },
  {
    term: 'two-hop neighbor',
    match: ['two-hop neighbor', 'two-hop neighbors'],
    definition: 'A node that is not in range but is in range of one of your neighbors.',
  },
  {
    term: 'greedy forwarding',
    match: ['greedy forwarding', 'greedy'],
    definition: 'Geographic routing rule: hand the packet to the neighbor closest to the destination.',
  },
  {
    term: 'void',
    match: ['void', 'voids'],
    definition: 'A gap where no neighbor is closer to the destination, so greedy forwarding gets stuck although a path may exist.',
  },
  {
    term: 'perimeter mode',
    match: ['perimeter mode', 'perimeter walk'],
    definition: 'GPSR\'s recovery: the packet walks around the edge of a void until it reaches a node closer to the destination.',
  },
  {
    term: 'Gabriel graph',
    match: ['Gabriel graph'],
    definition: 'The links that remain when every link with another node inside the circle over it is removed. No two of them cross.',
  },
  {
    term: 'cluster head',
    match: ['cluster head', 'cluster heads'],
    definition: 'The node that coordinates a cluster, a small group of nodes one hop from it.',
  },
  {
    term: 'gateway',
    match: ['gateway', 'gateways'],
    definition: 'A node that connects two parts of a network: two clusters in Week 4, or a mesh and the Internet.',
  },
  {
    term: 'DHCP',
    match: ['DHCP'],
    definition: 'The server that hands out addresses on an ordinary network. An ad hoc network usually has none.',
  },
  {
    term: 'Buddy',
    match: ['Buddy'],
    definition: 'An address scheme that splits the address space among the nodes: a newcomer gets half of the range of the node it meets (Misra pp. 338-339).',
  },
  {
    term: 'query-based DAD',
    match: ['query-based DAD'],
    definition: 'Duplicate address detection: a node picks a random address and asks the network whether anyone uses it (Misra pp. 337-341).',
  },
  {
    term: 'AREQ',
    match: ['AREQ'],
    definition: 'Address request. The flooded question "does anyone use this address?"',
  },
  {
    term: 'AREP',
    match: ['AREP'],
    definition: 'Address reply. The answer from a node that already uses the requested address.',
  },
  {
    term: 'partition',
    match: ['partition', 'partitions'],
    definition: 'A part of the network that cannot reach the rest, for example a group of nodes out of range.',
  },
  {
    term: 'mobility model',
    match: ['mobility model'],
    definition: 'The rule a simulation uses to move the nodes.',
  },
  {
    term: 'random waypoint',
    match: ['random waypoint'],
    definition: 'A mobility model: each node walks to a random point at a random speed, pauses, and picks another (Misra pp. 240-241).',
  },
  {
    term: 'RPGM',
    match: ['RPGM'],
    definition: 'Reference Point Group Mobility: each group\'s center follows a path and its members wander around it (Misra pp. 244-245).',
  },
  {
    term: 'tick',
    match: ['tick', 'ticks'],
    definition: 'One step of time in this simulator. In one tick every message in flight crosses one link.',
  },
  {
    term: 'connected dominating set',
    match: ['connected dominating set', 'backbone'],
    definition: 'A set of nodes such that every node is in it or next to a member, and the members are connected to each other (Loo pp. 45-46).',
  },
  {
    term: 'standard deviation',
    match: ['standard deviation'],
    definition: 'How far the results of single runs typically sit from their mean.',
  },
  {
    term: 'packet delivery ratio',
    match: ['packet delivery ratio', 'delivery ratio'],
    definition: 'The share of data packets sent that arrive (Misra pp. 86-87).',
  },
  {
    term: 'control overhead',
    match: ['control overhead', 'overhead'],
    definition: 'The routing messages a protocol sends to find and keep routes, as opposed to the data itself (Misra pp. 86-87).',
  },
  {
    term: 'QoS',
    match: ['QoS'],
    definition: 'Quality of service: a promised level such as a minimum bandwidth or a maximum delay (Misra pp. 282-284).',
  },
  {
    term: 'bandwidth',
    match: ['bandwidth', 'Mbps'],
    definition: 'How much data a link can carry per second, here in megabits per second (Mbps).',
  },
  {
    term: 'network lifetime',
    match: ['network lifetime'],
    definition: 'The time until the first node runs out of power (Loo p. 203).',
  },
  {
    term: 'black hole',
    match: ['black hole'],
    definition: 'An attacker that claims a route it does not have, then drops every packet sent through it (Misra pp. 460-461).',
  },
  {
    term: 'wormhole',
    match: ['wormhole', 'tunnel'],
    definition: 'Two attackers joined by a hidden link who replay messages from one area in another, so their route looks shortest (Misra pp. 461-462).',
  },
  {
    term: 'watchdog',
    match: ['watchdog'],
    definition: 'A node that listens after handing a packet on, to check that the next node forwards it (Misra pp. 444-445).',
  },
  {
    term: 'pathrater',
    match: ['pathrater'],
    definition: 'The part that steers routes away from nodes the watchdog reported (Misra pp. 444-445).',
  },
]
