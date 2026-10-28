'use client'

import Link from 'next/link'
import { PrivacyLinks } from '@/components/site-chrome'
import { usePreviewContent } from './PreviewBridge'

export default function ContentPage({
  content,
  page,
}: {
  content: Record<string, string>
  page: 'about' | 'contact'
}) {
  const c = usePreviewContent(content)
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <nav
          aria-label="Main navigation"
          className="max-w-5xl mx-auto p-6 flex flex-wrap gap-6"
        >
          <Link href="/" className="font-bold mr-auto">
            Edit.
          </Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/docs">Docs</Link>
        </nav>
      </header>
      <main id={page} className="max-w-4xl mx-auto px-6 py-28 space-y-8">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">
          {c[`${page}.title`]}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl whitespace-pre-line">
          {c[`${page}.description`]}
        </p>
        {page === 'contact' && (
          <a
            className="inline-block rounded-xl bg-primary text-primary-foreground px-6 py-3"
            href={c['contact.link']}
          >
            Explore the repository ↗
          </a>
        )}
        <Link href="/demo" className="block underline">
          Try the editor →
        </Link>
      </main>
      <footer
        id="footer"
        className="border-t p-6 text-center text-sm text-muted-foreground"
      >
        <PrivacyLinks />
      </footer>
    </div>
  )
}
