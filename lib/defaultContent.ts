export const defaultContent = {
	hero_title: 'Developers build. Clients edit.',
	hero_subtitle:
		'Build your website in code. Let clients safely update content without breaking anything or touching your logic.',

	hero_cta_primary: 'GitHub',
	hero_cta_secondary: 'Docs',

	hero_image_light: '/hero-image.webp',
	hero_image_dark: '/hero-image-dark.webp',

	demo_title: 'Try it yourself',
	demo_subtitle: 'Edit content and see changes instantly',

	problem_title: 'Right now, someone always loses',

	problem_1_title: 'You build it right',
	problem_1_text: 'Clean architecture, full control, perfect UX.',

	problem_2_title: 'Client needs changes',
	problem_2_text: 'Small edits become constant requests.',

	problem_3_title: 'You become support',
	problem_3_text: 'You spend time on repetitive updates instead of shipping.',

	solution_title: 'There is a better way',
	solution_text:
		'Keep your code. Add a simple editing layer. Let clients update content without touching your logic.',

	solution_dev_label: 'Developer',
	solution_dev_title: 'Clean Code',

	solution_edit_label: 'Edit layer',

	solution_client_label: 'Client',
	solution_client_title: 'Live Editing',

	solution_logic_label: 'Logic protected',
	solution_content_label: 'Content synced',

	how_title: 'How it actually works',

	how_1_title: 'Define your content',
	how_1_text:
		'Replace hardcoded text with content keys and provide default values in your codebase.',

	how_2_title: 'Sync with database',
	how_2_text:
		'Content is stored in Supabase and overrides your default values when available.',

	how_3_title: 'Edit without code',
	how_3_text:
		'Clients use a simple admin panel to update content safely in real-time.',

	flow_badge: 'Behind the scenes',
	flow_title: 'Content flow',
	flow_subtitle: 'From code to live updates in seconds',

	flow_1_label: 'CODE',
	flow_1_title: 'defaultContent',
	flow_1_desc: 'Fallback values',

	flow_2_label: 'DATABASE',
	flow_2_title: 'Supabase',
	flow_2_desc: 'Stores content',

	flow_3_label: 'ADMIN',
	flow_3_title: '/admin',
	flow_3_desc: 'Edit interface',

	flow_4_label: 'WEBSITE',
	flow_4_title: 'Live site',
	flow_4_desc: 'Always up-to-date',

	features_title: 'Built for real workflows',

	feature_1: 'No CMS complexity',
	feature_2: 'Works with your code',
	feature_3: 'Full developer control',
	feature_4: 'Fast setup',
	feature_5: 'Self-hosted',
	feature_6: 'Open source',

	final_title: 'Stop rebuilding admin panels',
	final_subtitle: 'Ship faster. Keep control. Let clients edit safely.',
	final_cta: 'Get started',

	// docs

	docs_hero_title: 'Documentation',
	docs_hero_text:
		'Step-by-step guide to install and use the editable landing panel. You can follow this even if you have never used Supabase or environment variables before.',

	// INSTALL

	docs_install_title: 'Installation',
	docs_install_text:
		'Start by downloading or cloning this repository. This project is designed to be plugged into your existing Next.js website. You do NOT need to rebuild your site from scratch.',

	docs_install_steps:
		'1. Download ZIP or clone repo\n2. Copy required files into your project\n3. Install dependencies using npm install',

	// SUPABASE

	docs_supabase_title: 'Supabase Setup (Database + Storage)',
	docs_supabase_text:
		'Supabase is used to store your editable content and uploaded images. Think of it as your content database.',

	docs_supabase_step_1: 'Go to https://supabase.com and create an account.',

	docs_supabase_step_2:
		'Click "New Project", give it a name, and wait until it is created.',

	docs_supabase_step_3:
		'Open your project → go to Table Editor → create a new table called "content".',

	docs_supabase_step_4: 'Add these columns:\n- key (text)\n- value (text)',

	docs_supabase_step_5: 'Go to Storage → create a new bucket called "images".',

	docs_supabase_step_6:
		'Make sure bucket is public (so images can be displayed on your website).',

	docs_supabase_note:
		'Each project = one website. Do NOT reuse the same project for multiple websites.',

	// ENV

	docs_env_title: 'Environment Variables',
	docs_env_text:
		'Environment variables connect your project to Supabase and secure your admin panel.',

	docs_env_step_1: 'Copy env.example → rename to .env.local',

	docs_env_step_2: 'Go to Supabase → Project Settings → API → copy your keys.',

	docs_env_step_3: 'Paste values into .env.local file.',

	docs_env_keys:
		'NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY=\nADMIN_PASSWORD=',

	docs_env_note:
		'You might see warnings about public environment variables. This is expected and safe in this setup.',

	docs_env_hosting:
		'If you deploy your site (for example on Vercel), you MUST also add these variables in project settings → Environment Variables.',

	// RUN

	docs_run_title: 'Run the Project',
	docs_run_text: 'Start your development server:',

	docs_run_code: 'npm run dev',

	docs_run_note: 'Open http://localhost:3000 in your browser.',

	// ADMIN

	docs_admin_title: 'Admin Panel',
	docs_admin_text: 'Go to /admin route. You will be asked for a password.',

	docs_admin_password:
		'This password is the ADMIN_PASSWORD from your .env file.',

	docs_admin_usage:
		'You can now edit content, upload images, and see changes instantly.',

	docs_admin_mobile:
		'The admin panel is fully responsive — you can edit your site even from your phone.',

	// CONTENT SYSTEM

	docs_content_title: 'Content System',
	docs_content_text:
		'All text and images are controlled through keys. Example: hero_title, problem_1_text, etc.',

	docs_content_step_1:
		'Replace your hardcoded text with keys like: {c.hero_title}',

	docs_content_step_2: 'Move original text into defaultContent.ts file.',

	docs_content_step_3: 'Now your content becomes editable in admin panel.',

	docs_content_note:
		'If content exists in Supabase → it overrides default content.',

	docs_content_warning:
		'Only keys that exist in defaultContent will appear in admin panel.',

	// IMAGES

	docs_images_title: 'Images',
	docs_images_text:
		'Images uploaded through admin panel are automatically optimized and converted to webp format.',

	docs_images_note:
		'You do NOT need to manually compress images — everything is handled automatically.',

	docs_images_usage:
		'Use keys like: hero_image_light and pass them into <Image src={c.hero_image_light} />',

	// MULTIPAGE

	docs_multipage_title: 'Multi-page Setup',
	docs_multipage_text:
		'For multi-page websites, use prefixes to separate content.',

	docs_multipage_example: 'home_hero_title\nabout_hero_title\ndocs_hero_title',

	docs_multipage_note: 'This prevents content collision between pages.',

	docs_multipage_structure:
		'Each page should have its own component inside components/pages/',

	// ADMIN CONFIG

	docs_admin_config_title: 'Admin Configuration',
	docs_admin_config_text: 'File: app/admin/page.tsx',

	docs_admin_sections:
		'Sections group fields into blocks inside the admin panel. This makes editing structured and easy.',

	docs_admin_labelmap:
		'Label map controls how fields are displayed. You can rename them to be human-readable.',

	docs_admin_scroll:
		'Scroll mapping connects editor with preview. When you open a section, preview scrolls to that block.',

	docs_admin_note:
		'You do NOT need to write this from scratch. Just edit the provided file and replace keys.',

	// NEXT CONFIG

	docs_next_title: 'Next.js Configuration',
	docs_next_text: 'You need to allow Supabase images in next.config.ts.',

	docs_next_code:
		'images: { remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }] }',

	docs_next_note: 'Without this, images will not load.',

	// HOW IT WORKS

	docs_how_title: 'How It Works',
	docs_how_text:
		'Default content → Supabase overrides → Admin edits → UI updates instantly.',

	docs_how_flow:
		'1. You define keys\n2. User edits content\n3. Data saved to Supabase\n4. Website updates',

	// FAQ

	docs_faq_title: 'FAQ',
	docs_faq_text: 'Common questions and answers.',

	docs_faq_q1: 'Is this secure?',
	docs_faq_a1:
		'Yes. Admin panel is protected by password and server-side keys.',

	docs_faq_q2: 'Can I customize UI?',
	docs_faq_a2: 'Yes. Everything is just React components.',

	docs_faq_q3: 'Can I use this for multiple sites?',
	docs_faq_a3: 'Yes. Create separate Supabase project for each site.',
} as const

export type ContentKey = keyof typeof defaultContent
