import axios from 'axios'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { api } from '../lib/api'
import { setApiToken } from '../lib/apiToken'
import type { User } from '../types'

export type LoginResult =
  | { success: true }
  | { success: false; reason: 'invalid' | 'throttled' | 'network' }

type AuthState = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        try {
          const { data } = await api.post<{ token: string; user: User }>(
            '/auth/login',
            {
              email: email.trim().toLowerCase(),
              password,
            },
          )

          set({ user: data.user, token: data.token })
          setApiToken(data.token)
          return { success: true }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401 || error.response?.status === 422) {
              return { success: false, reason: 'invalid' }
            }
            if (error.response?.status === 429) {
              return { success: false, reason: 'throttled' }
            }
          }

          return { success: false, reason: 'network' }
        }
      },
      logout: async () => {
        try {
          if (get().token) {
            await api.post('/auth/logout')
          }
        } finally {
          set({ user: null, token: null })
          setApiToken(null)
        }
      },
    }),
    {
      name: 'kovita-auth-v2',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        setApiToken(state?.token ?? null)
      },
    },
  ),
)
