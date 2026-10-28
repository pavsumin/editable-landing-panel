import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import {
  validateAssistance,
  generateCopy,
  DEFAULT_GEMINI_MODEL,
} from '@/panel/assistance.mjs'
import { HttpError, readJson } from '@/panel/security.mjs'
import { database, failure, json } from '@/panel/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    if (process.env.PANEL_AI_ENABLED !== 'true')
      throw new HttpError(
        503,
        'Shared AI is not enabled. Use your own GEMINI_API_KEY locally.',
      )
    if (
      !process.env.GEMINI_API_KEY ||
      !process.env.PANEL_AI_RATE_SECRET ||
      process.env.PANEL_AI_RATE_SECRET.length < 32
    )
      throw new HttpError(
        503,
        'Shared AI is not configured. Use your own GEMINI_API_KEY locally.',
      )
    // CLI requests have no Origin. Browser requests must still come from the configured site.
    const origin = req.headers.get('origin')
    if (
      origin &&
      (!process.env.PANEL_SITE_URL ||
        origin !== new URL(process.env.PANEL_SITE_URL).origin)
    )
      throw new HttpError(403, 'Origin not allowed')
    const raw = await readJson(req, 64000)
    let input: ReturnType<typeof validateAssistance>
    try {
      input = validateAssistance(raw)
    } catch (error) {
      throw new HttpError(400, (error as Error).message)
    }
    // Trust only Vercel's platform header, or an explicitly trusted ingress outside Vercel.
    const forwarded =
      process.env.VERCEL === '1'
        ? req.headers.get('x-vercel-forwarded-for')
        : process.env.PANEL_TRUST_PROXY === 'true'
          ? req.headers.get('x-forwarded-for')
          : null
    const ip = forwarded?.split(',')[0].trim()
    if (!ip || !isIP(ip))
      throw new HttpError(
        503,
        'Shared AI needs a trusted client-IP proxy. Use your own GEMINI_API_KEY locally.',
      )
    const bucket = createHmac('sha256', process.env.PANEL_AI_RATE_SECRET)
      .update(ip)
      .digest('hex')
    const { data: allowed, error } = await database(true).rpc(
      'elp_consume_ai_request',
      { client_bucket: bucket },
    )
    if (error)
      throw new HttpError(
        503,
        'Shared AI protection is unavailable. Use your own GEMINI_API_KEY locally.',
      )
    if (!allowed)
      return json(
        {
          error:
            'Shared AI daily budget reached. Set your own GEMINI_API_KEY in .env.local and retry; installation works without AI.',
        },
        429,
        { 'Retry-After': '86400' },
      )
    try {
      const values = await generateCopy(input, {
        key: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      })
      return json({
        values,
        model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      })
    } catch (error) {
      if ((error as { status?: number }).status === 429)
        return json(
          {
            error:
              'Gemini shared quota is exhausted. Set your own GEMINI_API_KEY locally and retry.',
          },
          429,
        )
      throw new HttpError(
        502,
        'Shared AI provider did not return a valid proposal. Retry later or use your own GEMINI_API_KEY.',
      )
    }
  } catch (error) {
    return failure(error)
  }
}
