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
              default: 'Build fast. Edit instantly.',
              maxLength: 180,
            },
            {
              key: 'demo.description',
              label: 'Description',
              type: 'textarea',
              default: 'No CMS. No pain. Just edit your content live.',
              maxLength: 5000,
            },
            {
              key: 'demo.button',
              label: 'Button label',
              type: 'text',
              default: 'Get started',
              maxLength: 80,
            },
            {
              key: 'demo.image',
              label: 'Image',
              type: 'image',
              default: '/demo-placeholder.webp',
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
