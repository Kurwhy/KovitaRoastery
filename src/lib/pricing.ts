import type { Addon, CartItem } from '../types'

export const PB1_RATE = 0.1

export function addonTotal(addons: Addon[]) {
  return addons.reduce((total, addon) => total + addon.harga, 0)
}

export function cartItemUnitPrice(item: CartItem) {
  return item.hargaDasar + addonTotal(item.addons)
}

export function cartItemSubtotal(item: CartItem) {
  return cartItemUnitPrice(item) * item.qty
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + cartItemSubtotal(item), 0)
}

export function hitungPb1(subtotal: number) {
  return Math.round(subtotal * PB1_RATE)
}
