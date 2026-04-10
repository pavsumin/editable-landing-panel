'use client'

import {
	BookOpen,
	ChevronRight,
	Code,
	Database,
	HelpCircle,
	Home,
	Settings,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface SidebarProps {
	isOpen: boolean
	onToggle: () => void
	isDark: boolean
	setIsDark: (dark: boolean) => void
	mobileTrigger?: React.ReactNode
	activeSection: string
	scrollToSection: (id: string) => void
}

const navigation = [
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
]

function SidebarContent({
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
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set(['start', 'core-concept', 'supabase-setup', 'env-variables']),
	)

	const toggleSection = (id: string) => {
		const newExpanded = new Set(expandedSections)
		if (newExpanded.has(id)) {
			newExpanded.delete(id)
		} else {
			newExpanded.add(id)
		}
		setExpandedSections(newExpanded)
	}

	return (
		<div className='flex flex-col h-full'>
			{/* Logo */}
			<div className='p-6'>
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
			<div className='flex-1 overflow-y-auto px-6'>
				<nav className='space-y-1'>
					{navigation.map(item => {
						const isActive =
							activeSection === item.id ||
							item.subsections.some(sub => sub.id === activeSection)
						const isExpanded = expandedSections.has(item.id)
						const hasSubsections = item.subsections.length > 0

						return (
							<div key={item.id}>
								<button
									onClick={() => {
										if (hasSubsections) {
											toggleSection(item.id)
										} else {
											scrollToSection(item.id)
										}
									}}
									className={`w-full flex items-center justify-between py-2 px-3 rounded-md text-sm transition-colors cursor-pointer ${
										isActive
											? 'bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-gray-100'
											: 'text-gray-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-900'
									}`}
								>
									<div className='flex items-center gap-3'>
										{' '}
										<span>{item.title}</span>
									</div>
									{hasSubsections && (
										<ChevronRight
											className={`h-4 w-4 transition-transform ${
												isExpanded ? 'rotate-90' : ''
											}`}
										/>
									)}
								</button>

								{hasSubsections && isExpanded && (
									<div className='ml-7 mt-1 space-y-1'>
										{item.subsections.map(sub => (
											<button
												key={sub.id}
												onClick={() => scrollToSection(sub.id)}
												className={`w-full text-left py-1.5 px-3 rounded-md text-xs transition-colors cursor-pointer ${
													activeSection === sub.id
														? 'text-zinc-900 dark:text-gray-100 font-medium'
														: 'text-gray-500 dark:text-gray-500 hover:text-zinc-900 dark:hover:text-gray-100'
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
		</div>
	)
}

export function Sidebar({
	isOpen,
	onToggle,
	isDark,
	setIsDark,
	mobileTrigger,
	activeSection,
	scrollToSection,
}: SidebarProps) {
	return (
		<>
			{/* Desktop Sidebar */}
			<div className='hidden md:flex fixed left-0 top-0 h-full bg-background border-r border-border/40 transition-all duration-300 z-40 w-64'>
				<SidebarContent
					isDark={isDark}
					setIsDark={setIsDark}
					activeSection={activeSection}
					scrollToSection={scrollToSection}
				/>
			</div>

			{/* Mobile Sidebar */}
			<div className='md:hidden'>{mobileTrigger}</div>
		</>
	)
}
