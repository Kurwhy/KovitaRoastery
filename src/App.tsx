import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import {
  PublicOnly,
  RequireAuth,
  RequireRole,
  RootRedirect,
} from './components/guards/RouteGuards'
import { LoginPage } from './pages/LoginPage'
import { KasirPage } from './pages/KasirPage'
import { RiwayatPage } from './pages/RiwayatPage'
import { KelolaMenuPage } from './pages/KelolaMenuPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/kasir" element={<KasirPage />} />
          <Route path="/riwayat" element={<RiwayatPage />} />
          <Route
            path="/menu"
            element={
              <RequireRole role="pemilik">
                <KelolaMenuPage />
              </RequireRole>
            }
          />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
