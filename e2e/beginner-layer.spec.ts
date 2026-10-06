// SPEC.md §20: the Start here page, the Scenario tab, the Why line, and the glossary, at desktop and phone widths.
import { expect, test, type Page } from '@playwright/test'

const ACTIVE_PANEL = 'section[aria-label="Course materials"] [role="tabpanel"][data-state="active"]'
// The Code card's narration box; Playback has its own live region.
const NARRATION = '[aria-live="polite"]:has(> p)'
const CAST = "dd:text-is('volunteer at the riverbank')"

async function runAndPause(page: Page, input: string) {
  await page.getByRole('textbox').fill(input)
  await page.getByRole('button', { name: 'Go', exact: true }).click()
  await expect(page.locator('[aria-current="step"]').first()).toBeVisible()
  await page.keyboard.press(' ')
}

for (const width of [1400, 400]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } })

    test('a topic with a story opens on its Scenario tab and names who is who', async ({ page }) => {
      await page.goto('/topic/reactive-routing')
      await expect(page.getByRole('tab', { name: 'Scenario' })).toHaveAttribute('data-state', 'active')
      await expect(page.locator(ACTIVE_PANEL)).toContainText('Illustrative scenario')
      await expect(page.locator(CAST)).toBeVisible()
      for (const tab of await page.getByRole('tab').all()) {
        const b = (await tab.boundingBox())!
        expect(b.x + b.width).toBeLessThanOrEqual(width)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    })

    test('every step shows a Why line, and a term opens its definition from the keyboard', async ({ page }) => {
      await page.goto('/topic/reactive-routing')
      await runAndPause(page, 'S D')
      const narration = page.locator(NARRATION)
      await expect(narration).toContainText('Why:')
      await page.keyboard.press('ArrowRight')
      await expect(narration).toContainText('Why:')
      const term = narration.getByRole('button', { name: /RREQ: show what it means/ })
      await term.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('dialog')).toContainText('Route request')
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toHaveCount(0)
    })

    test('Randomize says the story roles no longer apply, and Reset brings them back', async ({ page }) => {
      await page.goto('/topic/reactive-routing')
      await page.getByRole('button', { name: 'Randomize' }).click()
      await expect(page.getByText('Random network: the story roles do not apply here.')).toBeVisible()
      await page.getByRole('button', { name: 'Reset' }).click()
      await expect(page.locator(CAST)).toBeVisible()
    })

    test('Start here runs the walkthrough and fits the width', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: 'Read Start here first' }).click()
      await expect(page.getByRole('heading', { name: 'Start here', level: 1 })).toBeVisible()
      await runAndPause(page, 'A D')
      await expect(page.locator(NARRATION)).toContainText('out of range')
      await expect(page.locator(NARRATION)).toContainText('Why:')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    })
  })
}
