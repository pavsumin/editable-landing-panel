'use client'

import Link from 'next/link'
import { useState } from 'react'
import guide from '@/docs/guide.json'
import { usePreviewContent } from '@/panel/PreviewBridge'

export default function DocsPage({
  content,
  siteUrl,
}: {
  content: Record<string, string>
  siteUrl: string
}) {
  const c = usePreviewContent(content)
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState('')
  const sections = guide.filter((section) =>
    `${c[`docs.${section.id}.title`]} ${c[`docs.${section.id}.body`]} ${section.code || ''} ${JSON.stringify(section.table || '')}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b sticky top-0 bg-background/95 z-20">
        <nav
          className="max-w-7xl mx-auto px-6 py-5 flex gap-6 items-center"
          aria-label="Documentation navigation"
        >
          <Link className="font-bold text-xl mr-auto" href="/">
            Edit.
          </Link>
          <Link href="/about">About</Link>
          <Link href="/demo">Try demo</Link>
          <a href="https://github.com/pavsumin/editable-landing-panel">
            GitHub ↗
          </a>
        </nav>
      </header>
      <div className="max-w-7xl mx-auto p-6 md:grid md:grid-cols-[230px_1fr] gap-16">
        <aside className="md:sticky md:top-28 self-start">
          <label
            htmlFor="docs-search"
            className="text-xs font-semibold uppercase tracking-widest"
          >
            Search documentation
          </label>
          <input
            id="docs-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the full guide…"
            className="border rounded-lg p-3 w-full my-4"
          />
          <nav
            aria-label="Guide sections"
            className="hidden md:flex flex-col gap-3 text-sm text-muted-foreground"
          >
            {[...new Set(sections.map((section) => section.group))].map(
              (group) => (
                <div key={group} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground mt-4">
                    {group}
                  </p>
                  {sections
                    .filter((section) => section.group === group)
                    .map((section) => (
                      <a
                        className="block hover:text-foreground"
                        key={section.id}
                        href={`#${section.id}`}
                      >
                        {c[`docs.${section.id}.title`]}
                      </a>
                    ))}
                </div>
              ),
            )}
          </nav>
          <select
            aria-label="Jump to guide section"
            className="md:hidden border rounded-lg p-3 w-full"
            onChange={(event) => {
              if (event.target.value)
                document
                  .getElementById(event.target.value)
                  ?.scrollIntoView({ behavior: 'smooth' })
            }}
            defaultValue=""
          >
            <option value="">Jump to a section…</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {c[`docs.${section.id}.title`]}
              </option>
            ))}
          </select>
        </aside>
        <main className="max-w-3xl py-8 space-y-16">
          <div>
            <p className="text-xs uppercase tracking-[.3em] text-muted-foreground">
              Setup guide + reference · v0.2.0
            </p>
            <h1 className="text-5xl font-semibold tracking-tight mt-4">
              From code to content.
            </h1>
            <p className="text-muted-foreground mt-5">
              Install the editor, understand the API, deploy your website and
              operate shared AI. Follow a task first; use the reference when you
              need details.
            </p>
          </div>
          {sections.length === 0 && <p role="status">No matching sections.</p>}
          {sections.map((section) => (
            <section
              id={section.id}
              key={section.id}
              className="scroll-mt-28 space-y-5"
            >
              <h2 className="text-2xl font-semibold">
                {c[`docs.${section.id}.title`]}
              </h2>
              <p className="text-muted-foreground leading-8 whitespace-pre-line">
                {c[`docs.${section.id}.body`]}
              </p>
              {section.table && (
                <div className="overflow-auto rounded-xl border">
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
                <div className="rounded-xl bg-muted overflow-hidden">
                  <div className="flex justify-end p-2">
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
                      {copied === section.id ? 'Copied' : 'Copy commands'}
                    </button>
                  </div>
                  <pre className="px-5 pb-5 overflow-auto text-xs leading-6">
                    <code>
                      {section.code.replaceAll('https://YOUR_DOMAIN', siteUrl)}
                    </code>
                  </pre>
                </div>
              )}
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
        </main>
      </div>
    </div>
  )
}
