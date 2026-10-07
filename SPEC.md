# MANET Interactive Explorer: Technical Specification (v1)

**Course:** Integrasi Jaringan Mandiri/Mobile (3 SKS), Universitas Negeri Jakarta. Course code **[OPEN]**, see Section 17.
**Author:** Muhammad Ridho Kurniawan Pratama
**Scope:** the lecture weeks, Weeks 1 to 8. Weeks 9 to 16 are the group project and are out of scope.
**References:** Loo, J., Lloret, J. & Ortiz, J. H. (2012), *Mobile Ad Hoc Networks: Current Status and Future Trends*; Misra, S., Woungang, I. & Misra, S. C. (2009), *Guide to Wireless Ad Hoc Networks*. The course slides in `references/id/` cite both books by chapter and page.
**Sibling project:** `../dsa-course` (DSA Interactive Explorer). This spec reuses its stack, shell, step engine, test governance, copy standard, and deployment. Where this document says "as in dsa-course", the named file or section of that project is the contract.

### How to use this document

This spec is written for two readers at once. A human reader can read top to bottom for the shape of the product. An AI coding agent implementing it should treat Sections 6 to 10 and 19 as authoritative contracts: type shapes, file paths, seed topologies, and step tables are specified precisely enough to implement without inventing behavior. Where a decision is genuinely open, it is marked **[OPEN]** rather than left ambiguous.

---

## 1. Overview

An in-browser, single-page app that lets students run the MANET mechanisms taught in Weeks 1 to 8 on small networks and watch each one step by step: route discovery, table updates, relay selection, greedy forwarding, cluster election, address allocation, mobility, and attacks. Each step highlights a line of Python-like pseudocode and names the node or message it concerns. A seeded mini-simulation adds the evaluation metrics the course uses (packet delivery ratio, delay, control overhead) so a student can compare two designs on the same network. Three case studies put several weeks together in one scenario and end with a short quiz.

The explorer is a teaching aid. It does not replace ns-2, ns-3, OMNeT++, or any simulator the project phase uses, and the home page says so in one sentence.

## 2. Goals and Non-Goals

**Goals**
- Step-by-step animated protocol traces on networks of at most 12 nodes, with synced pseudocode highlighting.
- A deterministic metrics run (Section 9.1) that compares two variants of a mechanism on the same seed.
- Seed topologies taken from the course slides, so the canvas a student sees matches the figure from the lecture.
- The dsa-course architecture: every topic and case study is a self-contained module registered in one list.

**Non-Goals (v1)**
- No backend, no persistence, no user accounts. Everything is client-side, in memory, and reset on reload, apart from the dark-mode preference.
- No quiz or scoring on topic pages. The one exception is the quiz at the end of each case study (Section 19), scored in memory and reset on reload, as in dsa-course.
- No sandbox for the Weeks 9 to 16 project, and no roadmap row for one.
- No physical-layer accuracy. Links follow the unit disk or shadowing rule in Section 7.2; there is no MAC contention, no interference model, and no radio timing beyond the tick count of Section 9.1.
- No multicast topic in v1 (ODMRP, MAODV, MOLSR, MOST from Week 3 Part 2). The English reference still covers them. See Section 15.

## 3. Tech Stack

The stack matches dsa-course as built (its `CLAUDE.md` decisions log), not the older versions its SPEC Section 3 names.

| Layer | Choice |
|---|---|
| Framework | React 19 + React Router 7 (`createBrowserRouter`, client-only, no loaders) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first config, theme in Section 5) |
| Components | shadcn/ui, style `new-york` (Sidebar, Button, Slider, Tabs, Select, Input, Badge, Card, Tooltip) |
| Animation | `motion/react` for snapshot-to-snapshot transitions |
| Layout | None. MANET nodes have coordinates, so positions come from the seed or the seeded placement, never from a force layout. `d3-force` is not a dependency. |
| Tests | Vitest for the step tables and the metrics runs (`src/**/*.test.ts`); Playwright (Chromium) for the page layout contract (`e2e/`) |
| Language | TypeScript 6 throughout; npm, not pnpm |

## 4. Repository Structure

```
manet-explorer/
├── src/
│   ├── main.tsx
│   ├── app-router.tsx
│   ├── index.css                     # verbatim from dsa-course, Section 5
│   ├── app.css                       # Tailwind entry: imports index.css and tw-animate-css
│   ├── components/
│   │   ├── layout/                   # AppLayout, AppSidebar (as in dsa-course)
│   │   ├── visualizer/
│   │   │   ├── VisualizerShell.tsx
│   │   │   ├── OperationBar.tsx
│   │   │   ├── PlaybackControls.tsx
│   │   │   ├── CodePanel.tsx         # one pseudocode listing, no language tabs (Section 8)
│   │   │   ├── LiveFields.tsx
│   │   │   └── canvas/
│   │   │       ├── NetworkCanvas.tsx # nodes, links, range circle, packets, roles
│   │   │       ├── MetricsBars.tsx   # the Section 9.1 comparison
│   │   │       └── kinds.ts          # highlight-kind classes
│   │   ├── case-study/               # FocusCaption, DecisionList, QuizPanel (as in dsa-course)
│   │   ├── ProtocolPanel.tsx         # the Protocol tab (dsa-course StructurePanel, relabeled)
│   │   ├── MarkdownContent.tsx
│   │   └── ui/                       # shadcn generated components
│   ├── topics/
│   │   ├── registry.ts
│   │   ├── test-inputs.ts            # seed inputs shared by structure and pseudocode tests
│   │   ├── structure.test.ts
│   │   ├── pseudocode.test.ts
│   │   └── <slug>/
│   │       ├── index.ts              # exports the TopicModule
│   │       ├── types.ts
│   │       ├── operations.ts
│   │       ├── operations.test.ts    # executable form of the Section 10 table
│   │       ├── pseudocode.ts
│   │       ├── structure.ts          # the protocol spec, Section 7.3
│   │       ├── canvas.tsx
│   │       └── content.ts            # generated from references/en, Section 11
│   ├── case-studies/
│   │   ├── registry.ts
│   │   ├── case-studies.test.ts
│   │   └── <slug>/                   # the dsa-course case study file set, minus snippets.ts
│   ├── lib/
│   │   ├── step-engine.ts            # usePlayback, verbatim from dsa-course
│   │   ├── use-followed-view.ts      # verbatim from dsa-course
│   │   ├── predict-step.ts           # verbatim from dsa-course
│   │   ├── net.ts                    # NetSnapshot helpers: clone, link key, neighbors, highlight
│   │   └── sim/
│   │       ├── rng.ts                # mulberry32, seeded
│   │       ├── geometry.ts           # distance, unit disk links, shadowing links
│   │       ├── placement.ts          # uniform and grid placement
│   │       ├── mobility.ts           # random waypoint and RPGM, advanced in ticks
│   │       ├── run.ts                # the slot-based packet run of Section 9.1
│   │       └── metrics.ts            # PDR, mean delay, control overhead
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── TopicPage.tsx
│   │   └── CaseStudyPage.tsx
│   └── types/
│       ├── step-engine.ts            # dsa-course types with the Section 7 amendment
│       ├── net.ts                    # Section 7.2
│       └── case-study.ts             # verbatim from dsa-course
├── e2e/
│   ├── topic-page-layout.spec.ts
│   └── case-study-page.spec.ts
├── references/
│   ├── id/minggu-01.md … minggu-08.md   # the course slides, frozen (Section 11)
│   └── en/Week-N-<slug>.md              # English references, Section 11
├── scripts/
│   ├── extract-content.mjs
│   └── check-copy.mjs
├── anti-slop/                        # audit records, Section 18
├── public/
├── index.html
├── vite.config.ts  vitest.config.ts  playwright.config.ts  eslint.config.js  components.json
├── package.json
├── Dockerfile  nginx.conf  .dockerignore
└── .github/workflows/deploy.yml
```

Copied from dsa-course without change: `vite.config.ts` (with its SPA-fallback preview plugin), `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `components.json`, `Dockerfile`, `nginx.conf`, `.dockerignore`, `src/lib/step-engine.ts`, `src/lib/use-followed-view.ts`, `src/lib/predict-step.ts`, `src/components/layout/*`, `src/components/case-study/*`, `src/components/ui/*`, `src/hooks/*`. Copied then changed as this spec says: `src/types/step-engine.ts` (Section 7.1), `CodePanel.tsx` (Section 8), `StructurePanel.tsx` renamed `ProtocolPanel.tsx` (Section 8), `MarkdownContent.tsx` (adds `remark-gfm` and table styles, because the references quote book tables), `scripts/check-copy.mjs` and `scripts/extract-content.mjs` (Section 11), `.github/workflows/deploy.yml` (image name only, Section 13).

## 5. Theming

`src/index.css` is copied verbatim from `../dsa-course/src/index.css` and never edited; global additions go in `src/app.css`. `index.html` loads DM Sans and Space Mono from Google Fonts, as in dsa-course. Dark mode uses the same `.dark` class toggle, remembered in `localStorage` under `manet-explorer-theme`. The two apps are siblings and should look like it.

Canvas colors come from theme variables (`var(--color-accent)`, `var(--color-chart-1)` to `var(--color-chart-5)`, `var(--color-destructive)`), never hex, so every canvas follows dark mode. Section 8 assigns them to roles and highlight kinds.

## 6. Routing

Topic-slug routes are canonical. The week is metadata shown in the sidebar and page header, never part of the URL.

| Path | Renders |
|---|---|
| `/` | `HomePage`: topics grouped by week, then the case studies |
| `/start` | `StartPage`: the on-ramp for a student new to MANETs, Section 20 |
| `/topic/multihop` | Multihop links and bridges (Week 1), Section 10.1 |
| `/topic/proactive-routing` | Proactive routing: DSDV (Week 2), Section 10.2 |
| `/topic/reactive-routing` | Reactive routing: AODV and DSR (Week 2), Section 10.3 |
| `/topic/broadcast` | Broadcast: flooding and MPR (Week 3), Section 10.4 |
| `/topic/geographic-routing` | Geographic routing (Week 3), Section 10.5 |
| `/topic/clustering` | Clustering: LCA (Week 4), Section 10.6 |
| `/topic/address-allocation` | Address allocation: Buddy and query-based DAD (Week 4), Section 10.7 |
| `/topic/mobility` | Mobility models (Week 5), Section 10.8 |
| `/topic/evaluation` | Network models and evaluation (Week 6), Section 10.9 |
| `/topic/qos-routing` | QoS, ETX, and energy-aware routing (Week 7), Section 10.10 |
| `/topic/routing-attacks` | Routing attacks and the watchdog (Week 8), Section 10.11 |
| `/case-study/sar-slope` | SAR team on a slope (Weeks 1–3), Section 19.1 |
| `/case-study/relief-camp` | Relief camp (Weeks 4–6), Section 19.2 |
| `/case-study/community-mesh` | Community mesh (Weeks 7–8), Section 19.3 |

Anything else redirects to `/`.

`TopicPage` follows dsa-course Section 6 exactly: a two-column grid at `lg`, `VisualizerShell` on the left, materials on the right as tabs. The tabs are **Scenario** (default, Section 20) | **Core Material** | **Protocol**. Scenario renders `story.scenario` and Core Material renders `content.coreMaterial`, both with `MarkdownContent`; Protocol renders `ProtocolPanel` over `structure`. At `lg` the page is locked to the viewport: the document never scrolls, and only the Code listing and the active materials panel do. Below `lg` the columns stack, visualizer first, and the document scrolls. `<TopicView key={slug}>` resets the visualizer, the tab, and the variant mirror on navigation.

## 7. Core Domain Types

### 7.1 Step engine types

`src/types/step-engine.ts` is `../dsa-course/src/types/step-engine.ts` with one amendment: **there are no language snippets.** Remove `SnippetLanguage`, `SnippetLine`, `OperationSnippets`, and the `snippets` field of `TopicModule`. Every other type (`Step`, `OperationResult`, `OperationFn`, `OperationDefinition`, `VariantConfig`, `AdtOperation`, `StructureField`, `Representation`, `StructureSpec`, `TopicModule`) is copied unchanged, including `inputKind: "key" | "edge" | "array" | "none" | "text"`, `placeholder`, `variants`, and `createInitialState(variant)`.

Each operation ships one pseudocode listing, `pseudocode[operationId]`, written as Python that reads like the real implementation: named functions and method calls, not prose.

- `def snake_case(args):` opens a function; blocks are indented four spaces (PEP 8).
- Actions are calls on real-looking objects: `v.broadcast(rreq)`, `w.send(RREP(dst), to=prev)`, `net.neighbors(v)`, `queue.popleft()`, `links.add((p, q))`. A message is a constructor call named for the message (`RREQ(src, request_id, dst)`).
- Data uses Python types: `dict`, `set`, `list`, `deque`, tuples; standard helpers appear by their real names (`combinations`, `min(..., key=len)`, `next(clock)`, `reversed`).
- Control flow is `for`, `while`, `if`/`elif`/`else`, `continue`, `return`. A skipped copy or an early exit is a `continue` or `return` with a comment, never a sentence.
- A trailing `# comment` carries the protocol meaning the call names cannot ("the reverse path"); comments are prose under Section 18.
- Functions a listing calls but does not define (`dist`, `linked`, `send_along`, `rerr_path`) are named for what they do and explained by the step narration or the Protocol tab. No imports, decorators, or comprehensions; type annotations appear only in the Protocol tab's class declarations.
- No blank lines inside a listing, so every line is highlightable. `src/topics/pseudocode.test.ts` checks the `def` line, the four-space indents, balanced brackets, and the colon on every block opener.
- Each topic's `pseudocode.ts` exports `L`, the named line numbers of each listing, and `operations.ts` highlights through it rather than with bare numbers.

Every listing in Sections 9.1, 10, and 19 is written in this style. An edit to a listing renumbers its step table in the same change.

`highlightLine` is a 1-indexed line of that listing. There is no per-language line map; `L` names the lines of the one listing.

**Amendment (Section 20, ADR-014).** `Step` gains `why?: string`, the reason for the step in plain words, and `TopicModule` gains `story?: TopicStory` (`src/types/story.ts`: `scenario`, Markdown for the Scenario tab, and `cast`, seed node id to the device it plays). `recorder()` in `src/lib/net.ts` returns `why(text)`, which sets the reason on the step pushed last. Both are required: every topic and case study simulator has a story, and every step has a why (ADR-015).

`case-study.ts` is copied verbatim. `StructureChoice.cost` holds the trade-off the English reference states for the mechanism, with its book and page (for DSDV: "control overhead is high, so DSDV does not suit large networks", Loo p. 28), under the same quoting rule as Section 7.3.

### 7.2 Network snapshot base

Every topic and simulator snapshot extends this base (`src/types/net.ts`):

```ts
type NodeRole = "source" | "dest" | "relay" | "mpr" | "head" | "gateway" | "malicious" | "anchor";

interface NetNode {
  id: string;            // the label the slide uses: "A", "S", "M1", "9"
  x: number;             // slide units; the canvas scales them (Section 8)
  y: number;
  roles: NodeRole[];     // drawn as badges and rings
  battery?: number;      // Section 10.10 and 19.3 only
  down?: boolean;        // left the network; drawn faded, no links
}

interface NetLink {
  a: string;             // a < b in string order; links are undirected and stored once
  b: string;
  quality?: number;      // delivery probability in one direction (w), when the topic models it
  qualityBack?: number;  // the reverse direction, when it differs
  bandwidth?: number;    // Section 10.10 only, in Mbps
  broken?: boolean;      // drawn dashed: the slides' `putus`
  virtual?: boolean;     // not a radio link: the wormhole tunnel, the direction to D
}

interface InFlight {
  kind: string;          // message name: "RREQ", "RREP", "RERR", "DATA", "HELLO", "AREQ" …
  from: string;
  to: string | "*";      // "*" is a local broadcast to every neighbor
  label?: string;        // e.g. "seq 594", "S,A,C"
}

interface NetSnapshot {
  nodes: NetNode[];                  // declared order is the tie-break order (below)
  links: NetLink[];
  range: number;                     // radio range in slide units, for the range circle and Randomize
  packets: InFlight[];               // messages drawn on this step, empty at rest
  highlight?: {
    nodes?: Record<string, HighlightKind>;
    links?: Record<string, HighlightKind>;   // key "a-b" with a < b
    path?: string[];                         // drawn as a thick polyline
  };
  linkLabels?: Record<string, string>;       // text drawn on a link, e.g. "ETX 2.5"; key "a-b" with a < b
}

type HighlightKind = "current" | "new" | "found" | "visited" | "active" | "tree" | "dropped" | "flagged";
```

`TState = TSnapshot` for every topic, as in dsa-course. The final snapshot of every operation has `packets: []` and no `highlight`.

**Node ids are the slide labels**, so a node keeps its id across steps and `motion/react` animates it between positions, the same rule as dsa-course's `k${key}` BST ids. A topic that creates nodes names them with the next free letter after the seed's, or the next integer for Section 10.6.

**Tie-break order.** Whenever a mechanism processes several nodes "at the same time" (a local broadcast reaching every neighbor, a batch of nodes in one tick), it processes them in `nodes` array order. Seeds list nodes in the order this spec gives them. That rule is what makes every step table below deterministic.

**Links.** A seed lists its links explicitly, taken from the slide's `sisi:` line; the positions only draw them. A seed link is never recomputed from distance, because the slides draw abstract figures, not scaled maps. Geometry decides links only where a section says so: Section 10.1's Build links, Section 10.8's ticks, Randomize, and the case study movements.

- **Unit disk rule:** nodes `p` and `q` are linked when `dist(p, q) <= range`. This is the UDG of Loo 3.2.1.1 with the radius scaled to `range`.
- **Quasi unit disk rule** (Section 10.9): linked when `dist <= q * range`; not linked when `dist > range`; in between, linked when the seeded draw `rng() < 0.5`. Loo (pp. 41-42) calls the in-between band probabilistic without fixing a probability, so 0.5 is this simulator's choice, and the Protocol tab says so.
- **Shadowing rule** (Section 10.1): linked when `10 * n * log10(range / dist) + X >= 0`, with `X` drawn from a normal distribution with mean 0 and standard deviation `sigma` dB. At `X = 0` this is the unit disk rule. `n = 2` (the free-space exponent the Week 1 slide gives). `sigma` is **[OPEN]** (Section 17), 4 dB until decided, and the Protocol tab labels it a parameter of this demo.

### 7.3 The Protocol spec (`structure.ts`)

`StructureSpec` is reused without a type change. The UI calls it the Protocol spec, and each field carries protocol content:

| Field | Holds |
|---|---|
| `adt.name` | The mechanism: "AODV", "DSDV", "MPR selection", "Buddy allocation" |
| `adt.summary` | One sentence, house style |
| `adt.operations` | The **message types** the mechanism exchanges. `name` is the message ("RREQ"), `signature` its fields ("RREQ(source, broadcastId, dest, destSeq, hops)"), `cost` what the reference says it costs, `note` one sentence, `operationIds` the visualizer operations that send it |
| `adt.invariants` | Properties the mechanism keeps: "A node forwards the first copy of an RREQ and drops the rest." |
| `representations` | The **per-node state** per variant value: a routing table, a route cache, an MPR set, an address pool. `declaration` is Python-like, same style as Section 7.1 |
| `algorithms` | Operations that run over the network rather than send a named message: Find bridges, Build links, the metrics run |
| `liveFields` | At most six scalars read from the snapshot; each chip's `key = value` fits 14 characters |

`cost` quotes the English reference (Section 11): the reference's own sentence with its book and page, or an `O(...)` form when the reference states one. A cost the reference does not state is the empty string, and `ProtocolPanel` shows "Not stated in the course reference." rather than a guess.

### 7.4 Registry

`src/topics/registry.ts` exports `topics: TopicModule[]` in week order (Section 6 order). `src/case-studies/registry.ts` exports `caseStudies: CaseStudyModule[]` and `getCaseStudy(slug)`. Adding a topic means adding one entry, with no change to the sidebar, pages, shell, or step engine.

## 8. Shared UI Components

As in dsa-course Section 8, with these differences.

- **`CodePanel`**: shows `currentStep.description` and the Why line in one box, then a separate card with the call line and the `variables` as badges, then the numbered pseudocode listing. The call line is the def that encloses the highlighted line, with each parameter that `variables` binds written as `name=value` (`elect(net, rank=highest)`); it is left out when the step binds none, and the card is left out when it would be empty. The badges show the variables the call line does not use. Every step binds every parameter of its enclosing def except `net` (`None` for missing input), and every variable name appears in the listing, except the measures named in Sections 9.1 and 10.3 (ADR-017). **There is no tab strip and no `localStorage` language key.** It draws each four-space indent level at 2ch and renders a trailing `# comment` in the muted color, so a narrow card stays readable while the source keeps PEP 8 spacing. The listing keeps dsa-course's rules: lines soft-wrap with a hanging indent (`padding-left: (indent + 2)ch; text-indent: -2ch`), no horizontal scroll at any width, the listing is the only scroller at `lg`, it is keyboard focusable with a visible ring, and stepping keeps the highlighted line in view by setting the listing's own `scrollTop`, never `scrollIntoView`.
- **`ProtocolPanel`**: dsa-course's `StructurePanel` with its headings renamed: "Messages" for the operation table (columns Message, Fields, Cost, Shown by), "Invariants", "Per-node state" for the representation blocks, "Algorithms over the network" for `algorithms`. The "on the canvas" badge follows the variant toggle, as before.
- **`NetworkCanvas`** (`components/visualizer/canvas/`): one SVG used by every topic and case study.
  - `viewBox` from the node extents plus a margin of half the range; no fixed pixel width; a fixed rendered height of 280px, so a network that changes extent never resizes the card (dsa-course Section 12 rule).
  - Links are lines. `broken` is dashed; `virtual` is dotted and carries its own label ("tunnel", "toward D"); a link with `quality` shows the value on hover and focus; a link with `bandwidth` always shows it.
  - Nodes are circles labeled with their id. Roles draw as follows: `source` and `dest` get a filled accent ring and the letters S or D beside the node when the id is not already S or D; `mpr`, `head`, and `gateway` get a ring (solid, double, dashed); `malicious` fills the node with `--color-destructive`; `anchor` gets a square.
  - Hovering or focusing a node draws its range circle at `range`. Nodes are focusable with Tab and announce "`{id}`, `{k}` neighbors, roles `{roles}`".
  - An optional `nodeLabels` prop (a component prop, not a snapshot field) draws a caption of short lines under a node, or above it when the caption says `place: 'above'`, only while the node is hovered or focused when it says `hover: true`, and always adds its spoken form to the node's label; Section 10.5 uses it for positions and distances, Section 10.7 for addresses.
  - `packets` draw as a dot on the link from `from` to `to` (or rings on every link for `"*"`) with the message name as a small label, animated with `motion/react` over 60 % of the step interval.
  - The canvas `aria-label` summarizes the snapshot: "`{n}` nodes, `{m}` links" plus ", path `{path}`" when `highlight.path` is set.
- **Beginner layer** (Section 20): `CodePanel` prints the step's `why` under the description as "Why: …" in the same live region, and runs both through `GlossaryText`. `WhosWho` prints the story's cast under the live fields, or after Randomize a line saying the story roles do not apply; it depends on the cast alone, so stepping never changes its height.
- **`MetricsBars`**: the Section 9.1 result, drawn inside the canvas card in place of the network on the last step of a metrics run: one group per metric, two bars per group (chosen variant first), each with its value as text. Colors follow the dataviz rule of the theme (`--color-chart-1` for the chosen variant, `--color-chart-3` for the other).
- **`VisualizerShell`** differs from dsa-course in one rule: choosing another operation clears the steps, because the old steps index the old listing.
- **`HomePage`** cards list a topic's distinct operation labels, since variant-scoped operations share a label.
- **`LiveFields`**, **`OperationBar`**, **`PlaybackControls`**, **`FocusCaption`**, **`DecisionList`**, **`QuizPanel`**: unchanged from dsa-course, including the `data-shell-keys="off"` region rule and the keyboard shortcuts (Space, ←, →).

**Highlight kinds** (`kinds.ts`): `current` is the node or link a step is about; `new` is something the step created (a table row, a link, a reverse-path pointer); `found` is a result (the destination reached, an MPR chosen); `visited` is done; `active` is a message in transit; `tree` is part of the chosen route or structure; `dropped` is a discarded packet or a duplicate; `flagged` is a node a detector reported.

## 9. Step Engine: Playback Semantics

Unchanged from dsa-course Section 9. `usePlayback(steps)` is copied verbatim. `run()` returns the whole `steps[]` and a `finalSnapshot`; scrubbing and stepping backward are index changes. Go autoplays when the result has more than one step. Randomize and Reset bypass the engine: they set `state` directly and clear `steps`. Changing the variant does the same.

Every `run()` is pure: randomness comes only from `src/lib/sim/rng.ts`, seeded from the snapshot (`seed` field where a topic keeps one) or from the operation input. `Math.random` appears only in `randomize()`, which picks a new seed and stores it in the state.

### 9.1 Metrics run

A topic or simulator may declare one operation with id `metrics` (`inputKind: "none"` unless its section says otherwise). It compares the variants on the same network and the same seed, so the difference between the bars comes from the design alone.

```python
1  def metrics(net, seed):
2      results = {}
3      for design in variants:  # the chosen design first
4          rng = RNG(seed)
5          runs = []
6          for flow in flows(net, rng):
7              runs.append(run_flow(net, design, flow, rng))
8          results[design] = summarize(runs)  # PDR, mean delay, control overhead
9      return results
```

`src/lib/sim/run.ts` models time in **ticks**. One tick moves every message in flight across one link. The metrics are:

| Metric | Definition |
|---|---|
| Packet delivery ratio | data packets delivered / data packets sent, as a percentage to one decimal |
| Mean delay | mean ticks from a data packet's send to its delivery, counting the route-discovery ticks it waited, over delivered packets only, to one decimal |
| Control overhead | control transmissions (every RREQ, RREP, RERR, HELLO, TC, AREQ, AREP sent by any node) / data packets delivered, to two decimals; shown as "no packets delivered" when the denominator is 0 |

These three are the metrics Week 6 names (Misra 4.3.4, pp. 86-87). The run is a teaching model: no MAC, no queues, no collisions. The canvas labels the result "computed by this simulator on seed `{seed}`", and no page presents these numbers as figures from the books (Section 18).

Steps: one step per flow per design, then one result step.

| Trigger | Line | Description |
|---|---|---|
| Flow done | 7 | "`{design}`: flow `{k}` from `{src}` to `{dst}` delivered `{d}` of `{s}` packets in `{t}` ticks." |
| Result | 9 | "On seed `{seed}`, `{designA}` delivers `{pdrA}` % and `{designB}` delivers `{pdrB}` %." |

`variables` carries `pdr`, `delay`, and `overhead` for the design being run. `src/lib/sim/metrics.test.ts` pins the result of every declared metrics run on its seed, so a change to the model shows up as a failing number, not a silent drift.

## 10. Per-Topic Specifications

Each subsection gives the variant, the snapshot fields beyond `NetSnapshot`, the seed, the Randomize rule, and for each operation its Python-like pseudocode and a step table. The step table is the contract for `run()`: emit exactly these steps, in this order, with these `highlightLine` values. `operations.test.ts` in each topic folder is the executable form and pins the seed results this section states.

Descriptions are templates. Backticked `{names}` are filled in; counts pluralize (`1 hop`, `2 hops`). A table row marked "per …" repeats once per item in the tie-break order of Section 7.2. Where a slide gives the seed, the section cites it; the positions and links are the slide's `graf:` block, and roles come from its `peran:` line mapped to the Section 7.2 roles (the slides reuse `mpr` for any ringed node), except where an operation computes them, as Elect does in Section 10.6.

Every topic has a `structure.ts` whose messages, invariants, and per-node state follow Section 7.3. The subsections list the live fields; the Protocol tab content is written from the English reference when the topic is implemented.

### 10.1 Multihop links and bridges, `/topic/multihop` (Week 1)

**Variant:** `model: "disk" | "shadowing"` (default `"disk"`), labeled Unit disk and Shadowing. Section 7.2 defines both rules.

**Snapshot:** `NetSnapshot` plus `seed: number`, `bridges: string[]` (link keys), `cuts: string[]` (articulation points), and `etx: Record<string, number>` by link key.

**Seed** (Week 1, "Bridge dan articulation point"; Misra Definition 1.4): nodes A (0,1), B (0,-1), C (1,0), D (3,0), E (4,1), F (4,-1); links A-B, A-C, B-C, C-D, D-E, D-F, E-F; `range = 2`; `seed = 1`. With `range = 2` the unit disk rule reproduces exactly the slide's links, so Build links on the disk variant changes nothing, and the student can see why.

**Randomize:** 6 to 8 nodes placed uniformly in a 6 × 4 area with a fresh seed, linked by the active rule, redrawn (up to 20 times, same seed stream) until the network is connected.

**Build links** (`build-links`, `inputKind: "none"`, an algorithm)

```python
1  def build_links(net, radio_range):
2      links = set()
3      for p, q in combinations(net.nodes, 2):
4          d = dist(p, q)
5          if linked(d, radio_range):
6              links.add((p, q))
7      return links
```

| Trigger | Line | Description |
|---|---|---|
| Per pair, disk, linked | 6 | "`{p}` and `{q}` are `{d}` apart, within range `{range}`: link `{p}`-`{q}`." |
| Per pair, disk, not linked | 5 | "`{p}` and `{q}` are `{d}` apart, beyond range `{range}`, so they cannot hear each other." |
| Per pair, shadowing, linked | 6 | "`{p}` and `{q}` are `{d}` apart and the random fade adds `{x}` dB, so the margin is `{m}` dB: link `{p}`-`{q}`." |
| Per pair, shadowing, not linked | 5 | "`{p}` and `{q}` are `{d}` apart and the random fade adds `{x}` dB, so the margin is `{m}` dB: no link." |
| Result | 7 | "Build links made `{m}` links among `{n}` nodes." |

Pairs run in node order (A-B, A-C, …, E-F). Distances and dB values print to two decimals. The shadowing variant draws one `X` per pair from `rng(seed)`, so the same seed always gives the same network.

**Find bridges** (`find-bridges`, `inputKind: "none"`, an algorithm)

```python
1  def find_bridges(net):
2      for v in net.nodes:
3          if v not in disc:
4              dfs(net, v, parent=None)
5  def dfs(net, v, parent):
6      disc[v] = low[v] = next(clock)
7      children = 0
8      for w in net.neighbors(v):
9          if w not in disc:
10             children += 1
11             dfs(net, w, parent=v)
12             low[v] = min(low[v], low[w])
13             if low[w] > disc[v]:
14                 bridges.add((v, w))
15             if parent is not None and low[w] >= disc[v]:
16                 cut_points.add(v)
17         elif w != parent:
18             low[v] = min(low[v], disc[w])
19     if parent is None and children > 1:
20         cut_points.add(v)
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Enter | 6 | "Visiting `{v}`: disc = low = `{t}`." | `{v}` current |
| Tree link | 11 | "`{w}` is unvisited, so the search goes from `{v}` to `{w}`." | link active |
| Back link | 18 | "`{w}` was visited earlier and is not the parent, so low[`{v}`] = `{low}`." | link active |
| Return | 12 | "Back at `{v}` from `{w}`: low[`{v}`] = `{low}`." | `{v}` current |
| Bridge | 14 | "low[`{w}`] = `{lw}` is greater than disc[`{v}`] = `{dv}`, so `{v}`-`{w}` is a bridge: it is the only way between the two parts." | link flagged |
| Articulation point | 16 | "low[`{w}`] = `{lw}` is not less than disc[`{v}`] = `{dv}`, so removing `{v}` cuts `{w}` off: `{v}` is an articulation point." | `{v}` flagged |
| Root with two children | 20 | "`{v}` started the search and has `{k}` children, so it is an articulation point." | `{v}` flagged |
| Result | 2 | "Found `{b}` bridges and `{a}` articulation points." (or "no bridges and no articulation points.") | every mark |

The parent link produces no step. Neighbors run in node order. On the seed: bridge C-D, articulation points C and D, matching the slide. The live fields count bridges and cuts as the search finds them; before the first run they show `?`. `variables` carries `disc` and `low` as `A:1 B:2 …`.

**Link ETX** (`link-etx`, `inputKind: "text"`, placeholder "Link and delivery ratios, e.g. C D 0.8 0.5")

```python
1  def link_etx(net, p, q, w_pq, w_qp):
2      if not net.has_link(p, q):
3          return None
4      cycle = w_pq * w_qp  # the frame and its ACK both arrive
5      etx = 1 / cycle
6      net.link(p, q).etx = etx
7      return etx
```

| Trigger | Line | Description |
|---|---|---|
| Input is not two node ids and two numbers from 0 to 1 | 1 | "Type two linked nodes and two delivery ratios from 0 to 1, such as C D 0.8 0.5." |
| No such link | 3 | "`{p}` and `{q}` share no link, so there is no ETX to compute." |
| Cycle | 4 | "A full cycle succeeds with probability `{w_pq}` × `{w_qp}` = `{cycle}`." |
| Zero | 5 | "The cycle never succeeds, so the expected number of transmissions has no bound." |
| ETX | 5 | "ETX = 1 / `{cycle}` = `{etx}` expected transmissions." |
| Store | 6 | "Link `{p}`-`{q}` now shows ETX `{etx}`." |

The Week 1 slide's worked example (0.8 and 0.5 give 2.5) is the placeholder, so the first run reproduces it.

**Live fields:** `nodes`, `links`, `range`, `bridges`, `cuts`.

### 10.2 Proactive routing: DSDV, `/topic/proactive-routing` (Week 2)

**Variant:** `update: "full" | "incremental"` (default `"incremental"`), labeled Incremental and Full dump. Week 2 compares the two (Misra p. 66).

**Snapshot:** `NetSnapshot` plus

```ts
interface DsdvRow { dest: string; next: string; metric: number; seq: number; changed: boolean }
interface DsdvExtra {
  tables: Record<string, DsdvRow[]>;   // per node, sorted by dest
  seqOf: Record<string, number>;       // each node's own sequence number
  updates: number;                     // advertisements sent
  rowsSent: number;                    // table rows carried by those advertisements
}
```

**Seed** (Week 2, "Isi tabel penerusan node M2"; Misra Example 4.3): nodes M1 (0,1), M2 (1,1), M3 (1,2), M4 (2,1), M5 (3,0), M6 (3,2); links M1-M2, M2-M3, M2-M4, M4-M5, M4-M6; `range = 1.2`. Sequence numbers from the slide's table: M1 593, M2 983, M3 193, M4 233, M5 243, M6 53. Every table starts converged (shortest hop routes, the destination's own sequence number, `changed = false`), so M2's table equals the slide's. The positions are this spec's; the slide gives only the table.

**Randomize:** 5 to 7 nodes, connected under the unit disk rule, own sequence numbers drawn from 0 to 999, tables converged.

**Advertise** (`advertise`, `inputKind: "text"`, placeholder "Node, e.g. M4")

```python
1  def advertise(u, full_dump):
2      rows = u.table.rows() if full_dump else u.table.changed_rows()
3      for n in u.neighbors():
4          for r in rows:
5              old = n.table.get(r.dest)
6              if old is None or r.seq > old.seq:
7                  n.table[r.dest] = Route(u, r.metric + 1, r.seq)  # a newer sequence number wins
8              elif r.seq == old.seq and r.metric + 1 < old.metric:
9                  n.table[r.dest] = Route(u, r.metric + 1, r.seq)  # same sequence, fewer hops
10             else:
11                 continue  # n keeps its route
12     u.table.mark_unchanged()
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Unknown node | 1 | "There is no node `{u}` in this network." | none |
| Send | 2 | "`{u}` sends `{k}` rows to `{neighbors}` as a full dump." or "`{u}` sends its `{k}` changed rows to `{neighbors}`." | `{u}` current, packets |
| Nothing changed | 2 | "`{u}` has no changed rows, so the incremental update is empty." | `{u}` current |
| Per neighbor per row, new route | 7 | "`{n}` had no route to `{dest}`, so it adds one via `{u}`: `{m}` hops." | row new |
| Per neighbor per row, newer | 7 | "`{n}` takes the route to `{dest}` via `{u}`: sequence `{seq}` is newer than `{old}`." | row new |
| Per neighbor per row, fewer hops | 9 | "Sequence `{seq}` for `{dest}` is the same, and via `{u}` it is `{m}` hops instead of `{old}`, so `{n}` switches." | row new |
| Per neighbor per row, keep | 11 | "`{n}` keeps its route to `{dest}` via `{next}`." | none |
| Done | 12 | "`{u}` sent `{k}` rows to `{j}` neighbors." | none |

A changed row at the receiver gets `changed = true`, so its next incremental update carries it. `updates` rises by one and `rowsSent` by `k` per advertisement.

**Move node** (`move`, `inputKind: "text"`, placeholder "Node and new neighbor, e.g. M3 M6")

```python
1  def move(net, u, near, full_dump):
2      lost, gained = net.place_next_to(u, near)  # the unit disk rule relinks u
3      for v in [u] + lost:
4          v.delete_stale_routes()  # the next hop is no longer a neighbor
5      u.seq += 1  # u's own row is now changed
6      for n in gained:
7          n.send(Update(n.table.rows()), to=u)  # u needs the whole table once
8      queue = deque([u])
9      while queue:
10         v = queue.popleft()
11         advertise(v, full_dump)  # triggered update
12         queue.extend(changed_neighbors(v, queue))  # tables that changed, not yet queued
```

`u` moves to `near`'s position plus (0.8, 0) and its links follow the unit disk rule at `range`. Stale-route removal stands in for the table's install-time column, which the slide says exists to remove stale routes. Line 7 exists because an incremental update carries only changed rows, so without it a node that has just arrived would never learn routes that did not change; the slides do not describe this case, and the Protocol tab marks it as this demo's rule. The course reference does not fix how far a node raises its own sequence number; this demo adds 1, and the Protocol tab says so.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Invalid input | 1 | "Type the node that moves and the node it moves next to, such as M3 M6." | none |
| Move | 2 | "`{u}` moves next to `{near}`: it loses `{lost}` and gains `{gained}` as neighbors." | `{u}` current |
| Per node, stale | 4 | "`{v}` deletes `{k}` routes that went through `{gone}`." | `{v}` current |
| New sequence | 5 | "`{u}` raises its own sequence number to `{seq}`." | `{u}` new |
| Per new neighbor | 7 | "`{n}` is a new neighbor, so it sends `{u}` its full table of `{k}` rows." then the Advertise per-row steps for `{u}`, at line 7 | `{n}` current |
| Per advertisement | 11 | the Advertise rows above, at line 11 | as above |
| Done | 9 | "No table changed in the last round, so the update stops after `{k}` advertisements." | none |

On the seed, `M3 M6` ends with M2's row for M3 reading next hop M4, 3 hops, sequence 194, and no other row of M2 changed: the slide's point that M2 learns of the move through M4.

**Live fields:** `nodes`, `updates`, `rowsSent`.

### 10.3 Reactive routing: AODV and DSR, `/topic/reactive-routing` (Week 2)

**Variant:** `protocol: "aodv" | "dsr"` (default `"aodv"`), labeled AODV and DSR.

**Snapshot:** `NetSnapshot` plus

```ts
interface ReactiveExtra {
  route: Record<string, Record<string, string>>;    // AODV: node, dest, next hop
  cache: Record<string, Record<string, string[]>>;  // DSR: node, dest, full route
  requestId: number;                                // the source's broadcast id (AODV) or request id (DSR)
  rreqTx: number;                                   // RREQ transmissions, all discoveries
  control: number;                                  // every RREQ, RREP, RERR transmission
}
```

**Seed** (Week 2, "RREQ menyebar dan mencatat jalur balik"; Misra Example 4.11, Loo p. 23): nodes S (0,1), A (1,0), B (1,2), C (2,0), E (2,2), D (3,1); links S-A, S-B, A-B, A-C, B-E, C-D, E-D; roles S source, D dest. Both variants use this seed so the student compares them on one network. `requestId = 0`.

**Randomize:** 6 to 9 nodes, connected under the unit disk rule, source and destination at the two most distant nodes.

**Discover route** (`discover-aodv` with `variants: ["aodv"]` and `discover-dsr` with `variants: ["dsr"]`, one id per listing; `inputKind: "text"`, placeholder "Source and destination, e.g. S D")

AODV listing:

```python
1  def discover(src, dst):
2      src.request_id += 1
3      rreq = RREQ(src, src.request_id, dst)
4      queue = deque([src])
5      while queue:
6          v = queue.popleft()
7          v.broadcast(rreq)
8          for n in v.neighbors():
9              if (src, rreq.request_id) in n.seen:
10                 continue  # drop the duplicate copy
11             n.seen.add((src, rreq.request_id))
12             n.reverse[src] = v  # the reverse path
13             if n == dst:
14                 continue  # dst answers instead of forwarding
15             queue.append(n)
16     w = dst
17     while w != src:  # the RREP retraces the reverse path
18         prev = w.reverse[src]
19         w.send(RREP(dst), to=prev)
20         prev.route[dst] = w
21         w = prev
```

DSR listing:

```python
1  def discover(src, dst):
2      src.request_id += 1
3      queue = deque([(src, [src])])
4      candidates = []
5      while queue:
6          v, record = queue.popleft()
7          v.broadcast(RREQ(src, src.request_id, dst, record))
8          for n in v.neighbors():
9              if n in record or (n != dst and (src, src.request_id) in n.seen):
10                 continue  # drop the copy
11             n.seen.add((src, src.request_id))
12             record_n = record + [n]  # the route record grows
13             if n == dst:
14                 candidates.append(record_n)
15             else:
16                 queue.append((n, record_n))
17     route = min(candidates, key=len)  # the first to arrive wins a tie
18     send_along(reversed(route), RREP(route))
19     src.cache[dst] = route
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Invalid input | 1 | "Type a source and a destination, such as S D." | none |
| New request | 2 | "`{src}` has no route to `{dst}`, so it starts route discovery `{id}`." | `{src}` current |
| Broadcast | 7 | "`{v}` broadcasts the RREQ to `{neighbors}`." (DSR adds ", carrying the record `{record}`") | `{v}` current, packets `*` |
| Per neighbor, duplicate | 10 | "`{n}` has already seen request `{id}`, so it drops this copy." | `{n}` dropped |
| Per neighbor, in record (DSR) | 10 | "`{n}` is already in the record, so it drops this copy." | `{n}` dropped |
| Per neighbor, first copy (AODV) | 12 | "`{n}` hears the RREQ first from `{v}`, so it records `{v}` as its way back to `{src}`." | link new |
| Per neighbor, first copy (DSR) | 12 | "`{n}` adds itself: the record is now `{record}`." | link new |
| Arrived (AODV) | 14 | "The RREQ reaches `{dst}` through `{v}`." | `{dst}` found |
| Candidate (DSR) | 14 | "`{dst}` receives the record `{record}`." | `{dst}` found |
| Flood over | 5 | "The flood is over after `{k}` RREQ transmissions; `{dst}` answers instead of forwarding." | none |
| Pick (DSR) | 17 | "`{dst}` picks `{route}`: `{h}` hops, the first to arrive." | path tree |
| Per hop, RREP (AODV) | 20 | "The RREP goes from `{w}` to `{prev}`, so `{prev}` now forwards to `{dst}` through `{w}`." (when `{w}` is `{dst}`: "…so `{prev}` now forwards straight to `{dst}`.") | link tree, packet |
| RREP (DSR) | 18 | "The RREP carries `{route}` back to `{src}`." | path tree, packet |
| Cached (DSR) | 19 | "`{src}` stores `{route}` in its route cache." | path tree |
| No route | 5 | "The RREQ never reached `{dst}`: there is no route." | none |

On the seed, from S to D: every node except D broadcasts once (5 RREQ transmissions, the slide's answer to "how many times is the RREQ sent?"), D first hears it through C, and the route is S, A, C, D in both variants. In DSR, D also receives S, B, E, D and keeps the first.

**Send data** (`send-aodv` and `send-dsr`, scoped like Discover route; `inputKind: "text"`, placeholder "Source and destination, e.g. S D")

AODV listing:

```python
1  def send(src, dst, payload):
2      if dst not in src.route:
3          return False  # run discover(src, dst) first
4      v = src
5      while v != dst:
6          nxt = v.route[dst]  # each node looks up its own table
7          v.send(DATA(dst, payload), to=nxt)
8          v = nxt
9      return True
```

DSR listing:

```python
1  def send(src, dst, payload):
2      if dst not in src.cache:
3          return False  # run discover(src, dst) first
4      packet = DATA(dst, payload, route=src.cache[dst])  # the header carries the route
5      v = src
6      while v != dst:
7          nxt = packet.route[packet.route.index(v) + 1]
8          v.send(packet, to=nxt)
9          v = nxt
10     return True
```

| Trigger | Line | Description |
|---|---|---|
| No route | 3 | "`{src}` has no route to `{dst}`. Run Discover route first." |
| Per hop, AODV | 6 | "`{v}` looks up `{dst}` in its table: next hop `{nxt}`." |
| Per hop, DSR | 7 | "`{v}` reads the header route `{route}`: next hop `{nxt}`." |
| Per hop | 7 (AODV), 8 (DSR) | "The packet moves from `{v}` to `{nxt}`." |
| Delivered | 9 (AODV), 10 (DSR) | "The packet reaches `{dst}` after `{h}` hops." |

DSR steps carry `variables.header`, the number of addresses in the header, which Week 2 names as DSR's cost: the header grows with the route.

**Break link** (`break-link`, `inputKind: "text"`, placeholder "Link, e.g. C D")

```python
1  def break_link(net, u, v):
2      net.link(u, v).broken = True
3      for end in (u, v):
4          for node in end.rerr_path():  # toward the route end on its side
5              node.delete_routes_through(u, v)
6      return  # src's next discover() uses a new request_id
```

| Trigger | Line | Description |
|---|---|---|
| No such link | 1 | "There is no link `{u}`-`{v}` to break." |
| Break | 2 | "Link `{u}`-`{v}` breaks." |
| Upstream end, RERR | 4 | "`{up}` sends an RERR toward `{src}`." (when `{up}` is `{src}`: "`{src}` is the source itself, so no RERR has to travel on its side.") |
| Downstream end, RERR | 4 | "`{down}` also sends an RERR, since it sits at the other end of `{u}`-`{v}`." (after the delete rows) |
| Per node, delete | 5 | "`{n}` deletes its route to `{dst}`, which used `{u}`-`{v}`." (DSR: "`{n}` deletes the cached route `{route}`.") |
| Done | 6 | "`{src}` has no route to `{dst}` now; its next discovery uses request id `{id}`." |

This is the Week 2 quiz case (link C-D breaks): C and D send the RERR, the route entries go, and S starts again with a new id. Running Discover route afterwards finds S, B, E, D. A link that no route uses breaks with the "Break" step and a final "No route used `{u}`-`{v}`, so no table changes." at line 3.

**Live fields:** `rreqTx`, `control`, `hops` (current route length, `none` without a route), `requestId`, and for DSR `header`.

### 10.4 Broadcast: flooding and MPR, `/topic/broadcast` (Week 3)

**Variant:** `relay: "mpr" | "flooding"` (default `"mpr"`), labeled MPR relays and Blind flooding.

**Snapshot:** `NetSnapshot` plus `mpr: Record<string, string[]>` (every node's MPR set, recomputed whenever a link changes, as HELLO exchange would), `tx: number`, `dups: number`, `reached: number`.

**Seed** (Week 3, "MPR dipilih dengan set cover serakah"; Misra pp. 126-127, Figure 6.2): nodes in this order A (1,1), B (0,0), D (2,0), E (2,2), C (0,-1), G (3,-1), F (3,1); links A-B, A-D, A-E, B-C, D-G, D-F, E-F. A is the source.

**Randomize:** 7 to 10 nodes, connected under the unit disk rule; the source is the first node.

**Select MPRs** (`select-mpr`, `variants: ["mpr"]`, `inputKind: "text"`, placeholder "Node, e.g. A")

```python
1  def select_mpr(u):
2      n1 = set(u.neighbors())
3      n2 = two_hop(u)  # neighbors of n1, minus n1 and u
4      mpr = set()
5      for c in n2:
6          via = n1 & set(c.neighbors())
7          if len(via) == 1:
8              mpr |= via  # the only way to c
9      covered = n2 & reach(mpr)
10     while covered != n2:
11         n = max(n1 - mpr, key=new_cover)  # ties go to node order
12         mpr.add(n)
13         covered |= n2 & reach({n})
14     return mpr
```

`two_hop`, `reach`, and `new_cover` are named for what they return: the two-hop neighbors, the two-hop nodes a set of neighbors reaches, and how many uncovered two-hop nodes a neighbor adds. Ties at line 11 go to the node that comes first in node order.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Invalid input | 1 | "Type a node id, such as A." | none |
| No neighbors | 3 | "`{u}` has no neighbors, so it needs no MPR." | `{u}` current |
| Sets | 3 | "`{u}` has one-hop neighbors `{N1}` and two-hop neighbors `{N2}`." (or "…and no two-hop neighbors.", then "`{u}` needs no MPR: every node it can reach is one hop away." at line 14) | N1 current, N2 visited |
| Per unique | 8 | "`{c}` is reachable only through `{n}`, so `{n}` becomes an MPR." | `{n}` found |
| Covered | 9 | "The MPRs so far cover `{covered}`." (or "No two-hop neighbor has a single way in, so no MPR is fixed yet.") | covered visited |
| Per greedy pick | 12 | "`{n}` covers `{k}` of the uncovered two-hop neighbors, the most, so it becomes an MPR." | `{n}` found |
| Done | 14 | "Every two-hop neighbor is covered. The MPR set of `{u}` is `{MPR}`; `{rest}` stay silent." ("stays" for one; or "; every neighbor is needed.") | MPRs found |

On the seed: C is reachable only through B and G only through D, so line 8 fixes B and D; they cover C, G, and F, no greedy pick follows, and E stays silent. This follows the slide's four-step table; the slide's worked example picks D in its step 2 instead, with the same MPR set (reviewed 2026-09-29, see `anti-slop/audit-003-2026-09-29.md`).

**Broadcast** (`broadcast-flooding` with `variants: ["flooding"]` and `broadcast-mpr` with `variants: ["mpr"]`, one id per listing; `inputKind: "text"`, placeholder "Source, e.g. A")

Blind flooding listing:

```python
1  def broadcast(src, packet):
2      queue = deque([(src, None)])
3      seen = {src}
4      while queue:
5          v, heard_from = queue.popleft()
6          if v != src and not relays(v, heard_from):
7              continue  # v stays silent
8          v.broadcast(packet)
9          for n in v.neighbors():
10             if n in seen:
11                 continue  # n drops a duplicate
12             seen.add(n)
13             queue.append((n, v))
14 def relays(v, heard_from):
15     return True  # blind flooding: every node relays once
```

The MPR listing reads `15     return v in heard_from.mpr  # relay only for the node that chose you`. The typed node becomes the source.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Invalid input | 1 | "Type a source node, such as A." | none |
| Transmit | 8 | "`{v}` transmits the packet to `{neighbors}`." | `{v}` current, packets `*` |
| Per neighbor, new | 12 | "`{n}` receives the packet for the first time." | `{n}` new, link new |
| Per neighbor, duplicate | 11 | "`{n}` already has the packet, so this copy is a duplicate." | `{n}` dropped |
| Silent (MPR) | 7 | "`{v}` is not an MPR of `{heardFrom}`, so it does not relay." | received nodes visited |
| Done | 4 | "`{r}` of `{n}` other nodes received the packet with `{t}` transmissions and `{d}` duplicates." | none |

Seed results from A: blind flooding 7 transmissions and 8 duplicates; MPR relaying 3 transmissions (A, B, D) and 2 duplicates; both reach all 6 other nodes. The step list shows why the slide says flooding sends redundant copies.

**Remove link** (`remove-link`, `inputKind: "text"`, placeholder "Link, e.g. D F")

```python
1  def remove_link(net, u, v):
2      net.links.remove((u, v))
3      for w in net.nodes:
4          w.mpr = select_mpr(w)  # from the new HELLO information
```

Steps: "Type a link, such as D F." or "There is no link `{u}`-`{v}`." (line 1); "Link `{u}`-`{v}` is gone." (line 2); per node whose set changed, in node order, "`{w}`'s MPR set changes from `{old}` to `{new}`." (line 4), or "No node's MPR set changes." (line 3). On the seed, removing D-F changes A's set to B, D, E, the Week 3 check question, and F's set from D to E.

**Live fields:** `tx`, `dups`, `reached`, `mprs` (size of the source's MPR set).

### 10.5 Geographic routing, `/topic/geographic-routing` (Week 3)

**Variant:** `recovery: "perimeter" | "none"` (default `"perimeter"`), labeled Greedy with perimeter and Greedy only.

**Snapshot:** `NetSnapshot` plus `mode: "greedy" | "perimeter"`, `hops: number`, `voids: number`, `flow: { src, dst, at } | null` (the last route and the packet's current node), `path: string[]` (the nodes it visited), and the `virtual` link from the source toward the destination that the slide draws dashed, labeled "toward D".

**Seed** (Week 3, "Saat greedy buntu, paket memutari void"; Misra 7.3.2): nodes S (2,2), F (1.2,2.6), A (1.4,1), B (2.2,0.2), C (3.4,0.3), E (4.3,1.1), D (4,2); links S-F, S-A, A-B, B-C, C-E, E-D; S source, D dest; `range = 1.6`.

**Randomize:** 8 to 10 nodes in a 6 × 4 area, connected under the unit disk rule, source and destination at the two most distant nodes.

**Route** (`route`, `inputKind: "text"`, placeholder "Source and destination, e.g. S D")

```python
1  def route(src, dst, recovery):
2      planar = gabriel(net.links)  # planar links for the perimeter walk
3      v, mode = src, 'greedy'
4      while v != dst:
5          if mode == 'greedy':
6              n = min(v.neighbors(), key=dist_to(dst))
7              if dist(n, dst) < dist(v, dst):
8                  v = n
9              elif recovery == 'perimeter':
10                 mode, stuck, prev = 'perimeter', v, None
11             else:
12                 return drop(v)  # greedy only: the packet dies at the void
13         else:
14             n = next_clockwise(v, prev, dst, planar)  # the void stays on one side
15             prev, v = v, n
16             if dist(v, dst) < dist(stuck, dst):
17                 mode = 'greedy'
18     deliver(dst)
```

The greedy rule forwards to the neighbor closest to the destination and only if that neighbor is closer than the current node, the advance-based rule Week 3 names as loop-free (Misra pp. 158-159). `next_clockwise` sweeps clockwise around `v`, starting from the direction toward `dst` when `prev` is `None` and from the direction back to `prev` otherwise, and returns the first neighbor over a link of `planar`; `prev` itself comes last, so the walk turns back only at a dead end. It also applies GPSR's face change: an edge that crosses the line from `stuck` to `dst` nearer `dst` than the last crossing is skipped, and the sweep continues past it. `gabriel` keeps link u-v when no other node lies inside the circle whose diameter is u-v (Misra 7.3.2 names RNG or the Gabriel graph); on the seed it keeps every link. The walk gives up when it is about to repeat its first perimeter edge.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Invalid input | 1 | "Type a source and a destination, such as S D." | none |
| Planarize | 2 | "The perimeter walk uses the Gabriel graph: `{k}` of `{m}` links stay." (or "every link stays.") | removed links dropped |
| Greedy hop | 8 | "`{n}` is the neighbor closest to `{dst}`: `{dn}` against `{dv}`, so the packet moves to `{n}`." | link tree |
| Void | 10 | "No neighbor of `{v}` is closer to `{dst}` than `{v}` itself (`{dv}`), so the packet switches to perimeter mode." | `{v}` flagged |
| Void, greedy only | 12 | "No neighbor of `{v}` is closer to `{dst}` than `{v}` itself, so greedy forwarding drops the packet." | `{v}` dropped |
| No progress | 14 | "The perimeter walk came back to `{stuck}` without getting closer, so `{dst}` is unreachable." | `{v}` dropped |
| Perimeter hop | 15 | "Sweeping clockwise at `{v}`, the first link leads to `{n}`." (after a face change: "Sweeping clockwise at `{v}`, the link to `{x}` crosses the line to `{dst}`, so the walk changes face and takes the link to `{n}`.") | link tree |
| Back to greedy | 17 | "`{v}` is `{dv}` from `{dst}`, closer than `{stuck}` was, so the packet returns to greedy mode." | `{v}` current |
| Delivered | 18 | "The packet reaches `{dst}` after `{h}` hops." | `{dst}` found, path tree |

Distances print to two decimals, and every step carries `variables.dist`. On the seed: S is 2.00 from D and both its neighbors are farther, so the void step fires at S; the walk goes S, A, B, C; C is 1.80 from D, so greedy resumes; E, then D. The path is S, A, B, C, E, D, the slide's route. The greedy-only variant drops the packet at S. A route between another pair moves the dotted direction line and the source and destination roles to that pair.

The canvas captions every node with its position in slide units, "(2, 2)", and, on a second line, its distance to the destination, "2.00 to D" (spoken "at 2, 2, 2.00 from D"), through `NetworkCanvas`'s `nodeLabels` prop. The destination shows only its position. At rest a caption appears while its node is hovered or focused; on a step, the node deciding the next hop (the sender of the packet in flight, otherwise the packet's current node) and its neighbors show theirs, the distances the greedy rule compares. At the void on the seed that is S, F, and A: 2.00, 2.86, and 2.79. The captions follow the destination role, so a route between another pair measures to its new destination. In node order, a caption moves above its node when that covers less of the nodes, the link label, and the captions on screen.

**Live fields:** `hops`, `mode` (`greedy` or `face`, since `perimeter` does not fit a 14-character chip), `voids`, `dist` (current node to destination).

### 10.6 Clustering: LCA, `/topic/clustering` (Week 4)

**Variant:** `rule: "highest" | "lowest"` (default `"highest"`), labeled Highest ID and Lowest ID. Week 4 presents the highest-ID rule and names the lowest-ID rule as a variation (Misra pp. 31-32).

**Snapshot:** `NetSnapshot` plus `head: Record<string, string | null>` (a node's cluster head, itself for a head), `gateways: string[]`, `elections: number` (heads elected after the first Elect). Node ids are integers written as strings.

**Seed** (Week 4, "ID tertinggi di sekitarnya jadi cluster head"): nodes in this order 9 (1,1), 4 (0,0), 2 (0,2), 6 (2,1), 8 (3,1), 3 (4,0), 5 (4,2); links 9-4, 9-2, 9-6, 6-8, 8-3, 8-5. Every node starts undecided.

**Randomize:** 7 to 10 nodes with distinct integer ids from 1 to 20, connected under the unit disk rule.

**Elect** (`elect`, `inputKind: "none"`)

```python
1  def elect(net, rank):
2      undecided = net.nodes_without_head()
3      while undecided:
4          v = best_local(undecided, rank)  # ranks first among its undecided neighbors
5          v.head = v
6          undecided.discard(v)
7          for n in v.neighbors():
8              if n in undecided:
9                  n.head = v  # n joins the cluster of v
10                 undecided.discard(n)
11     for n in net.members():
12         if len(n.heads_in_range()) >= 2:
13             n.gateway = True
```

`best_local` returns the undecided node that ranks first among its undecided neighbors and itself: the highest id, or the lowest under the lowest-ID rule. When several nodes qualify, the best-ranked of them goes first.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Nothing to do | 2 | "Every node already has a cluster head." | none |
| Head | 5 | "`{v}` has the `{highest/lowest}` id among its undecided neighbors, so it becomes a cluster head." (or "`{v}` has no undecided neighbor left, so it becomes a cluster head of its own.") | `{v}` found |
| Per member | 9 | "`{n}` joins cluster head `{v}`." | link new |
| Per gateway | 13 | "`{n}` neighbors cluster heads `{heads}`, so it becomes a gateway." | `{n}` new |
| Done | 11 | "`{h}` cluster heads and `{g}` gateways." | none |

Member-to-head links stay drawn as `tree` on every step and at rest. On the seed with the highest-ID rule: 9 is head (4, 2, 6 join), 8 is head (3, 5 join), 6 is the gateway, the slide's figure. With the lowest-ID rule the same seed gives five heads (2, 3, 4, 5, 6) and gateways 9 and 8; the test pins both.

**Node leaves** (`leave`, `inputKind: "text"`, placeholder "Node, e.g. 9")

```python
1  def leave(net, u, rank):
2      net.remove(u)
3      if u.head == u:
4          for n in u.members():
5              heads = n.heads_in_range()
6              if heads:
7                  n.head = min(heads, key=rank)  # a head it can still hear
8              else:
9                  n.head = None  # undecided again
10         elect(net, rank)  # only the undecided nodes
11     net.recompute_gateways()
```

Steps: "Type a node id, such as 9." or "There is no node `{u}`." (line 1); "`{u}` leaves the network." (line 2); per orphan in node order, "`{n}` joins cluster head `{h}`, which it can still hear." (line 7) or "`{n}` hears no cluster head, so it is undecided again." (line 9); the Elect head and member rows at line 10, each head adding one to `elections`; "Gateways are now `{list}`." or "No node is a gateway now." (line 11). On the elected seed, 9 leaving sends 6 to head 8 and makes 4 and 2 heads of their own clusters: two new elections, and no gateway is left.

**Node joins** (`join`, `inputKind: "text"`, placeholder "New id and its neighbors, e.g. 7 6 8")

```python
1  def join(net, u, links, rank):
2      net.add(u, links)
3      heads = u.heads_in_range()
4      if heads:
5          u.head = min(heads, key=rank)
6      else:
7          u.head = u  # no head in range, so u leads its own cluster
8      net.recompute_gateways()
```

Steps: "Type a new id and its neighbors, such as 7 6 8.", "Node `{u}` already exists.", or "There is no node `{x}` to link to." (line 1); "`{u}` joins the network with links to `{list}`." (line 2); "`{u}` joins cluster head `{h}`, which it can hear." (line 5) or "`{u}` hears no cluster head, so it becomes one." (line 7, adding one to `elections`); the gateway row of Leave at line 8. The new node is placed at the centroid of its neighbors plus (0.3, 0.3) when that spot is at least 1 from every node, and otherwise at the first such spot on rings around the centroid (ADR-016); on the elected seed, 7 linked to 6 and 8 lands at (2.5, 2.2) and joins head 8.

**Live fields:** `nodes`, `heads`, `gateways`, `elections`.

### 10.7 Address allocation: Buddy and query-based DAD, `/topic/address-allocation` (Week 4)

**Variant:** `scheme: "buddy" | "qdad"` (default `"buddy"`), labeled Buddy and Query-based DAD.

**Snapshot:** `NetSnapshot` plus

```ts
interface AddressExtra {
  space: number;                                   // 16: addresses 1 to 16
  address: Record<string, number | null>;
  pool: Record<string, [number, number][]>;        // Buddy: ranges each node holds
  leaked: number;                                  // Buddy: addresses lost with a crashed node
  control: number;                                 // QDAD: AREQ and AREP transmissions
  conflicts: number;                               // duplicate addresses found on merge
  partition: { nodes: NetNode[]; links: NetLink[]; address: Record<string, number>; pool: Record<string, [number, number][]> }; // drawn faded until Merge
  merged: boolean;
  seed: number;                                    // QDAD draws from mulberry32(seed); 7 on the seed
}
```

The 16-address space is this demo's choice so every address fits on screen; the Protocol tab says so.

**Seed:** nodes A (0,0), B (1,0), C (2,0); links A-B, B-C. Buddy: A holds 1 to 8 (address 1), B holds 9 to 12 (address 9), C holds 13 to 16 (address 13), the state after A started with the whole space and B joined through A, then C through B. QDAD: A 5, B 11, C 2 (fixed seed values). The separate partition is P (4,0) and Q (5,0) linked P-Q, with addresses P 1, Q 9 under Buddy (P holds 1 to 8 and Q 9 to 16, since their own first node started from the whole space) and P 11, Q 3 under QDAD.

**Randomize:** replays 3 to 6 random joins from a single first node, same scheme, fresh seed.

**Join, Buddy** (`join-buddy`, `variants: ["buddy"]`, `inputKind: "text"`, placeholder "New node and the node it meets, e.g. D C")

```python
1  def join_buddy(new, via):
2      if size(max(via.pool, key=size)) == 1:
3          return  # no range left to split
4      lo, hi = max(via.pool, key=size)
5      keep, give = split_in_half(lo, hi, via.address)  # via keeps the half with its own address
6      via.pool.replace((lo, hi), keep)
7      new.pool = [give]
8      new.address = give[0]  # no other node is asked
```

`split_in_half` gives `via` the lower half and the newcomer the upper half, except when `via`'s own address sits in the upper half (after a Leave merged ranges), where the halves swap so `via` keeps its address. The new node is placed at `via` plus (0.5, -0.8), moved right in steps of 0.6 while another node sits within 0.4; this placement is this demo's choice.

| Trigger | Line | Description |
|---|---|---|
| Invalid | 1 | "Type a new node id and a configured neighbor, such as D C." |
| No spare address | 3 | "`{via}` has no range left to split, so `{new}` cannot join through it." |
| Split | 4 | "`{via}` splits `{lo}` to `{hi}` in half." |
| Hand over | 6 | "`{via}` keeps `{a}` to `{b}` and gives `{c}` to `{d}` to `{new}`." (a one-address range prints as the address alone) |
| Address | 8 | "`{new}` takes address `{addr}` without asking any other node." |

On the seed, D joining through C: C keeps 13 to 14, and D takes 15.

**Leave, Buddy** (`leave-buddy`, `variants: ["buddy"]`, `inputKind: "text"`, placeholder "Node, e.g. C")

```python
1  def leave_buddy(net, u):
2      b = u.buddy()  # the neighbor whose range sits next to u's, else the first neighbor
3      b.pool = merge_touching(b.pool + u.pool)
4      net.remove(u)
```

Steps: "Type a node id, such as C." (line 1); "`{u}` has no neighbor to take its ranges, so it cannot hand them over." (line 2, and `{u}` stays); "`{u}` says goodbye and hands `{ranges}` to `{b}`." (line 3), "`{b}` now holds `{merged}`." (line 3), "`{u}` leaves." (line 4). On the seed, C leaving hands 13 to 16 to B, which then holds 9 to 16.

**Crash, Buddy** (`crash-buddy`, `variants: ["buddy"]`, `inputKind: "text"`, placeholder "Node, e.g. C")

```python
1  def crash_buddy(net, u):
2      net.remove(u)  # no goodbye
3      net.leaked += size(u.pool)  # no node knows these addresses are free
```

Steps: "`{u}` disappears without a goodbye." (line 2), "`{k}` addresses went with `{u}`, and no node knows they are free." (line 3, its former neighbors flagged). Week 4 names this leak and the periodic synchronization that fixes it; v1 shows the leak only. On the seed, C crashing leaks 4 addresses.

**Join, QDAD** (`join-qdad`, `variants: ["qdad"]`, `inputKind: "text"`, placeholder as Join, Buddy)

```python
1  def join_qdad(new, via):
2      a = randint(1, 16)
3      tries = 0
4      while tries < 3:
5          new.flood(AREQ(a))  # through every node new can reach
6          owner = new.node_using(a)
7          if owner:
8              owner.send(AREP(a), to=new)
9              a = randint(1, 16)
10             tries = 0
11         else:
12             tries += 1  # nobody answered
13     new.address = a  # three AREQs with no AREP, so a counts as free
```

The slide says the AREQ repeats up to a retry limit; 3 is this demo's limit. `randint` draws from `mulberry32(seed)`, and the operation stores a fresh `seed` drawn from the same generator, so the next join picks differently.

| Trigger | Line | Description |
|---|---|---|
| Invalid | 1 | "Type a new node id and a configured neighbor, such as D C." |
| Pick | 2 | "`{new}` picks address `{a}` at random." |
| Per try | 5 | "`{new}` floods AREQ `{a}` (try `{t}` of 3)." |
| Owner | 8 | "`{owner}` already uses `{a}`, so it answers with an AREP and `{new}` picks again." |
| Pick again | 9 | "`{new}` picks address `{a}` at random." |
| Silence | 12 | "Nobody answers try `{t}`." |
| Take | 13 | "Three AREQs got no answer, so `{new}` takes address `{a}`." |

Every AREQ counts once per node that transmits it (every node `{new}` can reach, itself included), and every AREP once per hop, into `control`.

**Merge partition** (`merge`, `inputKind: "none"`, both variants)

```python
1  def merge(net, partition):
2      net.link(net.nearest(partition), partition.first)  # the partitions come into range
3      for a in shared_addresses(net, partition):
4          net.conflicts += 1
5          x = partition.node_using(a)
6          x.pool, x.address = [], None  # x gives up its old address
7          join(x, via=x.first_configured_neighbor())
```

Steps: "The partition has already merged." (line 1); "The partition with `{nodes}` comes into range: `{m}` links to `{first}`." (line 2, `{m}` the main-network node nearest the partition's first node, C on the seed); per conflict in address order, "`{y}` and `{x}` both use address `{a}`." (line 4, `{y}` from the main network) and the Join steps of the active scheme at line 7, through `{x}`'s first neighbor in node order that has an address and no pending conflict; "`{k}` conflicts were found and resolved." or "No address is used twice." (line 3). On the seed Buddy finds 2 conflicts (A and P on 1, B and Q on 9): P rejoins through C and takes 15, then Q through P and takes 16. QDAD finds 1 (B and P on 11). This matches what Week 4 says about partitions: query-based DAD cannot guarantee a unique address when the delay across a partition has no bound, and MANETconf gives each partition an id so that two nodes can tell when a merge happens (Misra pp. 338-341). The Protocol tab points to MANETconf for that reason.

The canvas draws each node's address under it (Buddy adds its pool on a second line, "1–8"; the spoken label reads "address 1, pool 1 to 8") through `NetworkCanvas`'s `nodeLabels` prop, and the partition as faded nodes without their link until Merge.

**Live fields:** Buddy `nodes`, `free` (addresses in pools not used as an address), `leaked`, `conflicts`; QDAD `nodes`, `control`, `conflicts`.

### 10.8 Mobility models, `/topic/mobility` (Week 5)

**Variant:** `model: "rwp" | "rpgm"` (default `"rwp"`), labeled Random waypoint and Group (RPGM).

**Snapshot:** `NetSnapshot` plus

```ts
interface MobilityExtra {
  seed: number; tick: number;
  area: { w: number; h: number };                         // 10 × 6
  motion: Record<string, { tx: number; ty: number; speed: number; pause: number }>;
  groups?: { ref: { x: number; y: number }; path: { x: number; y: number }[]; step: number; members: string[] }[];
  linkChanges: number;                                    // links that appeared or broke, all ticks
  linkAge: Record<string, number>;                        // ticks each current link has existed
  closedDurations: number[];                              // lifetimes of links that broke
  pairsConnected: number; pairsTotal: number;             // for path availability
  history: { x: number; y: number }[];                    // every position after every tick
}
```

**Parameters** (this demo's choices, shown in the Protocol tab): 8 nodes, area 10 × 6, `range = 2.5`, speed drawn from 0.3 to 1.0 units per tick (a minimum above zero, because Week 5 warns that `vmin = 0` drags the average speed down), pause drawn from 0 to 2 ticks. RPGM: two groups of four; each member does random waypoint without pauses inside a disc of radius 1 around its group's reference point; each reference point walks a fixed path of four corners of the area, one unit per tick, group 2 starting at the opposite corner (Misra 10.3.2).

**Seed:** `seed = 5`, positions drawn from it; the test pins the positions after 10 ticks for both models.

**Randomize:** a fresh seed; tick and statistics reset.

**Advance** (`advance-rwp` with `variants: ["rwp"]` and `advance-rpgm` with `variants: ["rpgm"]`, one id per listing; `inputKind: "key"`, placeholder "Ticks, from 1 to 40")

RWP listing:

```python
1  def advance(net, ticks):
2      for t in range(ticks):
3          for v in net.nodes:
4              move(v)
5          net.links = unit_disk(net.nodes, net.range)
6          net.link_changes += count_changes(net.links)  # links that appeared or broke
7          net.update_link_ages()  # and path availability
8  def move(v):
9      if v.pause > 0:
10         v.pause -= 1
11     elif v.at_waypoint():
12         v.pause = rng.randint(0, 2)
13         v.waypoint, v.speed = rng.point_in(area), rng.uniform(0.3, 1.0)
14     else:
15         v.step_toward(v.waypoint, v.speed)
```

The RPGM listing replaces lines 8 to 15:

```python
8  def move(v):
9      ref = v.group.ref  # moved one step along the group path each tick
10     if v.at_waypoint():
11         v.waypoint, v.speed = rng.point_within(ref, 1), rng.uniform(0.3, 1.0)
12     else:
13         v.step_toward(v.waypoint, v.speed)
```

| Trigger | Line | Description |
|---|---|---|
| Out of range input | 1 | "Type a number of ticks from 1 to 40." |
| Per tick | 6 | "Tick `{t}`: `{up}` links appeared and `{down}` broke, `{m}` links now." |
| Done | 7 | "After `{t}` ticks the links changed `{c}` times, a link lasts `{d}` ticks on average, and `{p}` % of node pairs had a path." |

The metrics named in the done step are the protocol-independent ones Week 5 lists (Misra pp. 249-250). Mean link duration uses `closedDurations`; with none, it reads "no link has broken yet".

**Where nodes spend time** (`density`, `inputKind: "none"`, an algorithm)

```python
1  def density(history):
2      if not history:
3          return None  # advance the nodes first
4      centre = 0
5      for p in history:
6          if in_middle_half(p, area):  # the middle half of both width and height
7              centre += 1
8      return centre / len(history)  # the share of time spent in the centre quarter
```

Steps: "`{k}` of `{n}` recorded positions fall in the centre quarter of the area." (line 7), then "The centre quarter holds `{s}` % of the time spent, against 25 % for an even spread." (line 8), or "Advance the nodes first: no positions are recorded yet." (line 3). The 25 % is the area share, a computed baseline. Week 5 states that RWP crowds nodes in the middle (Misra p. 241); this operation lets the student check that on a run instead of taking it on trust.

**Metrics run** (`metrics`, Section 9.1): both models on the current seed for 30 ticks, four flows between random pairs, each sending one data packet per tick along an AODV-style route that is rediscovered when it breaks.

**Live fields:** `tick`, `links`, `changes`, `meanDur`, `pathAvail`.

### 10.9 Network models and evaluation, `/topic/evaluation` (Week 6)

**Variant:** `graph: "udg" | "qudg"` (default `"udg"`), labeled Unit disk graph and Quasi unit disk graph. The QUDG rule is Section 7.2's, with `q = 0.8`, a demo value the Protocol tab names.

**Snapshot:** `NetSnapshot` plus `seed: number`, `marked: string[]`, `cds: string[]`.

**Seed:** nodes A (0,0), B (1,0.6), C (1,-0.6), D (2,0), E (3,0), F (4,0.6), G (4,-0.6), H (5,0); `range = 1.2`. Under the unit disk rule the links are A-B, A-C, B-C, B-D, C-D, D-E, E-F, E-G, F-G, F-H, G-H. This seed is this spec's, chosen so both steps of the algorithm below visibly change the result.

**Randomize:** 8 to 10 nodes in a 6 × 4 area, linked by the active rule, fresh seed.

**Build links** (`build-links`): Section 10.1's operation and table, with the QUDG rule's extra row: "`{p}` and `{q}` are `{d}` apart, between `{q·range}` and `{range}`, and the draw says `{yes/no}`: `{link/no link}`." at line 6 when linked and line 5 when not.

**Connected dominating set** (`cds`, `inputKind: "none"`)

```python
1  def cds(net):
2      marked = []
3      for v in net.nodes:  # Wu's marking process
4          if has_unlinked_pair(v.neighbors()):  # two neighbors that cannot hear each other
5              marked.append(v)
6      kept = set(marked)
7      for v in marked:  # pruning rule 1
8          u = larger_cover(v, marked)  # a marked neighbor with a larger id that covers v and its neighbors
9          if u is None:
10             continue  # v stays
11         kept.discard(v)
12     return kept
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Per node, marked | 5 | "`{u}` and `{w}` are neighbors of `{v}` but not of each other, so `{v}` is marked." | `{v}` found |
| Per node, not marked | 4 | "Every two neighbors of `{v}` are neighbors of each other, so `{v}` is not marked." | `{v}` visited |
| Per marked node, pruned | 11 | "`{u}` has a larger id and covers `{v}` and all its neighbors, so `{v}` is unmarked." | `{v}` dropped |
| Per marked node, kept | 10 | "No marked neighbor with a larger id covers all of `{v}`'s neighbors, so `{v}` stays." | `{v}` found |
| Result | 12 | "The connected dominating set is `{cds}`: `{k}` of `{n}` nodes." | set tree |

Line 8 compares closed neighborhoods (a node plus its neighbors) and checks against `marked`, the marking from line 5, never against `kept`, so the order of pruning does not matter. The marking process is the three-step algorithm of Week 6 (Loo pp. 45-46); the pruning rule is Week 3's rule 1 of Wu and Li (Misra pp. 128-129). On the seed the marking picks B, C, D, E, F, G; pruning removes B (covered by C) and F (covered by G), leaving C, D, E, G.

**Metrics over seeds** (`metrics`, `inputKind: "key"`, placeholder "Seeds, from 1 to 10"): the Section 9.1 run repeated over seeds 1 to `k`. Each seed places 10 nodes in a 6 × 4 area, links them by each variant's rule, and runs three flows of ten packets on the AODV-style model. Steps: one per seed per variant ("`{graph}`, seed `{s}`: `{pdr}` % delivered."), then the result at line 9 of the Section 9.1 listing: "Over `{k}` seeds, UDG delivers `{m1}` % (standard deviation `{s1}`) and QUDG `{m2}` % (standard deviation `{s2}`)." `MetricsBars` draws each mean with a whisker of one standard deviation. Week 6 asks for spread next to every mean; this operation is where the student sees why.

**Live fields:** `nodes`, `links`, `marked`, `cds`.

### 10.10 QoS, ETX, and energy-aware routing, `/topic/qos-routing` (Week 7)

**Variant:** `metric: "bandwidth" | "etx" | "energy" | "hop"` (default `"bandwidth"`), labeled Bandwidth, ETX, Energy, and Hop count.

**Snapshot:** `NetSnapshot` plus `path: string[] | null`, `sent: number`, `firstDown: number | null` (the packet after which the first relay ran out).

**Seed** (Week 7, "Jalur terpendek belum tentu memenuhi syarat"; Misra 12.8): nodes A (0,1), B (1,2), C (2,2), D (1,0), E (3,1); links A-B, B-C, C-E, A-D, D-E; A source, E dest. The slide gives the topology and the 3 Mbps request but no per-link values, so this spec sets them, and the canvas captions them "example values":

| Link | Bandwidth (Mbps) | Delivery ratio w, both directions |
|---|---|---|
| A-B | 4 | 0.9 |
| B-C | 5 | 0.9 |
| C-E | 4 | 0.9 |
| A-D | 2 | 0.5 |
| D-E | 6 | 0.6 |

Batteries: A 100, B 20, C 60, D 80, E 100 units.

**Randomize:** keeps the topology and draws new link values and batteries.

**Find path** (`path-hop`, `path-bandwidth`, `path-etx`, `path-energy`, one per variant; `inputKind: "text"`; placeholders "Source and destination, e.g. A E" and, for bandwidth, "Source, destination, Mbps, e.g. A E 3")

Hop count and bandwidth, bandwidth listing (the hop listing opens `1  def find_path(net, src, dst):` and reads `2      usable = net.links  # every link counts`, so the two number their lines alike):

```python
1  def find_path(net, src, dst, need):
2      usable = net.links_at_least(need)  # bandwidth in Mbps
3      frontier, prev = deque([src]), {src: None}
4      while frontier:
5          v = frontier.popleft()
6          if v == dst:
7              return path_to(dst, prev)
8          for n in v.neighbors(usable):
9              if n not in prev:
10                 prev[n] = v
11                 frontier.append(n)
12     return None  # no path meets the request
```

ETX:

```python
1  def find_path(net, src, dst):
2      cost, prev, done = {src: 0}, {src: None}, set()
3      while set(cost) - done:
4          v = min(set(cost) - done, key=cost.get)  # ties go to node order
5          done.add(v)
6          if v == dst:
7              return path_to(dst, prev)
8          for n in v.neighbors():
9              if n in done:
10                 continue
11             c = cost[v] + 1 / (w(v, n) * w(n, v))  # the ETX of the link
12             if n not in cost or c < cost[n]:
13                 cost[n], prev[n] = c, v
14     return None  # dst is unreachable
```

Energy (keep the weakest relay as strong as possible):

```python
1  def find_path(net, src, dst):
2      weakest, prev, done = {src: float('inf')}, {src: None}, set()
3      while set(weakest) - done:
4          v = max(set(weakest) - done, key=weakest.get)  # fewer hops on a tie
5          done.add(v)
6          if v == dst:
7              return path_to(dst, prev)
8          for n in v.neighbors():
9              if n in done:
10                 continue
11             b = weakest[v] if n == dst else min(weakest[v], n.battery)
12             if n not in weakest or b > weakest[n]:
13                 weakest[n], prev[n] = b, v
14     return None  # dst is unreachable
```

| Trigger | Line (hop, bw / etx, energy) | Description | Highlight |
|---|---|---|---|
| Invalid input | 1 / 1 | "Type a source and a destination, such as A E." (bandwidth: "…and a bandwidth in Mbps, such as A E 3.") | none |
| Per pruned link | 2 / none | "Link `{u}`-`{v}` offers `{b}` Mbps, less than `{need}`, so it is not used." | link broken |
| Settle | 5 / 5 | "`{v}` is next: `{value}`." (hop: "`{h}` hops from `{src}`"; ETX: "ETX `{c}` from `{src}`"; energy: "the weakest relay on the way has `{b}` units") | `{v}` current |
| Per neighbor, improved | 10 / 13 | "`{n}` is reached through `{v}`: `{value}`." | link active |
| Per neighbor, not better | 9 / 12 | "Going through `{v}` does not improve `{n}`." | none |
| Found | 7 / 7 | "Path `{path}`: `{h}` hops, `{summary}`." (bandwidth: "every link offers at least `{need}` Mbps"; ETX: "total ETX `{c}`"; energy: "weakest relay `{b}` units"; hop: "the fewest hops") | path tree |
| None | 12 / 14 | "No path from `{src}` to `{dst}` meets the request." | none |

A neighbor that is already done (line 10) emits no step.

Seed results from A to E: hop count picks A, D, E (2 hops); bandwidth with 3 Mbps prunes A-D and picks A, B, C, E, the slide's answer; ETX picks A, B, C, E (total 3.70 against 6.78 through D, Week 7's point that more short hops can beat fewer weak ones); energy picks A, D, E (weakest relay D at 80, against B at 20). ETX values print to two decimals.

**Send packets** (`send`, `inputKind: "key"`, placeholder "Packets, from 1 to 50")

```python
1  def send(net, path, k):
2      for p in range(1, k + 1):
3          if has_down_relay(path):
4              return  # the path is broken; find a new path first
5          send_along(path, DATA(p))
6          for r in path[1:-1]:  # the relays, not src or dst
7              r.battery -= 1
8              if r.battery == 0:
9                  r.down = True
```

Steps: per packet at line 5 ("Packet `{p}` reaches `{dst}`; relays have `{batteries}` left."), a relay running out at line 9 ("`{r}` runs out of battery after packet `{p}`, so the path breaks."), and a stop at line 4 ("The path is broken. Find a new path first."). Sending 20 packets on the ETX path takes B down at packet 20; on the energy path D still has 60 units. Week 7 separates total energy from network lifetime (Loo p. 203); these two runs show the difference on one network.

**Live fields:** `hops`, `cost` (the variant's summary value), `minBatt` (the weakest relay on the path), `sent`.

### 10.11 Routing attacks and the watchdog, `/topic/routing-attacks` (Week 8)

**Variant:** `attacker: "blackhole" | "wormhole" | "none"` (default `"blackhole"`), labeled Black hole, Wormhole, and No attacker. `createInitialState(variant)` loads the variant's seed.

**Snapshot:** `NetSnapshot` plus `route: string[] | null`, `sent`, `delivered`, `dropped`, `tunneled` (packets that crossed the tunnel), `failures: Record<string, number>` (watchdog counts), `flagged: string[]`.

Discovery is DSR-style (Section 10.3), because Week 8 says the watchdog suits source routing (Misra pp. 444-445).

**Seeds.** Black hole and no attacker (Week 8, "Black hole menarik rute lalu membuang paket"; Misra Figure 18.2): nodes S (0,1), A (1,0), M (1,2), B (2,0), D (3,1); links S-A, S-M, A-B, B-D; under Black hole, M is `malicious` and the claimed link M-D is drawn `virtual` and dashed, as on the slide; under No attacker, M is an ordinary node with no link to D. Wormhole (Week 8, "Wormhole membuat dua area terasa bertetangga"; Misra Figure 18.3): nodes S (0,1), A (1,0), M1 (1,2), B (2,0), C (3,0), M2 (3,2), D (4,1); links S-A, A-B, B-C, C-D, S-M1, M2-D; M1 and M2 `malicious`; the tunnel M1-M2 is `virtual`.

**Randomize:** none; the button restores the variant's seed, and its label reads Reset scene.

**Discover route** (`discover`, `inputKind: "none"`, from S to D)

```python
1  def discover(net, src, dst):
2      heard = [(src, [src])]
3      while heard:
4          heard = flood_tick(heard)  # each node forwards its first copy and adds itself to the record
5          for n, record in heard:
6              if n.black_hole:
7                  n.send(RREP(record + [dst]), to=src)  # a route n does not have
8              if n.tunnel_end:
9                  heard.append((n.far_end, record + [n.far_end]))  # replayed in the same tick
10             if n == dst:
11                 send_along(reversed(record), RREP(record))
12         for route in src.rreps_arrived():
13             src.routes.append(route)  # every route is kept, in order of arrival
14     return src.routes[0]  # the first RREP to arrive wins
```

`heard` holds the nodes that first hear the RREQ in this tick, each with the record that reached it.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Per tick | 4 | "Tick `{t}`: `{nodes}` hear the RREQ." | new nodes current |
| Black hole | 7 | "`{n}` answers at once, claiming a route `{route}` it does not have." | `{n}` flagged |
| Tunnel | 9 | "`{n}` passes the RREQ through the tunnel, and `{m}` replays it next to `{far}`." | tunnel active |
| Destination | 11 | "`{dst}` receives the record `{record}` and answers." | `{dst}` found |
| Per RREP arrival | 13 | "An RREP with `{route}` reaches `{src}` at tick `{t}`." | packet |
| Pick | 14 | "`{src}` uses the first route to arrive: `{route}`." | path tree |

Seed results: Black hole, the fake RREP S, M, D arrives first and S uses it; Wormhole, D first hears S, M1, M2, D (3 apparent hops against 4 through A, B, C) and S uses it; No attacker, S uses S, A, B, D.

**Send packets** (`send`, `inputKind: "key"`, placeholder "Packets, from 1 to 20")

```python
1  def send(net, route, k):
2      for p in range(1, k + 1):
3          delivered = True
4          for v, nxt in zip(route, route[1:]):
5              if v.black_hole:
6                  delivered = False  # v drops p without a trace
7                  break
8              v.send(DATA(p), to=nxt)  # through the tunnel if this link is one
9          net.count(p, delivered)
```

Steps per packet: "`{v}` drops packet `{p}` without a trace." (line 6) or "Packet `{p}` reaches `{dst}`." (line 9), with "Packet `{p}` crosses the tunnel from `{m1}` to `{m2}`." (line 8) on the wormhole. Week 8 notes that a tunnel works even when traffic is encrypted, because the attacker relays packets without reading them; the delivered count stays at 100 % while `tunneled` rises, which is the point of the scene.

**Send with watchdog** (`watchdog`, `inputKind: "key"`, placeholder "Packets, from 1 to 20")

```python
1  def send_watched(net, src, route, k):
2      for p in range(1, k + 1):
3          for v, nxt in zip(route, route[1:]):
4              v.send(DATA(p), to=nxt)  # v keeps a copy and listens to nxt
5              if nxt == route[-1] or v.overhears(nxt, p):
6                  continue  # delivered, or passed on
7              failures[nxt] += 1
8              if failures[nxt] > 3:  # the threshold
9                  src.report(nxt)  # the pathrater avoids nxt from now on
10                 route = best_route_without(src.routes, nxt)
11             break  # p is lost at nxt
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Heard | 5 | "`{v}` hears `{nxt}` forward packet `{p}`." | link tree |
| Silence | 7 | "`{v}` never hears `{nxt}` forward packet `{p}`: `{f}` failures for `{nxt}`." | `{nxt}` flagged |
| Report | 9 | "`{nxt}` passed the threshold of 3, so `{v}` reports it to `{src}`." | `{nxt}` flagged |
| Reroute | 10 | "The pathrater avoids `{nxt}`: `{src}` switches to `{route}`." | path tree |
| Delivered | 5 | "Packet `{p}` reaches `{dst}`." | none |

The threshold of 3 is this demo's; Week 8 says only that a count past a threshold is reported. On the black hole seed with 10 packets: packets 1 to 4 are dropped, M is reported after the fourth, and packets 5 to 10 go S, A, B, D. On the wormhole seed every packet is passed on, so the watchdog has no failure to count and flags nobody, while M1 and M2 still control the route. This demo counts a forward into the tunnel as heard and does not model what a watcher could physically overhear. Week 8 lists collaborative attacks among the watchdog's blind spots (Misra pp. 444-445).

**Live fields:** `sent`, `delivered`, `dropped`, `pdr`, `flagged`, and on the wormhole `tunneled` in place of `flagged`.

## 11. Content Integration

The course slides in `references/id/minggu-01.md` to `minggu-08.md` are Indonesian and slide-shaped (`kicker`, `judul`, bullet rows, `Catatan` speaker notes). They are the upstream source and are **frozen**: their bytes never change, and `scripts/check-copy.mjs` does not scan them.

The app reads English references instead, one per week, in `references/en/`:

| File | Source | Topics it feeds |
|---|---|---|
| `Week-1-Introduction.md` | `id/minggu-01.md` | `multihop` |
| `Week-2-Routing.md` | `id/minggu-02.md` | `proactive-routing`, `reactive-routing` |
| `Week-3-Broadcast-Multicast-Geographic.md` | `id/minggu-03.md` | `broadcast`, `geographic-routing` |
| `Week-4-Self-Organization.md` | `id/minggu-04.md` | `clustering`, `address-allocation` |
| `Week-5-Mobility-Propagation.md` | `id/minggu-05.md` | `mobility` |
| `Week-6-Modeling-Simulation.md` | `id/minggu-06.md` | `evaluation` |
| `Week-7-QoS-Congestion-Energy.md` | `id/minggu-07.md` | `qos-routing` |
| `Week-8-Security-Trust.md` | `id/minggu-08.md` | `routing-attacks` |

Each file has YAML frontmatter (`week`, `title`, `source`, `status`, `books`) and four sections: `## 1. Learning Outcomes`, `## 2. Real-World Usage`, `## 3. Core Material`, `## 4. Summary`. Section 3 has one `###` subsection per slide part, and a subsection that feeds topics ends its heading with their slugs in braces, `{#slug}` or `{#slug-a #slug-b}`, for example `### 3.2 Reactive routing: AODV, DSR, TORA {#reactive-routing}`. A topic's `coreMaterial` is every subsection tagged with its slug, in file order, with the `{#slug}` marker removed (Week 1 tags both of its subsections `multihop`). A subsection without a slug (multicast, node cooperation, simulators) is course material the app does not show on a topic page in v1. Section 2, Real-World Usage, stays in the references, but the app no longer shows it: each topic's Scenario tab (Section 20) took its place, and a scenario quotes the facts it needs from the reference with their pages (ADR-015).

**Status gate.** A reference starts as `status: draft`. The lecturer reviews it against the slides and the books and changes it to `status: reviewed`. `scripts/extract-content.mjs` refuses a draft: it fails with the file name and generates nothing for that week. A topic cannot be implemented (Section 15) until its reference is reviewed.

**What the drafts may say.** Every claim in an English reference comes from the matching slide file: a slide bullet, a table row, or a `Catatan` note, translated, with the book and page the slide cites. Nothing is added from memory or from the books directly. Where the slide gives a number, the English file gives the same number and the same page. The drafts do not reproduce the slides' in-class answers to quiz questions, because the quiz belongs to the lecture.

**Generation.** `scripts/extract-content.mjs` copies the slugged §3 subsections into `coreMaterial` for each topic, verbatim, into `src/topics/<slug>/content.ts` with the dsa-course header comment. Once a file is reviewed, only its punctuation may change (Section 18); a change of wording or claim goes back to `status: draft`.

**Case study copy** (`scenario`, `reasoning`, decisions, quiz) is hand-written, as in dsa-course. Each scenario says it is illustrative, and every cost or property it states quotes the English reference of the week it names.

## 12. Accessibility and Responsiveness

dsa-course Section 12 applies unchanged: keyboard playback (Space, ←, →) with `aria-label`s, the stacked mobile order (Canvas, Operation, Code, Playback), `viewBox` scaling, fixed canvas heights, and the layout contract by width that `e2e/topic-page-layout.spec.ts` and `e2e/case-study-page.spec.ts` check at `lg`, `md`, and phone widths (400px, nothing overflows sideways, stepping never moves the page).

Additions for this project:

- `NetworkCanvas` has the summary `aria-label` of Section 8, and every node is focusable with a spoken description, because a network drawing carries its meaning in relations a screen reader cannot see.
- A node's range circle appears on focus as well as on hover.
- `MetricsBars` shows every value as text next to its bar, so the comparison does not depend on reading bar length or color.
- Colors that tell roles apart (malicious, MPR, head) always come with a second cue: a ring style, a badge letter, or a fill pattern.
- A glossary term is a native button with a visible focus ring; Enter, Space, a click, or a tap opens its definition, and Escape closes it. `e2e/beginner-layer.spec.ts` checks this, the Scenario tab, the Why line, and the Start here page at 1400px and 400px.

## 13. Deployment

The dsa-course pattern, unchanged except for names:

- **Repository:** `manet-explorer` (this folder, `adhoc-networks-explorer`, becomes its working copy).
- **Dockerfile:** the dsa-course multi-stage file: `node:20-alpine` runs `npm ci` and `npm run build`; `nginx:alpine` serves `dist/` with `nginx.conf` (hashed `/assets/` cached as immutable, SPA fallback to `index.html`) and the `wget` health check on `127.0.0.1`.
- **CI/CD:** `.github/workflows/deploy.yml` runs `npm ci`, `npm run lint` (ESLint and the copy check), `npm test`, and `npm run test:e2e` in a `check` job; on success a `build-and-push` job publishes `ghcr.io/<owner>/manet-explorer` tagged `latest` and the commit SHA, on push to `main`.
- **Hosting:** the home-server Traefik instance picks the container up by labels, and the Cloudflare Tunnel config gets a new hostname. Both live outside this repo.
- **Domain:** **[OPEN]**, Section 17.

## 14. Extensibility: Adding a Topic

1. Write or extend the English reference for the week, get it to `status: reviewed`, and give the new subsection a `{#slug}`.
2. Write the Section 10 subsection first: variant, snapshot, seed (from a slide `graf:` block where one exists), pseudocode, step table, live fields, and the seed results the test will pin. Write the narration in the Section 18 house style.
3. Create `src/topics/<slug>/` with `index.ts`, `types.ts`, `operations.ts`, `operations.test.ts`, `pseudocode.ts`, `structure.ts`, `canvas.tsx`, `content.ts`. Draw with `NetworkCanvas`; use `src/lib/net.ts` for snapshot helpers and `src/lib/sim/` for placement, links, mobility, and runs.
4. Add the seed inputs to `src/topics/test-inputs.ts`, register the module in `registry.ts` at its week position, and run `node scripts/extract-content.mjs`.
5. Nothing else changes: the sidebar, pages, shell, and step engine are generic over `TopicModule`.

## 15. Roadmap

The tracker for every module. A row reaches **Specified** only when its full Section 10 or 19 subsection is written and reviewed, and **Implemented** only when its module is registered and its `operations.test.ts` encodes the table. Implementation of a topic waits for its reference to be **reviewed** (Section 11).

| Module | Week(s) | English reference | Spec | Code |
|---|---|---|---|---|
| `multihop` | 1 | reviewed | Specified, 10.1 | Implemented |
| `proactive-routing` | 2 | reviewed | Specified, 10.2 | Implemented |
| `reactive-routing` | 2 | reviewed | Specified, 10.3 | Implemented |
| `broadcast` | 3 | reviewed | Specified, 10.4 | Implemented |
| `geographic-routing` | 3 | reviewed | Specified, 10.5 | Implemented |
| `clustering` | 4 | reviewed | Specified, 10.6 | Implemented |
| `address-allocation` | 4 | reviewed | Specified, 10.7 | Implemented |
| `mobility` | 5 | reviewed | Specified, 10.8 | Implemented |
| `evaluation` | 6 | reviewed | Specified, 10.9 | Implemented |
| `qos-routing` | 7 | reviewed | Specified, 10.10 | Implemented |
| `routing-attacks` | 8 | reviewed | Specified, 10.11 | Implemented |
| Case study `sar-slope` | 1–3 | uses Weeks 1–3 | Specified, 19.1 | Implemented |
| Case study `relief-camp` | 4–6 | uses Weeks 4–6 | Specified, 19.2 | Implemented |
| Case study `community-mesh` | 7–8 | uses Weeks 7–8 | Specified, 19.3 | Implemented |
| Beginner layer (Section 20): Start here, glossary | all | uses Week 1 | Specified, 20 | Implemented |
| Beginner layer: story and why, every topic and case study | 1–8 | reviewed | Specified, 20 | Implemented |
| Multicast (ODMRP mesh, MAODV tree) | 3 | draft (§3.2 of Week 3) | Not specified | not started |
| Node cooperation (CONFIDANT, CORE, OCEAN) | 4 | draft (§3.2 of Week 4) | Not specified | not started |

Suggested build order: the shell and `NetworkCanvas` with `multihop`, then `reactive-routing` and `broadcast` (they share the flood), then `sar-slope`, then the rest in week order, with each case study after its block.

## 16. Acceptance Criteria

- [ ] Every Section 10 topic is reachable at its route, listed in the sidebar in week order with its week badge, and passes its `operations.test.ts`, including the seed results its subsection states.
- [ ] Every operation animates through its full step sequence and the code panel highlights the correct pseudocode line at every step.
- [ ] `CodePanel` shows one Python listing with no tab strip; no line clips on desktop or at 400px, and the listing has no horizontal scroll.
- [ ] Play, pause, step forward, step backward, speed, and scrub work against the precomputed step array; Randomize and Reset are instant.
- [ ] Every variant toggle swaps the operation list, the seed where the section says so, and the "on the canvas" badge in the Protocol tab.
- [ ] Every seed that comes from a slide matches the slide's `graf:` block: node set, links, roles, and dashed links.
- [ ] Every metrics run returns the same numbers for the same seed, pinned in `src/lib/sim/metrics.test.ts`, and the canvas labels them as computed by this simulator.
- [ ] Core Material renders on each topic page from a reviewed English reference; a draft reference blocks generation. Each topic opens on its Scenario tab (Section 20).
- [ ] The Protocol tab lists the messages with costs from the reference (or "Not stated in the course reference."), the invariants, and the per-node state, and the live fields row tracks the step shown.
- [ ] Each Section 19 case study is reachable at `/case-study/:slug`, listed after the weeks, passes its `operations.test.ts` and `src/case-studies/case-studies.test.ts`, keeps the layout contract in `e2e/case-study-page.spec.ts`, and its quiz can be finished and retried by keyboard.
- [ ] The Section 12 layout contract passes `npm run test:e2e` at desktop, tablet, and phone widths.
- [ ] `npm run lint` (ESLint and `lint:copy`) passes, and the antislop Delivery Gate record for the release is in `anti-slop/`.
- [ ] The app builds to a static `dist/` and runs in the production Docker image.

## 17. Open Items to Confirm Before or During Build

- [ ] Course code for the header line (the slides give the course name and 3 SKS only).
- [ ] Final subdomain (`manet.ridhopratama.net` proposed, following dsa-course's `dsa.` pattern).
- [ ] Shadowing `sigma` in Section 7.2: 4 dB until decided. The Week 5 slide gives the formula and says the spread is Gaussian with some standard deviation, without a value.
- [ ] RPGM group count and group paths in Section 10.8 and 19.2 (two groups of four in the topic, three teams of three in the case study).
- [ ] Whether the Week 3 multicast part and the Week 4 cooperation part get topics in a v1.1 (Section 15 rows).

## 18. Copy and Text Standard (antislop)

This section is mandatory and not open for negotiation. It is dsa-course Section 18, restated so this project is complete on its own. Every piece of text this project produces is held to the antislop rule set: the core (`antislop:antislop`) and the copywriting skill (`antislop:antislop-copywriting`); code comments are also held to `antislop:antislop-code`. Usage mode is DURING: the rules apply while writing. A change that fails the antislop Delivery Gate is not merged, however small.

**What it covers.** UI strings, step narration (`Step.description` and `variables`), placeholders, empty and error states, aria-labels, page titles, pseudocode comments, code comments, README, this specification, `CLAUDE.md`, the audit records in `anti-slop/`, the English references in `references/en/`, and the case study copy. The Indonesian slides in `references/id/` are outside it because they are frozen upstream material.

**Hard rules:**

- No em dash character (U+2014) anywhere, and no spaced double hyphen used as a dash (R-02). Use a period, comma, colon, or parentheses. The en dash is allowed only inside a numeric range such as `Weeks 1–3`.
- No generic CTAs (R-15). Buttons name their action: Go, Randomize, Reset, Reset scene, Step forward, Check, Next, Retry.
- No marketing vocabulary (R-16) and none of the empty AI vocabulary the copywriting skill lists.
- No fabricated numbers, claims, or sources (R-17, R-36, R-38). **A number shown to a student is either computed by the app on the step shown, quoted from a reference with its book and page, or a named demo value** (a seed, a threshold, a range, an example link value) that the page labels as this demo's choice. Nothing else.
- Student-facing text never points at internal documents. A student does not have `SPEC.md`.
- No arrows (`→`) or dashes as prose connectors in narration. Use `so` for cause and effect and a colon for a result. The `←/→` glyphs in the keyboard hint are allowed because they name keys.
- Every sentence names its actor where one exists: a node, a message, the source. No actorless passive, no rhythm tells.

**Why house style** (Section 20). One or two plain sentences, at most 240 characters, ending with a period. A why gives the reason, not a second description: it says what the node is trying to achieve or avoid, in words a student new to networking knows, and it may reason about the mechanism beyond the slides. Any number or book fact in it still follows the number rule above.

**Narration house style.** One plain sentence per step, present tense, naming the node, link, or message it concerns, ending with a period. Two short sentences are fine when a step has a cause and an effect. Counts pluralize. Link names use a hyphen between node ids (`C-D`), which is a name, not a dash. The step tables in Sections 10 and 19 are the canonical examples.

**Mechanical guard.** `npm run lint:copy` (`scripts/check-copy.mjs`, copied from dsa-course with `references/id` added to its skip list) fails the build on the banned characters, locally and in CI. Passing it is the floor, not the standard.

**Process.** Audits are recorded in `anti-slop/audit-NNN-YYYY-MM-DD.md`, numbered upward. `audit-001` records the Delivery Gate for this specification and the English drafts.

## 19. Case Studies

A topic page teaches one mechanism. A case study takes a scenario that needs several of them, says why each one fits, runs the solution step by step against a naive design, and ends with a short quiz. There are three, one per block of the lecture weeks. Each story is illustrative: the slides suggest the settings (Week 1's search-and-rescue quiz, Week 5's volunteer teams, Week 1's Berlin and Leipzig community networks) but do not describe these exact networks. Every cost or property a case study states quotes the English reference of the week it names.

### 19.0 Shared contract

dsa-course Section 19.0 applies verbatim: the types in `src/types/case-study.ts`; the registry in `src/case-studies/registry.ts`; `CaseStudyPage` with Scenario (default), Reasoning, and Quiz tabs on the topic page layout; the quiz flow (one question at a time, native radio inputs, Check, Next, score, Retry, nothing stored); `FocusCaption` and `useFollowedView` for the canvas view switch; "removals start before the removal"; naive versus chosen with the chosen design first and a live-field counter for the naive cost; and the tests (`operations.test.ts` per case study, `structure.test.ts` and `pseudocode.test.ts` over every simulator, `case-studies.test.ts`, `e2e/case-study-page.spec.ts`).

Differences from dsa-course:

- The simulator has no `snippets` (Section 7.1).
- `StructureChoice.cost` holds the trade-off the reference states for that mechanism, with its book and page.
- Every simulator declares a `metrics` operation (Section 9.1), and its result is the last thing the Scenario tab asks the student to run.
- "Removals start before the removal" applies to a node that leaves or walks away: the first step marks it `current` with its links intact.
- Each quiz has 8 questions: 6 multiple choice and 2 predict-the-next-step, as in dsa-course.

### 19.1 SAR team on a slope, `/case-study/sar-slope` (Weeks 1–3)

**Scenario.** A search-and-rescue team of three works on a mountain slope with no cellular coverage. The team left five relay radios along the trail, and a gateway at the base camp connects to the outside. When a team member sends a report, the radios must find a route to the gateway on their own, without flooding the channel, and the team should know which relay it cannot afford to lose. Week 1's emergency-response example (a chain of relays to a gateway, Loo pp. 8-9) and its quiz question about a SAR network on a slope set the scene.

**Variant:** `relay: "mpr" | "flooding"` (default `"mpr"`), labeled MPR relays and Blind flooding. The naive design floods the RREQ from every radio.

**Snapshot:** `NetSnapshot` plus `focus: "topology" | "broadcast" | "route"`, `mpr` (Section 10.4), `reverse` and `route` (Section 10.3, AODV), `tx`, `dupes`, `bridges`, `cuts`.

**Seed:** nodes in this order T1 (0,4), T2 (1,4.6), T3 (1,3.4), R1 (2,4), R2 (3,3.4), R3 (3,4.6), R4 (4,4), R5 (5,3), G (6,2); links T1-T2, T1-T3, T2-T3, T2-R1, T3-R1, R1-R2, R1-R3, R2-R3, R2-R4, R3-R4, R4-R5, R5-G; `range = 1.5`; T1 to T3 have role `source` when they send, G is `dest`. The resting state has `focus: "topology"`. Randomize moves the team (T1 to T3) to new positions within 1.5 of R1 and relinks them by the unit disk rule.

**Canvas.** The view switch offers Topology (the network with bridges dashed and articulation points ringed, from the Section 10.1 algorithm run once on every state), Broadcast (the network with each radio's transmissions and duplicates counted on it), and Route (the current route drawn as `tree`). Every view uses `NetworkCanvas` at the same height.

**Discover route to base** (`discover-flooding` with `variants: ["flooding"]` and `discover-mpr` with `variants: ["mpr"]`, one id per listing; `inputKind: "text"`, placeholder "Team radio, e.g. T1")

MPR listing:

```python
1  def discover(net, src, gateway):
2      queue = deque([(src, None)])
3      seen = {src}
4      while queue:
5          v, heard_from = queue.popleft()
6          if v == gateway:
7              continue  # the gateway answers; it does not relay
8          if v != src and not relays(v, heard_from):
9              continue  # v stays silent
10         v.broadcast(RREQ(src, gateway))
11         for n in v.neighbors():
12             if n in seen:
13                 continue  # n drops a duplicate
14             seen.add(n)
15             n.reverse[src] = v  # the reverse path
16             queue.append((n, v))
17     send_along(reverse_path(gateway, src), RREP(gateway))
18 def relays(v, heard_from):
19     return v in heard_from.mpr  # relay only for the node that chose you
```

The blind flooding listing reads `19     return True  # blind flooding: every node relays once`.

Steps use the Section 10.4 Broadcast rows (transmit, first copy with "`{n}` records `{v}` as its way back to `{src}`.", duplicate, silent) at lines 10, 15, 13, and 9, focus `broadcast`; the Section 10.3 AODV RREP rows at line 17, focus `route`; and a first step at line 2 ("`{src}` needs a route to G, so it starts a route discovery.", focus `topology`). An invalid radio gives "Type a team radio: T1, T2, or T3." at line 1.

Seed results from T1: blind flooding makes 8 transmissions and 15 duplicate receptions; MPR relaying makes 6 transmissions (T1, T2, R1, R2, R4, R5) and 9 duplicates; both find T1, T2, R1, R2, R4, R5, G (6 hops).

**Send report** (`send`, `inputKind: "text"`, placeholder "Team radio, e.g. T1"): the Section 10.3 AODV Send listing and table, focus `route`.

**Radio walks away** (`walk-away`, `inputKind: "text"`, placeholder "Radio, e.g. R2")

```python
1  def walk_away(net, u):
2      net.move_out_of_range(u)
3      if u in net.route:
4          for node in rerr_path(u):  # from the radios next to u toward each route end
5              node.delete_routes_through(u)
6      if not net.reaches(team, gateway):
7          return False  # u was an articulation point between the team and G
8      return True  # another path exists; discover again
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Before | 2 | "`{u}` is about to walk out of range." | topology, `{u}` current |
| Gone | 2 | "`{u}` is out of range of every radio." | topology |
| On the route | 4, 5 | the Section 10.3 Break link RERR rows (line 4) and delete rows (line 5), the same lines as in Break link | route |
| Cut | 7 | "`{u}` was an articulation point: without it the team has no path to G." | topology, `{u}` flagged |
| Still connected | 8 | "The team can still reach G another way. Run Discover route to base again." | topology |

On the seed, R2 walking away leaves a path through R3; R5 walking away cuts G off. Week 1 names bridges as the reason route discovery so often failed in the Berlin network.

**Metrics run** (`metrics`): each team radio sends 5 reports to G on the seed; both designs deliver everything on this static network, and the difference shows in control overhead.

**Live fields:** `tx`, `dupes` (the naive counter), `hops`, `bridges`.

**Reasoning (decisions):**

| Requirement | Chosen | Rejected |
|---|---|---|
| Radios must pass traffic for each other; there is no infrastructure on the slope | Multihop ad hoc relaying, `multihop` (Week 1: every node is host and router, Loo p. 5) | A single-hop network (every radio in range of every other, not true on a slope) |
| Find a route only when someone has a report to send | Reactive discovery, AODV, `reactive-routing` (Week 2: low overhead, a delay before the first packet, Loo Table 2.1) | Proactive DSDV, `proactive-routing` (Week 2: control overhead is high and runs even without data) |
| Spread the RREQ without a broadcast storm | MPR relays, `broadcast` (Week 3: only MPRs relay, Misra pp. 126-127) | Blind flooding, `broadcast` (Week 3: redundant rebroadcasts, contention, collisions; more reliable because of the redundancy, Misra pp. 139-142) |
| Know which relay the team cannot lose | Bridges and articulation points, `multihop` (Week 1, Misra Definition 1.4) | Counting neighbors per radio (degree says nothing about cuts) |

**Quiz** (6 choice, 2 predict): why a relay must forward others' packets (W1); proactive or reactive for occasional reports (W2); what MPR relaying saves and what it costs (W3); which radio is an articulation point on the seed (W1); what the RREP follows back (W2); why blind flooding is more reliable (W3); predict: after T1 broadcasts under MPR relaying, whether T3 relays (it does not: T3 is not an MPR of T1); predict: the step after R5 walks away (the cut step).

### 19.2 Relief camp, `/case-study/relief-camp` (Weeks 4–6)

**Scenario.** Volunteers arrive at a disaster relief camp in three teams of three. There is no DHCP server, so every radio must get a unique address from the radios already there, and the network organizes itself into clusters. Teams move around the camp during the day, and the camp coordinator wants to know how often the clusters have to reorganize. Week 5's check question (volunteer SAR teams: random waypoint or group mobility?) sets the scene at a smaller scale.

**Variant:** `mobility: "rpgm" | "rwp"` (default `"rpgm"`), labeled Teams move together (RPGM) and Everyone moves alone (RWP). Week 5 names RPGM for teams that move as groups (Misra pp. 244-245). The naive design tests the camp with independent random waypoint movement.

**Snapshot:** `NetSnapshot` plus `focus: "clusters" | "addresses" | "movement"`, the Section 10.7 Buddy fields over a space of 256 addresses, the Section 10.6 cluster fields, and the Section 10.8 mobility fields with three groups.

**Seed:** nodes in this order 9 (3,3), 4 (2.4,3.5), 2 (3.5,2.4), 8 (6,5), 6 (5.4,4.4), 3 (6.6,5.5), 7 (9,3), 5 (8.4,3.6), 1 (9.5,2.4); teams {9, 4, 2}, {8, 6, 3}, {7, 5, 1}; `range = 3`; area 12 × 8; `seed = 9`. Links follow the unit disk rule. Addresses are the result of Buddy joins in the order 9, 4, 2, 6, 8, 3, 5, 7, 1, each through its nearest configured neighbor, starting with 9 holding 1 to 256; clusters are the result of Elect under the highest-ID rule. The test pins the resulting pools and heads. RPGM moves each team's reference point around a fixed loop of side 2 starting at its team's first node, 0.5 units per tick; members move within a disc of radius 0.8. RWP moves everyone with speed 0.3 to 0.8 and pause 0 to 2 over the whole area. The 256-address space is this demo's; the Address view draws it as a proportional bar with one segment per owner.

**Canvas.** Clusters (heads ringed, gateways dashed, members tinted by head), Addresses (the 256-address bar and each radio's range), Movement (the network with each radio's last five positions as a trail).

**Volunteer joins** (`join`, `inputKind: "text"`, placeholder "New id and a nearby volunteer, e.g. 10 7")

```python
1  def join(net, u, near):
2      net.place_next_to(u, near)  # linked by range
3      for n in sorted(u.neighbors(), key=dist_to(u)):  # nearest first
4          if not has_spare(n):
5              continue  # u asks the next neighbor
6          join_buddy(u, via=n)
7          break
8      if u.address is None:
9          return  # u waits and joins no cluster
10     cluster_join(u)  # the best head it hears, or u leads its own cluster
```

Steps lift the Section 10.7 Buddy Join rows at line 6 (focus `addresses`) and the Section 10.6 Join rows at line 10 (focus `clusters`); "`{n}` has no spare address, so `{u}` asks the next neighbor." at line 5; "No neighbor of `{u}` has a spare address, so `{u}` cannot join yet." at line 9. On the seed, a new volunteer next to 1 cannot join through 1, whose range holds only its own address: the uneven use of the address space that Week 4 names as Buddy's weakness (Misra pp. 338-339).

**Elect cluster heads** (`elect`, `inputKind: "none"`): the Section 10.6 Elect listing and table over the current links, after clearing every head. Focus `clusters`.

**Advance the day** (`advance`, `inputKind: "key"`, placeholder "Ticks, from 1 to 30")

```python
1  def advance(net, ticks):
2      for t in range(ticks):
3          move_all(net.nodes)  # RPGM or RWP, by variant
4          net.links = unit_disk(net.nodes, net.range)
5          for v in net.members():
6              if v.head in v.neighbors():
7                  continue  # v still hears its head
8              heads = v.heads_in_range()
9              if heads:
10                 v.head = min(heads, key=rank)  # the best-ranked head it hears
11             else:
12                 v.head = v  # v becomes a head
13                 net.elections += 1
14     return net.elections
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Per tick, calm | 4 | "Tick `{t}`: `{m}` links, and every member still hears its head." | movement |
| Per tick, changes | 5 | "Tick `{t}`: `{k}` volunteers lost their head; `{j}` joined another head and `{e}` became heads." | clusters |
| Done | 14 | "After `{t}` ticks the camp elected `{e}` new heads." | clusters |

The test pins `elections` after 20 ticks for both variants on the seed and requires the RPGM count to be lower. If a change to `src/lib/sim/mobility.ts` breaks that, the seed may change (and this section with it); the model may not be tuned to force the result.

**Metrics run** (`metrics`): 30 ticks, four flows (2 to 4, 3 to 6, 1 to 5 within teams, and 2 to 1 across the camp), one packet per tick on the AODV-style model.

**Live fields:** `tick`, `heads`, `elections` (the naive counter), `free` (addresses not yet handed out).

**Reasoning (decisions):**

| Requirement | Chosen | Rejected |
|---|---|---|
| Every radio needs a unique address and there is no server | Buddy allocation, `address-allocation` (Week 4: a node hands half its pool to the newcomer without asking anyone, Misra pp. 338-339) | MANETconf (asks every node for permission, Misra pp. 337-338); query-based DAD (fails when the delay across a partition has no bound, Misra pp. 337-341) |
| Organize the radios so control traffic does not reach everyone | Highest-ID clustering, `clustering` (Week 4, LCA, Misra pp. 31-32) | A flat network (Week 1: simpler, but scales worse as nodes are added, Loo pp. 12-14) |
| Test the camp with movement that looks like the camp | RPGM, `mobility` (Week 5: suited to teams such as SAR groups, Misra pp. 244-245) | Random waypoint (Week 5: easy to use, but hard to match to a real scenario, Misra pp. 244-245) |
| Report the result so someone else can check it | The seed, the parameters, and the spread, `evaluation` (Week 6 and Week 5's documentation checklist, Misra pp. 272-273) | A single mean from one run |

**Quiz** (6 choice, 2 predict): why DHCP does not fit (W4); what Buddy loses when a node leaves without a goodbye (W4); which node becomes a gateway on the seed (W4); why RPGM fits volunteer teams (W5); what happens to RWP runs with `vmin = 0` (W5); what a report must include to be repeatable (W6); predict: the step after a new volunteer asks 1 for an address; predict: the Elect step after 9 becomes a head.

### 19.3 Community mesh, `/case-study/community-mesh` (Weeks 7–8)

**Scenario.** A neighborhood runs its own mesh of rooftop routers, like the community networks in Berlin and Leipzig that Week 1 compares with simulation models. Some links are strong and some are poor. One household (S) reaches the Internet gateway (D) either over two long, weak links or over four short, strong ones. Later a new router joins and advertises a route to the gateway that it does not have.

**Variant:** `routing: "etx-watchdog" | "hop"` (default `"etx-watchdog"`), labeled ETX with watchdog and Hop count. The naive mesh picks the fewest hops and trusts every reply.

**Snapshot:** `NetSnapshot` plus `focus: "links" | "route" | "trust"`, the Section 10.11 fields (`route`, `sent`, `delivered`, `dropped`, `failures`, `flagged`), `candidates` (every route an RREP brought, with its hop count and ETX), and `seed`.

**Seed:** nodes S (0,1), A (1,0), B (2,0), C (3,0), X (1.5,2), D (4,1); links S-A, A-B, B-C, C-D with delivery ratio 0.95 both ways, S-X and X-D with 0.5 both ways (example values, captioned so); `seed = 3`. The joining router M enters at (0.8,1.8) with a real link S-M (0.95) and a claimed link M-D that it advertises with ratio 1.0, drawn `virtual`.

**Canvas.** Links (every link labeled with its delivery ratio and ETX), Route (the chosen route and the candidates), Trust (each node's watchdog failure count, flagged nodes filled with the destructive color and a cross badge).

**Find route** (`route`, `inputKind: "none"`)

```python
1  def find_route(net, src, dst, routing):
2      candidates = flood_rreq(net, src, dst)  # every route an RREP brought back, in order of arrival
3      if routing == 'hop':
4          return min(candidates, key=len)  # the first to arrive wins a tie
5      return min(candidates, key=etx_sum)  # the smallest sum of link ETX
```

Steps lift the Section 10.11 Discover rows (a black hole answers at once once M has joined) at line 2, focus `route`, then per candidate "Candidate `{route}`: `{h}` hops, ETX `{e}`." at line 2 and the pick at line 4 or 5: "`{route}` has the fewest hops, so S uses it." or "`{route}` has the smallest ETX, `{e}`, so S uses it." Without M: hop count picks S, X, D (ETX 8.00); ETX picks S, A, B, C, D (ETX 4.43). With M: both pick S, M, D, because M claims a perfect link.

**Router M joins** (`join-m`, `inputKind: "none"`)

```python
1  def join_m(net):
2      m = net.add('M', links=['S'])
3      m.advertise(link_to='D', w=1.0)  # a link that does not exist
```

Steps: "A new router M appears next to S." (line 2), then "M advertises a link to D that does not exist." (line 3), focus `links`. Running Find route again shows the effect.

**Deliver packets** (`deliver`, `inputKind: "key"`, placeholder "Packets, from 1 to 30")

```python
1  def deliver(net, route, k, watchdog):
2      for p in range(1, k + 1):
3          delivered = True
4          for v, nxt in zip(route, route[1:]):
5              if v.black_hole:
6                  delivered = False  # v drops p without a trace
7                  break
8              if not v.send_with_retries(DATA(p), to=nxt, tries=4):  # each try needs the frame and its ACK
9                  delivered = False  # no ACK after 4 tries, so p is lost at v
10                 break
11             if watchdog:
12                 watch(v, nxt, p)  # Section 10.11 Send with watchdog, lines 4 to 10
13         net.count(p, delivered)
14     return net.delivered / k
```

The per-try success probability is `w(v, nxt) * w(nxt, v)`, drawn from `rng(seed)`. Week 3 gives 4 to 7 retransmissions before a timeout for 802.11 unicast (Misra pp. 139-142); this demo uses 4.

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Per packet, delivered | 13 | "Packet `{p}` reaches D after `{tries}` transmissions." | route |
| Per packet, link failed | 9 | "`{v}` tried 4 times to reach `{nxt}` and got no ACK, so packet `{p}` is lost." | links |
| Per packet, black hole | 6 | "M drops packet `{p}` without a trace." | route |
| Watchdog rows | 12 | the Section 10.11 watchdog rows | trust |
| Done | 14 | "`{d}` of `{k}` packets reached D: `{pdr}` %." | route |

Seed results with M joined and 20 packets: the hop mesh delivers none, because every packet goes to M; the ETX mesh with watchdog loses packets 1 to 4 to M, reports M, switches to S, A, B, C, D, and delivers the rest (the test pins the exact count, which depends on the retry draws). Without M, the test also pins both designs' delivery on the seed, where the weak two-hop route loses packets to failed retries.

**Metrics run** (`metrics`): 30 packets from S to D with M joined, both designs on the same seed.

**Live fields:** `sent`, `delivered`, `dropped` (the naive counter), `pdr`, `flagged`.

**Reasoning (decisions):**

| Requirement | Chosen | Rejected |
|---|---|---|
| Choose between a short route over weak links and a long route over strong ones | ETX, `qos-routing` (Week 7: fewer hops mean longer, weaker hops; ETX routes get better TCP throughput, Misra pp. 368-369) | Hop count, `qos-routing` |
| Keep delivering when a router lies about its routes | Watchdog and pathrater, `routing-attacks` (Week 8: overhear the next hop and report it past a threshold, Misra pp. 444-445) | Trusting every RREP (Week 8: the black hole attracts the route and drops everything, Misra pp. 460-461) |
| Let the source see the whole path the watchdog checks | DSR-style source routing, `reactive-routing` (Week 8: the watchdog suits source routing) | AODV next-hop tables |
| Judge the mesh by what the household gets | Packet delivery ratio, delay, and overhead, `evaluation` (Week 6) | Route length alone |

**Quiz** (6 choice, 2 predict): why fewer hops can mean a slower route (W7); how ETX is computed from the delivery ratios in both directions (W1, W7); what a black hole does (W8); why a gray hole is harder to detect than a black hole (W8); two situations where the watchdog accuses an honest node (W8); what Week 1's Berlin data says about the quality of bridge links (W1); predict: the step after M receives packet 1; predict: the step after M's fourth failure is counted.

## 20. Beginner layer

The course assumes a student who has met networking before. The beginner layer is for one who has not: every topic tells a real-world story over its slide network, every step says why it happens, jargon opens a definition, and a Start here page comes before Week 1. It changes no seed, step description, `highlightLine`, or pinned result of Sections 10 and 19.

**Story** (`story.ts` per topic, `TopicStory`). The Scenario tab, the default and first tab, renders `story.scenario` with glossary terms marked. It opens with "*Illustrative scenario*", says the slides draw the network as the seed's nodes, and says the slides do not describe the story's setting. It names who each node is, says why the week's mechanism suits the setting (quoting the English reference with its book and page), and ends with a numbered "Try this" list: operations and inputs in run order, each with what to watch. The story keeps the slide labels: `cast` maps seed node ids to devices, and every key is a seed node.

**Why** (`why.ts` per topic, one function per step kind). Every step of every operation sets `why`, under the Section 18 why house style. `src/topics/explain.test.ts` fails on a missing, long, or three-sentence why, and checks the cast and the illustrative label.

**Glossary** (`src/content/glossary.ts`, `src/lib/glossary.ts`, `GlossaryText`). Each entry has a term, its spellings, and a plain definition; a definition that states a book fact cites it. In the narration box, the Why line, and a scenario, the first occurrence of each term per panel or document becomes a button that opens the definition. Acronyms match case-sensitively and words in any case, the longest spelling first, never inside a hyphenated link name. The course references are not marked, because they are quoted verbatim.

**Start here** (`/start`, `StartPage`, first in the sidebar, linked from the home page). It contrasts an infrastructure network with an ad hoc one (Loo 1.2, pp. 4-5), quotes the definition of Loo p. 5, lists the basic glossary terms, and runs a four-phone walkthrough (`src/start/intro.ts`, an unregistered `TopicModule`) in the same `VisualizerShell`: Send a message by fewest hops, and Phone walks away. It ends with how a topic page works and a link to Week 1.

**Case studies.** A case study keeps its own Scenario tab (Section 19); its simulator's `story` reuses that scenario and adds the `cast` for the Who's who line, and every simulator step has a `why`. The steps of the shared metrics run (`pushMetricsSteps`) and the shared DSR flood (`floodRreq`) take a `why` setter and explain themselves.

**Who's who** lists the cast members that are nodes of the active variant's seed, so it never changes while stepping. After Randomize it says the story roles do not apply, unless Randomize restored the seed's nodes (Section 10.11).

**Coverage.** `src/topics/explain.test.ts` runs every topic, every case study simulator, and the Start here walkthrough, on every variant's seed and on chains of operations that reach the branches a fresh seed cannot. `e2e/beginner-layer.spec.ts` opens every topic and case study at 400px.
