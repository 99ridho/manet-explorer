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
