import { ContentKey, defaultContent } from './defaultContent'
import { docsContent, DocsContentKey, docsContentKeys } from './docsContent'
import { supabase } from './supabase'

export type SiteContent = Record<ContentKey | DocsContentKey, string>

export async function getContent(): Promise<SiteContent> {
	const { data } = await supabase.from('content').select('*')

	const dbContent: Record<string, string> = {}

	data?.forEach(item => {
		dbContent[item.key] = item.value
	})

	const finalContent = {} as SiteContent

	for (const key in defaultContent) {
		finalContent[key as ContentKey] =
			dbContent[key] ?? defaultContent[key as ContentKey]
	}

	for (const key of docsContentKeys) {
		finalContent[key] = dbContent[key] ?? docsContent[key]
	}

	return finalContent
}
