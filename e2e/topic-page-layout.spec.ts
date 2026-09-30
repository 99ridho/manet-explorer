// SPEC.md §6 and §12: the topic page layout at desktop, tablet, and phone widths.
// Desktop (lg): the page is locked to the viewport; only the Code listing and the active
// materials panel scroll. Tablet (md): Operation and Playback keep their content height beside
// Code. Phone: one column in DOM order, the document scrolls.
import { expect, test, type Locator, type Page } from '@playwright/test'

const LISTING = 'ol[aria-label="Pseudocode"]'
const ACTIVE_PANEL = 'section[aria-label="Course materials"] [role="tabpanel"][data-state="active"]'
const LIVE_FIELDS = '[aria-label="Live fields"]'

function card(page: Page, title: string): Locator {
  return page.locator('[data-slot="card"]', { has: page.locator('[data-slot="card-title"]', { hasText: title }) })
}

async function box(locator: Locator) {
  const b = await locator.boundingBox()
  if (!b) throw new Error('element is not rendered')
  return { top: Math.round(b.y), bottom: Math.round(b.y + b.height), left: Math.round(b.x), height: Math.round(b.height) }
}

function documentScroll(page: Page) {
  return page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollY: window.scrollY,
  }))
}

function overflows(locator: Locator) {
  return locator.evaluate((el) => el.scrollHeight > el.clientHeight)
}

async function openOperation(page: Page, slug: string, operation: RegExp) {
  await page.goto(`/topic/${slug}`)
  await expect(card(page, 'Operation')).toBeVisible()
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: operation }).click()
}

// Runs the selected operation, pauses autoplay, then steps to the last step with the arrow key,
// calling `onStep` after every move.
async function stepThrough(page: Page, onStep: () => Promise<void>) {
  await page.getByRole('button', { name: 'Go', exact: true }).click()
  await expect(page.locator('[aria-current="step"]').first()).toBeVisible()
  await page.keyboard.press(' ')
  const counter = page.getByText(/^\d+ \/ \d+$/)
  let moves = 0
  for (;;) {
    await onStep()
    const [index, total] = (await counter.textContent())!.split('/').map((s) => parseInt(s, 10))
    if (index >= total) break
    await page.keyboard.press('ArrowRight')
    moves++
  }
  return moves
}

async function discover(page: Page) {
  await openOperation(page, 'reactive-routing', /discover route/i)
  await page.getByRole('textbox').fill('S D')
}

test.describe('desktop (lg)', () => {
  test.use({ viewport: { width: 1400, height: 900 } })

  test('the page does not scroll; the listing and the materials panel are the scrollers', async ({ page }) => {
    await discover(page)
    const doc = await documentScroll(page)
    expect(doc.scrollHeight).toBe(doc.clientHeight)
    expect(await page.locator(LISTING).evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto')
    await page.getByRole('tab', { name: 'Core Material' }).click()
    expect(await overflows(page.locator(ACTIVE_PANEL))).toBe(true)
    expect((await documentScroll(page)).scrollHeight).toBe(doc.clientHeight)
  })

  test('scrolling those regions leaves the rest of the layout in place', async ({ page }) => {
    await discover(page)
    const fixed = () =>
      Promise.all([
        box(card(page, 'Operation')),
        box(card(page, 'Playback')),
        box(page.locator('[data-slot="card"]').first()),
        box(page.locator('section[aria-label="Course materials"] [data-slot="tabs-list"]')),
      ])
    await page.getByRole('tab', { name: 'Core Material' }).click()
    const before = await fixed()
    await page.locator(LISTING).evaluate((el) => (el.scrollTop = 500))
    await page.locator(ACTIVE_PANEL).evaluate((el) => (el.scrollTop = 800))
    expect(await fixed()).toEqual(before)
    expect((await documentScroll(page)).scrollY).toBe(0)
  })

  test('the Code card sizes to a short listing instead of filling the column', async ({ page }) => {
    await openOperation(page, 'multihop', /build links/i)
    const code = await box(card(page, 'Code'))
    const listing = await box(page.locator(LISTING))
    const playback = await box(card(page, 'Playback'))
    expect(code.bottom).toBeLessThan(playback.bottom)
    expect(code.bottom - listing.bottom).toBeLessThan(40)
  })

  test('stepping keeps the highlighted line inside the listing without moving the page', async ({ page }) => {
    await openOperation(page, 'multihop', /find bridges/i)
    const moves = await stepThrough(page, async () => {
      const listing = await box(page.locator(LISTING))
      const active = await box(page.locator('[aria-current="step"]').first())
      expect(active.top).toBeGreaterThanOrEqual(listing.top - 1)
      expect(active.bottom).toBeLessThanOrEqual(listing.bottom + 1)
      expect((await documentScroll(page)).scrollY).toBe(0)
    })
    expect(moves).toBeGreaterThan(5)
  })

  test('the listing takes keyboard focus with a visible ring', async ({ page }) => {
    await discover(page)
    const listing = page.locator(LISTING)
    // Reset is the last control of the Operation card, so Tab from it lands on the listing.
    await page.getByRole('button', { name: 'Reset', exact: true }).focus()
    await page.keyboard.press('Tab')
    await expect(listing).toBeFocused()
    const ring = await listing.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(ring).not.toBe('none')
  })

  test('the Protocol tab scrolls in place and marks the per-node state on the canvas', async ({ page }) => {
    await page.goto('/topic/multihop')
    await expect(card(page, 'Operation')).toBeVisible()
    await page.getByRole('tab', { name: 'Protocol' }).click()
    const doc = await documentScroll(page)
    expect(doc.scrollHeight).toBe(doc.clientHeight)
    expect(await page.locator(ACTIVE_PANEL).evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto')
    await expect(page.locator(LIVE_FIELDS)).toContainText('nodes = 6')
    await expect(page.locator('[data-representation="disk"]')).toContainText('on the canvas')
    await page.getByRole('tab', { name: 'Shadowing' }).click()
    await expect(page.locator('[data-representation="shadowing"]')).toContainText('on the canvas')
    await expect(page.locator('[data-representation="disk"]')).not.toContainText('on the canvas')
  })

  test('the live fields follow the step being shown', async ({ page }) => {
    await openOperation(page, 'multihop', /build links/i)
    const chip = page.locator(`${LIVE_FIELDS} [role="listitem"]`).filter({ hasText: /^links = / })
    const before = await chip.textContent()
    await page.getByRole('button', { name: 'Go', exact: true }).click()
    await page.keyboard.press(' ')
    await page.keyboard.press('Home')
    await expect.poll(() => chip.textContent()).not.toBe(before)
  })
})

test.describe('tablet (md)', () => {
  test.use({ viewport: { width: 900, height: 900 } })

  test('Operation and Playback keep their content height beside the Code card', async ({ page }) => {
    await discover(page)
    const operation = await box(card(page, 'Operation'))
    const playback = await box(card(page, 'Playback'))
    const code = await box(card(page, 'Code'))
    expect(operation.left).toBe(playback.left)
    expect(playback.top).toBe(operation.bottom + 16)
    expect(code.bottom).toBeGreaterThanOrEqual(playback.bottom)
  })

  test('a short Code card still stretches to the bottom of Playback', async ({ page }) => {
    await openOperation(page, 'multihop', /link etx/i)
    const playback = await box(card(page, 'Playback'))
    const code = await box(card(page, 'Code'))
    expect(code.bottom).toBe(playback.bottom)
  })
})

test.describe('phone', () => {
  test.use({ viewport: { width: 400, height: 900 } })

  test('stacks in DOM order, scrolls the document, and never overflows sideways', async ({ page }) => {
    await discover(page)
    const doc = await documentScroll(page)
    expect(doc.scrollHeight).toBeGreaterThan(doc.clientHeight)
    expect(doc.scrollWidth).toBe(400)
    const tops = await Promise.all(
      [page.locator('[data-slot="card"]').first(), card(page, 'Operation'), card(page, 'Code'), card(page, 'Playback')].map(
        async (l) => (await box(l)).top,
      ),
    )
    expect([...tops].sort((a, b) => a - b)).toEqual(tops)
    expect(await overflows(page.locator(LISTING))).toBe(false)
  })

  test('stepping does not move the page', async ({ page }) => {
    await openOperation(page, 'multihop', /find bridges/i)
    let baseline: number | null = null
    await stepThrough(page, async () => {
      const { scrollY } = await documentScroll(page)
      baseline ??= scrollY
      expect(scrollY).toBe(baseline)
    })
  })

  test('the Protocol tab fits the width', async ({ page }) => {
    await page.goto('/topic/reactive-routing')
    await expect(card(page, 'Operation')).toBeVisible()
    await page.getByRole('tab', { name: 'Protocol' }).click()
    await expect(page.locator(ACTIVE_PANEL)).toContainText('AODV next-hop table')
    expect((await documentScroll(page)).scrollWidth).toBe(400)
  })

  for (const [slug, operation, input] of [
    ['broadcast', /select mprs/i, 'A'],
    ['geographic-routing', /route/i, 'S D'],
    ['clustering', /elect/i, null],
    ['address-allocation', /merge partition/i, null],
  ] as const) {
    test(`${slug}: a seed run fits the width`, async ({ page }) => {
      await openOperation(page, slug, operation)
      if (input) await page.getByRole('textbox').fill(input)
      await page.getByRole('button', { name: 'Go', exact: true }).click()
      await expect(page.locator('[aria-current="step"]').first()).toBeVisible()
      await page.getByRole('tab', { name: 'Core Material' }).click()
      expect((await documentScroll(page)).scrollWidth).toBe(400)
    })
  }

  test('Core Material renders the book tables as tables that fit the width', async ({ page }) => {
    await page.goto('/topic/reactive-routing')
    await expect(card(page, 'Operation')).toBeVisible()
    await page.getByRole('tab', { name: 'Core Material' }).click()
    const table = page.locator(`${ACTIVE_PANEL} table`).first()
    await expect(table.getByRole('columnheader', { name: 'Proactive' })).toBeVisible()
    await expect(page.locator(ACTIVE_PANEL)).not.toContainText('|---')
    expect((await documentScroll(page)).scrollWidth).toBe(400)
  })
})
