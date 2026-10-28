'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
const Demo = dynamic(() => import('@/app/demo/page'), { ssr: false })
export default function LazyDemo() {
  const target = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px' },
    )
    if (target.current) observer.observe(target.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={target} className="min-h-[680px]">
      {visible ? (
        <Demo />
      ) : (
        <div
          className="h-[680px]"
          aria-label="Interactive demo loads as you scroll"
        />
      )}
    </div>
  )
}
