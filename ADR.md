# Architecture decision records

One record per decision, oldest first. A new decision gets the next number. A reversed decision keeps its record and gains a "Superseded by ADR-NNN" line.

## ADR-001: Topics plus case studies

- Date: 2026-09-28
- Status: Accepted

One topic per mechanism for Weeks 1–8, and three case studies (SAR slope, relief camp, community mesh), as in dsa-course.

## ADR-002: Step traces plus a seeded metrics run

- Date: 2026-09-28
- Status: Accepted

The dsa-course step engine for protocol traces, and §9.1's deterministic run for PDR, delay, and overhead comparisons. No full discrete-event simulator.

## ADR-003: English UI

- Date: 2026-09-28
- Status: Accepted

The UI is in English, with English references drafted from the Indonesian slides and reviewed before use.

## ADR-004: Weeks 1–8 only

- Date: 2026-09-28
- Status: Accepted

The Weeks 9–16 project phase gets no sandbox and no roadmap row.

## ADR-005: Python-like pseudocode only

- Date: 2026-09-28
- Status: Accepted

No language tabs, unlike dsa-course.

## ADR-006: No `d3-force`

- Date: 2026-09-28
- Status: Accepted

Nodes have coordinates from the seed or seeded placement.

## ADR-007: Baseline

- Date: 2026-09-28
- Status: Accepted

The shell is copied from dsa-course with the §7.1 and §8 amendments. `CodePanel` has no tabs. `StructurePanel` became `ProtocolPanel`. The shell clears steps when the operation changes: dsa-course keeps them, and the old steps then highlighted lines of the new listing. `public/favicon.svg` is dsa-course's icon as a placeholder until this project gets its own.

## ADR-008: GFM tables

- Date: 2026-09-29
- Status: Accepted

`MarkdownContent` adds `remark-gfm` and table styles, because the references quote book tables (Loo Table 2.1 printed as raw pipes without them). The table wrapper scrolls on its own, so the page never overflows at 400px. dsa-course's copy lacks the same plugin.

## ADR-009: Weeks 3 and 4

- Date: 2026-09-30
- Status: Accepted

The MPR seed follows the slide's four-step table, so line 8 fixes both B and D (the slide's example picks D greedily; same set). The perimeter walk adds GPSR's face change, because the plain clockwise walk failed on connected random networks. `NetworkCanvas` gained a `nodeLabels` prop for addresses instead of a snapshot field, so §7.2 stays verbatim.

## ADR-010: Every SPEC listing in §7.1 style

- Date: 2026-09-30
- Status: Accepted

§9.1, 10.2, 10.8 to 10.11, and 19 were rewritten from prose into Python ahead of implementation, with their step tables renumbered. 10.8 Advance (`advance-rwp`, `advance-rpgm`) and 19.1 Discover (`discover-flooding`, `discover-mpr`) split into one id per listing.

## ADR-011: Week 2 DSDV, the shared simulation layer, and Week 5

- Date: 2026-10-06
- Status: Accepted

DSDV prints one node's routing table under the network, with a button per node to pick another; a step that is about a node shows that node's table. `src/lib/sim/run.ts` is the §9.1 tick model: a flow sends one packet per tick, waits for an AODV-style discovery (the flood and the RREP each take a tick per hop), drops a packet whose next link is gone and sends an RERR back, retries a failed discovery 2 ticks later, and loses whatever has not arrived at the horizon. The result step of a metrics run carries a `metrics` field on the topic's snapshot, and the canvas draws `MetricsBars` while it is set. `NetworkCanvas` gained `trails` and `extent` props for moving nodes, so §7.2 stays verbatim. A live-field chip of 14 characters truncates in the browser, so the limit is 13; Week 5's chips are `lasts` and `paths` instead of `meanDur` and `pathAvail`.

## ADR-012: Week 6 metrics placement

- Date: 2026-10-06
- Status: Accepted

§10.9's Metrics over seeds places 10 nodes in 6 × 4 but names no radius. At the topic's 1.2 most seeds left the flows disconnected under both graph models, so the bars were equal; this demo uses a radius of 2 for that placement, and the Protocol tab says so.

## ADR-013: Weeks 7 and 8 and the case studies

- Date: 2026-10-06
- Status: Accepted

QoS routing labels only what the active metric uses: Mbps for bandwidth, ETX for ETX, batteries under the nodes for energy, batteries on hover otherwise. A label on a horizontal link sits below it, clear of the node circles. Week 8's Randomize restores the variant's seed as §10.11 says, but its button still reads Randomize: `OperationBar` has no per-topic label, and §7.1 forbids extending `TopicModule` for one topic. The tick-by-tick DSR flood lives in `src/lib/dsr-flood.ts` for `routing-attacks` and `community-mesh`. A metrics run with nothing random names its scope instead of a seed ("the slope as it stands"). The relief camp's variant tabs read Teams (RPGM) and Alone (RWP), because the §19.2 labels overflow 400px, and its canvas fits the radios rather than the 12 × 8 area. The community mesh's two predict questions ask about Find route, because §19.3's (after M receives packet 1, after M's fourth failure) need M joined and a route found, and a predict question runs on the fresh seed; the fourth-failure question became a choice question. Live-field chips that would read 14 characters show `n/a` or `0` for nothing.

## ADR-014: Beginner layer

- Date: 2026-10-06
- Status: Accepted

Students new to networking get a story per topic, a reason on every step, a glossary, and a Start here page (SPEC §20). The stories cast the slide nodes as devices instead of drawing new seeds, so the canvas still matches the lecture figures and no step table or pinned result changes. A why may reason about the mechanism beyond the slides; numbers and book facts still follow §18. `Step.why` and `TopicModule.story` amend §7.1, optional until every topic has them, and a step's reason is set with `why()` after `push()` so the existing push calls keep their shape. Glossary terms open a Radix popover on click, tap, or Enter, because a tooltip does not open on touch. Which block marked a term first is kept in a map keyed by block, because a set filled during render was already full on React's second StrictMode render and marked nothing. Reactive Routing is the pilot; the other weeks follow after review.

## ADR-015: Scenario replaces Real-World Usage

- Date: 2026-10-06
- Status: Accepted

Every topic and case study simulator now has a story and a why on every step, so `story` is required on `TopicModule`. The Scenario tab took the place of Real-World Usage at the course owner's request, because a worked story covers what that tab was for. `content` keeps `coreMaterial` only, and `extract-content.mjs` no longer copies §2 of the references, which stay unchanged. A scenario that needs a §2 fact quotes it with its page. Who's who lists only the active variant's seed nodes, because the Week 8 variants and the case studies cast nodes the other variants lack. Randomize marks the story roles as not applying only when the nodes really changed, because Week 8's Randomize restores its scene.


## ADR-016: Placed nodes keep a minimum gap

- Date: 2026-10-07
- Status: Accepted

Nodes that Randomize or a join placed could land on top of each other, because random positions had no minimum distance and joins only stepped 0.4 units to the right. `spread()` in `src/lib/sim/placement.ts` now keeps random nodes 0.8 units apart (`MIN_GAP`), which leaves room for a node beside an MPR or head ring, and `connectedUnitDisk` uses it. Joins go through `freeSpot()`: the old spot when it is clear, else the first clear spot on rings around the anchor. Clustering asks for 1 unit so a new node clears a head's two rings, and address allocation asks for 1 unit between strips that include the two caption lines under each node. This moved one pinned result in §10.6: 7 linked to 6 and 8 now lands at (2.5, 2.2) instead of (2.8, 1.3), which sat 0.36 from 8. Randomize draws different networks for the same seed. The evaluation metrics run keeps `uniform()`, so its pinned numbers do not change. `src/lib/sim/placement.test.ts` checks the gap for every topic's Randomize and for chained joins.

Moving nodes in Mobility, Relief Camp, and SAR Slope can still meet, and their positions feed pinned results (seed 5 positions, 43.8 % in the centre quarter, the metrics runs). So `NetworkCanvas` also draws every node through `separate()` (`canvas/separate.ts`), which pushes any pair closer than `MIN_GAP` apart on screen and shifts that node's trail with it. The model keeps its positions, so links, captions, and pinned numbers do not change; only the drawn circle moves.

## ADR-017: The Code panel shows the call and its variables

- Date: 2026-10-07
- Status: Accepted

Students could see which line ran but not the values it ran with, so the Code panel now shows, under the Why line, the call the highlighted line runs inside (`elect(net, rank=highest)`) and chips for the listing's variables at that line (`v = 9`, `n = 2`). The call line is derived, not stored: `callLine()` in `src/lib/call-line.ts` finds the def that encloses the line by indentation, so helper defs such as `dfs` and `relays` get their own call, and fills each parameter from `Step.variables`. `Step` and `TopicModule` keep their §7 shape. `recorder(work, args)` carries a run's arguments on every step, and each `push` adds the locals. A missing or invalid input binds `None`. Every variable name must appear in its listing, except the measures the SPEC names (`header`, `pdr`, `delay`, `overhead`), and every parameter except `net` must be bound; `src/topics/pseudocode.test.ts` checks both. Chips that repeated a live field (`rreqTx`, `tx`, `dups`, `dupes`) and multihop's `margin`, which no listing names, were dropped. When one listing's steps run inside another listing's line (Clustering's leave calling elect, Address Allocation's merge calling a join, DSDV's move calling advertise, Community Mesh's flood), the step carries the outer listing's names only.
