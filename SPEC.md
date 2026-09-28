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

Copied from dsa-course without change: `vite.config.ts` (with its SPA-fallback preview plugin), `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `components.json`, `Dockerfile`, `nginx.conf`, `.dockerignore`, `src/lib/step-engine.ts`, `src/lib/use-followed-view.ts`, `src/lib/predict-step.ts`, `src/components/layout/*`, `src/components/case-study/*`, `src/components/MarkdownContent.tsx`, `src/components/ui/*`, `src/hooks/*`. Copied then changed as this spec says: `src/types/step-engine.ts` (Section 7.1), `CodePanel.tsx` (Section 8), `StructurePanel.tsx` renamed `ProtocolPanel.tsx` (Section 8), `scripts/check-copy.mjs` and `scripts/extract-content.mjs` (Section 11), `.github/workflows/deploy.yml` (image name only, Section 13).

## 5. Theming

`src/index.css` is copied verbatim from `../dsa-course/src/index.css` and never edited; global additions go in `src/app.css`. `index.html` loads DM Sans and Space Mono from Google Fonts, as in dsa-course. Dark mode uses the same `.dark` class toggle, remembered in `localStorage` under `manet-explorer-theme`. The two apps are siblings and should look like it.

Canvas colors come from theme variables (`var(--color-accent)`, `var(--color-chart-1)` to `var(--color-chart-5)`, `var(--color-destructive)`), never hex, so every canvas follows dark mode. Section 8 assigns them to roles and highlight kinds.

## 6. Routing

Topic-slug routes are canonical. The week is metadata shown in the sidebar and page header, never part of the URL.

| Path | Renders |
|---|---|
| `/` | `HomePage`: topics grouped by week, then the case studies |
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

`TopicPage` follows dsa-course Section 6 exactly: a two-column grid at `lg`, `VisualizerShell` on the left, materials on the right as tabs. The tabs are **Real-World Usage** (default) | **Core Material** | **Protocol**. The first two render `content.realWorldUsage` and `content.coreMaterial` with `MarkdownContent`; Protocol renders `ProtocolPanel` over `structure`. At `lg` the page is locked to the viewport: the document never scrolls, and only the Code listing and the active materials panel do. Below `lg` the columns stack, visualizer first, and the document scrolls. `<TopicView key={slug}>` resets the visualizer, the tab, and the variant mirror on navigation.

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

The listings in Sections 10.2, 10.4 to 10.11, and 19 still show the earlier prose style. Each is rewritten in this style, and its step table's line column renumbered, when that topic is implemented; the triggers and narration stay as written.

`highlightLine` is a 1-indexed line of that listing. There is no line map to maintain.

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

- **`CodePanel`**: shows `currentStep.description`, the `variables` as badges, and the numbered pseudocode listing. **There is no tab strip and no `localStorage` language key.** It draws each four-space indent level at 2ch and renders a trailing `# comment` in the muted color, so a narrow card stays readable while the source keeps PEP 8 spacing. The listing keeps dsa-course's rules: lines soft-wrap with a hanging indent (`padding-left: (indent + 2)ch; text-indent: -2ch`), no horizontal scroll at any width, the listing is the only scroller at `lg`, it is keyboard focusable with a visible ring, and stepping keeps the highlighted line in view by setting the listing's own `scrollTop`, never `scrollIntoView`.
- **`ProtocolPanel`**: dsa-course's `StructurePanel` with its headings renamed: "Messages" for the operation table (columns Message, Fields, Cost, Shown by), "Invariants", "Per-node state" for the representation blocks, "Algorithms over the network" for `algorithms`. The "on the canvas" badge follows the variant toggle, as before.
- **`NetworkCanvas`** (`components/visualizer/canvas/`): one SVG used by every topic and case study.
  - `viewBox` from the node extents plus a margin of half the range; no fixed pixel width; a fixed rendered height of 280px, so a network that changes extent never resizes the card (dsa-course Section 12 rule).
  - Links are lines. `broken` is dashed; `virtual` is dotted and carries its own label ("tunnel", "toward D"); a link with `quality` shows the value on hover and focus; a link with `bandwidth` always shows it.
  - Nodes are circles labeled with their id. Roles draw as follows: `source` and `dest` get a filled accent ring and the letters S or D beside the node when the id is not already S or D; `mpr`, `head`, and `gateway` get a ring (solid, double, dashed); `malicious` fills the node with `--color-destructive`; `anchor` gets a square.
  - Hovering or focusing a node draws its range circle at `range`. Nodes are focusable with Tab and announce "`{id}`, `{k}` neighbors, roles `{roles}`".
  - `packets` draw as a dot on the link from `from` to `to` (or rings on every link for `"*"`) with the message name as a small label, animated with `motion/react` over 60 % of the step interval.
  - The canvas `aria-label` summarizes the snapshot: "`{n}` nodes, `{m}` links" plus ", path `{path}`" when `highlight.path` is set.
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

```
1  def METRICS(network, seed):
2    for design in variants:           # chosen design first
3      rng = RNG(seed)
4      for flow in FLOWS(network, rng):
5        result = RUN_FLOW(network, design, flow, rng)
6        record result
7    return PDR, mean delay, control overhead per design
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
| Flow done | 5 | "`{design}`: flow `{k}` from `{src}` to `{dst}` delivered `{d}` of `{s}` packets in `{t}` ticks." |
| Result | 7 | "On seed `{seed}`, `{designA}` delivers `{pdrA}` % and `{designB}` delivers `{pdrB}` %." |

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

```
1  def ADVERTISE(u):
2    rows = u.table if FULL_DUMP else the changed rows of u.table
3    for n in neighbors(u):
4      for r in rows:
5        old = n.table[r.dest]
6        if old is None or r.seq > old.seq:
7          n.table[r.dest] = (u, r.metric + 1, r.seq)    # a newer sequence number wins
8        elif r.seq == old.seq and r.metric + 1 < old.metric:
9          n.table[r.dest] = (u, r.metric + 1, r.seq)    # same age, fewer hops
10       else:
11         keep old
12   mark u's rows unchanged
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

```
1  def MOVE(u, near):
2    place u next to near and recompute the links of u
3    for v in [u] + the nodes u lost as neighbors:
4      delete v's routes whose next hop is no longer a neighbor
5    u.seq = u.seq + 1; mark u's own row changed
6    for n in the new neighbors of u:
7      n sends u a full dump                         # u needs the whole table once
8    queue = [u]
9    while queue:
10     v = queue.pop(0)
11     ADVERTISE(v)                                  # triggered update
12     queue += the neighbors of v whose table changed, if not queued
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

```
1  def SELECT_MPR(u):
2    N1 = neighbors(u); N2 = the two-hop neighbors of u, not in N1 and not u
3    MPR = every n in N1 that is the only way to some node of N2
4    covered = the N2 nodes that MPR reaches
5    while covered != N2:
6      n = the node of N1 not in MPR that covers the most uncovered N2 nodes
7      MPR.add(n); covered = covered + what n covers
8    return MPR
```

Ties at line 6 go to the node that comes first in node order.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Sets | 2 | "`{u}` has one-hop neighbors `{N1}` and two-hop neighbors `{N2}`." | N1 current, N2 visited |
| Per unique | 3 | "`{c}` is reachable only through `{n}`, so `{n}` becomes an MPR." | `{n}` found |
| Covered | 4 | "The MPRs so far cover `{covered}`." | covered visited |
| Per greedy pick | 7 | "`{n}` covers `{k}` of the uncovered two-hop neighbors, the most, so it becomes an MPR." | `{n}` found |
| Done | 8 | "Every two-hop neighbor is covered. The MPR set of `{u}` is `{MPR}`; `{rest}` stay silent." (or "; every neighbor is needed.") | MPRs found |

On the seed: B (the only way to C), then D (covers G and F), and E is not needed, the slide's three steps.

**Broadcast** (`broadcast`, `inputKind: "text"`, placeholder "Source, e.g. A")

```
1  def BROADCAST(src):
2    queue = [(src, None)]; seen = {src}
3    while queue:
4      v, heardFrom = queue.pop(0)
5      if v == src or RELAYS(v, heardFrom):
6        v transmits to all its neighbors
7        for n in neighbors(v):
8          if n in seen: n drops a duplicate
9          else: seen.add(n); queue.append((n, v))
10 def RELAYS(v, heardFrom):
11   return True                           # blind flooding: every node relays once
```

The MPR listing reads `11   return v in MPR(heardFrom)            # relay only for the node that chose you`.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Transmit | 6 | "`{v}` transmits the packet to `{neighbors}`." | `{v}` current, packets `*` |
| Per neighbor, new | 9 | "`{n}` receives the packet for the first time." | `{n}` new |
| Per neighbor, duplicate | 8 | "`{n}` already has the packet, so this copy is a duplicate." | `{n}` dropped |
| Silent (MPR) | 5 | "`{v}` is not an MPR of `{heardFrom}`, so it does not relay." | `{v}` visited |
| Done | 3 | "`{r}` of `{n}` nodes received the packet with `{t}` transmissions and `{d}` duplicates." | none |

Seed results from A: blind flooding 7 transmissions and 8 duplicates; MPR relaying 3 transmissions (A, B, D) and 2 duplicates; both reach all 6 other nodes. The step list shows why the slide says flooding sends redundant copies.

**Remove link** (`remove-link`, `inputKind: "text"`, placeholder "Link, e.g. D F")

```
1  def REMOVE_LINK(u, v):
2    delete link u-v
3    every node recomputes its MPR set from the new HELLO information
```

Steps: "There is no link `{u}`-`{v}`." (line 1); "Link `{u}`-`{v}` is gone." (line 2); per node whose set changed, "`{w}`'s MPR set changes from `{old}` to `{new}`." (line 3). On the seed, removing D-F changes A's set to B, D, E, the Week 3 check question.

**Live fields:** `tx`, `dups`, `reached`, `mprs` (size of the source's MPR set).

### 10.5 Geographic routing, `/topic/geographic-routing` (Week 3)

**Variant:** `recovery: "perimeter" | "none"` (default `"perimeter"`), labeled Greedy with perimeter and Greedy only.

**Snapshot:** `NetSnapshot` plus `mode: "greedy" | "perimeter"`, `hops: number`, `voids: number`, and the `virtual` link from the source toward the destination that the slide draws dashed.

**Seed** (Week 3, "Saat greedy buntu, paket memutari void"; Misra 7.3.2): nodes S (2,2), F (1.2,2.6), A (1.4,1), B (2.2,0.2), C (3.4,0.3), E (4.3,1.1), D (4,2); links S-F, S-A, A-B, B-C, C-E, E-D; S source, D dest; `range = 1.6`.

**Randomize:** 8 to 10 nodes in a 6 × 4 area, connected under the unit disk rule, source and destination at the two most distant nodes.

**Route** (`route`, `inputKind: "text"`, placeholder "Source and destination, e.g. S D")

```
1  def ROUTE(src, dst):
2    P = GABRIEL(links)                     # planar links for the perimeter walk
3    v = src; mode = GREEDY
4    while v != dst:
5      if mode == GREEDY:
6        n = the neighbor of v closest to dst
7        if DIST(n, dst) < DIST(v, dst): v = n
8        elif PERIMETER_ON: mode = PERIMETER; stuck = v; prev = None
9        else: drop the packet at v; return
10     else:
11       n = NEXT_CLOCKWISE(v, prev, dst, P)   # the void stays on one side
12       prev = v; v = n
13       if DIST(v, dst) < DIST(stuck, dst): mode = GREEDY
14   deliver the packet to dst
```

The greedy rule forwards to the neighbor closest to the destination and only if that neighbor is closer than the current node, the advance-based rule Week 3 names as loop-free (Misra pp. 158-159). `NEXT_CLOCKWISE` sweeps clockwise around `v`, starting from the direction toward `dst` when `prev` is `None` and from the direction back to `prev` otherwise, and returns the first neighbor over a link of `P`; `prev` itself is returned only when it is the only neighbor. `GABRIEL` keeps link u-v when no other node lies inside the circle whose diameter is u-v (Misra 7.3.2 names RNG or the Gabriel graph); on the seed it keeps every link.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Planarize | 2 | "The perimeter walk uses the Gabriel graph: `{k}` of `{m}` links stay." (or "every link stays.") | removed links broken |
| Greedy hop | 7 | "`{n}` is the neighbor closest to `{dst}`: `{dn}` against `{dv}`, so the packet moves to `{n}`." | link tree |
| Void | 8 | "No neighbor of `{v}` is closer to `{dst}` than `{v}` itself (`{dv}`), so the packet switches to perimeter mode." | `{v}` flagged |
| Void, greedy only | 9 | "No neighbor of `{v}` is closer to `{dst}` than `{v}` itself, so greedy forwarding drops the packet." | `{v}` dropped |
| Perimeter hop | 12 | "Sweeping clockwise at `{v}`, the first link leads to `{n}`." | link tree |
| Back to greedy | 13 | "`{v}` is `{dv}` from `{dst}`, closer than `{stuck}` was, so the packet returns to greedy mode." | `{v}` current |
| Delivered | 14 | "The packet reaches `{dst}` after `{h}` hops." | path tree |
| No progress | 11 | "The perimeter walk came back to `{stuck}` without getting closer, so `{dst}` is unreachable." | none |

Distances print to two decimals. On the seed: S is 2.00 from D and both its neighbors are farther, so the void step fires at S; the walk goes S, A, B, C; C is 1.80 from D, so greedy resumes; E, then D. The path is S, A, B, C, E, D, the slide's route. The greedy-only variant drops the packet at S.

**Live fields:** `hops`, `mode`, `voids`, `dist` (current node to destination).

### 10.6 Clustering: LCA, `/topic/clustering` (Week 4)

**Variant:** `rule: "highest" | "lowest"` (default `"highest"`), labeled Highest ID and Lowest ID. Week 4 presents the highest-ID rule and names the lowest-ID rule as a variation (Misra pp. 31-32).

**Snapshot:** `NetSnapshot` plus `head: Record<string, string | null>` (a node's cluster head, itself for a head), `gateways: string[]`, `elections: number` (heads elected after the first Elect). Node ids are integers written as strings.

**Seed** (Week 4, "ID tertinggi di sekitarnya jadi cluster head"): nodes in this order 9 (1,1), 4 (0,0), 2 (0,2), 6 (2,1), 8 (3,1), 3 (4,0), 5 (4,2); links 9-4, 9-2, 9-6, 6-8, 8-3, 8-5. Every node starts undecided.

**Randomize:** 7 to 10 nodes with distinct integer ids from 1 to 20, connected under the unit disk rule.

**Elect** (`elect`, `inputKind: "none"`)

```
1  def ELECT(network):
2    undecided = every node without a head
3    while undecided:
4      v = the undecided node that ranks first among its undecided neighbors and itself
5      v becomes a cluster head
6      for n in the undecided neighbors of v: n joins v
7      remove v and its new members from undecided
8    for n in the members:
9      if n neighbors two or more heads: n becomes a gateway
```

"Ranks first" means the highest id, or the lowest under the lowest-ID rule. When several nodes qualify at line 4, the best-ranked of them goes first.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Nothing to do | 2 | "Every node already has a cluster head." | none |
| Head | 5 | "`{v}` has the `{highest/lowest}` id among its undecided neighbors, so it becomes a cluster head." | `{v}` found |
| Per member | 6 | "`{n}` joins cluster head `{v}`." | link tree |
| Per gateway | 9 | "`{n}` neighbors cluster heads `{heads}`, so it becomes a gateway." | `{n}` new |
| Done | 3 | "`{h}` cluster heads and `{g}` gateways." | none |

On the seed with the highest-ID rule: 9 is head (4, 2, 6 join), 8 is head (3, 5 join), 6 is the gateway, the slide's figure. With the lowest-ID rule the same seed gives five heads (2, 3, 4, 5, 6) and gateways 9 and 8; the test pins both.

**Node leaves** (`leave`, `inputKind: "text"`, placeholder "Node, e.g. 9")

```
1  def LEAVE(u):
2    remove u and its links
3    if u was a cluster head:
4      for n in the members of u:
5        if n neighbors another head: n joins the best-ranked of them
6        else: n is undecided again
7      ELECT the undecided nodes                 # lines 3 to 7 of Elect
8    recompute the gateways
```

Steps: "`{u}` leaves the network." (line 2); per orphan, "`{n}` joins cluster head `{h}`, which it can still hear." (line 5) or "`{n}` hears no cluster head, so it is undecided again." (line 6); the Elect head and member rows at line 7, each adding one to `elections`; "Gateways are now `{list}`." (line 8). On the seed, 9 leaving sends 6 to head 8 and makes 4 and 2 heads of their own clusters: two new elections.

**Node joins** (`join`, `inputKind: "text"`, placeholder "New id and its neighbors, e.g. 7 6 8")

```
1  def JOIN(u, neighbors):
2    add u with links to neighbors
3    if u neighbors a head: u joins the best-ranked head it hears
4    else: u becomes a cluster head
5    recompute the gateways
```

Steps follow the Leave wording; an id already in use gives "Node `{u}` already exists." at line 1. The new node is placed at the centroid of its neighbors plus (0.3, 0.3).

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
  partition: { nodes: NetNode[]; links: NetLink[]; address: Record<string, number> }; // drawn faded until Merge
  seed: number;
}
```

The 16-address space is this demo's choice so every address fits on screen; the Protocol tab says so.

**Seed:** nodes A (0,0), B (1,0), C (2,0); links A-B, B-C. Buddy: A holds 1 to 8 (address 1), B holds 9 to 12 (address 9), C holds 13 to 16 (address 13), the state after A started with the whole space and B joined through A, then C through B. QDAD: A 5, B 11, C 2 (fixed seed values). The separate partition is P (4,0) and Q (5,0) linked P-Q, with addresses P 1, Q 9 under Buddy (their own first node started from the whole space) and P 11, Q 3 under QDAD.

**Randomize:** replays 3 to 6 random joins from a single first node, same scheme, fresh seed.

**Join, Buddy** (`join-buddy`, `variants: ["buddy"]`, `inputKind: "text"`, placeholder "New node and the node it meets, e.g. D C")

```
1  def JOIN(new, via):
2    if via holds only its own address: return
3    half = the upper half of via's largest range
4    via keeps the lower half; new takes half
5    new.address = the first address of half
```

| Trigger | Line | Description |
|---|---|---|
| Invalid | 1 | "Type a new node id and a configured neighbor, such as D C." |
| No spare address | 2 | "`{via}` holds only its own address, so `{new}` cannot join through it." |
| Split | 3 | "`{via}` splits `{lo}` to `{hi}` in half." |
| Hand over | 4 | "`{via}` keeps `{a}` to `{b}` and gives `{c}` to `{d}` to `{new}`." |
| Address | 5 | "`{new}` takes address `{addr}` without asking any other node." |

**Leave, Buddy** (`leave-buddy`, `variants: ["buddy"]`, `inputKind: "text"`)

```
1  def LEAVE(u):
2    b = the neighbor of u whose range sits next to u's, else the first neighbor
3    b takes u's ranges and merges the ones that touch
4    remove u
```

Steps: "`{u}` says goodbye and hands `{ranges}` to `{b}`." (line 3), "`{b}` now holds `{merged}`." (line 3), "`{u}` leaves." (line 4).

**Crash, Buddy** (`crash-buddy`, `variants: ["buddy"]`, `inputKind: "text"`)

```
1  def CRASH(u):
2    remove u without a goodbye
3    leaked = leaked + the size of u's ranges    # no node knows they are free
```

Steps: "`{u}` disappears without a goodbye." (line 2), "`{k}` addresses went with `{u}`, and no node knows they are free." (line 3). Week 4 names this leak and the periodic synchronization that fixes it; v1 shows the leak only.

**Join, QDAD** (`join-qdad`, `variants: ["qdad"]`, `inputKind: "text"`)

```
1  def JOIN(new, via):
2    a = a random address from 1 to 16
3    tries = 0
4    while tries < 3:
5      flood AREQ(a) through the nodes new can reach
6      if some node that heard it owns a:
7        that node answers AREP(a); a = another random address; tries = 0
8      else:
9        tries = tries + 1
10   new.address = a                          # 3 AREQs with no AREP, so a counts as free
```

The slide says the AREQ repeats up to a retry limit; 3 is this demo's limit.

| Trigger | Line | Description |
|---|---|---|
| Pick | 2 | "`{new}` picks address `{a}` at random." |
| Per try | 5 | "`{new}` floods AREQ `{a}` (try `{t}` of 3)." |
| Owner | 7 | "`{owner}` already uses `{a}`, so it answers with an AREP and `{new}` picks again." |
| Silence | 9 | "Nobody answers try `{t}`." |
| Take | 10 | "Three AREQs got no answer, so `{new}` takes address `{a}`." |

Every AREQ counts once per node that transmits it, and every AREP once per hop, into `control`.

**Merge partition** (`merge`, `inputKind: "none"`, both variants)

```
1  def MERGE():
2    link C to P; the two partitions become one network
3    for each address used on both sides:
4      conflicts = conflicts + 1
5      the node from the joining partition drops its old ranges and JOINs again through its neighbor
```

Steps: "The partition with `{nodes}` comes into range: C links to P." (line 2); per conflict, "`{x}` and `{y}` both use address `{a}`." (line 4) and the Join steps of the active scheme at line 5; "`{k}` conflicts were found and resolved." or "No address is used twice." (line 3). On the seed Buddy finds 2 conflicts (A and P on 1, B and Q on 9) and QDAD finds 1 (B and P on 11). This matches what Week 4 says about partitions: query-based DAD cannot guarantee a unique address when the delay across a partition has no bound, and MANETconf gives each partition an id so that two nodes can tell when a merge happens (Misra pp. 338-341). The Protocol tab points to MANETconf for that reason.

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

**Advance** (`advance`, `inputKind: "key"`, placeholder "Ticks, from 1 to 40")

RWP listing:

```
1  def ADVANCE(ticks):
2    for t in range(ticks):
3      for v in nodes:
4        MOVE(v)
5      links = UNIT_DISK(nodes, range)
6      count the links that appeared or broke
7      update link ages and path availability
8  def MOVE(v):
9    if v.pause > 0: v.pause = v.pause - 1
10   elif v is at its waypoint: v.pause = random 0 to 2; pick a new waypoint and speed
11   else: step toward the waypoint at v.speed
```

The RPGM listing replaces lines 8 to 11:

```
8  def MOVE(v):
9    ref = v.group.ref                       # moved one step along the group path each tick
10   if v is at its waypoint: pick a new waypoint within 1 of ref, and a new speed
11   else: step toward the waypoint at v.speed
```

| Trigger | Line | Description |
|---|---|---|
| Out of range input | 1 | "Type a number of ticks from 1 to 40." |
| Per tick | 6 | "Tick `{t}`: `{up}` links appeared and `{down}` broke, `{m}` links now." |
| Done | 7 | "After `{t}` ticks the links changed `{c}` times, a link lasts `{d}` ticks on average, and `{p}` % of node pairs had a path." |

The metrics named in the done step are the protocol-independent ones Week 5 lists (Misra pp. 249-250). Mean link duration uses `closedDurations`; with none, it reads "no link has broken yet".

**Where nodes spend time** (`density`, `inputKind: "none"`, an algorithm)

```
1  def DENSITY(history):
2    for p in history:
3      count p as centre if it lies in the middle half of both width and height
4    return the centre share
```

Steps: "`{k}` of `{n}` recorded positions fall in the centre quarter of the area." (line 3), then "The centre quarter holds `{s}` % of the time spent, against 25 % for an even spread." (line 4), or "Advance the nodes first: no positions are recorded yet." (line 2). The 25 % is the area share, a computed baseline. Week 5 states that RWP crowds nodes in the middle (Misra p. 241); this operation lets the student check that on a run instead of taking it on trust.

**Metrics run** (`metrics`, Section 9.1): both models on the current seed for 30 ticks, four flows between random pairs, each sending one data packet per tick along an AODV-style route that is rediscovered when it breaks.

**Live fields:** `tick`, `links`, `changes`, `meanDur`, `pathAvail`.

### 10.9 Network models and evaluation, `/topic/evaluation` (Week 6)

**Variant:** `graph: "udg" | "qudg"` (default `"udg"`), labeled Unit disk graph and Quasi unit disk graph. The QUDG rule is Section 7.2's, with `q = 0.8`, a demo value the Protocol tab names.

**Snapshot:** `NetSnapshot` plus `seed: number`, `marked: string[]`, `cds: string[]`.

**Seed:** nodes A (0,0), B (1,0.6), C (1,-0.6), D (2,0), E (3,0), F (4,0.6), G (4,-0.6), H (5,0); `range = 1.2`. Under the unit disk rule the links are A-B, A-C, B-C, B-D, C-D, D-E, E-F, E-G, F-G, F-H, G-H. This seed is this spec's, chosen so both steps of the algorithm below visibly change the result.

**Randomize:** 8 to 10 nodes in a 6 × 4 area, linked by the active rule, fresh seed.

**Build links** (`build-links`): Section 10.1's operation and table, with the QUDG rule's extra row: "`{p}` and `{q}` are `{d}` apart, between `{q·range}` and `{range}`, and the draw says `{yes/no}`: `{link/no link}`." at line 5 or 7.

**Connected dominating set** (`cds`, `inputKind: "none"`)

```
1  def CDS(network):
2    for v in nodes:                                # Wu's marking process
3      if v has two neighbors that are not neighbors of each other: mark v
4    for v in the marked nodes:                     # pruning rule 1
5      if a marked neighbor u with a larger id covers v and all of v's neighbors:
6        unmark v
7    return the marked nodes
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Per node, marked | 3 | "`{u}` and `{w}` are neighbors of `{v}` but not of each other, so `{v}` is marked." | `{v}` found |
| Per node, not marked | 3 | "Every two neighbors of `{v}` are neighbors of each other, so `{v}` is not marked." | `{v}` visited |
| Per marked node, pruned | 6 | "`{u}` has a larger id and covers `{v}` and all its neighbors, so `{v}` is unmarked." | `{v}` dropped |
| Per marked node, kept | 5 | "No marked neighbor with a larger id covers all of `{v}`'s neighbors, so `{v}` stays." | `{v}` found |
| Result | 7 | "The connected dominating set is `{cds}`: `{k}` of `{n}` nodes." | set tree |

Line 5 compares closed neighborhoods (a node plus its neighbors) and uses the marking from line 3 for every check, so the order of pruning does not matter. The marking process is the three-step algorithm of Week 6 (Loo pp. 45-46); the pruning rule is Week 3's rule 1 of Wu and Li (Misra pp. 128-129). On the seed the marking picks B, C, D, E, F, G; pruning removes B (covered by C) and F (covered by G), leaving C, D, E, G.

**Metrics over seeds** (`metrics`, `inputKind: "key"`, placeholder "Seeds, from 1 to 10"): the Section 9.1 run repeated over seeds 1 to `k`. Each seed places 10 nodes in a 6 × 4 area, links them by each variant's rule, and runs three flows of ten packets on the AODV-style model. Steps: one per seed per variant ("`{graph}`, seed `{s}`: `{pdr}` % delivered."), then the result at line 7 of the Section 9.1 listing: "Over `{k}` seeds, UDG delivers `{m1}` % (standard deviation `{s1}`) and QUDG `{m2}` % (standard deviation `{s2}`)." `MetricsBars` draws each mean with a whisker of one standard deviation. Week 6 asks for spread next to every mean; this operation is where the student sees why.

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

Hop count and bandwidth (the bandwidth listing adds line 2; the hop listing reads `2    usable = every link`):

```
1  def FIND_PATH(src, dst, need):
2    usable = the links with bandwidth >= need
3    frontier = [src]; prev = {src: None}
4    while frontier:
5      v = frontier.pop(0)
6      if v == dst: return the path through prev
7      for n in the neighbors of v over usable links:
8        if n not in prev: prev[n] = v; frontier.append(n)
9    return None                                   # no path meets the request
```

ETX:

```
1  def FIND_PATH(src, dst):
2    cost = {src: 0}; prev = {src: None}; done = set()
3    while some node has a cost and is not done:
4      v = that node with the smallest cost
5      done.add(v)
6      if v == dst: return the path through prev
7      for n in the neighbors of v that are not done:
8        c = cost[v] + 1 / (w(v, n) * w(n, v))      # the ETX of the link
9        if n not in cost or c < cost[n]: cost[n] = c; prev[n] = v
10   return None
```

Energy (keep the weakest relay as strong as possible):

```
1  def FIND_PATH(src, dst):
2    weakest = {src: INF}; prev = {src: None}; done = set()
3    while some node has a value and is not done:
4      v = that node with the largest weakest, fewer hops on a tie
5      done.add(v)
6      if v == dst: return the path through prev
7      for n in the neighbors of v that are not done:
8        b = weakest[v] if n == dst else min(weakest[v], n.battery)
9        if n not in weakest or b > weakest[n]: weakest[n] = b; prev[n] = v
10   return None
```

| Trigger | Line (hop, bw / etx, energy) | Description | Highlight |
|---|---|---|---|
| Invalid input | 1 / 1 | "Type a source and a destination, such as A E." (bandwidth: "…and a bandwidth in Mbps, such as A E 3.") | none |
| Per pruned link | 2 / none | "Link `{u}`-`{v}` offers `{b}` Mbps, less than `{need}`, so it is not used." | link broken |
| Settle | 5 / 5 | "`{v}` is next: `{value}`." (hop: "`{h}` hops from `{src}`"; ETX: "ETX `{c}` from `{src}`"; energy: "the weakest relay on the way has `{b}` units") | `{v}` current |
| Per neighbor, improved | 8 / 9 | "`{n}` is reached through `{v}`: `{value}`." | link active |
| Per neighbor, not better | 8 / 9 | "Going through `{v}` does not improve `{n}`." | none |
| Found | 6 / 6 | "Path `{path}`: `{h}` hops, `{summary}`." (bandwidth: "every link offers at least `{need}` Mbps"; ETX: "total ETX `{c}`"; energy: "weakest relay `{b}` units"; hop: "the fewest hops") | path tree |
| None | 9 / 10 | "No path from `{src}` to `{dst}` meets the request." | none |

Seed results from A to E: hop count picks A, D, E (2 hops); bandwidth with 3 Mbps prunes A-D and picks A, B, C, E, the slide's answer; ETX picks A, B, C, E (total 3.70 against 6.78 through D, Week 7's point that more short hops can beat fewer weak ones); energy picks A, D, E (weakest relay D at 80, against B at 20). ETX values print to two decimals.

**Send packets** (`send`, `inputKind: "key"`, placeholder "Packets, from 1 to 50")

```
1  def SEND(k):
2    for p in range(k):
3      if the path has a relay that is down: stop
4      move packet p along the path
5      every relay on the path spends 1 unit of battery
6      if a relay reaches 0: that relay goes down
```

Steps: per packet at line 4 ("Packet `{p}` reaches `{dst}`; relays have `{batteries}` left."), a relay running out at line 6 ("`{r}` runs out of battery after packet `{p}`, so the path breaks."), and a stop at line 3 ("The path is broken. Find a new path first."). Sending 20 packets on the ETX path takes B down at packet 20; on the energy path D still has 60 units. Week 7 separates total energy from network lifetime (Loo p. 203); these two runs show the difference on one network.

**Live fields:** `hops`, `cost` (the variant's summary value), `minBatt` (the weakest relay on the path), `sent`.

### 10.11 Routing attacks and the watchdog, `/topic/routing-attacks` (Week 8)

**Variant:** `attacker: "blackhole" | "wormhole" | "none"` (default `"blackhole"`), labeled Black hole, Wormhole, and No attacker. `createInitialState(variant)` loads the variant's seed.

**Snapshot:** `NetSnapshot` plus `route: string[] | null`, `sent`, `delivered`, `dropped`, `tunneled` (packets that crossed the tunnel), `failures: Record<string, number>` (watchdog counts), `flagged: string[]`.

Discovery is DSR-style (Section 10.3), because Week 8 says the watchdog suits source routing (Misra pp. 444-445).

**Seeds.** Black hole and no attacker (Week 8, "Black hole menarik rute lalu membuang paket"; Misra Figure 18.2): nodes S (0,1), A (1,0), M (1,2), B (2,0), D (3,1); links S-A, S-M, A-B, B-D; under Black hole, M is `malicious` and the claimed link M-D is drawn `virtual` and dashed, as on the slide; under No attacker, M is an ordinary node with no link to D. Wormhole (Week 8, "Wormhole membuat dua area terasa bertetangga"; Misra Figure 18.3): nodes S (0,1), A (1,0), M1 (1,2), B (2,0), C (3,0), M2 (3,2), D (4,1); links S-A, A-B, B-C, C-D, S-M1, M2-D; M1 and M2 `malicious`; the tunnel M1-M2 is `virtual`.

**Randomize:** none; the button restores the variant's seed, and its label reads Reset scene.

**Discover route** (`discover`, `inputKind: "none"`, from S to D)

```
1  def DISCOVER(src, dst):
2    flood the RREQ one hop per tick; each node forwards the first copy and adds itself to the record
3    for each node n when it first hears the RREQ:
4      if n is a black hole: n answers at once with RREP(record + [n, dst])   # a route it does not have
5      if n is a tunnel end: the other end replays the RREQ in the same tick
6      if n == dst: dst answers RREP(record) along the record
7    src uses the first RREP that arrives and keeps the later ones
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Per tick | 2 | "Tick `{t}`: `{nodes}` hear the RREQ." | new nodes current |
| Black hole | 4 | "`{n}` answers at once, claiming a route `{route}` it does not have." | `{n}` flagged |
| Tunnel | 5 | "`{n}` passes the RREQ through the tunnel, and `{m}` replays it next to `{far}`." | tunnel active |
| Destination | 6 | "`{dst}` receives the record `{record}` and answers." | `{dst}` found |
| Per RREP arrival | 7 | "An RREP with `{route}` reaches `{src}` at tick `{t}`." | packet |
| Pick | 7 | "`{src}` uses the first route to arrive: `{route}`." | path tree |

Seed results: Black hole, the fake RREP S, M, D arrives first and S uses it; Wormhole, D first hears S, M1, M2, D (3 apparent hops against 4 through A, B, C) and S uses it; No attacker, S uses S, A, B, D.

**Send packets** (`send`, `inputKind: "key"`, placeholder "Packets, from 1 to 20")

```
1  def SEND(k):
2    for p in range(k):
3      for v in route:
4        if v is a black hole: v drops p; break
5        forward p to the next node          # through the tunnel if the next link is one
6      count p as delivered or dropped
```

Steps per packet: "`{v}` drops packet `{p}` without a trace." (line 4) or "Packet `{p}` reaches `{dst}`." (line 6), with "Packet `{p}` crosses the tunnel from `{m1}` to `{m2}`." (line 5) on the wormhole. Week 8 notes that a tunnel works even when traffic is encrypted, because the attacker relays packets without reading them; the delivered count stays at 100 % while `tunneled` rises, which is the point of the scene.

**Send with watchdog** (`watchdog`, `inputKind: "key"`, placeholder "Packets, from 1 to 20")

```
1  def SEND_WATCHED(k):
2    for p in range(k):
3      for v, nxt in the hops of route:
4        v keeps a copy of p and listens for nxt to forward it
5        if nxt forwards p: continue
6        failures[nxt] = failures[nxt] + 1
7        if failures[nxt] > 3:                      # the threshold
8          report nxt to src; the pathrater avoids nxt
9          route = the best discovered route without nxt
10       break
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Heard | 5 | "`{v}` hears `{nxt}` forward packet `{p}`." | link tree |
| Silence | 6 | "`{v}` never hears `{nxt}` forward packet `{p}`: `{f}` failures for `{nxt}`." | `{nxt}` flagged |
| Report | 8 | "`{nxt}` passed the threshold of 3, so `{v}` reports it to `{src}`." | `{nxt}` flagged |
| Reroute | 9 | "The pathrater avoids `{nxt}`: `{src}` switches to `{route}`." | path tree |
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

Each file has YAML frontmatter (`week`, `title`, `source`, `status`, `books`) and four sections: `## 1. Learning Outcomes`, `## 2. Real-World Usage`, `## 3. Core Material`, `## 4. Summary`. Section 3 has one `###` subsection per slide part, and a subsection that feeds topics ends its heading with their slugs in braces, `{#slug}` or `{#slug-a #slug-b}`, for example `### 3.2 Reactive routing: AODV, DSR, TORA {#reactive-routing}`. A topic's `coreMaterial` is every subsection tagged with its slug, in file order, with the `{#slug}` marker removed (Week 1 tags both of its subsections `multihop`). A subsection without a slug (multicast, node cooperation, simulators) is course material the app does not show on a topic page in v1.

**Status gate.** A reference starts as `status: draft`. The lecturer reviews it against the slides and the books and changes it to `status: reviewed`. `scripts/extract-content.mjs` refuses a draft: it fails with the file name and generates nothing for that week. A topic cannot be implemented (Section 15) until its reference is reviewed.

**What the drafts may say.** Every claim in an English reference comes from the matching slide file: a slide bullet, a table row, or a `Catatan` note, translated, with the book and page the slide cites. Nothing is added from memory or from the books directly. Where the slide gives a number, the English file gives the same number and the same page. The drafts do not reproduce the slides' in-class answers to quiz questions, because the quiz belongs to the lecture.

**Generation.** `scripts/extract-content.mjs` copies §2 into `realWorldUsage` and the slugged §3 subsections into `coreMaterial` for each topic, verbatim, into `src/topics/<slug>/content.ts` with the dsa-course header comment. Once a file is reviewed, only its punctuation may change (Section 18); a change of wording or claim goes back to `status: draft`.

**Case study copy** (`scenario`, `reasoning`, decisions, quiz) is hand-written, as in dsa-course. Each scenario says it is illustrative, and every cost or property it states quotes the English reference of the week it names.

## 12. Accessibility and Responsiveness

dsa-course Section 12 applies unchanged: keyboard playback (Space, ←, →) with `aria-label`s, the stacked mobile order (Canvas, Operation, Code, Playback), `viewBox` scaling, fixed canvas heights, and the layout contract by width that `e2e/topic-page-layout.spec.ts` and `e2e/case-study-page.spec.ts` check at `lg`, `md`, and phone widths (400px, nothing overflows sideways, stepping never moves the page).

Additions for this project:

- `NetworkCanvas` has the summary `aria-label` of Section 8, and every node is focusable with a spoken description, because a network drawing carries its meaning in relations a screen reader cannot see.
- A node's range circle appears on focus as well as on hover.
- `MetricsBars` shows every value as text next to its bar, so the comparison does not depend on reading bar length or color.
- Colors that tell roles apart (malicious, MPR, head) always come with a second cue: a ring style, a badge letter, or a fill pattern.

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
| `proactive-routing` | 2 | reviewed | Specified, 10.2 | not started |
| `reactive-routing` | 2 | reviewed | Specified, 10.3 | Implemented |
| `broadcast` | 3 | draft | Specified, 10.4 | not started |
| `geographic-routing` | 3 | draft | Specified, 10.5 | not started |
| `clustering` | 4 | draft | Specified, 10.6 | not started |
| `address-allocation` | 4 | draft | Specified, 10.7 | not started |
| `mobility` | 5 | draft | Specified, 10.8 | not started |
| `evaluation` | 6 | draft | Specified, 10.9 | not started |
| `qos-routing` | 7 | draft | Specified, 10.10 | not started |
| `routing-attacks` | 8 | draft | Specified, 10.11 | not started |
| Case study `sar-slope` | 1–3 | uses Weeks 1–3 | Specified, 19.1 | not started |
| Case study `relief-camp` | 4–6 | uses Weeks 4–6 | Specified, 19.2 | not started |
| Case study `community-mesh` | 7–8 | uses Weeks 7–8 | Specified, 19.3 | not started |
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
- [ ] Real-World Usage and Core Material render on each topic page from a reviewed English reference; a draft reference blocks generation.
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

**Discover route to base** (`discover`, `inputKind: "text"`, placeholder "Team radio, e.g. T1")

```
1  def DISCOVER(src):
2    queue = [(src, None)]; seen = {src}
3    while queue:
4      v, heardFrom = queue.pop(0)
5      if v == G: continue                          # the gateway answers; it does not relay
6      if v != src and not RELAYS(v, heardFrom): continue
7      v broadcasts the RREQ
8      for n in neighbors(v):
9        if n in seen: n drops a duplicate
10       else: seen.add(n); n.reverse = v; queue.append((n, v))
11   G sends the RREP back along the reverse pointers
12 def RELAYS(v, heardFrom):
13   return v in MPR(heardFrom)          # blind flooding: return True
```

Steps use the Section 10.4 Broadcast rows (transmit, first copy with "`{n}` records `{v}` as its way back to `{src}`.", duplicate, silent) at lines 7, 10, 9, and 6, focus `broadcast`; the Section 10.3 AODV RREP rows at line 11, focus `route`; and a first step at line 2 ("`{src}` needs a route to G, so it starts a route discovery.", focus `topology`). An invalid radio gives "Type a team radio: T1, T2, or T3." at line 1.

Seed results from T1: blind flooding makes 8 transmissions and 15 duplicate receptions; MPR relaying makes 6 transmissions (T1, T2, R1, R2, R4, R5) and 9 duplicates; both find T1, T2, R1, R2, R4, R5, G (6 hops).

**Send report** (`send`, `inputKind: "text"`, placeholder "Team radio, e.g. T1"): the Section 10.3 AODV Send listing and table, focus `route`.

**Radio walks away** (`walk-away`, `inputKind: "text"`, placeholder "Radio, e.g. R2")

```
1  def WALK_AWAY(u):
2    u moves out of range of every radio
3    if u was on the route: the radios next to u send RERRs and delete the route
4    if u was an articulation point between the team and G: no route to G exists
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Before | 2 | "`{u}` is about to walk out of range." | topology, `{u}` current |
| Gone | 2 | "`{u}` is out of range of every radio." | topology |
| On the route | 3 | the Section 10.3 Break link RERR and delete rows | route |
| Cut | 4 | "`{u}` was an articulation point: without it the team has no path to G." | topology, `{u}` flagged |
| Still connected | 4 | "The team can still reach G another way. Run Discover route to base again." | topology |

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

```
1  def JOIN(u, near):
2    place u next to near and link it by range
3    for n in the neighbors of u, nearest first:
4      if n has a spare address: BUDDY_JOIN(u, n); break
5    if u has no address: u waits and joins no cluster
6    CLUSTER_JOIN(u)                               # join the best head it hears, or become a head
```

Steps lift the Section 10.7 Buddy Join rows at line 4 (focus `addresses`) and the Section 10.6 Join rows at line 6 (focus `clusters`); "`{n}` has no spare address, so `{u}` asks the next neighbor." at line 4; "No neighbor of `{u}` has a spare address, so `{u}` cannot join yet." at line 5. On the seed, a new volunteer next to 1 cannot join through 1, whose range holds only its own address: the uneven use of the address space that Week 4 names as Buddy's weakness (Misra pp. 338-339).

**Elect cluster heads** (`elect`, `inputKind: "none"`): the Section 10.6 Elect listing and table over the current links, after clearing every head. Focus `clusters`.

**Advance the day** (`advance`, `inputKind: "key"`, placeholder "Ticks, from 1 to 30")

```
1  def ADVANCE(ticks):
2    for t in range(ticks):
3      move every volunteer                        # RPGM or RWP, by variant
4      links = UNIT_DISK(volunteers, range)
5      for v in the members:
6        if v cannot hear its head:
7          if v hears another head: v joins the best-ranked one
8          else: v becomes a head; elections = elections + 1
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Per tick, calm | 4 | "Tick `{t}`: `{m}` links, and every member still hears its head." | movement |
| Per tick, changes | 5 | "Tick `{t}`: `{k}` volunteers lost their head; `{j}` joined another head and `{e}` became heads." | clusters |
| Done | 2 | "After `{t}` ticks the camp elected `{e}` new heads." | clusters |

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

```
1  def FIND_ROUTE(src, dst):
2    flood the RREQ; every RREP that reaches src adds a candidate route
3    if HOP: route = the candidate with the fewest hops, the first to arrive on a tie
4    if ETX: route = the candidate with the smallest sum of link ETX
```

Steps lift the Section 10.11 Discover rows (a black hole answers at once once M has joined) at line 2, focus `route`, then per candidate "Candidate `{route}`: `{h}` hops, ETX `{e}`." at line 2 and the pick at line 3 or 4: "`{route}` has the fewest hops, so S uses it." or "`{route}` has the smallest ETX, `{e}`, so S uses it." Without M: hop count picks S, X, D (ETX 8.00); ETX picks S, A, B, C, D (ETX 4.43). With M: both pick S, M, D, because M claims a perfect link.

**Router M joins** (`join-m`, `inputKind: "none"`)

```
1  def JOIN_M():
2    M links to S and advertises a route to D
```

Steps: "A new router M appears next to S." (line 1), then "M advertises a link to D that does not exist." (line 2), focus `links`. Running Find route again shows the effect.

**Deliver packets** (`deliver`, `inputKind: "key"`, placeholder "Packets, from 1 to 30")

```
1  def DELIVER(k):
2    for p in range(k):
3      for v, nxt in the hops of route:
4        if v is a black hole: v drops p; break
5        try up to 4 times: the frame reaches nxt and its ACK comes back
6        if every try failed: drop p at v; break
7        if WATCHDOG: v checks that nxt forwards p   # Section 10.11 lines 4 to 9
8      count p as delivered or dropped
```

The per-try success probability is `w(v, nxt) * w(nxt, v)`, drawn from `rng(seed)`. Week 3 gives 4 to 7 retransmissions before a timeout for 802.11 unicast (Misra pp. 139-142); this demo uses 4.

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Per packet, delivered | 8 | "Packet `{p}` reaches D after `{tries}` transmissions." | route |
| Per packet, link failed | 6 | "`{v}` tried 4 times to reach `{nxt}` and got no ACK, so packet `{p}` is lost." | links |
| Per packet, black hole | 4 | "M drops packet `{p}` without a trace." | route |
| Watchdog rows | 7 | the Section 10.11 watchdog rows | trust |
| Done | 2 | "`{d}` of `{k}` packets reached D: `{pdr}` %." | route |

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
