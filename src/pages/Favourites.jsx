import { useFavourites } from '../context/FavouritesContext'
import { useAuth } from '../context/AuthContext'
import PropertyCard from '../components/PropertyCard'

export default function Favourites() {
  const { user } = useAuth()
  const { list } = useFavourites()

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-ivy-950">Saved listings</h1>
      <p className="text-sm text-ivy-600 font-body mt-1">
        Kept locally for {user?.email}. Saved lists are kept separately per account and survive
        reload and re-login.
      </p>

      {list.length === 0 ? (
        <div className="mt-16 py-16 text-center border hairline">
          <p className="text-ivy-600 font-body text-sm">Nothing saved yet.</p>
          <p className="text-ivy-500 font-body text-xs mt-1">
            Use the leaf icon on any listing or rental to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {list.map(({ id, item, type }) => (
            <PropertyCard key={id} item={item} type={type} />
          ))}
        </div>
      )}
    </div>
  )
}
