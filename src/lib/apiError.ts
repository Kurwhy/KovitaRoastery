import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim() !== '') {
      return message
    }
  }
  return fallback
}

export function getFriendlyApiError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status === 401) return 'Sesi tidak valid. Silakan masuk kembali.'
    if (status === 403) return 'Akses ditolak.'
    if (status === 503) {
      return getApiErrorMessage(error, 'Layanan pembayaran belum tersedia.')
    }
    if (status && status >= 500) {
      return 'Terjadi kendala di server. Coba lagi.'
    }
  }

  return getApiErrorMessage(error, fallback)
}

export function getValidationErrors(error: unknown) {
  if (!axios.isAxiosError(error)) return {}
  const errors = error.response?.data?.errors
  if (!errors || typeof errors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(errors as Record<string, unknown>)
      .filter(([, value]) => Array.isArray(value) && value.length > 0)
      .map(([key, value]) => [key, value as string[]]),
  )
}
