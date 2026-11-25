import { create } from 'zustand'
import type { Addon, CartItem, MenuItem, Suhu, TakaranGula, TipePesanan } from '../types'

type AddItemOptions = {
  suhu: Suhu | null
  gula: TakaranGula | null
  addons: Addon[]
  catatan: string
}

type AddItemResult = 'added' | 'merged' | 'maxed' | 'full'

type CartState = {
  items: CartItem[]
  tipePesanan: TipePesanan
  nomorMeja: string
  pb1Aktif: boolean
  addItem: (menu: MenuItem, options?: AddItemOptions) => AddItemResult
  increment: (key: string) => void
  decrement: (key: string) => void
  removeItem: (key: string) => void
  setTipePesanan: (tipe: TipePesanan) => void
  setNomorMeja: (nomor: string) => void
  setPb1Aktif: (active: boolean) => void
  clearCart: () => void
  finishTransaction: () => void
}

function buildKey(menuItemId: number, options: AddItemOptions) {
  const addonIds = [...options.addons]
    .map((addon) => addon.id)
    .sort((a, b) => a - b)
    .join(',')
  return [
    menuItemId,
    options.suhu ?? '',
    options.gula ?? '',
    addonIds,
    options.catatan.trim(),
  ].join('|')
}

const defaultOptions: AddItemOptions = {
  suhu: null,
  gula: null,
  addons: [],
  catatan: '',
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  tipePesanan: 'takeaway',
  nomorMeja: '',
  pb1Aktif: true,
  addItem: (menu, options = defaultOptions) => {
    const normalized: AddItemOptions = {
      suhu: menu.hasVarian ? options.suhu : null,
      gula: menu.hasVarian ? (options.gula ?? 'normal') : null,
      addons: menu.hasVarian ? options.addons : [],
      catatan: options.catatan.slice(0, 150).trim(),
    }
    const key = buildKey(menu.id, normalized)
    let result: AddItemResult = 'added'

    set((state) => {
      const existing = state.items.find((item) => item.key === key)
      if (existing) {
        if (existing.qty >= 99) {
          result = 'maxed'
          return state
        }
        result = 'merged'
        return {
          items: state.items.map((item) =>
            item.key === key ? { ...item, qty: item.qty + 1 } : item,
          ),
        }
      }

      if (state.items.length >= 50) {
        result = 'full'
        return state
      }

      const newItem: CartItem = {
        key,
        menuItemId: menu.id,
        namaMenu: menu.nama,
        kategori: menu.kategori,
        hargaDasar: menu.harga,
        suhu: normalized.suhu,
        gula: normalized.gula,
        addons: normalized.addons,
        catatan: normalized.catatan,
        qty: 1,
      }

      return { items: [...state.items, newItem] }
    })

    return result
  },
  increment: (key) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.key === key ? { ...item, qty: Math.min(99, item.qty + 1) } : item,
      ),
    }))
  },
  decrement: (key) => {
    set((state) => {
      const found = state.items.find((item) => item.key === key)
      if (!found) return state
      if (found.qty <= 1) {
        return { items: state.items.filter((item) => item.key !== key) }
      }
      return {
        items: state.items.map((item) =>
          item.key === key ? { ...item, qty: item.qty - 1 } : item,
        ),
      }
    })
  },
  removeItem: (key) => {
    set((state) => ({ items: state.items.filter((item) => item.key !== key) }))
  },
  setTipePesanan: (tipe) => {
    set((state) => ({
      tipePesanan: tipe,
      nomorMeja: tipe === 'takeaway' ? '' : state.nomorMeja,
    }))
  },
  setNomorMeja: (nomor) => {
    set({ nomorMeja: nomor.replace(/\D/g, '').slice(0, 2) })
  },
  setPb1Aktif: (active) => {
    set({ pb1Aktif: active })
  },
  clearCart: () => {
    set({ items: [] })
  },
  finishTransaction: () => {
    set({
      items: [],
      tipePesanan: 'takeaway',
      nomorMeja: '',
      pb1Aktif: true,
    })
  },
}))
