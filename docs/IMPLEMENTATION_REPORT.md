# Implementation report — 2026-10-28

## Current status

The local release candidate passes the final production build, 25 automated checks,
nine browser scenarios, and a clean-project installation/build from the actual
packed download. The earlier subprocess-review limitation was resolved and the
previously pending CLI cases have now run.

The user reports configuring Vercel, Gemini and applying the migrations directly. No secret is needed in this
Codex environment to prepare the release. Live Supabase permissions, migrations,
Google responses and hosting configuration are **not verified remotely**. No live
content was modified, no SQL was applied remotely, no npm package was published and
no site was deployed during this work.

## Architecture and editor

- Versioned JSON defines pages, sections, fields, defaults, labels and validation.
  Homepage legacy keys remain compatible; new pages use namespaced keys.
- Shared content reader selects registered keys in bounded batches and validates
  overrides. Public pages fall back to defaults with a warning; admin reads report
  errors. A global page contributes shared fields.
- Responsive editor supports page selection, field search, draft preview, explicit
  atomic saving, reset, URL selection and unsaved-change protection. Failed saves
  retain drafts. A single iframe serves mobile and desktop.
- Preview checks parent/source/origin/channel and validates values. It never saves.
- Public demo uses the same editor with browser-only state. About, Contact and the
  editable documentation demonstrate multi-page integration.
- `/docs` now provides 18 task/reference sections, grouped navigation, a restored fixed sidebar with collapsible groups, a mobile drawer, keyboard
  search, full-text/table/code search, copyable commands, environment/command/API
  tables and deployment instructions. Download commands use the configured domain.
  A test checks its defaults against the maintained guide and its API method list
  against actual route handlers.

## Security

- Passwords are no longer stored in localStorage or sent on every content request.
  Signed HttpOnly sessions expire after eight hours; production cookies are Secure
  and SameSite=Strict. Password rotation revokes all sessions. Mutations check Origin
  and require the production site origin configuration.
- Login attempts use an atomic, service-role-only PostgreSQL throttle shared across
  instances. Missing/offline protection fails closed. Migration 001 enables RLS,
  explicitly revokes public mutations including TRUNCATE, and preserves content.
- Content writes require registered keys and validated bounded string/URL values.
  Whole batches are checked before one atomic upsert.
- Uploads enforce a streamed size bound and decoded pixel bound, ignore source MIME
  claims/filenames, re-encode to WebP, strip metadata and use immutable UUID names.
- Server-only database code isolates service-role credentials. Analytics requires explicit visitor consent;
  exact image host/path restrictions and baseline response headers are configured.
- Local PostgreSQL tests include inherited PUBLIC grants, repeat migrations, public
  mutation/RPC denial, throttle exhaustion/reset and server writes.

## CLI distribution and AI

- Package: `editable-landing-panel`; executable: `elp`; version: 0.2.0.
- `pnpm build` generates runtime assets and a public tarball before Next.js builds.
  Vercel serves `/downloads/editable-landing-panel-0.2.0.tgz`. Users can run
  `npx --package=https://DOMAIN/downloads/editable-landing-panel-0.2.0.tgz elp init`.
  This path needs no npm account. A short registry command requires separate npm
  publication; it is not performed automatically.
- Installer supports root/src App Router layouts and configured aliases, refuses
  source/route-group/symlink conflicts, preserves existing pages and edited config,
  remembers the preset and detects the package manager. No Tailwind/shadcn is
  required by emitted runtime code. Automatic upgrades are not implemented.
- Commands provide dry-run, JSON, diagnostics, schema, pages, export/import and AI.
  Imports target remote Supabase, local defaults or a proposal file explicitly.
- `init --ai brief.txt` installs deterministically, then prepares a proposal. AI
  never rewrites arbitrary source code or publishes. A partial AI failure is reported
  separately and the installed editor remains usable.
- Without a local key, CLI uses the operator's shared service. With GEMINI_API_KEY it
  calls Google directly and never sends that key to the operator. Default model:
  `gemini-3.5-flash-lite`. ELP_AI_URL/--ai-url override a shared endpoint.
- Vercel build embeds only the public PANEL_SITE_URL into the downloaded CLI's
  default service URL. Private environment values are never bundled.
- Shared endpoint is disabled by default. It needs migration 002, enable flag,
  server key and a random rate secret. Trusted platform IPs are HMAC-hashed, and
  PostgreSQL atomically reserves 3/client/day and 20 total/day (UTC). Payload/output
  bounds, fixed server model and no tool execution constrain its purpose. Quota
  failures explain own-key fallback. Public budgets are not bot authentication or a
  guarantee of free provider usage; platform abuse/billing controls remain necessary.

## Verification

- Deployment install regression: reproduced `ERR_PNPM_IGNORED_BUILDS` with the
  committed lockfile and pnpm 11.25.0 in a separate directory without node_modules.
  Replaced pnpm 10's ignoredBuiltDependencies with version-specific pnpm 11
  allowBuilds decisions: sharp 0.34.5 and unrs-resolver 1.11.1 approved; unused msw
  2.12.14 postinstall denied. A second fresh installation with frozen lockfile and
  strict build checks enabled passed, followed by the full production build without
  a Next.js cache. Package downloads reused the local content-addressable store;
  registry supply-chain checks remained enabled. Both sharp versions encoded WebP
  and unrs-resolver loaded its native module. Root Node is pinned to 24.x; the
  standalone CLI retains its Node >=22.13 requirement. README and on-site
  troubleshooting explain the policy. No migration or secret changes are needed
  for this installation fix.
- Final `npm run build`: CLI asset generation, downloadable tarball and Next.js
  production compilation/typechecking succeeded. The tarball has 28 whitelisted
  entries and is approximately 25 KB.
- ESLint and diff whitespace checks passed.
- 25 local checks passed: 7 core/session/body, 5 API, 2 provider/payload, 8 CLI,
  2 PostgreSQL migration suites, and 1 documentation consistency check.
- 9 browser scenarios on system Chromium with local mock Supabase: demo edits and
  per-field saving; authenticated previews/failed-save retention/page switching/
  logout; mobile editor/search; restored desktop layout and keyboard search;
  mobile docs drawer/privacy/404; image dialog validation and local upload;
  analytics acceptance/rejection/persistence/withdrawal; expired consent plus
  admin/preview exclusions; unavailable browser storage. Google scripts are mocked
  and request counts prove they stay unloaded before acceptance and after rejection.
- Clean fixture installed the actual packed CLI into src/app and compiled it on
  Next.js 16.2.1 without allowJs or Tailwind/shadcn configuration. The fixture reuses
  session dependencies via a symlink: this proves generated-source portability,
  not a fresh registry dependency resolution on every OS/version.
- Tests use fake provider keys/local databases and never mutate the live project.
  Actual Google generation with the owner's model/key must be checked after deploy.

## Interface restoration and visitor privacy

- Restored the pre-refactor neutral editor appearance: original login, preview on
  the left, rounded field cards on the right, click-to-edit text, field Save/Reset,
  image upload dialog, section accordions, mobile Edit/Preview and theme controls.
  Page selection, validated batch writes, retained failed drafts, signed sessions
  and the shared runtime/CLI architecture remain in place. The scope is visual
  restoration over the maintained implementation rather than restoring old APIs.
- Restored the documentation's fixed 256px sidebar/logo, collapsible navigation,
  active section, mobile drawer, theme controls and modal search with Ctrl/Cmd+K.
  Current instructions, command copying, tables and content integration remain.
- Restored Geist/Geist Mono as self-hosted, licensed font files; no Google Fonts
  connection is required at build time or while browsing.
- Added explicit analytics acceptance/rejection and persistent preferences with a
  180-day limit, property scoping, fail-closed handling of unavailable storage,
  cross-tab preference synchronization and a Cookie settings entry point.
  Withdrawal disables collection, clears accessible GA cookies and reloads to
  unload Google's runtime. The essential admin cookie is unaffected.
- Added `/privacy`, provider/storage/AI disclosures and privacy links. Forks need
  their own operator/contact information and provider retention review.
- Added a responsive, theme-aware custom 404 using the homepage's typography,
  branding, buttons and neutral palette. Unknown routes retain HTTP 404 status.
- No new environment variables, dependencies or SQL migrations are required for
  this follow-up. Existing NEXT_PUBLIC_GA_ID enables analytics only after consent.

## Required deployment steps

1. Back up existing Supabase content. Apply migration 001 to the CURRENT project
   before deploying its upgraded admin; it is not only for future CLI customers.
2. Apply migration 002 only if hosting shared AI. Ordinary installed websites need
   migration 001 and their own Supabase, not access to the operator's database.
3. Run verify.sql and, for shared AI, verify-shared-ai.sql; review existing bucket
   policies separately. Env keys alone do not execute SQL. Data API credentials
   cannot apply DDL; use SQL Editor or an authorized SQL connection.
4. In Vercel use Node 24, repository root, and `pnpm build`. Set Supabase variables,
   strong ADMIN_PASSWORD and exact HTTPS PANEL_SITE_URL. For shared AI also set
   GEMINI_API_KEY, optional GEMINI_MODEL, PANEL_AI_ENABLED=true and a random
   PANEL_AI_RATE_SECRET (32+ characters).
5. Deploy, test actual admin reads/writes/uploads, download the CLI and exercise
   shared and own-key AI modes. A live deployment is not certified by local tests.

## Deliberate limits

Single shared administrator; no per-user roles, individual token revocation,
revision history, database drafts, approval workflows or conflict detection.
Concurrent edits are last-write-wins. Open visitor pages need refresh. Config
entries do not create arbitrary Next.js routes. Orphan cleanup is manual. Public
AI budgets may be exhausted by other users/abuse; provider quotas can be lower.
This work is not an independent penetration test or a guarantee of future dependency
security. See SECURITY.md and the on-site guide for operational details.
