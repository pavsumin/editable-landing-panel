import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.self !== window.top) return
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

test('demo edits preview locally and reload restores defaults', async ({
  page,
}) => {
  await page.goto('/demo')
  await page.getByRole('button', { name: 'Edit Headline', exact: true }).click()
  await page.getByLabel('Headline', { exact: true }).fill('A local preview')
  await expect(
    page.getByRole('heading', { name: 'A local preview' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('demo only')
  await page.reload()
  await page.getByRole('button', { name: 'Edit Headline', exact: true }).click()
  await expect(page.getByLabel('Headline', { exact: true })).toHaveValue(
    'Build fast. Edit instantly.',
  )
})

test('authenticated editor previews drafts, preserves failed saves and switches pages safely', async ({
  page,
}, testInfo) => {
  await page.goto('/admin')
  await page
    .getByLabel('Admin password')
    .fill('browser-test-password-very-strong')
  await page.getByRole('button', { name: 'Enter' }).click()
  await page
    .getByRole('button', { name: 'Edit Hero Title', exact: true })
    .click()
  const title = page.getByLabel('Hero Title', { exact: true })
  await expect(title).toBeEnabled()
  // The first iframe route may require a cold Next.js dev compilation.
  await expect(
    page.frameLocator('iframe').getByRole('heading', {
      name: 'Developers build. Clients edit.',
      exact: true,
    }),
  ).toBeVisible({ timeout: 20000 })
  await title.fill('A draft that must survive')
  await expect(
    page
      .frameLocator('iframe')
      .getByRole('heading', { name: 'A draft that must survive', exact: true }),
  ).toBeVisible()
  await page.route('**/api/editable-panel/content', async (route) => {
    if (route.request().method() === 'POST')
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"error":"Simulated database outage"}',
      })
    else await route.continue()
  })
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'Simulated database outage' }),
  ).toBeVisible()
  await expect(title).toHaveValue('A draft that must survive')
  await page.unroute('**/api/editable-panel/content')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('status')).toContainText('All changes saved')
  await page.screenshot({ path: testInfo.outputPath('admin-desktop.png') })
  await page.getByRole('button', { name: 'Toggle editor theme' }).click()
  await expect(page.frameLocator('iframe').locator('html')).toHaveClass(/dark/)
  await page.screenshot({ path: testInfo.outputPath('admin-dark.png') })
  await page.getByRole('button', { name: 'Toggle editor theme' }).click()

  await page.getByLabel('PAGE', { exact: true }).selectOption('about')
  await expect(page).toHaveURL(/page=about/)
  await page.getByRole('button', { name: 'Edit Title', exact: true }).click()
  await page.getByLabel('Title', { exact: true }).fill('Updated about page')
  await expect(
    page
      .frameLocator('iframe')
      .getByRole('heading', { name: 'Updated about page' }),
  ).toBeVisible()
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByLabel('PAGE', { exact: true }).selectOption('contact')
  await expect(page.getByLabel('PAGE', { exact: true })).toHaveValue('about')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Discard', exact: true }).click()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByLabel('Admin password')).toBeVisible()
  const cookies = await page.context().cookies()
  expect(cookies.some((cookie) => cookie.name === 'elp-session')).toBe(false)
})

test('mobile editor and documentation full-text search work', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/demo')
  await page.getByRole('button', { name: 'Edit Headline', exact: true }).click()
  await page.getByLabel('Headline', { exact: true }).fill('Mobile draft')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Mobile draft' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await expect(page.getByLabel('Headline', { exact: true })).toHaveValue(
    'Mobile draft',
  )
  await page.getByRole('button', { name: 'Save changes' }).click()
  await page.goto('/docs')
  await page.getByRole('button', { name: 'Search documentation' }).click()
  await page
    .getByRole('searchbox', { name: 'Search documentation' })
    .fill('orphaned uploads manually')
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Troubleshooting and verification/ })
    .click()
  await expect(page).toHaveURL(/#operations/)
  await expect(
    page.getByRole('heading', { name: 'Troubleshooting and verification' }),
  ).toBeVisible()
})

test('restored desktop layout and keyboard documentation search', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/demo')
  const preview = page.locator('aside').first()
  const field = page.getByRole('button', { name: 'Edit Headline', exact: true })
  const previewBounds = await preview.boundingBox()
  const fieldBounds = await field.boundingBox()
  expect(previewBounds!.x).toBeLessThan(fieldBounds!.x)
  await page.screenshot({ path: testInfo.outputPath('demo-desktop.png') })
  await page.goto('/docs')
  await expect(
    page.getByRole('complementary', { name: 'Documentation sidebar' }),
  ).toBeVisible()
  await page.keyboard.press('Control+k')
  await page
    .getByRole('searchbox', { name: 'Search documentation' })
    .fill('GEMINI_API_KEY')
  await expect(
    page
      .getByRole('dialog')
      .getByRole('button', { name: /Switch to your own free-tier Gemini key/ }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('docs-desktop.png') })
})

test('mobile documentation drawer, privacy and styled 404', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs')
  await page.getByRole('button', { name: 'Open sidebar' }).click()
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'HTTP API reference' })
    .click()
  await expect(page).toHaveURL(/#api/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto('/privacy')
  await expect(
    page.getByRole('heading', { name: 'Privacy & cookies.' }),
  ).toBeVisible()
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390)
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: /Great ideas./ }),
  ).toBeVisible()
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390)
  await page.screenshot({
    path: testInfo.outputPath('404-mobile.png'),
    fullPage: true,
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: testInfo.outputPath('404-desktop.png') })
  await page.getByRole('link', { name: 'Back to home' }).click()
  await expect(page).toHaveURL('/')
})

test('image dialog retains validation errors and supports local image upload', async ({
  page,
}) => {
  await page.goto('/demo')
  await page.getByRole('button', { name: 'Edit Image', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Upload image' })
  await dialog.getByLabel('Image', { exact: true }).setInputFiles({
    name: 'unsupported.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  })
  await dialog.getByRole('button', { name: 'Use image' }).click()
  await expect(dialog.getByRole('alert')).toContainText(
    'Choose a JPEG, PNG, WebP or AVIF image',
  )
  await dialog
    .getByLabel('Image', { exact: true })
    .setInputFiles('public/demo-placeholder.webp')
  await dialog.getByRole('button', { name: 'Use image' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('status')).toContainText(
    'Demo image updated locally',
  )
})
