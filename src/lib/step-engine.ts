// Playback over a precomputed step array: SPEC.md §9.
import { useCallback, useEffect, useState } from 'react'
import type { Step } from '@/types/step-engine'

export const DEFAULT_SPEED_MS = 800
export const MIN_SPEED_MS = 200
export const MAX_SPEED_MS = 2000

export interface Playback<T> {
  currentStepIndex: number
  currentStep: Step<T> | null
  isPlaying: boolean
  speedMs: number
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBackward: () => void
  seek: (index: number) => void
  setSpeedMs: (ms: number) => void
  reset: () => void
}

export interface PlaybackOptions {
  /** Start playing as soon as a new, non-empty steps array arrives (Go). Default true. */
  autoplay?: boolean
}

export function usePlayback<T>(steps: Step<T>[], { autoplay = true }: PlaybackOptions = {}): Playback<T> {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedMs, setSpeedMsState] = useState(DEFAULT_SPEED_MS)

  const lastIndex = Math.max(0, steps.length - 1)

  const reset = useCallback(() => {
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }, [])

  // A new steps array (new operation, or Randomize/Reset clearing it) restarts playback,
  // and a new operation starts playing on its own so Go is one click.
  // Adjusting state during render avoids an extra effect-driven commit.
  const [prevSteps, setPrevSteps] = useState(steps)
  if (steps !== prevSteps) {
    setPrevSteps(steps)
    setCurrentStepIndex(0)
    setIsPlaying(autoplay && steps.length > 1)
  }

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setTimeout(() => {
      const next = Math.min(currentStepIndex + 1, lastIndex)
      setCurrentStepIndex(next)
      if (next >= lastIndex) setIsPlaying(false)
    }, speedMs)
    return () => window.clearTimeout(timer)
  }, [isPlaying, currentStepIndex, lastIndex, speedMs])

  const play = useCallback(() => {
    if (steps.length === 0) return
    // Pressing play at the end replays from the start.
    setCurrentStepIndex((i) => (i >= lastIndex ? 0 : i))
    setIsPlaying(true)
  }, [steps.length, lastIndex])

  const pause = useCallback(() => setIsPlaying(false), [])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStepIndex((i) => Math.min(i + 1, lastIndex))
  }, [lastIndex])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const seek = useCallback(
    (index: number) => {
      setIsPlaying(false)
      setCurrentStepIndex(Math.max(0, Math.min(index, lastIndex)))
    },
    [lastIndex],
  )

  const setSpeedMs = useCallback((ms: number) => {
    setSpeedMsState(Math.max(MIN_SPEED_MS, Math.min(ms, MAX_SPEED_MS)))
  }, [])

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex] ?? null,
    isPlaying,
    speedMs,
    play,
    pause,
    stepForward,
    stepBackward,
    seek,
    setSpeedMs,
    reset,
  }
}
