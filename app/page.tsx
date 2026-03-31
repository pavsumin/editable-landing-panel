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
					<div className='relative rounded-xl border bg-gradient-to-br from-muted to-muted/50 p-6 shadow-xl space-y-4'>
						<div className='text-xs text-muted-foreground'>Code</div>

						<pre className='text-sm bg-background p-3 rounded border overflow-x-auto'>
							{`<h1>${c.hero_title}</h1>`}
						</pre>

						<div className='text-center text-muted-foreground text-xs'>↓</div>

						<div className='text-xs text-muted-foreground'>Edit</div>

						<div className='border p-3 rounded bg-background'>
							Change text...
						</div>

						<div className='text-center text-muted-foreground text-xs'>↓</div>

						<div className='text-xs text-muted-foreground'>Website</div>

						<div className='text-xl font-bold text-primary'>Hello world</div>
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
				<section className='grid md:grid-cols-2 gap-12 items-center'>
					<div className='space-y-4'>
						<h2 className='text-4xl font-bold'>{c.solution_title}</h2>

						<p className='text-muted-foreground'>{c.solution_text}</p>
					</div>

					<div className='rounded-xl border p-6 bg-gradient-to-br from-primary/5 to-transparent space-y-4'>
						<div className='flex justify-between text-sm'>
							<span>Developer</span>
							<span>Client</span>
						</div>

						<div className='h-[2px] bg-muted relative'>
							<div className='absolute left-1/2 -translate-x-1/2 bg-primary text-white px-2 text-xs rounded'>
								Edit
							</div>
						</div>

						<div className='flex justify-between text-xs text-muted-foreground'>
							<span>Code</span>
							<span>Edit content</span>
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
