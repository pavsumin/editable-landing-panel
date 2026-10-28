import DocsPage from '@/components/pages/DocsPage'
import { getContent } from '@/lib/getContent'
export const revalidate = 0
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
