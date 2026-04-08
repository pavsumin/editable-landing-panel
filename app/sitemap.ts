import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://editable-landing-panel.vercel.app',
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: 'https://editable-landing-panel.vercel.app/docs',
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
	]
}
