// Hand-written case study copy (SPEC.md §19.0), not generated. Every cost or property it states
// is quoted from the week reference it names; the scenario itself is illustrative.

export const scenario = `## The problem

*Illustrative scenario, set by Week 1's emergency-response example and its quiz question about a search-and-rescue network on a slope; the course references do not describe this network.* A search-and-rescue team of three works on a mountain slope with no cellular coverage. On the way up the team left five relay radios along the trail, R1 to R5, and a gateway G at the base camp connects to the outside. The team radios are T1, T2, and T3.

When a team member sends a report, the radios have to find a route to G on their own, without flooding the channel. The team also wants to know which relay it cannot afford to lose.

## What the network has to do

1. Pass a report from a team radio to G across several relays, with no infrastructure on the slope.
2. Find that route only when someone has a report, and spread the request with as few transmissions as possible.
3. Show which relay is the only way between the team and G.

## Try it in the simulator

With MPR relays, run Discover route to base from T1. Count the transmissions: T1, T2, R1, R2, R4, and R5 relay, and T3 and R3 stay silent because no neighbor chose them. Switch to Blind flooding and run it again: all eight radios relay, and the duplicate counter climbs to 15. Both designs find the same route, T1, T2, R1, R2, R4, R5, G.

Open the Topology view. R1, R4, and R5 are articulation points, and the links R4-R5 and R5-G are bridges. Let R2 walk away and the team still reaches G through R3; let R5 walk away and G is cut off.

Finish with the Metrics run. Every report arrives under both designs on this static slope, so the difference shows in the control overhead.
`

export const reasoning = `## Every radio is a router

There is no access point on a slope. Week 1 defines an ad hoc network as devices that communicate without a central administrator, where each node works as both a host and a router (Loo p. 5). A team radio that cannot reach G directly hands its report to a relay, and the relay forwards it.

## Look for a route only when there is a report

Reports are occasional. A proactive protocol such as DSDV keeps a route to every destination and pays its control overhead even when no data flows; Week 2 calls that overhead high and unsuited to large networks (Loo p. 28). A reactive protocol such as AODV floods a route request only when a source has data, at the price of a delay before the first packet (Loo Table 2.1, p. 23). For a team that reports now and then, the delay is the cheaper cost.

## Keep the flood small

The route request still has to reach G, and blind flooding makes every radio repeat it. Week 3 lists what that costs on a shared channel: redundant rebroadcasts, contention, and collisions (Misra pp. 122-123). With multipoint relays each radio picks the few neighbors that cover its two-hop neighbors, and only those relay (Misra pp. 126-127). On this slope that removes two of the eight transmissions and six of the fifteen duplicates. The price is reliability: blind flooding is more reliable precisely because every node repeats the packet (Misra pp. 139-142).

## Know the weak relay

A bridge or an articulation point is the only way between two parts of a network (Misra Definition 1.4). Counting a radio's neighbors does not reveal that, because R4 has three neighbors and is still a cut. Week 1 names bridges as the reason route discovery so often failed in the Berlin community network (Misra pp. 16 and 22).
`
