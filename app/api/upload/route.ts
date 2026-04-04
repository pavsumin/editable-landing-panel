import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
	try {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
		const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
		const adminPassword = process.env.ADMIN_PASSWORD!

		const supabase = createClient(url, key)

		const password = req.headers.get('x-admin-password')

		if (password !== adminPassword) {
			return new Response('Unauthorized', { status: 401 })
		}

		const formData = await req.formData()
		const file = formData.get('file') as File

		if (!file) {
			return new Response('No file', { status: 400 })
		}

		const buffer = Buffer.from(await file.arrayBuffer())

		const fileName = `${Date.now()}-${file.name}`

		const { error } = await supabase.storage
			.from('images')
			.upload(fileName, buffer, {
				contentType: file.type,
			})

		if (error) {
			console.error(error)
			return new Response('Upload error', { status: 500 })
		}

		const { data } = supabase.storage.from('images').getPublicUrl(fileName)

		return Response.json({ url: data.publicUrl })
	} catch (e) {
		console.error(e)
		return new Response('Server error', { status: 500 })
	}
}
