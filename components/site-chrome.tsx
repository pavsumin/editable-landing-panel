'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Moon, Sun } from 'lucide-react'
import { useSiteTheme } from '@/lib/theme'
export { useSiteTheme } from '@/lib/theme'
import { CookieSettingsButton } from './privacy-controls'

export function Brand() {
  return (
    <Link
      className="flex items-center gap-2 w-fit"
      href="/"
      aria-label="Edit. Home"
    >
      <Image
        width={32}
        height={32}
        src="/icon-dark.svg"
        alt=""
        className="hidden dark:block"
      />
      <Image
        width={32}
        height={32}
        src="/icon.svg"
        alt=""
        className="block dark:hidden"
      />
      <span className="font-bold text-xl">Edit.</span>
    </Link>
  )
}

export function ThemeButton() {
  const { toggleTheme } = useSiteTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-border hover:bg-muted transition duration-300 cursor-pointer"
      aria-label="Toggle theme"
    >
      <Moon className="hidden dark:block h-5 w-5 text-blue-400" />
      <Sun className="block dark:hidden h-5 w-5 text-yellow-500" />
    </button>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 backdrop-blur-sm bg-background/95">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Brand />
        <ThemeButton />
      </div>
    </header>
  )
}

export function PrivacyLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5 text-xs text-muted-foreground">
      <Link href="/privacy" className="hover:text-foreground transition-colors">
        Privacy & cookies
      </Link>
      <CookieSettingsButton />
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="text-center text-sm text-muted-foreground py-10">
      <PrivacyLinks />
    </footer>
  )
}
