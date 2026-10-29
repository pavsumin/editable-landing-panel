'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Search, PanelRight } from 'lucide-react'
import {
  Brand,
  ThemeButton,
  AuthorCredit,
  PrivacyLinks,
} from '@/components/site-chrome'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import guide from '@/docs/guide.json'
import {
  GuideDetails,
  GuideChecklist,
  InlineText,
} from '@/components/docs/guide-details'
import { usePreviewContent } from '@/panel/PreviewBridge'

const groups = [...new Set(guide.map((section) => section.group))]

export default function DocsPage({
  content,
  siteUrl,
}: {
  content: Record<string, string>
  siteUrl: string
}) {
  const c = usePreviewContent(content)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState(guide[0].id)
  const [expanded, setExpanded] = useState<string[]>(groups)
  const pending = useRef<string | null>(null)
  const index = useMemo(
    () =>
      guide.map((section) => ({
        section,
        text: `${c[`docs.${section.id}.title`]} ${c[`docs.${section.id}.body`]} ${section.code || ''} ${JSON.stringify(section.table || '')} ${JSON.stringify({ summary: section.summary, cards: section.cards, flow: section.flow, callout: section.callout, checklist: section.checklist, extraCode: section.extraCode })}`.toLowerCase(),
      })),
    [c],
  )
  const results = useMemo(
    () =>
      index
        .filter((item) => item.text.includes(query.trim().toLowerCase()))
        .map((item) => item.section),
    [index, query],
  )
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    const syncHash = () => {
      const id = window.location.hash.slice(1)
      const section = guide.find((section) => section.id === id)
      if (section) {
        setActive(id)
        setExpanded((current) =>
          current.includes(section.group)
            ? current
            : [...current, section.group],
        )
      }
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const id = visible[0]?.target.closest('section')?.id
        if (id) setActive(id)
      },
      { rootMargin: '-80px 0px -60% 0px' },
    )
    document
      .querySelectorAll('main section > h2')
      .forEach((heading) => observer.observe(heading))
    syncHash()
    window.addEventListener('keydown', keydown)
    window.addEventListener('hashchange', syncHash)
    return () => {
      observer.disconnect()
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('hashchange', syncHash)
    }
  }, [])
  function jump(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'instant', block: 'start' })
    if (window.location.hash !== `#${id}`)
      window.history.pushState(null, '', `#${id}`)
    setActive(id)
    const group = guide.find((section) => section.id === id)!.group
    setExpanded((current) =>
      current.includes(group) ? current : [...current, group],
    )
  }
  function navigate(id: string) {
    if (searchOpen || mobileOpen) {
      pending.current = id
      setSearchOpen(false)
      setMobileOpen(false)
    } else jump(id)
  }
  function afterClose(event: Event) {
    if (!pending.current) return
    event.preventDefault()
    const id = pending.current
    pending.current = null
    requestAnimationFrame(() => {
      jump(id)
      const heading = document.querySelector<HTMLElement>(`#${id} h2`)
      heading?.focus({ preventScroll: true })
    })
  }
  const navigation = (
    <nav className="space-y-1" aria-label="Guide sections">
      {groups.map((group) => {
        const items = guide.filter((section) => section.group === group)
        const isActive = items.some((section) => section.id === active)
        const isExpanded = expanded.includes(group)
        return (
          <div key={group}>
            <button
              aria-expanded={isExpanded}
              onClick={() =>
                setExpanded((current) =>
                  isExpanded
                    ? current.filter((item) => item !== group)
                    : [...current, group],
                )
              }
              className={`w-full flex items-center justify-between py-2 px-3 rounded-md text-sm transition-colors cursor-pointer ${isActive ? 'bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}
            >
              <span>{group}</span>
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
            {isExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {items.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      navigate(section.id)
                    }}
                    aria-current={
                      active === section.id ? 'location' : undefined
                    }
                    className={`block py-1.5 px-3 rounded-md text-xs transition-colors ${active === section.id ? 'text-zinc-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-500 hover:text-zinc-900 dark:hover:text-gray-100'}`}
                  >
                    {c[`docs.${section.id}.title`]}
                  </a>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className="hidden md:flex fixed left-0 top-0 h-dvh bg-background border-r border-border/40 z-40 w-64 flex-col"
        aria-label="Documentation sidebar"
      >
        <div className="p-6">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">{navigation}</div>
      </aside>
      <header className="sticky top-0 z-30 border-b border-border/40 backdrop-blur-sm bg-background/95 md:ml-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between md:justify-end">
          <div className="md:hidden">
            <Brand />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
              aria-label="Search documentation"
            >
              <Search className="h-5 w-5" />
            </button>
            <ThemeButton />
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <PanelRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="w-72 p-0 flex flex-col"
          aria-describedby={undefined}
          onCloseAutoFocus={afterClose}
        >
          <SheetTitle className="sr-only">Documentation navigation</SheetTitle>
          <div className="p-6 pr-12">
            <Brand />
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">{navigation}</div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-4 text-sm border-t cursor-pointer"
          >
            Close sidebar
          </button>
        </SheetContent>
      </Sheet>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          className="p-0 overflow-hidden max-w-2xl gap-0"
          aria-describedby={undefined}
          onCloseAutoFocus={afterClose}
        >
          <div className="p-4 border-b">
            <DialogTitle>Search Documentation</DialogTitle>
          </div>
          <div className="p-4 border-b relative">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              aria-label="Search documentation"
              type="search"
              placeholder="Search for anything… (⌘K)"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-muted/50 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/70"
            />
          </div>
          <div className="max-h-[55vh] overflow-y-auto p-2">
            {!query && (
              <p className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2">
                Popular searches
              </p>
            )}
            {(query ? results : guide.slice(0, 6)).map((section) => (
              <button
                key={section.id}
                onClick={() => navigate(section.id)}
                className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="block font-medium text-sm">
                  {c[`docs.${section.id}.title`]}
                </span>
                {query && (
                  <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">
                    {c[`docs.${section.id}.body`]}
                  </span>
                )}
              </button>
            ))}
            {query && results.length === 0 && (
              <p
                role="status"
                className="p-8 text-center text-sm text-muted-foreground"
              >
                No results found. Try another search.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <DocsArticle c={c} siteUrl={siteUrl} />
      <footer className="md:ml-64 py-8">
        <AuthorCredit />
        <PrivacyLinks />
      </footer>
    </div>
  )
}

const DocsArticle = memo(function DocsArticle({
  c,
  siteUrl,
}: {
  c: Record<string, string>
  siteUrl: string
}) {
  const [copied, setCopied] = useState('')
  return (
    <main className="min-w-0 max-w-6xl px-4 sm:px-6 py-12 sm:py-16 md:ml-64">
      <div className="min-w-0 w-full max-w-3xl space-y-24 [overflow-wrap:anywhere]">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Next.js Admin Panel Documentation
        </h1>
        {guide.map((section) => (
          <section
            id={section.id}
            key={section.id}
            className="scroll-mt-28 space-y-5"
          >
            <h2
              tabIndex={-1}
              className="text-xl sm:text-2xl font-semibold tracking-tight"
            >
              {c[`docs.${section.id}.title`]}
            </h2>
            <GuideDetails section={section} />
            <div className="space-y-4 text-muted-foreground leading-relaxed max-w-3xl">
              {c[`docs.${section.id}.body`]
                .split(/\n\n+/)
                .map((paragraph, index) => (
                  <p key={index}>
                    <InlineText text={paragraph} />
                  </p>
                ))}
            </div>
            {section.table && (
              <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted">
                    <tr>
                      {section.table.headers.map((header) => (
                        <th className="p-3" key={header}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, index) => (
                      <tr className="border-t" key={index}>
                        {row.map((cell, column) => (
                          <td className="p-3 align-top" key={column}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {section.code && (
              <div className="min-w-0 max-w-full rounded-xl bg-muted overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {section.language || 'Terminal'}
                  </span>
                  <button
                    className="text-xs border rounded-md px-3 py-1"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          section.code!.replaceAll(
                            'https://YOUR_DOMAIN',
                            siteUrl,
                          ),
                        )
                        setCopied(section.id)
                      } catch {
                        setCopied('failed')
                      }
                    }}
                  >
                    {copied === section.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="max-w-full px-5 pb-5 overflow-x-auto text-xs leading-6">
                  <code>
                    {section.code.replaceAll('https://YOUR_DOMAIN', siteUrl)}
                  </code>
                </pre>
              </div>
            )}
            {section.extraCode && (
              <div className="min-w-0 max-w-full rounded-xl border bg-muted/30 overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                    Terminal · optional codemod
                  </span>
                  <button
                    className="text-xs border rounded-md px-3 py-1"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(section.extraCode!)
                        setCopied(`${section.id}-extra`)
                      } catch {
                        setCopied('failed')
                      }
                    }}
                  >
                    {copied === `${section.id}-extra` ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="max-w-full overflow-x-auto p-4 text-xs leading-6">
                  <code>{section.extraCode}</code>
                </pre>
              </div>
            )}
            <GuideChecklist items={section.checklist} />
            {section.links && (
              <div className="flex flex-wrap gap-4 text-sm">
                {section.links.map((link) => (
                  <a
                    className="underline text-blue-600 dark:text-blue-400"
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  )
})
