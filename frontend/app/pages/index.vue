<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const store = useAuthStore()
store.loadFromStorage()

if (store.isAuthenticated) {
  navigateTo('/customers')
} else {
  navigateTo('/login')
}
</script>

<template>
  <div />
</template>
