'use client'
import { useSyncExternalStore } from 'react'
const eventName = 'edit-theme-change'
function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  window.dispatchEvent(new Event(eventName))
}
function subscribe(update: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const system = () => {
    let choice
    try {
      choice = localStorage.getItem('edit-theme')
    } catch {}
    if (!choice) apply(media.matches)
  }
  const storage = (event: StorageEvent) => {
    if (event.key === 'edit-theme')
      apply(event.newValue ? event.newValue === 'dark' : media.matches)
  }
  window.addEventListener(eventName, update)
  window.addEventListener('storage', storage)
  media.addEventListener('change', system)
  return () => {
    window.removeEventListener(eventName, update)
    window.removeEventListener('storage', storage)
    media.removeEventListener('change', system)
  }
}
export function useSiteTheme() {
  const dark = useSyncExternalStore(
    subscribe,
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
      apply(next)
    },
  }
}
