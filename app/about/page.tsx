import { pageMetadata, type PageSearch } from '@/lib/seo'
import ContentPage from '@/panel/ContentPage'
import { getContent } from '@/lib/getContent'
export const revalidate = 0
export async function generateMetadata(props: PageSearch) {
  return pageMetadata(
    'About Edit. — Open-source Next.js content editor',
    'How Edit. adds focused content editing to your Next.js website with Supabase and an installable CLI.',
    '/about',
    props,
  )
}
export default async function AboutPage() {
  return <ContentPage page="about" content={await getContent('about')} />
}
