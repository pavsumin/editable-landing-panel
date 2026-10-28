export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="w-full max-w-6xl mx-auto px-6 py-20 min-h-[70vh]"
    >
      <span className="sr-only">Loading page…</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="h-12 rounded-lg bg-muted w-2/3 max-w-xl" />
        <div className="h-5 rounded bg-muted max-w-lg" />
        <div className="h-5 rounded bg-muted max-w-sm" />
      </div>
    </div>
  )
}
