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
} as const

export type ContentKey = keyof typeof defaultContent
