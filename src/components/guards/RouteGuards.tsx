import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { Role } from '../../types'

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  if (user) return <Navigate to="/kasir" replace />
  return <>{children}</>
}

export function RequireRole({
  role,
  children,
}: {
  role: Role
  children: ReactNode
}) {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to="/kasir" replace state={{ accessDenied: true }} />
  }
  return <>{children}</>
}

export function RootRedirect() {
  const user = useAuthStore((state) => state.user)
  return <Navigate to={user ? '/kasir' : '/login'} replace />
}
