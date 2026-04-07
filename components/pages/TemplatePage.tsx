'use client'

import { ContentKey } from '@/lib/defaultContent'
import { useEffect } from 'react'

/*  TYPES  */

type Content = Record<ContentKey, string>

type Props = {
	content: Content
}

/*  PAGE  */

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
}
