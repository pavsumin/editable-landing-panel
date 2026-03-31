'use client'

import { ContentKey } from '@/lib/defaultContent'
import { getContent } from '@/lib/getContent'
import { Cloud, Code2, Lock, Moon, Shield, Sun, Zap } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'

type Content = Record<ContentKey, string>

const featureIcons = {
	feature_1: <Code2 className='w-6 h-6' />,
	feature_2: <Zap className='w-6 h-6' />,
	feature_3: <Shield className='w-6 h-6' />,
	feature_4: <Zap className='w-6 h-6' />,
	feature_5: <Lock className='w-6 h-6' />,
	feature_6: <Cloud className='w-6 h-6' />,
}

function useSmartTyping(text: string) {
	const [display, setDisplay] = useState('')
	const [index, setIndex] = useState(0)
	const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing')

	useEffect(() => {
		let timeout: NodeJS.Timeout

		if (phase === 'typing') {
			if (index < text.length) {
				timeout = setTimeout(() => {
					setDisplay(text.slice(0, index + 1))
					setIndex(i => i + 1)
				}, 35)
			} else {
				timeout = setTimeout(() => {
					setPhase('pause')
				}, 1200)
			}
		} else if (phase === 'pause') {
			timeout = setTimeout(() => {
				setPhase('deleting')
			}, 400)
		} else if (phase === 'deleting') {
			if (index > 0) {
				timeout = setTimeout(() => {
					setDisplay(text.slice(0, index - 1))
					setIndex(i => i - 1)
				}, 20)
			} else {
				timeout = setTimeout(() => {
					setPhase('typing')
				}, 0)
			}
		}

		return () => clearTimeout(timeout)
	}, [index, phase, text])

	return display
}

function DemoBox({ content }: { content: Content }) {
	const samples = [
		content.hero_title,
		'Ship faster with Edit',
		'Let clients update content',
		'No code. Full control.',
	]

	const [sampleIndex, setSampleIndex] = useState(0)
	const [previewText, setPreviewText] = useState('')
	const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

	const typed = useSmartTyping(samples[sampleIndex])

	// preview sync simulation
	useEffect(() => {
		const savingTimeout = setTimeout(() => {
			const doneTimeout = setTimeout(() => {
				setPreviewText(typed)

				const resetTimeout = setTimeout(() => {}, 800)

				return () => clearTimeout(resetTimeout)
			}, 300)

			return () => clearTimeout(doneTimeout)
		}, 0)

		return () => clearTimeout(savingTimeout)
	}, [typed])

	// change sample
	useEffect(() => {
		const timeout = setTimeout(() => {
			setSampleIndex(i => (i + 1) % samples.length)
		}, 5000)

		return () => clearTimeout(timeout)
	}, [sampleIndex])

	return (
		<div className='grid md:grid-cols-2 gap-10'>
			{/* EDITOR */}
			<div className='space-y-3'>
				<p className='text-sm text-muted-foreground'>
					{content.demo_input_label}
				</p>

				<div className='relative group'>
					<div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-300' />

					<div className='relative bg-card border rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-all duration-300'>
						<div className='font-mono text-lg min-h-[80px] break-words'>
							{typed}
							<span className='ml-1 animate-pulse'>|</span>
						</div>

						{/* STATUS */}
						<div className='mt-3 text-xs text-muted-foreground'>
							{status === 'saving' && 'Saving...'}
							{status === 'saved' && 'Saved ✓'}
						</div>
					</div>
				</div>
			</div>

			{/* PREVIEW */}
			<div className='space-y-3'>
				<p className='text-sm text-muted-foreground'>
					{content.demo_preview_label}
				</p>

				<div className='relative group'>
					<div
						className='absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition
						duration-300'
					/>

					<div className='relative bg-primary/5 border rounded-2xl p-6 shadow-lg min-h-[80px] flex items-center justify-center hover:scale-[1.02] transition-all duration-300'>
						<p className='text-4xl md:text-5xl font-bold text-primary text-center transition-all duration-300'>
							{previewText}
							<span className='ml-1 animate-pulse'>|</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function Home() {
	const [content, setContent] = useState<Content | null>(null)

	const [isDark, setIsDark] = useState(() => {
		if (typeof window === 'undefined') return false
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	useEffect(() => {
		getContent().then(setContent)
	}, [])

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark)
	}, [isDark])

	if (!content) return null

	return (
		<>
			{/* HEADER */}
			<header className='sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/95'>
				<div className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<div className='flex items-center justify-center'>
							{isDark ? (
								<Image
									width={32}
									height={32}
									src={'/icon-dark.svg'}
									alt={'Logo'}
								/>
							) : (
								<Image width={32} height={32} src={'/icon.svg'} alt={'Logo'} />
							)}
						</div>
						<span className='font-bold text-xl'>Edit.</span>
					</div>

					<button
						onClick={() => setIsDark(prev => !prev)}
						className='p-2 rounded-lg border border-border hover:bg-muted transition duration-300 cursor-pointer'
						aria-label='Toggle theme'
					>
						{isDark ? (
							<Moon className='h-5 w-5 text-blue-400' />
						) : (
							<Sun className='h-5 w-5 text-yellow-500' />
						)}
					</button>
				</div>
			</header>

			<main className='w-full transition-all duration-300'>
				{/* HERO */}
				<section className='min-h-screen flex items-center justify-center px-6 py-20 text-center'>
					<div className='max-w-4xl space-y-6'>
						<h1 className='text-5xl md:text-7xl font-bold'>
							{content.hero_title}
						</h1>

						<p className='text-xl text-muted-foreground'>
							{content.hero_subtitle}
						</p>

						<div className='flex flex-col sm:flex-row gap-4 justify-center pt-4'>
							<a
								href='https://github.com/pavsumin/editable-landing-panel'
								className='flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:scale-102 transition duration-300'
								target='_blank'
							>
								<FaGithub />
								{content.cta_primary}
							</a>

							<a
								href='/docs'
								className='border px-6 py-3 rounded-xl hover:bg-muted transition duration-300'
								target='_blank'
							>
								{content.cta_secondary}
							</a>
						</div>
					</div>
				</section>

				{/* DEMO */}
				<section className='py-20 px-6 bg-muted/30'>
					<div className='max-w-5xl mx-auto space-y-10'>
						<div className='text-center'>
							<p className='text-primary text-sm uppercase'>
								{content.demo_label}
							</p>
							<h2 className='text-4xl font-bold'>
								Real-time editing experience
							</h2>
						</div>

						<DemoBox content={content} />
					</div>
				</section>

				{/* FEATURES */}
				<section className='py-20 px-6'>
					<div className='max-w-5xl mx-auto space-y-12'>
						<h2 className='text-4xl font-bold text-center'>
							{content.features_title}
						</h2>

						<div className='grid md:grid-cols-3 gap-6'>
							{[1, 2, 3, 4, 5, 6].map(num => (
								<div
									key={num}
									className='p-6 border rounded-xl hover:scale-105 transition duration-300'
								>
									<div className='text-primary mb-2'>
										{
											featureIcons[
												`feature_${num}` as keyof typeof featureIcons
											]
										}
									</div>
									<p>{content[`feature_${num}` as keyof typeof content]}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* CTA */}
				<section className='py-24 text-center px-6'>
					<div className='max-w-2xl mx-auto space-y-6'>
						<h2 className='text-4xl font-bold'>{content.final_title}</h2>

						<p className='text-muted-foreground'>{content.final_subtitle}</p>

						<a
							href='https://github.com/pavsumin/editable-landing-panel'
							className='bg-primary text-primary-foreground px-8 py-4 rounded-xl hover:scale-102 transition inline-block duration-300'
							target='_blank'
						>
							{content.final_button}
						</a>
					</div>
				</section>
			</main>
		</>
	)
}
