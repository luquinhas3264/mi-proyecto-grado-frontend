<template>
  <v-app>
    <v-main class="login-bg">
      <v-container class="d-flex align-center justify-center fill-height">
        <v-card class="login-card" elevation="10" rounded="xl">
          <v-card-title class="d-flex flex-column align-center pb-0">
            <v-img
              src="/LogoViceversa.png"
              alt="Logo Viceversa"
              width="330"
              height="100"
              class="mb-2 login-logo"
              cover
            />
            <span class="login-title">Iniciar sesión</span>
            <span class="login-subtitle"> Ingresa tus credenciales para acceder a tu cuenta </span>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="onSubmit" validate-on="submit">
              <!-- Email -->
              <v-text-field
                v-model="form.correo"
                label="Correo electrónico"
                type="email"
                required
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="#485696"
                class="mb-4 login-input"
                autocomplete="username"
                :rules="[rules.required, rules.email]"
              />

              <!-- Password -->
              <v-text-field
                v-model="form.contraseña"
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                required
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="togglePassword"
                variant="outlined"
                color="#485696"
                class="mb-4 login-input"
                autocomplete="current-password"
                :rules="[rules.required, rules.minLength]"
              />

              <!-- Botón -->
              <v-btn
                type="submit"
                color="#485696"
                size="large"
                block
                :loading="loading"
                class="mb-2 login-btn"
                elevation="2"
              >
                Entrar
              </v-btn>

              <!-- Error -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mt-2"
                border="start"
                prominent
              >
                {{ error }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { login } from '../services/auth.service'
import type { LoginDto } from '../dto/login.dto'
import router from '@/router'

const form = ref<LoginDto>({ correo: '', contraseña: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const authStore = useAuthStore()

const rules = {
  required: (value: string) => !!value || 'Campo obligatorio',
  email: (value: string) => /^\S+@\S+\.\S+$/.test(value) || 'Correo inválido',
  minLength: (value: string) => value.length >= 8 || 'Mínimo 8 caracteres',
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await login(form.value)
    authStore.setToken(res.accessToken)
    authStore.setUser(res.usuario)
    localStorage.setItem('auth_token', res.accessToken)
    localStorage.setItem('auth_user', JSON.stringify(res.usuario))
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Credenciales inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: #f5f6fa;
}

.login-card {
  max-width: 500px;
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.12);
  background: #f9c784;
  padding: 32px 24px;
}

.login-title {
  font-size: 2rem;
  font-weight: 900;
  color: #485696;
  margin-top: 8px;
  letter-spacing: 0.5px;
  text-align: center;
}

.login-subtitle {
  font-size: 1rem;
  color: #485696cc;
  font-weight: 500;
  margin-bottom: 24px;
  text-align: center;
}

.login-logo {
  border-radius: 12px;
}

.login-input :deep(.v-field),
.login-input :deep(.v-field__prepend-inner),
.login-input :deep(.v-field__input) {
  background: #fff !important;
  border-radius: 8px;
}

.login-btn {
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}
</style>
