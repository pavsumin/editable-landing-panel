import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const COOKIE_NAME = 'elp-session'
export const SESSION_SECONDS = 60 * 60 * 8

/** @param {string} left @param {string} right */
export function equalSecret(left, right) {
  const hash = (value) =>
    createHmac('sha256', 'elp-constant-time-comparison').update(value).digest()
  return timingSafeEqual(hash(left), hash(right))
}

/** @param {NodeJS.ProcessEnv} env */
export function authSecret(env) {
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 16)
    throw new Error('ADMIN_PASSWORD must contain at least 16 characters')
  return createHmac('sha256', env.ADMIN_PASSWORD)
    .update(env.ADMIN_SESSION_SECRET || 'elp-session-v1')
    .digest()
}

/** @param {NodeJS.ProcessEnv} env @param {number=} now */
export function createSession(env, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(now / 1000) + SESSION_SECONDS,
      nonce: randomBytes(18).toString('base64url'),
    }),
  ).toString('base64url')
  return `${payload}.${createHmac('sha256', authSecret(env)).update(payload).digest('base64url')}`
}

/** @param {string} token @param {NodeJS.ProcessEnv} env @param {number=} now */
export function validSession(token, env, now = Date.now()) {
  try {
    if (token.length > 1024) return false
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra) return false
    const expected = createHmac('sha256', authSecret(env))
      .update(payload)
      .digest('base64url')
    if (!equalSecret(signature, expected)) return false
    const body = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return (
      typeof body.nonce === 'string' &&
      Number.isInteger(body.exp) &&
      body.exp > now / 1000 &&
      body.exp <= now / 1000 + SESSION_SECONDS
    )
  } catch {
    return false
  }
}

/** @param {Request} req @param {NodeJS.ProcessEnv} env */
export function sessionFromRequest(req, env) {
  const token =
    req.headers
      .get('cookie')
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${COOKIE_NAME}=`))
      ?.slice(COOKIE_NAME.length + 1) || ''
  return validSession(token, env)
}

/** @param {Request} req @param {NodeJS.ProcessEnv} env */
export function assertOrigin(req, env) {
  if (env.NODE_ENV === 'production' && !env.PANEL_SITE_URL)
    throw new HttpError(503, 'PANEL_SITE_URL is required in production')
  const expected = env.PANEL_SITE_URL
    ? new URL(env.PANEL_SITE_URL).origin
    : new URL(req.url).origin
  if (req.headers.get('origin') !== expected)
    throw new HttpError(403, 'Origin not allowed')
  const site = req.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin' && site !== 'none')
    throw new HttpError(403, 'Cross-site request rejected')
}

export class HttpError extends Error {
  /** @param {number} status @param {string} message */
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/** @param {Request} req @param {number=} maxBytes @returns {Promise<unknown>} */
export async function readJson(req, maxBytes = 128000) {
  if (
    !req.headers
      .get('content-type')
      ?.toLowerCase()
      .startsWith('application/json')
  )
    throw new HttpError(415, 'Expected application/json')
  const reader = req.body?.getReader()
  if (!reader) throw new HttpError(400, 'Missing request body')
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        throw new HttpError(413, 'Request too large')
      }
      chunks.push(Buffer.from(value))
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      throw new HttpError(400, 'Invalid JSON')
    }
  } finally {
    reader.releaseLock()
  }
}
