import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert, LogIn } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import logoLogin from '../img/logo/logo_kovita_login.png'
import { useAuthStore } from '../stores/authStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

type FormErrors = {
  email?: string
  password?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  useDocumentTitle('Masuk')

  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const nextErrors: FormErrors = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      nextErrors.email = 'Email wajib diisi.'
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = 'Masukkan alamat email yang valid.'
    } else if (trimmedEmail.length > 120) {
      nextErrors.email = 'Email maksimal 120 karakter.'
    }

    if (!password) {
      nextErrors.password = 'Kata sandi wajib diisi.'
    } else if (password.length < 8) {
      nextErrors.password = 'Kata sandi minimal 8 karakter.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    const result = await login(email, password)

    if (!result.success) {
      setLoading(false)
      if (result.reason === 'invalid') {
        setFormError('Email atau kata sandi salah')
      } else if (result.reason === 'throttled') {
        setFormError('Terlalu banyak percobaan masuk. Coba lagi dalam satu menit.')
      } else {
        setFormError('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.')
      }
      return
    }

    navigate('/kasir', { replace: true })
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src={logoLogin}
            alt="Kovita Roastery"
            width={512}
            height={512}
            className="mx-auto w-full max-w-[300px]"
          />
          <p className="mt-2 text-label text-muted">
            Layar kasir dan operasional Kovita Roastery
          </p>
        </div>

        <section className="rounded-xl border border-line bg-slate p-6 sm:p-8">
          <h1 className="text-display text-ink">Masuk</h1>
          <p className="mt-2 max-w-[38ch] text-body leading-relaxed text-muted">
            Gunakan akun kasir atau pemilik untuk membuka layar transaksi.
          </p>

          {formError && (
            <div
              className="mt-6 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-label text-danger-soft"
              role="alert"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{formError}</p>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="nama@kovita.test"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
              }}
              error={errors.email}
              disabled={loading}
              maxLength={120}
            />

            <Input
              label="Kata sandi"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (errors.password) {
                  setErrors((current) => ({ ...current, password: undefined }))
                }
              }}
              error={errors.password}
              disabled={loading}
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading}
              icon={<LogIn className="h-5 w-5" aria-hidden="true" />}
            >
              {loading ? 'Memeriksa akun' : 'Masuk'}
            </Button>
          </form>
        </section>

        <p className="mt-6 text-center text-label text-muted">
          Akses internal. Hubungi pemilik jika akun belum aktif.
        </p>
      </div>
    </main>
  )
}
