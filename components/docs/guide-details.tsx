import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  Database,
  FileJson,
  Globe,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export type GuideExtras = {
  summary?: string
  cards?: { title: string; body: string; href: string }[]
  flow?: { label: string; detail: string }[]
  callout?: { title: string; body: string; tone: string }
  checklist?: string[]
}

export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code
            key={i}
            className="rounded border bg-muted/40 px-1 py-0.5 text-[.85em] text-foreground [overflow-wrap:anywhere]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function GuideDetails({ section }: { section: GuideExtras }) {
  const icons = [Code2, FileJson, Database, Globe]
  return (
    <>
      {section.summary && (
        <p className="flex gap-2 text-sm text-muted-foreground">
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <span>
            <InlineText text={section.summary} />
          </span>
        </p>
      )}
      {section.cards && (
        <div className="grid sm:grid-cols-2 gap-3">
          {section.cards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="group min-w-0 rounded-xl border bg-muted/10 p-5 hover:bg-muted/40 transition-colors"
            >
              <span className="flex justify-between items-center gap-3 text-sm font-medium">
                {card.title}
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                  aria-hidden="true"
                />
              </span>
              <span className="block mt-2 text-sm leading-relaxed text-muted-foreground">
                <InlineText text={card.body} />
              </span>
            </a>
          ))}
        </div>
      )}
      {section.flow && (
        <ol
          aria-label="Content flow"
          className="flex flex-wrap items-stretch gap-2 py-2"
        >
          {section.flow.map((step, i) => {
            const Icon = icons[i % icons.length]
            return (
              <li key={step.label} className="flex items-center gap-2 min-w-0">
                {i > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <div className="rounded-lg border bg-muted/20 px-3 py-2.5 min-w-0">
                  <span className="flex items-center gap-2 text-xs font-medium">
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {step.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground mt-1">
                    {step.detail}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
      {section.callout && (
        <aside
          className="flex gap-3 rounded-xl border bg-muted/20 p-4 sm:p-5"
          aria-label={section.callout.title}
        >
          {section.callout.tone === 'review' ? (
            <ShieldCheck
              className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
              aria-hidden="true"
            />
          ) : section.callout.tone === 'ai' ? (
            <Sparkles
              className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <Info
              className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 text-sm leading-relaxed">
            <p className="font-medium mb-1">{section.callout.title}</p>
            <p className="text-muted-foreground">
              <InlineText text={section.callout.body} />
            </p>
          </div>
        </aside>
      )}
    </>
  )
}

export function GuideChecklist({ items }: { items?: string[] }) {
  if (!items?.length) return null
  return (
    <details className="rounded-xl border px-4 sm:px-5 py-4 text-sm">
      <summary className="font-medium cursor-pointer select-none">
        Check before continuing{' '}
        <span className="font-normal text-muted-foreground">
          · {items.length} checks
        </span>
      </summary>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li className="flex gap-2.5" key={item}>
            <Check
              className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
            <span className="text-muted-foreground leading-relaxed">
              <InlineText text={item} />
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}
