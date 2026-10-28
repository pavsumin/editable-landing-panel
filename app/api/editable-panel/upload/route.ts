import { randomUUID } from 'node:crypto'
import { authorize, database, failure, json } from '@/panel/server'
import { HttpError } from '@/panel/security.mjs'
import sharp from 'sharp'

export const runtime = 'nodejs'
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: Request) {
  try {
    authorize(req)
    if (!req.headers.get('content-type')?.startsWith('multipart/form-data;'))
      throw new HttpError(415, 'Expected multipart image upload')
    if (Number(req.headers.get('content-length')) > MAX_BYTES + 16384)
      throw new HttpError(413, 'Maximum image size is 5 MB')
    const reader = req.body?.getReader()
    if (!reader) throw new HttpError(400, 'Missing upload')
    const chunks: Buffer[] = []
    let size = 0
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > MAX_BYTES + 16384) {
          await reader.cancel()
          throw new HttpError(413, 'Maximum image size is 5 MB')
        }
        chunks.push(Buffer.from(value))
      }
    } finally {
      reader.releaseLock()
    }
    const form = await new Response(new Uint8Array(Buffer.concat(chunks)), {
      headers: { 'Content-Type': req.headers.get('content-type')! },
    }).formData()
    const file = form.get('file')
    if (!(file instanceof File) || !file.size || file.size > MAX_BYTES)
      throw new HttpError(400, 'Choose an image up to 5 MB')
    let optimized: Buffer
    try {
      const source = sharp(Buffer.from(await file.arrayBuffer()), {
        limitInputPixels: 40000000,
        animated: false,
      })
      const metadata = await source.metadata()
      if (!['jpeg', 'png', 'webp', 'avif'].includes(metadata.format || ''))
        throw new Error('Unsupported image')
      optimized = await source
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer()
    } catch {
      throw new HttpError(
        400,
        'Use a valid JPEG, PNG, WebP or AVIF image (up to 40 megapixels)',
      )
    }
    const db = database(true)
    const name = `panel/${randomUUID()}.webp`
    const { error } = await db.storage
      .from('images')
      .upload(name, optimized, {
        contentType: 'image/webp',
        upsert: false,
        cacheControl: '31536000',
      })
    if (error) throw error
    return json({
      url: db.storage.from('images').getPublicUrl(name).data.publicUrl,
    })
  } catch (error) {
    return failure(error)
  }
}
