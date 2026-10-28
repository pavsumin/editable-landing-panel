import { mkdir, chmod } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destination = resolve(root, 'public/downloads')
await mkdir(destination, { recursive: true })
const result = spawnSync(
  'npm',
  ['pack', '--ignore-scripts', '--json', '--pack-destination', destination],
  {
    cwd: resolve(root, 'packages/cli'),
    encoding: 'utf8',
    shell: false,
    env: {
      ...process.env,
      npm_config_cache:
        process.env.npm_config_cache || resolve(tmpdir(), 'elp-npm-cache'),
    },
  },
)
if (result.error || result.status !== 0)
  throw new Error(
    `CLI packaging failed: ${result.error?.message || result.stderr}`,
  )
const [packed] = JSON.parse(result.stdout)
await chmod(resolve(destination, packed.filename), 0o644)
console.log(
  `CLI download prepared: /downloads/${packed.filename} (${packed.size} bytes)`,
)
