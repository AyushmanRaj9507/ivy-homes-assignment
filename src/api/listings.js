import client from './client'

// Server-side descending sort is unreliable per the API reference, so the
// caller is responsible for re-sorting `results` on the client when needed.
export async function getListings({
  offset = 0,
  limit = 50,
  locality,
  bhk,
  property_type,
  min_price,
  max_price,
  furnishing,
  sort_by,
  order
} = {}) {
  const params = { offset, limit }

  if (locality) params.locality = locality
  if (bhk) params.bhk = bhk
  if (property_type) params.property_type = property_type
  if (min_price) params.min_price = min_price
  if (max_price) params.max_price = max_price
  if (furnishing) params.furnishing = furnishing
  if (sort_by) params.sort_by = sort_by
  if (order) params.order = order

  const res = await client.get('/v1/listings', { params })
  return res.data
}

export async function getListing(listingId) {
  try {
    // Try the documented detail endpoint first.
    const res = await client.get(
      `/v1/listing/${encodeURIComponent(listingId)}`
    )
    return res.data
  } catch (err) {
    // If the detail endpoint returns 404, find the listing
    // through the working collection endpoint.
    if (err?.response?.status !== 404) {
      throw err
    }

    const limit = 50
    let offset = 0

    while (true) {
      const res = await getListings({
        offset,
        limit
      })

      const found = res.results?.find(
        (item) => item.listing_id === listingId
      )

      if (found) {
        return found
      }

      if (!res.has_more || !res.results?.length) {
        break
      }

      offset += limit
    }

    throw err
  }
}