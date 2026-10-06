// SPEC.md §10.8 and §19.2: random waypoint and RPGM, advanced in ticks, with the link statistics
// Week 5 lists. Every tick draws from its own seeded stream, so advancing 10 then 10 equals 20.
import type { NetLink, NetNode } from '@/types/net'
import { dist, unitDiskLinked } from './geometry'
import { mulberry32, randInt, type Rng } from './rng'

export interface Point {
  x: number
  y: number
}

export interface Motion {
  tx: number
  ty: number
  speed: number
  pause: number
}

export interface Group {
  ref: Point
  path: Point[] // corners the reference point walks, in a loop
  step: number // index of the corner it is heading for
  members: string[]
}

export interface MobilityParams {
  area: { w: number; h: number }
  speed: [number, number] // units per tick
  pause: [number, number] // whole ticks, random waypoint only
  groupSpeed: number // the reference point, units per tick
  radius: number // members stay within this distance of their reference point
}

export interface LinkStats {
  linkChanges: number
  linkAge: Record<string, number>
  closedDurations: number[]
  pairsConnected: number
  pairsTotal: number
}

/** The stream for tick `t` of seed `seed`. */
export function tickRng(seed: number, t: number): Rng {
  return mulberry32((Math.imul(seed, 0x9e3779b1) ^ Math.imul(t + 1, 0x85ebca6b)) >>> 0)
}

const uniformIn = (rng: Rng, lo: number, hi: number) => lo + rng() * (hi - lo)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function pointIn(rng: Rng, p: MobilityParams): Point {
  return { x: rng() * p.area.w, y: rng() * p.area.h }
}

export function pointWithin(rng: Rng, c: Point, r: number, p: MobilityParams): Point {
  const a = rng() * 2 * Math.PI
  const d = r * Math.sqrt(rng())
  return { x: clamp(c.x + d * Math.cos(a), 0, p.area.w), y: clamp(c.y + d * Math.sin(a), 0, p.area.h) }
}

function stepToward(v: Point, t: Point, speed: number) {
  const d = Math.hypot(t.x - v.x, t.y - v.y)
  if (d <= speed) {
    v.x = t.x
    v.y = t.y
  } else {
    v.x += ((t.x - v.x) / d) * speed
    v.y += ((t.y - v.y) / d) * speed
  }
}

const atWaypoint = (v: Point, m: Motion) => Math.hypot(m.tx - v.x, m.ty - v.y) < 1e-9

/** A first waypoint and speed for every node, drawn in node order. */
export function initMotion(rng: Rng, nodes: NetNode[], p: MobilityParams, groups?: Group[]): Record<string, Motion> {
  const motion: Record<string, Motion> = {}
  for (const v of nodes) {
    const g = groups?.find((g) => g.members.includes(v.id))
    const t = g ? pointWithin(rng, g.ref, p.radius, p) : pointIn(rng, p)
    motion[v.id] = { tx: t.x, ty: t.y, speed: uniformIn(rng, ...p.speed), pause: 0 }
  }
  return motion
}

/**
 * One tick for every node, in node order. With groups (RPGM) each reference point first moves one
 * step along its path, then each member chases a waypoint near it without pausing.
 */
export function moveAll(rng: Rng, nodes: NetNode[], motion: Record<string, Motion>, p: MobilityParams, groups?: Group[]) {
  for (const g of groups ?? []) {
    stepToward(g.ref, g.path[g.step], p.groupSpeed)
    if (Math.hypot(g.ref.x - g.path[g.step].x, g.ref.y - g.path[g.step].y) < 1e-9) g.step = (g.step + 1) % g.path.length
  }
  for (const v of nodes) {
    if (v.down) continue
    const m = motion[v.id]
    const g = groups?.find((g) => g.members.includes(v.id))
    if (g) {
      if (atWaypoint(v, m)) {
        const t = pointWithin(rng, g.ref, p.radius, p)
        Object.assign(m, { tx: t.x, ty: t.y, speed: uniformIn(rng, ...p.speed) })
      } else stepToward(v, { x: m.tx, y: m.ty }, m.speed)
    } else if (m.pause > 0) {
      m.pause -= 1
    } else if (atWaypoint(v, m)) {
      m.pause = randInt(rng, ...p.pause)
      const t = pointIn(rng, p)
      Object.assign(m, { tx: t.x, ty: t.y, speed: uniformIn(rng, ...p.speed) })
    } else stepToward(v, { x: m.tx, y: m.ty }, m.speed)
  }
}

/** Unit disk links over the live nodes, each stored once with a < b. */
export function unitDiskLinks(nodes: NetNode[], range: number): NetLink[] {
  const live = nodes.filter((n) => !n.down)
  const links: NetLink[] = []
  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++)
      if (unitDiskLinked(dist(live[i], live[j]), range)) {
        const [a, b] = [live[i].id, live[j].id].sort()
        links.push({ a, b })
      }
  return links
}

const key = (l: NetLink) => `${l.a}-${l.b}`

/** Pairs of live nodes with a path between them. */
export function connectedPairs(nodes: NetNode[], links: NetLink[]): { connected: number; total: number } {
  const live = nodes.filter((n) => !n.down).map((n) => n.id)
  const parent = new Map(live.map((id) => [id, id]))
  const find = (x: string): string => (parent.get(x) === x ? x : find(parent.get(x)!))
  for (const l of links) if (parent.has(l.a) && parent.has(l.b)) parent.set(find(l.a), find(l.b))
  const sizes = new Map<string, number>()
  for (const id of live) sizes.set(find(id), (sizes.get(find(id)) ?? 0) + 1)
  let connected = 0
  for (const s of sizes.values()) connected += (s * (s - 1)) / 2
  return { connected, total: (live.length * (live.length - 1)) / 2 }
}

/** Books one tick of link changes into `stats`; returns the links that appeared and broke. */
export function recordLinks(stats: LinkStats, before: NetLink[], after: NetLink[], nodes: NetNode[]): { up: number; down: number } {
  const was = new Set(before.map(key))
  const now = new Set(after.map(key))
  let up = 0
  let down = 0
  const age: Record<string, number> = {}
  for (const k of now) {
    if (!was.has(k)) up += 1
    age[k] = (stats.linkAge[k] ?? 0) + 1
  }
  for (const k of was)
    if (!now.has(k)) {
      down += 1
      stats.closedDurations.push(stats.linkAge[k] ?? 0)
    }
  stats.linkAge = age
  stats.linkChanges += up + down
  const pairs = connectedPairs(nodes, after)
  stats.pairsConnected += pairs.connected
  stats.pairsTotal += pairs.total
  return { up, down }
}

export function meanDuration(stats: LinkStats): number | null {
  const d = stats.closedDurations
  return d.length ? d.reduce((s, x) => s + x, 0) / d.length : null
}

export function pathAvailability(stats: LinkStats): number | null {
  return stats.pairsTotal ? (100 * stats.pairsConnected) / stats.pairsTotal : null
}

/** The last `k` positions of every node, from a history recorded in node order each tick. */
export function lastPositions(history: { x: number; y: number }[], ids: string[], k = 5): Record<string, { x: number; y: number }[]> {
  const ticks = Math.floor(history.length / ids.length)
  const from = Math.max(0, ticks - k)
  return Object.fromEntries(
    ids.map((id, i) => [id, Array.from({ length: ticks - from }, (_, t) => history[(from + t) * ids.length + i])]),
  )
}
