// Compile installed runtime in a clean App Router project with no Tailwind or shadcn.
import {
  mkdtemp,
  mkdir,
  writeFile,
  symlink,
  rm,
  readFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixture = await mkdtemp(resolve(tmpdir(), 'elp-build-smoke-'))
const packed = await mkdtemp(resolve(tmpdir(), 'elp-packed-smoke-'))
const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: fixture,
    encoding: 'utf8',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
      ADMIN_PASSWORD: '',
    },
  })
  if (result.error || result.status !== 0)
    throw new Error(
      `${command} failed:\n${result.stdout}\n${result.stderr}\n${result.error?.message || ''}`,
    )
  console.log(result.stdout)
}
try {
  const archive = resolve(
    root,
    'public/downloads/editable-landing-panel-0.2.0.tgz',
  )
  await readFile(archive)
  run('tar', ['-xzf', archive, '-C', packed])
  await symlink(
    resolve(root, 'node_modules'),
    resolve(packed, 'package/node_modules'),
  )
  await mkdir(resolve(fixture, 'src/app'), { recursive: true })
  await writeFile(
    resolve(fixture, 'package.json'),
    JSON.stringify({
      private: true,
      dependencies: { next: '16.2.1', react: '19.2.4', 'react-dom': '19.2.4' },
    }),
  )
  await writeFile(
    resolve(fixture, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['dom', 'esnext'],
        strict: true,
        allowJs: false,
        noEmit: true,
        skipLibCheck: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        resolveJsonModule: true,
        paths: { '@/*': ['./src/*'] },
      },
      include: ['**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }),
  )
  await writeFile(
    resolve(fixture, 'src/app/layout.tsx'),
    'export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}',
  )
  await writeFile(
    resolve(fixture, 'src/app/page.tsx'),
    'export default function Page(){return <h1>Existing website</h1>}',
  )
  await writeFile(
    resolve(fixture, 'next.config.ts'),
    `export default { outputFileTracingRoot: ${JSON.stringify(root)} }`,
  )
  await symlink(resolve(root, 'node_modules'), resolve(fixture, 'node_modules'))
  run(process.execPath, [
    resolve(packed, 'package/bin/elp.mjs'),
    'init',
    '--preset',
    'multipage',
    '--yes',
    '--no-install',
    '--json',
  ])
  run(process.execPath, [
    resolve(root, 'node_modules/next/dist/bin/next'),
    'build',
    '--webpack',
  ])
  console.log(
    'Packed CLI installed a src/app multi-page preset that builds without allowJs, Tailwind or shadcn.',
  )
} finally {
  await rm(fixture, { recursive: true, force: true })
  await rm(packed, { recursive: true, force: true })
}
