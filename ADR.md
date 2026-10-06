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
