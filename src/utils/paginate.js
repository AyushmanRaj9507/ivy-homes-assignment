// Walks an offset-paginated collection endpoint to completion.
//
// The API's `total` field is not always accurate (see API reference:
// listings reported total=3488 but 3800 records were retrievable), so this
// relies on `has_more` rather than `total`, with a hard page cap as a
// safety net against a runaway loop.
const MAX_LIMIT = 50
const MAX_PAGES = 400 // 400 * 50 = 20,000 records ceiling

export async function fetchAllPages(fetchFn, { onProgress } = {}) {
  let offset = 0
  let all = []
  let page = 0

  while (page < MAX_PAGES) {
    const data = await fetchFn({ offset, limit: MAX_LIMIT })
    const results = data.results ?? []
    all = all.concat(results)
    page += 1
    onProgress?.({ loaded: all.length, page })

    if (!data.has_more || results.length === 0) break
    offset += MAX_LIMIT
  }

  return all
}
