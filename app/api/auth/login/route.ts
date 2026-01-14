import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/cookies'
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/config'
import type { LoginRequest, LoginResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const result = await response.json()
    
    if (result.code !== 200) {
      return NextResponse.json(result, { status: 400 })
    }
    
    const loginResponse: LoginResponse = {
      access_token: result.data.access_token,
      refresh_token: result.data.refresh_token,
      expires_in: result.data.expires_in,
    }
    
    await setAuthCookies(loginResponse)
    
    return NextResponse.json({
      success: true,
      data: loginResponse,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
