import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
	try {
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!,
		)

		const password = req.headers.get('x-admin-password')

		if (password !== process.env.ADMIN_PASSWORD) {
			return new Response('Unauthorized', { status: 401 })
		}

		const { key, value } = await req.json()

		const { error } = await supabase
			.from('content')
			.upsert({ key, value }, { onConflict: 'key' })

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
