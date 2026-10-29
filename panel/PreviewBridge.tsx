'use client'

import { useEffect, useMemo, useState } from 'react'
import { THEME_EVENT } from './theme.mjs'
import { validateValues } from './schema.mjs'

export function usePreviewContent(content: Record<string, string>) {
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  useEffect(() => {
    if (
      window.parent === window ||
      new URLSearchParams(window.location.search).get('preview') !== 'true'
    )
      return
    let disposed = false
    let handler: (event: MessageEvent) => void
    void import('./config').then(({ panelConfig }) => {
      if (disposed) return
      handler = (event: MessageEvent) => {
        if (
          event.origin !== window.location.origin ||
          event.source !== window.parent ||
          event.data?.channel !== 'editable-panel-v1'
        )
          return
        if (event.data.type === 'values') {
          try {
            setOverrides(validateValues(panelConfig, event.data.values))
          } catch {
            /* Ignore malformed messages. */
          }
        }
        if (event.data.type === 'scroll' && typeof event.data.id === 'string')
          document
            .getElementById(event.data.id)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (event.data.type === 'theme') {
          document.documentElement.setAttribute(
            'data-elp-preview-theme',
            event.data.dark === true ? 'dark' : 'light',
          )
          // The host owns its palette. Signal the theme without imposing this
          // project's background colors on a website installed through the CLI.
          document.documentElement.classList.toggle(
            'dark',
            event.data.dark === true,
          )
          document.documentElement.style.colorScheme =
            event.data.dark === true ? 'dark' : 'light'
          window.dispatchEvent(new Event(THEME_EVENT))
        }
      }
      window.addEventListener('message', handler)
      window.parent.postMessage(
        { channel: 'editable-panel-v1', type: 'ready' },
        window.location.origin,
      )
    })
    return () => {
      disposed = true
      if (handler) window.removeEventListener('message', handler)
    }
  }, [])
  return useMemo(() => ({ ...content, ...overrides }), [content, overrides])
}
