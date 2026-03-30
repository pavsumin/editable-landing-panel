import { supabase } from '@/lib/supabase'

export async function GET() {
	const { data } = await supabase.from('content').select('*')

	return Response.json(data)
}
