import { useState, useEffect } from 'react'

const FURNISHING_OPTIONS = ['unfurnished', 'semi-furnished', 'fully-furnished']
const PROPERTY_TYPES = ['apartment', 'villa', 'independent house', 'plot', 'studio']
const PROJECT_STATUSES = ['under construction', 'ready to move', 'new launch']

export default function FilterBar({ variant, values, onApply, sortOptions, sortValue, onSortChange }) {
  const [draft, setDraft] = useState(values)

  useEffect(() => setDraft(values), [values])

  function update(field, value) {
    setDraft((d) => ({ ...d, [field]: value || undefined }))
  }

  function submit(e) {
    e.preventDefault()
    onApply(draft)
  }

  function reset() {
    setDraft({})
    onApply({})
  }

  const inputCls =
    'w-full border hairline bg-white/60 px-3 py-2 text-sm font-body text-ivy-950 focus:border-ivy-600 outline-none'
  const labelCls = 'block text-xs font-body text-ivy-600 mb-1'

  return (
    <form onSubmit={submit} className="border hairline bg-paper-dim p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div>
          <label className={labelCls}>Locality</label>
          <input
            className={inputCls}
            placeholder="e.g. Kharadi"
            value={draft.locality ?? ''}
            onChange={(e) => update('locality', e.target.value)}
          />
        </div>

        {(variant === 'listings' || variant === 'rentals') && (
          <div>
            <label className={labelCls}>BHK</label>
            <select className={inputCls} value={draft.bhk ?? ''} onChange={(e) => update('bhk', e.target.value)}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} BHK
                </option>
              ))}
            </select>
          </div>
        )}

        {variant === 'listings' && (
          <div>
            <label className={labelCls}>Property type</label>
            <select
              className={inputCls}
              value={draft.property_type ?? ''}
              onChange={(e) => update('property_type', e.target.value)}
            >
              <option value="">Any</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {(variant === 'listings' || variant === 'rentals') && (
          <div>
            <label className={labelCls}>Furnishing</label>
            <select
              className={inputCls}
              value={draft.furnishing ?? ''}
              onChange={(e) => update('furnishing', e.target.value)}
            >
              <option value="">Any</option>
              {FURNISHING_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        {variant === 'listings' && (
          <>
            <div>
              <label className={labelCls}>Min price (₹)</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={draft.min_price ?? ''}
                onChange={(e) => update('min_price', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Max price (₹)</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={draft.max_price ?? ''}
                onChange={(e) => update('max_price', e.target.value)}
              />
            </div>
          </>
        )}

        {variant === 'projects' && (
          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={draft.project_status ?? ''}
              onChange={(e) => update('project_status', e.target.value)}
            >
              <option value="">Any</option>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelCls}>Sort by</label>
          <select className={inputCls} value={sortValue} onChange={(e) => onSortChange(e.target.value)}>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button type="submit" className="px-4 py-2 text-sm font-body bg-ivy-900 text-paper hover:bg-ivy-800 transition-colors">
          Apply filters
        </button>
        <button type="button" onClick={reset} className="px-4 py-2 text-sm font-body text-ivy-700 hover:text-ivy-950">
          Clear
        </button>
      </div>
    </form>
  )
}
