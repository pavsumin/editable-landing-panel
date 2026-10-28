import { pageMetadata, siteOrigin, type PageSearch } from '@/lib/seo'
import HomePage from '@/components/pages/HomePage'
import { getContent } from '@/lib/getContent'

export const revalidate = 0

export async function generateMetadata(props: PageSearch) {
  return pageMetadata(
    'Next.js Admin Panel — Edit Website Content Without CMS',
    'Install a lightweight Next.js content editor with a CLI. Live preview, multi-page editing and Supabase storage, without replacing your components.',
    '/',
    props,
  )
}
export default async function Page() {
  const content = await getContent()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Edit.',
            url: siteOrigin,
            description: 'Open-source content editor for Next.js and Supabase.',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            license: 'https://opensource.org/license/mit',
            codeRepository:
              'https://github.com/pavsumin/editable-landing-panel',
          }).replaceAll('<', '\u003c'),
        }}
      />
      <HomePage content={content} />
    </>
  )
}
