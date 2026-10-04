<script setup lang="ts">
import { useCustomers } from '~/composables/useCustomers'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { get, update } = useCustomers()
const id = route.params.id as string

const form = reactive({ name: '', email: '', phone: '', address: '' })
const error = ref('')
const loading = ref(false)
const fetching = ref(true)

onMounted(async () => {
  try {
    const c = await get(id)
    form.name = c.name ?? ''
    form.email = c.email ?? ''
    form.phone = c.phone ?? ''
    form.address = c.address ?? ''
  }
  catch {
    error.value = 'Customer not found'
  }
  finally {
    fetching.value = false
  }
})

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await update(id, form)
    await router.push('/customers')
  }
  catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to update customer'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-lg">
    <div class="flex items-center gap-3 mb-6">
      <UButton to="/customers" icon="i-lucide-arrow-left" color="neutral" variant="ghost" />
      <h1 class="text-2xl font-bold">
        Edit Customer
      </h1>
    </div>

    <UCard>
      <div v-if="fetching" class="py-8 text-center text-muted">
        Loading…
      </div>

      <UForm v-else :state="form" class="space-y-4" @submit.prevent="submit">
        <UFormField label="Name *" name="name">
          <UInput v-model="form.name" placeholder="Full name" class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email">
          <UInput v-model="form.email" type="email" placeholder="customer@example.com" class="w-full" />
        </UFormField>

        <UFormField label="Phone" name="phone">
          <UInput v-model="form.phone" placeholder="+1 234 567 890" class="w-full" />
        </UFormField>

        <UFormField label="Address" name="address">
          <UTextarea v-model="form.address" placeholder="Street, City, Country" class="w-full" />
        </UFormField>

        <UAlert v-if="error" color="error" :description="error" />

        <div class="flex gap-2 justify-end">
          <UButton to="/customers" color="neutral" variant="ghost">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="loading">
            Save Changes
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>
