'use client'

import { CodeBlockCommand } from '@/components/code-block-command/code-block-command'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from '@/components/ui/sidebar'
import { ContentKey } from '@/lib/defaultContent'
import {
	AlertCircle,
	ArrowRight,
	BookOpen,
	Check,
	ChevronRight,
	Code,
	Code2,
	Database,
	Eye,
	FileCode,
	FileJson,
	Folder,
	Globe,
	HelpCircle,
	Home,
	ImagePlus,
	Info,
	Menu,
	Moon,
	PartyPopper,
	RotateCcw,
	Save,
	Settings,
	Settings2,
	ShieldCheck,
	Sun,
	Type,
	X,
	Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CopyButton } from '../copy-button/copy-button'

/*  TYPES  */

type Content = Record<ContentKey, string>

type Props = {
	content: Content
}

/* SIDEBAR CONTENT COMPONENT */
function SidebarContentComponent({
	isDark,
	setIsDark,
	activeSection,
	scrollToSection,
}: {
	isDark: boolean
	setIsDark: (dark: boolean) => void
	activeSection: string
	scrollToSection: (id: string) => void
}) {
	return (
		<div className='flex flex-col h-full'>
			{/* Logo */}
			<div className='p-6 border-b border-border/40'>
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
			</div>

			{/* Navigation */}
			<div className='flex-1 overflow-y-auto p-4'>
				<nav className='space-y-2'>
					{[
						{
							id: 'start',
							title: 'Getting Started',
							icon: Home,
							subsections: [
								{ id: 'what-is-this', title: 'What is this' },
								{ id: 'how-it-works', title: 'How it works' },
								{ id: 'what-you-will-do', title: 'What you will do' },
								{ id: 'before-you-start', title: 'Before you start' },
							],
						},
						{
							id: 'core-concept',
							title: 'Core Concept',
							icon: BookOpen,
							subsections: [
								{ id: 'content-system', title: 'Content System' },
								{ id: 'content-flow', title: 'Content Flow' },
								{ id: 'example', title: 'Example' },
								{ id: 'mental-model', title: 'Mental Model' },
							],
						},
						{
							id: 'supabase-setup',
							title: 'Supabase Setup',
							icon: Database,
							subsections: [
								{ id: 'create-account', title: 'Create Account' },
								{ id: 'storage', title: 'Storage' },
								{ id: 'api-keys', title: 'API Keys' },
							],
						},
						{
							id: 'env-variables',
							title: 'Environment Variables',
							icon: Settings,
							subsections: [
								{ id: 'env-create-file', title: 'Create File' },
								{ id: 'env-add-variables', title: 'Add Variables' },
								{ id: 'admin-password', title: 'Admin Password' },
								{ id: 'env-hosting', title: 'Hosting' },
								{ id: 'env-warning', title: 'Warning' },
							],
						},
						{
							id: 'install-files',
							title: 'Install Files',
							icon: Code,
							subsections: [],
						},
						{
							id: 'project-structure',
							title: 'Project Structure',
							icon: Code,
							subsections: [],
						},
						{
							id: 'multi-page',
							title: 'Multi Page',
							icon: Code,
							subsections: [],
						},
						{
							id: 'next-config',
							title: 'Next Config',
							icon: Settings,
							subsections: [],
						},
						{
							id: 'admin-configuration',
							title: 'Admin Configuration',
							icon: Settings,
							subsections: [],
						},
						{
							id: 'run-project',
							title: 'Run Project',
							icon: Code,
							subsections: [],
						},
						{
							id: 'using-admin',
							title: 'Using Admin',
							icon: Settings,
							subsections: [],
						},
						{
							id: 'common-mistakes',
							title: 'Common Mistakes',
							icon: HelpCircle,
							subsections: [],
						},
						{
							id: 'faq',
							title: 'FAQ',
							icon: HelpCircle,
							subsections: [],
						},
						{
							id: 'final',
							title: 'Final',
							icon: BookOpen,
							subsections: [],
						},
					].map((item) => {
						const Icon = item.icon
						const isActive = activeSection === item.id || item.subsections.some(sub => sub.id === activeSection)

						return (
							<div key={item.id}>
								<button
									onClick={() => scrollToSection(item.id)}
									className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
										isActive
											? 'bg-primary/10 text-primary border border-primary/20'
											: 'hover:bg-muted text-muted-foreground hover:text-foreground'
									}`}
								>
									<Icon className='h-4 w-4' />
									<span className='text-sm font-medium'>{item.title}</span>
								</button>

								{item.subsections.length > 0 && (
									<div className='ml-7 mt-1 space-y-1'>
										{item.subsections.map((sub) => (
											<button
												key={sub.id}
												onClick={() => scrollToSection(sub.id)}
												className={`w-full flex items-center px-3 py-1.5 rounded-md text-left text-xs transition-colors ${
													activeSection === sub.id
														? 'bg-primary/5 text-primary'
														: 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
												}`}
											>
												{sub.title}
											</button>
										))}
									</div>
								)}
							</div>
						)
					})}
				</nav>
			</div>

			{/* Theme Switcher */}
			<div className='p-4 border-t border-border/40'>
				<button
					onClick={() => setIsDark(!isDark)}
					className='w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors'
				>
					{isDark ? (
						<Sun className='h-4 w-4 text-yellow-500' />
					) : (
						<Moon className='h-4 w-4 text-blue-400' />
					)}
					<span className='text-sm'>Toggle theme</span>
				</button>
			</div>
		</div>
	)
}

/*  PAGE  */

export default function DocsPage({ content }: Props) {
	const [isDark, setIsDark] = useState(() => {
		if (typeof window === 'undefined') return false
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	const [sidebarOpen, setSidebarOpen] = useState(true)

	const [activeSection, setActiveSection] = useState('start')

	useEffect(() => {
		const handleScroll = () => {
			const sections = [
				'start', 'what-is-this', 'how-it-works', 'what-you-will-do', 'before-you-start',
				'core-concept', 'content-system', 'content-flow', 'example', 'mental-model',
				'supabase-setup', 'create-account', 'storage', 'api-keys',
				'env-variables', 'env-create-file', 'env-add-variables', 'admin-password', 'env-hosting', 'env-warning',
				'install-files', 'project-structure', 'multi-page', 'next-config', 'admin-configuration',
				'run-project', 'using-admin', 'common-mistakes', 'faq', 'final'
			]

			let current = 'start'
			for (const section of sections) {
				const element = document.getElementById(section)
				if (element) {
					const rect = element.getBoundingClientRect()
					if (rect.top <= 100) {
						current = section
					}
				}
			}
			setActiveSection(current)
		}

		window.addEventListener('scroll', handleScroll)
		handleScroll()
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id)
		if (element) {
			const yOffset = -80
			const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
			window.scrollTo({ top: y, behavior: 'smooth' })
		}
	}

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
			{/* SIDEBAR */}
			<Sidebar
				isOpen={sidebarOpen}
				onToggle={() => setSidebarOpen(!sidebarOpen)}
				isDark={isDark}
				setIsDark={setIsDark}
			/>

			{/* HEADER */}
			<header className={`sticky top-0 z-30 border-b border-border/40 backdrop-blur-sm bg-background/95 transition-all duration-300 ${
				sidebarOpen ? 'md:ml-64' : 'md:ml-16'
			}`}>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
					{/* Logo - only show when sidebar is closed on desktop */}
					{!sidebarOpen && (
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
					)}

					{/* Desktop: Theme switcher when sidebar is open, Mobile: Sidebar button */}
					<div className='flex items-center gap-2'>
						{sidebarOpen && (
							<button
								onClick={() => setIsDark(prev => !prev)}
								className='hidden md:flex p-2 rounded-lg border border-border hover:bg-muted transition duration-300 cursor-pointer'
								aria-label='Toggle theme'
							>
								<Moon className='hidden dark:block h-5 w-5 text-blue-400' />
								<Sun className='block dark:hidden h-5 w-5 text-yellow-500' />
							</button>
						)}
						{/* Mobile sidebar */}
						<div className='md:hidden'>
							<Sheet>
								<SheetTrigger asChild>
									<button className='p-2 rounded-lg border border-border hover:bg-muted transition-colors'>
										<Menu className='h-5 w-5' />
									</button>
								</SheetTrigger>
								<SheetContent side='right' className='w-64 p-0'>
									<SidebarContentComponent
										isDark={isDark}
										setIsDark={setIsDark}
										activeSection={activeSection}
										scrollToSection={scrollToSection}
									/>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</header>

			{/* MAIN CONTENT */}
			<main className={`max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 transition-all duration-300 ${
				sidebarOpen ? 'md:ml-64' : 'md:ml-16'
			}`}>
				<div className='space-y-24'>
					{/* 0. START */}
					<section id='start' className='space-y-16 scroll-mt-24'>
						<h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Next.js Admin Panel Documentation
						</h1>

						<div
							id='what-is-this'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
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

							<div className='border-l-2 border-background-foreground/30 ml-1 pl-6 space-y-6 my-8'>
								<div className='space-y-2'>
									<div className='text-xs tracking-wider text-zinc-400 font-semibold'>
										Before
									</div>
									<CodeBlock code={`<h1>Welcome to my website</h1>`} />
								</div>

								<div className='space-y-2'>
									<div className='text-xs tracking-wider text-zinc-400 font-semibold'>
										After
									</div>
									<CodeBlock code={`<h1>{c.hero_title}</h1>`} />
								</div>
							</div>

							<p>
								Now this text can be changed from an admin panel without
								touching the code.
							</p>

							<p>
								<strong>Important:</strong> You still keep full control over
								your layout, design, and logic. Only the content becomes
								editable.
							</p>
						</div>

						<div
							id='how-it-works'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								How it works
							</h3>
							<p>The system works in a very simple way:</p>

							<ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
								<li>You replace text in your code with keys</li>
								<li>
									Default values are stored in <code>defaultContent.ts</code>
								</li>
								<li>Supabase stores updated values</li>
								<li>Admin panel lets you edit content</li>
								<li>Website always shows the latest version</li>
							</ul>

							<div className='py-4'>
								<div className='flex flex-wrap items-center gap-y-4 gap-x-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400'>
									<div className='flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border'>
										<Code2 size={14} /> Code
									</div>
									<ChevronRight size={14} className='text-zinc-300' />

									<div className='flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border'>
										<FileJson size={14} /> Default content
									</div>
									<ChevronRight size={14} className='text-zinc-300' />

									<div className='flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border text-primary'>
										<Settings2 size={14} /> Admin
									</div>
									<ChevronRight size={14} className='text-zinc-300' />

									<div className='flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border'>
										<Database size={14} /> Supabase
									</div>
									<ChevronRight size={14} className='text-zinc-300' />

									<div className='flex items-center gap-1.5 bg-primary/08 text-primary px-2 py-1 rounded-md border border-primary/20'>
										<Globe size={14} /> Website
									</div>
								</div>
							</div>

							<div className='flex items-start gap-3 bg-muted/20 p-4 rounded-lg border border-border/50 text-sm'>
								<ShieldCheck className='h-5 w-5 text-emerald-500 shrink-0 mt-0.5' />
								<p>
									<strong>Zero-downtime fallback:</strong> If a value is missing
									in Supabase or the database is unreachable, the website
									instantly uses <code>defaultContent</code> from your local
									code.
								</p>
							</div>
						</div>

						<div
							id='what-you-will-do'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								What you are going to do
							</h3>

							<p>You are not creating a new project.</p>
							<p>
								You are adding this system to your existing Next.js website.
							</p>

							<ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
								<li>
									<Link
										href='#supabase-setup'
										className='underline decoration-primary/30 underline-offset-6'
									>
										Connect Supabase (database)
									</Link>
								</li>
								<li>
									<Link
										href='#env-variables'
										className='underline decoration-primary/30 underline-offset-6'
									>
										Add environment variables
									</Link>
								</li>
								<li>
									<Link
										href='#install-files'
										className='underline decoration-primary/30 underline-offset-6'
									>
										Copy required files into your project
									</Link>
								</li>
								<li>
									<Link
										href='#install-files'
										className='underline decoration-primary/30 underline-offset-6'
									>
										<li>
											<Link
												href='#install-files'
												className='underline decoration-primary/30 underline-offset-6'
											>
												Copy required files into your project
											</Link>
										</li>
									</Link>
								</li>
								<li>
									<Link
										href='#make-content-editable'
										className='underline decoration-primary/30 underline-offset-6'
									>
										Replace text with content keys
									</Link>
								</li>
								<li>
									<Link
										href='#admin-configuration'
										className='underline decoration-primary/30 underline-offset-6'
									>
										Configure admin panel
									</Link>
								</li>
							</ul>

							<p>
								After that, you will be able to edit your website content from
								the <code>/admin</code> page.
							</p>

							<p className='text-sm text-muted-foreground'>
								Want a faster setup? Skip the detailed guide and use the{' '}
								<Link
									href='https://github.com/pavsumin/editable-landing-panel?tab=readme-ov-file#installation'
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-400'
								>
									GitHub README
								</Link>{' '}
								instead.
							</p>
						</div>

						<div
							id='before-you-start'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Before you start
							</h3>

							<p>Make sure you have:</p>

							<ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
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
					<section id='core-concept' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							1. Core Concept
						</h2>

						<div
							id='content-system'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								What is content system
							</h3>

							<p>This system is built around three main parts:</p>

							<ul className='space-y-3 text-sm'>
								{[
									{ title: 'Keys', desc: 'unique identifiers in your code' },
									{
										title: 'Default content',
										desc: 'local fallback for development',
									},
									{ title: 'Supabase', desc: 'remote storage for production' },
								].map((item, i) => (
									<li key={i} className='flex items-start'>
										<span className='mr-3 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40' />
										<span className='text-muted-foreground'>
											<strong className='text-foreground font-medium'>
												{item.title}
											</strong>{' '}
											— {item.desc}
										</span>
									</li>
								))}
							</ul>

							<p>Each piece of text on your website is linked to a key.</p>

							<CodeExample
								codeKey='hero_title'
								codeValue='Developers build. Clients edit.'
							/>

							<p>This key is used everywhere:</p>

							<ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
								<li>In your code</li>
								<li>In admin panel</li>
								<li>In database</li>
							</ul>
						</div>

						<div id='content-flow' className='space-y-6'>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								How content flows
							</h3>

							<div className='space-y-6 text-sm text-muted-foreground'>
								<div className='flex items-center gap-3'>
									<Database className='h-4 w-4 shrink-0' />
									<span>
										1. Checks for value in <strong>Supabase</strong>
									</span>
								</div>
								<div className='flex items-center gap-3'>
									<Zap className='h-4 w-4 shrink-0 text-amber-500' />
									<span>2. If exists — uses remote value</span>
								</div>
								<div className='flex items-center gap-3'>
									<ShieldCheck className='h-4 w-4 shrink-0' />
									<span>
										3. Fallback to <strong>defaultContent</strong> (local code)
									</span>
								</div>
							</div>
						</div>

						<div id='example' className='space-y-6 max-w-3xl pt-10'>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2'>
								Example
							</h3>

							<div className='space-y-8'>
								<div className='space-y-2'>
									<p className='text-xs font-bold tracking-wider text-zinc-400'>
										1. Static (Before)
									</p>
									<div className='opacity-70'>
										<CodeBlock code={`<h1>Welcome</h1>`} />
									</div>
								</div>

								<div className='space-y-2'>
									<p className='text-xs font-bold tracking-wider text-zinc-400'>
										2. Editable (After)
									</p>
									<CodeBlock code={`<h1>{c.hero_title}</h1>`} />
								</div>

								<div className='space-y-2'>
									<p className='text-xs font-bold tracking-wider text-zinc-400'>
										3. Local Config (DefaulContent.ts)
									</p>
									<CodeExample codeKey='hero_title' codeValue='Welcome' />
								</div>
							</div>
						</div>

						<div id='mental-model' className='space-y-6 pt-10'>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Mental model
							</h3>

							<ul className='space-y-3 text-sm text-muted-foreground'>
								<li className='flex items-center gap-2'>
									<strong className='text-foreground font-medium w-24'>
										Code
									</strong>
									<span>— Defines structure & logic</span>
								</li>
								<li className='flex items-center gap-2'>
									<strong className='text-foreground font-medium w-24'>
										Keys
									</strong>
									<span>— Content placeholders</span>
								</li>
								<li className='flex items-center gap-2'>
									<strong className='text-foreground font-medium w-24'>
										Admin
									</strong>
									<span>— Visual editor</span>
								</li>
								<li className='flex items-center gap-2'>
									<strong className='text-foreground font-medium w-24'>
										Supabase
									</strong>
									<span>— Remote storage</span>
								</li>
							</ul>
						</div>
					</section>

					{/* 2. SUPABASE SETUP */}
					<section id='supabase-setup' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							2. Supabase Setup
						</h2>

						<div
							id='create-account'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Step 1. Create account
							</h3>

							<p>
								Go to{' '}
								<Link
									href='https://supabase.com'
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-400'
								>
									https://supabase.com
								</Link>
							</p>
							<p>Click &quot;Start your project&quot;</p>
							<p>Sign in using GitHub or email.</p>
						</div>

						<div className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'>
							<h3 className='text-xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
								Step 2. Create project
							</h3>
							<p>Click &quot;New project&quot; and fill in the details:</p>
							<div className='grid gap-3 sm:grid-cols-3'>
								{[
									{ label: 'Name', val: 'Name of your project' },
									{ label: 'Password', val: 'Strong pwd' },
									{ label: 'Region', val: 'Closest to you' },
								].map(item => (
									<div
										key={item.label}
										className='p-3 rounded-lg border bg-muted/20'
									>
										<p className='text-[10px] uppercase font-bold text-zinc-400'>
											{item.label}
										</p>
										<p className='text-sm text-foreground font-medium'>
											{item.val}
										</p>
									</div>
								))}
							</div>

							<p>Wait 1–2 minutes until the project is ready.</p>
						</div>

						<div className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'>
							<h3 className='text-xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
								Step 3. Create table
							</h3>
							<p>
								Open <strong>SQL Editor</strong>, paste this code and run it:
							</p>

							<CodeBlock
								code={`create table content (
  key text primary key,
  value text
);`}
							/>

							<p className='text-sm flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-amber-600/90 dark:text-amber-400/80'>
								<AlertCircle className='h-4 w-4 shrink-0 mt-0.5' />
								<span>
									The <strong>key</strong> column must be the PRIMARY KEY. This
									ensures every entry is unique.
								</span>
							</p>
						</div>

						<div
							id='storage'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Step 4. Create storage
							</h3>

							<p>Go to Storage → Create bucket</p>
							<p>
								Name: <code>images</code>
							</p>
							<span className='text-sm flex items-center gap-2'>
								<Globe className='h-3.5 w-3.5' /> Public: Enabled
							</span>

							<p>This is required to store uploaded images.</p>
						</div>

						<div
							id='api-keys'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Step 5. Get API keys
							</h3>

							<p>
								Go to{' '}
								<strong className='inline-flex items-center gap-1 text-muted-foreground'>
									Settings <ArrowRight size={18} /> API
								</strong>{' '}
								and copy these values:
							</p>

							<ul className='space-y-2 text-md text-foreground'>
								<li className='flex items-center gap-2'>
									<div className='h-1.5 w-1.5 rounded-full bg-blue-400' />{' '}
									Project URL
								</li>
								<li className='flex items-center gap-2'>
									<div className='h-1.5 w-1.5 rounded-full bg-blue-400' /> anon
									public key
								</li>
							</ul>

							<p>You will need them in the next step.</p>
						</div>
					</section>

					{/* 3. ENV VARIABLES */}
					<section id='env-variables' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							3. Environment Variables
						</h2>

						<div
							id='env-create-file'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Step 1. Create file
							</h3>
							<p>Create a file in your project root:</p>
							<CodeBlock code={`.env.local`} />
						</div>

						<div
							id='env-add-variables'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Step 2. Add variables
							</h3>
							<p>Paste the following keys from Supabase settings:</p>
							<CodeBlock
								code={`NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
ADMIN_PASSWORD=your_password`}
							/>
						</div>

						<div
							id='admin-password'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								What is ADMIN_PASSWORD
							</h3>
							<p>
								This is the password used to access the <code>/admin</code>{' '}
								page.
							</p>
							<p>
								It acts as a simple gatekeeper: without it, the admin panel is
								inaccessible. Use a strong password to keep your content safe.
							</p>
						</div>

						<div
							id='env-hosting'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Add to hosting
							</h3>
							<p>
								When deploying, you must add these variables to your platform
								settings.
							</p>

							<div className='space-y-6 pt-2'>
								<div className='flex flex-col gap-1'>
									<p className='font-medium text-foreground'>Vercel:</p>
									<p className='flex items-center gap-1.5 text-sm'>
										Project <ChevronRight size={14} className='text-zinc-400' />
										Settings{' '}
										<ChevronRight size={14} className='text-zinc-400' />
										Environment Variables
									</p>
								</div>

								<div className='flex flex-col gap-1'>
									<p className='font-medium text-foreground'>Netlify:</p>
									<p className='flex items-center gap-1.5 text-sm'>
										Site settings{' '}
										<ChevronRight size={14} className='text-zinc-400' />
										Environment variables
									</p>
								</div>
							</div>

							<div className='flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg text-amber-600/90 dark:text-amber-400/80 text-sm'>
								<AlertCircle className='h-5 w-5 shrink-0 mt-0.5' />
								<p>
									<strong>Warning:</strong> <br />
									If you skip this, the admin panel will not work in production.
									Your website won&apos;t be able to connect to Supabase.
								</p>
							</div>
						</div>

						<div
							id='env-warning'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Security Note
							</h3>
							<p>
								You might see warnings about{' '}
								<code className='mx-1'>NEXT_PUBLIC_</code> variables. This is
								intentional. These keys are safe for the frontend, while the{' '}
								<code className='mx-1'>SERVICE_ROLE_KEY</code> is used only on
								the server to keep your data secure.
							</p>
						</div>
					</section>

					{/* 4. INSTALL FILES */}
					<section id='install-files' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							4. Install Files
						</h2>

						<div
							id='download-files'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Step 1. Download source
							</h3>
							<p>
								Go to the{' '}
								<Link
									href='https://github.com/pavsumin/editable-landing-panel'
									target='_blank'
									className='text-blue-400 underline-offset-4 hover:underline'
								>
									GitHub repository
								</Link>{' '}
								and download the project as a ZIP file. Extract it on your
								computer.
							</p>
							<p className='flex items-center gap-1.5 text-sm'>
								Click <strong className='text-foreground'>Code</strong>
								<ChevronRight size={14} className='text-zinc-400' />
								<strong className='text-foreground'>Download ZIP</strong>
							</p>
						</div>

						<div
							id='copy-folders'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Step 2. Copy required folders
							</h3>
							<p>Copy these folders into your project root:</p>

							<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
								{['app/api', 'lib', 'components/ui'].map(folder => (
									<div
										key={folder}
										className='flex items-center gap-2.5 p-3 rounded-xl border bg-muted/20'
									>
										<Folder className='h-4 w-4 text-blue-400/80' />
										<code className='text-sm font-medium text-foreground'>
											{folder}
										</code>
									</div>
								))}
							</div>

							<div className='flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg text-amber-600/90 dark:text-amber-400/80 text-sm'>
								<AlertCircle className='h-5 w-5 shrink-0 mt-0.5' />
								<p>
									<strong>Important:</strong> Maintain the exact folder
									structure. Do not rename or move files — internal imports rely
									on these specific paths.
								</p>
							</div>
						</div>

						<div
							id='copy-admin'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Step 3. Copy admin page
							</h3>
							<p>
								Copy the main admin file to your{' '}
								<code className='text-foreground'>app</code> directory:
							</p>

							<div className='flex items-center gap-2.5 p-3 rounded-lg border bg-muted/20 w-full sm:w-fit'>
								<FileCode className='h-4 w-4 text-blue-500/80' />
								<code className='text-sm font-medium text-foreground'>
									app/admin/page.tsx
								</code>
							</div>

							<p>Copy this file completely without any modifications.</p>
						</div>

						<div
							id='install-result'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Result check
							</h3>
							<p>Your project structure should now include:</p>
							<div className='grid grid-cols-2 sm:grid-cols-3 gap-y-3 text-sm'>
								{[
									{ label: 'API folder', icon: Check },
									{ label: 'Lib folder', icon: Check },
									{ label: 'UI components', icon: Check },
									{ label: 'Admin page', icon: Check },
									{ label: 'Env file', icon: Check },
								].map((item, i) => (
									<div
										key={i}
										className='flex items-center gap-2 text-foreground/80'
									>
										<item.icon className='h-3.5 w-3.5 text-emerald-500' />
										{item.label}
									</div>
								))}
							</div>
							<p>If something is missing, go back and check the steps.</p>
						</div>
					</section>

					{/* 5. PROJECT STRUCTURE */}
					<section id='project-structure' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							5. Project Structure
						</h2>

						<div
							id='why-structure'
							className='space-y-6 max-w-3xl text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Why change structure?
							</h3>
							<ul className='space-y-3 text-sm'>
								<li className='flex items-center gap-2'>
									<div className='h-1.5 w-1.5 rounded-full bg-blue-400' />
									<span>Separate logic fetching from routing</span>
								</li>
								<li className='flex items-center gap-2'>
									<div className='h-1.5 w-1.5 rounded-full bg-blue-400' />
									<span>Keep Next.js server components simple</span>
								</li>
								<li className='flex items-center gap-2'>
									<div className='h-1.5 w-1.5 rounded-full bg-blue-400' />
									<span>Enable live-preview sync in components</span>
								</li>
							</ul>
						</div>

						<div
							id='move-page'
							className='space-y-6 max-w-3xl text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Step 1. Move page
							</h3>
							<p>Move your current page content to a new component:</p>
							<div className='flex flex-wrap items-center gap-2 p-3 rounded-xl border bg-muted/20 text-sm font-mono w-full'>
								<span className='text-zinc-400'>app/page.tsx</span>

								<div className='flex items-center gap-2 text-zinc-300'>
									<ArrowRight size={14} />
								</div>

								<span className='text-foreground font-medium'>
									components/pages/HomePage.tsx
								</span>
							</div>
						</div>

						<div
							id='replace-page'
							className='space-y-6 max-w-3xl text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Step 2. Replace page.tsx
							</h3>
							<p>
								Now, update your{' '}
								<code className='text-foreground font-medium'>
									app/page.tsx
								</code>{' '}
								to fetch content:
							</p>
							<CodeBlock
								code={`import HomePage from '@/components/pages/HomePage'
import { getContent } from '@/lib/getContent'

export const revalidate = 0

export default async function Page() {
  const content = await getContent()
  return <HomePage content={content} />
}`}
							/>

							<p className='text-sm text-muted-foreground italic'>
								export const revalidate = 0 // cache disabled for live updates
							</p>
						</div>

						<div
							id='move-ui'
							className='space-y-6 max-w-3xl text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Step 3. Use the template
							</h3>

							<p>Create:</p>
							<div className='flex items-center gap-2.5 p-3 rounded-lg border bg-muted/20 w-full sm:w-fit'>
								<FileCode className='h-4 w-4 text-blue-500/80' />
								<code className='text-sm font-medium text-foreground'>
									components/pages/HomePage.tsx
								</code>
							</div>
							<p>Paste the following template (required):</p>

							<CodeBlock
								code={`'use client'

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
      <h1>{c.hero_title}</h1>
    </main>
  )
}`}
							/>

							<div className='text-sm flex gap-3 bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl text-blue-400/90 dark:text-blue-300/80'>
								<Info className='h-5 w-5 shrink-0 mt-0.5' />
								<div className='min-w-0 flex-1'>
									<p className='leading-relaxed wrap-break-word'>
										<strong>Tip:</strong> This template includes a required{' '}
										<code>useEffect</code> for scroll synchronization. You can
										also find it in{' '}
										<code>components/pages/TemplatePage.tsx</code>.
									</p>
								</div>
							</div>
						</div>

						<div
							id='multi-page-structure'
							className='space-y-6 max-w-3xl text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground'>
								Multi-page websites
							</h3>
							<p>Repeat this pattern for any additional pages:</p>
							<div className='flex flex-wrap items-center gap-2 p-3 rounded-xl border bg-muted/20 text-sm font-mono w-full'>
								<span className='text-zinc-400'>app/about/page.tsx</span>

								<div className='flex items-center gap-2 text-zinc-300'>
									<ArrowRight size={14} />
								</div>

								<span className='text-foreground font-medium'>
									components/pages/AboutPage.tsx
								</span>
							</div>
						</div>
					</section>

					{/* 6. MAKE CONTENT EDITABLE */}
					<section
						id='make-content-editable'
						className='space-y-16 scroll-mt-24'
					>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							6. Make Content Editable
						</h2>

						<div
							id='replace-text'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Replace text
							</h3>
							<p>Replace static text with content keys.</p>

							<div className='space-y-4'>
								<p className='text-sm font-medium'>Example:</p>
								<div className='rounded-xl border bg-muted/20 px-4 py-3 text-sm text-zinc-400 font-mono'>
									&lt;h1&gt;Welcome&lt;/h1&gt;
								</div>

								<p className='text-sm font-medium'>Becomes:</p>
								<CodeBlock code={`<h1>{c.hero_title}</h1>`} />
							</div>
						</div>

						<div
							id='default-content'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Add to defaultContent
							</h3>
							<p>
								Add the key to{' '}
								<code className='text-foreground'>defaultContent</code>:
							</p>

							<CodeExample codeKey='hero_title' codeValue='Welcome' />

							<div className='space-y-4'>
								<p>
									<strong>Important:</strong> <code>defaultContent</code> is
									your foundation.
								</p>
								<p>
									It is not just a fallback — it defines your entire content
									structure.
								</p>

								<ul className='space-y-3 text-sm'>
									<li className='flex items-start gap-2.5'>
										<Check className='h-4 w-4 mt-0.5 text-emerald-500' />
										<span>All keys must exist here</span>
									</li>
									<li className='flex items-start gap-2.5'>
										<Check className='h-4 w-4 mt-0.5 text-emerald-500' />
										<span>Admin panel reads structure from here</span>
									</li>
									<li className='flex items-start gap-2.5'>
										<Check className='h-4 w-4 mt-0.5 text-emerald-500' />
										<span>Website uses it when Supabase is empty</span>
									</li>
								</ul>

								<p className='text-sm flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg text-amber-600/90 dark:text-amber-400/80'>
									<AlertCircle className='h-5 w-5 shrink-0 mt-0.5' />
									<span>
										If a key is missing here, it will not work anywhere.
									</span>
								</p>
							</div>
						</div>

						<div
							id='important-content'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Important
							</h3>
							<p>If text is not replaced with a key:</p>
							<div className='p-4 rounded-lg border border-dashed text-sm'>
								It will <strong>not</strong> appear in the admin panel.
							</div>
						</div>

						<div
							id='images-content'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Images
							</h3>
							<p>Use the same logic:</p>

							<CodeExample codeKey='hero_image' codeValue='/image.png' />

							<p>And then in your component:</p>
							<CodeBlock code={`<img src={c.hero_image} alt="Hero" />`} />

							<div className='space-y-4 mt-6'>
								<p>
									<strong>Important:</strong> Images uploaded via the admin
									panel:
								</p>
								<ul className='space-y-3 text-sm'>
									<li className='flex items-start gap-2.5'>
										<Zap className='h-4 w-4 mt-0.5 text-amber-500' />
										<span>Are compressed</span>
									</li>
									<li className='flex items-start gap-2.5'>
										<Zap className='h-4 w-4 mt-0.5 text-amber-500' />
										<span>Converted to WebP</span>
									</li>
									<li className='flex items-start gap-2.5'>
										<Zap className='h-4 w-4 mt-0.5 text-amber-500' />
										<span>Optimized automatically</span>
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* 7. MULTI-PAGE */}
					<section id='multi-page' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							7. Multi-page
						</h2>

						<div
							id='multi-page-prefixes'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
								Multi-page setup
							</h3>

							<p>
								Since all keys are stored in a single table, use{' '}
								<strong>prefixes</strong> to organize content for different
								pages:
							</p>

							<CodeBlock
								code={`home_title: "..."
about_title: "..."
docs_title: "..."`}
							/>

							<p className='text-sm italic'>
								This keeps your keys unique and easy to find in the Admin Panel.
							</p>
						</div>
					</section>

					{/* 8. NEXT CONFIG */}
					<section id='next-config' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							8. Next Config
						</h2>

						<div
							id='next-images'
							className='space-y-6 max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
								Images configuration
							</h3>

							<p>
								You must allow external images in your project to render content
								from Supabase storage.
							</p>

							<div className='flex items-center gap-2.5 p-3 rounded-xl border bg-muted/20 w-full sm:w-fit'>
								<FileCode className='h-4 w-4 text-blue-400/80' />
								<code className='text-sm font-medium text-foreground'>
									next.config.ts
								</code>
							</div>

							<p>
								Add the <code className='text-foreground'>remotePatterns</code>{' '}
								to your config file:
							</p>

							<CodeBlock
								code={`images: {
	remotePatterns: [
		{
			protocol: 'https',
			hostname: '**.supabase.co',
		},
	],
},`}
							/>

							<div className='flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl text-blue-400/90 dark:text-blue-300/80 text-sm'>
								<Info className='h-5 w-5 shrink-0 mt-0.5' />
								<p>
									<strong>Why this is required:</strong> Next.js blocks external
									images by default for security. This configuration allows your
									app to safely load optimized images from your Supabase bucket.
								</p>
							</div>
						</div>
					</section>

					{/* 9. ADMIN CONFIGURATION */}
					<section id='admin-configuration' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							9. Admin Configuration
						</h2>

						<div
							id='admin-file'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								File
							</h3>

							<div className='flex items-center gap-2.5 p-3 rounded-xl border bg-muted/20 w-full sm:w-fit'>
								<FileCode className='h-4 w-4 text-blue-500/80' />
								<code className='text-sm font-medium text-foreground'>
									app/admin/page.tsx
								</code>
							</div>
						</div>

						<div
							id='admin-sections'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
								sections
							</h3>

							<p>Groups fields into logical blocks.</p>

							<p>Example:</p>

							<CodeBlock
								code={`export const sections = {
	Hero: [
		'hero_title',
		'hero_subtitle',
	],
	Demo: [
		'demo_title', 
		'demo_subtitle'
	],
	Problem: [
		'problem_title',
		'problem_text',
	],
}`}
							/>

							<p>This makes editing structured and easier to manage.</p>
						</div>

						<div
							id='admin-label-map'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
								labelMap
							</h3>

							<p>Controls how field names appear in the UI.</p>

							<CodeBlock
								code={`export const labelMap: Record<ContentKey, string> = {
	hero_title: 'Hero Title',
	hero_subtitle: 'Hero Subtitle',

	demo_title: 'Demo Title',
	demo_subtitle: 'Demo Subtitle',

	problem_title: 'Problem Title',
	problem_text: 'Problem Text',
}`}
							/>

							<p>You can use any language.</p>
						</div>

						<div
							id='admin-scroll-map'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
								scrollMap
							</h3>

							<p>Links the editor with the preview.</p>

							<CodeBlock
								code={`const scrollToSection = (section: string) => {
		const map: Record<string, string> = {
			Hero: 'hero',
			Demo: 'demo',
			Problem: 'problem',
		}
		etc...
}`}
							/>

							<CodeBlock code={`<section id='hero'> Your Content </section>`} />

							<p>
								When you open a section, the preview scrolls to the
								corresponding block.
							</p>
						</div>

						<div
							id='admin-important'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Important
							</h3>

							<div className='flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 p-5 rounded-xl text-blue-400/90 dark:text-blue-300/80 text-sm'>
								<Info className='h-5 w-5 shrink-0 mt-0.5' />
								<p className='whitespace-pre-wrap leading-relaxed'>
									You do not need to write this from scratch. {'\n'}
									Just edit the file you copied. {'\n'}
									Change keys and labels as needed.
								</p>
							</div>
						</div>
					</section>

					{/* 10. RUN PROJECT */}
					<section id='run-project' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							10. Run Project
						</h2>

						<div
							id='install-deps'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Install dependencies
							</h3>

							<div className='w-full max-w-md'>
								<CodeBlockCommand
									pnpm='pnpm install'
									yarn='yarn install'
									npm='npm install'
								/>
							</div>
						</div>

						<div
							id='start-dev'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Start dev server
							</h3>

							<div className='w-full max-w-md'>
								<CodeBlockCommand
									pnpm='pnpm dev'
									yarn='yarn dev'
									npm='npm run dev'
								/>
							</div>
						</div>

						<div
							id='open-admin'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Open admin panel
							</h3>

							<div className='flex items-center gap-2.5 p-4 rounded-xl border bg-blue-400/5 border-blue-400/10 w-fit transition-colors hover:bg-blue-400/10'>
								<Globe className='h-4 w-4 text-blue-400 dark:text-blue-300' />
								<Link
									href='http://localhost:3000/admin'
									target='_blank'
									rel='noopener noreferrer'
									className='text-sm font-mono font-medium text-blue-400 dark:text-blue-300 cursor-pointer'
								>
									http://localhost:3000/admin
								</Link>
							</div>
						</div>
					</section>

					{/* 11. USING ADMIN PANEL */}
					<section id='using-admin' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							11. Using Admin Panel
						</h2>

						<div
							id='admin-usage'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Using admin panel
							</h3>

							<ul className='space-y-3'>
								{[
									{ text: 'Live preview', icon: Eye },
									{ text: 'Edit text', icon: Type },
									{ text: 'Save changes', icon: Save },
									{ text: 'Reset to default', icon: RotateCcw },
									{ text: 'Upload images', icon: ImagePlus },
								].map((item, i) => (
									<li
										key={i}
										className='flex items-center gap-3 text-foreground/80'
									>
										<item.icon className='h-4 w-4 text-zinc-400' />
										<span className='text-sm'>{item.text}</span>
									</li>
								))}
							</ul>

							<p>Works on both mobile and desktop.</p>
						</div>
					</section>

					{/* 12. COMMON MISTAKES */}
					<section id='common-mistakes' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							12. Common Mistakes
						</h2>

						<div
							id='mistakes-list'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Common mistakes
							</h3>

							<ul className='space-y-3 text-sm'>
								<li className='flex items-start gap-2.5'>
									<X className='h-4 w-4 mt-0.5 text-red-400' />
									<span>Text was not replaced with keys</span>
								</li>
								<li className='flex items-start gap-2.5'>
									<X className='h-4 w-4 mt-0.5 text-red-400' />
									<span>Missing environment variables</span>
								</li>
								<li className='flex items-start gap-2.5'>
									<X className='h-4 w-4 mt-0.5 text-red-400' />
									<span>Supabase is not configured</span>
								</li>
							</ul>
						</div>
					</section>

					{/* 13. FAQ */}
					<section id='faq' className='space-y-16 scroll-mt-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							13. FAQ
						</h2>

						<div
							id='faq-items'
							className='space-y-6 max-w-2xl sm:max-w-3xl leading-relaxed text-muted-foreground'
						>
							<h3 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
								Questions
							</h3>

							<div className='space-y-6'>
								<div className='space-y-2'>
									<p className='font-medium text-foreground italic'>
										Q: Can I use this without Supabase?
									</p>
									<p className='pl-4 border-l-2 border-muted'>A: No</p>
								</div>

								<div className='space-y-2'>
									<p className='font-medium text-foreground italic'>
										Q: Is it secure?
									</p>
									<p className='pl-4 border-l-2 border-muted'>
										A: It is protected by a password layer.
									</p>
								</div>
							</div>
						</div>
					</section>

					{/* 14. FINAL */}
					<section id='final' className='space-y-16 scroll-mt-24 pb-24'>
						<h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground'>
							14. Final
						</h2>

						<div className='space-y-5 max-w-3xl leading-relaxed text-muted-foreground'>
							<div className='flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-medium'>
								<PartyPopper className='h-5 w-5' />
								<span>You are ready.</span>
							</div>

							<p>You now have a fully editable website.</p>
						</div>
					</section>
				</div>
			</main>

			{/* FOOTER */}
			<footer className='text-center text-sm text-muted-foreground py-10'>
				Built by{' '}
				<Link
					className='text-blue-400 hover:text-blue-500 transition duration-300 underline'
					href='https://pavelsumin.com/'
					target='_blank'
				>
					Pavel Sumin
				</Link>
			</footer>
		</div>
	)
}

interface CodeBlockProps {
	code: string
}
function CodeBlock({ code }: CodeBlockProps) {
	return (
		<div className='group relative flex items-start justify-between rounded-lg bg-muted/20 border mb-3 transition-all'>
			<pre className='p-4 overflow-x-auto w-full scrollbar-hide'>
				<code className='font-mono text-sm text-foreground block leading-relaxed'>
					{code}
				</code>
			</pre>

			<div className='pr-2 pt-2.5 shrink-0'>
				<CopyButton
					text={code}
					variant='ghost'
					className='h-8 w-8 hover:bg-muted/50 transition-colors cursor-pointer'
				/>
			</div>
		</div>
	)
}

function CodeExample({
	codeKey,
	codeValue,
}: {
	codeKey: string
	codeValue: string
}) {
	const fullCode = `${codeKey}: "${codeValue}"`

	return (
		<div className='w-full max-w-3xl group'>
			<div className='relative flex items-center rounded-t-lg border border-border bg-muted/30 dark:bg-zinc-900/50'>
				<div className='grid grid-cols-[140px_1fr] w-full items-center px-4 py-3 font-mono text-sm leading-none'>
					<span className='text-foreground font-medium'>{codeKey}:</span>
					<span className='text-muted-foreground truncate ml-2'>
						&quot;{codeValue}&quot;
					</span>
				</div>

				<div className='absolute right-2'>
					<CopyButton
						text={fullCode}
						variant='ghost'
						className='h-8 w-8 hover:bg-muted'
					/>
				</div>
			</div>

			<div className='grid grid-cols-[140px_1fr] px-4 py-2 border-x border-b border-border rounded-b-lg bg-muted/10'>
				<div className='text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60'>
					Key
				</div>
				<div className='text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 ml-2'>
					Value (text)
				</div>
			</div>
		</div>
	)
}
