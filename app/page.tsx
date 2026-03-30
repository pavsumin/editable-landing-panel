import { getContent } from '@/lib/getContent'

export const revalidate = 0

export default async function Home() {
	const content = await getContent()

	return (
		<main className='min-h-screen px-6 py-12 max-w-4xl mx-auto'>
			{/* HERO */}
			<section className='mb-16'>
				<h1 className='text-4xl font-bold mb-4'>{content.hero_title}</h1>
				<p className='text-lg text-gray-600 mb-6'>{content.hero_subtitle}</p>

				<button className='bg-black text-white px-6 py-3 rounded-xl'>
					{content.cta_text}
				</button>
			</section>

			{/* ABOUT */}
			<section>
				<h2 className='text-2xl font-semibold mb-4'>About this project</h2>
				<p className='text-gray-700'>{content.about_text}</p>
			</section>
		</main>
	)
}
