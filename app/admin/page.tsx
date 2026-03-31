'use client'

import { ContentKey, defaultContent } from '@/lib/defaultContent'
import { Eye, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Item = {
	key: ContentKey
	value: string
}

const sections = {
	Hero: ['hero_title', 'hero_subtitle'],
	About: ['about_text'],
	CTA: ['cta_text'],
} as const

const labelMap: Record<ContentKey, string> = {
	hero_title: 'Hero Title',
	hero_subtitle: 'Hero Subtitle',
	about_text: 'About Text',
	cta_text: 'CTA Text',
}

// PREVIEW
function Preview({ data }: { data: Item[] }) {
	const get = (key: ContentKey) => data.find(i => i.key === key)?.value || ''

	return (
		<div className='p-6 space-y-4 border rounded-xl bg-white w-full'>
			<h1 className='text-2xl font-bold'>{get('hero_title')}</h1>
			<p className='text-gray-600'>{get('hero_subtitle')}</p>
			<p>{get('about_text')}</p>
			<button className='bg-black text-white px-4 py-2 rounded'>
				{get('cta_text')}
			</button>
		</div>
	)
}

export default function AdminPage() {
	const [data, setData] = useState<Item[]>([])
	const [password, setPassword] = useState('')
	const [isAuthed, setIsAuthed] = useState(false)
	const [loading, setLoading] = useState(false)
	const [mounted, setMounted] = useState(false)

	const [editingKey, setEditingKey] = useState<ContentKey | null>(null)
	const [draftValue, setDraftValue] = useState('')

	const [mode, setMode] = useState<'edit' | 'preview'>('edit')

	useEffect(() => {
		setMounted(true)

		const auth = localStorage.getItem('admin-auth')
		const pass = localStorage.getItem('admin-password')

		if (auth === 'true' && pass) {
			setIsAuthed(true)
		}

		fetch('/api/get-content')
			.then(res => res.json())
			.then(setData)
	}, [])

	// 🔥 OUTSIDE CLICK (без ref!)
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			const target = e.target as HTMLElement

			if (target.closest('[data-action="true"]')) return
			if (target.closest('[data-editing="true"]')) return
			if (!editingKey) return

			setEditingKey(null)
		}

		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [editingKey])

	const updateValue = (key: ContentKey, value: string) => {
		setData(prev =>
			prev.map(item => (item.key === key ? { ...item, value } : item)),
		)
	}

	const save = async (item: Item) => {
		setLoading(true)

		try {
			const pass = localStorage.getItem('admin-password')

			const res = await fetch('/api/content', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-admin-password': pass!,
				},
				body: JSON.stringify(item),
			})

			if (!res.ok) throw new Error()

			toast.success('Saved')
			setEditingKey(null)
		} catch {
			toast.error('Error')
		} finally {
			setLoading(false)
		}
	}

	const reset = async (key: ContentKey) => {
		const val = defaultContent[key]
		const pass = localStorage.getItem('admin-password')

		updateValue(key, val)

		await fetch('/api/content', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-password': pass!,
			},
			body: JSON.stringify({ key, value: val }),
		})

		toast.success('Reset')
		setEditingKey(null)
	}

	const login = async () => {
		const res = await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({ password }),
		})

		if (!res.ok) return toast.error('Wrong password')

		localStorage.setItem('admin-auth', 'true')
		localStorage.setItem('admin-password', password)

		setIsAuthed(true)
	}

	if (!mounted) return null

	if (!isAuthed) {
		return (
			<main className='min-h-screen flex items-center justify-center p-6'>
				<div className='w-full max-w-sm space-y-4'>
					<h1 className='text-xl font-semibold text-center'>Admin</h1>

					<input
						className='border p-3 rounded-xl w-full'
						placeholder='Password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && login()}
					/>

					<button
						onClick={login}
						className='w-full bg-black text-white py-3 rounded-xl active:scale-95'
					>
						Enter
					</button>
				</div>
			</main>
		)
	}

	return (
		<main className='min-h-screen p-6 max-w-6xl mx-auto space-y-6'>
			<h1 className='text-2xl font-semibold'>Editor</h1>

			{/* MOBILE TOGGLE */}
			<div className='flex md:hidden gap-2 bg-gray-100 p-1 rounded-lg w-fit'>
				<button
					onClick={() => setMode('edit')}
					className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm active:scale-95 ${
						mode === 'edit' ? 'bg-white shadow' : ''
					}`}
				>
					<Pencil size={14} /> Edit
				</button>

				<button
					onClick={() => setMode('preview')}
					className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm active:scale-95 ${
						mode === 'preview' ? 'bg-white shadow' : ''
					}`}
				>
					<Eye size={14} /> Preview
				</button>
			</div>

			<div className='grid md:grid-cols-2 gap-8 items-start'>
				{/* PREVIEW */}
				<div className='hidden md:block'>
					<Preview data={data} />
				</div>

				{/* EDITOR */}
				{(mode === 'edit' ||
					(typeof window !== 'undefined' && window.innerWidth >= 768)) && (
					<div className='space-y-6 w-full min-w-0'>
						{Object.entries(sections).map(([section, keys]) => (
							<div key={section} className='space-y-3'>
								<h2 className='text-xs uppercase text-gray-400'>{section}</h2>

								{keys.map(key => {
									const item = data.find(i => i.key === (key as ContentKey))
									if (!item) return null

									const editing = editingKey === item.key

									return (
										<div
											key={item.key}
											data-editing={editing}
											className='border rounded-xl p-4 space-y-2 w-full min-w-0 box-border'
										>
											<div className='text-xs text-gray-400'>
												{labelMap[item.key]}
											</div>

											{!editing ? (
												<div
													onClick={() => {
														setEditingKey(item.key)
														setDraftValue(item.value)
													}}
													className='cursor-pointer hover:bg-gray-100 p-2 rounded w-full break-words'
												>
													{item.value}
												</div>
											) : (
												<textarea
													autoFocus
													className='block w-full min-w-0 resize-none border p-3 rounded whitespace-pre-wrap break-words'
													value={draftValue}
													onChange={e => setDraftValue(e.target.value)}
												/>
											)}

											<div className='flex gap-3 text-sm'>
												{!editing ? (
													<button
														onClick={() => {
															setEditingKey(item.key)
															setDraftValue(item.value)
														}}
														data-action='true'
													>
														Edit
													</button>
												) : (
													<button
														onClick={() => {
															updateValue(item.key, draftValue)
															save({ ...item, value: draftValue })
														}}
														data-action='true'
													>
														{loading ? 'Saving...' : 'Save'}
													</button>
												)}

												<button
													onClick={() => reset(item.key)}
													data-action='true'
													className='text-gray-400'
												>
													Reset
												</button>
											</div>
										</div>
									)
								})}
							</div>
						))}
					</div>
				)}

				{/* MOBILE PREVIEW */}
				{mode === 'preview' && (
					<div className='md:hidden'>
						<Preview data={data} />
					</div>
				)}
			</div>
		</main>
	)
}
