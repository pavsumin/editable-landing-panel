import { ContentKey, defaultContent } from './defaultContent'
import { supabase } from './supabase'

export async function getContent(): Promise<Record<ContentKey, string>> {
	const { data } = await supabase.from('content').select('*')

	const dbContent: Record<string, string> = {}

	data?.forEach(item => {
		dbContent[item.key] = item.value
	})

	const finalContent = {} as Record<ContentKey, string>

	for (const key in defaultContent) {
		finalContent[key as ContentKey] =
			dbContent[key] ?? defaultContent[key as ContentKey]
	}

	return finalContent
}
