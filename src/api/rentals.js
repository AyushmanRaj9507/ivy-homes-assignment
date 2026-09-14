import client from './client'

export async function getRentals({
  offset = 0,
  limit = 50,
  locality,
  bhk,
  furnishing,
  sort_by,
  order
} = {}) {
  const params = { offset, limit }
  if (locality) params.locality = locality
  if (bhk) params.bhk = bhk
  if (furnishing) params.furnishing = furnishing
  if (sort_by) params.sort_by = sort_by
  if (order) params.order = order

  const res = await client.get('/v1/rentals', { params })
  return res.data
}

export async function getRental(listingId) {
  const res = await client.get(`/v1/rentals/${encodeURIComponent(listingId)}`)
  return res.data
}
