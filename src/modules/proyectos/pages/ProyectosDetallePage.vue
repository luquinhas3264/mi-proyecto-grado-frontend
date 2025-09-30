<template>
  <div class="proyecto-detalle">
    <!-- Loading State -->
    <div
      v-if="loading && !proyectoDetalle"
      class="d-flex justify-center align-center"
      style="height: 400px"
    >
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error && !proyectoDetalle"
      type="error"
      variant="tonal"
      prominent
      class="ma-4"
    >
      <template v-slot:title>Error al cargar proyecto</template>
      {{ error }}
      <template>
        <v-btn color="error" variant="outlined" @click="cargarProyecto"> Reintentar </v-btn>
      </template>
    </v-alert>

    <!-- Content -->
    <div v-else-if="proyectoDetalle">
      <!-- Header del proyecto mejorado -->
      <div class="proyecto-header mb-6">
        <div class="header-container">
          <div class="d-flex align-center mb-4">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              color="white"
              @click="volverALista"
              class="mr-3"
            />
            <div class="flex-grow-1">
              <h1 class="text-h4 font-weight-bold mb-2 text-white">{{ proyectoDetalle.nombre }}</h1>
              <div class="d-flex align-center gap-3 flex-wrap">
                <v-chip
                  :color="obtenerColorEstado(proyectoDetalle.estado)"
                  size="large"
                  variant="elevated"
                  class="elevation-2"
                >
                  <v-icon start :icon="obtenerIconoEstado(proyectoDetalle.estado)" />
                  {{ formatearEstado(proyectoDetalle.estado) }}
                </v-chip>
                <v-chip color="white" variant="outlined" class="border-white">
                  <v-icon start>mdi-domain</v-icon>
                  {{ proyectoDetalle.cliente.razonSocial }}
                </v-chip>
                <v-chip
                  v-if="proyectoDetalle.diasRestantes !== null"
                  :color="
                    obtenerColorDiasRestantes(
                      proyectoDetalle.diasRestantes,
                      proyectoDetalle.estaAtrasado,
                    )
                  "
                  variant="elevated"
                  class="elevation-2"
                >
                  <v-icon
                    start
                    :icon="proyectoDetalle.estaAtrasado ? 'mdi-alert-circle' : 'mdi-clock-outline'"
                  />
                  {{
                    proyectoDetalle.estaAtrasado
                      ? `${Math.abs(proyectoDetalle.diasRestantes)} atrasado`
                      : `${proyectoDetalle.diasRestantes} días restantes`
                  }}
                </v-chip>
                <span v-else class="text-caption text-grey-darken-1">Sin fecha fin</span>
              </div>
            </div>

            <!-- Actions del proyecto -->
            <div class="d-flex gap-2">
              <v-btn
                v-if="hasPermission('proyectos', 'editar')"
                color="warning"
                variant="elevated"
                prepend-icon="mdi-pencil"
                @click="editarProyecto"
                class="elevation-2"
              >
                Editar
              </v-btn>
              <v-btn
                v-if="
                  hasPermission('proyectos', 'editar') &&
                  proyectoDetalle.estado !== EstadoProyecto.FINALIZADO
                "
                color="success"
                variant="elevated"
                prepend-icon="mdi-check-circle"
                @click="marcarComoFinalizado"
                class="elevation-2"
              >
                Finalizar
              </v-btn>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    variant="elevated"
                    color="white"
                    class="elevation-2"
                  />
                </template>
                <v-list>
                  <v-list-item @click="contactarCliente" v-if="proyectoDetalle.cliente.correo">
                    <template v-slot:prepend>
                      <v-icon>mdi-email</v-icon>
                    </template>
                    <v-list-item-title>Contactar Cliente</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="llamarCliente" v-if="proyectoDetalle.cliente.telefono">
                    <template v-slot:prepend>
                      <v-icon>mdi-phone</v-icon>
                    </template>
                    <v-list-item-title>Llamar Cliente</v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item
                    @click="confirmarEliminacion"
                    v-if="hasPermission('proyectos', 'eliminar')"
                    class="text-error"
                  >
                    <template v-slot:prepend>
                      <v-icon color="error">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Eliminar Proyecto</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- Barra de progreso mejorada -->
          <div class="mb-2">
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-1 text-white font-weight-medium">Progreso del Proyecto</span>
              <span class="text-h6 font-weight-bold text-white">{{ calcularProgreso() }}%</span>
            </div>
            <div class="progress-container">
              <v-progress-linear
                :model-value="calcularProgreso()"
                :color="obtenerColorEstado(proyectoDetalle.estado)"
                height="12"
                rounded
                striped
                class="elevation-1"
                bg-color="rgba(255,255,255,0.2)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards Resumen -->
      <div class="content-container mb-6">
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card class="stats-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-avatar size="40" color="info" class="mr-3">
                    <v-icon color="white">mdi-note-text</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">
                      {{ proyectoDetalle.notas?.length || 0 }}
                    </div>
                    <div class="text-caption text-grey-darken-1">Notas</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="stats-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-avatar size="40" color="warning" class="mr-3">
                    <v-icon color="white">mdi-format-list-checks</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">
                      {{ proyectoDetalle.tareas?.length || 0 }}
                    </div>
                    <div class="text-caption text-grey-darken-1">Tareas</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="stats-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-avatar size="40" color="success" class="mr-3">
                    <v-icon color="white">mdi-history</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">
                      {{ proyectoDetalle.actividades?.length || 0 }}
                    </div>
                    <div class="text-caption text-grey-darken-1">Actividades</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="stats-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-avatar size="40" color="purple" class="mr-3">
                    <v-icon color="white">mdi-file-multiple</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">0</div>
                    <div class="text-caption text-grey-darken-1">Archivos</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Navigation Tabs del Detalle -->
      <div class="content-container">
        <v-card class="tabs-container mb-6" elevation="2">
          <v-tabs v-model="tabActivo" color="#485696" grow height="56">
            <v-tab value="informacion">
              <v-icon start>mdi-information</v-icon>
              Información
            </v-tab>
            <v-tab value="notas">
              <v-icon start>mdi-note-text</v-icon>
              Notas
              <v-chip
                v-if="proyectoDetalle.notas && proyectoDetalle.notas.length > 0"
                size="small"
                variant="tonal"
                color="info"
                class="ml-2"
              >
                {{ proyectoDetalle.notas.length }}
              </v-chip>
            </v-tab>
            <v-tab value="tareas">
              <v-icon start>mdi-format-list-checks</v-icon>
              Tareas
              <v-chip
                v-if="proyectoDetalle.tareas && proyectoDetalle.tareas.length > 0"
                size="small"
                variant="tonal"
                color="warning"
                class="ml-2"
              >
                {{ proyectoDetalle.tareas.length }}
              </v-chip>
            </v-tab>
            <v-tab value="archivos">
              <v-icon start>mdi-file-multiple</v-icon>
              Archivos
              <v-chip size="small" variant="tonal" color="purple" class="ml-2">0</v-chip>
            </v-tab>
            <v-tab value="actividades">
              <v-icon start>mdi-history</v-icon>
              Actividades
              <v-chip
                v-if="proyectoDetalle.actividades && proyectoDetalle.actividades.length > 0"
                size="small"
                variant="tonal"
                color="success"
                class="ml-2"
              >
                {{ proyectoDetalle.actividades.length }}
              </v-chip>
            </v-tab>
          </v-tabs>
        </v-card>

        <!-- Contenido dinámico según tab -->
        <div class="content-section">
          <v-window v-model="tabActivo">
            <!-- Tab de Información -->
            <v-window-item value="informacion">
              <InformacionProyectoTab :proyecto="proyectoDetalle" />
            </v-window-item>

            <!-- Tab de Notas -->
            <v-window-item value="notas">
              <NotasProyectoTab
                :proyecto-id="proyectoDetalle.idProyecto"
                :notas="proyectoDetalle.notas || []"
                @nota-creada="actualizarProyecto"
                @nota-actualizada="actualizarProyecto"
              />
            </v-window-item>

            <!-- Tab de Tareas -->
            <v-window-item value="tareas">
              <TareasProyectoTab
                :proyecto-id="proyectoDetalle.idProyecto"
                :tareas="proyectoDetalle.tareas || []"
                @tarea-creada="actualizarProyecto"
                @tarea-actualizada="actualizarProyecto"
              />
            </v-window-item>

            <!-- Tab de Archivos -->
            <v-window-item value="archivos">
              <ArchivosProyectoTab
                :proyecto-id="proyectoDetalle.idProyecto"
                @archivo-subido="actualizarProyecto"
              />
            </v-window-item>

            <!-- Tab de Actividades -->
            <v-window-item value="actividades">
              <ActividadesProyectoTab :actividades="proyectoDetalle.actividades || []" />
            </v-window-item>
          </v-window>
        </div>
      </div>
    </div>

    <!-- Dialog de edición -->
    <ProyectoEditDialog
      v-model="mostrarDialogoEditar"
      :proyecto="proyectoParaEditar"
      @proyecto-actualizado="onProyectoActualizado"
    />

    <!-- Dialog de confirmación de eliminación -->
    <v-dialog v-model="mostrarConfirmacionEliminacion" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            ¿Está seguro que desea eliminar el proyecto
            <strong>{{ proyectoDetalle?.nombre }}</strong
            >?
          </p>
          <v-alert type="error" variant="tonal">
            <template v-slot:title>⚠️ Advertencia</template>
            Esta acción eliminará permanentemente el proyecto y todos sus datos asociados (notas,
            tareas, archivos, actividades). Esta operación no se puede deshacer.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="mostrarConfirmacionEliminacion = false"
            :disabled="loading"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarProyecto" :loading="loading">
            Eliminar Proyecto
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useProyectoStore } from '../proyecto/store/proyecto.store'
import {
  EstadoProyecto,
  type ProyectoDetalle,
  type ProyectoListItem,
} from '../proyecto/interfaces/proyecto.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Importar componentes de tabs
import InformacionProyectoTab from '../components/tabs/InformacionProyectoTab.vue'
import NotasProyectoTab from '../components/tabs/NotasProyectoTab.vue'
import TareasProyectoTab from '../components/tabs/TareasProyectoTab.vue'
import ArchivosProyectoTab from '../components/tabs/ArchivosProyectoTab.vue'
import ActividadesProyectoTab from '../components/tabs/ActividadesProyectoTab.vue'
import ProyectoEditDialog from '../proyecto/components/ProyectoEditDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const proyectoStore = useProyectoStore()

// Estado local
const tabActivo = ref('informacion')
const loading = ref(false)
const mostrarDialogoEditar = ref(false)
const mostrarConfirmacionEliminacion = ref(false)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const proyectoId = computed(() => route.params.id as string)
const proyectoDetalle = computed(() => proyectoStore.proyectoActual)
const error = computed(() => proyectoStore.error)

const proyectoParaEditar = computed<ProyectoListItem | null>(() => {
  if (!proyectoDetalle.value) return null

  return {
    idProyecto: proyectoDetalle.value.idProyecto,
    nombre: proyectoDetalle.value.nombre,
    descripcion: proyectoDetalle.value.descripcion,
    estado: proyectoDetalle.value.estado,
    fechaInicio: proyectoDetalle.value.fechaInicio,
    fechaFin: proyectoDetalle.value.fechaFin,
    idCliente: proyectoDetalle.value.idCliente,
    cliente: proyectoDetalle.value.cliente,
    creadoEn: proyectoDetalle.value.creadoEn,
    // Campos específicos de ProyectoListItem
    notas: proyectoDetalle.value.notas || [],
    diasRestantes: proyectoDetalle.value.diasRestantes || 0,
    estaAtrasado: proyectoDetalle.value.estaAtrasado || false,
  }
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

async function cargarProyecto() {
  if (!proyectoId.value) return

  try {
    loading.value = true
    await proyectoStore.obtenerProyectoDetalle(proyectoId.value)
  } catch (error) {
    console.error('Error al cargar proyecto:', error)
  } finally {
    loading.value = false
  }
}

async function actualizarProyecto() {
  await cargarProyecto()
}

function volverALista() {
  router.push('/proyectos')
}

function editarProyecto() {
  mostrarDialogoEditar.value = true
}

async function marcarComoFinalizado() {
  if (!proyectoDetalle.value) return

  try {
    loading.value = true
    await proyectoStore.cambiarEstadoProyecto(
      proyectoDetalle.value.idProyecto,
      EstadoProyecto.FINALIZADO,
    )
    await actualizarProyecto()
    mostrarMensaje('Proyecto marcado como finalizado', 'success')
  } catch (error) {
    mostrarMensaje('Error al finalizar el proyecto', 'error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminacion() {
  mostrarConfirmacionEliminacion.value = true
}

async function eliminarProyecto() {
  if (!proyectoDetalle.value) return

  try {
    loading.value = true
    await proyectoStore.eliminarProyecto(proyectoDetalle.value.idProyecto)
    mostrarConfirmacionEliminacion.value = false
    mostrarMensaje('Proyecto eliminado correctamente', 'success')

    // Navegar de vuelta a la lista después de un breve delay
    setTimeout(() => {
      router.push('/proyectos')
    }, 1000)
  } catch (error) {
    mostrarMensaje('Error al eliminar el proyecto', 'error')
  } finally {
    loading.value = false
  }
}

function contactarCliente() {
  if (proyectoDetalle.value?.cliente.correo) {
    window.open(`mailto:${proyectoDetalle.value.cliente.correo}`)
  }
}

function llamarCliente() {
  if (proyectoDetalle.value?.cliente.telefono) {
    window.open(`tel:${proyectoDetalle.value.cliente.telefono}`)
  }
}

// Funciones de formato y cálculo
function formatearEstado(estado: EstadoProyecto): string {
  const estados = {
    [EstadoProyecto.PLANEADO]: 'Planeado',
    [EstadoProyecto.EN_PROGRESO]: 'En Progreso',
    [EstadoProyecto.FINALIZADO]: 'Finalizado',
  }
  return estados[estado] || estado
}

function obtenerColorEstado(estado: EstadoProyecto): string {
  const colores = {
    [EstadoProyecto.PLANEADO]: 'info',
    [EstadoProyecto.EN_PROGRESO]: 'warning',
    [EstadoProyecto.FINALIZADO]: 'success',
  }
  return colores[estado] || 'grey'
}

function obtenerIconoEstado(estado: EstadoProyecto): string {
  const iconos = {
    [EstadoProyecto.PLANEADO]: 'mdi-clock-outline',
    [EstadoProyecto.EN_PROGRESO]: 'mdi-play-circle',
    [EstadoProyecto.FINALIZADO]: 'mdi-check-circle',
  }
  return iconos[estado] || 'mdi-help-circle'
}

function calcularProgreso(): number {
  if (!proyectoDetalle.value) return 0

  switch (proyectoDetalle.value.estado) {
    case EstadoProyecto.PLANEADO:
      return 0
    case EstadoProyecto.EN_PROGRESO:
      if (proyectoDetalle.value.fechaFin) {
        const inicio = new Date(proyectoDetalle.value.fechaInicio).getTime()
        const fin = new Date(proyectoDetalle.value.fechaFin).getTime()
        const ahora = new Date().getTime()

        if (ahora <= inicio) return 0
        if (ahora >= fin) return 90

        const progreso = ((ahora - inicio) / (fin - inicio)) * 90
        return Math.round(progreso)
      }
      return 50
    case EstadoProyecto.FINALIZADO:
      return 100
    default:
      return 0
  }
}

// Event handlers
function onProyectoActualizado() {
  mostrarDialogoEditar.value = false
  actualizarProyecto()
  mostrarMensaje('Proyecto actualizado correctamente', 'success')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Navegación de tabs
function determinarTabPorRuta() {
  const path = route.path
  const meta = route.meta as { defaultTab?: string }

  if (meta?.defaultTab) {
    tabActivo.value = meta.defaultTab
    return
  }

  if (path.includes('/notas')) {
    tabActivo.value = 'notas'
  } else if (path.includes('/tareas')) {
    tabActivo.value = 'tareas'
  } else if (path.includes('/archivos')) {
    tabActivo.value = 'archivos'
  } else if (path.includes('/actividades')) {
    tabActivo.value = 'actividades'
  } else {
    tabActivo.value = 'informacion'
  }
}

function obtenerColorDiasRestantes(dias: number, atrasado: boolean): string {
  if (atrasado) return 'error'
  if (dias <= 3) return 'error'
  if (dias <= 7) return 'warning'
  return 'success'
}

// Watchers
watch(tabActivo, (nuevoTab) => {
  const proyectoId = route.params.id as string
  let nuevaRuta = `/proyectos/${proyectoId}`

  if (nuevoTab !== 'informacion') {
    nuevaRuta += `/${nuevoTab}`
  }

  if (route.path !== nuevaRuta) {
    router.replace(nuevaRuta)
  }
})

watch(
  () => route.path,
  () => {
    determinarTabPorRuta()
  },
)

watch(proyectoId, (nuevoId) => {
  if (nuevoId) {
    cargarProyecto()
  }
})

// Lifecycle
onMounted(() => {
  determinarTabPorRuta()
  if (proyectoId.value) {
    cargarProyecto()
  }
})
</script>

<style scoped>
.proyecto-detalle {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header mejorado con gradiente gris */
.proyecto-header {
  background: linear-gradient(135deg, #485696 0%, #5c6bc0 100%);
  color: white;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.header-container {
  padding: 2rem;
}

.border-white {
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.progress-container {
  position: relative;
}

/* Container para mantener el mismo ancho que ProyectosMainPage */
.content-container {
  max-width: 100%;
  margin: 0 auto;
}

.content-section {
  min-height: 400px;
  background: transparent;
  box-shadow: none;
}

/* Stats cards */
.stats-card {
  height: 100%;
  transition: transform 0.2s ease;
  border-radius: 12px;
}

.stats-card:hover {
  transform: translateY(-2px);
}

/* Tabs container */
.tabs-container {
  border-radius: 12px;
  overflow: hidden;
}

.v-tab {
  text-transform: none !important;
  font-weight: 500;
}

/* Cards generales */
.v-card {
  border-radius: 12px;
}

/* Elevaciones */
.elevation-1 {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.elevation-2 {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Gaps */
.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

/* Responsive */
@media (max-width: 960px) {
  .proyecto-detalle {
    padding: 1rem;
  }

  .header-container {
    padding: 1rem;
  }

  .v-tab {
    flex-direction: column;
    height: auto !important;
    padding: 8px 4px;
  }

  .v-tab .v-icon {
    margin-bottom: 4px;
  }

  .gap-3 {
    gap: 0.5rem;
  }
}
</style>
