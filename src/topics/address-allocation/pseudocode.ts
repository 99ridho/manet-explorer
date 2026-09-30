// SPEC.md §10.7 listings in the §7.1 Python style.
export const addressPseudocode: Record<string, string[]> = {
  'join-buddy': [
    'def join_buddy(new, via):',
    '    if size(max(via.pool, key=size)) == 1:',
    '        return  # no range left to split',
    '    lo, hi = max(via.pool, key=size)',
    '    keep, give = split_in_half(lo, hi, via.address)  # via keeps the half with its own address',
    '    via.pool.replace((lo, hi), keep)',
    '    new.pool = [give]',
    '    new.address = give[0]  # no other node is asked',
  ],
  'leave-buddy': [
    'def leave_buddy(net, u):',
    "    b = u.buddy()  # the neighbor whose range sits next to u's, else the first neighbor",
    '    b.pool = merge_touching(b.pool + u.pool)',
    '    net.remove(u)',
  ],
  'crash-buddy': [
    'def crash_buddy(net, u):',
    '    net.remove(u)  # no goodbye',
    '    net.leaked += size(u.pool)  # no node knows these addresses are free',
  ],
  'join-qdad': [
    'def join_qdad(new, via):',
    '    a = randint(1, 16)',
    '    tries = 0',
    '    while tries < 3:',
    '        new.flood(AREQ(a))  # through every node new can reach',
    '        owner = new.node_using(a)',
    '        if owner:',
    '            owner.send(AREP(a), to=new)',
    '            a = randint(1, 16)',
    '            tries = 0',
    '        else:',
    '            tries += 1  # nobody answered',
    '    new.address = a  # three AREQs with no AREP, so a counts as free',
  ],
  merge: [
    'def merge(net, partition):',
    '    net.link(net.nearest(partition), partition.first)  # the partitions come into range',
    '    for a in shared_addresses(net, partition):',
    '        net.conflicts += 1',
    '        x = partition.node_using(a)',
    '        x.pool, x.address = [], None  # x gives up its old address',
    '        join(x, via=x.first_configured_neighbor())',
  ],
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  joinBuddy: { def: 1, full: 3, split: 4, hand: 6, address: 8 },
  leaveBuddy: { def: 1, buddy: 2, hand: 3, remove: 4 },
  crash: { def: 1, remove: 2, leak: 3 },
  joinQdad: { def: 1, pick: 2, flood: 5, owner: 8, repick: 9, silence: 12, take: 13 },
  merge: { def: 1, link: 2, done: 3, conflict: 4, rejoin: 7 },
} as const
