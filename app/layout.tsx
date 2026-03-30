import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

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
		<html lang='en' className='h-full antialiased'>
			<body className={`${geistSans.className} min-h-full flex flex-col`}>
				{children}
				<Toaster />
			</body>
		</html>
	)
}
