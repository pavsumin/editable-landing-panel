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
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const cli = fileURLToPath(
  new URL('../packages/cli/bin/elp.mjs', import.meta.url),
)
async function fixture(src = false) {
  const root = await mkdtemp(resolve(tmpdir(), 'elp-cli-'))
  await mkdir(resolve(root, src ? 'src/app' : 'app'), { recursive: true })
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
    resolve(root, src ? 'src/app/layout.tsx' : 'app/layout.tsx'),
    'export default function Layout() {}',
  )
  await writeFile(
    resolve(root, src ? 'src/app/page.tsx' : 'app/page.tsx'),
    'EXISTING HOME MUST SURVIVE',
  )
  return root
}
function run(root, ...args) {
  const result = spawnSync(
    process.execPath,
    [cli, '--cwd', root, '--json', ...args],
    { encoding: 'utf8' },
  )
  if (result.error) throw result.error
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    data: result.stdout ? JSON.parse(result.stdout) : null,
  }
}

test('installer dry-run, apply, idempotency and existing page preservation', async () => {
  const root = await fixture()
  try {
    const dry = run(root, 'init', '--preset', 'multipage', '--dry-run')
    assert.equal(dry.status, 0, dry.stderr)
    assert.equal(dry.data.applied, false)
    assert.ok(dry.data.files.includes('app/panel-example/about/page.tsx'))
    const apply = run(
      root,
      'init',
      '--preset',
      'multipage',
      '--yes',
      '--no-install',
    )
    assert.equal(apply.status, 0, apply.stderr)
    assert.equal(
      await readFile(resolve(root, 'app/page.tsx'), 'utf8'),
      'EXISTING HOME MUST SURVIVE',
    )
    const again = run(
      root,
      'init',
      '--preset',
      'multipage',
      '--yes',
      '--no-install',
    )
    assert.equal(again.status, 0, again.stderr)
    assert.deepEqual(again.data.files, [])
    assert.equal(run(root, 'pages', 'list').data.length, 4)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('src/app installs resolve root config correctly', async () => {
  const root = await fixture(true)
  try {
    const result = run(root, 'init', '--yes', '--no-install')
    assert.equal(result.status, 0, result.stderr)
    assert.match(
      await readFile(resolve(root, 'src/panel/config.ts'), 'utf8'),
      /\.\.\/\.\.\/editable-panel.config.json/,
    )
    assert.match(
      await readFile(resolve(root, 'src/app/admin/page.tsx'), 'utf8'),
      /@\/panel\/Editor/,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('conflicting destination and symlink are refused without source changes', async () => {
  const root = await fixture()
  try {
    await mkdir(resolve(root, 'app/admin'))
    await writeFile(resolve(root, 'app/admin/page.tsx'), 'CUSTOM ADMIN')
    const before = await readFile(resolve(root, 'package.json'), 'utf8')
    const result = run(root, 'init', '--yes', '--no-install')
    assert.equal(result.status, 1)
    assert.equal(await readFile(resolve(root, 'package.json'), 'utf8'), before)
    assert.equal(
      await readFile(resolve(root, 'app/admin/page.tsx'), 'utf8'),
      'CUSTOM ADMIN',
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
  const other = await fixture()
  try {
    await symlink(tmpdir(), resolve(other, 'panel'))
    assert.equal(run(other, 'init', '--yes', '--no-install').status, 1)
  } finally {
    await rm(other, { recursive: true, force: true })
  }
})

test('imports validate all values, do not write by default and refuse overwritten output', async () => {
  const root = await fixture()
  try {
    assert.equal(run(root, 'init', '--yes', '--no-install').status, 0)
    await writeFile(
      resolve(root, 'proposal.json'),
      JSON.stringify({ values: { 'home.title': 'Updated title' } }),
    )
    const preview = run(root, 'content', 'import', 'proposal.json')
    assert.equal(preview.status, 0, preview.stderr)
    assert.equal(preview.data.applied, false)
    assert.equal(preview.data.changes[0].after, 'Updated title')
    assert.equal(
      run(
        root,
        'content',
        'import',
        'proposal.json',
        '--yes',
        '--out',
        'reviewed.json',
      ).status,
      0,
    )
    assert.equal(
      run(
        root,
        'content',
        'import',
        'proposal.json',
        '--yes',
        '--out',
        'reviewed.json',
      ).status,
      1,
    )
    await writeFile(
      resolve(root, 'invalid.json'),
      JSON.stringify({ values: { arbitrary: 'no' } }),
    )
    assert.equal(
      run(root, 'content', 'import', 'invalid.json', '--dry-run').status,
      1,
    )
    assert.equal(run(root, 'content', 'export').data.source, 'defaults')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('route-group collision is refused and repeat init remembers preset', async () => {
  const root = await fixture()
  try {
    await mkdir(resolve(root, 'app/(existing)/admin'), { recursive: true })
    await writeFile(
      resolve(root, 'app/(existing)/admin/page.tsx'),
      'CUSTOM ROUTE GROUP ADMIN',
    )
    const collision = run(root, 'init', '--yes', '--no-install')
    assert.equal(collision.status, 1)
    assert.match(collision.stderr, /shadows/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
  const clean = await fixture()
  try {
    assert.equal(
      run(clean, 'init', '--preset', 'multipage', '--yes', '--no-install')
        .status,
      0,
    )
    const repeated = run(clean, 'init', '--yes', '--no-install')
    assert.equal(repeated.status, 0, repeated.stderr)
    assert.equal(repeated.data.preset, 'multipage')
  } finally {
    await rm(clean, { recursive: true, force: true })
  }
})

test('AI produces a local reviewed proposal, never publishes and rejects unknown fields', async () => {
  const root = await fixture()
  const runner = fileURLToPath(new URL('./ai-runner.mjs', import.meta.url))
  const ai = (...args) =>
    spawnSync(
      process.execPath,
      [
        runner,
        '--cwd',
        root,
        '--json',
        'ai',
        'brief.txt',
        '--page',
        'home',
        ...args,
      ],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          GEMINI_API_KEY: 'fake-test-key',
          GEMINI_MODEL: 'test-model',
        },
      },
    )
  try {
    assert.equal(run(root, 'init', '--yes', '--no-install').status, 0)
    await writeFile(resolve(root, 'brief.txt'), 'Prepare a concise title')
    const proposal = ai('--out', 'proposal.json', '--yes')
    if (proposal.error) throw proposal.error
    assert.equal(proposal.status, 0, proposal.stderr)
    assert.equal(JSON.parse(proposal.stdout).published, false)
    assert.equal(
      JSON.parse(await readFile(resolve(root, 'proposal.json'), 'utf8')).values[
        'home.title'
      ],
      'A reviewed AI proposal',
    )
    const invalid = spawnSync(
      process.execPath,
      [runner, '--cwd', root, '--json', 'ai', 'brief.txt', '--page', 'home'],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          GEMINI_API_KEY: 'fake-test-key',
          GEMINI_MODEL: 'test-model',
          ELP_INVALID_AI_TEST: '1',
        },
      },
    )
    if (invalid.error) throw invalid.error
    assert.equal(invalid.status, 1)
    assert.match(invalid.stderr, /Unknown content key/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('default imports change only declared defaults and never publish', async () => {
  const root = await fixture()
  try {
    assert.equal(run(root, 'init', '--yes', '--no-install').status, 0)
    await writeFile(
      resolve(root, 'proposal.json'),
      JSON.stringify({ values: { 'home.title': 'Locally adapted title' } }),
    )
    const dry = run(
      root,
      'content',
      'import',
      'proposal.json',
      '--defaults',
      '--dry-run',
    )
    assert.equal(dry.status, 0, dry.stderr)
    assert.equal(dry.data.applied, false)
    const before = JSON.parse(
      await readFile(resolve(root, 'editable-panel.config.json'), 'utf8'),
    )
    assert.notEqual(
      before.pages[0].sections[0].fields[0].default,
      'Locally adapted title',
    )
    const applied = run(
      root,
      'content',
      'import',
      'proposal.json',
      '--defaults',
      '--yes',
    )
    assert.equal(applied.status, 0, applied.stderr)
    assert.equal(applied.data.target, 'editable-panel.config.json')
    const after = JSON.parse(
      await readFile(resolve(root, 'editable-panel.config.json'), 'utf8'),
    )
    assert.equal(
      after.pages[0].sections[0].fields[0].default,
      'Locally adapted title',
    )
    assert.equal(
      after.pages[0].sections[0].fields[1].default,
      before.pages[0].sections[0].fields[1].default,
    )
    assert.equal(
      run(
        root,
        'content',
        'import',
        'proposal.json',
        '--defaults',
        '--remote',
        '--dry-run',
      ).status,
      1,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('shared AI supports installation assistance and gives own-key fallback on quota', async () => {
  const root = await fixture()
  const runner = fileURLToPath(new URL('./ai-runner.mjs', import.meta.url))
  const exec = (mode, ...args) =>
    spawnSync(process.execPath, [runner, '--cwd', root, '--json', ...args], {
      encoding: 'utf8',
      env: { ...process.env, GEMINI_API_KEY: '', ELP_SHARED_AI_TEST: mode },
    })
  try {
    await writeFile(resolve(root, 'brief.txt'), 'Create a useful website title')
    const installed = exec(
      'ok',
      'init',
      '--preset',
      'multipage',
      '--ai',
      'brief.txt',
      '--yes',
      '--no-install',
    )
    if (installed.error) throw installed.error
    assert.equal(installed.status, 0, installed.stderr)
    const result = JSON.parse(installed.stdout)
    assert.equal(result.applied, true)
    assert.equal(result.ai.source, 'shared-service')
    assert.equal(result.ai.published, false)
    assert.equal(result.ai.written, 'panel-content.proposal.json')
    const quota = exec('quota', 'ai', 'brief.txt', '--page', 'home')
    assert.equal(quota.status, 1)
    assert.match(quota.stderr, /GEMINI_API_KEY/)
    assert.match(quota.stderr, /429/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
