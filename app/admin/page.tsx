import Editor from '@/panel/Editor'
import { panelConfig } from '@/panel/config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Content workspace',
  robots: { index: false, follow: false },
}
export default function AdminPage() {
  return <Editor config={panelConfig} />
}
