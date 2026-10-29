'use client'
import { useEffect, useSyncExternalStore } from 'react'
import {
  THEME_EVENT,
  syncDocumentTheme,
  watchThemeChrome,
} from '@/panel/theme.mjs'
function subscribe(update: () => void) {
  window.addEventListener(THEME_EVENT, update)
  return () => window.removeEventListener(THEME_EVENT, update)
}
export function DocumentTheme() {
  useEffect(() => {
    const refresh = () => {
      syncDocumentTheme()
      window.dispatchEvent(new Event('edit-theme-render'))
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const storage = (event: StorageEvent) => {
      if (event.key === 'edit-theme' || event.key === null) {
        document.documentElement.removeAttribute('data-elp-page-theme')
        refresh()
      }
    }
    refresh()
    const disconnect = watchThemeChrome(refresh)
    media.addEventListener('change', refresh)
    window.addEventListener('storage', storage)
    window.addEventListener(THEME_EVENT, refresh)
    return () => {
      disconnect()
      media.removeEventListener('change', refresh)
      window.removeEventListener('storage', storage)
      window.removeEventListener(THEME_EVENT, refresh)
    }
  }, [])
  return null
}
function subscribeTheme(update: () => void) {
  const cleanup = subscribe(update)
  window.addEventListener('edit-theme-render', update)
  return () => {
    cleanup()
    window.removeEventListener('edit-theme-render', update)
  }
}
export function useSiteTheme() {
  const dark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains('dark'),
    () => false,
  )
  return {
    dark,
    toggleTheme() {
      const next = !document.documentElement.classList.contains('dark')
      try {
        localStorage.setItem('edit-theme', next ? 'dark' : 'light')
      } catch {}
      // In blocked-storage browsers the current page still needs the explicit selection.
      document.documentElement.setAttribute(
        'data-elp-page-theme',
        next ? 'dark' : 'light',
      )
      syncDocumentTheme()
      window.dispatchEvent(new Event(THEME_EVENT))
    },
  }
}
