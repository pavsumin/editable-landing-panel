// Used only by CLI tests. No request leaves this process.
globalThis.fetch = async (url, init) => {
  if (
    String(url).endsWith('/api/editable-panel/assist') &&
    process.env.ELP_SHARED_AI_TEST
  ) {
    if (init.headers['x-goog-api-key'])
      throw new Error('Private key sent to shared service')
    if (process.env.ELP_SHARED_AI_TEST === 'quota')
      return new Response('', { status: 429 })
    return Response.json({ values: { 'home.title': 'Shared proposal' } })
  }
  if (!String(url).startsWith('https://generativelanguage.googleapis.com/'))
    throw new Error('Unexpected network request in AI test')
  if (init.headers['x-goog-api-key'] !== 'fake-test-key')
    throw new Error('Test key was not passed in a header')
  return Response.json({
    candidates: [
      {
        content: {
          parts: [
            {
              text: JSON.stringify(
                process.env.ELP_INVALID_AI_TEST === '1'
                  ? { unknown: 'bad' }
                  : { 'home.title': 'A reviewed AI proposal' },
              ),
            },
          ],
        },
      },
    ],
  })
}
await import('../packages/cli/bin/elp.mjs')
