import { createServer } from 'node:http'
const values = new Map()
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:54430')
  res.setHeader('Content-Type', 'application/json')
  if (url.pathname === '/rest/v1/rpc/elp_consume_login_attempt') {
    res.end('true')
    return
  }
  if (url.pathname === '/rest/v1/content') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    if (req.method === 'POST') {
      if (req.headers.apikey !== 'service-test') {
        res.statusCode = 403
        res.end('{}')
        return
      }
      for (const row of JSON.parse(Buffer.concat(chunks).toString()))
        values.set(row.key, row.value)
      res.statusCode = 201
      res.end('{}')
      return
    }
    if (req.method === 'DELETE') {
      values.delete(url.searchParams.get('key')?.replace(/^eq\./, ''))
      res.end('{}')
      return
    }
    res.end(JSON.stringify([...values].map(([key, value]) => ({ key, value }))))
    return
  }
  res.statusCode = 404
  res.end('{}')
}).listen(54430, '127.0.0.1')
