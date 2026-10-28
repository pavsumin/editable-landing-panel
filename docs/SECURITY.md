# Security and production operations

## Trust boundaries

- The dedicated Supabase content table contains public website values only. No secrets or unpublished drafts belong there. RLS and explicit grants prevent public writes.
- The service-role key stays in server-only runtime code or local CLI processes.
- HMAC-signed browser sessions expire after eight hours. Production cookies require HTTPS; a configured production origin is mandatory for mutations.
- Passwords are not stored in browser storage. Legacy localStorage entries are deleted when loading the new editor.
- An authenticated shared administrator may update all registered fields. There are no individual accounts, roles or individual token revocation.
- Batch validation happens before an atomic upsert. Field values and bodies are bounded. Concurrent editors use last-write-wins.
- Images are decoded with a pixel bound and re-encoded to WebP. Filenames and client MIME declarations are not trusted. Animations are flattened and source metadata discarded. Node.js runtime is required, not Edge.
- Preview checks origin, source window, channel and field values. Messages cannot persist content.
- AI is initiated by CLI and uses either a direct local key or the optional server-side shared endpoint. It never publishes or executes returned code; provider terms govern briefs. Shared server credentials are never bundled or returned.

## Deployment gate

1. Back up content and review the migration. It replaces policies on the dedicated content table and preserves old records, including null values.
2. Apply SQL through Dashboard or an authorized migration connection. A service-role Data API key is not a PostgreSQL administration credential.
3. Run `supabase/verify.sql`. Anonymous/authenticated users must have SELECT only, including no TRUNCATE. Login table/RPC must not be public.
4. Review ALL storage.objects write policies and existing images bucket settings. Metadata does not prove write protection; unrelated permissive policies may apply globally. Do not blindly remove policies for other buckets.
5. Set a random 16+ character ADMIN_PASSWORD and exact HTTPS PANEL_SITE_URL in hosting. ADMIN_SESSION_SECRET is optional. Enable forwarded-IP handling only if trusted ingress overwrites the header.
6. Run remote diagnostics, then test login/logout/save/reset/upload on the deployment. Verify unauthenticated/cross-origin requests fail.
7. Configure hosting request/body/concurrency limits, backups and monitoring. Login throttling is not a DDoS protection service.

The throttle is atomic PostgreSQL state shared by all app instances. Default mode has a shared 10-attempt bucket per 15 minutes, including successful logins. Trusted-IP mode limits each IP to 10 and the account to 100. Missing/offline RPC fails closed. Attackers can intentionally exhaust attempts; select hosting abuse protection appropriate to your exposure.

## Upgrades and rollback

Legacy keys are preserved. Old password-header endpoints are intentionally removed: custom integrations must migrate to the new API or use the local CLI. The new editor deletes legacy localStorage passwords.

Back up the table before migration and export content before bulk imports. The migration adds timestamps and throttle objects without dropping website content. Rolling application code back must not restore public write grants. Automatic CLI upgrades are not implemented; modified source conflicts require review.

Uploads use immutable UUID paths. Orphan cleanup is manual to avoid deleting assets referenced by another page or older backup. A successful upload followed by a cancelled save can remain unreferenced. Monitor storage consumption.

## Validation boundaries

Local PGlite checks migration semantics and role denial in a fresh PostgreSQL instance. API tests mock external storage. Browser scenarios run local adapters. They do not certify live Supabase permissions, hosting ingress, future dependency advisories or an independent penetration test.

## Optional shared AI service

The root website includes POST /api/editable-panel/assist. It is disabled by default. Hosting it requires migration 002, PANEL_AI_ENABLED=true, a server GEMINI_API_KEY and a random PANEL_AI_RATE_SECRET of 32+ characters. The model defaults to gemini-3.5-flash-lite; callers cannot select the server model.

Only a bounded brief and 1–64 text field definitions are accepted. No tool execution, database publication, user-provided provider URL or prompt-controlled model is possible. The database atomically reserves at most 3 requests/client-IP/day and 20 total/day (UTC), across instances. Reservations are consumed even if Google fails. HMAC fingerprints are stored instead of raw IPs. The endpoint trusts Vercel's platform IP header, or explicitly configured trusted ingress outside Vercel; missing trusted IP/protection fails closed.

This public endpoint is not bot authentication: an attacker can exhaust its shared allowance, and rejected requests still consume hosting/database resources. Configure platform abuse controls and provider billing limits. Google free-tier availability is not guaranteed by the application. CLI clients can supply a local key, sent directly to Google. No key is passed to the shared service in that mode.

Vercel build packages the CLI for public download and embeds only the public site origin. A changed domain requires re-downloading or overriding ELP_AI_URL in existing clients. All private environment values remain server-side.

## Visitor privacy

Google Analytics initializes only on public, non-preview pages after explicit
acceptance. Acceptance and rejection are stored locally for up to 180 days; a new
property ID or expiry requires a new choice. Missing/blocked storage keeps
analytics disabled on the next page load. Cookie settings allows withdrawal,
disables collection, clears accessible analytics cookies and reloads to unload
the Google runtime. The login cookie is essential and is not cleared by rejecting
analytics. `/privacy` describes Vercel, Supabase, analytics and optional Gemini
processing. Fork operators must replace the policy's operator/contact information
and review their own retention settings. Fonts are served locally.
