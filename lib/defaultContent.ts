export const defaultContent = {
	hero_title: 'Build editable websites',
	hero_subtitle: 'Give your clients the power to edit—keep full control',
	cta_primary: 'GitHub',
	cta_secondary: 'View Docs',
	demo_label: 'See it in action',
	demo_input_label: 'Edit your content',
	demo_preview_label: 'Live preview',
	demo_sample_text: 'Build any website easily',
	how_title: 'How it works',
	how_1_title: 'Wrap content',
	how_1_text: 'Mark editable sections in your code with a simple wrapper',
	how_2_title: 'Client edits',
	how_2_text:
		'Your clients access a lightweight admin panel and edit text in real time',
	how_3_title: 'Deploy changes',
	how_3_text: 'Changes are saved instantly—no code knowledge required',
	features_title: 'Everything you need',
	feature_1: 'Zero-config setup',
	feature_2: 'Real-time editing',
	feature_3: 'Full developer control',
	feature_4: 'Lightweight & fast',
	feature_5: 'Type-safe content',
	feature_6: 'Self-hosted or cloud',
	about_title: 'For modern teams',
	about_text:
		'Edit gives developers the tool they need to empower clients while maintaining complete control over their website. No vendor lock-in, no bloat—just a simple admin panel.',
	final_title: 'Ready to ship editable websites?',
	final_subtitle: 'Join developers building with Edit',
	final_button: 'Get started now',
} as const

export type ContentKey = keyof typeof defaultContent
