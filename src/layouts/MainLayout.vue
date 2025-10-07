<template>
  <v-app>
    <!-- App Bar / Header -->
    <v-app-bar :elevation="2" color="#FFB74D" dark app clipped-left height="70">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-img
        src="/LogoViceversa.png"
        alt="Logo"
        max-height="120"
        max-width="180"
        contain
        class="ml-2"
      />

      <v-spacer></v-spacer>

      <!-- User Info -->
      <div class="d-flex align-center mr-4">
        <v-icon class="mr-2" color="#212121">mdi-account-circle</v-icon>
        <span class="user-name">{{ user?.nombre }}</span>
      </div>

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="goToProfile">
            <v-list-item-title>
              <v-icon class="mr-2">mdi-account</v-icon>
              Perfil
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <v-list-item-title class="text-error">
              <v-icon class="mr-2">mdi-logout</v-icon>
              Cerrar Sesión
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer / Sidebar -->
    <v-navigation-drawer v-model="drawer" app clipped permanent width="280" color="#f8f9fa">
      <v-list nav>
        <!-- Dashboard -->
        <v-list-item
          :class="{ 'v-list-item--active': $route.name === 'Dashboard' }"
          @click="$router.push('/dashboard')"
          rounded="xl"
          class="ma-2"
        >
          <template v-slot:prepend>
            <v-icon color="#FFA500 ">mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Gestión de Usuarios -->
        <v-list-item
          v-if="hasPermission('usuarios', 'ver')"
          :class="{ 'v-list-item--active': $route.path.includes('/usuarios') }"
          @click="$router.push('/usuarios')"
          rounded="xl"
          class="ma-2"
        >
          <template v-slot:prepend>
            <v-icon color="#FF8C00 ">mdi-account-group</v-icon>
          </template>
          <v-list-item-title>Gestión de Usuarios</v-list-item-title>
        </v-list-item>

        <!-- Gestión de Roles -->
        <v-list-item
          v-if="hasPermission('roles', 'ver')"
          :class="{ 'v-list-item--active': $route.path.includes('/roles') }"
          @click="$router.push('/roles')"
          rounded="xl"
          class="ma-2"
        >
          <template v-slot:prepend>
            <v-icon color="#FF8C00 ">mdi-shield-account</v-icon>
          </template>
          <v-list-item-title>Gestión de Roles</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Clientes -->
        <v-list-item
          v-if="hasPermission('clientes', 'ver')"
          :class="{ 'v-list-item--active': $route.path.includes('/clientes') }"
          @click="$router.push('/clientes')"
          rounded="xl"
          class="ma-2"
        >
          <template v-slot:prepend>
            <v-icon color="#FF8C00 ">mdi-domain</v-icon>
          </template>
          <v-list-item-title>Clientes</v-list-item-title>
        </v-list-item>

        <!-- Proyectos -->
        <v-list-item
          v-if="hasPermission('proyectos', 'ver')"
          :class="{ 'v-list-item--active': $route.path.includes('/proyectos') }"
          @click="$router.push('/proyectos')"
          rounded="xl"
          class="ma-2"
        >
          <template v-slot:prepend>
            <v-icon color="#FF8C00 ">mdi-briefcase</v-icon>
          </template>
          <v-list-item-title>Proyectos</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Actividades -->
        <v-list-item
          v-if="hasPermission('historial_actividades', 'ver')"
          :class="{ 'v-list-item--active': $route.path.includes('/actividades') }"
          @click="$router.push('/actividades')"
          rounded="xl"
          class="ma-2"
        >
          <template v-slot:prepend>
            <v-icon color="#FF8C00">mdi-history</v-icon>
          </template>
          <v-list-item-title>Actividades</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Footer -->
    <v-footer color="#FFB74D" dark app inset>
      <div class="d-flex w-100 align-center justify-space-between">
        <div class="d-flex align-center">
          <span class="mr-4"
            >&copy; {{ currentYear }} Viceversa. Todos los derechos reservados.</span
          >
          <v-btn text small @click="showAbout = true">Acerca de</v-btn>
          <v-btn text small href="#" target="_blank">Soporte</v-btn>
        </div>
        <div class="d-flex align-center">
          <span class="text-caption">Versión {{ appVersion }}</span>
        </div>
      </div>
    </v-footer>

    <!-- About Dialog -->
    <v-dialog v-model="showAbout" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h5">Acerca del Sistema</span>
        </v-card-title>
        <v-card-text>
          <div class="text-center mb-4">
            <v-img
              src="/LogoViceversa.png"
              alt="Logo Viceversa"
              max-height="150"
              max-width="250"
              contain
            />
          </div>
          <p><strong>Sistema de Gestión de Clientes y Proyectos</strong></p>
          <p>Versión: {{ appVersion }}</p>
          <p>Desarrollado por: Equipo Viceversa</p>
          <p>Una solución integral para la gestión empresarial.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="orange" @click="showAbout = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(true)
const showAbout = ref(false)
const currentYear = new Date().getFullYear()
const appVersion = '1.0.0'

const user = computed(() => authStore.user)

// Verificar permisos
function hasPermission(modulo: string, accion: string): boolean {
  if (!user.value?.permisos) return false

  return user.value.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function goToProfile() {
  router.push('/mi-perfil')
}

function logout() {
  authStore.logout()
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  router.push('/login')
}

// Cargar usuario si no está en el store
onMounted(() => {
  if (!user.value) {
    const storedUser = localStorage.getItem('auth_user')
    const storedToken = localStorage.getItem('auth_token')

    if (storedUser && storedToken) {
      authStore.setUser(JSON.parse(storedUser))
      authStore.setToken(storedToken)
    } else {
      router.push('/login')
    }
  }
})
</script>

<style scoped>
.user-name {
  font-weight: 500;
  font-size: 1rem;
  color: #212121 !important;
}

.v-list-item--active {
  background: linear-gradient(45deg, #ff8c00, #ffb74d) !important;
  color: white !important;
}

.v-list-item--active .v-icon {
  color: white !important;
}

.v-navigation-drawer {
  border-right: 1px solid #e0e0e0;
}

.v-list-item {
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background: rgba(255, 183, 77, 0.2);
}
</style>
