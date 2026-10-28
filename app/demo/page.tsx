import Editor from '@/panel/Editor'
import type { Config } from '@/panel/schema.mjs'

const config: Config = {
  version: 1,
  pages: [
    {
      id: 'home',
      label: 'Demo page',
      path: '/',
      sections: [
        {
          id: 'hero',
          label: 'First impression',
          fields: [
            {
              key: 'demo.title',
              label: 'Headline',
              type: 'text',
              default: 'Your next idea deserves a great website.',
              maxLength: 180,
            },
            {
              key: 'demo.description',
              label: 'Description',
              type: 'textarea',
              default:
                'Change these words, preview your draft and save it locally. This is the same editor you can install in your own Next.js project.',
              maxLength: 5000,
            },
            {
              key: 'demo.button',
              label: 'Button label',
              type: 'text',
              default: 'Make it yours',
              maxLength: 80,
            },
            {
              key: 'demo.image',
              label: 'Image',
              type: 'image',
              default: '',
              maxLength: 2048,
            },
          ],
        },
      ],
    },
  ],
}
export default function DemoPage() {
  return <Editor config={config} demo />
}
