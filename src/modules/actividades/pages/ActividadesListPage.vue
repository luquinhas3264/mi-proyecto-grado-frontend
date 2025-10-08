<template>
  <div class="actividades-container">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Historial de Actividades</h1>
          <p class="text-subtitle-1 text-contraste">
            Registro completo de todas las acciones del sistema
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="primary" class="mr-3">
                <v-icon color="white">mdi-history</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalActividades }}</div>
                <div class="text-caption text-grey-darken-1">Total Actividades</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="success" class="mr-3">
                <v-icon color="white">mdi-account-group</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ estadisticas.usuariosUnicos }}</div>
                <div class="text-caption text-grey-darken-1">Usuarios Activos</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="info" class="mr-3">
                <v-icon color="white">mdi-domain</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ estadisticas.clientesUnicos }}</div>
                <div class="text-caption text-grey-darken-1">Clientes Involucrados</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="warning" class="mr-3">
                <v-icon color="white">mdi-briefcase</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ estadisticas.proyectosUnicos }}</div>
                <div class="text-caption text-grey-darken-1">Proyectos</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros y Búsqueda -->
    <ActividadesFiltros
      v-model="busqueda"
      @aplicar-filtros="aplicarFiltros"
      @limpiar-filtros="limpiarFiltros"
      class="mb-4"
    />

    <!-- Tabla de Actividades -->
    <v-card elevation="3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#485696">mdi-history</v-icon>
        Registro de Actividades
        <v-spacer />
        <v-chip color="primary" variant="tonal">
          {{ actividadesFiltradas.length }} registros
        </v-chip>
      </v-card-title>

      <v-data-table
        v-model:page="pagina"
        :headers="headers"
        :items="actividadesFiltradas"
        :loading="loading"
        :items-per-page="itemsPorPagina"
        class="elevation-0"
        loading-text="Cargando actividades..."
        no-data-text="No hay actividades disponibles"
      >
        <!-- Fecha -->
        <template v-slot:item.fecha="{ item }">
          <div>
            <div class="font-weight-medium">{{ formatearFecha(item.fecha) }}</div>
            <div class="text-caption text-grey-darken-1">{{ formatearHora(item.fecha) }}</div>
          </div>
        </template>

        <!-- Tipo con icono y color -->
        <template v-slot:item.tipo="{ item }">
          <v-chip :color="getTipoColor(item.tipo)" variant="tonal" size="small">
            <v-icon start>{{ getTipoIcon(item.tipo) }}</v-icon>
            {{ getTipoLabel(item.tipo) }}
          </v-chip>
        </template>

        <!-- Descripción -->
        <template v-slot:item.descripcion="{ item }">
          <div class="descripcion-cell">{{ item.descripcion }}</div>
        </template>

        <!-- Usuario -->
        <template v-slot:item.usuario="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="#485696" class="mr-2">
              <v-icon color="white" size="small">mdi-account</v-icon>
            </v-avatar>
            <span>{{ item.usuario?.nombre || 'Usuario desconocido' }}</span>
          </div>
        </template>

        <!-- Acciones -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="Ver detalles">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="verActividad(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Editar actividad">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('historial_actividades', 'editar')"
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editarActividad(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Eliminar actividad">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('historial_actividades', 'eliminar')"
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmarEliminacion(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog Ver Actividad -->
    <ActividadViewDialog
      v-model="mostrarDialogoVer"
      :actividad="actividadSeleccionada"
      @editar-actividad="editarActividad"
      @eliminar-actividad="confirmarEliminacion"
    />

    <!-- Dialog Editar Actividad -->
    <ActividadEditDialog
      v-model="mostrarDialogoEditar"
      :actividad="actividadSeleccionada"
      @actividad-actualizada="onActividadActualizada"
    />

    <!-- Dialog Confirmación Eliminación -->
    <v-dialog v-model="mostrarConfirmacionEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-error">
          <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          <p>¿Estás seguro de que deseas eliminar esta actividad?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Esta acción no se puede deshacer. El registro se eliminará permanentemente del
            historial.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="mostrarConfirmacionEliminar = false"> Cancelar </v-btn>
          <v-btn color="error" @click="eliminarActividad" :loading="loadingEliminar">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useActividadesStore } from '../store/actividades.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type {
  Actividad,
  FilterActividadDto,
  TipoActividad,
} from '../interfaces/actividad.interface'
import {
  TipoActividadLabels,
  TipoActividadIcons,
  TipoActividadColors,
} from '../interfaces/actividad.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'
import ActividadesFiltros from '../components/ActividadesFiltros.vue'
import ActividadViewDialog from '../components/ActividadViewDialog.vue'
import ActividadEditDialog from '../components/ActividadEditDialog.vue'

const actividadesStore = useActividadesStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)
const loadingEliminar = ref(false)

// Dialogs
const mostrarDialogoVer = ref(false)
const mostrarDialogoEditar = ref(false)
const mostrarConfirmacionEliminar = ref(false)
const actividadSeleccionada = ref<Actividad | null>(null)
const actividadAEliminar = ref<Actividad | null>(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const loading = computed(() => actividadesStore.loading)
const actividades = computed(() => actividadesStore.actividades)
const totalActividades = computed(() => actividadesStore.totalActividades)
const estadisticas = computed(() => actividadesStore.estadisticas)

// Headers de la tabla
const headers = [
  { title: 'Fecha', key: 'fecha', sortable: true, width: 180 },
  { title: 'Tipo', key: 'tipo', sortable: true, width: 200 },
  { title: 'Descripción', key: 'descripcion', sortable: false },
  { title: 'Usuario', key: 'usuario', sortable: false, width: 200 },
  { title: 'Acciones', key: 'actions', sortable: false, width: 150 },
]

// Actividades filtradas por búsqueda
const actividadesFiltradas = computed(() => {
  let resultado = actividades.value

  // Filtrar por búsqueda en descripción
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter((a) => a.descripcion.toLowerCase().includes(termino))
  }

  return resultado
})

// Verificar permisos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

// Métodos de formateo
function formatearFecha(fecha: string): string {
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return fecha.split(' ')[0]
  }
}

function formatearHora(fecha: string): string {
  try {
    const date = new Date(fecha)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return fecha.split(' ')[1]
  }
}

function getTipoLabel(tipo: TipoActividad): string {
  return TipoActividadLabels[tipo]
}

function getTipoIcon(tipo: TipoActividad): string {
  return TipoActividadIcons[tipo]
}

function getTipoColor(tipo: TipoActividad): string {
  return TipoActividadColors[tipo]
}

// Acciones
function verActividad(actividad: Actividad) {
  actividadSeleccionada.value = actividad
  mostrarDialogoVer.value = true
}

function editarActividad(actividad: Actividad) {
  actividadSeleccionada.value = actividad
  mostrarDialogoEditar.value = true
}

function confirmarEliminacion(actividad: Actividad) {
  actividadAEliminar.value = actividad
  mostrarConfirmacionEliminar.value = true
}

async function eliminarActividad() {
  if (!actividadAEliminar.value) return

  loadingEliminar.value = true
  try {
    await actividadesStore.eliminarActividad(actividadAEliminar.value.idActividad)
    mostrarConfirmacionEliminar.value = false
    mostrarMensaje('Actividad eliminada correctamente', 'success')
  } catch (error) {
    mostrarMensaje('Error al eliminar la actividad', 'error')
  } finally {
    loadingEliminar.value = false
    actividadAEliminar.value = null
  }
}

async function aplicarFiltros(filtros: FilterActividadDto) {
  try {
    await actividadesStore.aplicarFiltros(filtros)
    mostrarMensaje('Filtros aplicados correctamente', 'info')
  } catch (error) {
    mostrarMensaje('Error al aplicar filtros', 'error')
  }
}

async function limpiarFiltros() {
  try {
    await actividadesStore.limpiarFiltros()
    busqueda.value = ''
    mostrarMensaje('Filtros limpiados', 'info')
  } catch (error) {
    mostrarMensaje('Error al limpiar filtros', 'error')
  }
}

function onActividadActualizada() {
  mostrarDialogoEditar.value = false
  actividadesStore.cargarActividades()
  mostrarMensaje('Actividad actualizada correctamente', 'success')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Inicialización
onMounted(async () => {
  await actividadesStore.cargarActividades()
})
</script>

<style scoped>
.actividades-container {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  padding: 1.5rem;
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

.v-card {
  border-radius: 12px;
}

.descripcion-cell {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gap-1 {
  gap: 0.25rem;
}

@media (max-width: 960px) {
  .actividades-container {
    padding: 1rem;
  }
}
</style>
