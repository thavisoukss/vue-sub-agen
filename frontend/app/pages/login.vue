<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: false })

const { login } = useAuth()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await login(form.email, form.password)
  }
  catch (e: any) {
    error.value = e?.data?.message ?? 'Login failed'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UApp>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <UCard class="w-full max-w-md">
        <template #header>
          <h1 class="text-2xl font-bold text-center">
            Sign In
          </h1>
        </template>

        <UForm :state="form" class="space-y-4" @submit.prevent="submit">
          <UFormField label="Email" name="email">
            <UInput v-model="form.email" type="email" placeholder="you@example.com" class="w-full" />
          </UFormField>

          <UFormField label="Password" name="password">
            <UInput v-model="form.password" type="password" placeholder="••••••••" class="w-full" />
          </UFormField>

          <UAlert v-if="error" color="error" :description="error" />

          <UButton type="submit" color="primary" class="w-full justify-center" :loading="loading">
            Sign In
          </UButton>
        </UForm>

        <template #footer>
          <p class="text-center text-sm text-muted">
            Don't have an account?
            <NuxtLink to="/register" class="text-primary font-medium">Register</NuxtLink>
          </p>
        </template>
      </UCard>
    </div>
  </UApp>
</template>
