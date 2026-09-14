import client, { storeTokens, clearTokens } from './client'

export async function login(email, password) {
  const res = await client.post('/auth/login', { email, password })
  const tokens = storeTokens(res.data)
  return { tokens, user: res.data.user ?? { email } }
}

export async function logout() {
  try {
    await client.post('/auth/logout')
  } catch {
    // The API documents logout as best-effort/stateless; clear locally regardless.
  } finally {
    clearTokens()
  }
}
