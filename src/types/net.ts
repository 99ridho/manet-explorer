// SPEC.md §7.2: the network snapshot every topic and case study extends.

export type NodeRole = 'source' | 'dest' | 'relay' | 'mpr' | 'head' | 'gateway' | 'malicious' | 'anchor'

export interface NetNode {
  id: string // the label the slide uses: "A", "S", "M1", "9"
  x: number // slide units; NetworkCanvas scales them
  y: number
  roles: NodeRole[]
  battery?: number
  down?: boolean // left the network: drawn faded, no links
}

export interface NetLink {
  a: string // a < b in string order; links are undirected and stored once
  b: string
  quality?: number // delivery probability a to b (w)
  qualityBack?: number // b to a, when it differs
  bandwidth?: number // Mbps
  broken?: boolean // drawn dashed: the slides' `putus`
  virtual?: boolean // not a radio link: a tunnel, a claimed route
}

export interface InFlight {
  kind: string // "RREQ", "RREP", "RERR", "DATA" …
  from: string
  to: string // a node id, or "*" for a local broadcast to every neighbor
  label?: string
}

export type HighlightKind = 'current' | 'new' | 'found' | 'visited' | 'active' | 'tree' | 'dropped' | 'flagged'

export interface NetHighlight {
  nodes?: Record<string, HighlightKind>
  links?: Record<string, HighlightKind> // key "a-b" with a < b
  path?: string[]
}

export interface NetSnapshot {
  nodes: NetNode[] // declared order is the tie-break order
  links: NetLink[]
  range: number
  packets: InFlight[]
  highlight?: NetHighlight
  /** Per-link labels the topic wants drawn, e.g. an ETX value. Key "a-b" with a < b. */
  linkLabels?: Record<string, string>
}
