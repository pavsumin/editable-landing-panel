import type { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: new URL(
      '/sitemap.xml',
      process.env.PANEL_SITE_URL || 'http://localhost:3000',
    ).href,
  }
}
