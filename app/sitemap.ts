import { siteOrigin } from '@/lib/seo'
import type { MetadataRoute } from 'next'
import { panelConfig } from '@/panel/config'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin
  return [
    ...new Set([
      '/privacy',
      '/demo',
      ...panelConfig.pages
        .filter((page) => page.id !== 'global')
        .map((page) => page.path),
    ]),
  ].map((path) => ({
    url: new URL(path, base).href,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
