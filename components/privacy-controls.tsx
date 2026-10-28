'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Cookie, ShieldCheck } from 'lucide-react'

const STORAGE_KEY = 'edit-cookie-consent-v1'
const SETTINGS_EVENT = 'edit-cookie-settings'
const MAX_AGE = 180 * 24 * 60 * 60 * 1000

type Consent = 'accepted' | 'rejected'
type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void
  [key: `ga-disable-${string}`]: boolean
}

export function CookieSettingsButton() {
  return (
    <button
      className="cursor-pointer hover:text-foreground transition-colors underline-offset-4 hover:underline"
      onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))}
    >
      Cookie settings
    </button>
  )
}

function clearAnalyticsCookies() {
  const domains = new Set(['', window.location.hostname])
  const labels = window.location.hostname.split('.')
  for (let index = 0; index < labels.length - 1; index++)
    domains.add('.' + labels.slice(index).join('.'))
  const paths = new Set(['/'])
  const segments = window.location.pathname.split('/').filter(Boolean)
  for (let index = 1; index <= segments.length; index++)
    paths.add('/' + segments.slice(0, index).join('/'))
  for (const entry of document.cookie.split(';')) {
    const name = entry.trim().split('=')[0]
    if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name)) continue
    for (const domain of domains)
      for (const path of paths)
        document.cookie = `${name}=; Max-Age=0; Path=${path};${domain ? ` Domain=${domain};` : ''} SameSite=Lax`
  }
}

export default function PrivacyControls({ gaId }: { gaId?: string }) {
  const pathname = usePathname()
  const configured = !!gaId && /^G-[A-Z0-9]+$/.test(gaId)
  const [choice, setChoice] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState(true)
  useEffect(() => {
    let stored: Consent | null = null
    try {
      const record = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (
        record &&
        record.gaId === (gaId || '') &&
        (record.choice === 'accepted' || record.choice === 'rejected') &&
        typeof record.at === 'number' &&
        record.at <= Date.now() &&
        Date.now() - record.at < MAX_AGE
      )
        stored = record.choice
    } catch {
      /* Storage can be unavailable; analytics stays off without consent. */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser storage is read after SSR so markup and the initial analytics-disabled state stay identical during hydration.
    setChoice(stored)
    if (configured && stored !== 'accepted') {
      ;(window as AnalyticsWindow)[`ga-disable-${gaId}`] = true
      clearAnalyticsCookies()
    }
    setPreview(
      window.self !== window.top ||
        new URLSearchParams(window.location.search).get('preview') === 'true',
    )
    setReady(true)
    const showSettings = () => setOpen(true)
    window.addEventListener(SETTINGS_EVENT, showSettings)
    const synchronize = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        window.location.reload()
    }
    window.addEventListener('storage', synchronize)
    return () => {
      window.removeEventListener(SETTINGS_EVENT, showSettings)
      window.removeEventListener('storage', synchronize)
    }
  }, [gaId, configured])
  const publicPage = !pathname.startsWith('/admin') && !preview
  useEffect(() => {
    if (gaId)
      (window as AnalyticsWindow)[`ga-disable-${gaId}`] = !(
        ready &&
        publicPage &&
        choice === 'accepted'
      )
  }, [gaId, ready, publicPage, choice])
  function choose(next: Consent) {
    const previouslyAccepted = choice === 'accepted'
    if (gaId)
      (window as AnalyticsWindow)[`ga-disable-${gaId}`] = next !== 'accepted'
    if (next === 'rejected') {
      ;(window as AnalyticsWindow).gtag?.('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
      clearAnalyticsCookies()
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice: next, at: Date.now(), gaId: gaId || '' }),
      )
    } catch {
      /* The choice still applies to this page. */
    }
    setChoice(next)
    setOpen(false)
    // Remove the already loaded Google runtime as well as its cookies on withdrawal.
    if (next === 'rejected' && previouslyAccepted) window.location.reload()
  }
  const show = ready && publicPage && (open || (configured && choice === null))
  return (
    <>
      {ready && publicPage && configured && choice === 'accepted' && (
        <GoogleAnalytics gaId={gaId!} />
      )}
      {show && (
        <section
          role="region"
          aria-labelledby="cookie-title"
          className="fixed bottom-4 inset-x-4 sm:left-auto sm:w-[460px] z-50 rounded-2xl border border-border bg-background text-foreground shadow-xl p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Cookie
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 id="cookie-title" className="font-semibold text-sm">
              Your privacy. Your choice.
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {configured
              ? 'We use Google Analytics to understand how this website is used. It loads only if you agree. Essential storage keeps the editor and your privacy choice working.'
              : 'Google Analytics is not configured on this deployment. Only essential storage is used.'}{' '}
            <Link
              className="underline underline-offset-4 hover:text-foreground"
              href="/privacy"
            >
              Privacy & cookies
            </Link>
          </p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              className="px-4 py-2.5 text-sm rounded-xl border hover:bg-muted cursor-pointer transition-colors"
              onClick={() => choose('rejected')}
            >
              Reject analytics
            </button>
            <button
              disabled={!configured}
              className="px-4 py-2.5 text-sm rounded-xl border hover:bg-muted cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => choose('accepted')}
            >
              Accept analytics
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-3">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            You can change this anytime in Cookie settings.
          </p>
        </section>
      )}
    </>
  )
}
