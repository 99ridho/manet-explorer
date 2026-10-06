// SPEC.md §19.0 and §12: the case study page keeps the topic page layout contract, and the quiz
// works by keyboard without driving the simulator's playback.
import { expect, test, type Locator, type Page } from '@playwright/test'

const ACTIVE_PANEL = 'section[aria-label="Case study materials"] [role="tabpanel"][data-state="active"]'
const SLUGS = ['sar-slope', 'relief-camp', 'community-mesh']

function card(page: Page, title: string): Locator {
  return page.locator('[data-slot="card"]', { has: page.locator('[data-slot="card-title"]', { hasText: title }) })
}

function documentScroll(page: Page) {
  return page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
  }))
}

async function open(page: Page, slug: string) {
  await page.goto(`/case-study/${slug}`)
  await expect(card(page, 'Operation')).toBeVisible()
}

test.describe('desktop (lg)', () => {
  test.use({ viewport: { width: 1400, height: 900 } })

  for (const slug of SLUGS) {
    test(`${slug}: the page does not scroll and the Reasoning panel does`, async ({ page }) => {
      await open(page, slug)
      await page.getByRole('tab', { name: 'Reasoning' }).click()
      const doc = await documentScroll(page)
      expect(doc.scrollHeight).toBe(doc.clientHeight)
      await expect(page.locator(ACTIVE_PANEL)).toContainText('Chosen')
      expect(await page.locator(ACTIVE_PANEL).evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto')
    })
  }

  test('the naive design shows its cost in the live fields', async ({ page }) => {
    await open(page, 'sar-slope')
    await page.getByRole('tab', { name: 'Blind flooding' }).click()
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Discover route to base' }).click()
    await page.getByRole('textbox').fill('T1')
    await page.getByRole('button', { name: 'Go', exact: true }).click()
    await page.getByRole('button', { name: 'Pause' }).click()
    while (await page.getByRole('button', { name: 'Step forward' }).isEnabled()) await page.getByRole('button', { name: 'Step forward' }).click()
    await expect(page.locator('[aria-label="Live fields"]')).toContainText('dupes = 15')
  })

  test('the quiz checks an answer, explains it, and ends with a score', async ({ page }) => {
    await open(page, 'sar-slope')
    await page.getByRole('tab', { name: 'Quiz' }).click()
    const quiz = page.locator(ACTIVE_PANEL)
    const count = Number((await quiz.getByText(/^Question 1 of \d+$/).textContent())!.match(/of (\d+)/)![1])
    for (let i = 0; i < count; i++) {
      await quiz.getByRole('radio').first().check()
      await quiz.getByRole('button', { name: 'Check answer' }).click()
      await expect(quiz.getByRole('status')).toContainText(/Correct\.|Not quite\./)
      await quiz.getByRole('button', { name: i === count - 1 ? 'See your score' : 'Next question' }).click()
    }
    await expect(quiz.getByRole('heading', { name: new RegExp(`You answered \\d+ of ${count} correctly\\.`) })).toBeVisible()
    await quiz.getByRole('button', { name: 'Retry the quiz' }).click()
    await expect(quiz.getByText(`Question 1 of ${count}`)).toBeVisible()
  })

  test('a predict question draws the simulator step it asks about', async ({ page }) => {
    await open(page, 'sar-slope')
    await page.getByRole('tab', { name: 'Quiz' }).click()
    const quiz = page.locator(ACTIVE_PANEL)
    for (let i = 0; i < 6; i++) {
      await quiz.getByRole('radio').first().check()
      await quiz.getByRole('button', { name: 'Check answer' }).click()
      await quiz.getByRole('button', { name: 'Next question' }).click()
    }
    await expect(quiz.locator('figure')).toContainText('R1 records T2 as its way back to T1.')
    await expect(quiz.locator('figure [aria-label^="Network of 9 nodes"]')).toBeVisible()
  })

  test('Space inside the quiz selects and presses, and never toggles playback', async ({ page }) => {
    await open(page, 'sar-slope')
    await page.getByRole('textbox').fill('T1')
    await page.getByRole('button', { name: 'Go', exact: true }).click()
    await page.getByRole('button', { name: 'Step backward' }).click()
    const counter = page.getByText(/^\d+ \/ \d+$/)
    const before = await counter.textContent()
    await page.getByRole('tab', { name: 'Quiz' }).click()
    const quiz = page.locator(ACTIVE_PANEL)
    await quiz.getByRole('radio').nth(1).focus()
    await page.keyboard.press(' ')
    await expect(quiz.getByRole('radio').nth(1)).toBeChecked()
    await quiz.getByRole('button', { name: 'Check answer' }).focus()
    await page.keyboard.press(' ')
    await expect(quiz.getByRole('status')).toContainText('Correct.')
    await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
    expect(await counter.textContent()).toBe(before)
  })
})

test.describe('canvas view switch', () => {
  test.use({ viewport: { width: 1400, height: 900 } })

  const view = (page: Page, name: string) => page.getByRole('group', { name: 'Choose what the canvas shows' }).getByRole('button', { name })

  test('sar slope: rests on the topology, follows the step, and keeps a picked view until the focus moves', async ({ page }) => {
    await open(page, 'sar-slope')
    await expect(view(page, 'Topology')).toHaveAttribute('aria-pressed', 'true')
    await view(page, 'Route').click()
    await expect(view(page, 'Route')).toHaveAttribute('aria-pressed', 'true')

    // Discover from T1: step 1 is on the topology, step 2 on the broadcast.
    await page.getByRole('textbox').fill('T1')
    await page.getByRole('button', { name: 'Go', exact: true }).click()
    await page.getByRole('button', { name: 'Pause' }).click()
    const counter = page.getByText(/^\d+ \/ \d+$/)
    while (!(await counter.textContent())!.startsWith('1 ')) await page.getByRole('button', { name: 'Step backward' }).click()
    await page.getByRole('button', { name: 'Step forward' }).click()
    await expect(view(page, 'Broadcast')).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Step backward' }).click()
    await expect(view(page, 'Topology')).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Step forward' }).click()
    await view(page, 'Topology').click()
    await expect(view(page, 'Broadcast')).toContainText('the current step is here')
  })
})

test.describe('phone', () => {
  test.use({ viewport: { width: 400, height: 900 } })

  for (const slug of SLUGS) {
    test(`${slug}: stacks and never overflows sideways, quiz included`, async ({ page }) => {
      await open(page, slug)
      expect((await documentScroll(page)).scrollWidth).toBe(400)
      await page.getByRole('tab', { name: 'Reasoning' }).click()
      expect((await documentScroll(page)).scrollWidth).toBe(400)
      await page.getByRole('tab', { name: 'Quiz' }).click()
      expect((await documentScroll(page)).scrollWidth).toBe(400)
    })
  }
})
