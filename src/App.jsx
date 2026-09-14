import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import Rentals from './pages/Rentals'
import RentalDetail from './pages/RentalDetail'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Favourites from './pages/Favourites'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/listings" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:listingId" element={<ListingDetail />} />

          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/:listingId" element={<RentalDetail />} />

          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />

          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <Favourites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <h1 className="font-display text-3xl text-ivy-950">Page not found</h1>
                <p className="text-ivy-600 font-body mt-2">
                  That page doesn't exist. Try one of the links above.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="border-t hairline mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-ivy-500 font-body">
          Ivy Homes — property data sourced from the Ivy Homes Property API.
        </div>
      </footer>
    </div>
  )
}
