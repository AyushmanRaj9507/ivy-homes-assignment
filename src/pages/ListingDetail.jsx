import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getListing, getListings } from '../api/listings'
import { useAuth } from '../context/AuthContext'
import { useFavourites } from '../context/FavouritesContext'
import { formatINR, formatArea, titleCase, formatDate, pricePerSqft } from '../utils/format'
import PropertyCard from '../components/PropertyCard'

function Fact({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="border-t hairline py-2.5 flex items-center justify-between text-sm font-body">
      <span className="text-ivy-600">{label}</span>
      <span className="text-ivy-950">{value}</span>
    </div>
  )
}

export default function ListingDetail() {
  const { listingId } = useParams()
  const { isAuthenticated } = useAuth()
  const { isFavourite, toggleFavourite } = useFavourites()

  const [listing, setListing] = useState(null)
  const [similar, setSimilar] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    console.log('DETAIL ID:', listingId)
    getListing(listingId)
      .then(async (data) => {
        if (cancelled) return
        setListing(data)
        // The dedicated /similar endpoint 404s; approximate it on the
        // frontend using locality + bedroom count + property type.
        try {
          const res = await getListings({
            locality: data.locality,
            bhk: data.bedroom,
            property_type: data.property_type,
            limit: 8
          })
          if (!cancelled) {
            setSimilar(res.results.filter((r) => r.listing_id !== data.listing_id).slice(0, 3))
          }
        } catch {
          // similar listings are a nice-to-have; ignore failures
        }
      })
       .catch((err) => {
        console.log('DETAIL ERROR:', err)
        console.log('STATUS:', err?.response?.status)
        console.log('DATA:', err?.response?.data)

        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
            'This listing could not be loaded.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [listingId])

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-ivy-500 font-body text-sm">Loading…</div>
  if (error) return <div className="max-w-4xl mx-auto px-6 py-20 text-clay font-body text-sm">{error}</div>
  if (!listing) return null

  const area = listing.carpet_area ?? listing.super_built_up_area
  const ppsf = pricePerSqft(listing.price, area)
  const isCorrupt = (listing.floor ?? 0) > (listing.total_floors ?? Infinity) || listing.price <= 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/listings" className="text-sm font-body text-ivy-600 hover:text-ivy-950">
        ← Back to listings
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivy-950">{listing.apartment_name || 'Unnamed property'}</h1>
          <p className="text-ivy-600 font-body mt-1">
            {titleCase(listing.locality)} · {titleCase(listing.property_type)}
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => toggleFavourite(listing, 'sale')}
            className={`shrink-0 px-4 py-2 text-sm font-body border transition-colors ${
              isFavourite(listing.listing_id)
                ? 'bg-ivy-800 border-ivy-800 text-paper'
                : 'border-line text-ivy-800 hover:border-ivy-600'
            }`}
          >
            {isFavourite(listing.listing_id) ? 'Saved' : 'Save listing'}
          </button>
        )}
      </div>

      {isCorrupt && (
        <div className="mt-6 border border-clay text-clay text-sm font-body px-3 py-2">
          This record has a data-quality issue (an implausible floor count or non-positive price) and
          should be treated with caution.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-ivy-950 num">{formatINR(listing.price)}</span>
          </div>
          {ppsf && <p className="text-sm text-ivy-600 font-body mt-1">{Math.round(ppsf).toLocaleString('en-IN')} ₹/sqft</p>}

          <p className="font-body text-ivy-800 leading-relaxed mt-6 whitespace-pre-line">
            {listing.description || 'No description was provided for this listing.'}
          </p>

          <h2 className="font-display text-xl text-ivy-950 mt-10 mb-2">Property details</h2>
          <div>
            <Fact label="Bedrooms" value={listing.bedroom} />
            <Fact label="Bathrooms" value={listing.bathroom} />
            <Fact label="Balconies" value={listing.balcony} />
            <Fact label="Floor" value={listing.floor !== undefined ? `${listing.floor} of ${listing.total_floors ?? '—'}` : null} />
            <Fact label="Furnishing" value={titleCase(listing.furnishing)} />
            <Fact label="Facing" value={titleCase(listing.facing_direction)} />
            <Fact label="Covered parking" value={listing.covered_parking} />
            <Fact label="Carpet area" value={formatArea(listing.carpet_area)} />
            <Fact label="Super built-up area" value={formatArea(listing.super_built_up_area)} />
            <Fact label="Posted" value={formatDate(listing.posted_at)} />
            <Fact label="Verified" value={listing.is_verified ? 'Yes' : 'No'} />
          </div>
        </div>

        <aside>
          <div className="border hairline bg-paper-dim p-4">
            <h3 className="font-display text-lg text-ivy-950 mb-3">Posted by</h3>
            <p className="font-body text-sm text-ivy-950">{listing.posted_by_name || '—'}</p>
            <p className="font-body text-sm text-ivy-600 capitalize">{listing.posted_by || '—'}</p>
            {listing.posted_by_contact && (
              <p className="font-body text-sm text-ivy-800 mt-2 num">{listing.posted_by_contact}</p>
            )}
            {listing.listing_url && (
              <a
                href={listing.listing_url}
                target="_blank"
                rel="noreferrer"
                className="block mt-4 text-sm font-body text-ivy-700 hover:text-ivy-950 underline underline-offset-2"
              >
                View original listing on {listing.website || 'source site'}
              </a>
            )}
          </div>
          {listing.project_id && (
            <Link
              to={`/projects/${listing.project_id}`}
              className="block mt-3 border hairline p-4 text-sm font-body text-ivy-800 hover:bg-ivy-100 transition-colors"
            >
              View builder project →
            </Link>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl text-ivy-950 mb-4">Similar properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similar.map((item) => (
              <PropertyCard key={item.listing_id} item={item} type="sale" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
