import type { Metadata } from 'next'
import { SiteHeader, SiteFooter } from '@/components/site-chrome'
import { CookieSettingsButton } from '@/components/privacy-controls'

export const metadata: Metadata = {
  title: 'Privacy & cookies | Edit.',
  description:
    'How Edit. uses essential storage, optional analytics, Supabase and optional Gemini assistance.',
  alternates: { canonical: '/privacy' },
}

const external = 'underline underline-offset-4 hover:text-foreground'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Your data, clearly explained
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-5">
          Privacy & cookies.
        </h1>
        <p className="text-muted-foreground mt-5 leading-relaxed">
          This policy covers the official Edit. website at
          editable-landing-panel.vercel.app. Last updated: 28 October 2026.
          Forks and websites installed with the CLI are operated independently
          and need their own privacy information.
        </p>
        <div className="border rounded-2xl p-6 my-10 space-y-3">
          <h2 className="font-semibold">You control analytics.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Google Analytics is optional. We do not load its scripts or send
            analytics requests until you accept. Rejecting it leaves the website
            and editor usable. You can withdraw consent at any time; we disable
            analytics, remove accessible Google Analytics cookies and reload the
            page to stop its loaded scripts.
          </p>
          <div className="text-sm">
            <CookieSettingsButton />
          </div>
        </div>
        <div className="space-y-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-4 [&_p]:text-muted-foreground [&_p]:leading-relaxed">
          <section>
            <h2>Who operates this website</h2>
            <p>
              Edit. is an open-source project by Pavel Sumin. To contact the
              maintainer about privacy, access, deletion or consent, use the
              contact options at{' '}
              <a
                className={external}
                href="https://pavelsumin.com/"
                target="_blank"
                rel="noreferrer"
              >
                pavelsumin.com
              </a>
              . Do not post personal data, API keys or passwords in public
              GitHub issues.
            </p>
          </section>
          <section>
            <h2>Essential storage</h2>
            <p>
              The administrator’s elp-session cookie keeps the editor signed in
              for up to eight hours. It is HttpOnly, SameSite=Strict and Secure
              in production, and contains a signed session token rather than the
              password. Browser local storage under edit-cookie-consent-v1
              remembers your acceptance or rejection, timestamp and analytics
              property for up to 180 days. If browser storage is unavailable,
              your selection applies to the current page and may be requested
              again. Demo edits and unsaved drafts stay in browser memory and
              are reset on reload.
            </p>
          </section>
          <section>
            <h2>Optional Google Analytics</h2>
            <p>
              If this deployment has an analytics property configured and you
              consent, Google Analytics receives usage information such as page
              views, browser/device details, referrer and approximate location.
              Google processes request information including IP addresses;
              Google states that GA4 does not log or store individual IP
              addresses. Analytics cookies such as _ga and _ga_* identify a
              browser and may last up to two years, depending on the property
              settings. Reporting retention is controlled by that property’s
              Google Analytics settings. Admin and embedded preview pages do not
              initialize analytics. We do not send editor field values, admin
              passwords or API keys as analytics events.
            </p>
            <p className="mt-4">
              Consent is the basis for optional analytics. Read{' '}
              <a
                className={external}
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Google’s privacy policy
              </a>{' '}
              and{' '}
              <a
                className={external}
                href="https://support.google.com/analytics/answer/12017362"
                target="_blank"
                rel="noreferrer"
              >
                GA4 data practices
              </a>
              . Withdrawing consent stops future collection on this browser; it
              does not automatically delete previously collected reports.
              Contact the maintainer for deletion requests.
            </p>
          </section>
          <section>
            <h2>Hosting, published content and security</h2>
            <p>
              Vercel hosts this website and processes network requests and
              technical logs needed to deliver and protect it. Supabase stores
              published text, uploaded images and security counters. All content
              in this editor’s published content table and its public image
              bucket is intended to be public. Do not upload personal or
              confidential material there. Login protection uses shared
              counters; deployments configured to trust a proxy may also use
              client IP information for throttling. These services may process
              data in countries different from yours; the selected project
              regions and provider terms govern those transfers.
            </p>
            <p className="mt-4">
              Published content remains until the operator changes or deletes
              it. Replacing an image does not automatically delete the previous
              upload. Security counters expire logically according to their
              throttle windows; infrastructure logs and backups follow the
              operator’s provider settings. Hosting and security processing are
              used to operate the service and prevent abuse.
            </p>
          </section>
          <section>
            <h2>Optional Gemini assistance through the CLI</h2>
            <p>
              Normal website browsing and editor use do not send your content to
              Gemini. When you explicitly run an AI command, the brief and
              selected text-field definitions/defaults are sent for generation.
              The shared service forwards these to Google and keeps HMAC-hashed
              client-IP quota fingerprints and daily counters in Supabase.
              Failed generation attempts also consume quota. Old quota rows are
              removed when the budget function processes a later day; removal is
              not a scheduled daily job.
            </p>
            <p className="mt-4">
              With your own GEMINI_API_KEY, the CLI contacts Google directly and
              does not send that key to this website. Do not include secrets or
              sensitive personal information in prompts. Google’s{' '}
              <a
                className={external}
                href="https://ai.google.dev/gemini-api/terms"
                target="_blank"
                rel="noreferrer"
              >
                Gemini API terms
              </a>{' '}
              govern processing and possible use of prompts and responses,
              including different rules for free and paid services. Running an
              AI command is a separate, explicit action; accepting analytics is
              not consent to AI processing.
            </p>
          </section>
          <section>
            <h2>Your choices and requests</h2>
            <p>
              You can reject analytics, change your selection using Cookie
              settings, clear browser storage, and use browser privacy controls.
              Depending on applicable law, you may request access, correction,
              deletion, restriction, portability or object to processing, and
              raise a complaint with your data-protection authority. Contact the
              maintainer using the link above with enough information to
              identify your request. We do not sell personal data or use this
              website to make automated decisions with legal or similar
              significant effects.
            </p>
          </section>
          <section>
            <h2>Providers and changes</h2>
            <p>
              Read the privacy policies of{' '}
              <a
                className={external}
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noreferrer"
              >
                Vercel
              </a>{' '}
              and{' '}
              <a
                className={external}
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Supabase
              </a>
              . This page describes this deployment’s actual features. If those
              features or providers change, this policy and, when needed, the
              consent choice will be updated.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
