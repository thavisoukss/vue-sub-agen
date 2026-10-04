import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    email: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    setAuth(token: string, email: string) {
      this.token = token
      this.email = email
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_email', email)
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        this.token = localStorage.getItem('auth_token')
        this.email = localStorage.getItem('auth_email')
      }
    },

    logout() {
      this.token = null
      this.email = null
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_email')
      }
    },
  },
})
