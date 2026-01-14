import 'server-only'
import { cookies } from 'next/headers'

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

export async function setAuthCookies(tokens: TokenResponse) {
  const cookieStore = await cookies()
  
  const accessTokenExpires = new Date(Date.now() + tokens.expires_in * 1000)
  const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: accessTokenExpires,
    path: '/',
  })
  
  if (tokens.refresh_token) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: refreshTokenExpires,
      path: '/',
    })
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
}
