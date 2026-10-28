import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const readJSON = async (path) =>
  JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'))
test('rendered documentation defaults match the maintained guide and references existing API methods', async () => {
  const guide = await readJSON('docs/guide.json')
  const config = await readJSON('editable-panel.config.json')
  const docs = config.pages.find((page) => page.id === 'docs')
  for (const section of guide) {
    const fields = docs.sections.find((item) => item.id === section.id)?.fields
    assert.ok(fields, section.id)
    assert.equal(
      fields.find((field) => field.key.endsWith('.title')).default,
      section.title,
    )
    assert.equal(
      fields.find((field) => field.key.endsWith('.body')).default,
      section.body,
    )
  }
  for (const [endpoint] of guide.find((section) => section.id === 'api').table
    .rows) {
    const [method, path] = endpoint.split(' ')
    const source = await readFile(
      new URL('../app' + path.split('?')[0] + '/route.ts', import.meta.url),
      'utf8',
    )
    assert.match(source, new RegExp(`export async function ${method}\\(`))
  }
})
