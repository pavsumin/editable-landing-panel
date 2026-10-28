import ContentPage from '@/panel/ContentPage'
import { getContent } from '@/lib/getContent'
export const revalidate = 0
export default async function AboutPage() {
  return <ContentPage page="about" content={await getContent('about')} />
}
