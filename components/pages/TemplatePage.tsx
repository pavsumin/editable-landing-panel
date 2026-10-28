'use client'

import { usePreviewContent } from '@/panel/PreviewBridge'

export default function TemplatePage({
  content,
}: {
  content: Record<string, string>
}) {
  const c = usePreviewContent(content)
  return (
    <main>
      <section id="hero">
        <h1>{c.hero_title}</h1>
      </section>
    </main>
  )
}
