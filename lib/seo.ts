import type { Metadata } from 'next'
export const siteOrigin = new URL(
  process.env.PANEL_SITE_URL || 'https://editable-landing-panel.vercel.app',
).origin
export type PageSearch = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}
export async function pageMetadata(
  title: string,
  description: string,
  path: string,
  props?: PageSearch,
): Promise<Metadata> {
  const preview = props && (await props.searchParams).preview === 'true'
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(preview ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Edit.',
      type: path === '/docs' ? 'article' : 'website',
      images: [
        {
          url: path === '/docs' ? '/og-image-docs.png' : '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Edit. — Next.js content editor',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [path === '/docs' ? '/og-image-docs.png' : '/og-image.png'],
    },
  }
}
