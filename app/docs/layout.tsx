import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
	title: 'Documentation | Next.js Admin Panel',
	description:
		'Step-by-step documentation for adding an editable content system to your Next.js website using Supabase. No CMS required.',

	keywords: [
		'Next.js documentation',
		'Next.js admin panel setup',
		'editable content Next.js',
		'Supabase guide',
		'Next.js CMS alternative tutorial',
	],

	alternates: {
		canonical: 'https://editable-landing-panel.vercel.app/docs',
	},

	openGraph: {
		title: 'Next.js Admin Panel Documentation',
		description:
			'Learn how to make your website content editable without CMS using Next.js and Supabase.',
		url: 'https://editable-landing-panel.vercel.app/docs',
		siteName: 'Edit',
		images: [
			{
				url: '/og-image-docs.png',
				width: 1200,
				height: 630,
			},
		],
		type: 'article',
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Next.js Admin Panel Docs',
		description:
			'Step-by-step guide to build an editable content system with Next.js.',
		images: ['/og-image-docs.png'],
	},
}

export default function DocsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<Script
				id='schema-docs'
				type='application/ld+json'
				strategy='afterInteractive'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'TechArticle',
						headline: 'Next.js Admin Panel Documentation',
						description:
							'Step-by-step guide to make your Next.js website content editable using Supabase.',
						author: {
							'@type': 'Person',
							name: 'Pavel Sumin',
						},
						publisher: {
							'@type': 'Organization',
							name: 'Edit',
						},
					}),
				}}
			/>

			{children}
		</>
	)
}
