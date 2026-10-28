import { Toaster } from '@/components/ui/toaster'
import PrivacyControls from '@/components/privacy-controls'
import { Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const viewport: Viewport = {
  themeColor: 'var(--primary)',
}

export const metadata = {
  metadataBase: new URL(process.env.PANEL_SITE_URL || 'http://localhost:3000'),

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
    url: '/',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script
          id="schema"
          type="application/ld+json"
          strategy="afterInteractive"
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
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
        <PrivacyControls gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <Script id="theme-init">
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
