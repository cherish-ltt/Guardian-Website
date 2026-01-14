'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
    setIsChecking(false)
  }, [isAuthenticated, router])

  if (isChecking) {
    return fallback || null
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}
