import { pageMetadata, type PageSearch } from '@/lib/seo'
import ContentPage from '@/panel/ContentPage'
import { getContent } from '@/lib/getContent'
export const revalidate = 0
export async function generateMetadata(props: PageSearch) {
  return pageMetadata(
    'Contact & contribute | Edit.',
    'Find the Edit. repository, explore the code and contribute to the open-source Next.js content editor.',
    '/contact',
    props,
  )
}
export default async function ContactPage() {
  return <ContentPage page="contact" content={await getContent('contact')} />
}
