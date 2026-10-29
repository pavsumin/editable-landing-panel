import { test, expect, type Page, type FrameLocator } from '@playwright/test'

async function expectTheme(
  target: Page | FrameLocator,
  background: string,
  scheme: string,
) {
  for (const selector of ['html', 'body']) {
    await expect(target.locator(selector)).toHaveCSS(
      'background-color',
      background,
    )
    await expect(target.locator(selector)).toHaveCSS('color-scheme', scheme)
  }
  const expected =
    background === 'rgb(255, 255, 255)'
      ? '#ffffff'
      : background === 'rgb(23, 23, 23)'
        ? '#171717'
        : '#0a0a0a'
  await expect
    .poll(async () =>
      target
        .locator('meta[name="theme-color"]')
        .evaluateAll(
          (metas, expected) =>
            metas.length > 0 &&
            metas.every(
              (meta) =>
                meta.getAttribute('content') === expected &&
                !meta.hasAttribute('media'),
            ),
          expected,
        ),
    )
    .toBe(true)
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (
      window.self !== window.top ||
      localStorage.getItem('edit-cookie-consent-v1')
    )
      return
    localStorage.setItem(
      'edit-cookie-consent-v1',
      JSON.stringify({
        choice: 'rejected',
        at: Date.now(),
        gaId: 'G-TEST12345',
      }),
    )
  })
})

test('manual theme overrides system colors, survives navigation and repairs replaced metadata', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/docs')
  await expectTheme(page, 'rgb(10, 10, 10)', 'dark')
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await page.evaluate(() => {
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.remove())
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#000000'
    meta.media = '(prefers-color-scheme: dark)'
    document.head.appendChild(meta)
  })
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await page.reload()
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await page.getByRole('link', { name: 'Edit. Home' }).click()
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await page.emulateMedia({ colorScheme: 'light' })
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
})

test('system preferences and cross-tab choices update the body as well as controls', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/about')
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectTheme(page, 'rgb(10, 10, 10)', 'dark')
  const tab = await context.newPage()
  await tab.goto('/contact')
  await tab.evaluate(() => localStorage.setItem('edit-theme', 'light'))
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await tab.close()
})

test('editor and its preview synchronize light/dark browser backgrounds, including login', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/admin')
  await expect(page.getByLabel('Admin password')).toBeVisible()
  await expectTheme(page, 'rgb(23, 23, 23)', 'dark')
  await page
    .getByLabel('Admin password')
    .fill('browser-test-password-very-strong')
  await page.getByRole('button', { name: 'Enter', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Toggle editor theme' }),
  ).toBeVisible()
  await expectTheme(page.frameLocator('iframe'), 'rgb(10, 10, 10)', 'dark')
  await page.getByRole('button', { name: 'Toggle editor theme' }).click()
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await expectTheme(page.frameLocator('iframe'), 'rgb(255, 255, 255)', 'light')
  await page.getByRole('button', { name: 'Toggle editor theme' }).click()
  await expectTheme(page, 'rgb(23, 23, 23)', 'dark')
  await expectTheme(page.frameLocator('iframe'), 'rgb(10, 10, 10)', 'dark')
  await page.reload()
  await expectTheme(page, 'rgb(23, 23, 23)', 'dark')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByLabel('Admin password')).toBeVisible()
  await expectTheme(page, 'rgb(23, 23, 23)', 'dark')
})

test('embedded demo follows the host without imposing editor background colors', async ({
  page,
}) => {
  await page.goto('/demo')
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectTheme(page, 'rgb(10, 10, 10)', 'dark')
  await expect(page.locator('[data-theme="dark"]')).toBeVisible()
  await page.emulateMedia({ colorScheme: 'light' })
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await expect(page.locator('[data-theme="light"]')).toBeVisible()
})

test('manual theme still works when persistent storage is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError')
      },
    }),
  )
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/docs')
  await expectTheme(page, 'rgb(10, 10, 10)', 'dark')
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
  await page.getByRole('link', { name: 'Edit. Home' }).click()
  await expectTheme(page, 'rgb(255, 255, 255)', 'light')
})
