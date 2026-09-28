// SPEC.md §19.0 canvas view switch: the view follows the step's focus, and a student can pick
// another view that lasts until the focus changes again.
import { useState } from 'react'

export function useFollowedView<K extends string>(focus: K): [K, (view: K) => void] {
  const [view, setView] = useState<K>(focus)
  // Adjusting state during render (as usePlayback does) avoids an effect-driven second commit.
  const [lastFocus, setLastFocus] = useState<K>(focus)
  if (focus !== lastFocus) {
    setLastFocus(focus)
    setView(focus)
  }
  return [view, setView]
}
