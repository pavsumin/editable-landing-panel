import { pageMetadata, type PageSearch } from '@/lib/seo'
import DocsPage from '@/components/pages/DocsPage'
import { getContent } from '@/lib/getContent'
export const revalidate = 0
export async function generateMetadata(props: PageSearch) {
  return pageMetadata(
    'Documentation | Next.js Admin Panel',
    'Install Edit. with the CLI, connect Supabase, configure multi-page editing and deploy securely. Setup instructions, API reference and optional Gemini assistance.',
    '/docs',
    props,
  )
}
export default async function Page() {
  return (
    <DocsPage
      content={await getContent('docs')}
      siteUrl={
        new URL(
          process.env.PANEL_SITE_URL ||
            'https://editable-landing-panel.vercel.app',
        ).origin
      }
    />
  )
}
