import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.supabase.co',
			},
		],
	},
}

module.exports = {
	allowedDevOrigins: ['172.16.0.83'],
}

export default nextConfig
