export async function POST(req: Request) {
	const { password } = await req.json()

	if (password !== process.env.ADMIN_PASSWORD) {
		return new Response('Unauthorized', { status: 401 })
	}

	return Response.json({ success: true })
}
