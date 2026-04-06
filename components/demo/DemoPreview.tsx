'use client'

type Props = {
	content: {
		hero_title: string
		hero_subtitle: string
		hero_image: string
		hero_btn: string
	}
}

export default function DemoPreview({ content }: Props) {
	return (
		<div className='space-y-12'>
			{/* HERO */}
			<section className='space-y-6'>
				<h1 className='text-4xl font-bold leading-tight'>
					{content.hero_title}
				</h1>

				<p className='text-muted-foreground text-lg'>{content.hero_subtitle}</p>

				<div className='rounded-xl border p-4 bg-muted/40'>
					<img
						src={content.hero_image}
						className='w-full rounded-lg object-contain'
					/>
				</div>

				<button className='px-6 py-3 bg-primary text-primary-foreground rounded-xl'>
					{content.hero_btn}
				</button>
			</section>
		</div>
	)
}
