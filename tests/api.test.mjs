import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'
import * as crypto from 'node:crypto'
import * as net from 'node:net'
import sharp from 'sharp'
import * as security from '../panel/security.mjs'
import * as schema from '../panel/schema.mjs'
import * as assistance from '../panel/assistance.mjs'
const panelConfig = JSON.parse(
  await readFile(new URL('../editable-panel.config.json', import.meta.url)),
)

async function load(path, imports, env) {
  const exports = {}
  const code = ts.transpileModule(
    await readFile(new URL('../' + path, import.meta.url), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    },
  ).outputText
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (!(name in imports)) throw new Error('Unexpected import ' + name)
      return imports[name]
    },
    process: { env },
    Request,
    Response,
    File,
    Buffer,
    AbortSignal,
    URL,
    console,
  })
  return exports
}
async function fixture(overrides = {}) {
  const env = {
    ADMIN_PASSWORD: 'test-password-with-enough-entropy',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-test-key',
    SUPABASE_SERVICE_ROLE_KEY: 'server-test-key',
    NODE_ENV: 'production',
    PANEL_SITE_URL: 'https://example.com',
    ...overrides,
  }
  const writes = [],
    uploads = []
  const state = { allowed: true, fail: false, generations: 0, reservations: 0 }
  const db = {
    rpc: async () => {
      state.reservations++
      return {
        data: state.allowed,
        error: state.fail ? new Error('offline') : null,
      }
    },
    from: () => ({
      select: () => ({ in: async () => ({ data: [], error: null }) }),
      upsert: async (rows) => {
        writes.push(rows)
        return { error: state.fail ? new Error('offline') : null }
      },
      delete: () => ({
        eq: async (_, key) => {
          writes.push({ deleted: key })
          return { error: null }
        },
      }),
    }),
    storage: {
      from: () => ({
        upload: async (name, bytes, opts) => {
          uploads.push({ name, bytes, opts })
          return { error: null }
        },
        getPublicUrl: (name) => ({
          data: { publicUrl: 'https://example.invalid/' + name },
        }),
      }),
    },
  }
  const imports = {
    'server-only': {},
    '@supabase/supabase-js': { createClient: () => db },
    './config': { panelConfig },
    './schema.mjs': schema,
    './security.mjs': security,
  }
  const server = await load('panel/server.ts', imports, env)
  const routeImports = {
    '@/panel/server': server,
    '@/panel/config': { panelConfig },
    '@/panel/schema.mjs': schema,
    '@/panel/security.mjs': security,
    'node:crypto': crypto,
    'node:net': net,
    '@/panel/assistance.mjs': {
      ...assistance,
      generateCopy: async () => {
        state.generations++
        return { 'home.title': 'Generated' }
      },
    },
    sharp,
  }
  const routes = {}
  for (const name of ['session', 'content', 'upload', 'assist'])
    routes[name] = await load(
      `app/api/editable-panel/${name}/route.ts`,
      routeImports,
      env,
    )
  const cookie = env.ADMIN_PASSWORD
    ? `${security.COOKIE_NAME}=${security.createSession(env)}`
    : ''
  const request = (path, method = 'POST', body = {}, headers = {}) =>
    new Request(`https://example.com/api/editable-panel/${path}`, {
      method,
      headers: {
        origin: 'https://example.com',
        cookie,
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(method === 'GET' ? {} : { body: JSON.stringify(body) }),
    })
  return { routes, writes, uploads, state, env, request }
}

test('session issues secure cookie; malformed, wrong-origin and wrong-password requests are denied', async () => {
  const { routes, env, request, state } = await fixture()
  const result = await routes.session.POST(
    request('session', 'POST', { password: env.ADMIN_PASSWORD }),
  )
  assert.equal(result.status, 200)
  for (const attribute of [
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/api/editable-panel',
  ])
    assert.ok(result.headers.get('set-cookie').includes(attribute))
  assert.equal(
    (await routes.session.POST(request('session', 'POST', {}))).status,
    400,
  )
  assert.equal(
    (
      await routes.session.POST(
        request('session', 'POST', { password: 'wrong' }),
      )
    ).status,
    401,
  )
  assert.equal(
    (
      await routes.session.POST(
        request(
          'session',
          'POST',
          { password: env.ADMIN_PASSWORD },
          { origin: 'https://evil.example' },
        ),
      )
    ).status,
    403,
  )
  state.allowed = false
  assert.equal(
    (
      await routes.session.POST(
        request('session', 'POST', { password: env.ADMIN_PASSWORD }),
      )
    ).status,
    429,
  )
  state.fail = true
  assert.equal(
    (
      await routes.session.POST(
        request('session', 'POST', { password: env.ADMIN_PASSWORD }),
      )
    ).status,
    503,
  )
})

test('login fails closed with missing password; logout clears scoped cookie', async () => {
  const { routes, request } = await fixture()
  assert.match(
    (await routes.session.DELETE(request('session', 'DELETE'))).headers.get(
      'set-cookie',
    ),
    /Max-Age=0/,
  )
  const missing = await fixture({ ADMIN_PASSWORD: undefined })
  assert.equal(
    (await missing.routes.session.POST(missing.request('session', 'POST', {})))
      .status,
    503,
  )
})

test('content denies unauthenticated/cross-origin writes and validates a whole batch before one upsert', async () => {
  const { routes, request, writes } = await fixture()
  assert.equal(
    (
      await routes.content.POST(
        request(
          'content',
          'POST',
          { values: { hero_title: 'new' } },
          { cookie: '' },
        ),
      )
    ).status,
    401,
  )
  assert.equal(
    (
      await routes.content.POST(
        request(
          'content',
          'POST',
          { values: { hero_title: 'new' } },
          { origin: 'https://evil.example' },
        ),
      )
    ).status,
    403,
  )
  for (const values of [
    { hero_title: null },
    { unknown: 'x' },
    { hero_title: 'valid', unknown: 'invalid' },
  ])
    assert.equal(
      (await routes.content.POST(request('content', 'POST', { values })))
        .status,
      400,
    )
  assert.equal(writes.length, 0)
  assert.equal(
    (
      await routes.content.POST(
        request('content', 'POST', {
          values: { hero_title: 'New', hero_subtitle: 'Subtitle' },
        }),
      )
    ).status,
    200,
  )
  assert.equal(writes.length, 1)
  assert.equal(writes[0].length, 2)
  assert.equal(
    (await routes.content.GET(request('content', 'GET', null, { cookie: '' })))
      .status,
    401,
  )
  assert.equal(
    (
      await routes.content.DELETE(
        request('content', 'DELETE', { key: 'unknown' }),
      )
    ).status,
    400,
  )
  assert.equal(
    (
      await routes.content.DELETE(
        request('content', 'DELETE', { key: 'hero_title' }),
      )
    ).status,
    200,
  )
})

test('upload decodes bytes, strips metadata and emits a bounded WebP with an opaque filename', async () => {
  const { routes, uploads, env } = await fixture()
  const make = async (bytes, name, type) => {
    const body = new FormData()
    body.set('file', new File([bytes], name, { type }))
    return routes.upload.POST(
      new Request('https://example.com/api/editable-panel/upload', {
        method: 'POST',
        headers: {
          origin: 'https://example.com',
          cookie: `${security.COOKIE_NAME}=${security.createSession(env)}`,
          ...(bytes.length > 5 * 1024 * 1024
            ? { 'content-length': String(bytes.length + 1000) }
            : {}),
        },
        body,
      }),
    )
  }
  assert.equal(
    (await make(Buffer.from('<svg></svg>'), 'picture.png', 'image/png')).status,
    400,
  )
  assert.equal(
    (await make(Buffer.alloc(6 * 1024 * 1024), 'large.png', 'image/png'))
      .status,
    413,
  )
  const png = await sharp({
    create: { width: 20, height: 10, channels: 3, background: '#ff0000' },
  })
    .png()
    .toBuffer()
  assert.equal(
    (await make(png, '../../untrusted.jpg', 'text/plain')).status,
    200,
  )
  assert.equal(uploads.length, 1)
  assert.match(uploads[0].name, /^panel\/[a-f0-9-]+\.webp$/)
  assert.equal((await sharp(uploads[0].bytes).metadata()).format, 'webp')
})

test('shared AI fails closed unless enabled, budgeted and behind trusted IP ingress', async () => {
  const input = {
    brief: 'A useful heading',
    fields: [
      {
        key: 'home.title',
        label: 'Title',
        type: 'text',
        default: 'Hello',
        maxLength: 100,
      },
    ],
  }
  const disabled = await fixture()
  assert.equal(
    (
      await disabled.routes.assist.POST(
        disabled.request('assist', 'POST', input),
      )
    ).status,
    503,
  )
  const active = await fixture({
    PANEL_AI_ENABLED: 'true',
    GEMINI_API_KEY: 'server-only-key',
    PANEL_AI_RATE_SECRET: 'test-rate-secret-at-least-thirty-two-characters',
    VERCEL: '1',
  })
  assert.equal(
    (await active.routes.assist.POST(active.request('assist', 'POST', input)))
      .status,
    503,
  )
  const headers = { 'x-vercel-forwarded-for': '203.0.113.7' }
  assert.equal(
    (
      await active.routes.assist.POST(
        active.request('assist', 'POST', { brief: '', fields: [] }, headers),
      )
    ).status,
    400,
  )
  assert.equal(active.state.reservations, 0)
  const result = await active.routes.assist.POST(
    active.request('assist', 'POST', input, headers),
  )
  assert.equal(result.status, 200)
  const text = await result.text()
  assert.equal(text.includes('server-only-key'), false)
  assert.equal(active.state.generations, 1)
  active.state.allowed = false
  assert.equal(
    (
      await active.routes.assist.POST(
        active.request('assist', 'POST', input, headers),
      )
    ).status,
    429,
  )
  assert.equal(active.state.generations, 1)
  active.state.fail = true
  assert.equal(
    (
      await active.routes.assist.POST(
        active.request('assist', 'POST', input, headers),
      )
    ).status,
    503,
  )
  assert.equal(
    (
      await active.routes.assist.POST(
        active.request('assist', 'POST', input, {
          ...headers,
          origin: 'https://evil.example',
        }),
      )
    ).status,
    403,
  )
})
