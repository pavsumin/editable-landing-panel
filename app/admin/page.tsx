'use client'

import { ContentKey, defaultContent } from '@/lib/defaultContent'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Item = {
	key: ContentKey
	value: string
}

export default function AdminPage() {
	const [data, setData] = useState<Item[]>([])
	const [password, setPassword] = useState('')
	const [isAuthed, setIsAuthed] = useState(false)
	const [loading, setLoading] = useState(false)
	const [mounted, setMounted] = useState(false)

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

	const updateValue = (index: number, newValue: string) => {
		const updated = [...data]
		updated[index].value = newValue
		setData(updated)
	}

	const save = async (item: Item) => {
		setLoading(true)

		try {
			const savedPassword = localStorage.getItem('admin-password')

			if (!savedPassword) {
				localStorage.removeItem('admin-auth')
				setIsAuthed(false)
				toast.error('Session expired, login again')
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
				localStorage.removeItem('admin-auth')
				localStorage.removeItem('admin-password')
				setIsAuthed(false)

				toast.error('Wrong password, login again')
				return
			}

			toast.success('Saved')
		} catch (err) {
			toast.error('Error')
		} finally {
			setLoading(false)
		}
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

		setData(prev =>
			prev.map(item =>
				item.key === key ? { ...item, value: defaultValue } : item,
			),
		)

		toast.success(`${key} reset`)
	}

	if (!mounted) return null

	// LOGIN
	if (!isAuthed) {
		return (
			<main className='p-6 max-w-md mx-auto space-y-4'>
				<h1 className='text-xl font-bold'>Admin Login</h1>

				<input
					placeholder='Password'
					className='border p-2 w-full'
					value={password}
					onChange={e => setPassword(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter') login()
					}}
				/>

				<button
					onClick={login}
					className='cursor-pointer bg-black text-white px-4 py-2 rounded active:scale-95 transition-all duration-200'
				>
					Enter
				</button>
			</main>
		)
	}

	// PANEL
	return (
		<main className='p-6 max-w-2xl mx-auto space-y-6'>
			<h1 className='text-2xl font-bold'>Admin Panel</h1>

			{data.map((item, i) => (
				<div key={item.key} className='border rounded-xl p-4 space-y-2'>
					<div className='text-sm text-gray-500'>{item.key}</div>

					<textarea
						className='w-full border p-2 rounded'
						value={item.value}
						onChange={e => updateValue(i, e.target.value)}
					/>

					<button
						disabled={loading}
						onClick={() => save(item)}
						className='cursor-pointer bg-black text-white px-4 py-2 rounded active:scale-95 transition-all duration-200'
					>
						{loading ? 'Saving...' : 'Save'}
					</button>

					<button
						onClick={() => reset(item.key)}
						className='ml-5 cursor-pointer text-sm text-gray-500 underline active:scale-95 transition-all duration-200'
					>
						Reset to default
					</button>
				</div>
			))}
		</main>
	)
}
