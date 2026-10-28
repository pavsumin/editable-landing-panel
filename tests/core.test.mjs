import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  validateConfig,
  validateValues,
  mergeContent,
  fieldsFor,
} from '../panel/schema.mjs'
import {
  authSecret,
  createSession,
  validSession,
  sessionFromRequest,
  assertOrigin,
  readJson,
  COOKIE_NAME,
} from '../panel/security.mjs'

const config = JSON.parse(
  await readFile(new URL('../editable-panel.config.json', import.meta.url)),
)
const env = { ADMIN_PASSWORD: 'a-strong-test-password-at-least-16' }

test('all configured pages validate and preserve legacy home keys', () => {
  validateConfig(config)
  assert.deepEqual(
    config.pages.map((page) => page.id),
    ['home', 'about', 'contact', 'docs', 'global'],
  )
  assert.ok(
    fieldsFor(config, 'home').some((field) => field.key === 'hero_title'),
  )
  assert.ok(
    fieldsFor(config, 'contact').some((field) => field.key === 'global.footer'),
  )
  assert.throws(() => fieldsFor(config, 'does-not-exist'))
})

test('schema rejects collisions and unsafe defaults', () => {
  const duplicate = structuredClone(config)
  duplicate.pages[1].sections[0].fields[0].key = 'hero_title'
  assert.throws(() => validateConfig(duplicate), /duplicate/)
  const unsafe = structuredClone(config)
  unsafe.pages[0].path = '//evil.example'
  assert.throws(() => validateConfig(unsafe))
})

test('batch validation rejects arbitrary keys, non-strings, oversize and executable URLs', () => {
  for (const input of [
    null,
    [],
    {},
    { unknown: 'x' },
    { hero_title: null },
    { hero_title: {} },
    { hero_title: 'x'.repeat(5001) },
    { hero_title: '\0' },
    { 'contact.link': 'javascript:alert(1)' },
    { hero_image_light: '//evil.example/a.png' },
    { hero_image_light: '/a.svg' },
  ])
    assert.throws(() => validateValues(config, input))
  assert.deepEqual(validateValues(config, { hero_title: '' }), {
    hero_title: '',
  })
  assert.doesNotThrow(() =>
    validateValues(config, { 'contact.link': 'https://example.com/path' }),
  )
})

test('merging retains empty strings and ignores unknown or invalid stored values', () => {
  const values = mergeContent(
    config,
    [
      { key: 'hero_title', value: '' },
      { key: 'hero_subtitle', value: null },
      { key: 'unknown', value: 'secret' },
    ],
    'home',
  )
  assert.equal(values.hero_title, '')
  assert.equal(typeof values.hero_subtitle, 'string')
  assert.equal(values.unknown, undefined)
  assert.equal(values['about.title'], undefined)
})

test('sessions expire, resist tampering and are revoked by password rotation', () => {
  const now = 1800000000000
  const token = createSession(env, now)
  assert.equal(validSession(token, env, now + 1000), true)
  assert.equal(validSession(token + 'x', env, now), false)
  assert.equal(
    validSession(
      token,
      { ADMIN_PASSWORD: env.ADMIN_PASSWORD + 'rotated' },
      now,
    ),
    false,
  )
  assert.equal(validSession(token, env, now + 9 * 3600000), false)
  assert.equal(validSession('malformed', env, now), false)
  assert.throws(() => authSecret({}))
  assert.throws(() => authSecret({ ADMIN_PASSWORD: 'short' }))
  const actualToken = createSession(env)
  assert.equal(
    sessionFromRequest(
      new Request('https://example.com', {
        headers: { cookie: `other=one; ${COOKIE_NAME}=${actualToken}` },
      }),
      env,
    ),
    true,
  )
})

test('origin checks reject absent, cross-site and forged deployment origins', () => {
  const make = (headers) =>
    new Request('https://internal.invalid/api', { headers })
  const configured = { PANEL_SITE_URL: 'https://example.com' }
  assert.doesNotThrow(() =>
    assertOrigin(make({ origin: 'https://example.com' }), configured),
  )
  for (const headers of [
    {},
    { origin: 'https://evil.example' },
    { origin: 'https://example.com', 'sec-fetch-site': 'cross-site' },
  ])
    assert.throws(() => assertOrigin(make(headers), configured))
})

test('JSON parsing bounds actual bytes and rejects malformed content', async () => {
  const request = (body, type = 'application/json') =>
    new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': type },
      body,
    })
  assert.deepEqual(await readJson(request('{"hello":true}')), { hello: true })
  await assert.rejects(
    readJson(request('{broken')),
    (error) => error.status === 400,
  )
  await assert.rejects(
    readJson(request('{}', 'text/plain')),
    (error) => error.status === 415,
  )
  await assert.rejects(
    readJson(request('"' + 'x'.repeat(5000) + '"'), 100),
    (error) => error.status === 413,
  )
})
