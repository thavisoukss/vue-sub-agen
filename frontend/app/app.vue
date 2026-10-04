<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useAuth } from '~/composables/useAuth'

const store = useAuthStore()
store.loadFromStorage()

const { logout } = useAuth()

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  htmlAttrs: { lang: 'en' },
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="font-bold text-lg text-primary">
          CRM App
        </NuxtLink>
      </template>

      <template #right>
        <template v-if="store.isAuthenticated">
          <span class="text-sm text-muted mr-2">{{ store.email }}</span>
          <UButton color="neutral" variant="ghost" @click="logout">
            Logout
          </UButton>
        </template>
        <template v-else>
          <UButton to="/login" variant="ghost" color="neutral">Login</UButton>
          <UButton to="/register" color="primary">Register</UButton>
        </template>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
