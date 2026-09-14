import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getListings } from '../api/listings'
import { getRentals } from '../api/rentals'
import { getProjects } from '../api/projects'
import { getHealth } from '../api/health'
import { fetchAllPages } from '../utils/paginate'
import { formatINR, formatINRCompact, titleCase } from '../utils/format'
import StatCard from '../components/StatCard'
import {
  findCorruptListings,
  countUniqueProperties,
  countActiveListings,
  totalMonthlyRent,
  avgPricePerSqftLiveTwoBHK,
  listingsInLastNDays,
  costliestProject,
  findSuspiciousListings,
  projectListingCountMismatches
} from '../utils/analytics'

export default function Dashboard() {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [progress, setProgress] = useState({ listings: 0, rentals: 0, projects: 0 })
  const [error, setError] = useState(null)
  const [dataset, setDataset] = useState(null) // { listings, rentals, projects, referenceDate }
  const [locality, setLocality] = useState('')
  const [lastRun, setLastRun] = useState(null)

  const runAnalysis = useCallback(async () => {
    setStatus('loading')
    setError(null)
    setProgress({ listings: 0, rentals: 0, projects: 0 })
    try {
      const [health, listings, rentals, projects] = await Promise.all([
        getHealth().catch(() => null),
        fetchAllPages(getListings, {
          onProgress: ({ loaded }) => setProgress((p) => ({ ...p, listings: loaded }))
        }),
        fetchAllPages(getRentals, {
          onProgress: ({ loaded }) => setProgress((p) => ({ ...p, rentals: loaded }))
        }),
        fetchAllPages(getProjects, {
          onProgress: ({ loaded }) => setProgress((p) => ({ ...p, projects: loaded }))
        })
      ])

      const referenceDate = health?.reference_date ?? new Date().toISOString()
      console.log(
        "BEYOND API TOTAL IDS:",
        listings.slice(4537, 4540).map(l => l.listing_id)
      )
      setDataset({ listings, rentals, projects, referenceDate })
      if (rentals.length > 0 && !locality) {
        setLocality(rentals[0].locality)
      }
      setLastRun(new Date())
      setStatus('done')
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Analysis failed partway through.')
      setStatus('error')
    }
  }, [locality])

  const metrics = useMemo(() => {
    if (!dataset) return null
    const { listings, rentals, projects, referenceDate } = dataset
    const corrupt = findCorruptListings(listings)

    console.log("CORRUPT COUNT:", corrupt.length)
    console.log("CORRUPT IDS:", corrupt.map(l => l.listing_id))
    console.table(corrupt)

    const unique = countUniqueProperties(listings)
    const active = countActiveListings(listings)
    const rentInLocality = totalMonthlyRent(rentals, locality)
    const avgPpsf = avgPricePerSqftLiveTwoBHK(listings)
    const last7 = listingsInLastNDays(listings, referenceDate, 7)
    const costliest = costliestProject(projects)
    const suspicious = findSuspiciousListings(listings)
    const mismatches = projectListingCountMismatches(listings, projects)

    return { corrupt, unique, active, rentInLocality, avgPpsf, last7, costliest, suspicious, mismatches }
  }, [dataset, locality])

  const localities = useMemo(() => {
    if (!dataset) return []
    const set = new Set(dataset.rentals.map((r) => r.locality).filter(Boolean))
    return [...set].sort()
  }, [dataset])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl text-ivy-950">Dashboard</h1>
          <p className="text-sm text-ivy-600 font-body mt-1">
            Computed on this device from the full listings, rentals and project datasets — the
            reference API's analytics endpoint isn't available.
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={status === 'loading'}
          className="px-4 py-2.5 text-sm font-body bg-ivy-900 text-paper hover:bg-ivy-800 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'Analysing…' : dataset ? 'Re-run analysis' : 'Run full analysis'}
        </button>
      </div>

      {status === 'loading' && (
        <div className="border hairline bg-paper-dim p-5 font-body text-sm text-ivy-700 space-y-1">
          <p>Pulling every record so the numbers below are exact, not sampled. This can take a minute.</p>
          <p className="num">Listings: {progress.listings.toLocaleString('en-IN')}</p>
          <p className="num">Rentals: {progress.rentals.toLocaleString('en-IN')}</p>
          <p className="num">Projects: {progress.projects.toLocaleString('en-IN')}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="border border-clay text-clay text-sm font-body px-3 py-2">{error}</div>
      )}

      {status === 'idle' && (
        <div className="border hairline p-10 text-center">
          <p className="text-ivy-600 font-body text-sm">
            Run the analysis to pull the full dataset and compute every metric below.
          </p>
        </div>
      )}

      {metrics && (
        <>
          {lastRun && (
            <p className="text-xs text-ivy-500 font-body mb-4">
              Last computed {lastRun.toLocaleTimeString('en-IN')} from {dataset.listings.length.toLocaleString('en-IN')}{' '}
              listings, {dataset.rentals.length.toLocaleString('en-IN')} rentals and{' '}
              {dataset.projects.length.toLocaleString('en-IN')} projects.
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard label="Total listing records" value={dataset.listings.length.toLocaleString('en-IN')} />
            <StatCard label="Unique properties" value={metrics.unique.unique.toLocaleString('en-IN')} sub={`${metrics.unique.duplicateGroups} duplicate groups`} />
            <StatCard label="Active listings" value={metrics.active.toLocaleString('en-IN')} />
            <StatCard label="Corrupt listings" value={metrics.corrupt.length} tone={metrics.corrupt.length ? 'warn' : 'default'} />
            <StatCard
              label="Avg price/sqft, live 2 BHK"
              value={metrics.avgPpsf ? `₹${Math.round(metrics.avgPpsf).toLocaleString('en-IN')}` : '—'}
            />
            <StatCard label="Listings in last 7 days" value={metrics.last7.toLocaleString('en-IN')} sub="vs. server reference date" />
            <StatCard label="Fake / suspicious listings" value={metrics.suspicious.length} tone={metrics.suspicious.length ? 'warn' : 'default'} />
            <StatCard label="Projects with wrong listing count" value={metrics.mismatches.toLocaleString('en-IN')} tone={metrics.mismatches ? 'warn' : 'default'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border hairline bg-white/40 p-5">
              <p className="text-xs font-body text-ivy-600 mb-2">Costliest project</p>
              {metrics.costliest ? (
                <>
                  <p className="font-display text-2xl text-ivy-950">{metrics.costliest.apartment_name}</p>
                  <p className="text-sm font-body text-ivy-600 mt-1">
                    {metrics.costliest.project_id} · {formatINR(metrics.costliest.price_max ?? metrics.costliest.price_min)}
                  </p>
                  <Link
                    to={`/projects/${metrics.costliest.project_id}`}
                    className="inline-block mt-3 text-sm font-body text-ivy-800 hover:text-ivy-950 underline underline-offset-2"
                  >
                    View project
                  </Link>
                </>
              ) : (
                <p className="font-body text-sm text-ivy-500">No project pricing data available.</p>
              )}
            </div>

            <div className="border hairline bg-white/40 p-5">
              <p className="text-xs font-body text-ivy-600 mb-2">Total monthly rent by locality</p>
              <select
                className="w-full border hairline bg-white/60 px-3 py-2 text-sm font-body outline-none focus:border-ivy-600 mb-3"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              >
                {localities.map((l) => (
                  <option key={l} value={l}>
                    {titleCase(l)}
                  </option>
                ))}
              </select>
              <p className="font-display text-2xl text-ivy-950 num">{formatINRCompact(metrics.rentInLocality)}</p>
              <p className="text-xs font-body text-ivy-500 mt-1">
                {formatINR(metrics.rentInLocality)} combined monthly rent
              </p>
            </div>
          </div>

          {metrics.suspicious.length > 0 && (
            <div className="mt-6 border hairline p-5">
              <h2 className="font-display text-lg text-ivy-950 mb-3">Suspicious listings</h2>
              <p className="text-xs text-ivy-500 font-body mb-3">
                Positive price under 1% of the median for comparable listings in the same locality and
                bedroom count.
              </p>
              <ul className="text-sm font-body text-ivy-800 space-y-1">
                {metrics.suspicious.slice(0, 10).map((l) => (
                  <li key={l.listing_id} className="flex items-center justify-between border-t hairline py-1.5">
                    <Link to={`/listings/${l.listing_id}`} className="hover:text-ivy-950 underline underline-offset-2">
                      {l.listing_id}
                    </Link>
                    <span className="num">{formatINR(l.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
