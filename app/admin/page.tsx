'use client'

import { useEffect, useState } from 'react'

type Item = {
	key: string
	value: string
}

export default function AdminPage() {
	const [data, setData] = useState<Item[]>([])
	const [password, setPassword] = useState('')
	const [isAuthed, setIsAuthed] = useState(false)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
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
			const res = await fetch('/api/content', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-admin-password': password,
				},
				body: JSON.stringify(item),
			})

			if (!res.ok) {
				alert('Wrong password or error ❌')
				return
			}

			alert('Saved ✅')
		} catch (err) {
			alert('Error ❌')
		} finally {
			setLoading(false)
		}
	}

	// LOGIN SCREEN
	if (!isAuthed) {
		return (
			<main className='p-6 max-w-md mx-auto space-y-4'>
				<h1 className='text-xl font-bold'>Admin Login</h1>

				<input
					placeholder='Password'
					className='border p-2 w-full'
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>

				<button
					onClick={() => {
						if (password.length < 1) return alert('Enter password')
						setIsAuthed(true)
					}}
					className='bg-black text-white px-4 py-2 rounded'
				>
					Enter
				</button>
			</main>
		)
	}

	// ADMIN PANEL
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
						className='bg-black text-white px-4 py-2 rounded'
					>
						{loading ? 'Saving...' : 'Save'}
					</button>
				</div>
			))}
		</main>
	)
}
