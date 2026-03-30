import { defaultContent } from './defaultContent'
import { supabase } from './supabase'

type ContentItem = {
	key: string
	value: string
}

export async function getContent() {
	const { data } = await supabase.from('content').select('*')

	const dbContent: Record<string, string> = {}

	data?.forEach((item: ContentItem) => {
		dbContent[item.key] = item.value
	})

	return {
		...defaultContent,
		...dbContent,
	}
}
