// SPEC.md §8: the one network drawing every topic and case study uses. Slide coordinates are
// scaled by UNIT with y pointing up; the card height is fixed so a changing extent never resizes it.
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { linkKey, neighbors } from '@/lib/net'
import type { NetNode, NetSnapshot } from '@/types/net'
import { LINK_STROKE, LINK_WIDTH, NODE_FILL, NODE_TEXT } from './kinds'

const UNIT = 60
const R = 15
const HEIGHT = 280
// Nodes and links share one spring so a link never lags behind the nodes it joins.
const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const

const px = (n: Pick<NetNode, 'x' | 'y'>) => ({ x: n.x * UNIT, y: -n.y * UNIT })

function nodeLabel(snap: NetSnapshot, n: NetNode, note?: string): string {
  const k = neighbors(snap, n.id).length
  const roles = n.roles.length > 0 ? `, roles ${n.roles.join(' and ')}` : ''
  const extra = note ? `, ${note}` : ''
  return `${n.id}, ${k} ${k === 1 ? 'neighbor' : 'neighbors'}${roles}${extra}${n.down ? ', out of the network' : ''}`
}

function summary(snap: NetSnapshot): string {
  const radio = snap.links.filter((l) => !l.virtual && !l.broken).length
  const path = snap.highlight?.path?.length ? `, path ${snap.highlight.path.join(', ')}` : ''
  return `Network of ${snap.nodes.length} nodes and ${radio} links${path}`
}

/** A caption under a node: short lines drawn on the canvas, and the same facts in words for its spoken label. */
export interface NodeCaption {
  lines: string[]
  spoken: string
}

export function NetworkCanvas({ snapshot, nodeLabels }: { snapshot: NetSnapshot; nodeLabels?: Record<string, NodeCaption> }) {
  const [focused, setFocused] = useState<string | null>(null)
  const { nodes, links, packets, highlight } = snapshot

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height: HEIGHT }}>
        The network has no nodes. Press Reset to load the seed network.
      </div>
    )
  }

  const byId = new Map(nodes.map((n) => [n.id, px(n)]))
  const pts = [...byId.values()]
  const pad = Math.max(R * 2.5, (snapshot.range * UNIT) / 2)
  const minX = Math.min(...pts.map((p) => p.x)) - pad
  const maxX = Math.max(...pts.map((p) => p.x)) + pad
  const minY = Math.min(...pts.map((p) => p.y)) - pad
  const maxY = Math.max(...pts.map((p) => p.y)) + pad
  const focusNode = focused ? nodes.find((n) => n.id === focused) : undefined
  const pathPts = (highlight?.path ?? []).map((id) => byId.get(id)).filter((p) => p !== undefined)

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className="w-full"
      style={{ height: HEIGHT }}
      role="group"
      aria-label={summary(snapshot)}
    >
      {focusNode && (
        <circle
          cx={byId.get(focusNode.id)!.x}
          cy={byId.get(focusNode.id)!.y}
          r={snapshot.range * UNIT}
          fill="var(--color-accent)"
          fillOpacity={0.08}
          stroke="var(--color-accent)"
          strokeDasharray="4 4"
        />
      )}

      {pathPts.length > 1 && (
        <polyline
          points={pathPts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity={0.25}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {links.map((l) => {
        const a = byId.get(l.a)
        const b = byId.get(l.b)
        if (!a || !b) return null
        const key = linkKey(l.a, l.b)
        const kind = highlight?.links?.[key]
        const dash = l.broken ? '8 6' : l.virtual ? '2 5' : undefined
        const label = snapshot.linkLabels?.[key]
        const showQuality = focused !== null && (l.a === focused || l.b === focused) && l.quality !== undefined
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        return (
          <g key={key}>
            <motion.line
              initial={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
              animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
              transition={SPRING}
              stroke={kind ? LINK_STROKE[kind] : 'var(--color-muted-foreground)'}
              strokeOpacity={kind ? 1 : 0.55}
              strokeWidth={kind ? LINK_WIDTH[kind] : 2}
              strokeDasharray={dash}
            />
            {(label || showQuality || l.bandwidth !== undefined) && (
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-mono)"
                fill="var(--color-foreground)"
                paintOrder="stroke"
                stroke="var(--color-card)"
                strokeWidth={4}
              >
                {[label, l.bandwidth !== undefined ? `${l.bandwidth} Mbps` : null, showQuality ? `w ${l.quality}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </text>
            )}
          </g>
        )
      })}

      <g role="list" aria-label="Nodes">
        {nodes.map((n) => {
          const p = byId.get(n.id)!
          const kind = highlight?.nodes?.[n.id]
          const malicious = n.roles.includes('malicious')
          const fill = kind ? NODE_FILL[kind] : malicious ? 'var(--color-destructive)' : 'var(--color-card)'
          const text = kind ? NODE_TEXT[kind] : malicious ? 'var(--color-primary-foreground)' : 'var(--color-card-foreground)'
          const endpoint = n.roles.includes('source') ? 'S' : n.roles.includes('dest') ? 'D' : null
          return (
            <motion.g
              key={n.id}
              role="listitem"
              tabIndex={0}
              aria-label={nodeLabel(snapshot, n, nodeLabels?.[n.id]?.spoken)}
              className="cursor-default outline-none focus-visible:[&>circle:first-of-type]:stroke-[var(--color-ring)]"
              initial={{ x: p.x, y: p.y, opacity: 0 }}
              animate={{ x: p.x, y: p.y, opacity: n.down ? 0.3 : 1 }}
              transition={SPRING}
              onMouseEnter={() => setFocused(n.id)}
              onMouseLeave={() => setFocused(null)}
              onFocus={() => setFocused(n.id)}
              onBlur={() => setFocused(null)}
            >
              <circle r={R} fill={fill} stroke="var(--color-border)" strokeWidth={2} />
              {n.roles.includes('mpr') && <circle r={R + 5} fill="none" stroke="var(--color-chart-3)" strokeWidth={2.5} />}
              {n.roles.includes('head') && (
                <>
                  <circle r={R + 4} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} />
                  <circle r={R + 8} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} />
                </>
              )}
              {n.roles.includes('gateway') && (
                <circle r={R + 5} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} strokeDasharray="4 3" />
              )}
              {endpoint && (
                <circle r={R + 4} fill="none" stroke="var(--color-primary)" strokeWidth={3} />
              )}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill={text}
              >
                {n.id}
              </text>
              {endpoint && endpoint !== n.id && (
                <text
                  x={R + 6}
                  y={-R - 2}
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill="var(--color-primary)"
                >
                  {endpoint}
                </text>
              )}
              {nodeLabels?.[n.id]?.lines.map((line, i) => (
                <text
                  key={i}
                  y={R + 14 + i * 13}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                  fill="var(--color-foreground)"
                  paintOrder="stroke"
                  stroke="var(--color-card)"
                  strokeWidth={4}
                >
                  {line}
                </text>
              ))}
            </motion.g>
          )
        })}
      </g>

      <AnimatePresence>
        {packets.map((pk, i) => {
          const from = byId.get(pk.from)
          if (!from) return null
          const text = pk.label ? `${pk.kind} ${pk.label}` : pk.kind
          if (pk.to === '*') {
            return (
              <g key={`b-${pk.from}-${i}`} pointerEvents="none">
                <motion.circle
                  cx={from.x}
                  cy={from.y}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  initial={{ r: R, opacity: 0.9 }}
                  animate={{ r: snapshot.range * UNIT * 0.9, opacity: 0.15 }}
                  transition={{ duration: 0.6 }}
                />
                <PacketLabel x={from.x} y={from.y - R - 12} text={text} />
              </g>
            )
          }
          const to = byId.get(pk.to)
          if (!to) return null
          return (
            <g key={`u-${pk.from}-${pk.to}-${i}`} pointerEvents="none">
              <motion.circle
                r={6}
                fill="var(--color-accent)"
                stroke="var(--color-accent-foreground)"
                initial={{ cx: from.x, cy: from.y }}
                // Stop short of the receiver so the dot never covers its label.
                animate={{ cx: from.x + (to.x - from.x) * 0.75, cy: from.y + (to.y - from.y) * 0.75 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <PacketLabel x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 + 18} text={text} />
            </g>
          )
        })}
      </AnimatePresence>
    </svg>
  )
}

function PacketLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
      fontFamily="var(--font-mono)"
      fill="var(--color-accent-foreground)"
      paintOrder="stroke"
      stroke="var(--color-accent)"
      strokeWidth={5}
    >
      {text}
    </text>
  )
}
