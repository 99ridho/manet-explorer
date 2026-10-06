// SPEC.md §20: the on-ramp for a student who has never met a MANET. The walkthrough runs in the
// same VisualizerShell as every topic, so the controls learned here work on every page.
import { Link } from 'react-router'
import { MarkdownContent } from '@/components/MarkdownContent'
import { VisualizerShell } from '@/components/visualizer/VisualizerShell'
import { glossary } from '@/content/glossary'
import { intro } from '@/start/intro'
import type { TopicModule } from '@/types/step-engine'

const walkthrough = intro as unknown as TopicModule

const BASICS = ['node', 'link', 'radio range', 'neighbor', 'hop', 'route', 'packet', 'broadcast']

const opening = `At home, your phone reaches the internet through a Wi-Fi access point. Every message goes to the access point first, and the access point passes it on. That is an *infrastructure* network (Loo 1.2, pp. 4-5).

Now take the access point away: a flooded village, a mountain slope, a field with no signal. The devices can still talk if they pass messages for each other. That is an *ad hoc* network. The course uses Loo's definition (translated from p. 5):

> A wireless ad hoc network is a collection of two or more wireless devices that can communicate with each other without the help of a central administrator. Each node works as both a host and a router.

When the devices can move, it is a mobile ad hoc network, a MANET. Every week of this course asks one question about it: how do devices with no boss find each other, share the air, and get a message across?`

const tryIt = `The four phones below are in one building. Your phone (A) wants to reach your friend's phone (D), but D is out of A's range.

1. **Send a message** is already selected. Type \`A D\` and press **Go**. Use **Step forward** or the right arrow key to go one step at a time, and read the **Why** line under each step.
2. Choose **Phone walks away**, type \`B\`, and press **Go**. B's links disappear.
3. Choose **Send a message** again with \`A D\`. The message finds another chain of phones, through C.
4. Make C walk away too, then send again. Now no chain is left, and the message cannot leave A.

**Reset** brings the four phones back. **Randomize** draws a new network to try.`

const howPages = `Every topic page works like the walkthrough above.

- The **Scenario** tab tells a real-world story for the network on the canvas and lists what to try, in order. Start there.
- The **Code** card shows the steps as Python-like pseudocode and highlights the line each step runs. Under the step you get the **Why**.
- A word with a dotted underline opens a short definition when you click or tap it.
- **Real-World Usage** and **Core Material** are the course notes for the week, with the book pages they come from. **Protocol** lists the messages and the state each node keeps.`

export function StartPage() {
  const basics = glossary.filter((g) => BASICS.includes(g.term))
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Start here</h1>
        <p className="max-w-prose text-muted-foreground">
          For students who have not met a mobile ad hoc network before. Read this page first, then open Week 1.
        </p>
      </header>

      <section aria-labelledby="what" className="space-y-2">
        <h2 id="what" className="text-xl font-semibold tracking-tight">
          A network with no access point
        </h2>
        <MarkdownContent markdown={opening} />
      </section>

      <section aria-labelledby="words" className="space-y-3">
        <h2 id="words" className="text-xl font-semibold tracking-tight">
          Words you will meet on every page
        </h2>
        <dl className="grid max-w-3xl gap-x-6 gap-y-3 sm:grid-cols-2">
          {basics.map((g) => (
            <div key={g.term}>
              <dt className="font-semibold">{g.term}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{g.definition}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="try" className="space-y-3">
        <h2 id="try" className="text-xl font-semibold tracking-tight">
          Pass a message across four phones
        </h2>
        <MarkdownContent markdown={tryIt} />
        <VisualizerShell topic={walkthrough} />
      </section>

      <section aria-labelledby="pages" className="space-y-2">
        <h2 id="pages" className="text-xl font-semibold tracking-tight">
          How the topic pages work
        </h2>
        <MarkdownContent markdown={howPages} />
        <p className="max-w-prose">
          Next:{' '}
          <Link to="/topic/multihop" className="text-primary underline underline-offset-4">
            Week 1, multihop links and bridges
          </Link>
          .
        </p>
      </section>
    </article>
  )
}
