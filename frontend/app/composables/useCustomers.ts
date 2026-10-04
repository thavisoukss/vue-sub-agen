import { useAuthStore } from '~/stores/auth'

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export function useCustomers() {
  const store = useAuthStore()
  const config = useRuntimeConfig()

  function headers() {
    return { Authorization: `Bearer ${store.token}` }
  }

  async function list(): Promise<Customer[]> {
    return $fetch('/customers', {
      baseURL: config.public.apiBase,
      headers: headers(),
    })
  }

  async function get(id: string): Promise<Customer> {
    return $fetch(`/customers/${id}`, {
      baseURL: config.public.apiBase,
      headers: headers(),
    })
  }

  async function create(body: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    return $fetch('/customers', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: headers(),
      body,
    })
  }

  async function update(id: string, body: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) {
    return $fetch(`/customers/${id}`, {
      baseURL: config.public.apiBase,
      method: 'PUT',
      headers: headers(),
      body,
    })
  }

  async function remove(id: string) {
    return $fetch(`/customers/${id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: headers(),
    })
  }

  return { list, get, create, update, remove }
}
