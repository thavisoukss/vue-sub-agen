<script setup lang="ts">
import type { Customer } from '~/composables/useCustomers'
import { useCustomers } from '~/composables/useCustomers'

definePageMeta({ middleware: 'auth' })

const { list, remove } = useCustomers()
const customers = ref<Customer[]>([])
const loading = ref(true)
const deleteTarget = ref<string | null>(null)
const showConfirm = ref(false)

async function loadCustomers() {
  loading.value = true
  try {
    customers.value = await list()
  }
  finally {
    loading.value = false
  }
}

function confirmDelete(id: string) {
  deleteTarget.value = id
  showConfirm.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  await remove(deleteTarget.value)
  showConfirm.value = false
  deleteTarget.value = null
  await loadCustomers()
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'actions', label: '' },
]

onMounted(loadCustomers)
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Customers
      </h1>
      <UButton to="/customers/create" icon="i-lucide-plus" color="primary">
        Add Customer
      </UButton>
    </div>

    <UCard>
      <UTable :rows="customers" :columns="columns" :loading="loading">
        <template #actions-data="{ row }">
          <div class="flex gap-2 justify-end">
            <UButton :to="`/customers/${row.id}/edit`" icon="i-lucide-pencil" color="neutral" variant="ghost" size="sm" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" @click="confirmDelete(row.id)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="showConfirm" title="Delete Customer">
      <template #body>
        <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
      </template>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton color="neutral" variant="ghost" @click="showConfirm = false">
            Cancel
          </UButton>
          <UButton color="error" @click="doDelete">
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
