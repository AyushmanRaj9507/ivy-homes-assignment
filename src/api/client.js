import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solve.ivy.homes'
const API_KEY = import.meta.env.VITE_API_KEY

const TOKENS_KEY = 'ivyhomes_tokens' // { access_token, refresh_token, expires_at }

export function getStoredTokens() {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeTokens(tokenResponse) {
  const { access_token, refresh_token, expires_in } = tokenResponse
  const payload = {
    access_token,
    refresh_token,
    // expires_in is seconds from issuance; keep a little safety margin
    expires_at: Date.now() + (expires_in ?? 900) * 1000 - 5000
  }
  localStorage.setItem(TOKENS_KEY, JSON.stringify(payload))
  return payload
}

export function clearTokens() {
  localStorage.removeItem(TOKENS_KEY)
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-Key': API_KEY
  }
})

// Attach the current access token on every request.
client.interceptors.request.use((config) => {
  const tokens = getStoredTokens()
  if (tokens?.access_token) {
    config.headers.Authorization = `Bearer ${tokens.access_token}`
  }
  return config
})

// Queue concurrent requests while a single refresh is in flight, so we
// don't fire the refresh endpoint multiple times for one expiry.
let refreshPromise = null

async function performRefresh() {
  const tokens = getStoredTokens()
  if (!tokens?.refresh_token) throw new Error('No refresh token available')

  // Use a bare axios call (not `client`) to avoid recursive interceptors.
  const res = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refresh_token: tokens.refresh_token },
    { headers: { 'X-API-Key': API_KEY } }
  )
  return storeTokens(res.data)
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error
    if (response?.status === 401 && !config._retried && getStoredTokens()?.refresh_token) {
      config._retried = true
      try {
        if (!refreshPromise) {
          refreshPromise = performRefresh().finally(() => {
            refreshPromise = null
          })
        }
        const newTokens = await refreshPromise
        config.headers.Authorization = `Bearer ${newTokens.access_token}`
        return client(config)
      } catch (refreshError) {
        clearTokens()
        window.dispatchEvent(new CustomEvent('ivyhomes:session-expired'))
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export { API_BASE_URL }
export default client
