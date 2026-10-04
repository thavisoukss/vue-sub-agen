import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const store = useAuthStore()
  store.loadFromStorage()
  if (!store.isAuthenticated) {
    return navigateTo('/login')
  }
})
