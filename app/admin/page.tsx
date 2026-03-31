'use client'

import { ContentKey, defaultContent } from '@/lib/defaultContent'
import { Eye, Pencil } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

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

	const [showDialog, setShowDialog] = useState(false)
	const [pendingKey, setPendingKey] = useState<ContentKey | null>(null)

	const [editingKey, setEditingKey] = useState<ContentKey | null>(null)
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const [draftValue, setDraftValue] = useState('')

	const iframeRef = useRef<HTMLIFrameElement | null>(null)

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

	// OUTSIDE CLICK
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			const target = e.target as HTMLElement

			if (target.closest('[data-action="true"]')) return
			if (target.closest('[data-editing="true"]')) return
			if (!editingKey) return

			const original = data.find(i => i.key === editingKey)?.value

			if (draftValue !== original) {
				setPendingKey(editingKey)
				setShowDialog(true)
			} else {
				setEditingKey(null)
				setDraftValue('')
			}
		}

		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [editingKey, draftValue, data])

	const updateValue = (key: ContentKey, value: string) => {
		setData(prev =>
			prev.map(item => (item.key === key ? { ...item, value } : item)),
		)
	}

	useEffect(() => {
		if (editingKey && textareaRef.current) {
			const el = textareaRef.current
			const length = el.value.length

			el.focus()
			el.setSelectionRange(length, length)
		}
	}, [editingKey])

	const save = async (key: ContentKey, value: string) => {
		setLoading(true)

		try {
			const pass = localStorage.getItem('admin-password')

			const res = await fetch('/api/content', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-admin-password': pass!,
				},
				body: JSON.stringify({ key, value }),
			})

			if (res.status === 401) {
				localStorage.removeItem('admin-auth')
				localStorage.removeItem('admin-password')
				setIsAuthed(false)
				toast.error('Session expired. Login again')
				return
			}

			if (!res.ok) throw new Error()

			updateValue(key, value)

			toast.success('Saved')
			setEditingKey(null)
			setDraftValue('')
			iframeRef.current?.contentWindow?.location.reload()
		} catch {
			toast.error('Error')
		} finally {
			setLoading(false)
		}
	}

	const reset = async (key: ContentKey) => {
		const val = defaultContent[key]
		const pass = localStorage.getItem('admin-password')

		try {
			const res = await fetch('/api/content', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-admin-password': pass!,
				},
				body: JSON.stringify({ key, value: val }),
			})

			if (res.status === 401) {
				localStorage.removeItem('admin-auth')
				localStorage.removeItem('admin-password')
				setIsAuthed(false)

				toast.error('Session expired. Login again')
				return
			}

			if (!res.ok) throw new Error()

			updateValue(key, val)

			toast.success('Reset')
			setEditingKey(null)
			setDraftValue('')

			iframeRef.current?.contentWindow?.location.reload()
		} catch {
			toast.error('Error')
		}
	}

	const login = async () => {
		const res = await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({ password }),
		})

		if (!res.ok) {
			setPassword('')
			return toast.error('Wrong password')
		}

		localStorage.setItem('admin-auth', 'true')
		localStorage.setItem('admin-password', password)

		toast.success('Welcome!')
		setIsAuthed(true)
		setPassword('')
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
		<main className='min-h-screen p-6 max-w-6xl mx-auto w-full space-y-6'>
			<h1 className='text-2xl font-semibold md:text-center md:mt-2 md:mb-8'>
				Editor
			</h1>

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
					<div className='relative w-full h-[80vh] border rounded-xl overflow-hidden hover:shadow-xl/5 transition'>
						{/* IFRAME */}
						<iframe
							ref={iframeRef}
							src='/?preview=true'
							className='w-full h-full border-0 pointer-events-none'
						/>

						{/* OVERLAY */}
						<div
							className='absolute inset-0 z-10 bg-transparent transition'
							onClick={e => e.preventDefault()}
						/>
					</div>
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
													className='cursor-pointer bg-gray-100 p-2 rounded-[8px] w-full break-words'
												>
													{item.value}
												</div>
											) : (
												<textarea
													ref={textareaRef}
													autoFocus
													className='block max-w-full w-full min-w-0 resize-none border p-3 rounded whitespace-pre-wrap break-words'
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
															save(item.key, draftValue)
															setEditingKey(null)
															setDraftValue('')
														}}
														data-action='true'
													>
														{loading ? 'Saving...' : 'Save'}
													</button>
												)}

												<button
													onClick={() => {
														reset(item.key)
														setEditingKey(null)
														setDraftValue('')
													}}
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
						<div className='relative w-full h-[80vh] border rounded-xl overflow-hidden'>
							{/* IFRAME */}
							<iframe
								ref={iframeRef}
								src='/?preview=true'
								className='w-full h-full border-0 pointer-events-none'
							/>

							{/* OVERLAY */}
							<div
								className='absolute inset-0 z-10'
								onClick={e => e.preventDefault()}
							/>
						</div>
					</div>
				)}
			</div>

			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Unsaved changes</DialogTitle>
					</DialogHeader>

					<p className='text-sm text-gray-500'>
						You have unsaved changes. What do you want to do?
					</p>

					<DialogFooter className='flex gap-2'>
						<button
							className='px-4 py-2 border rounded'
							onClick={() => {
								setShowDialog(false)
								setEditingKey(null)
								setDraftValue('')
							}}
						>
							Discard
						</button>

						<button
							className='px-4 py-2 bg-black text-white rounded'
							onClick={async () => {
								const item = data.find(i => i.key === pendingKey)

								if (!item) return

								await save(item.key, draftValue)

								setShowDialog(false)
								setPendingKey(null)
							}}
						>
							Save
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	)
}
