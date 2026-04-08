'use client'

import { ContentKey } from '@/lib/defaultContent'
import { Moon, Sun } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

/*  TYPES  */

type Content = Record<ContentKey, string>

type Props = {
	content: Content
}

/*  PAGE  */

export default function DocsPage({ content }: Props) {
	const [isDark, setIsDark] = useState(() => {
		if (typeof window === 'undefined') return false
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark)
	}, [isDark])

	useEffect(() => {
		const handler = (e: MessageEvent) => {
			if (e.data?.type !== 'scroll-to') return

			const id = e.data.id
			if (!id) return

			const el = document.getElementById(id)
			if (!el) return

			const yOffset = -80
			const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset

			window.scrollTo({
				top: y,
				behavior: 'smooth',
			})
		}

		window.addEventListener('message', handler)
		return () => window.removeEventListener('message', handler)
	}, [])

	const c = content

	return (
		<div className='min-h-screen bg-background text-foreground'>
			{/* HEADER */}
			<header className='sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/95'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
					<Link className='flex items-center gap-2' href='/'>
						<div className='flex items-center justify-center'>
							<Image
								width={32}
								height={32}
								src={'/icon-dark.svg'}
								alt={'Logo'}
								className='hidden dark:block'
							/>
							<Image
								width={32}
								height={32}
								src={'/icon.svg'}
								alt={'Logo'}
								className='block dark:hidden'
							/>
						</div>
						<span className='font-bold text-xl'>Edit.</span>
					</Link>

					<button
						onClick={() => setIsDark(prev => !prev)}
						className='p-2 rounded-lg border border-border hover:bg-muted transition duration-300 cursor-pointer'
						aria-label='Toggle theme'
					>
						<Moon className='hidden dark:block h-5 w-5 text-blue-400' />
						<Sun className='block dark:hidden h-5 w-5 text-yellow-500' />
					</button>
				</div>
			</header>

			{/* MAIN CONTENT */}
			<main className='max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16'>
				{/* 0. START */}
				<section id='start' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						0. Start
					</h2>

					<div
						id='what-is-this'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							What is this
						</h3>
						<p>
							This is a system that allows you to make your website content
							editable without using a CMS.
						</p>
						<p>
							Instead of hardcoding text directly in your components, you
							replace it with special keys.
						</p>

						<div className='bg-muted/40 border rounded-xl p-5 space-y-4 text-sm'>
							<div>Before:</div>
							<pre>{`<h1>Welcome to my website</h1>`}</pre>
							<div>After:</div>
							<pre>{`<h1>{c.hero_title}</h1>`}</pre>
						</div>

						<p>
							Now this text can be changed from an admin panel without touching
							the code.
						</p>

						<p>
							<strong>Important:</strong> You still keep full control over your
							layout, design, and logic. Only the content becomes editable.
						</p>
					</div>

					<div
						id='how-it-works'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							How it works
						</h3>
						<p>The system works in a very simple way:</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>You replace text in your code with keys</li>
							<li>
								Default values are stored in <code>defaultContent.ts</code>
							</li>
							<li>Supabase stores updated values</li>
							<li>Admin panel lets you edit content</li>
							<li>Website always shows the latest version</li>
						</ul>

						<p className='text-sm text-muted-foreground'>
							Flow: Code → Default content → Supabase → Admin panel → Website
						</p>

						<p>
							If there is no value in Supabase, the website uses{' '}
							<code>defaultContent</code>.
						</p>
					</div>

					<div
						id='what-you-will-do'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							What you are going to do
						</h3>

						<p>You are not creating a new project.</p>
						<p>You are adding this system to your existing Next.js website.</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>Connect Supabase (database)</li>
							<li>Add environment variables</li>
							<li>Copy required files into your project</li>
							<li>Replace text with content keys</li>
							<li>Configure admin panel</li>
						</ul>

						<p>
							After that, you will be able to edit your website content from the{' '}
							<code>/admin</code> page.
						</p>

						<p className='text-sm text-muted-foreground'>
							Want a faster setup? Skip the detailed guide and use the GitHub
							README instead.
						</p>
					</div>

					<div
						id='before-you-start'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Before you start
						</h3>

						<p>Make sure you have:</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>A Next.js project</li>
							<li>Access to your code</li>
							<li>Basic understanding of React components</li>
						</ul>

						<p>
							Estimated setup time: ~20–40 minutes depending on your project
							size
						</p>

						<p>
							<strong>Important:</strong> This system works only with Next.js
							applications.
						</p>
					</div>
				</section>

				{/* 1. CORE CONCEPT */}
				<section id='core-concept' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						1. Core Concept
					</h2>

					<div
						id='content-system'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							What is content system
						</h3>

						<p>This system is built around three main parts:</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>Keys (in your code)</li>
							<li>Default content (local fallback)</li>
							<li>Supabase (remote storage)</li>
						</ul>

						<p>Each piece of text on your website is linked to a key.</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`hero_title → "Welcome to my website"`}
						</pre>

						<p>This key is used everywhere:</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>In your code</li>
							<li>In admin panel</li>
							<li>In database</li>
						</ul>
					</div>

					<div
						id='content-flow'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							How content flows
						</h3>

						<p>When your website renders:</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>It looks for value in Supabase</li>
							<li>If value exists → it uses it</li>
							<li>
								If not → it uses <code>defaultContent</code>
							</li>
						</ul>

						<p>
							This ensures your website always works, even without database
							data.
						</p>

						<p className='text-sm text-muted-foreground'>
							Flow: Code → defaultContent → Supabase → Admin → Website
						</p>
					</div>

					<div
						id='example'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Example
						</h3>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`<h1>Welcome</h1>`}
						</pre>

						<p>Becomes:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`<h1>{c.hero_title}</h1>`}
						</pre>

						<p>
							Then in <code>defaultContent</code>:
						</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`hero_title: "Welcome"`}
						</pre>

						<p>Now this text becomes editable from the admin panel.</p>
					</div>

					<div
						id='mental-model'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Mental model
						</h3>

						<p>You are no longer editing text in your code.</p>
						<p>You are editing content through keys.</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`Code = structure
Keys = placeholders
Admin panel = content editor
Supabase = storage`}
						</pre>
					</div>
				</section>

				{/* 2. SUPABASE SETUP */}
				<section id='supabase-setup' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						2. Supabase Setup
					</h2>

					<div
						id='create-account'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 1. Create account
						</h3>

						<p>Go to https://supabase.com</p>
						<p>Click &quot;Start your project&quot;</p>
						<p>Sign in using GitHub or email.</p>
					</div>

					<div
						id='create-project'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 2. Create project
						</h3>

						<p>Click &quot;New project&quot;</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>Name → any name (example: landing-admin)</li>
							<li>Database password → create a strong password (save it)</li>
							<li>Region → choose the closest to you</li>
						</ul>

						<p>Click &quot;Create project&quot;</p>
						<p>Wait 1–2 minutes until the project is ready.</p>
					</div>

					<div
						id='create-table'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 3. Create table
						</h3>

						<p>Open Table Editor → New Table</p>
						<p>
							Name: <code>content</code>
						</p>

						<p>Add columns:</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>key → text → PRIMARY KEY</li>
							<li>value → text</li>
						</ul>

						<p>
							<strong>Important:</strong> &quot;key&quot; must be PRIMARY KEY.
							This ensures every content entry is unique.
						</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`create table content (
  key text primary key,
  value text
);`}
						</pre>
					</div>

					<div
						id='storage'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 4. Create storage
						</h3>

						<p>Go to Storage → Create bucket</p>
						<p>
							Name: <code>images</code>
						</p>
						<p>Make it public</p>

						<p>This is required to store uploaded images.</p>
					</div>

					<div
						id='api-keys'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 5. Get API keys
						</h3>

						<p>Go to Settings → API</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>Project URL</li>
							<li>anon public key</li>
						</ul>

						<p>You will need them in the next step.</p>
					</div>
				</section>

				{/* 3. ENV VARIABLES */}
				<section id='env-variables' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						3. Environment Variables
					</h2>

					<div
						id='env-create-file'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 1. Create file
						</h3>

						<p>Create a file in your project root:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`.env.local`}
						</pre>
					</div>

					<div
						id='env-add-variables'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 2. Add variables
						</h3>

						<p>Paste the following:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
ADMIN_PASSWORD=your_password`}
						</pre>
					</div>

					<div
						id='admin-password'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							What is ADMIN_PASSWORD
						</h3>

						<p>
							This is the password used to access the <code>/admin</code> page.
						</p>

						<p>
							When someone opens the admin panel, they must enter this password.
						</p>

						<p>Without it, access is denied.</p>

						<p>Use a strong password.</p>
					</div>

					<div
						id='env-hosting'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Add to hosting
						</h3>

						<p>
							If you deploy your project, you must also add these variables to
							your hosting platform.
						</p>

						<div className='space-y-3'>
							<div>
								<p className='font-medium'>Vercel:</p>
								<ul className='list-disc pl-6 space-y-1'>
									<li>Go to Project → Settings → Environment Variables</li>
									<li>Add all variables</li>
								</ul>
							</div>

							<div>
								<p className='font-medium'>Netlify:</p>
								<ul className='list-disc pl-6 space-y-1'>
									<li>Go to Site settings → Environment variables</li>
									<li>Add all variables</li>
								</ul>
							</div>
						</div>

						<p>
							<strong>Important:</strong> If you skip this step, the admin panel
							will not work in production.
						</p>
					</div>

					<div
						id='env-warning'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Important
						</h3>

						<p>You may see warnings about public environment variables.</p>

						<p>This is expected.</p>

						<p>These keys are safe to use on the frontend.</p>
					</div>
				</section>

				{/* 4. INSTALL FILES */}
				<section id='install-files' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						4. Install Files
					</h2>

					<div
						id='download-files'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 1. Download files
						</h3>

						<p>Go to the GitHub repository.</p>
						<p>Click &quot;Code&quot; → Download ZIP.</p>
						<p>Extract it.</p>
					</div>

					<div
						id='copy-folders'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 2. Copy required folders
						</h3>

						<p>Copy the following into your project:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`app/api/*
/lib/*
/components/ui/*`}
						</pre>

						<p>
							<strong>Important:</strong> Copy files exactly with the same
							folder structure.
						</p>

						<p>
							Do not rename folders or move files — paths are required for the
							system to work.
						</p>
					</div>

					<div
						id='copy-admin'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 3. Copy admin page
						</h3>

						<p>Copy the following file:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`app/admin/page.tsx`}
						</pre>

						<p>
							<strong>Important:</strong> Copy it completely without any
							changes.
						</p>
					</div>

					<div
						id='install-result'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Result check
						</h3>

						<p>At this point, you should have:</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>api folder</li>
							<li>lib folder</li>
							<li>ui components</li>
							<li>admin page</li>
							<li>env file</li>
						</ul>
						<p>If something is missing, go back and check the steps.</p>
					</div>
				</section>

				{/* 5. PROJECT STRUCTURE */}
				<section id='project-structure' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						5. Project Structure
					</h2>

					<div
						id='why-structure'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Why we change structure
						</h3>

						<p>We separate logic from routing.</p>
						<p>Next.js pages stay simple.</p>
						<p>UI is moved into components.</p>
					</div>

					<div
						id='move-page'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 1. Move page
						</h3>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`app/page.tsx → components/pages/HomePage.tsx`}
						</pre>
					</div>

					<div
						id='replace-page'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 2. Replace page.tsx
						</h3>

						<p>This file should only import your page component.</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`import HomePage from '@/components/pages/HomePage'
import { getContent } from '@/lib/getContent'

export const revalidate = 0

export default async function Page() {
  const content = await getContent()

  return <HomePage content={content} />
}`}
						</pre>
					</div>

					<div
						id='move-ui'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Step 3. Move your UI
						</h3>

						<p>Create:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`components/pages/HomePage.tsx`}
						</pre>

						<p>Paste the following template (required):</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`'use client'

import { ContentKey } from '@/lib/defaultContent'
import { useEffect } from 'react'

type Content = Record<ContentKey, string>

type Props = {
  content: Content
}

export default function Home({ content }: Props) {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'scroll-to') return

      const id = e.data.id
      if (!id) return

      const el = document.getElementById(id)
      if (!el) return

      const yOffset = -80
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      })
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const c = content

  return (
    <main>
      <div>Your content goes here like this:</div>
      <h1>{c.hero_title}</h1>
    </main>
  )
}`}
						</pre>

						<p>Then paste your UI and logic if you have them.</p>

						<p className='text-sm text-muted-foreground'>
							You can also download this file from the repository:
							components/pages/TemplatePage.tsx
						</p>
					</div>

					<div
						id='multi-page-structure'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Multi-page websites
						</h3>

						<p>Repeat this for every page:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`about/page.tsx → components/pages/AboutPage.tsx`}
						</pre>
					</div>
				</section>
				{/* 6. MAKE CONTENT EDITABLE */}
				<section id='make-content-editable' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						6. Make Content Editable
					</h2>

					<div
						id='replace-text'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Replace text
						</h3>

						<p>Replace static text with content keys.</p>

						<p>Example:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`<h1>Welcome</h1>`}
						</pre>

						<p>Becomes:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`<h1>{c.hero_title}</h1>`}
						</pre>
					</div>

					<div
						id='default-content'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Add to defaultContent
						</h3>

						<p>
							Add the key to <code>defaultContent</code>:
						</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`hero_title: "Welcome"`}
						</pre>

						<p>
							<strong>Important:</strong> <code>defaultContent</code> is your
							foundation.
						</p>

						<p>
							It is not just a fallback — it defines your entire content
							structure.
						</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>All keys must exist here</li>
							<li>Admin panel reads structure from here</li>
							<li>Website uses it when Supabase is empty</li>
						</ul>

						<p>If a key is missing here, it will not work anywhere.</p>
					</div>

					<div
						id='important-content'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Important
						</h3>

						<p>If text is not replaced with a key:</p>

						<p>
							It will <strong>not</strong> appear in the admin panel.
						</p>
					</div>

					<div
						id='images-content'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Images
						</h3>

						<p>Use the same logic:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`hero_image: "/image.png"`}
						</pre>

						<p>
							<strong>Important:</strong> Images uploaded via the admin panel:
						</p>

						<ul className='list-disc pl-6 space-y-1'>
							<li>Are compressed</li>
							<li>Converted to WebP</li>
							<li>Optimized automatically</li>
						</ul>
					</div>
				</section>

				{/* 7. MULTI-PAGE */}
				<section id='multi-page' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						7. Multi-page
					</h2>

					<div
						id='multi-page-prefixes'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Multi-page setup
						</h3>

						<p>Use prefixes for keys:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`home_
about_
docs_`}
						</pre>
					</div>
				</section>

				{/* 8. NEXT CONFIG */}
				<section id='next-config' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						8. Next Config
					</h2>

					<div
						id='next-images'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Next config
						</h3>

						<p>You must allow external images.</p>

						<p>Why:</p>

						<p>Images are loaded from Supabase.</p>

						<p>
							Add this to your <code>next.config.ts</code>:
						</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
},`}
						</pre>
					</div>
				</section>
				{/* 9. ADMIN CONFIGURATION */}
				<section id='admin-configuration' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						9. Admin Configuration
					</h2>

					<div
						id='admin-file'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							File
						</h3>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`app/admin/page.tsx`}
						</pre>
					</div>

					<div
						id='admin-sections'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Sections
						</h3>

						<p>Groups fields into logical blocks.</p>

						<p>Example:</p>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`Hero → title + subtitle
Problem → problem texts`}
						</pre>

						<p>This makes editing structured and easier to manage.</p>
					</div>

					<div
						id='admin-label-map'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							labelMap
						</h3>

						<p>Controls how field names appear in the UI.</p>

						<p>You can use any language.</p>
					</div>

					<div
						id='admin-scroll-map'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							scrollMap
						</h3>

						<p>Links the editor with the preview.</p>

						<p>
							When you open a section, the preview scrolls to the corresponding
							block.
						</p>
					</div>

					<div
						id='admin-important'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Important
						</h3>

						<p>You do not need to write this from scratch.</p>

						<p>Just edit the file you copied.</p>

						<p>Change keys and labels as needed.</p>
					</div>
				</section>

				{/* 10. RUN PROJECT */}
				<section id='run-project' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						10. Run Project
					</h2>

					<div
						id='install-deps'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Install dependencies
						</h3>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`npm install
pnpm install
yarn install`}
						</pre>
					</div>

					<div
						id='start-dev'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Start dev server
						</h3>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`npm run dev`}
						</pre>
					</div>

					<div
						id='open-admin'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Open admin panel
						</h3>

						<pre className='bg-muted/40 border rounded-xl p-5 text-sm overflow-x-auto'>
							{`http://localhost:3000/admin`}
						</pre>
					</div>
				</section>

				{/* 11. USING ADMIN PANEL */}
				<section id='using-admin' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						11. Using Admin Panel
					</h2>

					<div
						id='admin-usage'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Using admin panel
						</h3>

						<ul className='list-disc pl-6 space-y-2'>
							<li>Edit text</li>
							<li>Save changes</li>
							<li>Reset to default</li>
							<li>Upload images</li>
						</ul>

						<p>Works on both mobile and desktop.</p>
					</div>
				</section>

				{/* 12. ADVANCED */}
				<section id='advanced' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						12. How It Works (Advanced)
					</h2>

					<div
						id='advanced-info'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Advanced
						</h3>

						<ul className='list-disc pl-6 space-y-2'>
							<li>Uses fallback system</li>
							<li>Updates instantly</li>
							<li>No rebuild required</li>
						</ul>
					</div>
				</section>

				{/* 13. COMMON MISTAKES */}
				<section id='common-mistakes' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						13. Common Mistakes
					</h2>

					<div
						id='mistakes-list'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Common mistakes
						</h3>

						<ul className='list-disc pl-6 space-y-2'>
							<li>Text was not replaced with keys</li>
							<li>Missing environment variables</li>
							<li>Supabase is not configured</li>
						</ul>
					</div>
				</section>

				{/* 14. FAQ */}
				<section id='faq' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						14. FAQ
					</h2>

					<div
						id='faq-items'
						className='space-y-10 max-w-3xl leading-relaxed text-muted-foreground'
					>
						<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
							Questions
						</h3>

						<div className='space-y-3'>
							<div>
								<p className='font-medium'>
									Q: Can I use this without Supabase?
								</p>
								<p>A: No</p>
							</div>

							<div>
								<p className='font-medium'>Q: Is it secure?</p>
								<p>A: It is protected by a password layer.</p>
							</div>
						</div>
					</div>
				</section>

				{/* 15. FINAL */}
				<section id='final' className='space-y-16'>
					<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
						15. Final
					</h2>

					<div className='space-y-5 max-w-3xl leading-relaxed text-muted-foreground'>
						<p>You are ready.</p>

						<p>You now have a fully editable website.</p>
					</div>
				</section>
			</main>

			{/* FOOTER */}
			<footer className='text-center text-sm text-muted-foreground py-10'>
				Built by{' '}
				<a
					className='text-blue-400 hover:text-blue-500 transition duration-300 underline'
					href='https://pavelsumin.com/'
					target='_blank'
				>
					Pavel Sumin
				</a>
			</footer>
		</div>
	)
}
