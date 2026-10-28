import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateCopy,
  validateAssistance,
  DEFAULT_GEMINI_MODEL,
} from '../panel/assistance.mjs'

const input = {
  brief: 'A concise website title',
  fields: [
    {
      key: 'home.title',
      label: 'Title',
      type: 'text',
      default: 'Welcome',
      maxLength: 100,
    },
  ],
}

test('AI request bounds field definitions and cannot select a provider/model/tool', () => {
  assert.equal(validateAssistance(input).fields.length, 1)
  for (const value of [
    null,
    { ...input, brief: '' },
    { ...input, brief: 'a'.repeat(12001) },
    { ...input, fields: Array(65).fill(input.fields[0]) },
    { ...input, fields: [{ ...input.fields[0], type: 'image' }] },
  ])
    assert.throws(() => validateAssistance(value))
})

test('provider key stays in a Google header and output is schema validated', async () => {
  let calls = 0
  const values = await generateCopy(input, {
    key: 'test-private-key',
    fetchImpl: async (url, options) => {
      calls++
      assert.equal(
        url,
        `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent`,
      )
      assert.equal(options.headers['x-goog-api-key'], 'test-private-key')
      assert.equal(options.redirect, 'error')
      assert.equal(options.body.includes('test-private-key'), false)
      assert.equal(
        JSON.parse(options.body).generationConfig.maxOutputTokens,
        8192,
      )
      return Response.json({
        candidates: [
          {
            finishReason: 'STOP',
            content: { parts: [{ text: '{"home.title":"Useful copy"}' }] },
          },
        ],
      })
    },
  })
  assert.equal(calls, 1)
  assert.deepEqual(values, { 'home.title': 'Useful copy' })
  await assert.rejects(
    generateCopy(input, {
      key: 'test',
      fetchImpl: async () =>
        Response.json({
          candidates: [{ content: { parts: [{ text: '{"unknown":"bad"}' }] } }],
        }),
    }),
    /Unknown content key/,
  )
  await assert.rejects(
    generateCopy(input, {
      key: 'test',
      fetchImpl: async () => new Response('', { status: 429 }),
    }),
    (error) => error.status === 429,
  )
})
