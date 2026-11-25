import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { roleLabel } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Wordmark } from '../ui/Wordmark'
import { Button } from '../ui/Button'
import { MobileGuard } from './MobileGuard'

const navigation = [
  { to: '/kasir', label: 'Kasir' },
  { to: '/riwayat', label: 'Riwayat' },
  { to: '/menu', label: 'Kelola Menu', ownerOnly: true },
]

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const user = useAuthStore((state) => state.user)
  const links = navigation.filter(
    (link) => !link.ownerOnly || user?.role === 'pemilik',
  )

  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        'items-center gap-1',
        mobile ? 'flex w-full' : 'hidden xl:flex',
      )}
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'inline-flex h-11 items-center rounded-lg px-3 text-label font-semibold transition-colors duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
              mobile && 'flex-1 justify-center',
              isActive
                ? 'bg-brand-500/10 text-brand-300'
                : 'text-muted hover:bg-white/[0.04] hover:text-ink active:bg-white/[0.08]',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <MobileGuard />
      <div className="hidden min-h-dvh flex-col md:flex">
        <header className="border-b border-line bg-slate">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 xl:px-6">
            <div className="flex items-center gap-6">
              <Wordmark className="text-xl" />
              <NavigationLinks />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right">
                <p className="text-label font-semibold text-ink">{user.nama}</p>
                <p className="text-label text-muted">{roleLabel(user.role)}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                loading={loggingOut}
                icon={<LogOut className="h-4 w-4" aria-hidden="true" />}
              >
                Keluar
              </Button>
            </div>

            <div className="order-last w-full border-t border-line/80 pt-2 xl:hidden">
              <NavigationLinks mobile />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </>
  )
}
