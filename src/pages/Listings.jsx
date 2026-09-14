import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getListings } from '../api/listings'
import FilterBar from '../components/FilterBar'
import PropertyCard from '../components/PropertyCard'
import Pagination from '../components/Pagination'
import { LISTING_SORT_OPTIONS, sortListings } from '../utils/sort'

const LIMIT = 50

export default function Listings() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => {
    const locality = searchParams.get('locality')
    return locality ? { locality } : {}
  })
  const [offset, setOffset] = useState(0)
  const [sortKey, setSortKey] = useState('newest')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getListings({ ...filters, offset, limit: LIMIT })
      setData(res)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not load listings right now.')
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

  const results = data ? sortListings(data.results, sortKey) : []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ivy-950">Properties for sale</h1>
        <p className="text-sm text-ivy-600 font-body mt-1">
          {data ? `${data.total?.toLocaleString('en-IN') ?? '—'} listings in this city` : 'Loading…'}
        </p>
      </div>

      <FilterBar
        variant="listings"
        values={filters}
        onApply={applyFilters}
        sortOptions={LISTING_SORT_OPTIONS}
        sortValue={sortKey}
        onSortChange={setSortKey}
      />

      {error && (
        <div className="border border-clay text-clay text-sm font-body px-3 py-2 mt-6">{error}</div>
      )}

      {loading && (
        <div className="py-20 text-center text-ivy-500 font-body text-sm">Loading listings…</div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="py-20 text-center text-ivy-500 font-body text-sm">
          No listings match these filters. Try widening your search.
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {results.map((item) => (
              <PropertyCard key={item.listing_id} item={item} type="sale" />
            ))}
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
