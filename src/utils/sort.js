// The API's descending sort does not behave reliably (see API reference),
// so every page of results is re-sorted client-side once it arrives. This
// is accurate within a fetched page; it does not re-sort across the whole
// remote collection.

export const LISTING_SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price, low to high' },
  { value: 'price_desc', label: 'Price, high to low' },
  { value: 'newest', label: 'Newest' },
  { value: 'carpet_asc', label: 'Carpet area, low to high' },
  { value: 'carpet_desc', label: 'Carpet area, high to low' }
]

export function sortListings(results, sortKey) {
  const arr = [...results]
  switch (sortKey) {
    case 'price_asc':
      return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    case 'price_desc':
      return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    case 'newest':
      return arr.sort((a, b) => new Date(b.posted_at ?? 0) - new Date(a.posted_at ?? 0))
    case 'carpet_asc':
      return arr.sort((a, b) => (a.carpet_area ?? 0) - (b.carpet_area ?? 0))
    case 'carpet_desc':
      return arr.sort((a, b) => (b.carpet_area ?? 0) - (a.carpet_area ?? 0))
    default:
      return arr
  }
}

export const PROJECT_SORT_OPTIONS = [
  { value: 'price_min_asc', label: 'Starting price, low to high' },
  { value: 'price_min_desc', label: 'Starting price, high to low' },
  { value: 'launch_desc', label: 'Recently launched' },
  { value: 'units_desc', label: 'Most units' }
]

export function sortProjects(results, sortKey) {
  const arr = [...results]
  switch (sortKey) {
    case 'price_min_asc':
      return arr.sort((a, b) => (a.price_min ?? 0) - (b.price_min ?? 0))
    case 'price_min_desc':
      return arr.sort((a, b) => (b.price_min ?? 0) - (a.price_min ?? 0))
    case 'launch_desc':
      return arr.sort((a, b) => new Date(b.launch_date ?? 0) - new Date(a.launch_date ?? 0))
    case 'units_desc':
      return arr.sort((a, b) => (b.total_units ?? 0) - (a.total_units ?? 0))
    default:
      return arr
  }
}
