<template>
  <v-app>
    <v-main class="error-bg">
      <v-container class="d-flex align-center justify-center fill-height">
        <div class="text-center">
          <div class="error-code mb-4">404</div>
          <h2 class="text-h4 mb-4">Página no encontrada</h2>
          <p class="text-h6 mb-6 text-grey-darken-1">
            Lo sentimos, la página que estás buscando no existe.
          </p>
          <v-btn color="#485696" size="large" @click="goHome" prepend-icon="mdi-home">
            Volver al Dashboard
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  const token = localStorage.getItem('auth_token')
  router.push(token ? '/dashboard' : '/login')
}
</script>

<style scoped>
.error-bg {
  background: linear-gradient(135deg, #f5f6fa 0%, #e3e8f0 100%);
  min-height: 100vh;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: #485696;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .error-code {
    font-size: 6rem;
  }
}
</style>
