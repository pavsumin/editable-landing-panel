#!/usr/bin/env node
import { parseArgs } from 'node:util'
import {
  readFile,
  writeFile,
  mkdir,
  stat,
  realpath,
  lstat,
  unlink,
  rename,
  readdir,
} from 'node:fs/promises'
import { resolve, dirname, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash, randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import ts from 'typescript'
import { createInterface } from 'node:readline/promises'
import { planCodemod, REVIEW_NOTICE } from './codemod.mjs'
import {
  validateConfig,
  validateValues,
  fieldsFor,
  mergeContent,
} from '../lib/schema.mjs'

import {
  generateCopy,
  validateAssistance,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_AI_URL,
} from '../lib/assistance.mjs'

const VERSION = '0.3.1'
const assets = fileURLToPath(new URL('../assets/', import.meta.url))
const { values: flags, positionals: args } = parseArgs({
  allowPositionals: true,
  options: {
    'dry-run': { type: 'boolean' },
    yes: { type: 'boolean' },
    json: { type: 'boolean' },
    remote: { type: 'boolean' },
    'no-install': { type: 'boolean' },
    ai: { type: 'string' },
    'ai-url': { type: 'string' },
    defaults: { type: 'boolean' },
    out: { type: 'string' },
    page: { type: 'string' },
    preset: { type: 'string' },
    content: { type: 'string' },
    restore: { type: 'string' },
    cwd: { type: 'string' },
    help: { type: 'boolean' },
    version: { type: 'boolean' },
  },
})
const root = resolve(flags.cwd || process.cwd())
const output = (data) =>
  console.log(
    flags.json
      ? JSON.stringify(data, null, 2)
      : typeof data === 'string'
        ? data
        : JSON.stringify(data, null, 2),
  )
const exists = async (path) => {
  try {
    await stat(path)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}
const readJSON = async (path) => JSON.parse(await readFile(path, 'utf8'))
const hash = (data) => createHash('sha256').update(data).digest('hex')

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(resolve(root, name))
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Unable to read ${name}`)
    }
  }
}

async function config() {
  const value = await readJSON(resolve(root, 'editable-panel.config.json'))
  validateConfig(value)
  return value
}

async function api(
  path,
  { admin = false, method = 'GET', body, headers = {} } = {},
) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = admin
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing Supabase environment variables')
  const url = new URL(base)
  if (
    url.protocol !== 'https:' &&
    !(
      process.env.ELP_TEST_ALLOW_LOCALHOST === '1' &&
      url.hostname === '127.0.0.1'
    )
  )
    throw new Error('Supabase URL must use HTTPS')
  const result = await fetch(`${url.origin}${path}`, {
    method,
    signal: AbortSignal.timeout(20000),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!result.ok)
    throw new Error(
      `Supabase request failed (${result.status}); check credentials, migration and grants`,
    )
  const text = await result.text()
  return text ? JSON.parse(text) : null
}

async function remoteRows(schema) {
  const fields = fieldsFor(schema),
    rows = []
  for (let index = 0; index < fields.length; index += 100) {
    const keys = fields
      .slice(index, index + 100)
      .map((field) => `"${field.key}"`)
      .join(',')
    rows.push(
      ...(await api(
        `/rest/v1/content?select=key,value&key=in.(${encodeURIComponent(keys)})`,
        { admin: true },
      )),
    )
  }
  return rows
}

async function atomicFile(path, content) {
  const full = resolve(root, path),
    rootReal = await realpath(root)
  let parent = dirname(full)
  while (!(await exists(parent))) parent = dirname(parent)
  const parentReal = await realpath(parent)
  if (parentReal !== rootReal && !parentReal.startsWith(rootReal + sep))
    throw new Error(
      'Refusing a path outside the project or through an external symlink',
    )
  if ((await exists(full)) && (await lstat(full)).isSymbolicLink())
    throw new Error('Refusing to replace a symlink')
  await mkdir(dirname(full), { recursive: true })
  const temp = `${full}.${randomUUID()}.tmp`
  try {
    await writeFile(temp, content, { flag: 'wx', mode: 0o600 })
    await rename(temp, full)
  } finally {
    await unlink(temp).catch(() => {})
  }
}

async function contentMode() {
  if (flags.content && !['manual', 'codemod'].includes(flags.content))
    throw new Error('--content must be manual or codemod')
  if (flags.content) return flags.content
  if (
    process.stdin.isTTY &&
    process.stdout.isTTY &&
    !flags.json &&
    !flags['dry-run']
  ) {
    const prompt = createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    try {
      const answer = (
        await prompt.question(
          'Connect existing text: [1] manually (default), [2] codemod (review required): ',
        )
      ).trim()
      if (!['', '1', '2'].includes(answer))
        throw new Error('Choose 1 or 2, or pass --content manual|codemod')
      return answer === '2' ? 'codemod' : 'manual'
    } finally {
      prompt.close()
    }
  }
  return 'manual'
}

async function migrationPlan(schema) {
  const plan = await planCodemod(root, schema)
  const path = 'editable-panel.config.json'
  const before = await readFile(resolve(root, path), 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return null
    throw error
  })
  if (plan.fields.length)
    plan.changes.push({
      path,
      before,
      after: JSON.stringify(plan.config, null, 2) + '\n',
    })
  return plan
}

async function applyMigration(changes) {
  if (!changes.length) return null
  // All paths and snapshots must pass before any source/config writes.
  for (const change of changes) {
    const current = await readFile(resolve(root, change.path), 'utf8').catch(
      (error) => {
        if (error.code === 'ENOENT') return null
        throw error
      },
    )
    if (current !== change.before)
      throw new Error(`File changed since planning: ${change.path}`)
    let parent = resolve(root, change.path)
    while (parent !== root) {
      if (!parent.startsWith(root + sep))
        throw new Error('Codemod path outside project')
      if (
        await lstat(parent).then(
          (info) => info.isSymbolicLink(),
          (error) => {
            if (error.code === 'ENOENT') return false
            throw error
          },
        )
      )
        throw new Error(`Symlinked codemod destination: ${change.path}`)
      parent = dirname(parent)
    }
  }
  if (
    await lstat(resolve(root, '.editable-panel-codemod')).then(
      (info) => info.isSymbolicLink(),
      (error) => {
        if (error.code === 'ENOENT') return false
        throw error
      },
    )
  )
    throw new Error('Symlinked backup directory')
  await atomicFile('.editable-panel-codemod/.gitignore', '*\n')
  const id = randomUUID()
  const backup = `.editable-panel-codemod/${id}.json`
  await atomicFile(
    backup,
    JSON.stringify({ version: 1, changes }, null, 2) + '\n',
  )
  const written = []
  try {
    for (const change of changes) {
      if (change.after === null) await unlink(resolve(root, change.path))
      else await atomicFile(change.path, change.after)
      written.push(change)
    }
  } catch (error) {
    for (const change of written.reverse()) {
      if (change.before === null) await unlink(resolve(root, change.path))
      else await atomicFile(change.path, change.before)
    }
    throw error
  }
  return backup
}

async function migrate() {
  if (
    args.length !== 1 ||
    flags.page ||
    flags.out ||
    flags.remote ||
    flags.defaults ||
    flags.content ||
    flags.ai
  )
    throw new Error(
      'migrate scans supported page.tsx routes locally; paths, --page, remote/import and AI options are not supported',
    )
  if (flags.restore) {
    if (!/^[0-9a-f-]{36}$/.test(flags.restore))
      throw new Error('Use the backup UUID printed by migrate')
    const backup = await readJSON(
      resolve(root, `.editable-panel-codemod/${flags.restore}.json`),
    )
    if (backup.version !== 1 || !Array.isArray(backup.changes))
      throw new Error('Invalid backup')
    const changes = backup.changes.map((change) => ({
      path: change.path,
      before: change.after,
      after: change.before,
    }))
    // Refuse restoring edited files; never discard subsequent work.
    for (const change of changes) {
      if (
        typeof change.path !== 'string' ||
        typeof change.before !== 'string' ||
        (change.after !== null && typeof change.after !== 'string')
      )
        throw new Error('Invalid backup change')
      if (
        resolve(root, change.path) === root ||
        !resolve(root, change.path).startsWith(root + sep)
      )
        throw new Error('Backup path outside project')
    }
    const result = {
      command: 'migrate restore',
      files: changes.map((c) => c.path),
      applied: false,
    }
    if (flags['dry-run'] || !flags.yes) return output(result)
    await applyMigration(changes)
    return output({ ...result, applied: true })
  }
  const plan = await migrationPlan(await config())
  const result = {
    command: 'migrate',
    warning: plan.warning,
    reviewRequired: true,
    fields: plan.fields,
    skipped: plan.skipped,
    changes: plan.changes,
    applied: false,
  }
  if (!flags.yes || flags['dry-run']) return output(result)
  const backup = await applyMigration(plan.changes)
  output({
    ...result,
    applied: true,
    backup,
    next: [
      'Review git diff and generated labels/defaults',
      'Run your typecheck/build and verify each page and preview',
      'Keep backup files private; they contain original source',
      'Configure Supabase and run doctor before publishing',
    ],
  })
}

async function init() {
  const mode = await contentMode()
  const manifestPath = resolve(root, '.editable-panel-install.json')
  const manifest = (await exists(manifestPath))
    ? await readJSON(manifestPath)
    : null
  flags.preset = flags.preset || manifest?.preset || 'minimal'
  if (!['minimal', 'multipage'].includes(flags.preset))
    throw new Error('Preset must be minimal or multipage')
  const pkg = await readJSON(resolve(root, 'package.json'))
  const dependencies = { ...pkg.devDependencies, ...pkg.dependencies }
  if (
    !/^[~^]?(15|16)\./.test(dependencies.next || '') ||
    !/^[~^]?19\./.test(dependencies.react || '')
  )
    throw new Error('Supported target: Next.js 15/16 App Router with React 19')
  if (
    /\bexport\b/.test(
      await readFile(resolve(root, 'next.config.ts'), 'utf8').catch(() => ''),
    ) &&
    /output\s*:\s*['"]export['"]/.test(
      await readFile(resolve(root, 'next.config.ts'), 'utf8').catch(() => ''),
    )
  )
    throw new Error('Static export cannot run admin APIs')
  const tsconfig = ts.readConfigFile(
    resolve(root, 'tsconfig.json'),
    ts.sys.readFile,
  )
  if (tsconfig.error)
    throw new Error('A readable TypeScript tsconfig.json is required')
  const alias = tsconfig.config.compilerOptions?.paths?.['@/*']?.[0]
  if (!alias || !['./*', './src/*', '*', 'src/*'].includes(alias))
    throw new Error(
      'Configure @/* to point to ./* or ./src/* before installing',
    )
  const source = alias.includes('src/') ? 'src/' : ''
  if (
    (await exists(resolve(root, 'app'))) &&
    (await exists(resolve(root, 'src/app')))
  )
    throw new Error(
      'Both app and src/app exist; choose one App Router root before installing',
    )
  const app = (await exists(resolve(root, 'src/app'))) ? 'src/app' : 'app'
  if (!(await exists(resolve(root, app, 'layout.tsx'))))
    throw new Error('App Router layout.tsx is required')
  const index = await readJSON(resolve(assets, 'index.json'))
  const files = []
  for (const file of index.runtime) {
    let target = file.startsWith('panel/')
      ? source + file
      : file.replace(/^app\//, app + '/')
    let content = await readFile(resolve(assets, file), 'utf8')
    if (file === 'panel/config.ts')
      content = content.replace(
        '@/editable-panel.config.json',
        relative(
          dirname(resolve(root, target)),
          resolve(root, 'editable-panel.config.json'),
        )
          .split(sep)
          .join('/')
          .replace(/^(?!\.)/, './'),
      )
    files.push({ path: target, content })
  }
  const preset = await readJSON(resolve(assets, `presets/${flags.preset}.json`))
  files.push({
    path: 'editable-panel.config.json',
    content: JSON.stringify(preset, null, 2) + '\n',
  })
  files.push({
    path: 'supabase/migrations/202610280001_panel_security.sql',
    content: await readFile(resolve(assets, 'migration.sql'), 'utf8'),
  })
  files.push({
    path: '.env.panel.example',
    content: await readFile(resolve(assets, 'env.example'), 'utf8'),
  })
  for (const file of index.examples[flags.preset])
    files.push({
      path: file.replace(/^app\//, app + '/'),
      content: await readFile(resolve(assets, file), 'utf8'),
    })
  const plan = [],
    conflicts = []
  const routes = new Map()
  async function collectRoutes(directory) {
    for (const entry of await readdir(resolve(root, directory), {
      withFileTypes: true,
    })) {
      if (entry.isDirectory()) await collectRoutes(`${directory}/${entry.name}`)
      else if (/^(page|route)\.(tsx?|jsx?)$/.test(entry.name)) {
        const route = directory
          .slice(app.length)
          .split('/')
          .filter(
            (segment) =>
              segment && !segment.startsWith('(') && !segment.startsWith('@'),
          )
          .join('/')
        routes.set(`/${route}`, `${directory}/${entry.name}`)
      }
    }
  }
  await collectRoutes(app)
  for (const file of files) {
    if (
      file.path.startsWith(app + '/') &&
      /\/(page|route)\.tsx?$/.test(file.path)
    ) {
      const route = dirname(file.path).slice(app.length)
      if (routes.has(route) && routes.get(route) !== file.path)
        conflicts.push(`${file.path} shadows ${routes.get(route)}`)
    }
    const full = resolve(root, file.path)
    if (await exists(full)) {
      const current = await readFile(full, 'utf8')
      if (
        current === file.content ||
        (manifest?.files?.[file.path] &&
          ['editable-panel.config.json', '.env.panel.example'].includes(
            file.path,
          ))
      )
        continue
      conflicts.push(file.path)
    } else plan.push(file)
  }
  const runtimeDependencies = {
    '@supabase/supabase-js': '^2.100.1',
    sharp: '^0.35.5',
    'server-only': '0.0.1',
  }
  if (
    dependencies['@supabase/supabase-js'] &&
    !/^[~^]?2\./.test(dependencies['@supabase/supabase-js'])
  )
    conflicts.push('Existing @supabase/supabase-js must be version 2.x')
  const addDependencies = Object.fromEntries(
    Object.entries(runtimeDependencies).filter(([name]) => !dependencies[name]),
  )
  const migration =
    mode === 'codemod'
      ? await migrationPlan(
          (await exists(resolve(root, 'editable-panel.config.json')))
            ? await config()
            : preset,
        )
      : null
  const result = {
    command: 'init',
    contentMode: mode,
    ...(migration
      ? {
          codemod: {
            warning: REVIEW_NOTICE,
            reviewRequired: true,
            fields: migration.fields,
            skipped: migration.skipped,
            changes: migration.changes,
            applied: false,
          },
        }
      : {}),
    version: VERSION,
    preset: flags.preset,
    files: plan.map((file) => file.path),
    dependencies: addDependencies,
    conflicts,
    applied: false,
    next: [
      'Copy .env.panel.example values into .env.local',
      'Apply the SQL migration in Supabase SQL Editor',
      'Run elp doctor --remote',
      'Connect existing text manually or run elp migrate --dry-run, then elp migrate --yes',
      'Open /admin and /panel-example',
    ],
  }
  if (flags['dry-run']) return output(result)
  if (conflicts.length)
    throw new Error(
      `Conflicting files; nothing changed: ${conflicts.join(', ')}`,
    )
  if (!flags.yes)
    return output({
      ...result,
      message: 'Review this plan; pass --yes to apply it.',
    })
  // Preflight all paths before mutating anything. Do not follow symlinked destination folders.
  for (const file of plan) {
    let parent = dirname(resolve(root, file.path))
    while (parent !== root && parent.startsWith(root + sep)) {
      if ((await exists(parent)) && (await lstat(parent)).isSymbolicLink())
        throw new Error(`Symlinked destination: ${file.path}`)
      parent = dirname(parent)
    }
  }
  const previousPackage = await readFile(resolve(root, 'package.json'), 'utf8')
  const written = []
  try {
    for (const file of plan) {
      await atomicFile(file.path, file.content)
      written.push(file.path)
    }
    if (Object.keys(addDependencies).length) {
      pkg.dependencies = { ...pkg.dependencies, ...addDependencies }
      await atomicFile('package.json', JSON.stringify(pkg, null, 2) + '\n')
    }
    const hashes = {
      ...manifest?.files,
      ...Object.fromEntries(
        files.map((file) => [file.path, hash(file.content)]),
      ),
    }
    await atomicFile(
      '.editable-panel-install.json',
      JSON.stringify(
        { version: VERSION, preset: flags.preset, files: hashes },
        null,
        2,
      ) + '\n',
    )
  } catch (error) {
    for (const path of written)
      await unlink(resolve(root, path)).catch(() => {})
    await atomicFile('package.json', previousPackage)
    throw error
  }
  if (!flags['no-install'] && Object.keys(addDependencies).length) {
    const manager = (await exists(resolve(root, 'pnpm-lock.yaml')))
      ? 'pnpm'
      : (await exists(resolve(root, 'yarn.lock')))
        ? 'yarn'
        : 'npm'
    const result = spawnSync(manager, ['install'], {
      cwd: root,
      stdio: flags.json ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      shell: false,
    })
    if (result.error || result.status !== 0)
      throw new Error(
        `Files installed, but ${manager} install failed. Run it manually, then elp doctor.`,
      )
  }
  const installed = { ...result, applied: true }
  if (migration) {
    try {
      // The installer may just have created the preset config: replan against that exact snapshot.
      const planned = await migrationPlan(await config())
      installed.codemod = {
        warning: REVIEW_NOTICE,
        reviewRequired: true,
        fields: planned.fields,
        skipped: planned.skipped,
        changes: planned.changes,
        backup: await applyMigration(planned.changes),
        applied: true,
      }
    } catch (error) {
      installed.codemod = {
        error: error.message,
        warning: REVIEW_NOTICE,
        applied: false,
      }
      process.exitCode = 2
    }
  }
  if (flags.ai && (!migration || installed.codemod.applied)) {
    try {
      installed.ai = await ai(
        flags.ai,
        'panel-content.proposal.json',
        flags.page,
      )
    } catch (error) {
      installed.ai = { error: error.message, published: false }
      process.exitCode = 2
    }
  }
  if (flags.ai && migration && !installed.codemod.applied)
    installed.ai = {
      skipped: 'Resolve the codemod error before generating copy',
      published: false,
    }
  output(installed)
}

async function doctor() {
  const checks = []
  let schema
  try {
    schema = await config()
    checks.push({
      name: 'config',
      ok: true,
      pages: schema.pages.length,
      fields: fieldsFor(schema).length,
    })
  } catch (error) {
    checks.push({ name: 'config', ok: false, detail: error.message })
  }
  for (const key of [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_PASSWORD',
  ])
    checks.push({
      name: key,
      ok:
        Boolean(process.env[key]) &&
        (key !== 'ADMIN_PASSWORD' || process.env[key].length >= 16),
    })
  if (flags.remote && schema) {
    try {
      const rows = await remoteRows(schema)
      checks.push({
        name: 'remote-content',
        ok: true,
        matchingRows: rows.length,
      })
    } catch (error) {
      checks.push({ name: 'remote-content', ok: false, detail: error.message })
    }
    try {
      // An empty array can never mutate rows. A successful response means anon has a write path.
      await api('/rest/v1/content', { method: 'POST', body: [] })
      checks.push({
        name: 'anonymous-writes-denied',
        ok: false,
        detail: 'Anonymous empty write was accepted; inspect and revoke grants',
      })
    } catch (error) {
      checks.push({
        name: 'anonymous-writes-denied',
        ok: /\((401|403)\)/.test(error.message),
        detail: error.message,
      })
    }
    try {
      const bucket = await api('/storage/v1/bucket/images', { admin: true })
      checks.push({
        name: 'images-bucket',
        ok: bucket.public === true,
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types,
      })
    } catch (error) {
      checks.push({ name: 'images-bucket', ok: false, detail: error.message })
    }
  }
  const ok = checks.every((check) => check.ok)
  output({
    command: 'doctor',
    ok,
    checks,
    limitations: [
      'SQL access is needed to inspect every grant, policy and function privilege',
      'Login throttle and live deployment must be verified separately',
    ],
  })
  if (!ok) process.exitCode = 1
}

async function content() {
  if (
    args[1] === 'import' &&
    [flags.remote, flags.out, flags.defaults].filter(Boolean).length > 1
  )
    throw new Error('Choose exactly one of --remote, --defaults or --out')
  const schema = await config()
  if (args[1] === 'export') {
    const rows = flags.remote ? await remoteRows(schema) : []
    const result = {
      version: 1,
      source: flags.remote ? 'remote-merged' : 'defaults',
      values: mergeContent(schema, rows, flags.page),
    }
    if (flags.out && !flags['dry-run']) {
      if (await exists(resolve(root, flags.out)))
        throw new Error('Output file exists; choose a new name')
      await atomicFile(flags.out, JSON.stringify(result, null, 2) + '\n')
      output({ written: flags.out })
    } else output(result)
    return
  }
  if (args[1] !== 'import' || !args[2])
    throw new Error('Use content export or content import <file>')
  const file = resolve(root, args[2])
  if ((await stat(file)).size > 128000)
    throw new Error('Import file exceeds 128 KB')
  const document = await readJSON(file)
  const proposed = validateValues(schema, document.values ?? document)
  const current = mergeContent(
    schema,
    flags.remote ? await remoteRows(schema) : [],
  )
  const changes = Object.entries(proposed)
    .filter(([key, value]) => current[key] !== value)
    .map(([key, value]) => ({ key, before: current[key], after: value }))
  if (flags['dry-run'] || !flags.yes)
    return output({
      command: 'content import',
      changes,
      applied: false,
      message:
        'Review changes, then use --yes with --remote, --defaults or --out <file>.',
    })
  if ([flags.remote, flags.out, flags.defaults].filter(Boolean).length > 1)
    throw new Error('Choose exactly one of --remote, --defaults or --out')
  if (flags.remote) {
    if (changes.length)
      await api('/rest/v1/content?on_conflict=key', {
        admin: true,
        method: 'POST',
        body: changes.map(({ key, after }) => ({ key, value: after })),
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      })
  } else if (flags.defaults) {
    for (const field of fieldsFor(schema))
      if (Object.hasOwn(proposed, field.key))
        field.default = proposed[field.key]
    validateConfig(schema)
    await atomicFile(
      'editable-panel.config.json',
      JSON.stringify(schema, null, 2) + '\n',
    )
  } else if (flags.out) {
    if (await exists(resolve(root, flags.out)))
      throw new Error('Output file exists; choose a new name')
    await atomicFile(
      flags.out,
      JSON.stringify({ version: 1, values: proposed }, null, 2) + '\n',
    )
  } else
    throw new Error(
      'Choose --remote to publish, --defaults to update config, or --out for a local proposal',
    )
  output({
    command: 'content import',
    changed: changes.length,
    applied: true,
    target: flags.remote
      ? 'supabase'
      : flags.defaults
        ? 'editable-panel.config.json'
        : flags.out,
  })
}

async function ai(
  briefPath = args[1],
  outputPath = flags.out,
  pageId = flags.page,
) {
  if (!briefPath) throw new Error('Use ai <brief.txt> --page <id>')
  const schema = await config()
  const fields = fieldsFor(schema, pageId || schema.pages[0].id).filter(
    (field) => field.type === 'text' || field.type === 'textarea',
  )
  const file = resolve(root, briefPath)
  if ((await stat(file)).size > 32000)
    throw new Error('Brief must be under 32 KB')
  const brief = await readFile(file, 'utf8')
  const input = { brief, fields }
  validateAssistance(input)
  let proposed
  let source
  if (process.env.GEMINI_API_KEY) {
    source = 'own-key'
    proposed = await generateCopy(input, {
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    })
  } else {
    source = 'shared-service'
    const endpoint = new URL(
      flags['ai-url'] || process.env.ELP_AI_URL || DEFAULT_AI_URL,
    )
    if (
      endpoint.protocol !== 'https:' ||
      endpoint.username ||
      endpoint.password
    )
      throw new Error(
        'AI service URL must use HTTPS without embedded credentials',
      )
    const response = await fetch(endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(60000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok)
      throw new Error(
        `Shared AI unavailable (${response.status}). Add GEMINI_API_KEY to .env.local to use your own quota; optional GEMINI_MODEL defaults to ${DEFAULT_GEMINI_MODEL}. Installation works without AI.`,
      )
    const body = await response.json()
    proposed = validateValues(schema, body.values)
  }
  const allowed = new Set(fields.map((field) => field.key))
  if (Object.keys(proposed).some((key) => !allowed.has(key)))
    throw new Error('Gemini returned fields outside the selected page')
  const changes = Object.entries(proposed).map(([key, after]) => ({
    key,
    before: fields.find((field) => field.key === key).default,
    after,
  }))
  if (outputPath && flags.yes && !flags['dry-run']) {
    if (await exists(resolve(root, outputPath)))
      throw new Error('Output file exists; choose a new name')
    await atomicFile(
      outputPath,
      JSON.stringify({ version: 1, values: proposed }, null, 2) + '\n',
    )
  }
  return {
    command: 'ai',
    changes,
    source,
    written: outputPath && flags.yes && !flags['dry-run'] ? outputPath : null,
    published: false,
  }
}

try {
  loadEnv()
  if (flags.version) output(VERSION)
  else if (flags.help || !args.length)
    output(
      'elp init [--content manual|codemod] [--preset minimal|multipage] [--ai brief.txt] [--dry-run] [--yes] [--no-install]\nelp migrate [--dry-run|--yes] [--restore backup-uuid]\nelp doctor [--remote] [--json]\nelp pages list | schema\nelp content export [--remote] [--out file]\nelp content import file [--dry-run] [--remote|--defaults|--out file] [--yes]\nelp ai brief.txt [--page id] [--out proposal.json] [--yes]\nAll commands support --cwd and --json. AI never publishes.',
    )
  else if (args[0] === 'init') await init()
  else if (args[0] === 'migrate') await migrate()
  else if (args[0] === 'doctor') await doctor()
  else if (args[0] === 'schema') output(await config())
  else if (args[0] === 'pages' && args[1] === 'list')
    output(
      (await config()).pages.map(({ id, label, path }) => ({
        id,
        label,
        path,
      })),
    )
  else if (args[0] === 'content') await content()
  else if (args[0] === 'ai') output(await ai())
  else throw new Error('Unknown command; use --help')
} catch (error) {
  if (flags.json) console.error(JSON.stringify({ error: error.message }))
  else console.error(`elp: ${error.message}`)
  process.exitCode = 1
}
