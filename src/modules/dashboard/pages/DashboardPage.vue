<template>
  <div class="dashboard-container">
    <!-- Welcome Header -->
    <div class="welcome-section mb-6">
      <v-row align="center">
        <v-col cols="12" md="8">
          <h1 class="display-1 font-weight-bold mb-2">¡Bienvenido, {{ user?.nombre }}!</h1>
          <p class="text-h6 text-contraste">
            {{ getGreeting() }} Aquí tienes un resumen de tu sistema.
          </p>
        </v-col>
        <v-col cols="12" md="4" class="text-right">
          <div class="text-h6 font-weight-bold">{{ getCurrentDate() }}</div>
          <div class="text-body-1 text-contraste">{{ getCurrentTime() }}</div>
        </v-col>
      </v-row>
    </div>

    <!-- Loading State -->
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="#485696"
      class="mb-4"
    ></v-progress-linear>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <!-- Total Clientes -->
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stats-card" elevation="3" :loading="loading">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="56" color="#42A5F5" class="mr-4">
                <v-icon color="white" size="28">mdi-domain</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.totalClientes }}</div>
                <div class="text-body-2 text-grey-darken-1">Total Clientes</div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="$router.push('/clientes')"
              v-if="hasPermission('clientes', 'ver')"
            >
              Ver todos
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Proyectos Activos -->
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stats-card" elevation="3" :loading="loading">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="56" color="#66BB6A" class="mr-4">
                <v-icon color="white" size="28">mdi-briefcase</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.proyectosActivos }}</div>
                <div class="text-body-2 text-grey-darken-1">Proyectos Activos</div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn
              variant="text"
              color="success"
              size="small"
              @click="$router.push('/proyectos')"
              v-if="hasPermission('proyectos', 'ver')"
            >
              Ver todos
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Usuarios Registrados -->
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stats-card" elevation="3" :loading="loading">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="56" color="#FF7043" class="mr-4">
                <v-icon color="white" size="28">mdi-account-group</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.totalUsuarios }}</div>
                <div class="text-body-2 text-grey-darken-1">Usuarios Registrados</div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn
              variant="text"
              color="deep-orange"
              size="small"
              @click="$router.push('/usuarios')"
              v-if="hasPermission('usuarios', 'ver')"
            >
              Ver todos
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Ingresos del Mes -->
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stats-card" elevation="3" :loading="loading">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="56" color="#AB47BC" class="mr-4">
                <v-icon color="white" size="28">mdi-currency-usd</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold">
                  ${{ stats.ingresosMes.toLocaleString() }}
                </div>
                <div class="text-body-2 text-grey-darken-1">Ingresos del Mes</div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn
              variant="text"
              color="purple"
              size="small"
              @click="$router.push('/reportes')"
              v-if="hasPermission('reportes', 'ver')"
            >
              Ver reporte
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Proyectos Recientes -->
      <v-col cols="12" lg="8">
        <v-card elevation="3" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#485696">mdi-clock-outline</v-icon>
            Proyectos Recientes
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="projectHeaders"
              :items="recentProjects"
              :loading="loading"
              hide-default-footer
              class="elevation-0"
              no-data-text="No hay proyectos recientes"
            >
              <template v-slot:item.estado="{ item }">
                <v-chip :color="getStatusColor(item.estado)" size="small" variant="tonal">
                  {{ item.estado }}
                </v-chip>
              </template>
              <template v-slot:item.fechaCreacion="{ item }">
                {{ formatDate(item.fechaCreacion) }}
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions v-if="hasPermission('proyectos', 'ver')">
            <v-spacer></v-spacer>
            <v-btn variant="outlined" color="primary" @click="$router.push('/proyectos')">
              Ver todos los proyectos
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Panel de Actividad -->
      <v-col cols="12" lg="4">
        <v-card elevation="3" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#485696">mdi-timeline-outline</v-icon>
            Actividad Reciente
          </v-card-title>
          <v-card-text>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="activity in recentActivity"
                :key="activity.id"
                :dot-color="activity.color"
                size="small"
              >
                <div class="d-flex">
                  <strong class="me-4">{{ activity.titulo }}</strong>
                  <small>{{ activity.tiempo }}</small>
                </div>
                <div class="text-caption">{{ activity.descripcion }}</div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>

        <!-- Quick Actions -->
        <v-card elevation="3">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#485696">mdi-lightning-bolt</v-icon>
            Acciones Rápidas
          </v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-2">
              <v-btn
                v-if="hasPermission('clientes', 'crear')"
                block
                variant="outlined"
                color="primary"
                prepend-icon="mdi-plus"
                @click="$router.push('/clientes/nuevo')"
              >
                Nuevo Cliente
              </v-btn>
              <v-btn
                v-if="hasPermission('proyectos', 'crear')"
                block
                variant="outlined"
                color="success"
                prepend-icon="mdi-plus"
                @click="$router.push('/proyectos/nuevo')"
              >
                Nuevo Proyecto
              </v-btn>
              <v-btn
                v-if="hasPermission('usuarios', 'crear')"
                block
                variant="outlined"
                color="orange"
                prepend-icon="mdi-account-plus"
                @click="$router.push('/usuarios/nuevo')"
              >
                Nuevo Usuario
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Stats {
  totalClientes: number
  proyectosActivos: number
  totalUsuarios: number
  ingresosMes: number
}

interface Project {
  id: string
  nombre: string
  cliente: string
  estado: string
  fechaCreacion: string
}

interface Activity {
  id: string
  titulo: string
  descripcion: string
  tiempo: string
  color: string
}

const authStore = useAuthStore()
const loading = ref(true)
const currentTime = ref(new Date())

const user = computed(() => authStore.user)

// Mock data - reemplazar con llamadas a API reales
const stats = ref<Stats>({
  totalClientes: 0,
  proyectosActivos: 0,
  totalUsuarios: 0,
  ingresosMes: 0,
})

const recentProjects = ref<Project[]>([])
const recentActivity = ref<Activity[]>([])

const projectHeaders = [
  { title: 'Proyecto', value: 'nombre' },
  { title: 'Cliente', value: 'cliente' },
  { title: 'Estado', value: 'estado' },
  { title: 'Fecha', value: 'fechaCreacion' },
]

// Verificar permisos
function hasPermission(modulo: string, accion: string): boolean {
  if (!user.value?.permisos) return false
  return user.value.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días!'
  if (hour < 18) return 'Buenas tardes!'
  return 'Buenas noches!'
}

function getCurrentDate(): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

function getCurrentTime(): string {
  return currentTime.value.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    Activo: 'success',
    'En Progreso': 'warning',
    Completado: 'primary',
    Pausado: 'orange',
    Cancelado: 'error',
  }
  return colors[status] || 'grey'
}

// Simular carga de datos - reemplazar con llamadas a API reales
async function loadDashboardData() {
  loading.value = true

  try {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock data - reemplazar con datos reales de la API
    stats.value = {
      totalClientes: 45,
      proyectosActivos: 12,
      totalUsuarios: 8,
      ingresosMes: 125000,
    }

    recentProjects.value = [
      {
        id: '1',
        nombre: 'Sitio Web Corporativo',
        cliente: 'Empresa ABC',
        estado: 'En Progreso',
        fechaCreacion: '2024-08-20',
      },
      {
        id: '2',
        nombre: 'Sistema de Inventario',
        cliente: 'Comercial XYZ',
        estado: 'Activo',
        fechaCreacion: '2024-08-15',
      },
      {
        id: '3',
        nombre: 'App Móvil',
        cliente: 'Startup Tech',
        estado: 'Completado',
        fechaCreacion: '2024-08-10',
      },
    ]

    recentActivity.value = [
      {
        id: '1',
        titulo: 'Nuevo proyecto creado',
        descripcion: 'Sistema CRM para Cliente ABC',
        tiempo: 'Hace 2 horas',
        color: 'success',
      },
      {
        id: '2',
        titulo: 'Usuario registrado',
        descripcion: 'María González se unió al equipo',
        tiempo: 'Hace 5 horas',
        color: 'info',
      },
      {
        id: '3',
        titulo: 'Proyecto completado',
        descripcion: 'E-commerce finalizado exitosamente',
        tiempo: 'Hace 1 día',
        color: 'primary',
      },
      {
        id: '4',
        titulo: 'Cliente actualizado',
        descripcion: 'Información de Empresa XYZ modificada',
        tiempo: 'Hace 2 días',
        color: 'warning',
      },
    ]
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error)
  } finally {
    loading.value = false
  }
}

// Actualizar tiempo cada minuto
setInterval(() => {
  currentTime.value = new Date()
}, 60000)

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.welcome-section {
  padding: 2rem;
  background: linear-gradient(135deg, #ffb74d 0%, #ebb768 100%);
  color: #212121;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.stats-card {
  height: 100%;
  transition: transform 0.2s ease;
  border-radius: 12px;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.gap-2 > * + * {
  margin-top: 8px;
}

.v-card {
  border-radius: 12px;
}

.v-card-title {
  font-weight: 600;
  padding-bottom: 8px;
}

.display-1 {
  font-size: 2.5rem !important;
}

@media (max-width: 960px) {
  .dashboard-container {
    padding: 1rem;
  }

  .welcome-section {
    padding: 1.5rem;
    text-align: center;
  }

  .display-1 {
    font-size: 2rem !important;
  }
}
</style>
