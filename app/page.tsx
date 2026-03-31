'use client'

import { ContentKey, defaultContent } from '@/lib/defaultContent'
import { getContent } from '@/lib/getContent'
import {
	Code2,
	Database,
	Moon,
	RefreshCcw,
	Shield,
	Sun,
	User,
	Zap,
} from 'lucide-react'
import Image from 'next/image'
import { ReactNode, useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'

/*  TYPES  */

type Content = Record<ContentKey, string>

type CardProps = {
	icon: ReactNode
	title: string
	text: string
}

type FeatureProps = {
	icon: ReactNode
	text: string
}

/*  PAGE  */

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

	const c = content || defaultContent

	return (
		<div className='min-h-screen bg-background text-foreground'>
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

			{/* MAIN */}
			<main className='max-w-6xl mx-auto px-6 py-20 space-y-32'>
				{/*  HERO  */}
				<section className='grid md:grid-cols-2 gap-12 items-center'>
					<div className='space-y-6'>
						<h1 className='text-5xl md:text-6xl font-bold leading-tight'>
							{c.hero_title}
						</h1>

						<p className='text-lg text-muted-foreground'>{c.hero_subtitle}</p>

						<div className='flex gap-4'>
							<a
								href='https://github.com/pavsumin/editable-landing-panel'
								className='flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:scale-102 transition duration-300'
								target='_blank'
							>
								<FaGithub />
								{c.hero_cta_primary}
							</a>

							<a
								href='/docs'
								className='border px-6 py-3 rounded-lg hover:bg-muted transition'
							>
								{c.hero_cta_secondary}
							</a>
						</div>
					</div>

					{/* VISUAL */}
					<div className='relative space-y-4'>
						<Image
							width={528}
							height={366}
							src={'/hero-image.webp'}
							alt={'Image of the product'}
						/>
					</div>
				</section>

				{/*  PROBLEM  */}
				<section className='space-y-10'>
					<h2 className='text-4xl font-bold text-center'>{c.problem_title}</h2>

					<div className='grid md:grid-cols-3 gap-6'>
						<Card
							icon={<Code2 />}
							title={c.problem_1_title}
							text={c.problem_1_text}
						/>
						<Card
							icon={<User />}
							title={c.problem_2_title}
							text={c.problem_2_text}
						/>
						<Card
							icon={<RefreshCcw />}
							title={c.problem_3_title}
							text={c.problem_3_text}
						/>
					</div>
				</section>

				{/*  SOLUTION  */}
				<section className='grid md:grid-cols-2 gap-16 items-center py-12'>
					<div className='space-y-6'>
						<h2 className='text-4xl md:text-5xl font-bold tracking-tight'>
							There is a better way
						</h2>
						<p className='text-lg text-muted-foreground leading-relaxed'>
							Keep your code. Add a simple editing layer. Let clients update
							content without touching your logic.
						</p>
					</div>

					<div className='relative group'>
						<div className='absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-all duration-300' />

						<div className='relative rounded-2xl border bg-card p-8 shadow-sm overflow-hidden'>
							<div className='flex justify-between items-center mb-12'>
								<div className='text-center space-y-2'>
									<div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center border shadow-sm'>
										<code className='text-primary font-bold text-xs'>
											&lt;/&gt;
										</code>
									</div>
									<span className='text-[10px] uppercase tracking-widest font-semibold text-muted-foreground'>
										Developer
									</span>
									<p className='text-sm font-medium'>Clean Code</p>
								</div>

								<div className='relative flex flex-col items-center z-10'>
									<Image
										width={32}
										height={32}
										src={'/icon.svg'}
										alt={'Logo'}
									/>

									<div className='absolute top-full mt-2 bg-primary/10 text-primary px-3 py-1 rounded-md text-[14px] font-bold tracking-tighter'>
										Edit.
									</div>
								</div>

								<div className='text-center space-y-2'>
									<div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center border shadow-sm'>
										<span className='text-primary text-lg'>✨</span>
									</div>
									<span className='text-[10px] uppercase tracking-widest font-semibold text-muted-foreground'>
										Client
									</span>
									<p className='text-sm font-medium'>Live Edit</p>
								</div>
							</div>

							<div className='absolute top-[72px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -z-0' />

							<div className='grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-dashed'>
								<div className='space-y-1'>
									<div className='h-1 w-full bg-muted rounded-full overflow-hidden'>
										<div className='h-full bg-primary/40 w-3/4' />
									</div>
									<p className='text-[10px] text-muted-foreground uppercase'>
										Logic Protected
									</p>
								</div>
								<div className='space-y-1 text-right'>
									<div className='h-1 w-full bg-muted rounded-full overflow-hidden'>
										<div className='h-full bg-primary w-1/2 ml-auto' />
									</div>
									<p className='text-[10px] text-muted-foreground uppercase'>
										Content Sync
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/*  FEATURES  */}
				<section className='space-y-12'>
					<h2 className='text-4xl font-bold text-center'>{c.features_title}</h2>

					<div className='grid md:grid-cols-3 gap-6'>
						<Feature icon={<Zap />} text={c.feature_1} />
						<Feature icon={<Code2 />} text={c.feature_2} />
						<Feature icon={<Shield />} text={c.feature_3} />
						<Feature icon={<Zap />} text={c.feature_4} />
						<Feature icon={<Database />} text={c.feature_5} />
						<Feature icon={<Shield />} text={c.feature_6} />
					</div>
				</section>

				{/*  CTA  */}
				<section className='text-center space-y-6'>
					<h2 className='text-4xl font-bold'>{c.final_title}</h2>

					<p className='text-muted-foreground'>{c.final_subtitle}</p>

					<a
						href='https://github.com/pavsumin/editable-landing-panel'
						target='_blank'
						className='inline-block bg-primary  text-primary-foreground px-8 py-4 rounded-xl shadow hover:opacity-90 transition'
					>
						{c.final_cta}
					</a>
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

/*  COMPONENTS  */

function Card({ icon, title, text }: CardProps) {
	return (
		<div className='p-6 border rounded-xl space-y-3 hover:shadow-xl/2 transition duration-300'>
			<div className='text-primary'>{icon}</div>
			<h3 className='font-semibold'>{title}</h3>
			<p className='text-sm text-muted-foreground'>{text}</p>
		</div>
	)
}

function Feature({ icon, text }: FeatureProps) {
	return (
		<div className='p-6 border rounded-xl flex items-center gap-3 hover:shadow-xl/2 transition duration-300'>
			<div className='text-primary'>{icon}</div>
			<p className='text-sm'>{text}</p>
		</div>
	)
}
