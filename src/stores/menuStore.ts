import { create } from 'zustand'
import { api } from '../lib/api'
import { mapMenuItem, type ApiMenuItem } from '../lib/apiMappers'
import type { Kategori, MenuItem } from '../types'

type AddMenuInput = {
  nama: string
  kategori: Kategori
  harga: number
  hasVarian: boolean
  isHabis: boolean
}

type MenuState = {
  items: MenuItem[]
  loading: boolean
  error: string | null
  loaded: boolean
  fetchMenu: (force?: boolean) => Promise<void>
  addMenu: (input: AddMenuInput) => Promise<MenuItem>
  updatePrice: (id: number, harga: number) => Promise<void>
  toggleHabis: (id: number) => Promise<void>
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  loaded: false,
  fetchMenu: async (force = false) => {
    if (get().loading) return
    if (!force && get().loaded) return

    set({ loading: true, error: null })
    try {
      const { data } = await api.get<{ data: ApiMenuItem[] }>('/menu')
      set({
        items: data.data.map(mapMenuItem),
        loading: false,
        loaded: true,
      })
    } catch {
      set({
        loading: false,
        error: 'Gagal memuat menu. Periksa koneksi lalu coba lagi.',
      })
    }
  },
  addMenu: async (input) => {
    const { data } = await api.post<{ data: ApiMenuItem }>('/menu', {
      nama: input.nama.trim(),
      kategori: input.kategori,
      harga: input.harga,
      has_varian: input.hasVarian,
      is_habis: input.isHabis,
    })
    const item = mapMenuItem(data.data)
    set((state) => ({
      items: [...state.items, item],
      loaded: true,
      error: null,
    }))
    return item
  },
  updatePrice: async (id, harga) => {
    const { data } = await api.patch<{ data: ApiMenuItem }>(`/menu/${id}`, {
      harga,
    })
    const item = mapMenuItem(data.data)
    set((state) => ({
      items: state.items.map((entry) =>
        entry.id === item.id ? item : entry,
      ),
    }))
  },
  toggleHabis: async (id) => {
    const current = get().items.find((item) => item.id === id)
    if (!current) return

    const { data } = await api.patch<{ data: ApiMenuItem }>(
      `/menu/${id}/status`,
      { is_habis: !current.isHabis },
    )
    const item = mapMenuItem(data.data)
    set((state) => ({
      items: state.items.map((entry) =>
        entry.id === item.id ? item : entry,
      ),
    }))
  },
}))
