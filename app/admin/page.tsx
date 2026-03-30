'use client'

import { useEffect, useState } from 'react'

type Item = {
	key: string
	value: string
}

export default function AdminPage() {
	const [data, setData] = useState<Item[]>([])
	const [password, setPassword] = useState('')

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
		await fetch('/api/content', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-password': password,
			},
			body: JSON.stringify(item),
		})

		alert('Saved ✅')
	}

	return (
		<main className='p-6 max-w-2xl mx-auto space-y-6'>
			<h1 className='text-2xl font-bold'>Admin Panel</h1>

			<input
				placeholder='Admin password'
				className='border p-2 w-full'
				value={password}
				onChange={e => setPassword(e.target.value)}
			/>

			{data.map((item, i) => (
				<div key={item.key} className='border rounded-xl p-4 space-y-2'>
					<div className='text-sm text-gray-500'>{item.key}</div>

					<textarea
						className='w-full border p-2 rounded'
						value={item.value}
						onChange={e => updateValue(i, e.target.value)}
					/>

					<button
						onClick={() => save(item)}
						className='bg-black text-white px-4 py-2 rounded'
					>
						Save
					</button>
				</div>
			))}
		</main>
	)
}
