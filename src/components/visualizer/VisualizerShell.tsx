// SPEC.md §8/§9: owns the persistent TState and the playback for the last operation's steps.
import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePlayback } from '@/lib/step-engine'
import type { Step, TopicModule } from '@/types/step-engine'
import { CodePanel } from './CodePanel'
import { LiveFields } from './LiveFields'
import { OperationBar } from './OperationBar'
import { PlaybackControls } from './PlaybackControls'
import { parseInput } from './input-parsing'

const NO_STEPS: Step<unknown>[] = []

// v1 contract: every topic defines TState = TSnapshot (SPEC.md §10), so an operation's
// finalSnapshot becomes the next persistent state.
interface VisualizerShellProps {
  topic: TopicModule
  // The page mirrors the variant for the Structure panel; the shell still owns it and its resets.
  onVariantChange?: (value: string) => void
}

export function VisualizerShell({ topic, onVariantChange }: VisualizerShellProps) {
  const [variant, setVariant] = useState<string | undefined>(topic.variant?.default)
  const [state, setState] = useState<unknown>(() => topic.createInitialState(topic.variant?.default))
  const [steps, setSteps] = useState<Step<unknown>[]>(NO_STEPS)
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)

  const playback = usePlayback(steps)
  // Operations can be scoped to a variant (SPEC §7 `variants`); the first visible one is the default.
  const visibleOperations = topic.operations.filter((op) => !op.variants || (variant !== undefined && op.variants.includes(variant)))
  const currentOperation =
    visibleOperations.find((op) => op.id === currentOperationId) ?? visibleOperations[0] ?? null
  const displayedSnapshot = playback.currentStep?.snapshot ?? state
  const Canvas = topic.CanvasComponent

  const handleGo = useCallback(() => {
    if (!currentOperation) return
    const parsed = parseInput(currentOperation.inputKind, inputText)
    if (!parsed.ok) {
      setInputError(parsed.error)
      return
    }
    setInputError(null)
    const result = currentOperation.run(state, parsed.value)
    setSteps(result.steps)
    setState(result.finalSnapshot)
  }, [currentOperation, inputText, state])

  // Randomize and Reset bypass the step engine entirely (§9).
  const handleRandomize = () => {
    setState((s: unknown) => topic.randomize(s, variant))
    setSteps(NO_STEPS)
    setInputError(null)
  }
  const handleReset = () => {
    setState(topic.createInitialState(variant))
    setSteps(NO_STEPS)
    setInputError(null)
  }
  // Switching the variant reloads the variant's seed (SPEC §9): the variants don't share live state.
  const handleVariantChange = (value: string) => {
    setVariant(value)
    setState(topic.createInitialState(value))
    setSteps(NO_STEPS)
    setCurrentOperationId(null)
    setInputError(null)
    onVariantChange?.(value)
  }

  // Keyboard playback (§12): Space play/pause, ←/→ step: ignored while typing in a field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (target?.isContentEditable) return
      // A region such as the case study quiz keeps Space and the arrows for its own controls.
      if (target?.closest('[data-shell-keys="off"]')) return
      if (steps.length === 0) return
      if (e.key === ' ') {
        e.preventDefault()
        if (playback.isPlaying) playback.pause()
        else playback.play()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        playback.stepForward()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        playback.stepBackward()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [steps.length, playback])

  return (
    // Mobile order (§12) is the DOM order: Canvas, OperationBar, CodePanel, PlaybackControls.
    // From md up: canvas spans the full width; Operation + Playback stack beside a tall Pseudocode.
    // The Playback row is 1fr and its card self-starts, so Code's surplus height lands in that
    // row instead of stretching Operation and Playback. At lg the Code card self-starts too and
    // is capped at its grid area, so it sizes to the listing and scrolls only past the column height.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 md:grid-rows-[auto_auto_1fr] lg:min-h-0 lg:flex-1">
      <Card className="min-w-0 md:col-span-2">
        <CardContent>
          <Canvas snapshot={displayedSnapshot} variant={variant} />
          <LiveFields structure={topic.structure} snapshot={displayedSnapshot} variant={variant} />
        </CardContent>
      </Card>

      <Card className="min-w-0 md:col-start-1 md:row-start-2">
        <CardHeader>
          <CardTitle className="text-base">Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <OperationBar
            operations={visibleOperations}
            currentOperationId={currentOperation?.id ?? null}
            onOperationChange={(id) => {
              setCurrentOperationId(id)
              // The old steps index the old listing, so a new operation starts with none.
              setSteps(NO_STEPS)
              setInputError(null)
            }}
            inputText={inputText}
            onInputChange={(t) => {
              setInputText(t)
              if (inputError) setInputError(null)
            }}
            inputError={inputError}
            onGo={handleGo}
            onRandomize={handleRandomize}
            onReset={handleReset}
            variant={topic.variant}
            variantValue={variant}
            onVariantChange={handleVariantChange}
          />
        </CardContent>
      </Card>

      <Card className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-2 lg:max-h-full lg:min-h-0 lg:self-start">
        <CardHeader>
          <CardTitle className="text-base">Code</CardTitle>
        </CardHeader>
        <CardContent className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <CodePanel
            lines={currentOperation ? (topic.pseudocode[currentOperation.id] ?? []) : []}
            currentStep={playback.currentStep}
            operationLabel={currentOperation?.label ?? null}
          />
        </CardContent>
      </Card>

      <Card className="min-w-0 md:col-start-1 md:row-start-3 md:self-start">
        <CardHeader>
          <CardTitle className="text-base">Playback</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaybackControls playback={playback} stepCount={steps.length} />
        </CardContent>
      </Card>
    </div>
  )
}
