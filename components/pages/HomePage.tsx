'use client'

import { ContentKey } from '@/lib/defaultContent'
import {
	Code2,
	Database,
	Moon,
	RefreshCcw,
	Shield,
	Sparkles,
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

type Props = {
	content: Content
}

/*  PAGE  */

export default function Home({ content }: Props) {
	const [isDark, setIsDark] = useState(() => {
		if (typeof window === 'undefined') return false
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark)
	}, [isDark])

	const c = content

	return (
		<div className='min-h-screen bg-background text-foreground'>
			{/* HEADER */}
			<header className='sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/95'>
				<div className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
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
					</div>

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
								className='flex items-center gap-2 bg-primary dark:bg-white text-primary-foreground px-6 py-3 rounded-xl hover:scale-102 transition duration-300'
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
						<h2 className='text-4xl md:text-5xl font-bold text-center md:text-left tracking-tight'>
							There is a better way
						</h2>
						<p className='text-lg text-muted-foreground text-center md:text-left leading-relaxed'>
							Keep your code. Add a simple editing layer. Let clients update
							content without touching your logic.
						</p>
					</div>

					<div className='relative group'>
						{/* glow */}
						<div className='absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-50 group-hover:opacity-80 transition-all duration-500' />

						<div className='relative rounded-2xl border bg-card p-8 shadow-sm overflow-hidden'>
							{/* TOP FLOW */}
							<div className='flex items-center justify-between gap-6 mb-10'>
								{/* line */}
								<div className='absolute z-1 top-16 left-6 right-6 h-px bg-gradient-to-r from-transparent via-border to-transparent' />

								{/* DEV */}
								<div className='flex flex-col items-center text-center space-y-2'>
									<div className='z-10 w-12 h-12 rounded-xl bg-muted border flex items-center justify-center shadow-sm'>
										<code className='text-primary text-xs font-bold'>
											&lt;/&gt;
										</code>
									</div>

									<span className='text-[10px] uppercase tracking-widest text-muted-foreground'>
										{c.solution_dev_label}
									</span>

									<p className='text-sm font-medium'>{c.solution_dev_title}</p>
								</div>

								{/* CENTER */}
								<div className='relative flex flex-col items-center'>
									<div className='relative z-10 flex flex-col items-center'>
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

										<span className='mt-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-md'>
											{c.solution_edit_label}
										</span>
									</div>
								</div>

								{/* CLIENT */}
								<div className='flex flex-col items-center text-center space-y-2'>
									<div className='z-10 w-12 h-12 rounded-xl bg-muted border flex items-center justify-center shadow-sm'>
										<span className='text-primary text-lg'>
											<Sparkles
												size={18}
												strokeWidth={1.6}
												className='text-yellow-400'
											/>
										</span>
									</div>

									<span className='text-[10px] uppercase tracking-widest text-muted-foreground'>
										{c.solution_client_label}
									</span>

									<p className='text-sm font-medium'>
										{c.solution_client_title}
									</p>
								</div>
							</div>

							{/* DIVIDER */}
							<div className='border-t border-dashed mb-6' />

							{/* STATUS BARS */}
							<div className='grid grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
										<div className='h-full bg-primary/40 w-3/4 transition-all duration-500' />
									</div>

									<p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
										{c.solution_logic_label}
									</p>
								</div>

								<div className='space-y-2 text-right'>
									<div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
										<div className='h-full bg-primary w-2/3 ml-auto transition-all duration-500' />
									</div>

									<p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
										{c.solution_content_label}
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* HOW IT WORKS */}
				<section className='space-y-16'>
					<div className='text-center space-y-4'>
						<h2 className='text-4xl md:text-5xl font-bold'>{c.how_title}</h2>
					</div>

					{/* STEPS */}
					<div className='grid md:grid-cols-3 gap-6'>
						<HowCard
							step='01'
							title={c.how_1_title}
							text={c.how_1_text}
							icon={<Code2 />}
						/>

						<HowCard
							step='02'
							title={c.how_2_title}
							text={c.how_2_text}
							icon={<Database />}
						/>

						<HowCard
							step='03'
							title={c.how_3_title}
							text={c.how_3_text}
							icon={<User />}
						/>
					</div>
				</section>

				{/* FLOW SECTION */}
				<section className='space-y-16'>
					<div className='text-center space-y-4'>
						<p className='text-sm text-muted-foreground uppercase tracking-wider'>
							{c.flow_badge}
						</p>

						<h2 className='text-4xl md:text-5xl font-bold'>{c.flow_title}</h2>

						<p className='text-muted-foreground max-w-xl mx-auto'>
							{c.flow_subtitle}
						</p>
					</div>

					<div className='relative'>
						<div className='rounded-2xl border bg-card p-8 overflow-hidden'>
							{/* DESKTOP FLOW */}
							<div className='hidden md:flex items-center justify-between gap-6'>
								<FlowBlock
									label={c.flow_1_label}
									title={c.flow_1_title}
									desc={c.flow_1_desc}
								/>

								<Arrow />

								<FlowBlock
									label={c.flow_2_label}
									title={c.flow_2_title}
									desc={c.flow_2_desc}
								/>

								<Arrow />

								<FlowBlock
									label={c.flow_3_label}
									title={c.flow_3_title}
									desc={c.flow_3_desc}
								/>

								<Arrow />

								<FlowBlock
									label={c.flow_4_label}
									title={c.flow_4_title}
									desc={c.flow_4_desc}
								/>
							</div>

							{/* MOBILE TIMELINE */}
							<div className='md:hidden relative'>
								<div className='absolute left-4 top-0 bottom-0 w-px bg-border' />

								<div className='space-y-10'>
									<TimelineItem
										label={c.flow_1_label}
										title={c.flow_1_title}
										desc={c.flow_1_desc}
									/>

									<TimelineItem
										label={c.flow_2_label}
										title={c.flow_2_title}
										desc={c.flow_2_desc}
									/>

									<TimelineItem
										label={c.flow_3_label}
										title={c.flow_3_title}
										desc={c.flow_3_desc}
									/>

									<TimelineItem
										label={c.flow_4_label}
										title={c.flow_4_title}
										desc={c.flow_4_desc}
									/>
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
						className='inline-block bg-primary dark:bg-white text-primary-foreground px-8 py-4 rounded-xl shadow hover:opacity-90 transition'
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

function HowCard({
	step,
	title,
	text,
	icon,
}: {
	step: string
	title: string
	text: string
	icon: ReactNode
}) {
	return (
		<div className='p-6 border rounded-xl space-y-4 hover:shadow-xl/2 transition duration-300'>
			<div className='flex items-center justify-between'>
				<span className='text-xs text-muted-foreground'>{step}</span>
				<div className='text-primary'>{icon}</div>
			</div>

			<h3 className='font-semibold text-lg'>{title}</h3>

			<p className='text-sm text-muted-foreground leading-relaxed'>{text}</p>
		</div>
	)
}

function FlowBlock({
	label,
	title,
	desc,
}: {
	label: string
	title: string
	desc: string
}) {
	return (
		<div className='text-center space-y-2'>
			<p className='text-xs uppercase text-muted-foreground'>{label}</p>

			<p className='font-semibold'>{title}</p>

			<p className='text-xs text-muted-foreground'>{desc}</p>
		</div>
	)
}

function Arrow() {
	return <div className='hidden md:block text-muted-foreground text-xl'>→</div>
}

function TimelineItem({
	label,
	title,
	desc,
}: {
	label: string
	title: string
	desc: string
}) {
	return (
		<div className='relative pl-12'>
			{/* DOT */}
			<div className='absolute left-[10.65px] top-2 w-3 h-3 rounded-full bg-primary ring-4 ring-card' />

			<div className='space-y-1'>
				<p className='text-[10px] uppercase tracking-widest text-muted-foreground'>
					{label}
				</p>

				<p className='text-lg font-semibold leading-tight'>{title}</p>

				<p className='text-sm text-muted-foreground leading-relaxed'>{desc}</p>
			</div>
		</div>
	)
}
