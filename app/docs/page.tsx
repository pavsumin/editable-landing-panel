import DocsPage from '@/components/pages/DocsPage'
import { docsContent, DocsContent, docsContentKeys } from '@/lib/docsContent'
import { getContent } from '@/lib/getContent'

export const revalidate = 0

export default async function Page() {
	const content = await getContent()

	const docsContentProps = docsContentKeys.reduce((acc, key) => {
		acc[key] = content[key] ?? docsContent[key]
		return acc
	}, {} as DocsContent)

	return <DocsPage content={docsContentProps} />
}
