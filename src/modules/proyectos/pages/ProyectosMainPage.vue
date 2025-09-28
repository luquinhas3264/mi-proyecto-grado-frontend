<template>
  <div class="proyectos-main">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Gestión de Proyectos</h1>
          <p class="text-subtitle-1 text-contraste">
            Sistema integral de administración de proyectos y tareas
          </p>
        </div>
        <v-btn
          v-if="tabActivo === 'proyectos' && hasPermission('proyectos', 'crear')"
          color="#485696"
          size="large"
          prepend-icon="mdi-plus"
          @click="accionesRapidas.nuevoProyecto"
        >
          Nuevo Proyecto
        </v-btn>
      </div>
    </div>

    <!-- Contenido dinámico según tab -->
    <div class="content-container">
      <v-window v-model="tabActivo">
        <!-- Tab de Proyectos -->
        <v-window-item value="proyectos">
          <ProyectoListPage
            @crear-proyecto="mostrarDialogoCrearProyecto = true"
            @editar-proyecto="editarProyecto"
            @ver-proyecto="verProyecto"
            @cambiar-estado="cambiarEstadoProyecto"
            @confirmar-eliminacion="confirmarEliminacionProyecto"
          />
        </v-window-item>
      </v-window>
    </div>

    <!-- Dialogs de Proyecto -->
    <ProyectoCreateDialog
      v-model="mostrarDialogoCrearProyecto"
      :cliente-preseleccionado="clientePreseleccionado"
      @proyecto-creado="onProyectoCreado"
    />

    <ProyectoEditDialog
      v-model="mostrarDialogoEditarProyecto"
      :proyecto="proyectoSeleccionado"
      @proyecto-actualizado="onProyectoActualizado"
    />

    <!-- Dialog de cambio de estado -->
    <v-dialog v-model="mostrarDialogoCambioEstado" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="warning">mdi-flag</v-icon>
          Cambiar Estado del Proyecto
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            Cambiar estado del proyecto: <strong>{{ proyectoACambiarEstado?.nombre }}</strong>
          </p>
          <v-select
            v-model="nuevoEstado"
            label="Nuevo Estado"
            :items="estadosDisponibles"
            variant="outlined"
            color="#485696"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon
                    :icon="obtenerIconoEstado(item.raw.value)"
                    :color="obtenerColorEstado(item.raw.value)"
                  />
                </template>
              </v-list-item>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="mostrarDialogoCambioEstado = false" :disabled="loading">
            Cancelar
          </v-btn>
          <v-btn
            color="#485696"
            @click="ejecutarCambioEstado"
            :loading="loading"
            :disabled="!nuevoEstado"
          >
            Cambiar Estado
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación de eliminación -->
    <v-dialog v-model="mostrarConfirmacionEliminacion" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmar Eliminación de Proyecto
        </v-card-title>
        <v-card-text>
          <p>
            ¿Está seguro que desea eliminar el proyecto
            <strong>{{ proyectoAEliminar?.nombre }}</strong
            >?
          </p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Esta acción eliminará el proyecto y todos sus datos asociados (tareas, notas, archivos).
            Esta operación no se puede deshacer.
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
            Confirmar Eliminación
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useProyectoStore } from '../proyecto/store/proyecto.store'
import { EstadoProyecto, type ProyectoListItem } from '../proyecto/interfaces/proyecto.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Importar componentes del submódulo proyecto
import ProyectoListPage from '../proyecto/pages/ProyectoListPage.vue'
import ProyectoCreateDialog from '../proyecto/components/ProyectoCreateDialog.vue'
import ProyectoEditDialog from '../proyecto/components/ProyectoEditDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const proyectoStore = useProyectoStore()

// Estado local
const tabActivo = ref('proyectos')
const loading = ref(false)

// Estados de dialogs de Proyecto
const mostrarDialogoCrearProyecto = ref(false)
const mostrarDialogoEditarProyecto = ref(false)
const mostrarDialogoCambioEstado = ref(false)
const mostrarConfirmacionEliminacion = ref(false)
const proyectoSeleccionado = ref<ProyectoListItem | null>(null)
const proyectoACambiarEstado = ref<ProyectoListItem | null>(null)
const proyectoAEliminar = ref<ProyectoListItem | null>(null)
const clientePreseleccionado = ref<string>('')
const nuevoEstado = ref<EstadoProyecto | ''>('')

// Estados disponibles para cambio
const estadosDisponibles = [
  { title: 'Planeado', value: EstadoProyecto.PLANEADO },
  { title: 'En Progreso', value: EstadoProyecto.EN_PROGRESO },
  { title: 'Finalizado', value: EstadoProyecto.FINALIZADO },
]

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const hasPermission = (modulo: string, accion: string): boolean => {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

// Acciones rápidas por módulo
const accionesRapidas = {
  nuevoProyecto: () => {
    mostrarDialogoCrearProyecto.value = true
  },
  nuevaTarea: () => {
    // TODO: Implementar cuando esté el módulo de tareas
    mostrarMensaje('Módulo de tareas próximamente', 'info')
  },
  nuevaNota: () => {
    // TODO: Implementar cuando esté el módulo de notas
    mostrarMensaje('Módulo de notas próximamente', 'info')
  },
  subirArchivo: () => {
    // TODO: Implementar cuando esté el módulo de archivos
    mostrarMensaje('Módulo de archivos próximamente', 'info')
  },
}

// =========== MÉTODOS PARA PROYECTO ===========
function editarProyecto(proyecto: ProyectoListItem) {
  proyectoSeleccionado.value = proyecto
  mostrarDialogoEditarProyecto.value = true
}

function verProyecto(proyecto: ProyectoListItem) {
  router.push({ name: 'ProyectoDetalle', params: { id: proyecto.idProyecto } })
}

function cambiarEstadoProyecto(proyecto: ProyectoListItem) {
  proyectoACambiarEstado.value = proyecto
  nuevoEstado.value = proyecto.estado
  mostrarDialogoCambioEstado.value = true
}

async function ejecutarCambioEstado() {
  if (!proyectoACambiarEstado.value || !nuevoEstado.value) return

  try {
    loading.value = true
    await proyectoStore.cambiarEstadoProyecto(
      proyectoACambiarEstado.value.idProyecto,
      nuevoEstado.value as EstadoProyecto,
    )

    // Actualizar proyectoSeleccionado si coincide
    if (proyectoSeleccionado.value?.idProyecto === proyectoACambiarEstado.value.idProyecto) {
      const actualizado = proyectoStore.proyectos.find(
        (p) => p.idProyecto === proyectoACambiarEstado.value?.idProyecto,
      )
      if (actualizado) {
        proyectoSeleccionado.value = { ...actualizado }
      }
    }

    mostrarDialogoCambioEstado.value = false
    proyectoACambiarEstado.value = null
    nuevoEstado.value = ''
    mostrarMensaje('Estado del proyecto actualizado correctamente', 'success')
  } catch (error) {
    mostrarMensaje('Error al cambiar el estado del proyecto', 'error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminacionProyecto(proyecto: ProyectoListItem) {
  proyectoAEliminar.value = proyecto
  mostrarConfirmacionEliminacion.value = true
}

async function eliminarProyecto() {
  if (!proyectoAEliminar.value) return

  try {
    loading.value = true
    await proyectoStore.eliminarProyecto(proyectoAEliminar.value.idProyecto)
    mostrarConfirmacionEliminacion.value = false
    proyectoAEliminar.value = null
    mostrarMensaje('Proyecto eliminado correctamente', 'success')
  } catch (error) {
    mostrarMensaje('Error al eliminar el proyecto', 'error')
  } finally {
    loading.value = false
  }
}

// =========== EVENT HANDLERS ===========
function onProyectoCreado() {
  mostrarDialogoCrearProyecto.value = false
  clientePreseleccionado.value = ''
  mostrarMensaje('Proyecto creado correctamente', 'success')
}

async function onProyectoActualizado() {
  mostrarDialogoEditarProyecto.value = false
  await proyectoStore.cargarProyectos()
  mostrarMensaje('Proyecto actualizado correctamente', 'success')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Funciones de utilidad
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

// =========== CARGAR ESTADÍSTICAS ===========
async function cargarEstadisticas() {
  try {
    if (tabActivo.value === 'proyectos') {
      await proyectoStore.cargarProyectos()
      await proyectoStore.cargarEstadisticas()
    }
    // TODO: Cargar estadísticas de otros módulos cuando estén implementados
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
  }
}

// =========== MANEJO DE TABS Y NAVEGACIÓN ===========
watch(tabActivo, (nuevoTab) => {
  // Actualizar URL sin recargar
  const nuevaRuta = nuevoTab === 'proyectos' ? '/proyectos' : `/proyectos/${nuevoTab}`
  router.replace(nuevaRuta)

  // Cargar datos del nuevo tab
  cargarEstadisticas()
})

function determinarTabPorRuta() {
  const path = route.path
  if (path.includes('/tareas')) {
    tabActivo.value = 'tareas'
  } else if (path.includes('/notas')) {
    tabActivo.value = 'notas'
  } else if (path.includes('/archivos')) {
    tabActivo.value = 'archivos'
  } else {
    tabActivo.value = 'proyectos'
  }
}

// =========== LIFECYCLE ===========
onMounted(() => {
  determinarTabPorRuta()
  cargarEstadisticas()
})
</script>

<style scoped>
.proyectos-main {
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

.tabs-container {
  border-radius: 12px;
  overflow: hidden;
}

.content-container {
  border-radius: 16px;
  min-height: 600px;
  background: transparent;
  box-shadow: none;
}

.v-tab {
  text-transform: none !important;
  font-weight: 500;
}

@media (max-width: 960px) {
  .proyectos-main {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .v-tab {
    flex-direction: column;
    height: auto !important;
    padding: 12px 8px;
  }

  .v-tab .v-icon {
    margin-bottom: 4px;
  }
}
</style>
