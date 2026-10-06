// SPEC.md §20: the story's cast under the canvas. It depends on the cast and the variant, never on the step,
// so stepping never changes its height (§12).
import type { TopicStory } from '@/types/story'

interface WhosWhoProps {
  story: TopicStory
  // The nodes of the variant's seed; the cast lists only these.
  ids: Set<string>
  // After Randomize the nodes are not the story's devices any more.
  randomized: boolean
}

export function WhosWho({ story, ids, randomized }: WhosWhoProps) {
  if (randomized) {
    return (
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Random network: the story roles do not apply here. Reset brings back the story network.
      </p>
    )
  }
  return (
    <div className="mt-2 flex flex-col gap-1 text-xs leading-5 sm:flex-row sm:gap-2">
      <span className="shrink-0 text-muted-foreground">Who&apos;s who</span>
      <dl className="flex min-w-0 flex-wrap gap-x-3">
        {Object.entries(story.cast)
          .filter(([id]) => ids.has(id))
          .map(([id, role]) => (
            <div key={id} className="flex gap-1">
              <dt className="font-mono font-semibold">{id}</dt>
              <dd>{role}</dd>
            </div>
          ))}
      </dl>
    </div>
  )
}
