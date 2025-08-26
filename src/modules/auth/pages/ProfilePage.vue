<template>
  <div class="profile-container" v-if="user">
    <div class="profile-header">
      <div>
        <h2>Perfil de usuario</h2>
        <span v-if="user" class="user-name">{{ user.nombre }}</span>
      </div>
      <button class="logout-btn" @click="logout">Cerrar sesión</button>
    </div>
    <div class="profile-info">
      <p><strong>Nombre:</strong> {{ user.nombre }}</p>
      <p><strong>Correo:</strong> {{ user.correo }}</p>
      <p><strong>Rol:</strong> {{ user.rol }}</p>
      <div>
        <strong>Permisos:</strong>
        <ul>
          <li v-for="permiso in user.permisos" :key="permiso.modulo + '-' + permiso.accion">
            {{ permiso.modulo }} - {{ permiso.accion }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else>
    <p v-if="error" style="color: #e74c3c; text-align: center">{{ error }}</p>
    <p v-else>Cargando perfil...</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { getProfile } from '../services/auth.service'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const error = ref('')

function logout() {
  authStore.logout()
  localStorage.removeItem('auth_token')
  window.location.href = '/login'
}

onMounted(async () => {
  // Si no hay usuario en el store, intenta cargarlo usando el token de localStorage
  if (!authStore.user) {
    const token = authStore.token || localStorage.getItem('auth_token')
    if (token) {
      try {
        const perfil = await getProfile(token)
        authStore.setUser(perfil)
      } catch (e) {
        error.value = 'No se pudo cargar el perfil.'
      }
    } else {
      error.value = 'No hay sesión activa.'
    }
  }
})
</script>

<style scoped>
.profile-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 2rem;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  color: #2c3e50;
  font-size: 1.1rem;
}
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.profile-header h2 {
  color: #42b983;
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
}
.user-name {
  display: block;
  margin-top: 0.3rem;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
}
.logout-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #c0392b;
}
.profile-info p {
  margin-bottom: 0.7rem;
  color: #222;
}
.profile-info ul {
  margin: 0.7rem 0 0 1rem;
  padding: 0;
}
.profile-info li {
  color: #444;
  margin-bottom: 0.3rem;
  font-size: 1rem;
}
</style>
