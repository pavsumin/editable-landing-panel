import { test, expect } from '@playwright/test'

const storageKey = 'edit-cookie-consent-v1'
const google =
  /https:\/\/[^/]*(?:googletagmanager\.com|google-analytics\.com)\//

test('analytics needs consent; rejection persists and consent can be withdrawn', async ({
  page,
}) => {
  const requests: string[] = []
  await page.route(google, async (route) => {
    requests.push(route.request().url())
    await route.fulfill({
      contentType: 'application/javascript',
      body: 'document.cookie="_ga=test-cookie; Path=/"; document.cookie="_ga_TEST12345=test-property; Path=/";',
    })
  })
  await page.goto('/privacy')
  const banner = page.getByRole('region', {
    name: 'Your privacy. Your choice.',
  })
  await expect(banner).toBeVisible()
  expect(requests).toHaveLength(0)
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0)
  await banner.getByRole('button', { name: 'Reject analytics' }).click()
  await page.reload()
  await expect(banner).toHaveCount(0)
  expect(requests).toHaveLength(0)
  await page.getByRole('button', { name: 'Cookie settings' }).first().click()
  await banner.getByRole('button', { name: 'Accept analytics' }).click()
  await expect.poll(() => requests.length).toBe(1)
  await expect
    .poll(async () =>
      (await page.context().cookies()).some((cookie) => cookie.name === '_ga'),
    )
    .toBe(true)
  await page.reload()
  await expect.poll(() => requests.length).toBe(2)
  await page.getByRole('button', { name: 'Cookie settings' }).first().click()
  await Promise.all([
    page.waitForEvent('load'),
    banner.getByRole('button', { name: 'Reject analytics' }).click(),
  ])
  await expect(banner).toHaveCount(0)
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0)
  expect(
    (await page.context().cookies()).some((cookie) => /^_ga/.test(cookie.name)),
  ).toBe(false)
  expect(requests).toHaveLength(2)
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).choice,
        storageKey,
      ),
    )
    .toBe('rejected')
})

test('expired preferences request consent again and admin/preview do not initialize analytics', async ({
  page,
}) => {
  const requests: string[] = []
  await page.route(google, async (route) => {
    requests.push(route.request().url())
    await route.fulfill({ body: '' })
  })
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          choice: 'accepted',
          at: Date.now() - 200 * 86400000,
          gaId: 'G-TEST12345',
        }),
      ),
    storageKey,
  )
  await page.goto('/privacy')
  await expect(
    page.getByRole('region', { name: 'Your privacy. Your choice.' }),
  ).toBeVisible()
  expect(requests).toHaveLength(0)
  await page.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          choice: 'accepted',
          at: Date.now(),
          gaId: 'G-TEST12345',
        }),
      ),
    storageKey,
  )
  await page.goto('/admin')
  await expect(page.getByLabel('Admin password')).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Your privacy. Your choice.' }),
  ).toHaveCount(0)
  await page.goto('/about?preview=true')
  await expect(
    page.getByRole('region', { name: 'Your privacy. Your choice.' }),
  ).toHaveCount(0)
  expect(requests).toHaveLength(0)
})

test('unavailable storage keeps analytics blocked until an explicit choice', async ({
  page,
}) => {
  const requests: string[] = []
  await page.route(google, async (route) => {
    requests.push(route.request().url())
    await route.fulfill({ body: '' })
  })
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError')
      },
    }),
  )
  await page.goto('/privacy')
  const banner = page.getByRole('region', {
    name: 'Your privacy. Your choice.',
  })
  await expect(banner).toBeVisible()
  expect(requests).toHaveLength(0)
  await banner.getByRole('button', { name: 'Accept analytics' }).click()
  await expect.poll(() => requests.length).toBe(1)
  await page.reload()
  await expect(banner).toBeVisible()
  expect(requests).toHaveLength(1)
})
