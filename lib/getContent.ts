import { cache } from 'react'
import { readContent } from '@/panel/server'
import type { ContentKey } from './defaultContent'

export type SiteContent = Record<ContentKey, string> & Record<string, string>
export const getContent = cache(
  async (pageId = 'home'): Promise<SiteContent> => {
    return (await readContent(pageId)).values as SiteContent
  },
)
