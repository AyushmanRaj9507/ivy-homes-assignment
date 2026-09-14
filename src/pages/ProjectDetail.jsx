import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProject } from '../api/projects'
import { formatINR, formatArea, titleCase, formatDate } from '../utils/format'

function Fact({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="border-t hairline py-2.5 flex items-center justify-between text-sm font-body">
      <span className="text-ivy-600">{label}</span>
      <span className="text-ivy-950">{value}</span>
    </div>
  )
}

export default function ProjectDetail() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getProject(projectId)
      .then((data) => !cancelled && setProject(data))
      .catch((err) => !cancelled && setError(err?.response?.data?.detail || 'This project could not be loaded.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [projectId])

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-ivy-500 font-body text-sm">Loading…</div>
  if (error) return <div className="max-w-4xl mx-auto px-6 py-20 text-clay font-body text-sm">{error}</div>
  if (!project) return null

  const priceInverted = project.price_min != null && project.price_max != null && project.price_min > project.price_max

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/projects" className="text-sm font-body text-ivy-600 hover:text-ivy-950">
        ← Back to projects
      </Link>

      <h1 className="font-display text-3xl text-ivy-950 mt-4">{project.apartment_name}</h1>
      <p className="text-ivy-600 font-body mt-1">
        {titleCase(project.locality)} · Developed by {project.developer_name}
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-ivy-950 num">
              {formatINR(project.price_min)} – {formatINR(project.price_max)}
            </span>
          </div>
          {priceInverted && (
            <div className="mt-2 border border-clay text-clay text-sm font-body px-3 py-2">
              This project's source data reports a minimum price higher than its maximum price. Shown
              as-is rather than silently corrected.
            </div>
          )}

          {project.amenities?.length > 0 && (
            <>
              <h2 className="font-display text-xl text-ivy-950 mt-8 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {project.amenities.map((a) => (
                  <span key={a} className="px-2.5 py-1 border hairline text-sm font-body text-ivy-800 capitalize">
                    {a}
                  </span>
                ))}
              </div>
            </>
          )}

          <h2 className="font-display text-xl text-ivy-950 mt-8 mb-2">Project details</h2>
          <div>
            <Fact label="Status" value={titleCase(project.project_status)} />
            <Fact label="Total units" value={project.total_units} />
            <Fact label="Total towers" value={project.total_towers} />
            <Fact label="Total floors" value={project.total_floors} />
            <Fact label="Area range" value={project.min_area_sqft ? `${formatArea(project.min_area_sqft)} – ${formatArea(project.max_area_sqft)}` : null} />
            <Fact label="Launch date" value={formatDate(project.launch_date)} />
            <Fact label="Possession date" value={formatDate(project.possession_date)} />
            <Fact label="RERA number" value={project.rera_number} />
            <Fact label="Listings reported by API" value={project.total_listings} />
          </div>

          <div className="mt-6 border hairline bg-paper-dim p-4 text-sm font-body text-ivy-700">
            Note: the listings API's <span className="num">project_id</span> filter does not reliably
            filter by project in the running service, so matching sale listings can't be shown here
            with confidence. Try{' '}
            <Link to={`/listings?locality=${encodeURIComponent(project.locality)}`} className="text-ivy-900 underline underline-offset-2">
              browsing listings in {titleCase(project.locality)}
            </Link>{' '}
            instead.
          </div>
        </div>

        <aside>
          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noreferrer"
              className="block border hairline p-4 text-sm font-body text-ivy-800 hover:bg-ivy-100 transition-colors"
            >
              View project page →
            </a>
          )}
        </aside>
      </div>
    </div>
  )
}
