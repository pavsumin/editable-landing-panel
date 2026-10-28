import type { MetadataRoute } from 'next'
import { panelConfig } from '@/panel/config'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.PANEL_SITE_URL || 'http://localhost:3000'
  return [
    ...new Set(
      panelConfig.pages
        .filter((page) => page.id !== 'global')
        .map((page) => page.path),
    ),
  ].map((path) => ({
    url: new URL(path, base).href,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
