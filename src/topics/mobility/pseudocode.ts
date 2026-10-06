// SPEC.md §10.8 listings in the §7.1 Python style. The two Advance listings share lines 1 to 7.
import { metricsListing, ML } from '@/lib/sim/metrics'

const advance = [
  'def advance(net, ticks):',
  '    for t in range(ticks):',
  '        for v in net.nodes:',
  '            move(v)',
  '        net.links = unit_disk(net.nodes, net.range)',
  '        net.link_changes += count_changes(net.links)  # links that appeared or broke',
  '        net.update_link_ages()  # and path availability',
]

export const mobilityPseudocode: Record<string, string[]> = {
  'advance-rwp': [
    ...advance,
    'def move(v):',
    '    if v.pause > 0:',
    '        v.pause -= 1',
    '    elif v.at_waypoint():',
    '        v.pause = rng.randint(0, 2)',
    '        v.waypoint, v.speed = rng.point_in(area), rng.uniform(0.3, 1.0)',
    '    else:',
    '        v.step_toward(v.waypoint, v.speed)',
  ],
  'advance-rpgm': [
    ...advance,
    'def move(v):',
    '    ref = v.group.ref  # moved one step along the group path each tick',
    '    if v.at_waypoint():',
    '        v.waypoint, v.speed = rng.point_within(ref, 1), rng.uniform(0.3, 1.0)',
    '    else:',
    '        v.step_toward(v.waypoint, v.speed)',
  ],
  density: [
    'def density(history):',
    '    if not history:',
    '        return None  # advance the nodes first',
    '    centre = 0',
    '    for p in history:',
    '        if in_middle_half(p, area):  # the middle half of both width and height',
    '            centre += 1',
    '    return centre / len(history)  # the share of time spent in the centre quarter',
  ],
  metrics: metricsListing,
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  advance: { def: 1, tick: 6, done: 7 },
  density: { def: 1, empty: 3, count: 7, share: 8 },
  metrics: ML,
} as const
