# Documentation and theme review — 2026-10-29

This update keeps the existing documentation sidebar, responsive navigation and neutral visual style. It changes the guide content, adds small explanatory components and fixes document/browser theme colors. The downloadable CLI is version 0.3.1 so a new installation receives the corrected runtime.

## Documentation corrections

The maintained guide was compared with the CLI installer, codemod, config schema, content reader, editor, API handlers, AI client/operator endpoint and packaging scripts.

- Separate adding the editor to an existing website from hosting this repository and its optional shared AI endpoint.
- Show the real Vercel-hosted archive, dry-run and explicit manual/codemod installation paths. Explain the optional global installation behind shorter `elp` commands.
- State what remains manual: Supabase provisioning, migration 001, private env values, deployment and unsupported component integration. Migration 002 belongs only to the shared AI operator.
- Use the target website’s own origin in generic env examples. Explain updating preset `/panel-example` paths and inspecting generated page IDs after migration.
- Distinguish published server reads from unsaved client preview. Document codemod scope, generated labels/defaults, skipped syntax, backups, restore and required review.
- Explain that Gemini is an optional remote API command included in the CLI. It generates reviewed proposals, never publishes automatically, and supports an own-key override with separate provider quotas.
- Distinguish local defaults, saved overrides, portable exports, source snapshots and database backups. Updating defaults does not replace saved overrides.
- Separate target-project checks from scripts belonging to this repository. Document the image host allowlist and the absence of automatic installed-runtime upgrades.

Small task cards, outcome notes, review callouts, a content-flow diagram, collapsible checklists, inline code and labelled/copyable snippets supplement the existing article. Search indexes the new reference content. The additions use existing icons and native HTML without additional dependencies.

`docs/guide.json` and the editable documentation defaults in `editable-panel.config.json` are synchronized. Existing published documentation overrides in Supabase still take precedence, as for other editable content; this update does not overwrite them. Operators who previously customized those fields should review or reset the affected overrides after deployment.

## Theme correction

Previously the public site toggled the root class while Safari's `theme-color` remained tied to the OS preference. The editor changed its scoped panel palette without repainting the surrounding document.

The shared helper now synchronizes `html`, `body`, native-control `color-scheme` and all `theme-color` entries. Explicit light/dark choices override OS media preference; metadata changes during navigation are corrected. The website applies the theme before hydration and follows system/cross-tab changes. Blocked persistent storage does not prevent a manual selection on the current client session.

The full editor applies its document palette during session checking, login and editing, persists the selection, updates the preview, and restores captured host styles when unmounted. Embedded demos follow the host without taking ownership of its background. Preview messages retain the host website's palette rather than imposing this project's colors on installed applications.

The CLI archive includes `panel/theme.mjs`, its declarations and the updated editor/preview modules. Updating a global CLI does not merge already installed runtime files; the update procedure is documented in `docs/CLI.md`. No new SQL migration or env setting is needed for this theme fix.

## Validation

- TypeScript route generation/typecheck, ESLint and diff whitespace checks passed.
- 31 Node tests passed, including CLI/codemod, API, database permissions and documentation source/version checks.
- 19 Chromium browser scenarios passed, including editor drafts/save failures, login, preview, consent, sidebar/history/search, task cards/checklists, theme changes and mobile overflow at 320/375/390/767 px.
- Production Next.js build and CLI packaging passed.
- The actual packed CLI installed a multipage `src/app` fixture, migrated server/client pages and compiled with strict TypeScript without Tailwind, shadcn or `allowJs`. The fixture reused the workspace dependency installation; this is not a fresh package-registry resolution test.
- A production browser check verified the serialized theme bootstrap with hydration scripts blocked, then checked hydrated light/dark body and metadata, desktop/mobile docs, and absence of JavaScript/hydration errors. Production screenshots were visually reviewed.

Chromium verifies the document colors and browser metadata used by Safari. Physical iPhone Safari chrome/overscroll was not tested in this environment. Live Supabase/Gemini behavior and production deployment are not certified by these checks; their outbound destinations are restricted here. Existing credentials, production data and SQL were not changed.
