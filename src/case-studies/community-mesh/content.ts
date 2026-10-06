// Hand-written case study copy (SPEC.md §19.0), not generated. Every cost or property it states
// is quoted from the week reference it names; the scenario itself is illustrative.

export const scenario = `## The problem

*Illustrative scenario, set by Week 1's Berlin and Leipzig community networks; the course references do not describe this mesh.* A neighborhood runs its own mesh of rooftop routers. One household, S, reaches the Internet gateway, D, either over two long, weak links through X or over four short, strong ones through A, B, and C. The delivery ratios on the canvas are example values: 0.95 on the short links and 0.5 on the long ones.

Later a new router, M, joins next to S and advertises a link to D that it does not have.

## What the mesh has to do

1. Choose between a short route over weak links and a longer route over strong ones.
2. Keep delivering when a router lies about its routes.
3. Judge the result by what the household actually receives.

## Try it in the simulator

With ETX with watchdog, run Find route: S, X, D has 2 hops but ETX 8.00, and S, A, B, C, D has 4 hops and ETX 4.43, so S takes the long way. Switch to Hop count and run it again: S picks S, X, D. Deliver 20 packets under each and compare how many arrive; the weak route loses packets when all 4 tries of a hop fail.

Now run Router M joins, then Find route. M answers at once with a route it does not have, and both designs choose it. Deliver 20 packets: the hop mesh delivers none, while the watchdog counts M's silence, reports it after the fourth failure, and switches S to S, A, B, C, D. The Trust view shows the count. Finish with the Metrics run, which repeats this with 30 packets for both designs.
`

export const reasoning = `## Fewer hops is not faster

Week 7 states it plainly: fewer hops means longer hops, and link quality falls with distance (Misra pp. 368-369). ETX counts the transmissions a link is expected to need, one divided by the product of the delivery ratios in both directions (Misra Definitions 1.5 and 1.6). A long link at 0.5 each way costs 4 expected transmissions, so two of them cost 8, while four short links at 0.95 cost about 4.43 together. Week 7 adds that ETX routes take more, shorter hops and still get better TCP throughput.

## A router can lie

A black hole claims a route to the destination, so the source sends its data through it, and it drops every packet without a trace (Misra pp. 460-461). M's claimed link looks perfect, so neither hop count nor ETX can see through it: both choose S, M, D. Trusting every reply is what fails here.

## Listen to the next hop

The watchdog keeps a copy of each packet and listens for the next node to forward it; when the failure count passes a threshold, the node is reported and the pathrater avoids it (Misra pp. 444-445). Week 8 notes that the watchdog suits source routing, so the mesh discovers routes DSR-style and the source holds every candidate it can switch to. The watchdog has blind spots: collisions can hide a forward, a node can accuse an honest one, and it cannot detect collaborative attacks or partial dropping (Misra pp. 444-446).

## Judge by what arrives

Week 6 names the metrics that matter to the household: the packet delivery ratio, the delay, and the control overhead (Misra pp. 86-87). Route length alone would have praised S, X, D and S, M, D, the two routes that serve the household worst.
`
