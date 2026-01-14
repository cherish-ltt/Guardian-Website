import { NextResponse } from 'next/server'
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/config'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TWO_FACTOR_SETUP}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    return NextResponse.json({ authenticated: response.ok })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}
