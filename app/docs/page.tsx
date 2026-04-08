import DocsPage from '@/components/pages/DocsPage'
import { getContent } from '@/lib/getContent'

export const revalidate = 0

export default async function Page() {
	const content = await getContent()

	return <DocsPage content={content} />
}
