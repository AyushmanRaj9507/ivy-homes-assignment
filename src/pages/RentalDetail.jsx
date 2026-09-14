import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRental } from '../api/rentals'
import { useAuth } from '../context/AuthContext'
import { useFavourites } from '../context/FavouritesContext'
import { formatINR, formatArea, titleCase, formatDate } from '../utils/format'

function Fact({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="border-t hairline py-2.5 flex items-center justify-between text-sm font-body">
      <span className="text-ivy-600">{label}</span>
      <span className="text-ivy-950">{value}</span>
    </div>
  )
}

export default function RentalDetail() {
  const { listingId } = useParams()
  const { isAuthenticated } = useAuth()
  const { isFavourite, toggleFavourite } = useFavourites()

  const [rental, setRental] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getRental(listingId)
      .then((data) => !cancelled && setRental(data))
      .catch((err) => !cancelled && setError(err?.response?.data?.detail || 'This rental could not be loaded.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [listingId])

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-ivy-500 font-body text-sm">Loading…</div>
  if (error) return <div className="max-w-4xl mx-auto px-6 py-20 text-clay font-body text-sm">{error}</div>
  if (!rental) return null

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/rentals" className="text-sm font-body text-ivy-600 hover:text-ivy-950">
        ← Back to rentals
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivy-950">
            {rental.apartment_name || rental.title || 'Unnamed property'}
          </h1>
          <p className="text-ivy-600 font-body mt-1">{titleCase(rental.locality)}</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => toggleFavourite(rental, 'rental')}
            className={`shrink-0 px-4 py-2 text-sm font-body border transition-colors ${
              isFavourite(rental.listing_id)
                ? 'bg-ivy-800 border-ivy-800 text-paper'
                : 'border-line text-ivy-800 hover:border-ivy-600'
            }`}
          >
            {isFavourite(rental.listing_id) ? 'Saved' : 'Save listing'}
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-ivy-950 num">{formatINR(rental.price)}</span>
            <span className="text-ivy-600 font-body">/month</span>
          </div>
          <p className="text-sm text-ivy-600 font-body mt-2">
            Deposit {formatINR(rental.deposit)}
            {rental.maintenance ? ` · Maintenance ${formatINR(rental.maintenance)}/mo` : ''}
          </p>

          <p className="font-body text-ivy-800 leading-relaxed mt-6 whitespace-pre-line">
            {rental.description || 'No description was provided for this listing.'}
          </p>

          <h2 className="font-display text-xl text-ivy-950 mt-10 mb-2">Property details</h2>
          <div>
            <Fact label="Bedrooms" value={rental.bedroom} />
            <Fact label="Bathrooms" value={rental.bathroom} />
            <Fact label="Floor" value={rental.floor !== undefined ? `${rental.floor} of ${rental.total_floors ?? '—'}` : null} />
            <Fact label="Furnishing" value={titleCase(rental.furnishing)} />
            <Fact label="Facing" value={titleCase(rental.facing_direction)} />
            <Fact label="Carpet area" value={formatArea(rental.carpet_area)} />
            <Fact label="Super built-up area" value={formatArea(rental.super_builtup_area)} />
            <Fact label="Posted" value={formatDate(rental.posted_at)} />
          </div>
        </div>

        <aside>
          <div className="border hairline bg-paper-dim p-4">
            <h3 className="font-display text-lg text-ivy-950 mb-3">Posted by</h3>
            <p className="font-body text-sm text-ivy-950">{rental.posted_by_name || '—'}</p>
            <p className="font-body text-sm text-ivy-600 capitalize">{rental.posted_by || '—'}</p>
            {rental.posted_by_contact && (
              <p className="font-body text-sm text-ivy-800 mt-2 num">{rental.posted_by_contact}</p>
            )}
            {rental.listing_url && (
              <a
                href={rental.listing_url}
                target="_blank"
                rel="noreferrer"
                className="block mt-4 text-sm font-body text-ivy-700 hover:text-ivy-950 underline underline-offset-2"
              >
                View original listing on {rental.website || 'source site'}
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
