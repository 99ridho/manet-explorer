// SPEC.md §8 highlight kinds, as theme variables so every canvas follows dark mode.
import type { HighlightKind } from '@/types/net'

export const NODE_FILL: Record<HighlightKind, string> = {
  current: 'var(--color-accent)',
  new: 'var(--color-chart-2)',
  found: 'var(--color-chart-5)',
  visited: 'var(--color-muted)',
  active: 'var(--color-accent)',
  tree: 'var(--color-primary)',
  dropped: 'var(--color-card)',
  flagged: 'var(--color-destructive)',
}

export const NODE_TEXT: Record<HighlightKind, string> = {
  current: 'var(--color-accent-foreground)',
  new: 'var(--color-card-foreground)',
  found: 'var(--color-card-foreground)',
  visited: 'var(--color-muted-foreground)',
  active: 'var(--color-accent-foreground)',
  tree: 'var(--color-primary-foreground)',
  dropped: 'var(--color-destructive)',
  flagged: 'var(--color-primary-foreground)',
}

export const LINK_STROKE: Record<HighlightKind, string> = {
  current: 'var(--color-accent)',
  new: 'var(--color-chart-2)',
  found: 'var(--color-chart-5)',
  visited: 'var(--color-muted-foreground)',
  active: 'var(--color-accent)',
  tree: 'var(--color-primary)',
  dropped: 'var(--color-destructive)',
  flagged: 'var(--color-destructive)',
}

export const LINK_WIDTH: Record<HighlightKind, number> = {
  current: 3.5,
  new: 3.5,
  found: 3.5,
  visited: 2,
  active: 3.5,
  tree: 4.5,
  dropped: 2.5,
  flagged: 4.5,
}
