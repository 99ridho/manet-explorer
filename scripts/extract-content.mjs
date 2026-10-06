// SPEC.md §11: copies the slugged §3 subsections of each references/en file into
// src/topics/<slug>/content.ts, verbatim. A reference that is not `status: reviewed` stops the run.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

// Registered topics only; add a row when a topic joins src/topics/registry.ts.
const topics = [
  ['multihop', 'Week-1-Introduction.md'],
  ['proactive-routing', 'Week-2-Routing.md'],
  ['reactive-routing', 'Week-2-Routing.md'],
  ['broadcast', 'Week-3-Broadcast-Multicast-Geographic.md'],
  ['geographic-routing', 'Week-3-Broadcast-Multicast-Geographic.md'],
  ['clustering', 'Week-4-Self-Organization.md'],
  ['address-allocation', 'Week-4-Self-Organization.md'],
  ['mobility', 'Week-5-Mobility-Propagation.md'],
  ['evaluation', 'Week-6-Modeling-Simulation.md'],
  ['qos-routing', 'Week-7-QoS-Congestion-Energy.md'],
  ['routing-attacks', 'Week-8-Security-Trust.md'],
]

function frontmatter(md, file) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(md)
  if (!m) throw new Error(`${file}: missing frontmatter`)
  const status = /^status:\s*(\S+)\s*$/m.exec(m[1])?.[1]
  return { status, body: md.slice(m[0].length) }
}

function trim(lines) {
  while (lines.length && (lines.at(-1).trim() === '' || lines.at(-1).trim() === '---')) lines.pop()
  while (lines.length && lines[0].trim() === '') lines.shift()
  return lines.join('\n')
}

/** The lines under a `## N.` heading, up to the next `## ` heading. */
function section(lines, re, file) {
  const start = lines.findIndex((l) => re.test(l))
  if (start < 0) throw new Error(`${file}: missing ${re}`)
  let end = lines.findIndex((l, i) => i > start && /^## /.test(l))
  if (end < 0) end = lines.length
  return lines.slice(start + 1, end)
}

/** Every `### ` subsection whose `{#…}` marker lists the slug, marker stripped, in file order. */
function slugged(lines, slug) {
  const out = []
  let keep = false
  for (const line of lines) {
    if (/^### /.test(line)) {
      const marker = /\s*\{([^}]*)\}\s*$/.exec(line)
      const slugs = marker ? marker[1].split(/\s+/).map((s) => s.replace(/^#/, '')) : []
      keep = slugs.includes(slug)
      if (keep) out.push(marker ? line.slice(0, marker.index) : line)
      continue
    }
    if (keep) out.push(line)
  }
  return out
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

let failed = false
for (const [slug, file] of topics) {
  const md = readFileSync(`references/en/${file}`, 'utf8')
  const { status, body } = frontmatter(md, file)
  if (status !== 'reviewed') {
    console.error(`${file}: status is "${status}", not "reviewed", so ${slug} gets no content (SPEC.md §11).`)
    failed = true
    continue
  }
  const lines = body.split('\n')
  const core = trim(slugged(section(lines, /^## 3\. Core Material/, file), slug))
  if (!core) throw new Error(`${file}: no §3 subsection is tagged {#${slug}}`)
  mkdirSync(`src/topics/${slug}`, { recursive: true })
  const out = `// SPEC.md §11: generated from references/en/${file} (the {#${slug}} subsections of §3).
// Do not edit: regenerate with \`node scripts/extract-content.mjs\` after the reference changes.

export const coreMaterial = \`
${esc(core)}
\`.trim()
`
  writeFileSync(`src/topics/${slug}/content.ts`, out)
  console.log(`${slug}: core=${core.length} chars`)
}
if (failed) process.exit(1)
