import { readContent } from '@/panel/server'
import type { ContentKey } from './defaultContent'

export type SiteContent = Record<ContentKey, string> & Record<string, string>
export async function getContent(pageId = 'home'): Promise<SiteContent> {
  return (await readContent(pageId)).values as SiteContent
}
