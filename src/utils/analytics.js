// All analytics are computed on the frontend from full collections, since
// GET /v1/analytics/summary 404s on the running API. Values 0/undefined are
// treated as "unknown" rather than corrupt on their own (see API reference:
// floor=0 or bedroom=0 can be a legitimate missing-value marker), so
// corruption rules stay narrow and explicit.

export function findCorruptListings(listings) {
  return listings.filter((l) => {
    const floorOverflow =
      l.total_floors != null &&
      l.floor != null &&
      l.floor > l.total_floors

    const badPrice =
      l.price != null &&
      l.price <= 0

    return floorOverflow || badPrice
  })
}

const FINGERPRINT_FIELDS = [
  'apartment_name',
  'locality',
  'property_type',
  'bedroom',
  'bathroom',
  'balcony',
  'floor',
  'total_floors',
  'carpet_area',
  'super_built_up_area',
  'latitude',
  'longitude',
  'facing_direction',
  'covered_parking',
  'project_id'
]

export function countUniqueProperties(listings) {
  const seen = new Set()
  let duplicateGroups = 0
  const counts = new Map()

  for (const l of listings) {
    const key = FINGERPRINT_FIELDS
      .map((f) => String(l[f] ?? ''))
      .join('|')

    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  for (const [key, count] of counts) {
    seen.add(key)

    if (count > 1) {
      duplicateGroups += 1
    }
  }

  return {
    unique: seen.size,
    duplicateGroups
  }
}

export function countActiveListings(listings) {
  return listings.filter((l) => l.is_live === true).length
}

export function totalMonthlyRent(rentals, locality) {
  if (!locality) return 0

  const target = locality.trim().toLowerCase()

  return rentals
    .filter(
      (r) =>
        (r.locality ?? '').trim().toLowerCase() === target
    )
    .reduce(
      (sum, r) => sum + (r.price > 0 ? r.price : 0),
      0
    )
}

/*
  Q6:
  Average price/sqft for live 2BHK listings.

  Assignment requirement:
  - only live listings
  - only 2 BHK
  - valid positive price
  - valid positive area
  - EXCLUDE corrupt listings from Q4
  - EXCLUDE fake/suspicious listings from Q9
*/
export function avgPricePerSqftLiveTwoBHK(listings) {
  // Find corrupt listing IDs from Q4
  const corruptIds = new Set(
    findCorruptListings(listings).map(
      (l) => l.listing_id
    )
  )

  // Find fake/suspicious listing IDs from Q9
  const fakeIds = new Set(
    findSuspiciousListings(listings).map(
      (l) => l.listing_id
    )
  )

  const eligible = listings.filter((l) => {
    const area =
      l.carpet_area ?? l.super_built_up_area

    return (
      // Live listing
      l.is_live === true &&

      // 2 BHK
      l.bedroom === 2 &&

      // Valid price
      l.price > 0 &&

      // Valid area
      area > 0 &&

      // Exclude Q4 corrupt listings
      !corruptIds.has(l.listing_id) &&

      // Exclude Q9 fake/suspicious listings
      !fakeIds.has(l.listing_id)
    )
  })

  if (eligible.length === 0) {
    return null
  }

  const total = eligible.reduce((sum, l) => {
    const area =
      l.carpet_area ?? l.super_built_up_area

    return sum + l.price / area
  }, 0)

  return total / eligible.length
}

export function listingsInLastNDays(
  listings,
  referenceDate,
  days = 7
) {
  const ref = new Date(referenceDate).getTime()

  const cutoff =
    ref - days * 24 * 60 * 60 * 1000

  return listings.filter((l) => {
    if (!l.posted_at) return false

    const t = new Date(l.posted_at).getTime()

    return (
      !Number.isNaN(t) &&
      t >= cutoff &&
      t <= ref
    )
  }).length
}

export function costliestProject(projects) {
  let best = null

  for (const p of projects) {
    const price =
      p.price_max ?? p.price_min

    if (price == null) continue

    if (
      !best ||
      price >
        (best.price_max ?? best.price_min)
    ) {
      best = p
    }
  }

  return best
}

function median(values) {
  if (values.length === 0) {
    return null
  }

  const sorted = [...values].sort(
    (a, b) => a - b
  )

  const mid = Math.floor(
    sorted.length / 2
  )

  if (sorted.length % 2 === 0) {
    return (
      (sorted[mid - 1] + sorted[mid]) / 2
    )
  }

  return sorted[mid]
}

export function findSuspiciousListings(listings) {
  const groups = new Map()

  for (const l of listings) {
    if (!(l.price > 0)) continue

    const key =
      `${(l.locality ?? '').toLowerCase()}|${l.bedroom ?? ''}`

    if (!groups.has(key)) {
      groups.set(key, [])
    }

    groups.get(key).push(l)
  }

  const suspicious = []

  for (const group of groups.values()) {
    const med = median(
      group.map((l) => l.price)
    )

    if (!med) continue

    for (const l of group) {
      if (l.price < med * 0.01) {
        suspicious.push(l)
      }
    }
  }

  return suspicious
}
export function projectListingCountMismatches(
  listings,
  projects
) {
  const actualCounts = new Map()

  for (const l of listings) {
    if (!l.project_id) continue

    actualCounts.set(
      l.project_id,
      (actualCounts.get(l.project_id) ?? 0) + 1
    )
  }

  const mismatchedProjects = []

  for (const p of projects) {
    const actual =
      actualCounts.get(p.project_id) ?? 0

    if (
      p.total_listings != null &&
      p.total_listings !== actual
    ) {
      mismatchedProjects.push({
        project_id: p.project_id,
        reported: p.total_listings,
        actual: actual
      })
    }
  }

  console.log("PROJECT MISMATCH COUNT:", mismatchedProjects.length)
  console.table(mismatchedProjects)

  return mismatchedProjects.length
}