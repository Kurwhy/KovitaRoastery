import { create } from 'zustand'
import { api } from '../lib/api'
import { mapAddon, type ApiAddon } from '../lib/apiMappers'
import type { Addon } from '../types'

type AddonState = {
  items: Addon[]
  loading: boolean
  error: string | null
  loaded: boolean
  fetchAddons: (force?: boolean) => Promise<void>
}

export const useAddonStore = create<AddonState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  loaded: false,
  fetchAddons: async (force = false) => {
    if (get().loading) return
    if (!force && get().loaded) return

    set({ loading: true, error: null })
    try {
      const { data } = await api.get<{ data: ApiAddon[] }>('/addons')
      set({
        items: data.data.map(mapAddon),
        loading: false,
        loaded: true,
      })
    } catch {
      set({
        loading: false,
        error: 'Gagal memuat add-on. Periksa koneksi lalu coba lagi.',
      })
    }
  },
}))
