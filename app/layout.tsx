import { Toaster } from '@/components/ui/toaster'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const viewport: Viewport = {
	themeColor: 'var(--primary)',
}

export const metadata = {
	metadataBase: new URL('https://editable-landing-panel.vercel.app'),

	title: 'Next.js Admin Panel — Edit Website Content Without CMS',
	description:
		'Add an admin panel to your Next.js website. Edit content without CMS, without redeploy, powered by Supabase.',

	keywords: [
		'Next.js admin panel',
		'Next.js CMS alternative',
		'edit website content without CMS',
		'Supabase admin panel',
		'Next.js content editor',
		'headless CMS alternative',
	],

	openGraph: {
		title: 'Next.js Admin Panel (No CMS)',
		description:
			'Edit your website content without touching code. Simple, fast, and powerful.',
		url: 'https://editable-landing-panel.vercel.app',
		siteName: 'Edit',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
			},
		],
		type: 'website',
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Next.js Admin Panel (No CMS)',
		description: 'Edit your website content without CMS or rebuild.',
		images: ['/og-image.png'],
	},

	verification: {
		google: 'mI5lddiADnTbuP5o3zx-l-tE0oC3YawlPp-RaIa4Oik',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' className='h-full antialiased' suppressHydrationWarning>
			<head>
				<Script
					id='schema'
					type='application/ld+json'
					strategy='afterInteractive'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'SoftwareApplication',
							name: 'Next.js Admin Panel',
							description:
								'Edit website content without CMS using Next.js and Supabase.',
							applicationCategory: 'DeveloperTool',
							operatingSystem: 'Web',
						}),
					}}
				/>
				<meta
					name='google-site-verification'
					content='mI5lddiADnTbuP5o3zx-l-tE0oC3YawlPp-RaIa4Oik'
				/>
			</head>
			<body className={`${geistSans.className} min-h-full flex flex-col`}>
				{children}
				<Toaster />
				<Script id='theme-init' strategy='beforeInteractive'>
					{`
						try {
							const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
							if (isDark) document.documentElement.classList.add('dark');
						} catch (e) {}
					`}
				</Script>
			</body>
			<GoogleAnalytics gaId='G-QCMRWD72RP' />
		</html>
	)
}
