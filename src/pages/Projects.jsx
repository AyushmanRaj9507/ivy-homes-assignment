import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../api/projects'
import FilterBar from '../components/FilterBar'
import Pagination from '../components/Pagination'
import { PROJECT_SORT_OPTIONS, sortProjects } from '../utils/sort'
import { formatINR, titleCase, formatDate } from '../utils/format'

const LIMIT = 24

export default function Projects() {
  const [filters, setFilters] = useState({})
  const [offset, setOffset] = useState(0)
  const [sortKey, setSortKey] = useState('launch_desc')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getProjects({ ...filters, offset, limit: LIMIT })
      setData(res)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not load projects right now.')
    } finally {
      setLoading(false)
    }
  }, [filters, offset])

  useEffect(() => {
    load()
  }, [load])

  function applyFilters(next) {
    setFilters(next)
    setOffset(0)
  }

  const results = data ? sortProjects(data.results, sortKey) : []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ivy-950">Builder projects</h1>
        <p className="text-sm text-ivy-600 font-body mt-1">
          {data ? `${data.total?.toLocaleString('en-IN') ?? '—'} projects in this city` : 'Loading…'}
        </p>
      </div>

      <FilterBar
        variant="projects"
        values={filters}
        onApply={applyFilters}
        sortOptions={PROJECT_SORT_OPTIONS}
        sortValue={sortKey}
        onSortChange={setSortKey}
      />

      {error && <div className="border border-clay text-clay text-sm font-body px-3 py-2 mt-6">{error}</div>}

      {loading && <div className="py-20 text-center text-ivy-500 font-body text-sm">Loading projects…</div>}

      {!loading && !error && results.length === 0 && (
        <div className="py-20 text-center text-ivy-500 font-body text-sm">
          No projects match these filters. Try widening your search.
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {results.map((p) => {
              const priceInverted = p.price_min != null && p.price_max != null && p.price_min > p.price_max
              return (
                <Link
                  key={p.project_id}
                  to={`/projects/${p.project_id}`}
                  className="border hairline bg-white/40 hover:border-ivy-600 transition-colors p-5 block"
                >
                  <h3 className="font-display text-xl text-ivy-950">{p.apartment_name}</h3>
                  <p className="text-sm text-ivy-600 font-body mt-0.5">
                    {titleCase(p.locality)} · {p.developer_name}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-xl text-ivy-950 num">
                      {formatINR(p.price_min)} – {formatINR(p.price_max)}
                    </span>
                  </div>
                  {priceInverted && (
                    <p className="text-xs text-clay font-body mt-1">
                      Price range reported inverted in source data
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ivy-700 font-body">
                    <span>{titleCase(p.project_status)}</span>
                    {p.total_units && <span>{p.total_units} units</span>}
                    {p.total_towers && <span>{p.total_towers} towers</span>}
                  </div>
                  <p className="text-xs text-ivy-500 font-body mt-4">Launched {formatDate(p.launch_date)}</p>
                </Link>
              )
            })}
          </div>
          <Pagination
            offset={data.offset}
            limit={data.limit}
            count={data.results.length}
            hasMore={data.has_more}
            onPrev={() => setOffset(Math.max(0, offset - LIMIT))}
            onNext={() => setOffset(offset + LIMIT)}
          />
        </>
      )}
    </div>
  )
}
