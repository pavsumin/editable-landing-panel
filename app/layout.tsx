import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'
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

export const metadata: Metadata = {
	title: 'Editable Landing Panel',
	description: 'You can edit text on your website without khowing code',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' className='h-full antialiased' suppressHydrationWarning>
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
		</html>
	)
}
