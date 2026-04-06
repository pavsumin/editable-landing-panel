'use client'

import DemoPreview from '@/components/demo/DemoPreview'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Eye, Pencil, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type DemoData = {
	hero_title: string
	hero_subtitle: string
	hero_image: string
	hero_btn: string
}

const defaultData: DemoData = {
	hero_title: 'Build fast. Edit instantly.',
	hero_subtitle: 'No CMS. No pain. Just edit your content live.',
	hero_image: 'https://placehold.co/600x400',
	hero_btn: 'Get started',
}

export default function DemoPage() {
	const [data, setData] = useState<DemoData>(defaultData)

	const [editingKey, setEditingKey] = useState<keyof DemoData | null>(null)
	const [draftValue, setDraftValue] = useState('')
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)

	const [mode, setMode] = useState<'edit' | 'preview'>('edit')
	const [isDark, setIsDark] = useState(false)

	// image modal
	const [imageModalOpen, setImageModalOpen] = useState(false)
	const [previewModalOpen, setPreviewModalOpen] = useState(false)

	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [previewImage, setPreviewImage] = useState<string | null>(null)

	const fileInputRef = useRef<HTMLInputElement | null>(null)

	// theme
	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark)
	}, [isDark])

	// focus
	useEffect(() => {
		if (editingKey && textareaRef.current) {
			const el = textareaRef.current
			el.focus()
			el.setSelectionRange(el.value.length, el.value.length)
		}
	}, [editingKey])

	// debounce
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	const updateValue = (key: keyof DemoData, value: string) => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)

		timeoutRef.current = setTimeout(() => {
			setData(prev => ({ ...prev, [key]: value }))
		}, 100)
	}

	// outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			const target = e.target as HTMLElement

			if (target.closest('[data-action="true"]')) return
			if (target.closest('[data-editing="true"]')) return
			if (!editingKey) return

			updateValue(editingKey, draftValue)
			setEditingKey(null)
			setDraftValue('')
		}

		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [editingKey, draftValue])

	const reset = (key: keyof DemoData) => {
		setData(prev => ({ ...prev, [key]: defaultData[key] }))
	}

	// IMAGE LOGIC

	const openImageModal = (current: string) => {
		setImagePreview(current)
		setImageModalOpen(true)
	}

	const openPreviewModal = (url: string) => {
		setPreviewImage(url)
		setPreviewModalOpen(true)
	}

	const handleFile = (file: File) => {
		setImageFile(file)
		setImagePreview(URL.createObjectURL(file))
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		const file = e.dataTransfer.files[0]
		if (file) handleFile(file)
	}

	const uploadImage = () => {
		if (!imageFile) return

		const url = URL.createObjectURL(imageFile)

		setData(prev => ({
			...prev,
			hero_image: url,
		}))

		setImageModalOpen(false)
		setImageFile(null)
		setImagePreview(null)
	}

	return (
		<main className='min-h-screen p-6 max-w-6xl mx-auto w-full space-y-6'>
			{/* MOBILE TOGGLE */}
			<div className='flex md:hidden gap-2 bg-gray-100 dark:bg-zinc-900 p-2 rounded-lg w-fit'>
				<button
					onClick={() => setMode('edit')}
					className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
						mode === 'edit' ? 'bg-white dark:bg-background shadow' : ''
					}`}
				>
					<Pencil size={14} /> Edit
				</button>

				<button
					onClick={() => setMode('preview')}
					className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
						mode === 'preview' ? 'bg-white dark:bg-background shadow' : ''
					}`}
				>
					<Eye size={14} /> Preview
				</button>
			</div>

			<div className='grid md:grid-cols-2 gap-8 items-start'>
				{/* PREVIEW */}
				<div className='hidden md:block sticky top-18'>
					<div className='h-[80vh] border rounded-xl overflow-auto p-6'>
						<DemoPreview content={data} />
					</div>
				</div>

				{/* EDITOR */}
				{(mode === 'edit' ||
					(typeof window !== 'undefined' && window.innerWidth >= 768)) && (
					<div className='space-y-4'>
						{(Object.keys(data) as (keyof DemoData)[]).map(key => {
							const value = data[key]
							const editing = editingKey === key

							return (
								<div
									key={key}
									data-editing={editing}
									className='border rounded-xl p-4 space-y-2'
								>
									<div className='text-xs text-gray-400'>{key}</div>

									{key === 'hero_image' ? (
										<div className='space-y-3'>
											<img
												src={value}
												className='rounded-lg border h-40 object-contain cursor-pointer'
												onClick={() => openPreviewModal(value)}
											/>
										</div>
									) : !editing ? (
										<div
											onClick={() => {
												setEditingKey(key)
												setDraftValue(value)
											}}
											className='cursor-pointer bg-gray-100 dark:bg-zinc-900 p-2 rounded text-[16px]'
										>
											{value}
										</div>
									) : (
										<div className='relative'>
											<textarea
												ref={textareaRef}
												className='w-full border p-3 pr-10 rounded text-[16px]'
												value={draftValue}
												onChange={e => setDraftValue(e.target.value)}
											/>

											{draftValue && (
												<button
													onClick={() => setDraftValue('')}
													className='absolute top-3 right-3'
												>
													<X size={18} />
												</button>
											)}
										</div>
									)}

									{/* ACTIONS */}
									<div className='flex gap-3 text-sm'>
										{!editing ? (
											<button
												onClick={() => {
													if (key === 'hero_image') {
														openImageModal(value)
													} else {
														setEditingKey(key)
														setDraftValue(value)
													}
												}}
												data-action='true'
											>
												Edit
											</button>
										) : (
											<button
												onClick={() => {
													updateValue(key, draftValue)
													setEditingKey(null)
													setDraftValue('')
												}}
												data-action='true'
											>
												Save
											</button>
										)}

										<button
											onClick={() => {
												reset(key)
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
				)}

				{/* MOBILE PREVIEW */}
				{mode === 'preview' && (
					<div className='md:hidden'>
						<div className='h-[80vh] border rounded-xl overflow-auto p-6'>
							<DemoPreview content={data} />
						</div>
					</div>
				)}
			</div>

			{/* IMAGE MODAL */}
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
								className='px-4 py-2 border rounded active:scale-95 cursor-pointer transition duration-200'
							>
								Cancel
							</button>

							<button
								onClick={uploadImage}
								className='px-4 py-2 bg-black text-white rounded active:scale-95 cursor-pointer transition duration-200'
							>
								Save
							</button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
			{/* PREVIEW MODAL */}
			{previewModalOpen && (
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
								className='px-4 py-2 border rounded active:scale-95 cursor-pointer transition duration-200'
							>
								Close
							</button>

							<button
								onClick={() => {
									setPreviewModalOpen(false)
									openImageModal(previewImage!)
								}}
								className='px-4 py-2 bg-black text-white rounded active:scale-95 cursor-pointer transition duration-200'
							>
								Upload new image
							</button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</main>
	)
}
