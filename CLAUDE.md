# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Baseline built (2026-09-28): the shell, the network layer, and two topics, `multihop` and `reactive-routing`. Weeks 3 and 4 added (2026-09-30): `broadcast`, `geographic-routing`, `clustering`, `address-allocation`. Everything else added (2026-10-06): `proactive-routing`, Weeks 5 to 8 (`mobility`, `evaluation`, `qos-routing`, `routing-attacks`), the simulation layer and metrics run, and the three case studies. All eleven topics and three case studies of `SPEC.md` are built; §15 tracks them. Every file in `references/en/` is `status: reviewed`; a reference that goes back to `draft` blocks its topic again (SPEC Sections 11 and 15).

The sibling project `../dsa-course` is the working template. Its code, configs, tests, and `CLAUDE.md` are the reference implementation for everything SPEC.md says is "as in dsa-course" or "copied from dsa-course".

## Commands

- `npm run dev`: Vite dev server (http://localhost:5173/)
- `npm run build`: `tsc -b && vite build`. Use this rather than bare `tsc`.
- `npm run lint`: ESLint plus `npm run lint:copy` (the Section 18 copy check). `src/components/ui` and `src/hooks` are shadcn-generated and ignored.
- `npm test`: Vitest, `src/**/*.test.ts`. One file: `npx vitest run src/topics/reactive-routing/operations.test.ts`.
- `npm run preview`: serve the production build with SPA fallback.
- `npm run test:e2e`: Playwright against a Vite dev server on port 5199. Needs Chromium once: `npx playwright install chromium`.
- `node scripts/extract-content.mjs`: regenerate every `src/topics/*/content.ts` from `references/en/`. It refuses any reference that is not `status: reviewed`.
- `docker build -t manet-explorer . && docker run -p 8080:80 manet-explorer`: the production image.

## Source of truth

`SPEC.md` at the repo root is the binding spec. Treat these sections as contracts:

- **§7**: `src/types/step-engine.ts` is dsa-course's file with the snippet types and the `snippets` field removed; `src/types/net.ts` is §7.2 verbatim; `structure.ts` follows §7.3. Don't extend `TopicModule` for one topic's convenience.
- **§9 and §9.1**: playback semantics (unchanged from dsa-course) and the metrics run.
- **§10.x**: per-topic seeds, pseudocode, and step tables. Every `run()` emits exactly those steps, in that order, with those `highlightLine` values, and every seed result the subsection states is pinned in that topic's `operations.test.ts`.
- **§11**: content. `references/id/` is frozen; `references/en/` feeds the app only once reviewed.
- **§19**: case studies, same rules as §10.

## Copy and text: antislop is mandatory

SPEC.md §18 makes the antislop rule set binding on every piece of text in this project, as in dsa-course.

- Before writing or editing any prose or UI string (narration templates, placeholders, errors, aria-labels, pseudocode comments, code comments, docs, the English references, this file), load `antislop:antislop` and `antislop:antislop-copywriting` with the Skill tool. For code comments also `antislop:antislop-code`.
- Usage mode is **DURING**, already answered. Do not ask again.
- Before delivering copy, run the copywriting checklist and Delivery Gate Block 1 and report the PASS lines with evidence.
- `npm run lint:copy` is the mechanical floor. Passing it is necessary, not sufficient.
- A number shown to a student is computed by the app, quoted from a reference with its book and page, or a named demo value labeled as such (§18). Never write a number the slides do not give unless it is one of those.
- Past audits live in `anti-slop/audit-NNN-YYYY-MM-DD.md`. A new audit gets the next number.

## Invariants

- **`references/id/` is frozen.** Never edit the Indonesian slides, not even punctuation; the copy check skips them. They are the upstream source for `references/en/`.
- **`references/en/` claims come only from the slides.** Every claim is a translated slide bullet, table row, or `Catatan` note with the book and page the slide cites. Nothing from memory, nothing read from the books directly. The slides' in-class quiz answers stay out.
- **The book PDFs in `references/` are never committed or published.** `.gitignore` excludes `references/*.pdf`, and `.dockerignore` excludes `references/`.
- **`src/index.css` is verbatim from `../dsa-course/src/index.css`.** Global CSS additions go in `src/app.css`.
- **Pseudocode is Python that reads like the implementation**, and it is the only code listing: `def snake_case(...)`, four-space blocks, method calls such as `v.broadcast(rreq)` and `w.send(RREP(dst), to=prev)`, real containers (`deque`, `set`, `dict`), and `continue`/`return` with a comment instead of prose lines (SPEC §7.1). No C++, Java, or Python tabs, no `snippets.ts`, no blank lines. Highlight through the `L` line map each `pseudocode.ts` exports, never a bare number; `src/topics/pseudocode.test.ts` enforces the style.
- **Seed links are explicit.** A seed's links come from the slide's `sisi:` line and are never recomputed from distance; geometry decides links only where §7.2 says so.
- **Node ids are slide labels** and stay stable across steps. Ties go by `nodes` array order, and seeds list nodes in the order the spec gives.
- **Randomness is seeded.** `src/lib/sim/rng.ts` only; `Math.random` appears only in `randomize()`, which stores the new seed in the state.
- **Steps are precomputed in full; snapshots are immutable values; Randomize and Reset bypass the step engine; `TState = TSnapshot`.** All as in dsa-course.
- **The metrics run never claims to be the books' numbers.** The canvas labels it "computed by this simulator on seed N", and `src/lib/sim/metrics.test.ts` pins every declared run.

## Architecture

Single-page, client-only React app, the dsa-course architecture with a network layer added:

- **Registry**: `src/topics/registry.ts` and `src/case-studies/registry.ts` drive the sidebar, home page, and page lookups.
- **Pages**: `TopicPage` (Real-World Usage | Core Material | Protocol) and `CaseStudyPage` (Scenario | Reasoning | Quiz), both viewport-locked at `lg`.
- **Shell**: `VisualizerShell`, `OperationBar`, `CodePanel` (one listing, no tabs), `PlaybackControls`, `LiveFields`, copied from dsa-course.
- **Network layer**: `NetworkCanvas` (`src/components/visualizer/canvas/`) draws every topic: slide units scaled by `UNIT = 60` with y up, a fixed 280px height, and one spring for nodes and links. A topic's `canvas.tsx` only derives the at-rest view (bridges for `multihop`, the current route for `reactive-routing`, the source's MPR rings, cluster links, address captions and geographic routing's hover and per-step distance captions through the `nodeLabels` prop) and passes the snapshot on. `src/lib/net.ts` holds `frame()` (a step snapshot with highlight and packets), `recorder()` (the step `push` every operation uses), `cloneNet()`, `neighbors()` in node order, `linkKey()`, `parseIds()`, `removeNode()`, `plural()`. `src/lib/sim/` holds `rng.ts`, `geometry.ts`, and `placement.ts` (`connectedUnitDisk()` and `farthestPair()` for Randomize). `NetworkCanvas` also takes `trails` and `extent` props for moving nodes.
- **Variant listings**: a variant that needs its own listing gets its own operation id scoped with `variants` (`discover-aodv`, `discover-dsr`), because `pseudocode` is keyed by operation id.
- **Simulation layer**: `src/lib/sim/mobility.ts` (random waypoint and RPGM, one seeded stream per tick, link statistics), `run.ts` (the §9.1 tick model: an AODV-style flow with discovery, RERR, and a retry 2 ticks after a failed discovery), `metrics.ts` (summaries, the shared `metrics` listing, and `pushMetricsSteps`). A metrics run's result step sets a `metrics` field on the topic's snapshot, and the canvas draws `MetricsBars` while it is set. `src/lib/graph.ts` holds plain bridge and reachability checks; `src/lib/dsr-flood.ts` is the tick-by-tick DSR flood that `routing-attacks` and `community-mesh` share.
- **Case studies**: `src/case-studies/<slug>/` mirrors dsa-course's file set minus `snippets.ts`; each canvas uses `FocusCaption` and `useFollowedView` over a `focus` field.
- **Tests**: `src/topics/structure.test.ts` (Protocol spec contract; a live-field chip is at most 13 characters) and `src/topics/pseudocode.test.ts` (listings have no blank lines; every emitted line is inside its listing) run over every registered topic and case-study simulator with the inputs in `src/topics/test-inputs.ts`; each `operations.test.ts` pins the SPEC §10 or §19 seed results; `src/lib/sim/metrics.test.ts` pins every metrics run; `src/case-studies/case-studies.test.ts` is the §19.0 contract; `e2e/topic-page-layout.spec.ts` and `e2e/case-study-page.spec.ts` are the §12 layout contracts.

## Current status

| Module | Status |
|---|---|
| `multihop` | Complete: Build links (unit disk or shadowing, seeded), Find bridges (Tarjan, C-D and C, D on the seed), Link ETX (0.8 and 0.5 give 2.5), 11 tests. |
| `reactive-routing` | Complete: Discover route, Send data, Break link for AODV and DSR on the S, A, B, C, E, D seed (5 RREQ transmissions, route S, A, C, D, then S, B, E, D after C-D breaks), 14 tests. |
| `broadcast` | Complete: Select MPRs (B and D fixed at line 8, E silent), Broadcast by blind flooding (7 transmissions, 8 duplicates) or MPR relays (3 and 2), Remove link (D-F makes A's set B, D, E), 12 tests. |
| `geographic-routing` | Complete: Route with greedy and a clockwise perimeter walk with GPSR face change over the Gabriel graph (void at S, path S, A, B, C, E, D), greedy only drops at S, position and distance captions on hover, and on each step for the deciding node and its neighbors, 14 tests. |
| `clustering` | Complete: Elect (highest ID: heads 9 and 8, gateway 6; lowest ID: heads 2, 3, 4, 5, 6), Node leaves (9 leaving gives two elections), Node joins, 10 tests. |
| `address-allocation` | Complete: Buddy Join, Leave, Crash (C leaks 4), QDAD Join (3 AREQ tries, seeded), Merge partition (Buddy 2 conflicts, QDAD 1), 12 tests. |
| `proactive-routing` | Complete: Advertise and Move node, incremental or full dump; M3 next to M6 gives M2 the row M3 via M4, 3 hops, sequence 194, after 6 advertisements; one node's table under the canvas. |
| `mobility` | Complete: Advance (RWP, RPGM, seed 5 positions pinned), Where nodes spend time (43.8 % in the centre quarter after 40 RWP ticks), metrics run (RWP 20.0 %, RPGM 40.8 %). |
| `evaluation` | Complete: Build links (UDG, QUDG with q = 0.8), CDS (C, D, E, G), metrics over seeds with a standard deviation whisker (radius 2, ADR-012). |
| `qos-routing` | Complete: Find path by hop, bandwidth (A, B, C, E for 3 Mbps), ETX (3.70 against 6.78), energy (A, D, E); Send packets (B down at 20 on the ETX path). |
| `routing-attacks` | Complete: Discover under a black hole, wormhole, or no attacker; Send packets; watchdog reports M after the fourth failure and switches to S, A, B, D. Randomize restores the seed; its label still reads Randomize. |
| `sar-slope` | Complete: discovery by MPR relays (6 transmissions, 9 duplicates) or blind flooding (8, 15), Send report, Radio walks away (R5 cuts G off), metrics run, quiz. |
| `relief-camp` | Complete: Buddy joins over 256 (a newcomer next to 1 joins through 5), Elect (heads 9, 8, 7), Advance (RPGM 0 against RWP 1 new heads in 20 ticks), metrics run, quiz. |
| `community-mesh` | Complete: Find route (hop S, X, D; ETX S, A, B, C, D; both S, M, D once M joins), Router M joins, Deliver with retries and the watchdog (16 of 20 against 0), metrics run, quiz. |

## Decisions

Decisions live in `ADR.md`, one numbered record each. Record a new decision there as the next ADR, not in this file.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop core and then the skill for the task with the Skill tool (they ship as the `antislop` plugin, not as files in this repo):
- Core (always first): `antislop:antislop`
- UI / visual: `antislop:antislop-ui`
- Copy & text: `antislop:antislop-copywriting`
- People: `antislop:antislop-human`
- Mobile / responsive: `antislop:antislop-layoutmobile`
- Code comments: `antislop:antislop-code`
Usage mode for this project is DURING (already answered, see "Copy and text" above). Do not ask again.
<!-- antislop:end -->
