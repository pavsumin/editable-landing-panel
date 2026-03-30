import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
	const { key, value } = await req.json()

	const { error } = await supabase
		.from('content')
		.upsert({ key, value }, { onConflict: 'key' })

	if (error) {
		return Response.json({ error }, { status: 500 })
	}

	return Response.json({ success: true })
}
