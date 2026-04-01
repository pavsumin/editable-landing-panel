import { defaultContent } from '@/lib/defaultContent'
import { supabase } from '@/lib/supabase'

export async function GET() {
	const { data, error } = await supabase.from('content').select('*')

	if (error) {
		return new Response('Error', { status: 500 })
	}

	const dbMap = Object.fromEntries(
		(data || []).map(item => [item.key, item.value]),
	)

	const merged = Object.entries(defaultContent).map(([key, value]) => ({
		key,
		value: dbMap[key] ?? value,
	}))

	return Response.json(merged)
}
