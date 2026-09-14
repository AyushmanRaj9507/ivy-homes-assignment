# Ivy Homes — Property API Frontend & Investigation

A React + Vite frontend built for the Ivy Homes software engineering assignment.

The application provides browsing for property listings, rentals and projects, authentication, saved listings, property details, and a full-dataset insights dashboard.

The project also investigates differences between the supplied API documentation and the behavior of the running API.

---

## Features

### 1. Authentication

* Login using the provided demo credentials.
* API key is sent through the `X-API-Key` header.
* Access tokens are stored locally for session persistence.
* Access tokens expire after 15 minutes.
* When an authenticated request receives a `401`, the application attempts to refresh the access token using the refresh token.
* Concurrent requests share a single refresh operation.
* The session therefore survives browser refreshes and can continue beyond the access-token lifetime.

### 2. Listings

* Paginated listings using the API's `offset` and `limit` mechanism.
* Locality filter.
* Bedroom filter.
* Property type filter.
* Minimum price filter.
* Maximum price filter.
* Furnishing filter.
* Price sorting.
* Listing cards show important property information and data-quality warnings where applicable.

### 3. Listing Details

Each listing has its own URL:

```text
/listings/{listingId}
```

The application first attempts the documented listing-detail endpoint. Because the running API returned `404` for a valid listing ID, the frontend falls back to searching the complete listings collection for that ID.

### 4. Saved Listings

The documented favourites endpoints were unavailable on the running API.

Therefore, saved listings are implemented using browser `localStorage`:

```text
savedListings_<user-email>
```

This makes saved listings:

* persistent across page reloads
* persistent across browser sessions
* isolated between different demo users

### 5. Rentals and Projects

The application provides separate browsing and detail pages for:

* Rentals
* Builder projects

Pagination and the available filters are implemented using the API's observable behavior.

Project price values are displayed as returned by the API. The application does not silently swap or "fix" a project's minimum and maximum price when the source data is inconsistent.

### 6. Insights Dashboard

The API documentation described an analytics endpoint, but the running endpoint returned `404`.

Instead of depending on that endpoint, the dashboard downloads the underlying datasets and computes the metrics locally.

The dashboard calculates:

* total listing records
* unique properties
* duplicate groups
* active listings
* corrupt listings
* suspicious/fake listings
* average price per square foot for live 2 BHK listings
* listings posted during the seven-day reference window
* costliest project
* total monthly rent for a selected locality
* projects whose reported listing count disagrees with the actual listing count

The dashboard uses sequential pagination and follows `has_more` rather than assuming that the reported `total` value is complete.

---

# Running Locally

## Requirements

* Node.js
* npm

## Install dependencies

```bash
npm install
```

## Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_KEY=YOUR_IVY_HOMES_API_KEY
VITE_API_BASE_URL=https://solve.ivy.homes
```

The API key is sent through the `X-API-Key` header.

Do not commit `.env` or expose the API key publicly.

## Start development server

```bash
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

---

# Investigation Methodology

The supplied API documentation was treated as a hypothesis rather than as the source of truth.

The running API was used as the source of truth.

I first tested the documented endpoints and then pulled the complete unfiltered datasets using the pagination information returned by the API.

For collection endpoints, I used:

```text
offset
limit
has_more
```

rather than relying on the documented or assumed page-number behavior.

The API responses were then analyzed programmatically instead of inspecting records individually.

The investigation focused on hypotheses around:

* pagination and completeness
* endpoint existence
* filters
* sorting
* units
* timestamps
* duplicate properties
* impossible records
* suspicious/fake records
* project/listing consistency
* aggregate counts
* analytics availability

For record-level findings, representative record identifiers were retained as evidence.

I intentionally avoided reporting a discrepancy unless it could be reproduced against the running API.

---

# Findings

The investigation identified discrepancies including:

## Pagination

The `page` parameter did not advance the listings collection.

For example, requesting:

```text
/v1/listings?page=2&limit=50
```

returned the same offset and first listing as:

```text
/v1/listings?offset=0&limit=50
```

The application therefore uses offset-based pagination.

The API also reported a listings `total` of `4537`, while complete traversal using `has_more` retrieved `4700` records.

Therefore the application does not use the reported `total` as the termination condition.

## Listing Detail

The documented:

```text
/v1/listing/{id}
```

endpoint returned `404` for a listing ID that was present in the main listings collection.

The frontend therefore has a fallback lookup against the complete listings collection.

## Project Filtering

The documented `project_id` filter on the listings endpoint was tested and was not reliably applied.

A request for:

```text
project_id=P10020
```

returned records with null and different project IDs.

The application does not depend on this filter for correctness.

## Similar Listings

The documented similar-listings endpoint returned `404`.

The frontend therefore computes approximate similar listings using available listing attributes rather than depending on the unavailable endpoint.

## Favourites

The documented favourites endpoint returned `404`.

Saved listings are therefore implemented locally and namespaced per user.

## Analytics

The documented:

```text
/v1/analytics/summary
```

endpoint returned `404`.

The insights dashboard consequently computes its metrics from the underlying listings, rentals and projects datasets.

## Project Price Data Quality

Multiple project records contained:

```text
price_min > price_max
```

The application does not silently correct these values. Instead, it displays the source values and warns the user about the inconsistency.

## Project Listing Counts

The `total_listings` value reported by projects was compared with the actual number of listings associated with each project in the complete listings dataset.

The comparison found projects where the reported and calculated counts disagreed.

---

# What Turned Out Fine

Not every hypothesis resulted in a discrepancy.

The following behaviors were tested and found to work:

* Locality filtering on listings worked.
* Bedroom filtering worked.
* Property type filtering worked.
* Furnishing filtering worked.
* Minimum price filtering worked.
* Maximum price filtering worked.
* Price sorting using `sort_by=price&order=desc` returned descending prices in the tested response.
* Offset-based pagination progressed correctly when offsets were incremented and `has_more` was followed.
* Rental pagination worked with the offset/limit mechanism.
* Project pagination worked with the offset/limit mechanism.
* The frontend session survived a browser refresh.
* Saved listings persisted after reload.
* Saved listings were namespaced per signed-in user.
* Listing records exposed `is_live`, allowing active-listing counts to be computed directly.
* The API returned enough information to independently compute the requested aggregate metrics.

These checks were kept separate from actual discrepancies so that the findings list contains only behavior that was personally reproduced.

---

# Data Analysis

The complete datasets were analyzed rather than relying only on the first page.

For listings, the analysis included:

```text
4,700 retrievable listing records
3,722 active listings
16 corrupt listing records
8 suspicious/fake listing records
149 listings in the seven-day reference window
```

The average price-per-square-foot calculation for live 2 BHK listings excludes the identified corrupt and suspicious records.

Project/listing consistency was evaluated by grouping listing records by `project_id` and comparing the resulting counts with each project's reported `total_listings`.

---

# Architecture

```text
src/
├── api/
│   ├── client.js
│   ├── auth.js
│   ├── listings.js
│   ├── rentals.js
│   ├── projects.js
│   └── health.js
│
├── components/
│   ├── Navbar.jsx
│   ├── PropertyCard.jsx
│   ├── FilterBar.jsx
│   ├── Pagination.jsx
│   ├── StatCard.jsx
│   └── ProtectedRoute.jsx
│
├── context/
│   ├── AuthContext.jsx
│   └── FavouritesContext.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Listings.jsx
│   ├── ListingDetail.jsx
│   ├── Rentals.jsx
│   ├── RentalDetail.jsx
│   ├── Projects.jsx
│   ├── ProjectDetail.jsx
│   ├── Favourites.jsx
│   └── Dashboard.jsx
│
└── utils/
    ├── analytics.js
    ├── format.js
    ├── paginate.js
    └── sort.js
```

---

# Design Decisions

## API Pagination

The application uses a maximum page size of 50 and follows `has_more`.

This avoids depending on the API's reported `total` value when determining whether additional records exist.

## Authentication

Authentication is handled centrally through Axios interceptors.

The access token is attached to authenticated requests and refreshed automatically after an expired-token response.

## Local Favourites

Because the documented favourites API was unavailable, saved listings are maintained locally.

The storage key includes the user's email so that users do not share saved listings.

## Data Quality

The application does not silently modify source data.

Examples:

* negative prices are flagged
* impossible floor values are flagged
* project ranges where minimum exceeds maximum are displayed with a warning

This keeps the frontend faithful to the source data while making anomalies visible.

## Analytics

Analytics are calculated from the underlying datasets because the documented analytics endpoint is unavailable.

The dashboard performs the expensive full-data operation only when the user explicitly clicks **Run full analysis**.

---

# LLM Usage

An LLM was used during the assignment for:

* understanding the assignment requirements
* generating and refining frontend code
* debugging implementation issues
* structuring the API investigation
* helping formulate hypotheses and analysis approaches
* reviewing the final implementation

API behavior and investigation results were personally tested against the running API before being included in the submission.

The final findings were not accepted solely from generated suggestions; endpoint behavior and record-level results were reproduced against the API.

---

# What I Would Do With Another Two Days

With additional time, I would focus on correctness and maintainability rather than adding many more UI features.

### 1. Improve automated data validation

Add a reusable validation layer with checks for:

* impossible prices
* impossible floor numbers
* invalid areas
* inconsistent project ranges
* duplicate property fingerprints
* project/listing count mismatches
* suspicious listing patterns

### 2. Add automated investigation tests

Create repeatable scripts that verify every documented endpoint and important parameter.

This would make it easier to rerun the investigation if the API dataset changes.

### 3. Improve global filtering and sorting

Some operations currently require client-side work because server-side behavior cannot always be trusted.

I would build a cached local dataset layer so filtering and sorting could be performed consistently across the entire retrieved collection.

### 4. Improve authentication security

For a production application, I would avoid storing long-lived authentication material directly in browser storage where possible and would move authentication handling to a more secure server-side/session architecture.

### 5. Add tests

I would add unit and integration tests for:

* pagination
* authentication refresh
* filtering
* saved listings
* anomaly detection
* aggregate calculations
* project/listing consistency checks

### 6. Improve deployment observability

I would add error reporting, request monitoring and a small health/status panel so API failures and authentication issues can be diagnosed more easily after deployment.

---

# Submission

The repository contains:

* React frontend
* API integration
* investigation-driven fallbacks
* `submission.json`
* this README
* Git commit history showing development progress

Repository:

https://github.com/AyushmanRaj9507/ivy-homes-assignment
