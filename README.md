# Ivy Homes — Property Frontend

A React (Vite) frontend for the Ivy Homes Property API: browse sale listings,
rentals and builder projects, sign in as a demo user, save listings locally,
and see a full-dataset analytics dashboard.

## 1. Set up your API key

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
VITE_API_KEY=IVY26-XXXXXXXXXXXX
VITE_API_BASE_URL=https://solve.ivy.homes
```

`VITE_API_KEY` is sent as the `X-API-Key` header on every request (login
included). Never commit `.env` — it's already in `.gitignore`.

## 2. Install and run

```bash
npm install
npm run dev
```

Then open the printed local URL. Sign in with one of the demo accounts
(`demo1@ivy.homes`, `demo2@ivy.homes`, `demo3@ivy.homes`) and the password
issued with your API key.

## 3. Build for production

```bash
npm run build
npm run preview
```

## What's inside

```
src/
  api/            axios client + one module per resource (auth, listings, rentals, projects, health)
  context/        AuthContext (session + token refresh), FavouritesContext (saved listings)
  components/     Navbar, PropertyCard, FilterBar, Pagination, StatCard, ProtectedRoute
  pages/          Login, Listings, ListingDetail, Rentals, RentalDetail, Projects, ProjectDetail, Favourites, Dashboard
  utils/          format.js, sort.js, paginate.js, analytics.js
```

## Design decisions driven by the API's quirks

These map directly to findings in the corrected API reference:

- **Auth** — access tokens expire in 15 minutes. `api/client.js` attaches
  the bearer token to every request and, on a 401, transparently calls
  `/auth/refresh` once (queuing concurrent requests behind a single refresh)
  before retrying. If refresh fails, the app clears local session state and
  routes to `/login`. The reference API doesn't document the exact body
  shape for `/auth/refresh`; this app sends `{ refresh_token }` — adjust in
  `api/client.js` if your server expects a different shape.
- **Pagination** — `offset`/`limit` only, capped at 50 per request; `page`
  is never used. `has_more` drives pagination, not `total` (the reference
  found `total` under-counts the real listings collection).
- **Sorting** — server-side `order=desc` is unreliable, so the UI always
  gets ascending-safe data and re-sorts each fetched page client-side
  (`utils/sort.js`). This is exact within a page, not across the whole
  remote collection — a known limitation, called out here rather than
  hidden.
- **`project_id` filtering** — documented but non-functional against
  `/v1/listings`, so the listing-detail page's "similar listings" and the
  project page's "matching listings" both avoid relying on it. Similar
  listings are approximated from locality + bedroom count + property type;
  the project page links out to a locality-filtered listings search instead
  of claiming an exact project match.
- **`/v1/listings/{id}/similar`, `/v1/favourites/*`,
  `/v1/analytics/summary`** — all documented as 404 in the reference, so
  none of them are called. Favourites are stored in `localStorage` under
  `savedListings_<email>`, namespaced per signed-in user. Analytics are
  computed entirely on the frontend (see below).
- **Data-quality anomalies** — the app never silently "fixes" bad data.
  Listings with `floor > total_floors` or non-positive price are flagged as
  corrupt inline (detail page and cards) rather than hidden. Projects with
  `price_min > price_max` show a warning instead of swapping the values.

## The dashboard

`/v1/analytics/summary` 404s, so `pages/Dashboard.jsx` pulls the *entire*
listings, rentals and projects collections (paginating in batches of 50 via
`utils/paginate.js`, following `has_more`) and computes every metric in the
browser with `utils/analytics.js`:

- Total listing records, unique properties (via a 15-field physical
  fingerprint), duplicate groups
- Active listings (`is_live === true`)
- Corrupt listings (`floor > total_floors` or `price <= 0`)
- Suspicious/fake listings (positive price under 1% of the median for the
  same locality + bedroom group)
- Average price/sqft for live 2 BHK listings
- Listings posted in the last 7 days, measured against the server's
  `reference_date` from `/health` rather than the browser's clock
- Costliest project
- Total monthly rent for a chosen locality (picker populated from the
  fetched rentals)
- Projects whose `total_listings` field disagrees with the actual count of
  listings carrying that `project_id` (computed from the full listings
  pull, since the API's own `project_id` filter can't be trusted)

This is a genuinely heavy pull (thousands of records across three
collections), so the dashboard is opt-in: click **Run full analysis**
rather than firing on every page load. Progress is shown per collection
while it loads.

## Known limitations / things to revisit against your live key

- The refresh-token request body shape is assumed, not documented — verify
  against your server and adjust `performRefresh()` in `api/client.js` if
  needed.
- Client-side sorting is correct per-page, not globally, because true
  global sorting would require pulling the full collection on every filter
  change.
- The dashboard's full-collection pull can take a while on a large city;
  it's rate-limited by nothing on the client side beyond sequential
  pagination, well under the API's 1200 requests/minute cap.
