// SPEC.md §19.0 quiz: one question at a time with native radios, Check then Next, and a score
// with Retry at the end. State lives in this component only, so a reload starts over.
import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getTopic } from '@/topics/registry'
import { predictStep } from '@/lib/predict-step'
import type { PredictQuestion, QuizQuestion } from '@/types/case-study'
import type { TopicModule } from '@/types/step-engine'

interface QuizPanelProps {
  questions: QuizQuestion[]
  simulator: TopicModule
}

function PredictPicture({ simulator, question }: { simulator: TopicModule; question: PredictQuestion }) {
  const step = useMemo(() => predictStep(simulator, question), [simulator, question])
  if (!step) return null
  const Canvas = simulator.CanvasComponent
  return (
    <figure className="space-y-2 rounded-lg border p-3">
      <Canvas snapshot={step.current.snapshot} variant={question.variant} />
      <figcaption className="text-sm">
        <span className="text-muted-foreground">Step shown: </span>
        {step.current.description}
      </figcaption>
    </figure>
  )
}

export function QuizPanel({ questions, simulator }: QuizPanelProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)
  const groupId = useId()

  const retry = () => {
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setResults([])
    setFinished(false)
  }

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">This case study has no quiz questions yet.</p>
  }

  if (finished) {
    const score = results.filter(Boolean).length
    return (
      // data-shell-keys="off": Space and the arrow keys act on these controls, not on playback.
      <section data-shell-keys="off" aria-labelledby={`${groupId}-score`} className="max-w-prose space-y-4">
        <h3 id={`${groupId}-score`} className="text-lg font-semibold">
          You answered {score} of {questions.length} correctly.
        </h3>
        <ol className="space-y-1.5 text-sm">
          {questions.map((q, i) => (
            <li key={q.id} className="flex gap-2">
              <span className={cn('w-14 shrink-0 font-medium', results[i] ? 'text-chart-5' : 'text-destructive')}>
                {results[i] ? 'Right' : 'Missed'}
              </span>
              <span>{q.prompt}</span>
            </li>
          ))}
        </ol>
        <Button type="button" onClick={retry}>
          Retry the quiz
        </Button>
      </section>
    )
  }

  const q = questions[index]
  const correct = selected === q.answer
  const topic = getTopic(q.topicSlug)
  const last = index === questions.length - 1

  const check = () => {
    if (selected === null) return
    setChecked(true)
    setResults((r) => [...r, selected === q.answer])
  }
  const next = () => {
    setIndex((i) => i + 1)
    setSelected(null)
    setChecked(false)
  }

  return (
    <section data-shell-keys="off" aria-label="Quiz" className="max-w-prose space-y-4">
      <p className="text-sm text-muted-foreground">
        Question {index + 1} of {questions.length}
      </p>
      {q.kind === 'predict' && <PredictPicture simulator={simulator} question={q} />}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!checked) check()
          else if (last) setFinished(true)
          else next()
        }}
        className="space-y-3"
      >
        <fieldset className="space-y-2">
          <legend className="mb-2 font-medium leading-relaxed">{q.prompt}</legend>
          {q.choices.map((choice, i) => {
            const isAnswer = checked && i === q.answer
            const isWrongPick = checked && i === selected && !correct
            return (
              <label
                key={choice}
                className={cn(
                  'flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm leading-relaxed has-focus-visible:ring-2 has-focus-visible:ring-ring',
                  selected === i && !checked && 'border-foreground/40 bg-muted/50',
                  isAnswer && 'border-chart-5 bg-chart-5/15',
                  isWrongPick && 'border-destructive bg-destructive/10',
                  checked && 'cursor-default',
                )}
              >
                <input
                  type="radio"
                  name={groupId}
                  className="mt-1 accent-foreground"
                  checked={selected === i}
                  disabled={checked}
                  onChange={() => setSelected(i)}
                />
                <span>{choice}</span>
              </label>
            )
          })}
        </fieldset>

        {checked && (
          <div role="status" className="space-y-1.5 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
            <p className="font-medium">{correct ? 'Correct.' : `Not quite. The answer is: ${q.choices[q.answer]}`}</p>
            <p>{q.explanation}</p>
            {topic && (
              <Link to={`/topic/${topic.slug}`} className="inline-block text-primary underline underline-offset-4">
                Review the {topic.title} topic
              </Link>
            )}
          </div>
        )}

        {checked ? (
          last ? (
            <Button type="button" onClick={() => setFinished(true)}>
              See your score
            </Button>
          ) : (
            <Button type="button" onClick={next}>
              Next question
            </Button>
          )
        ) : (
          <Button type="submit" disabled={selected === null}>
            Check answer
          </Button>
        )}
      </form>
    </section>
  )
}
