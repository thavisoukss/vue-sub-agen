<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: false })

const { register } = useAuth()

const form = reactive({ email: '', password: '', confirm: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  if (form.password !== form.confirm) {
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  try {
    await register(form.email, form.password)
  }
  catch (e: any) {
    error.value = e?.data?.message ?? 'Registration failed'
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
            Create Account
          </h1>
        </template>

        <UForm :state="form" class="space-y-4" @submit.prevent="submit">
          <UFormField label="Email" name="email">
            <UInput v-model="form.email" type="email" placeholder="you@example.com" class="w-full" />
          </UFormField>

          <UFormField label="Password" name="password">
            <UInput v-model="form.password" type="password" placeholder="Min. 6 characters" class="w-full" />
          </UFormField>

          <UFormField label="Confirm Password" name="confirm">
            <UInput v-model="form.confirm" type="password" placeholder="Repeat password" class="w-full" />
          </UFormField>

          <UAlert v-if="error" color="error" :description="error" />

          <UButton type="submit" color="primary" class="w-full justify-center" :loading="loading">
            Register
          </UButton>
        </UForm>

        <template #footer>
          <p class="text-center text-sm text-muted">
            Already have an account?
            <NuxtLink to="/login" class="text-primary font-medium">Sign in</NuxtLink>
          </p>
        </template>
      </UCard>
    </div>
  </UApp>
</template>
