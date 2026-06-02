'use client'

import { useSession } from 'next-auth/react'
import type { Role } from '@/generated/prisma/client'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.role === 'ADMIN',
    role: session?.user?.role as Role | undefined
  }
}
