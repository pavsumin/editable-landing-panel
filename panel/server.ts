import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { panelConfig } from './config'
import { fieldsFor, mergeContent } from './schema.mjs'
import { assertOrigin, HttpError, sessionFromRequest } from './security.mjs'

export function database(admin = false, timeout = 10000) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = admin
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new HttpError(503, 'Database is not configured')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          cache: 'no-store',
          signal: AbortSignal.timeout(timeout),
        }),
    },
  })
}

export function authorize(req: Request) {
  assertOrigin(req, process.env)
  if (!sessionFromRequest(req, process.env))
    throw new HttpError(401, 'Please sign in again')
}

export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

export function failure(error: unknown) {
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status)
  console.error('[editable-panel] Request failed')
  return json(
    {
      error:
        'Operation failed. Check server configuration and database migration.',
    },
    503,
  )
}

export async function readContent(pageId?: string, strict = false) {
  const fields = fieldsFor(panelConfig, pageId)
  try {
    const db = database(false, strict ? 10000 : 3000)
    const batches = Array.from(
      { length: Math.ceil(fields.length / 100) },
      (_, index) => fields.slice(index * 100, index * 100 + 100),
    )
    const rows = (
      await Promise.all(
        batches.map(async (batch) => {
          const { data, error } = await db
            .from('content')
            .select('key,value')
            .in(
              'key',
              batch.map((field) => field.key),
            )
          if (error) throw error
          return data || []
        }),
      )
    ).flat()
    return {
      values: mergeContent(panelConfig, rows, pageId),
      source: 'database' as const,
    }
  } catch (error) {
    if (strict) throw error
    console.warn(
      '[editable-panel] Database unavailable; using configured defaults',
    )
    return {
      values: mergeContent(panelConfig, [], pageId),
      source: 'defaults' as const,
    }
  }
}
