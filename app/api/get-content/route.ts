import { supabase } from '@/lib/supabase'

export async function GET() {
	const { data, error } = await supabase.from('content').select('*')

	if (error) {
		console.error(error)
		return new Response('Error', { status: 500 })
	}

	return Response.json(data)
}
