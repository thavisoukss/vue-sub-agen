import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const store = useAuthStore()
  const config = useRuntimeConfig()
  const router = useRouter()

  async function register(email: string, password: string) {
    const data = await $fetch<{ access_token: string }>('/auth/register', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { email, password },
    })
    store.setAuth(data.access_token, email)
    await router.push('/customers')
  }

  async function login(email: string, password: string) {
    const data = await $fetch<{ access_token: string }>('/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { email, password },
    })
    store.setAuth(data.access_token, email)
    await router.push('/customers')
  }

  function logout() {
    store.logout()
    router.push('/login')
  }

  return { register, login, logout, store }
}
