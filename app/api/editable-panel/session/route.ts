import {
  authSecret,
  createSession,
  equalSecret,
  readJson,
  sessionFromRequest,
  COOKIE_NAME,
  SESSION_SECONDS,
  assertOrigin,
  HttpError,
} from '@/panel/security.mjs'
import { database, failure, json } from '@/panel/server'
import { createHmac } from 'node:crypto'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  return json({ authenticated: sessionFromRequest(req, process.env) })
}

export async function POST(req: Request) {
  try {
    assertOrigin(req, process.env)
    const secret = authSecret(process.env)
    const input = (await readJson(req, 2048)) as { password?: unknown }
    if (typeof input?.password !== 'string' || input.password.length > 512)
      throw new HttpError(400, 'Invalid password')
    const ip =
      process.env.PANEL_TRUST_PROXY === 'true'
        ? req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
        : 'shared'
    const bucket = createHmac('sha256', secret).update(ip).digest('hex')
    const { data: allowed, error } = await database(true).rpc(
      'elp_consume_login_attempt',
      { bucket_key: bucket },
    )
    if (error)
      throw new HttpError(
        503,
        'Login protection unavailable. Apply the database migration.',
      )
    if (!allowed)
      return json(
        { error: 'Too many attempts. Try again in 15 minutes.' },
        429,
        { 'Retry-After': '900' },
      )
    if (!equalSecret(input.password, process.env.ADMIN_PASSWORD!))
      throw new HttpError(401, 'Wrong password')
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    return json({ authenticated: true }, 200, {
      'Set-Cookie': `${COOKIE_NAME}=${createSession(process.env)}; HttpOnly; SameSite=Strict; Path=/api/editable-panel; Max-Age=${SESSION_SECONDS}${secure}`,
    })
  } catch (error) {
    return failure(error)
  }
}

export async function DELETE(req: Request) {
  try {
    assertOrigin(req, process.env)
    return json({ authenticated: false }, 200, {
      'Set-Cookie': `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/api/editable-panel; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    })
  } catch (error) {
    return failure(error)
  }
}
