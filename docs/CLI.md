# Editable Landing Panel CLI · 0.2.0

The package is `editable-landing-panel`; the executable is `elp`. Requires Node >=22.13, TypeScript App Router, Next.js 15/16 and React 19. Independent installation builds are checked on Next 16.2.1. `@/*` must map to `./*` or `./src/*`. No Tailwind/shadcn or AI account is required for the editor.

## Install without npm publication

This repository's `pnpm build` runs `cli:build`, packages the CLI and builds Next.js. Vercel serves the generated tarball. Use the official project download:

```sh
npx --package=https://editable-landing-panel.vercel.app/downloads/editable-landing-panel-0.2.0.tgz elp init --preset multipage --dry-run --json
npx --package=https://editable-landing-panel.vercel.app/downloads/editable-landing-panel-0.2.0.tgz elp init --preset multipage --yes
# Optional permanent installation:
npm install --global https://editable-landing-panel.vercel.app/downloads/editable-landing-panel-0.2.0.tgz
elp --help
```

No npm account is needed for this download path. The shorter `npx editable-landing-panel@0.2.0 init` requires a separate successful npm publication; Vercel deployment does not perform one. To pack locally use `pnpm cli:pack`, then use the resulting local tarball with `npx --package=/absolute/path/file.tgz elp ...`.

`init` adds `/admin`, `/api/editable-panel/{session,content,upload}`, scoped runtime files, config, an env example and migration 001. `minimal` adds `/panel-example`; `multipage` also adds `/panel-example/about` and `/panel-example/contact`. Your existing homepage is never replaced. Conflicting files, route groups and symlink destinations are refused before changes. Unchanged repeated installs are safe, edited config is preserved, and the selected preset is remembered. Use `--no-install` to skip package-manager execution; dependency declarations are still added. Automatic source upgrades are not implemented.

## What is automated, and what remains

The CLI installs the editor/API/runtime, adds missing dependencies, generates the
preset config, example routes, environment template and SQL migration. It checks
conflicts and can diagnose the configured project. It does not provision Supabase,
execute SQL through a Data API key, fill private environment values or deploy.

For an existing website, a developer still declares its fields and connects its
components to the shared reader and optional preview hook. The installer preserves
the existing homepage and does not infer arbitrary JSX layouts. A coding assistant
can perform this integration using the documented API and config.

Optional Gemini assistance takes a brief and declared text fields, then produces a
validated JSON proposal. It does not integrate components, change database policies
or publish content. Review the proposal and explicitly import it into config
with `--defaults --yes` or publish it with `--remote --yes`. Use `--page` to generate
copy for additional pages. The editor itself works without AI.

## Database and environment

Apply generated `supabase/migrations/202610280001_panel_security.sql` in Supabase SQL Editor before login. It preserves content but takes ownership of the dedicated content table's policies. Review if another application uses that table. Existing storage settings/policies need separate inspection. Data API keys cannot execute SQL migrations.

This repository's existing database needs the same upgrade before deploying the new admin. Migration 002 is only for the optional operator-hosted shared AI service, not a requirement for ordinary CLI users.

Environment is read from the shell, `.env.local`, then `.env`. Set the Supabase URL, anon key, service-role key and a random 16+ character ADMIN_PASSWORD. Production needs exact HTTPS PANEL_SITE_URL. Never expose private variables through NEXT_PUBLIC. Leave PANEL_TRUST_PROXY disabled unless trusted ingress overwrites forwarded headers.

## Commands

```sh
elp init --preset multipage --ai brief.txt --yes
elp doctor --remote --json
elp pages list --json
elp schema --json
elp content export --remote --out backup.json
elp content import proposal.json --defaults --dry-run
elp content import proposal.json --defaults --yes
elp content import proposal.json --remote --dry-run
elp content import proposal.json --remote --yes
elp ai brief.txt --page home --out proposal.json --yes
```

Exports merge defaults and saved values; they are portable snapshots, not override-only backups. Import validates the entire batch and changes only supplied keys. Choose one target: `--remote --yes` publishes one atomic database upsert; `--defaults --yes` updates local config defaults; `--out file --yes` writes a proposal only. Updating defaults does not replace existing database overrides. No output file is silently overwritten.

All commands support `--cwd` and `--json`. `--dry-run` prevents file/database writes. Explicit `ai --dry-run` still calls its provider and consumes quota; `init --dry-run --ai brief.txt` does not call AI. Exit 0 is success, 1 failure, 2 a successful installation with failed optional AI assistance. JSON results for init include the optional AI result in one document.

## AI: shared service or your own key

AI prepares copy for registered text fields, not arbitrary code refactors. `init --ai brief.txt --yes` produces `panel-content.proposal.json` after installing the preset. Review it, then use `content import --defaults` or an explicit remote import. AI never publishes. By default it uses the first configured page plus shared fields; choose another with `--page`.

With no local GEMINI_API_KEY, requests go to the shared endpoint. When packed during Vercel build, PANEL_SITE_URL is baked into the downloadable CLI as its default public endpoint. Without a configured HTTPS origin the source default is `https://editable-landing-panel.vercel.app/api/editable-panel/assist`. The service is available only after deployment, enabling and migration 002. `ELP_AI_URL` or `--ai-url` can point to a different trusted HTTPS deployment; changing the website domain does not update already downloaded packages.

A local GEMINI_API_KEY always takes priority and is sent only to Google. Obtain a key from Google AI Studio, check the free tier on that project, add it to `.env.local` and retry the same command:

```dotenv
GEMINI_API_KEY=your-own-key
GEMINI_MODEL=gemini-3.5-flash-lite
```

The model setting is optional; the default is gemini-3.5-flash-lite. Shared quota exhaustion produces an actionable own-key message, never an automatic switch to a paid account. Shared budgets are 3 requests/client/day and 20 total/day (UTC); Google quotas can be lower. A free tier is not unlimited. Do not send secrets in the brief: selected defaults/field descriptions and the brief are processed by the shared operator and Google, or only Google in own-key mode.

`doctor --remote` inspects content/bucket metadata and an empty anonymous upsert; no rows are written. It cannot prove every SQL grant, RPC or storage policy. Run the SQL verification and deployment checks described in `/docs`.
