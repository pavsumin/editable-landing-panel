'use client'

import { useEffect, useState } from 'react'
import { panelConfig } from './config'
import { validateValues } from './schema.mjs'

export function usePreviewContent(content: Record<string, string>) {
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  useEffect(() => {
    if (
      window.parent === window ||
      new URLSearchParams(window.location.search).get('preview') !== 'true'
    )
      return
    const handler = (event: MessageEvent) => {
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
      if (event.data.type === 'theme')
        document.documentElement.classList.toggle(
          'dark',
          event.data.dark === true,
        )
    }
    window.addEventListener('message', handler)
    window.parent.postMessage(
      { channel: 'editable-panel-v1', type: 'ready' },
      window.location.origin,
    )
    return () => window.removeEventListener('message', handler)
  }, [])
  return { ...content, ...overrides }
}
