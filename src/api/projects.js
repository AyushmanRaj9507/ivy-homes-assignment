import client from './client'

export async function getProjects({
  offset = 0,
  limit = 50,
  locality,
  project_status,
  sort_by,
  order
} = {}) {
  const params = { offset, limit }
  if (locality) params.locality = locality
  if (project_status) params.project_status = project_status
  if (sort_by) params.sort_by = sort_by
  if (order) params.order = order

  const res = await client.get('/v1/projects', { params })
  return res.data
}

export async function getProject(projectId) {
  const res = await client.get(`/v1/projects/${encodeURIComponent(projectId)}`)
  return res.data
}
