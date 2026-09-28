// SPEC.md §8/§9/§12: play/pause, step, scrub, speed; all keyboard-operable with aria-labels.
import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { MAX_SPEED_MS, MIN_SPEED_MS, type Playback } from '@/lib/step-engine'

interface PlaybackControlsProps {
  playback: Playback<unknown>
  stepCount: number
}

export function PlaybackControls({ playback, stepCount }: PlaybackControlsProps) {
  const disabled = stepCount === 0
  const { currentStepIndex, isPlaying } = playback

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={playback.stepBackward}
          disabled={disabled || currentStepIndex === 0}
          aria-label="Step backward"
        >
          <SkipBackIcon />
        </Button>
        <Button
          size="icon"
          onClick={isPlaying ? playback.pause : playback.play}
          disabled={disabled}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          aria-pressed={isPlaying}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={playback.stepForward}
          disabled={disabled || currentStepIndex >= stepCount - 1}
          aria-label="Step forward"
        >
          <SkipForwardIcon />
        </Button>
        <span className="ml-1 whitespace-nowrap font-mono text-sm tabular-nums text-muted-foreground" aria-live="polite">
          {disabled ? '0 / 0' : `${currentStepIndex + 1} / ${stepCount}`}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">Space: play/pause · ←/→: step</p>

      <div className="flex items-center gap-3">
        <span className="w-12 shrink-0 text-xs text-muted-foreground">Step</span>
        <Slider
          value={[currentStepIndex]}
          min={0}
          max={Math.max(0, stepCount - 1)}
          step={1}
          disabled={disabled}
          onValueChange={([v]) => playback.seek(v)}
          aria-label="Scrub steps"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="w-12 shrink-0 text-xs text-muted-foreground">Speed</span>
        <Slider
          value={[MAX_SPEED_MS + MIN_SPEED_MS - playback.speedMs]}
          min={MIN_SPEED_MS}
          max={MAX_SPEED_MS}
          step={100}
          onValueChange={([v]) => playback.setSpeedMs(MAX_SPEED_MS + MIN_SPEED_MS - v)}
          aria-label="Playback speed"
        />
        <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
          {playback.speedMs} ms
        </span>
      </div>
    </div>
  )
}
