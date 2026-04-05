'use client'

import { ContentKey, defaultContent } from '@/lib/defaultContent'
import imageCompression from 'browser-image-compression'
import { Eye, Moon, Pencil, Sun } from 'lucide-react'
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

const imageKeys: ContentKey[] = ['hero_image_light', 'hero_image_dark']

const isImageKey = (key: ContentKey) => imageKeys.includes(key)

export const sections = {
	Hero: [
		'hero_title',
		'hero_subtitle',
		'hero_cta_primary',
		'hero_cta_secondary',
		'hero_image_light',
		'hero_image_dark',
	],
	Problem: [
		'problem_title',
		'problem_1_title',
		'problem_1_text',
		'problem_2_title',
		'problem_2_text',
		'problem_3_title',
		'problem_3_text',
	],
	Solution: [
		'solution_title',
		'solution_text',
		'solution_dev_label',
		'solution_dev_title',
		'solution_edit_label',
		'solution_client_label',
		'solution_client_title',
		'solution_logic_label',
		'solution_content_label',
	],
	'How it works': [
		'how_title',
		'how_1_title',
		'how_1_text',
		'how_2_title',
		'how_2_text',
		'how_3_title',
		'how_3_text',
	],
	Flow: [
		'flow_badge',
		'flow_title',
		'flow_subtitle',
		'flow_1_label',
		'flow_1_title',
		'flow_1_desc',
		'flow_2_label',
		'flow_2_title',
		'flow_2_desc',
		'flow_3_label',
		'flow_3_title',
		'flow_3_desc',
		'flow_4_label',
		'flow_4_title',
		'flow_4_desc',
	],
	Features: [
		'features_title',
		'feature_1',
		'feature_2',
		'feature_3',
		'feature_4',
		'feature_5',
		'feature_6',
	],
	Final: ['final_title', 'final_subtitle', 'final_cta'],
} as const

export const labelMap: Record<ContentKey, string> = {
	hero_title: 'Hero Title',
	hero_subtitle: 'Hero Subtitle',
	hero_cta_primary: 'Primary CTA (GitHub)',
	hero_cta_secondary: 'Secondary CTA (Docs)',
	hero_image_light: 'Hero Image (Light Theme)',
	hero_image_dark: 'Hero Image (Dark Theme)',

	problem_title: 'Problem Title',
	problem_1_title: 'Problem 1 Title',
	problem_1_text: 'Problem 1 Text',
	problem_2_title: 'Problem 2 Title',
	problem_2_text: 'Problem 2 Text',
	problem_3_title: 'Problem 3 Title',
	problem_3_text: 'Problem 3 Text',

	solution_title: 'Solution Title',
	solution_text: 'Solution Text',
	solution_dev_label: 'Solution Dev Label',
	solution_dev_title: 'Solution Dev Title',
	solution_edit_label: 'Solution Edit Label',
	solution_client_label: 'Solution Client Label',
	solution_client_title: 'Solution Client Title',
	solution_logic_label: 'Solution Logic Label',
	solution_content_label: 'Solution Content Label',

	how_title: 'How It Works Title',
	how_1_title: 'Step 1 Title',
	how_1_text: 'Step 1 Text',
	how_2_title: 'Step 2 Title',
	how_2_text: 'Step 2 Text',
	how_3_title: 'Step 3 Title',
	how_3_text: 'Step 3 Text',

	flow_badge: 'Flow Badge',
	flow_title: 'Content Flow Title',
	flow_subtitle: 'Content Flow Subtitle',
	flow_1_label: 'Flow 1 Label',
	flow_1_title: 'Flow 1 Title',
	flow_1_desc: 'Flow 1 Description',
	flow_2_label: 'Flow 2 Label',
	flow_2_title: 'Flow 2 Title',
	flow_2_desc: 'Flow 2 Description',
	flow_3_label: 'Flow 3 Label',
	flow_3_title: 'Flow 3 Title',
	flow_3_desc: 'Flow 3 Description',
	flow_4_label: 'Flow 4 Label',
	flow_4_title: 'Flow 4 Title',
	flow_4_desc: 'Flow 4 Description',

	features_title: 'Features Title',
	feature_1: 'Feature 1',
	feature_2: 'Feature 2',
	feature_3: 'Feature 3',
	feature_4: 'Feature 4',
	feature_5: 'Feature 5',
	feature_6: 'Feature 6',

	final_title: 'Final Title',
	final_subtitle: 'Final Subtitle',
	final_cta: 'Final Button Text',
}

export default function AdminPage() {
	const [data, setData] = useState<Item[]>([])
	const [password, setPassword] = useState('')
	const [isAuthed, setIsAuthed] = useState(false)
	const [loading, setLoading] = useState(false)
	const [mounted, setMounted] = useState(false)

	const [imageModalOpen, setImageModalOpen] = useState(false)
	const [imageKey, setImageKey] = useState<ContentKey | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [imageFile, setImageFile] = useState<File | null>(null)

	const [previewModalOpen, setPreviewModalOpen] = useState(false)
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const [previewKey, setPreviewKey] = useState<ContentKey | null>(null)

	const [showDialog, setShowDialog] = useState(false)
	const [pendingKey, setPendingKey] = useState<ContentKey | null>(null)

	const [editingKey, setEditingKey] = useState<ContentKey | null>(null)
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const [draftValue, setDraftValue] = useState('')

	const iframeRef = useRef<HTMLIFrameElement | null>(null)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const [mode, setMode] = useState<'edit' | 'preview'>('edit')

	const [isDark, setIsDark] = useState(() => {
		if (typeof window === 'undefined') return false
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark)
	}, [isDark])

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

	// IMAGE UPLOAD

	const uploadAndSaveImage = async (file: File, key: ContentKey) => {
		const compressed = await imageCompression(file, {
			maxSizeMB: 0.4,
			maxWidthOrHeight: 1600,
			fileType: 'image/webp',
			useWebWorker: true,
		})

		const formData = new FormData()
		formData.append('file', compressed)

		const res = await fetch('/api/upload', {
			method: 'POST',
			headers: {
				'x-admin-password': localStorage.getItem('admin-password')!,
			},
			body: formData,
		})

		const { url } = await res.json()

		await save(key, url)
	}

	const handleImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
		key: ContentKey,
	) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			await uploadAndSaveImage(file, key)
			toast.success('Image updated')
		} catch {
			toast.error('Upload failed')
		}
	}

	const openImageModal = (key: ContentKey, current: string) => {
		setImageKey(key)
		setImagePreview(current)
		setImageModalOpen(true)
	}

	const uploadImage = async () => {
		if (!imageFile || !imageKey) return

		try {
			await uploadAndSaveImage(imageFile, imageKey)

			setImageModalOpen(false)
			setImageFile(null)
			setImagePreview(null)
			setImageKey(null)

			toast.success('Image saved')
		} catch {
			toast.error('Upload failed')
		}
	}

	const handleFile = async (file: File) => {
		setImageFile(file)
		setImagePreview(URL.createObjectURL(file))
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		const file = e.dataTransfer.files[0]
		if (file) handleFile(file)
	}

	const openPreviewModal = (key: ContentKey, url: string) => {
		setPreviewKey(key)
		setPreviewImage(url)
		setPreviewModalOpen(true)
	}

	const reset = async (key: ContentKey) => {
		const pass = localStorage.getItem('admin-password')

		try {
			const res = await fetch('/api/content/reset', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-admin-password': pass!,
				},
				body: JSON.stringify({ key }),
			})

			if (res.status === 401) {
				localStorage.removeItem('admin-auth')
				localStorage.removeItem('admin-password')
				setIsAuthed(false)

				toast.error('Session expired. Login again')
				return
			}

			if (!res.ok) {
				const txt = await res.text()
				throw new Error()
			}

			const val = defaultContent[key]

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
			<div className='max-w-6xl mx-auto flex items-center justify-between'>
				<h1 className='text-2xl font-semibold md:mt-2 md:mb-8'>Editor</h1>

				<button
					onClick={() => setIsDark(prev => !prev)}
					className='p-2 rounded-lg border border-border hover:bg-muted transition duration-300 cursor-pointer'
					aria-label='Toggle theme'
				>
					<Moon className='hidden dark:block h-5 w-5 text-blue-400' />
					<Sun className='block dark:hidden h-5 w-5 text-yellow-500' />
				</button>
			</div>

			{/* MOBILE TOGGLE */}
			<div className='flex md:hidden gap-2 bg-gray-100 dark:bg-zinc-900 p-2 p-1 rounded-lg w-fit'>
				<button
					onClick={() => setMode('edit')}
					className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm active:scale-95 ${
						mode === 'edit' ? 'bg-white dark:bg-background shadow' : ''
					}`}
				>
					<Pencil size={14} /> Edit
				</button>

				<button
					onClick={() => setMode('preview')}
					className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm active:scale-95 ${
						mode === 'preview' ? 'bg-white dark:bg-background shadow' : ''
					}`}
				>
					<Eye size={14} /> Preview
				</button>
			</div>

			<div className='grid md:grid-cols-2 gap-8 items-start'>
				{/* PREVIEW */}
				<div className='hidden md:block'>
					<div className='relative w-full h-[80vh] border rounded-xl overflow-hidden hover:shadow-xl/5 duration-200 transition'>
						{/* IFRAME */}
						<iframe
							ref={iframeRef}
							src='/?preview=true'
							className='w-full h-full border-0'
						/>

						{/* OVERLAY */}
						<div
							className='absolute inset-0 z-10 bg-transparent pointer-events-none'
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

											{isImageKey(item.key) ? (
												<div className='space-y-3'>
													{item.value && (
														<img
															src={item.value}
															className='rounded-lg border max-h-40 object-contain cursor-pointer'
															onClick={() =>
																openPreviewModal(item.key, item.value)
															}
														/>
													)}
												</div>
											) : !editing ? (
												<div
													onClick={() => {
														setEditingKey(item.key)
														setDraftValue(item.value)
													}}
													className='cursor-pointer bg-gray-100 dark:bg-zinc-900 p-2 rounded-[8px] w-full break-words'
												>
													{item.value}
												</div>
											) : (
												<textarea
													ref={textareaRef}
													autoFocus
													className='block max-w-full w-full min-w-0 resize-none border p-3 rounded whitespace-pre-wrap break-words outline-none'
													value={draftValue}
													onChange={e => setDraftValue(e.target.value)}
												/>
											)}

											<div className='flex gap-3 text-sm'>
												{!editing ? (
													<button
														onClick={() => {
															if (isImageKey(item.key)) {
																openImageModal(item.key, item.value)
															} else {
																setEditingKey(item.key)
																setDraftValue(item.value)
															}
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
								className='w-full h-full border-0'
							/>

							{/* OVERLAY */}
							<div
								className='absolute inset-0 z-10 bg-transparent pointer-events-none'
								onClick={e => e.preventDefault()}
							/>
						</div>
					</div>
				)}
			</div>

			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent aria-describedby='image-upload-desc'>
					<DialogHeader>
						<DialogTitle>Unsaved changes</DialogTitle>
					</DialogHeader>

					<p id='image-upload-desc' className='sr-only'>
						Upload and preview image
					</p>

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

			{imageModalOpen && (
				<Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
					<DialogContent aria-describedby='image-upload-desc'>
						<DialogHeader>
							<DialogTitle>Upload image</DialogTitle>
						</DialogHeader>

						<p id='image-upload-desc' className='sr-only'>
							Upload and preview image
						</p>

						<div
							onDrop={handleDrop}
							onDragOver={e => e.preventDefault()}
							onClick={() => fileInputRef.current?.click()}
							className='border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted transition'
						>
							{imagePreview ? (
								<>
									<img
										src={imagePreview}
										className='mx-auto max-h-60 object-contain'
									/>
									<div className='space-y-2 mt-8'>
										<p className='text-sm font-medium'>Drop image here</p>
										<p className='text-xs text-muted-foreground'>
											or click to upload
										</p>
									</div>
								</>
							) : (
								<div className='space-y-2'>
									<p className='text-sm font-medium'>Drop image here</p>
									<p className='text-xs text-muted-foreground'>
										or click to upload
									</p>
								</div>
							)}
						</div>

						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							className='hidden'
							onChange={e => {
								const file = e.target.files?.[0]
								if (file) handleFile(file)
							}}
						/>

						<DialogFooter className='flex gap-2'>
							<button
								onClick={() => setImageModalOpen(false)}
								className='px-4 py-2 border rounded'
							>
								Cancel
							</button>

							<button
								onClick={uploadImage}
								className='px-4 py-2 bg-black text-white rounded'
							>
								Save
							</button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			<Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
				<DialogContent aria-describedby='image-upload-desc'>
					<DialogHeader>
						<DialogTitle>Image preview</DialogTitle>
					</DialogHeader>

					<p id='image-upload-desc' className='sr-only'>
						Upload and preview image
					</p>

					{previewImage && (
						<img
							src={previewImage}
							className='w-full max-h-[400px] object-contain rounded-lg border'
						/>
					)}

					<DialogFooter className='flex gap-2'>
						<button
							onClick={() => setPreviewModalOpen(false)}
							className='px-4 py-2 border rounded'
						>
							Close
						</button>

						<button
							onClick={() => {
								setPreviewModalOpen(false)
								openImageModal(previewKey!, previewImage!)
							}}
							className='px-4 py-2 bg-black text-white rounded'
						>
							Upload new image
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	)
}
