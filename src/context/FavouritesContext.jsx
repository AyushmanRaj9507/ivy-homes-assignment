import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'

// The documented /v1/favourites endpoints 404 in the running API, so saved
// listings are kept entirely client-side, namespaced per signed-in user so
// demo1/demo2/demo3 each see only their own list, and it survives reload
// and logout/re-login.
const storageKey = (email) => `savedListings_${email}`

const FavouritesContext = createContext(null)

export function FavouritesProvider({ children }) {
  const { user } = useAuth()
  const [favourites, setFavourites] = useState({}) // { [id]: { type, item, savedAt } }

  useEffect(() => {
    if (!user?.email) {
      setFavourites({})
      return
    }
    try {
      const raw = localStorage.getItem(storageKey(user.email))
      setFavourites(raw ? JSON.parse(raw) : {})
    } catch {
      setFavourites({})
    }
  }, [user?.email])

  const persist = useCallback(
    (next) => {
      setFavourites(next)
      if (user?.email) {
        localStorage.setItem(storageKey(user.email), JSON.stringify(next))
      }
    },
    [user?.email]
  )

  const isFavourite = useCallback((id) => Boolean(favourites[id]), [favourites])

  const toggleFavourite = useCallback(
    (item, type) => {
      if (!user?.email) return
      const id = item.listing_id
      const next = { ...favourites }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = { type, item, savedAt: new Date().toISOString() }
      }
      persist(next)
    },
    [favourites, persist, user?.email]
  )

  const removeFavourite = useCallback(
    (id) => {
      const next = { ...favourites }
      delete next[id]
      persist(next)
    },
    [favourites, persist]
  )

  const list = useMemo(
    () =>
      Object.entries(favourites)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)),
    [favourites]
  )

  const value = { favourites, list, isFavourite, toggleFavourite, removeFavourite }

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext)
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider')
  return ctx
}
