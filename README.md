# Editable Landing Panel

Add a simple admin panel to your Next.js website – without CMS complexity.

Let clients update content. Keep your code clean.

[Get Started](https://github.com/pavsumin/editable-landing-panel/edit/main/README.md#installation)

## Overview

Editable Landing Panel adds a lightweight editing layer on top of your existing website.

- You keep full control over code
- Clients get a simple UI to update content
- No CMS, no schemas, no builders

## Features

- Real-time content editing (no cache)
- Live preview while editing
- Works on desktop and mobile
- Secure admin access (password protected)
- Image upload with auto optimization (WebP)
- Works with any Next.js project

## How it works

```
defaultContent (fallback)
        ↓
Supabase (stores updates)
        ↓
getContent()
        ↓
UI → {c.hero_title}
        ↓
Admin → updates content
```

# Installation

## 1. Create Supabase project (first)

Go to Supabase and create a new project.

### Create table:

```
create table content (
  key text primary key,
  value text
);
```

### Create storage:

- Bucket name: images
- Public: enabled

## 2. Environment variables

Create .env.local:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

ADMIN_PASSWORD=your_password
```

### What is ADMIN_PASSWORD?

This is the password used to access /admin.

- You (or your client) will enter this password to edit content
- Without it – admin panel is inaccessible

### Env warnings

Warnings about public environment variables are expected.

- NEXT*PUBLIC*\* → used in frontend
- SERVICE_ROLE_KEY → used only on server

This is normal and required for the system to work.

## 3. Copy required files

Download this repository as ZIP or copy manually:

- app/api/\*
- lib/\*
- components/ui/\*
- app/admin/page.tsx

Place them into your project with the same structure.

## 4. Configure Next.js images

Open:

```
next.config.ts
```

Add:

```
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

### Why this is required

Your images will be stored in Supabase.

Next.js blocks external images by default –
this config allows them to load properly.

# Core integration

## 5. Replace app/page.tsx

You must replace your page.tsx with this logic:

```
import HomePage from '@/components/pages/HomePage'
import { getContent } from '@/lib/getContent'

export const revalidate = 0

export default async function Page() {
  const content = await getContent()
  return <HomePage content={content} />
}
```

### Why this matters

    •	disables cache → instant updates
    •	connects UI with Supabase
    •	enables live editing

## 6. Move your UI

Create:

```
components/pages/HomePage.tsx
```

Move your entire page UI there.

Use the template:

```
'use client'

import { ContentKey } from '@/lib/defaultContent'
import { useEffect } from 'react'

type Content = Record<ContentKey, string>

type Props = {
	content: Content
}

export default function Home({ content }: Props) {
	useEffect(() => {
		const handler = (e: MessageEvent) => {
			if (e.data?.type !== 'scroll-to') return

			const id = e.data.id
			if (!id) return

			const el = document.getElementById(id)
			if (!el) return

			const yOffset = -80
			const y =
				el.getBoundingClientRect().top + window.pageYOffset + yOffset

			window.scrollTo({
				top: y,
				behavior: 'smooth',
			})
		}

		window.addEventListener('message', handler)
		return () => window.removeEventListener('message', handler)
	}, [])

	const c = content

	return (
		<main>
			{/* your content */}
			<h1>{c.hero_title}</h1>
		</main>
	)
}
```

Or copy it from this repo:

```
components/pages/TemplatePage.tsx
```

### Important

You must follow this structure exactly.

It includes:
• content typing
• scroll sync (editor → preview)
• required hooks

### Multi-page support

If your website has multiple pages:

Repeat the same process for each page.

Example:

```
app/about/page.tsx
→ components/pages/AboutPage.tsx
```

## 7. Make content editable

Replace static text with keys.

Before:

```
<h1>Welcome</h1>
```

After:

```
<h1>{c.hero_title}</h1>
```

### Important

If you want something editable – it must be a key.

## 8. Define content

File:

```
lib/defaultContent.ts
```

Example:

```
hero_title: 'Welcome to my website'
```

### Images

```
hero_image_light: '/hero.webp'
```

```
<Image src={c.hero_image_light} />
```

### Image behavior

Images uploaded via admin are:

- compressed
- converted to WebP
- optimized automatically

No manual optimization needed.

## Admin configuration

File:

```
app/admin/page.tsx
```

### sections

Groups fields into blocks inside admin UI.

Example:

```
export const sections = {
	Hero: [
		'hero_title',
		'hero_subtitle',
	],
	Problem: [
		'problem_title',
		'problem_1_title',
	],
	Solution: [
		'solution_title',
		'solution_text',
	],
   etc.
}
```

This makes editing structured and clear.

### labelMap

Controls how fields are displayed in UI.

```
export const labelMap: Record<ContentKey, string> = {
	hero_title: 'Main Title',
	hero_subtitle: 'Support Title',
   Etc.
}
```

You can name fields however you want (any language).

### scroll mapping

Links editor with preview.

```
const scrollToSection = (section: string) => {
		const map: Record<string, string> = {
			Hero: 'hero',
			Problem: 'problem',
			Solution: 'solution',
etc.
}
```

Each section must have a matching id:

```
<section id=‘hero’>
  Content
</section>
```

#### Important

You don’t need to build this file from scratch.

Just open the app/admin/page.tsx you copied from this repository and:

- update keys (hero_title, etc.)
- adjust sections
- rename labels in labelMap
- match section IDs for scroll

Everything else is already implemented and ready to use.

### Notes

- Same key = same content everywhere
- Use unique keys if content differs
- One Supabase project per website

### Setup time

- ~30–60 minutes manually
- faster with AI

### Documentation

If you want a full step-by-step guide:

→ [/docs](https://editable-landing-panel.vercel.app/docs)

### Tech stack

- Next.js
- TypeScript
- Supabase
- Tailwind CSS
- shadcn/ui

### License

MIT — free to use and modify

### Author

[Pavel Sumin](https://pavelsumin.com)
