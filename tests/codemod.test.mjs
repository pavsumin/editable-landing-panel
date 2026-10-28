import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  symlink,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import ts from 'typescript'
import vm from 'node:vm'
import { renderToStaticMarkup } from 'react-dom/server'
import * as jsx from 'react/jsx-runtime'
const cli = fileURLToPath(
  new URL('../packages/cli/bin/elp.mjs', import.meta.url),
)
async function fixture(source, src = false) {
  const root = await mkdtemp(resolve(tmpdir(), 'elp-codemod-'))
  const app = src ? 'src/app' : 'app'
  await mkdir(resolve(root, app), { recursive: true })
  await writeFile(
    resolve(root, 'package.json'),
    JSON.stringify({ dependencies: { next: '16.2.1', react: '19.2.4' } }),
  )
  await writeFile(
    resolve(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: { paths: { '@/*': [src ? './src/*' : './*'] } },
    }),
  )
  await writeFile(
    resolve(root, app, 'layout.tsx'),
    'export default function Layout() {}',
  )
  await writeFile(resolve(root, app, 'page.tsx'), source)
  return { root, app, path: resolve(root, app, 'page.tsx') }
}
function run(root, ...args) {
  const result = spawnSync(
    process.execPath,
    [cli, '--cwd', root, '--json', ...args],
    { encoding: 'utf8' },
  )
  return {
    status: result.status,
    data: result.stdout ? JSON.parse(result.stdout) : null,
    stderr: result.stderr,
  }
}
function component(source, imports = {}) {
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      require: (name) => (name === 'react/jsx-runtime' ? jsx : imports[name]),
    },
  )
  return exports.default
}
const source = `export default function Page() { return <main><section id="hero"><h1>Hello &amp; welcome</h1><p>
  Keep the first line
  and the next.
</p><a href="/about">Learn more</a><input placeholder="Your name" aria-label="Name"/><img src="/hero.webp" alt="A useful photo"/><p>{'Fixed string'}</p><p> A <strong>bold</strong> word &copy; </p><code>do not move</code></section></main> }`

test('manual stays unchanged; codemod plans and applies complete admin fields with matching server markup', async () => {
  const f = await fixture(source)
  try {
    const manual = run(
      f.root,
      'init',
      '--content',
      'manual',
      '--yes',
      '--no-install',
    )
    assert.equal(manual.status, 0, manual.stderr)
    assert.equal(await readFile(f.path, 'utf8'), source)
    assert.equal(run(f.root, 'migrate', 'app/page.tsx', '--yes').status, 1)
    assert.equal(run(f.root, 'migrate', '--remote', '--yes').status, 1)
    const planned = run(f.root, 'migrate', '--dry-run', '--yes')
    assert.equal(planned.status, 0, planned.stderr)
    assert.equal(planned.data.applied, false)
    assert.equal(planned.data.fields.length, 12)
    assert.equal(await readFile(f.path, 'utf8'), source)
    const applied = run(f.root, 'migrate', '--yes')
    assert.equal(applied.status, 0, applied.stderr)
    assert.equal(applied.data.reviewRequired, true)
    const config = JSON.parse(
      await readFile(resolve(f.root, 'editable-panel.config.json'), 'utf8'),
    )
    const page = config.pages.find((p) => p.path === '/')
    assert.equal(page.label, 'Home')
    assert.equal(page.sections[0].label, 'Hero')
    const fields = page.sections.flatMap((s) => s.fields)
    assert.ok(
      fields.every(
        (field) => field.label && field.key && field.type && field.maxLength,
      ),
    )
    assert.ok(fields.some((field) => field.label === 'Placeholder — Your name'))
    const values = Object.fromEntries(
      fields.map((field) => [field.key, field.default]),
    )
    const before = renderToStaticMarkup(component(source)())
    const after = renderToStaticMarkup(
      await component(await readFile(f.path, 'utf8'), {
        '@/panel/server': { readContent: async () => ({ values }) },
      })(),
    )
    assert.equal(after, before)
    assert.match(
      await readFile(
        resolve(f.root, '.editable-panel-codemod/.gitignore'),
        'utf8',
      ),
      /\*/,
    )
    const second = run(f.root, 'migrate', '--yes')
    assert.equal(second.data.fields.length, 0)
    assert.equal(second.data.backup, null)
    const backupId = applied.data.backup.split('/').pop().replace('.json', '')
    const restore = run(f.root, 'migrate', '--restore', backupId, '--yes')
    assert.equal(restore.status, 0, restore.stderr)
    assert.equal(await readFile(f.path, 'utf8'), source)
  } finally {
    await rm(f.root, { recursive: true, force: true })
  }
})

test('client page becomes a server wrapper with live preview; restores and refuses newer edits', async () => {
  const original = `'use client'\nexport default function Home(){return <main><h1>Client title</h1><button onClick={() => alert('kept')}>Buy now</button></main>}`
  const f = await fixture(original, true)
  try {
    const preview = run(f.root, 'init', '--content', 'codemod', '--dry-run')
    assert.equal(preview.status, 0, preview.stderr)
    assert.equal(await readFile(f.path, 'utf8'), original)
    const result = run(
      f.root,
      'init',
      '--content',
      'codemod',
      '--yes',
      '--no-install',
    )
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.data.codemod.applied, true)
    const viewPath = resolve(dirname(f.path), 'page.editable-view.tsx')
    const viewSource = await readFile(viewPath, 'utf8')
    assert.match(viewSource, /usePreviewContent/)
    assert.match(viewSource, /alert\('kept'\)/)
    const config = JSON.parse(
      await readFile(resolve(f.root, 'editable-panel.config.json'), 'utf8'),
    )
    const values = Object.fromEntries(
      config.pages.flatMap((p) =>
        p.sections.flatMap((s) => s.fields.map((f) => [f.key, f.default])),
      ),
    )
    const View = component(viewSource, {
      '@/panel/PreviewBridge': { usePreviewContent: (value) => value },
    })
    const Page = component(await readFile(f.path, 'utf8'), {
      './page.editable-view': { default: View },
      '@/panel/server': { readContent: async () => ({ values }) },
    })
    assert.equal(
      renderToStaticMarkup(await Page()),
      renderToStaticMarkup(component(original)()),
    )
    const id = result.data.codemod.backup.split('/').pop().replace('.json', '')
    await writeFile(viewPath, viewSource + '\n// newer edit')
    assert.equal(run(f.root, 'migrate', '--restore', id, '--yes').status, 1)
    assert.match(await readFile(f.path, 'utf8'), /readContent/)
    await writeFile(viewPath, viewSource)
    assert.equal(run(f.root, 'migrate', '--restore', id, '--yes').status, 0)
    assert.equal(await readFile(f.path, 'utf8'), original)
    await assert.rejects(readFile(viewPath), /ENOENT/)
  } finally {
    await rm(f.root, { recursive: true, force: true })
  }
})

test('unsupported syntax, dynamic content and symlinks are reported without being rewritten', async () => {
  const original = `const text = 'Dynamic'; export default function Page(){return <main><p>{text}</p><pre>KEEP</pre><a href="mailto:hello@example.com">Contact</a>{[1].map(i=><b>In loop</b>)}</main>}`
  const f = await fixture(original)
  try {
    await mkdir(resolve(f.root, 'app/[slug]'))
    await writeFile(resolve(f.root, 'app/[slug]/page.tsx'), source)
    await symlink(f.path, resolve(f.root, 'app/linked.tsx'))
    const result = run(
      f.root,
      'init',
      '--content',
      'codemod',
      '--yes',
      '--no-install',
    )
    assert.equal(result.status, 0, result.stderr)
    const modified = await readFile(f.path, 'utf8')
    assert.match(modified, /mailto:hello@example.com/)
    assert.match(modified, /<pre>KEEP<\/pre>/)
    assert.match(modified, /<b>In loop<\/b>/)
    assert.match(modified, /\{text\}/)
    assert.ok(result.data.codemod.skipped.some((s) => /Symlink/.test(s.reason)))
    assert.ok(result.data.codemod.skipped.some((s) => /Dynamic/.test(s.reason)))
    assert.ok(
      result.data.codemod.skipped.some((s) => /callback/.test(s.reason)),
    )
    assert.equal(
      await readFile(resolve(f.root, 'app/[slug]/page.tsx'), 'utf8'),
      source,
    )
  } finally {
    await rm(f.root, { recursive: true, force: true })
  }
})

test('symlinked backup destination prevents all migration writes', async () => {
  const f = await fixture(source)
  const target = await mkdtemp(resolve(tmpdir(), 'elp-backup-target-'))
  try {
    assert.equal(
      run(f.root, 'init', '--content', 'manual', '--yes', '--no-install')
        .status,
      0,
    )
    const configBefore = await readFile(
      resolve(f.root, 'editable-panel.config.json'),
      'utf8',
    )
    await symlink(target, resolve(f.root, '.editable-panel-codemod'))
    const result = run(f.root, 'migrate', '--yes')
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Symlinked backup/)
    assert.equal(await readFile(f.path, 'utf8'), source)
    assert.equal(
      await readFile(resolve(f.root, 'editable-panel.config.json'), 'utf8'),
      configBefore,
    )
  } finally {
    await rm(f.root, { recursive: true, force: true })
    await rm(target, { recursive: true, force: true })
  }
})

test('unsupported client props/default exports remain intact and ambiguous routes fail before installation', async () => {
  const original = `'use client'; export default function Page({ name }: { name: string }) { return <p>Hello {name}</p> }`
  const f = await fixture(original)
  try {
    const result = run(
      f.root,
      'init',
      '--content',
      'codemod',
      '--yes',
      '--no-install',
    )
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.data.codemod.fields.length, 0)
    assert.match(result.data.codemod.skipped[0].reason, /props/)
    assert.equal(await readFile(f.path, 'utf8'), original)
    await writeFile(f.path, 'export default () => <h1>Arrow page</h1>')
    const arrow = run(f.root, 'migrate', '--yes')
    assert.equal(arrow.data.fields.length, 0)
    assert.equal(
      await readFile(f.path, 'utf8'),
      'export default () => <h1>Arrow page</h1>',
    )
    await writeFile(f.path, source)
    await mkdir(resolve(f.root, 'app/(marketing)'), { recursive: true })
    await writeFile(resolve(f.root, 'app/(marketing)/page.tsx'), source)
    const before = await readFile(
      resolve(f.root, 'editable-panel.config.json'),
      'utf8',
    )
    assert.equal(run(f.root, 'migrate', '--yes').status, 1)
    assert.equal(await readFile(f.path, 'utf8'), source)
    assert.equal(
      await readFile(resolve(f.root, 'editable-panel.config.json'), 'utf8'),
      before,
    )
  } finally {
    await rm(f.root, { recursive: true, force: true })
  }
})
