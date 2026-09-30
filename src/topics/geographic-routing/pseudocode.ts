// SPEC.md §10.5 listing in the §7.1 Python style.
export const geoPseudocode: Record<string, string[]> = {
  route: [
    'def route(src, dst, recovery):',
    '    planar = gabriel(net.links)  # planar links for the perimeter walk',
    "    v, mode = src, 'greedy'",
    '    while v != dst:',
    "        if mode == 'greedy':",
    '            n = min(v.neighbors(), key=dist_to(dst))',
    '            if dist(n, dst) < dist(v, dst):',
    '                v = n',
    "            elif recovery == 'perimeter':",
    "                mode, stuck, prev = 'perimeter', v, None",
    '            else:',
    '                return drop(v)  # greedy only: the packet dies at the void',
    '        else:',
    '            n = next_clockwise(v, prev, dst, planar)  # the void stays on one side',
    '            prev, v = v, n',
    '            if dist(v, dst) < dist(stuck, dst):',
    "                mode = 'greedy'",
    '    deliver(dst)',
  ],
}

/** Line numbers the operation highlights. */
export const L = {
  route: { def: 1, planarize: 2, greedy: 8, void: 10, drop: 12, stuck: 14, perimeter: 15, resume: 17, deliver: 18 },
} as const
