import { Toaster } from '@/components/ui/toaster'
import PrivacyControls from '@/components/privacy-controls'
import { Viewport } from 'next'
import { siteOrigin } from '@/lib/seo'
import './globals.css'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
}

export const metadata = {
  metadataBase: new URL(siteOrigin),

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
        <link
          rel="preload"
          href="/fonts/geist-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('edit-theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){var d=matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
        <PrivacyControls gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  )
}
