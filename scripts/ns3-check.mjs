// Builds every ns3/<slug>.cc against the pinned ns-3 image and runs it once per variant.
// Without --update it fails when a run's output differs from ns3/output/<slug>.<value>.txt;
// with --update it rewrites those files. Pass slugs to check only those scripts.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const NS3 = join(ROOT, 'ns3')
const IMAGE = 'manet-ns3'
const args = process.argv.slice(2)
const update = args.includes('--update')
const runs = JSON.parse(readFileSync(join(NS3, 'runs.json'), 'utf8'))
const slugs = args.filter((a) => !a.startsWith('--'))
const chosen = slugs.length > 0 ? slugs : Object.keys(runs).filter((s) => existsSync(join(NS3, `${s}.cc`)))

execFileSync('docker', ['build', '-q', '-t', IMAGE, NS3], { stdio: 'inherit' })

// One container builds every script once; each run's stdout lands between markers.
const script = [
  'set -e',
  ...chosen.map((s) => `cp /work/${s}.cc scratch/${s}.cc`),
  './ns3 build > /tmp/build.log 2>&1 || (tail -50 /tmp/build.log; exit 1)',
  // A script whose mechanism has no variant switch in ns-3 runs once, saved as <slug>.default.txt.
  ...chosen.flatMap((s) =>
    runs[s].arg
      ? runs[s].values.map((v) => `echo "@@ ${s}.${v}"; ./ns3 run --no-build --quiet "${s} --${runs[s].arg}=${v}"`)
      : [`echo "@@ ${s}.default"; ./ns3 run --no-build --quiet ${s}`],
  ),
].join('\n')
let out
try {
  out = execFileSync('docker', ['run', '--rm', '-v', `${NS3}:/work:ro`, IMAGE, 'bash', '-c', script], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  })
} catch (err) {
  console.error(err.stdout)
  process.exit(1)
}

let failed = 0
for (const block of out.split(/^@@ /m).slice(1)) {
  const nl = block.indexOf('\n')
  const name = block.slice(0, nl)
  const text = block.slice(nl + 1)
  const file = join(NS3, 'output', `${name}.txt`)
  if (update) {
    writeFileSync(file, text)
    console.log(`wrote ns3/output/${name}.txt`)
  } else if (!existsSync(file) || readFileSync(file, 'utf8') !== text) {
    console.error(`ns3/output/${name}.txt differs from this run:\n${text}`)
    failed++
  } else {
    console.log(`${name}: matches`)
  }
}
if (failed > 0) process.exit(1)
