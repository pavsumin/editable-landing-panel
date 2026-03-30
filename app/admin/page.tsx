'use client'

import { ContentKey, defaultContent } from '@/lib/defaultContent'
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

export default function AdminPage() {
	const [data, setData] = useState<Item[]>([])
	const [password, setPassword] = useState('')
	const [isAuthed, setIsAuthed] = useState(false)
	const [loading, setLoading] = useState(false)
	const [mounted, setMounted] = useState(false)

	const [editingKey, setEditingKey] = useState<ContentKey | null>(null)

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

	const updateValue = (key: ContentKey, newValue: string) => {
		setData(prev =>
			prev.map(item =>
				item.key === key ? { ...item, value: newValue } : item,
			),
		)
	}

	const save = async (item: Item) => {
		setLoading(true)

		try {
			const savedPassword = localStorage.getItem('admin-password')

			if (!savedPassword) {
				localStorage.clear()
				setIsAuthed(false)
				toast.error('Session expired')
				return
			}

			const res = await fetch('/api/content', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-admin-password': savedPassword,
				},
				body: JSON.stringify(item),
			})

			if (!res.ok) {
				localStorage.clear()
				setIsAuthed(false)
				toast.error('Wrong password')
				return
			}

			toast.success('Saved')
			setEditingKey(null)
		} catch {
			toast.error('Error')
		} finally {
			setLoading(false)
		}
	}

	const reset = async (key: ContentKey) => {
		const defaultValue = defaultContent[key]
		const savedPassword = localStorage.getItem('admin-password')

		await fetch('/api/content', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-password': savedPassword!,
			},
			body: JSON.stringify({ key, value: defaultValue }),
		})

		updateValue(key, defaultValue)
		toast.success(`${labelMap[key]} reset`)
	}

	const login = async () => {
		const res = await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({ password }),
		})

		if (!res.ok) {
			toast.error('Wrong password')
			return
		}

		localStorage.setItem('admin-auth', 'true')
		localStorage.setItem('admin-password', password)
		setIsAuthed(true)
		toast.success('Welcome')
	}

	if (!mounted) return null

	// LOGIN
	if (!isAuthed) {
		return (
			<main className='min-h-screen flex items-center justify-center p-6'>
				<div className='w-full max-w-sm space-y-4'>
					<h1 className='text-2xl font-semibold text-center'>Admin</h1>

					<input
						placeholder='Password'
						className='border rounded-lg p-3 w-full'
						value={password}
						onChange={e => setPassword(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && login()}
					/>

					<button
						onClick={login}
						className='w-full bg-black text-white py-3 rounded-lg active:scale-95 transition'
					>
						Enter
					</button>
				</div>
			</main>
		)
	}

	// PANEL
	return (
		<main className='min-h-screen p-6 max-w-3xl mx-auto space-y-10'>
			<h1 className='text-3xl font-semibold'>Editor</h1>

			{Object.entries(sections).map(([section, keys]) => (
				<div key={section} className='space-y-4'>
					<h2 className='text-sm uppercase text-gray-400 tracking-wide'>
						{section}
					</h2>

					{keys.map(key => {
						const item = data.find(i => i.key === (key as ContentKey))
						if (!item) return null

						const isEditing = editingKey === item.key

						return (
							<div
								key={item.key}
								className='w-full max-w-3xl mx-auto border rounded-xl p-4 space-y-3'
							>
								<div className='text-xs text-gray-400'>
									{labelMap[item.key]}
								</div>

								{!isEditing ? (
									<div
										onClick={() => setEditingKey(item.key)}
										className='cursor-pointer text-lg hover:bg-gray-100 p-2 rounded-md transition'
									>
										{item.value || 'Click to edit'}
									</div>
								) : (
									<textarea
										autoFocus
										className='w-full max-w-full min-w-0 resize-none border p-3 rounded-md outline-none focus:ring-2 focus:ring-black transition box-border'
										value={item.value}
										onChange={e => updateValue(item.key, e.target.value)}
									/>
								)}

								<div className='flex gap-3 text-sm'>
									{!isEditing ? (
										<button
											onClick={() => setEditingKey(item.key)}
											className='cursor-pointer underline'
										>
											Edit
										</button>
									) : (
										<button
											onClick={() => save(item)}
											className='cursor-pointer text-black underline'
										>
											{loading ? 'Saving...' : 'Save'}
										</button>
									)}

									<button
										onClick={() => reset(item.key)}
										className='cursor-pointer text-gray-400 underline'
									>
										Reset
									</button>
								</div>
							</div>
						)
					})}
				</div>
			))}
		</main>
	)
}
