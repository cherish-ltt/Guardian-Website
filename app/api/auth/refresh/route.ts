import { NextResponse } from 'next/server'
import { getRefreshToken, setAuthCookies } from '@/lib/cookies'
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/config'

interface RefreshResponse {
  code: number
  msg: string | null
  data: {
    access_token: string
    expires_in: number
  }
}

export async function POST(request: Request) {
  try {
    const refreshToken = await getRefreshToken()
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      )
    }
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Refresh token expired' },
          { status: 401 }
        )
      }
      throw new Error('Refresh failed')
    }
    
    const result: RefreshResponse = await response.json()
    
    if (result.code !== 200) {
      throw new Error(result.msg || 'Refresh failed')
    }
    
    await setAuthCookies({
      access_token: result.data.access_token,
      expires_in: result.data.expires_in,
    })
    
    return NextResponse.json({
      success: true,
      access_token: result.data.access_token,
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}
