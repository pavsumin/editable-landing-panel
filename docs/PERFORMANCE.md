# Performance, navigation and SEO follow-up

This follow-up keeps the existing layout and appearance.

- Documentation observes section headings with IntersectionObserver instead of
  reading all section rectangles on every scroll frame. The article is memoized;
  scroll highlighting and search no longer rebuild its tables and code blocks.
  Search text is indexed once per content change.
- Sidebar anchors use browser history. Search/mobile navigation waits for the
  dialog to release focus/scroll locking, then jumps directly to the heading.
  Deep links and browser Back are covered by browser checks.
- The homepage demo loads when its container enters the viewport. Its editor
  stays out of the initial page module. Full panel configuration is imported by
  the preview bridge only in an explicit embedded preview, rather than shipped
  eagerly to every visitor. Preview content still validates incoming messages.
- Public reads retain no-store publication semantics. Registered-key batches run
  concurrently, public fetches time out after three seconds and use documented
  defaults; strict reads and normal database operations retain ten seconds.
  React request-scoped deduplication does not cache content across visitors.
- Theme initialization runs in the document head before paint. One theme hook
  manages saved preference, system preference and cross-tab changes. The homepage
  no longer overwrites the theme on route changes. Native controls follow the
  selected color scheme. Reduced-motion preferences are respected.
- Internal homepage documentation navigation uses Next Link. Responsive image
  sizes/aspect ratios and the primary self-hosted font preload avoid unnecessary
  image/font work. Route loading UI provides feedback while server data arrives.
- Public routes have distinct titles/canonicals/social metadata. Preview URLs get
  noindex and canonicalize to the clean route. Sitemap includes demo/privacy,
  robots references the configured site origin, and JSON-LD is server-rendered
  on the relevant pages rather than injected globally after hydration.

Validation: 25 automated checks, 11 browser scenarios, production build and a
packed-CLI installation/build in a separate src/app fixture. Browser scenarios
include actual anchor coordinates, browser history, saved theme across reloads
and routes, preview noindex, authenticated preview, and analytics consent.
These local checks do not establish live Core Web Vitals or a Lighthouse score.
Measure the deployed version with real content, database region and devices;
public latency still depends on Supabase/Vercel and connection conditions.

A local production Chromium check at 1280×720 confirmed that the initial homepage
loaded neither the editor module nor the complete panel configuration. Scrolling
to the demo loaded the editor on demand. Documentation loaded neither module;
clicking the API sidebar link positioned its heading 112px from the viewport top,
below the sticky header. No page JavaScript errors were observed in that run.
Database credentials were intentionally unset for this local check (config defaults).
