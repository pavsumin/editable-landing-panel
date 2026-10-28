import ContentPage from '@/panel/ContentPage'
import { getContent } from '@/lib/getContent'
export const revalidate = 0
export default async function ContactPage() {
  return <ContentPage page="contact" content={await getContent('contact')} />
}
