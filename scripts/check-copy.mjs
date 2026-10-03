// Mechanical floor for SPEC.md §18: fails on em dashes and double-hyphen dashes in
// everything the project writes. Passing this does not replace the antislop checklist.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
// references/id holds the frozen Indonesian slides (SPEC.md §11); their bytes never change.
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', join('src', 'components', 'ui'), join('references', 'id')])
const ROOTS = ['src', 'scripts', 'references', 'anti-slop', 'README.md', 'ADR.md', 'SPEC.md', 'CLAUDE.md', 'index.html']
const EXT = /\.(ts|tsx|mjs|md|html)$/

const CHECKS = [
  { name: 'em dash (U+2014)', re: /\u2014/g },
  { name: 'double hyphen used as a dash', re: /\s-{2}\s/g },
]

function* walk(path) {
  const rel = relative(ROOT, path)
  if ([...SKIP_DIRS].some((d) => rel === d || rel.startsWith(d + '/'))) return
  const st = statSync(path)
  if (st.isDirectory()) {
    for (const entry of readdirSync(path)) yield* walk(join(path, entry))
  } else if (EXT.test(path)) {
    yield path
  }
}

const hits = []
for (const root of ROOTS) {
  let entry
  try {
    entry = join(ROOT, root)
    statSync(entry)
  } catch {
    continue
  }
  for (const file of walk(entry)) {
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      for (const { name, re } of CHECKS) {
        if (re.test(line)) hits.push(`${relative(ROOT, file)}:${i + 1}: ${name}`)
        re.lastIndex = 0
      }
    })
  }
}

if (hits.length > 0) {
  console.error('lint:copy failed (SPEC.md §18):')
  for (const h of hits) console.error('  ' + h)
  process.exit(1)
}
console.log('lint:copy passed: no em dashes or double-hyphen dashes.')
