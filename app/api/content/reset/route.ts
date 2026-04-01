import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
	try {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL
		const key = process.env.SUPABASE_SERVICE_ROLE_KEY
		const adminPassword = process.env.ADMIN_PASSWORD

		if (!url || !key || !adminPassword) {
			return new Response('Server misconfigured', { status: 500 })
		}

		const supabase = createClient(url, key)

		const password = req.headers.get('x-admin-password')

		if (!password || password !== adminPassword) {
			return new Response('Unauthorized', { status: 401 })
		}

		const { key: contentKey } = await req.json()

		if (!contentKey) {
			return new Response('Missing key', { status: 400 })
		}

		const { error } = await supabase
			.from('content')
			.delete()
			.eq('key', contentKey)

		if (error) {
			return new Response('DB error', { status: 500 })
		}

		return Response.json({ success: true })
	} catch (err) {
		return new Response('Server error', { status: 500 })
	}
}
