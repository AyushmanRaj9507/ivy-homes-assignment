import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFavourites } from '../context/FavouritesContext'
import { formatINR, formatArea, titleCase, formatRelativeDate } from '../utils/format'

function LeafToggle({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Remove from saved' : 'Save this property'}
      aria-pressed={active}
      className={`w-8 h-8 flex items-center justify-center border transition-colors ${
        active
          ? 'bg-ivy-800 border-ivy-800 text-paper'
          : 'bg-paper/90 border-line text-ivy-700 hover:border-ivy-600'
      }`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
        <path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" />
        <path d="M4 20L14 10" />
      </svg>
    </button>
  )
}

export default function PropertyCard({ item, type = 'sale' }) {
  const { isAuthenticated } = useAuth()
  const { isFavourite, toggleFavourite } = useFavourites()

  const detailPath = type === 'sale' ? `/listings/${item.listing_id}` : `/rentals/${item.listing_id}`
  const price = item.price
  const area = item.carpet_area ?? item.super_built_up_area ?? item.super_builtup_area
  const isCorrupt = (item.floor ?? 0) > (item.total_floors ?? Infinity) || price <= 0

  return (
    <div className="group border hairline bg-white/40 hover:border-ivy-600 transition-colors flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg text-ivy-950 leading-snug truncate">
              {item.apartment_name || item.title || 'Unnamed property'}
            </h3>
            <p className="text-sm text-ivy-600 font-body mt-0.5">{titleCase(item.locality)}</p>
          </div>
          {isAuthenticated && (
            <LeafToggle active={isFavourite(item.listing_id)} onClick={() => toggleFavourite(item, type)} />
          )}
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="font-display text-2xl text-ivy-950 num">{formatINR(price)}</span>
          {type === 'rental' && <span className="text-sm text-ivy-600 font-body">/month</span>}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ivy-700 font-body">
          {item.bedroom ? <span>{item.bedroom} BHK</span> : null}
          {item.bathroom ? <span>{item.bathroom} bath</span> : null}
          <span>{formatArea(area)}</span>
          {item.floor !== undefined && item.total_floors ? (
            <span>
              Floor {item.floor}/{item.total_floors}
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-ivy-500 font-body">
          <span>{formatRelativeDate(item.posted_at)}</span>
          <div className="flex items-center gap-2">
            {isCorrupt && (
              <span className="px-1.5 py-0.5 border border-clay text-clay">Data issue</span>
            )}
            {item.is_verified && type === 'sale' && (
              <span className="px-1.5 py-0.5 border border-ivy-500 text-ivy-700">Verified</span>
            )}
          </div>
        </div>
      </div>

      <Link
        to={detailPath}
        className="border-t hairline px-4 py-2.5 text-sm font-body text-ivy-800 hover:bg-ivy-100 transition-colors flex items-center justify-between"
      >
        View details
        <span aria-hidden>›</span>
      </Link>
    </div>
  )
}
