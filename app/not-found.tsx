import Link from 'next/link'
import { ArrowRight, ArrowUpRight, FileQuestion } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/site-chrome'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-6xl mx-auto w-full px-6 py-16 sm:py-24 flex-1 grid md:grid-cols-2 items-center gap-16 md:gap-20">
        <div className="space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />A little
            off the map
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.06] tracking-tight">
            Great ideas.
            <br />
            Wrong address.
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm leading-relaxed">
            This page doesn’t exist. Let’s get you back to something you can
            make your own.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-5 sm:px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform motion-reduce:transform-none"
            >
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 border px-5 sm:px-6 py-3 rounded-xl hover:bg-muted transition-colors"
            >
              Read the docs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="relative select-none" aria-hidden="true">
          <div className="absolute -inset-8 bg-gradient-to-tr from-blue-400/10 via-transparent to-primary/5 blur-3xl rounded-full" />
          <div className="relative rounded-2xl border bg-card shadow-sm overflow-hidden -rotate-2">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/10" />
                <span className="w-2 h-2 rounded-full bg-foreground/10" />
              </div>
              <span className="text-xs text-muted-foreground">
                Edit. / somewhere new
              </span>
            </div>
            <div className="relative px-6 py-14 text-center bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px]">
              <span className="text-[clamp(100px,18vw,180px)] font-bold tracking-[-0.08em] leading-none text-foreground/[.08]">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border bg-background shadow-lg rotate-6 flex items-center justify-center">
                  <FileQuestion className="h-9 w-9 sm:h-11 sm:w-11 stroke-[1.25]" />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-between text-xs text-muted-foreground">
              <span>Page not found</span>
              <span className="font-mono">404</span>
            </div>
          </div>
          <div className="relative ml-auto mr-5 -mt-3 w-fit rounded-xl border bg-background px-4 py-3 shadow-sm rotate-3 text-xs text-muted-foreground">
            Your next page starts with an idea.{' '}
            <ArrowUpRight className="inline h-3 w-3 text-foreground" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
