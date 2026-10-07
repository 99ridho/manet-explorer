// Draw-time spacing for nodes the model put too close together (ADR-016). Model positions never change.

type Point = { x: number; y: number }

/**
 * Pushes every pair closer than `gap` apart, half the shortfall each, for up to 40 passes.
 * A pair on the same spot splits along a direction set by its index, so the result is stable.
 */
export function separate(points: Map<string, Point>, gap: number): Map<string, Point> {
  const ids = [...points.keys()]
  const at = ids.map((id) => ({ ...points.get(id)! }))
  for (let pass = 0; pass < 40; pass++) {
    let moved = false
    for (let i = 0; i < at.length; i++)
      for (let j = i + 1; j < at.length; j++) {
        let dx = at[j].x - at[i].x
        let dy = at[j].y - at[i].y
        let d = Math.hypot(dx, dy)
        if (d >= gap - 1e-6) continue
        const push = (gap - d) / 2
        if (d < 1e-6) {
          const a = ((i * 7 + j) * Math.PI) / 6
          ;[dx, dy, d] = [Math.cos(a), Math.sin(a), 1]
        }
        const ux = dx / d
        const uy = dy / d
        at[i].x -= ux * push
        at[i].y -= uy * push
        at[j].x += ux * push
        at[j].y += uy * push
        moved = true
      }
    if (!moved) break
  }
  return new Map(ids.map((id, k) => [id, at[k]]))
}
