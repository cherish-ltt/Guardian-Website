import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'
import { clearAuthCookies, getRefreshToken } from '@/lib/cookies'
 
export async function POST() {
  try {
    const refreshToken = await getRefreshToken()
    
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      })
    }
    
    await clearAuthCookies()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    await clearAuthCookies()
    return NextResponse.json({ success: true })
  }
}
