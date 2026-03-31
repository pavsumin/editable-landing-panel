export const defaultContent = {
	hero_title: 'Developers build. Clients edit.',
	hero_subtitle:
		'Build your website in code. Let clients safely update content without breaking anything or touching your logic.',

	hero_cta_primary: 'GitHub',
	hero_cta_secondary: 'Docs',

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

	how_title: 'How it works',

	how_1_title: 'Mark content',
	how_1_text: 'Wrap your text with simple keys.',

	how_2_title: 'Connect admin',
	how_2_text: 'Add a lightweight editing panel.',

	how_3_title: 'Client edits safely',
	how_3_text: 'Content updates without breaking anything.',

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
