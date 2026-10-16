// SPEC.md §7.3: one topic's ns-3 script, as students download it, with the output ns-3 printed.
export interface Ns3Script {
  file: string // e.g. "reactive-routing.cc", the name students save and run
  source: string // the file's text, imported from ns3/<slug>.cc
  arg?: string // the command-line argument that picks the variant; absent when the script takes none
  outputs: Record<string, string> // stdout per variant value, or under "default"; captured by scripts/ns3-check.mjs
  notes: string // markdown: what the script shows and where ns-3's result differs from the visualizer
}
