import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
	try {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL
		const key = process.env.SUPABASE_SERVICE_ROLE_KEY
		const adminPassword = process.env.ADMIN_PASSWORD

		if (!url || !key || !adminPassword) {
			console.error('Missing env variables')
			return new Response('Server misconfigured', { status: 500 })
		}

		const supabase = createClient(url, key)

		const password = req.headers.get('x-admin-password')

		if (password !== adminPassword) {
			return new Response('Unauthorized', { status: 401 })
		}

		const { key: contentKey, value } = await req.json()

		const { error } = await supabase
			.from('content')
			.upsert({ key: contentKey, value }, { onConflict: 'key' })

		if (error) {
			console.error(error)
			return new Response('DB error', { status: 500 })
		}

		return Response.json({ success: true })
	} catch (err) {
		console.error(err)
		return new Response('Server error', { status: 500 })
	}
}
