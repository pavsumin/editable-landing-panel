import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(root, 'packages/cli/assets')
await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })
await mkdir(resolve(root, 'packages/cli/lib'), { recursive: true })
await cp(
  resolve(root, 'panel/schema.mjs'),
  resolve(root, 'packages/cli/lib/schema.mjs'),
)
let assistance = await readFile(resolve(root, 'panel/assistance.mjs'), 'utf8')
if (process.env.PANEL_SITE_URL) {
  const site = new URL(process.env.PANEL_SITE_URL)
  if (site.protocol === 'https:' && !site.username && !site.password)
    assistance = assistance.replace(
      'https://editable-landing-panel.vercel.app/api/editable-panel/assist',
      new URL('/api/editable-panel/assist', site.origin).href,
    )
}
await writeFile(resolve(root, 'packages/cli/lib/assistance.mjs'), assistance)
const runtime = [
  'panel/schema.mjs',
  'panel/schema.d.mts',
  'panel/security.mjs',
  'panel/security.d.mts',
  'panel/server.ts',
  'panel/config.ts',
  'panel/PreviewBridge.tsx',
  'panel/Editor.tsx',
  'panel/theme.mjs',
  'panel/theme.d.mts',
  'panel/editor.module.css',
  'app/admin/page.tsx',
  'app/api/editable-panel/session/route.ts',
  'app/api/editable-panel/content/route.ts',
  'app/api/editable-panel/upload/route.ts',
]
for (const file of runtime) {
  await mkdir(dirname(resolve(target, file)), { recursive: true })
  await cp(resolve(root, file), resolve(target, file))
}
await cp(
  resolve(root, 'supabase/migrations/202610280001_panel_security.sql'),
  resolve(target, 'migration.sql'),
)
await cp(resolve(root, '.env.example'), resolve(target, 'env.example'))
await cp(resolve(root, 'LICENSE'), resolve(root, 'packages/cli/LICENSE'))
await cp(resolve(root, 'docs/CLI.md'), resolve(root, 'packages/cli/README.md'))
const field = (key, label, value, type = 'text') => ({
  key,
  label,
  type,
  default: value,
  maxLength: type === 'textarea' ? 5000 : 240,
})
const page = (id, label, path) => ({
  id,
  label,
  path,
  sections: [
    {
      id: 'hero',
      label: 'Page content',
      fields: [
        field(`${id}.title`, 'Title', `${label}. Made editable.`),
        field(
          `${id}.description`,
          'Description',
          'Keep your components in code. Give clients a focused place to edit the words.',
          'textarea',
        ),
      ],
    },
  ],
})
const home = page('home', 'Home', '/panel-example')
const shared = {
  id: 'global',
  label: 'Shared content',
  path: '/panel-example',
  sections: [
    {
      id: 'footer',
      label: 'Footer',
      fields: [field('global.footer', 'Footer', '')],
    },
  ],
}
const presets = {
  minimal: { version: 1, pages: [home, shared] },
  multipage: {
    version: 1,
    pages: [
      home,
      page('about', 'About', '/panel-example/about'),
      page('contact', 'Contact', '/panel-example/contact'),
      shared,
    ],
  },
}
await mkdir(resolve(target, 'presets'), { recursive: true })
for (const [name, config] of Object.entries(presets))
  await writeFile(
    resolve(target, `presets/${name}.json`),
    JSON.stringify(config, null, 2),
  )
const exampleComponent = `'use client'
import Link from 'next/link'
import { panelConfig } from './config'
import { usePreviewContent } from './PreviewBridge'
import styles from './editor.module.css'
export default function ExamplePage({ content, pageId }: { content: Record<string,string>; pageId: string }) {
 const c = usePreviewContent(content)
 return <div className={styles.panel}><nav aria-label="Example pages" className={styles.actions}>{panelConfig.pages.filter(page => page.id !== 'global').map(page => <Link key={page.id} href={page.path}>{page.label}</Link>)}</nav><main id="hero" className={styles.demoPreview}><span className={styles.eyebrow}>YOUR MULTI-PAGE STARTER</span><h1>{c[pageId + '.title']}</h1><p>{c[pageId + '.description']}</p><Link href="/admin">Open the editor →</Link></main><footer id="footer">{c['global.footer']}</footer></div>
}
`
await writeFile(resolve(target, 'panel/ExamplePage.tsx'), exampleComponent)
runtime.push('panel/ExamplePage.tsx')
const examples = { minimal: [], multipage: [] }
for (const [id, path] of [
  ['home', 'app/panel-example/page.tsx'],
  ['about', 'app/panel-example/about/page.tsx'],
  ['contact', 'app/panel-example/contact/page.tsx'],
]) {
  const content = `import { readContent } from '@/panel/server'\nimport ExamplePage from '@/panel/ExamplePage'\nexport const revalidate = 0\nexport default async function Page() { return <ExamplePage pageId='${id}' content={(await readContent('${id}')).values} /> }\n`
  await mkdir(dirname(resolve(target, path)), { recursive: true })
  await writeFile(resolve(target, path), content)
  examples.multipage.push(path)
  if (id === 'home') examples.minimal.push(path)
}
await writeFile(
  resolve(target, 'index.json'),
  JSON.stringify({ runtime, examples }, null, 2),
)
console.log('CLI assets built from current runtime sources (no network).')
