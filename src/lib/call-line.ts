// SPEC.md §8: the Code panel's call line, a view of a step's `variables` against its listing.
type Vars = Record<string, string | number>

const DEF = /^(\s*)def ([a-z_][a-z0-9_]*)\((.*)\):/

const indentOf = (line: string) => line.length - line.trimStart().length

/** The def that encloses 1-indexed `line`: the nearest def above it with a smaller indent, or the line itself. */
export function enclosingDef(lines: string[], line: number): { name: string; params: string[] } | null {
  const at = lines[line - 1]
  if (at === undefined) return null
  let limit = DEF.test(at) ? indentOf(at) + 1 : indentOf(at)
  for (let i = line - 1; i >= 0; i--) {
    const m = DEF.exec(lines[i])
    if (m && m[1].length < limit) {
      return { name: m[2], params: m[3].split(',').map((p) => p.trim()).filter(Boolean) }
    }
    limit = Math.min(limit, indentOf(lines[i]))
  }
  return null
}

/**
 * The call that the highlighted line runs inside, with each argument the step binds (`elect(net, rank=highest)`),
 * and the variables left over for chips. `call` is null when the step binds none of the def's params.
 */
export function callLine(lines: string[], line: number, variables: Vars = {}): { call: string | null; rest: [string, string | number][] } {
  const def = enclosingDef(lines, line)
  const used = new Set<string>()
  let call: string | null = null
  if (def && def.params.some((p) => p in variables)) {
    const args = def.params.map((p) => {
      if (!(p in variables)) return p
      used.add(p)
      return `${p}=${variables[p]}`
    })
    call = `${def.name}(${args.join(', ')})`
  }
  return { call, rest: Object.entries(variables).filter(([k]) => !used.has(k)) }
}
