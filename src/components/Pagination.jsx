export default function Pagination({ offset, limit, count, hasMore, onPrev, onNext }) {
  const start = count === 0 ? 0 : offset + 1
  const end = offset + count

  return (
    <div className="flex items-center justify-between border-t hairline pt-4 mt-6">
      <p className="text-sm text-ivy-600 font-body num">
        Showing {start}–{end}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={offset === 0}
          className="px-3 py-1.5 text-sm font-body border hairline text-ivy-800 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-ivy-100 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasMore}
          className="px-3 py-1.5 text-sm font-body border hairline text-ivy-800 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-ivy-100 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
