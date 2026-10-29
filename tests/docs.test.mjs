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

test('documentation entry links and installation archives resolve to current targets', async () => {
  const guide = await readJSON('docs/guide.json')
  const cli = await readJSON('packages/cli/package.json')
  const ids = new Set(guide.map((section) => section.id))
  assert.equal(ids.size, guide.length)
  for (const section of guide)
    for (const card of section.cards || [])
      assert.ok(
        ids.has(card.href.slice(1)),
        `Missing guide target: ${card.href}`,
      )
  for (const path of ['docs/guide.json', 'docs/CLI.md', 'README.md']) {
    const source = await readFile(
      new URL('../' + path, import.meta.url),
      'utf8',
    )
    const archives = [
      ...source.matchAll(/downloads\/editable-landing-panel-([\d.]+)\.tgz/g),
    ]
    assert.ok(archives.length, `Missing installation archive in ${path}`)
    for (const archive of archives) assert.equal(archive[1], cli.version, path)
  }
})
