import { test, expect } from '@playwright/test'

test('demo edits preview locally and reload restores defaults', async ({
  page,
}) => {
  await page.goto('/demo')
  await page.getByLabel('Headline', { exact: true }).fill('A local preview')
  await expect(
    page.getByRole('heading', { name: 'A local preview' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('status')).toContainText('demo only')
  await page.reload()
  await expect(page.getByLabel('Headline', { exact: true })).toHaveValue(
    'Your next idea deserves a great website.',
  )
})

test('authenticated editor previews drafts, preserves failed saves and switches pages safely', async ({
  page,
}) => {
  await page.goto('/admin')
  await page
    .getByLabel('Admin password')
    .fill('browser-test-password-very-strong')
  await page.getByRole('button', { name: 'Sign in →' }).click()
  const title = page.getByLabel('Hero Title', { exact: true })
  await expect(title).toBeEnabled()
  // The first iframe route may require a cold Next.js dev compilation.
  await expect(
    page
      .frameLocator('iframe')
      .getByRole('heading', {
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
  await page.getByLabel('PAGE', { exact: true }).selectOption('about')
  await expect(page).toHaveURL(/page=about/)
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
  await page
    .getByLabel('Search documentation')
    .fill('orphaned uploads manually')
  await expect(page.locator('main section')).toHaveCount(1)
  await expect(
    page.getByRole('heading', { name: 'Troubleshooting and verification' }),
  ).toBeVisible()
})
