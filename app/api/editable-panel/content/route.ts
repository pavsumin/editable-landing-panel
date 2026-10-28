import { panelConfig } from '@/panel/config'
import { validateValues, fieldsFor } from '@/panel/schema.mjs'
import { HttpError, readJson, sessionFromRequest } from '@/panel/security.mjs'
import { authorize, database, failure, json, readContent } from '@/panel/server'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    if (!sessionFromRequest(req, process.env))
      throw new HttpError(401, 'Please sign in')
    const page = new URL(req.url).searchParams.get('page') || undefined
    try {
      fieldsFor(panelConfig, page)
    } catch {
      throw new HttpError(400, 'Unknown page')
    }
    return json(await readContent(page, true))
  } catch (error) {
    return failure(error)
  }
}

export async function POST(req: Request) {
  try {
    authorize(req)
    const input = (await readJson(req)) as { values?: unknown }
    let values: Record<string, string>
    try {
      values = validateValues(panelConfig, input?.values)
    } catch (error) {
      throw new HttpError(400, (error as Error).message)
    }
    const { error } = await database(true)
      .from('content')
      .upsert(
        Object.entries(values).map(([key, value]) => ({ key, value })),
        { onConflict: 'key' },
      )
    if (error) throw error
    return json({ success: true, values })
  } catch (error) {
    return failure(error)
  }
}

export async function DELETE(req: Request) {
  try {
    authorize(req)
    const input = (await readJson(req, 2048)) as { key?: unknown }
    const field = fieldsFor(panelConfig).find(
      (field) => field.key === input?.key,
    )
    if (!field) throw new HttpError(400, 'Unknown content key')
    const { error } = await database(true)
      .from('content')
      .delete()
      .eq('key', field.key)
    if (error) throw error
    return json({ success: true, values: { [field.key]: field.default } })
  } catch (error) {
    return failure(error)
  }
}
