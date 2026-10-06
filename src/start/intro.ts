// SPEC.md §20: the Start here walkthrough. Not registered as a topic; the page runs it in the
// same shell every topic uses, so the controls a student learns here work everywhere.
import { cloneNet, findLink, linkKey, listIds, neighbors, plural, recorder } from '@/lib/net'
import { connectedUnitDisk } from '@/lib/sim/placement'
import { mulberry32, newSeed } from '@/lib/sim/rng'
import type { HighlightKind, NetSnapshot } from '@/types/net'
import type { OperationDefinition, OperationResult, StructureSpec, TopicModule } from '@/types/step-engine'
import type { TopicStory } from '@/types/story'
import { IntroCanvas } from './canvas'
import { introPseudocode, L } from './pseudocode'

export type IntroSnapshot = NetSnapshot
type Result = OperationResult<IntroSnapshot>

const RANGE = 1.3

export function introSeed(): IntroSnapshot {
  return {
    nodes: [
      { id: 'A', x: 0, y: 1, roles: [] },
      { id: 'B', x: 1, y: 1.7, roles: [] },
      { id: 'C', x: 1, y: 0.3, roles: [] },
      { id: 'D', x: 2, y: 1, roles: [] },
    ],
    links: [
      { a: 'A', b: 'B' },
      { a: 'A', b: 'C' },
      { a: 'B', b: 'D' },
      { a: 'C', b: 'D' },
    ],
    range: RANGE,
    packets: [],
  }
}

function randomIntro(seed: number): IntroSnapshot {
  const placed = connectedUnitDisk(mulberry32(seed), ['A', 'B', 'C', 'D', 'E'], 3, 2, RANGE)
  return placed ? { ...placed, range: RANGE, packets: [] } : introSeed()
}

/** Fewest hops by breadth-first search; neighbors in node order break ties. */
function shortestRoute(s: IntroSnapshot, src: string, dst: string): string[] | null {
  const prev = new Map<string, string>([[src, src]])
  const queue = [src]
  while (queue.length) {
    const v = queue.shift()!
    if (v === dst) break
    for (const n of neighbors(s, v)) {
      if (prev.has(n)) continue
      prev.set(n, v)
      queue.push(n)
    }
  }
  if (!prev.has(dst)) return null
  const route = [dst]
  while (route[0] !== src) route.unshift(prev.get(route[0])!)
  return route
}

function parsePair(s: IntroSnapshot, input: unknown): [string, string] | null {
  const ids = String(input ?? '').trim().toUpperCase().split(/[\s,]+/).filter(Boolean)
  const known = new Set(s.nodes.filter((n) => !n.down).map((n) => n.id))
  return ids.length === 2 && ids[0] !== ids[1] && known.has(ids[0]) && known.has(ids[1]) ? [ids[0], ids[1]] : null
}

function runSend(state: IntroSnapshot, input: unknown): Result {
  const work = cloneNet(state)
  const { steps, push, why } = recorder(work)
  const pair = parsePair(work, input)
  if (!pair) {
    push('Type two phones that are still in the network, such as A D.', L.send.def)
    why('A message needs a phone that sends it and a different phone that receives it.')
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const [src, dst] = pair
  const route = shortestRoute(work, src, dst)
  if (!route) {
    push(`No chain of neighbors connects ${src} to ${dst}, so the message cannot leave ${src}.`, L.send.none, {
      nodes: { [src]: 'dropped', [dst]: 'dropped' },
    })
    why('Every hop needs two phones in range of each other. Here the chain has a gap, and nothing can cross it.')
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const direct = route.length === 2
  push(
    direct
      ? `${src} has a message for ${dst}, and ${dst} is in range: the route is ${listIds(route)}.`
      : `${src} has a message for ${dst}, but ${dst} is out of range. The shortest route is ${listIds(route)}.`,
    L.send.route,
    { nodes: { [src]: 'current', [dst]: 'found' }, path: route },
  )
  why(
    direct
      ? `${src} and ${dst} can hear each other, so no other phone has to help.`
      : `A phone only reaches the phones near it, so other phones have to pass the message along. Fewer hops means fewer transmissions.`,
  )
  const done: Record<string, HighlightKind> = {}
  for (let i = 0; i + 1 < route.length; i++) {
    const v = route[i]
    const nxt = route[i + 1]
    done[linkKey(v, nxt)] = 'tree'
    push(`${v} sends the message to ${nxt}.`, L.send.hop, { nodes: { [v]: 'visited', [nxt]: 'current' }, links: { ...done }, path: route }, [
      { kind: 'DATA', from: v, to: nxt },
    ])
    why(
      i === 0
        ? `${nxt} is in range of ${v}, so one transmission covers this hop.`
        : `The message is not for ${v}, but ${v} passes it on anyway. In an ad hoc network every device is also a router (Loo p. 5).`,
    )
  }
  push(`${dst} receives the message after ${plural(route.length - 1, 'hop')}.`, L.send.done, {
    nodes: { [dst]: 'found' },
    links: { ...done },
    path: route,
  })
  why(`${dst} is the destination, so it keeps the message instead of passing it on.`)
  return { steps, finalSnapshot: cloneNet(work) }
}

function runLeave(state: IntroSnapshot, input: unknown): Result {
  const work = cloneNet(state)
  const { steps, push, why } = recorder(work)
  const id = String(input ?? '').trim().toUpperCase()
  const node = work.nodes.find((n) => n.id === id && !n.down)
  if (!node) {
    push('Type one phone that is still in the network, such as B.', L.leave.def)
    why('Only a phone that is still in the network can walk away from it.')
    return { steps, finalSnapshot: cloneNet(work) }
  }
  push(`${id} starts to walk away.`, L.leave.def, { nodes: { [id]: 'current' } })
  why(`${id} still has its links on this step, so you can see which phones are about to lose it.`)
  for (const n of neighbors(work, id)) {
    work.links = work.links.filter((l) => l !== findLink(work, id, n))
    push(`The link ${linkKey(id, n)} is gone.`, L.leave.link, { nodes: { [id]: 'current', [n]: 'dropped' } })
    why(`${id} is now out of ${n}'s range, so ${n} can no longer hear it.`)
  }
  node.down = true
  push(`${id} has left the network.`, L.leave.down, { nodes: { [id]: 'dropped' } })
  why('Any route through this phone is broken now. Send the message again to see the network use another chain of phones, if one exists.')
  return { steps, finalSnapshot: cloneNet(work) }
}

const operations: OperationDefinition<IntroSnapshot, unknown, IntroSnapshot>[] = [
  { id: 'send', label: 'Send a message', inputKind: 'text', placeholder: 'From and to, e.g. A D', run: runSend },
  { id: 'leave', label: 'Phone walks away', inputKind: 'text', placeholder: 'A phone, e.g. B', run: runLeave },
]

const structure: StructureSpec<IntroSnapshot> = {
  adt: {
    name: 'Multihop forwarding',
    summary: 'Phones pass a message from neighbor to neighbor until it reaches the phone it is for.',
    operations: [
      {
        name: 'DATA',
        signature: 'DATA(dst, message)',
        cost: '',
        note: 'The message itself, handed over one hop at a time.',
        operationIds: ['send'],
      },
    ],
    invariants: ['A phone hands a message only to a neighbor in range.'],
  },
  representations: {
    default: {
      label: 'Phones and links',
      declaration: ['class Network:', '    nodes: list  # every phone', '    links: set   # pairs in range'],
      fields: [
        { name: 'nodes', type: 'list', role: 'every phone with its position' },
        { name: 'links', type: 'set', role: 'the pairs that can hear each other' },
      ],
    },
  },
  algorithms: ['leave'],
  liveFields: (s) => ({
    phones: s.nodes.filter((n) => !n.down).length,
    links: s.links.length,
  }),
}

export const introStory: TopicStory = {
  scenario: '',
  cast: {
    A: 'your phone',
    B: 'a phone across the hall',
    C: 'a phone by the stairs',
    D: "your friend's phone",
  },
}

export const intro: TopicModule<IntroSnapshot, IntroSnapshot> = {
  slug: 'start',
  title: 'Start here',
  weekLabel: 'Before Week 1',
  operations,
  pseudocode: introPseudocode,
  CanvasComponent: IntroCanvas,
  content: { realWorldUsage: '', coreMaterial: '' },
  structure,
  createInitialState: introSeed,
  randomize: () => randomIntro(newSeed()),
  story: introStory,
}
