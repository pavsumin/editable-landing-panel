import HomePage from '@/components/pages/HomePage'
import { getContent } from '@/lib/getContent'

export const revalidate = 0

export default async function Page() {
	const content = await getContent()

	return <HomePage content={content} />
}
