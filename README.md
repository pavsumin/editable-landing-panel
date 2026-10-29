# Editable Landing Panel

A focused content editor for Next.js. Keep components in code, declare editable fields once, and let clients preview and publish text and images. Supabase stores overrides; your configuration provides defaults.

This repository is a working multi-page example: `/`, `/about`, `/contact`, `/docs`, `/demo` and `/admin`. The demo uses the same editor with local browser state and cannot modify the live site.

## Install with CLI (recommended)

Supported: TypeScript, Next.js 15/16 App Router, React 19, `app` or `src/app`, with `@/*` mapped to `./*` or `./src/*`. Installed components require neither Tailwind nor shadcn. Custom `basePath`, Pages Router, static export and JavaScript-only applications are outside the supported scope.

**The public npm package is not published by this iteration. No npm account is required for the Vercel-hosted download.** `pnpm build` prepares the archive before compiling Next.js. After deploying this version, run from the target application:

```sh
npx --package=https://editable-landing-panel.vercel.app/downloads/editable-landing-panel-0.3.1.tgz elp init --preset multipage --dry-run --json
npx --package=https://editable-landing-panel.vercel.app/downloads/editable-landing-panel-0.3.1.tgz elp init --preset multipage --yes
# Optional permanent installation:
npm install --global https://editable-landing-panel.vercel.app/downloads/editable-landing-panel-0.3.1.tgz
elp --help
```

Use `pnpm cli:pack` for a local archive under public/downloads, then `npx --package=/absolute/path/file.tgz elp ...`. For the shorter `npx editable-landing-panel@0.3.1 init`, an authorized owner must separately publish packages/cli to npm. Vercel deployment does not publish packages.

The installer adds /admin, /api/editable-panel/{session,content,upload}, scoped runtime files, config, an env example and migration 001. Example routes live under /panel-example. Manual mode preserves the existing homepage; codemod mode explicitly migrates supported pages. Conflicts are refused before writing; repeat runs preserve edited config. Use --no-install to manage dependencies yourself.

Apply migration 001, set your own Supabase variables and run `elp doctor --remote`. This project's existing database also needs migration 001 before the upgraded admin is deployed. Migration 002 is only for hosting the optional shared AI endpoint. Integration does not automatically rewrite arbitrary JSX or move business logic.

CLI 0.3.1 includes the editor’s Safari/background theme fix for new installations. Updating the CLI does not automatically upgrade an already installed runtime; see [runtime update instructions](docs/CLI.md#theme-and-runtime-updates). This theme update needs no new environment variables or SQL migrations.

## Included

- One versioned `editable-panel.config.json` for pages, sections, labels, types, defaults and validation. Existing `hero_title` keys remain compatible.
- Responsive editor, page selector, field search, unsaved live preview, explicit batch saving and reset. Failed saves retain drafts.
- Server-validated image uploads: up to 5 MB and 40 megapixels, re-encoded to WebP, rotated, stripped of metadata and bounded to 1600 pixels.
- Expiring signed HttpOnly sessions, origin checks, a shared database login throttle, explicit RLS and grants.
- CLI installation, diagnostics, JSON schema, content export/import and optional Gemini copy proposals. AI never publishes or rewrites arbitrary code.
- Minimal and multi-page presets, scoped CSS, MIT license and CI.

Saved content appears on new requests. Already open visitor pages do not have a realtime subscription. Unsaved preview requires the preview hook in the relevant client section; other components can remain server-rendered.

## Connect existing text

`init` offers manual integration or a local TypeScript codemod. In automation,
choose `--content manual` (default) or `--content codemod` explicitly. No AI is
required for migration.

```sh
elp init --content codemod --preset multipage --dry-run --json
elp init --content codemod --preset multipage --yes
# For an already installed panel:
elp migrate --dry-run --json
elp migrate --yes
```

The codemod generates keys, defaults, admin labels, sections and field types, and
connects supported page text. **Review its diff and skipped items, then run your
build and check the pages.** Imported components, dynamic content and unsupported
page shapes require manual work; server-rendered pages need a client boundary for
unsaved live preview. Private local backups allow restoring unchanged migrated
files. See [the exact scope and restore instructions](docs/CLI.md).

## Run this repository

This repository uses Node.js 24.x and pnpm 11.25.0. The standalone CLI supports Node.js >=22.13.

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Vercel uses the same `pnpm install --frozen-lockfile` and `pnpm build` flow as CI. Keep `pnpm-workspace.yaml`: its pnpm 11 `allowBuilds` policy explicitly approves reviewed native dependency scripts and skips the unused `msw` postinstall. If a dependency update produces `ERR_PNPM_IGNORED_BUILDS`, review the reported package/version and update that policy; do not enable all dependency scripts.

Without credentials, public pages render configured defaults and `/demo` works. The real editor requires Supabase, its migration and a strong password. Configure locally and in hosting:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-key
SUPABASE_SERVICE_ROLE_KEY=your-server-key
ADMIN_PASSWORD=at-least-16-random-characters
PANEL_SITE_URL=https://editable-landing-panel.vercel.app
```

Use `PANEL_SITE_URL=http://localhost:3000` locally. It is required for production mutation checks and is used for canonical URLs, sitemap and robots. Never expose admin, service-role, session or AI secrets through `NEXT_PUBLIC_*`. Analytics requires `NEXT_PUBLIC_GA_ID` and explicit visitor consent; rejecting it keeps Google scripts unloaded. Visitors can change their choice in Cookie settings. `/privacy` explains storage and providers; forks must adapt the operator/contact details. Geist fonts are self-hosted, with no external font downloads during builds or browsing.

Apply [the migration](supabase/migrations/202610280001_panel_security.sql) in Supabase SQL Editor. It preserves keys/values and is repeatable. It owns policies on the dedicated `public.content` table: review it if that table serves another application. Every content row is public; never store secrets or unpublished drafts there. Existing storage bucket settings/policies are preserved for separate review. Run [verify.sql](supabase/verify.sql) to inspect effective privileges after migration.

Login fails closed until its throttle migration is applied. A service-role Data API key cannot execute SQL migrations.

## Declare content once

```json
{
  "version": 1,
  "pages": [
    {
      "id": "home",
      "label": "Home",
      "path": "/",
      "sections": [
        {
          "id": "hero",
          "label": "Hero",
          "fields": [
            {
              "key": "home.title",
              "label": "Title",
              "type": "text",
              "default": "Welcome",
              "maxLength": 180
            }
          ]
        }
      ]
    }
  ]
}
```

Keys are globally unique; use page prefixes for new projects. Types: `text`, `textarea`, `image`, `url`. URLs must be HTTPS or root-relative; SVG image URLs are rejected. A page with ID `global` contributes shared fields to page reads. Config entries do not create Next.js routes.

Read values on the server:

```tsx
import { readContent } from '@/panel/server'
import Hero from './Hero'
export const revalidate = 0
export default async function Page() {
  const { values } = await readContent('home')
  return <Hero content={values} />
}
```

Opt a client section into unsaved preview:

```tsx
'use client'
import { usePreviewContent } from '@/panel/PreviewBridge'
export default function Hero({ content }: { content: Record<string, string> }) {
  const c = usePreviewContent(content)
  return (
    <section id="hero">
      <h1>{c['home.title']}</h1>
    </section>
  )
}
```

Messages are accepted only from the same-origin parent in an explicit preview iframe. The editor uses one iframe for desktop and mobile. For `next/image`, allow the exact Supabase storage hostname/path in your target Next.js config; the installer does not rewrite that file.

## Terminal and AI workflows

```sh
elp pages list --json
elp schema --json
elp content export --remote --out backup.json
elp content import changes.json --remote --dry-run
elp content import changes.json --remote --yes
```

Imports validate the entire batch before one atomic upsert and never delete unspecified keys. Exports contain merged values, not the exact set of override rows. Restore them with a reviewed import. Local imports can write an explicit `--out` proposal or update config defaults with `--defaults --yes`. Neither changes saved database overrides.

Codex/Claude can consume the schema and prepare imports without another AI account. With no local Gemini key the CLI uses the deployed shared service. A local GEMINI_API_KEY takes priority and goes only to Google; GEMINI_MODEL optionally overrides the default gemini-3.5-flash-lite:

```sh
elp ai brief.txt --page home
elp ai brief.txt --page home --out proposal.json --yes
elp content import proposal.json --remote --dry-run
```

AI sends field definitions and your brief to Google, requests structured JSON, validates it and shows a diff. It never publishes. Review provider availability, quotas and data-use terms before sending confidential material. `ai --dry-run` still calls Google but does not write a file.

See [CLI reference](docs/CLI.md) and `/docs` for full instructions.

## Verification and production scope

```sh
pnpm check       # CLI assets, lint, Next types, unit/API/SQL/CLI tests
pnpm build
pnpm test:e2e    # Local mock Supabase; never your live database
node scripts/smoke-install.mjs
```

Browser tests need `pnpm exec playwright install chromium` or `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chromium`. Database tests use local PGlite. Restricted environments may require permission for subprocesses and local ports.

This is a single shared-admin editor: no per-user roles, individual token revocation, database drafts, revision history or conflict detection. Concurrent editors use last-write-wins. Password rotation revokes all sessions; logout clears the browser cookie but cannot invalidate a copied token before expiry.

Use HTTPS, a long unique password and the correct origin. Login has a conservative shared limit of 10 attempts per 15 minutes across instances. Enable `PANEL_TRUST_PROXY` only behind a proxy that overwrites `x-forwarded-for`. Add hosting limits for volumetric attacks and abusive authenticated uploads. Orphaned files are retained deliberately: inspect references and backups before cleanup.

Production readiness requires applying/verifying the live migration, reviewing storage policies and testing hosting. Local checks cannot certify remote permissions. See [security notes](docs/SECURITY.md) and [iteration report](docs/IMPLEMENTATION_REPORT.md).

MIT © Pavel Sumin. See [LICENSE](LICENSE).

## Optional AI help during installation

```sh
elp init --preset multipage --ai brief.txt --yes
# Review the proposal, then change local defaults:
elp content import panel-content.proposal.json --defaults --dry-run
elp content import panel-content.proposal.json --defaults --yes
```

AI writes a proposal, never publishes. Without --page it uses the first configured page plus shared fields. Shared quota failure prints instructions for a personal key; the installed editor still works without AI.

To host the shared service in this repository, apply migration 002 and configure Vercel with GEMINI_API_KEY, optional GEMINI_MODEL, PANEL_AI_ENABLED=true and a random PANEL_AI_RATE_SECRET of at least 32 characters. The default model is gemini-3.5-flash-lite. Users of an installed editor only need migration 001 and their own Supabase.

The build embeds the public HTTPS PANEL_SITE_URL into the downloaded CLI's shared endpoint; no private keys are included. Shared budgets are 3/client/day and 20 total/day (UTC), not a guarantee of free provider quota. A local own key bypasses the shared operator and its allowance. See /docs, docs/CLI.md and docs/SECURITY.md.
