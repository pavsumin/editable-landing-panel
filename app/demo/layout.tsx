import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Interactive editor demo | Edit.',
  description:
    'Try editing text and images with a live preview. Changes stay in your browser.',
  alternates: { canonical: '/demo' },
  openGraph: { title: 'Interactive editor demo | Edit.', url: '/demo' },
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
