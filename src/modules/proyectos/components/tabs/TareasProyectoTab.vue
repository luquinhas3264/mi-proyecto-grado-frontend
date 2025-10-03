<template>
  <div class="tareas-proyecto-tab">
    <!-- Header con estadísticas compactas -->
    <v-card class="mb-4" elevation="2">
      <v-card-text class="pa-4">
        <div class="d-flex justify-space-between align-center flex-wrap gap-4">
          <!-- Progreso -->
          <div class="flex-grow-1" style="min-width: 200px">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2 font-weight-medium">Progreso de Tareas</span>
              <span class="text-h6 font-weight-bold text-success"
                >{{ tareaStore.porcentajeProgreso }}%</span
              >
            </div>
            <v-progress-linear
              :model-value="tareaStore.porcentajeProgreso"
              color="success"
              height="8"
              rounded
            />
          </div>

          <!-- Stats inline -->
          <div class="d-flex gap-6 flex-wrap">
            <div class="text-center">
              <div class="d-flex align-center gap-2">
                <v-icon color="grey" size="20">mdi-clock-outline</v-icon>
                <span class="text-h6 font-weight-bold">{{ tareasPendientes.length }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">Pendientes</div>
            </div>

            <v-divider vertical />

            <div class="text-center">
              <div class="d-flex align-center gap-2">
                <v-icon color="warning" size="20">mdi-progress-clock</v-icon>
                <span class="text-h6 font-weight-bold">{{ tareasEnProgreso.length }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">En Progreso</div>
            </div>

            <v-divider vertical />

            <div class="text-center">
              <div class="d-flex align-center gap-2">
                <v-icon color="success" size="20">mdi-check-circle</v-icon>
                <span class="text-h6 font-weight-bold">{{ tareasCompletadas.length }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">Completadas</div>
            </div>

            <v-divider vertical />

            <div class="text-center">
              <div class="d-flex align-center gap-2">
                <v-icon color="error" size="20">mdi-alert-circle</v-icon>
                <span class="text-h6 font-weight-bold">{{ tareasVencidas.length }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">Vencidas</div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Barra de herramientas -->
    <v-card class="mb-4" elevation="2">
      <v-card-text class="pa-4">
        <v-row align="center">
          <!-- Búsqueda -->
          <v-col cols="12" md="4">
            <v-text-field
              v-model="busqueda"
              label="Buscar tareas"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @click:clear="onClearBusqueda"
            />
          </v-col>

          <!-- Filtro por estado -->
          <v-col cols="12" md="3">
            <v-select
              v-model="filtroEstado"
              label="Estado"
              :items="opcionesEstado"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <!-- Ordenamiento -->
          <v-col cols="12" md="2">
            <v-select
              v-model="ordenamiento"
              label="Ordenar por"
              :items="opcionesOrdenamiento"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <!-- Filtros adicionales -->
          <v-col cols="12" md="1">
            <v-btn
              icon="mdi-filter-variant"
              variant="outlined"
              @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
            />
          </v-col>

          <!-- Acciones -->
          <v-col cols="12" md="2" class="d-flex gap-2 justify-end">
            <v-btn
              v-if="hasPermission('tareas', 'crear')"
              color="#485696"
              prepend-icon="mdi-plus"
              @click="mostrarDialogoCrear = true"
            >
              Nueva Tarea
            </v-btn>
          </v-col>
        </v-row>

        <!-- Filtros avanzados -->
        <v-expand-transition>
          <v-row v-if="mostrarFiltrosAvanzados" class="mt-2">
            <v-col cols="12" md="3">
              <v-select
                v-model="filtroResponsable"
                label="Responsable"
                :items="responsablesUnicos"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-checkbox
                v-model="filtroVencidas"
                label="Solo vencidas"
                density="compact"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-checkbox
                v-model="filtroSinAsignar"
                label="Sin asignar"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="tareaStore.loading && tareasFiltradas.length === 0" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-subtitle-1 mt-4 text-grey-darken-1">Cargando tareas...</p>
    </div>

    <!-- Estado vacío: sin tareas o sin resultados de búsqueda -->
    <v-card
      v-else-if="!tareaStore.loading && tareasFiltradas.length === 0"
      class="text-center py-12"
      elevation="0"
      variant="tonal"
    >
      <v-icon size="80" color="grey-lighten-1">mdi-checkbox-marked-circle-outline</v-icon>
      <h3 class="text-h6 mt-4 mb-2">
        {{
          tieneFiltrosActivos
            ? 'No se encontraron tareas que coincidan con los filtros.'
            : 'No hay tareas aún'
        }}
      </h3>
      <p class="text-body-2 text-grey-darken-1 mb-4">
        {{
          tieneFiltrosActivos
            ? 'Intenta ajustar los filtros o crea una nueva tarea.'
            : 'Comienza agregando la primera tarea de este proyecto'
        }}
      </p>
      <v-btn
        v-if="hasPermission('tareas', 'crear')"
        color="#485696"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="mostrarDialogoCrear = true"
      >
        {{ tieneFiltrosActivos ? 'Crear Tarea' : 'Crear Primera Tarea' }}
      </v-btn>
    </v-card>

    <!-- Grid de tareas -->
    <v-row v-else>
      <v-col v-for="tarea in tareasFiltradas" :key="tarea.idTarea" cols="12" md="6" lg="4">
        <TareaCard
          :tarea="tarea"
          @editar="abrirEdicion"
          @eliminar="confirmarEliminacion"
          @cambiar-estado="cambiarEstadoTarea"
        />
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <TareaCreateDialog
      v-model="mostrarDialogoCrear"
      :proyecto-id="proyectoId"
      @tarea-creada="onTareaCreada"
    />

    <TareaEditDialog
      v-model="mostrarDialogoEditar"
      :tarea="tareaSeleccionada"
      @tarea-actualizada="onTareaActualizada"
    />

    <!-- Dialog de confirmación de eliminación -->
    <v-dialog v-model="mostrarConfirmacionEliminacion" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          <p class="mb-3">¿Está seguro que desea eliminar esta tarea?</p>
          <v-card variant="tonal" color="grey-lighten-4" class="pa-3">
            <p class="text-h6 font-weight-bold text-grey-darken-3 mb-1">
              {{ tareaAEliminar?.nombre }}
            </p>
            <p
              v-if="tareaAEliminar?.descripcion"
              class="text-body-2 mb-0 text-grey-darken-3"
              style="white-space: pre-wrap"
            >
              {{ tareaAEliminar.descripcion }}
            </p>
          </v-card>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Esta acción no se puede deshacer.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="mostrarConfirmacionEliminacion = false"
            :disabled="tareaStore.loading"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarTarea" :loading="tareaStore.loading">
            Eliminar Tarea
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
import { useTareaStore } from '../../tarea-proyecto/store/tarea.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useUsuariosStore } from '@/modules/usuarios-internos/store/usuarios.store'
import { EstadoTarea, type TareaListItem } from '../../tarea-proyecto/interfaces/tarea.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Importar componentes
import TareaCard from '../../tarea-proyecto/components/TareaCard.vue'
import TareaCreateDialog from '../../tarea-proyecto/components/TareaCreateDialog.vue'
import TareaEditDialog from '../../tarea-proyecto/components/TareaEditDialog.vue'

interface Props {
  proyectoId: string
  soloMisTareas?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'tarea-creada': []
  'tarea-actualizada': []
}>()

const tareaStore = useTareaStore()
const authStore = useAuthStore()
const usuariosStore = useUsuariosStore()

// Estado local
const busqueda = ref('')
const filtroEstado = ref('todos')
const ordenamiento = ref('reciente')
const filtroResponsable = ref('')
const filtroVencidas = ref(false)
const filtroSinAsignar = ref(false)
const mostrarFiltrosAvanzados = ref(false)
const mostrarDialogoCrear = ref(false)
const mostrarDialogoEditar = ref(false)
const mostrarConfirmacionEliminacion = ref(false)
const tareaSeleccionada = ref<TareaListItem | null>(null)
const tareaAEliminar = ref<TareaListItem | null>(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Opciones de filtros
const opcionesEstado = [
  { title: 'Todos', value: 'todos' },
  { title: 'Pendientes', value: EstadoTarea.PENDIENTE },
  { title: 'En Progreso', value: EstadoTarea.EN_PROGRESO },
  { title: 'Completadas', value: EstadoTarea.COMPLETADA },
]

const opcionesOrdenamiento = [
  { title: 'Más recientes', value: 'reciente' },
  { title: 'Más antiguas', value: 'antigua' },
  { title: 'Por fecha límite', value: 'fechaLimite' },
  { title: 'Por nombre (A-Z)', value: 'nombre-asc' },
  { title: 'Por nombre (Z-A)', value: 'nombre-desc' },
]

// Computed adaptados para toggle
const tareasBase = computed(() => (props.soloMisTareas ? tareaStore.misTareas : tareaStore.tareas))

const responsablesUnicos = computed(() => {
  const responsablesMap = new Map<string, string>()
  tareasBase.value.forEach((tarea) => {
    if (tarea.idUsuarioResponsable && tarea.usuarioResponsable) {
      responsablesMap.set(tarea.idUsuarioResponsable, tarea.usuarioResponsable.nombre)
    }
  })
  return Array.from(responsablesMap, ([id, nombre]) => ({ title: nombre, value: id }))
})

const tieneFiltrosActivos = computed(() => {
  return (
    busqueda.value.trim() !== '' ||
    filtroEstado.value !== 'todos' ||
    filtroResponsable.value !== '' ||
    filtroVencidas.value ||
    filtroSinAsignar.value
  )
})

const tareasFiltradas = computed(() => {
  let resultado = [...tareasBase.value]

  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (tarea) =>
        tarea.nombre.toLowerCase().includes(termino) ||
        tarea.descripcion?.toLowerCase().includes(termino),
    )
  }

  // Filtrar por estado
  if (filtroEstado.value !== 'todos') {
    resultado = resultado.filter((tarea) => tarea.estado === filtroEstado.value)
  }

  // Filtrar por responsable
  if (filtroResponsable.value) {
    resultado = resultado.filter((tarea) => tarea.idUsuarioResponsable === filtroResponsable.value)
  }

  // Filtrar solo vencidas
  if (filtroVencidas.value) {
    resultado = resultado.filter((tarea) => {
      if (!tarea.fechaLimite || tarea.estado === EstadoTarea.COMPLETADA) return false
      return new Date(tarea.fechaLimite) < new Date()
    })
  }

  // Filtrar sin asignar
  if (filtroSinAsignar.value) {
    resultado = resultado.filter((tarea) => !tarea.idUsuarioResponsable)
  }

  // Ordenar
  switch (ordenamiento.value) {
    case 'reciente':
      resultado.sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
      break
    case 'antigua':
      resultado.sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime())
      break
    case 'fechaLimite':
      resultado.sort((a, b) => {
        if (!a.fechaLimite) return 1
        if (!b.fechaLimite) return -1
        return new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime()
      })
      break
    case 'nombre-asc':
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
      break
    case 'nombre-desc':
      resultado.sort((a, b) => b.nombre.localeCompare(a.nombre))
      break
  }

  return resultado
})

// Contadores adaptados
const tareasPendientes = computed(() =>
  tareasBase.value.filter((t) => t.estado === EstadoTarea.PENDIENTE),
)
const tareasEnProgreso = computed(() =>
  tareasBase.value.filter((t) => t.estado === EstadoTarea.EN_PROGRESO),
)
const tareasCompletadas = computed(() =>
  tareasBase.value.filter((t) => t.estado === EstadoTarea.COMPLETADA),
)
const tareasVencidas = computed(() =>
  tareasBase.value.filter((t) => {
    return (
      t.fechaLimite && t.estado !== EstadoTarea.COMPLETADA && new Date(t.fechaLimite) < new Date()
    )
  }),
)
const porcentajeProgreso = computed(() => {
  if (tareasBase.value.length === 0) return 0
  const completadas = tareasBase.value.filter((t) => t.estado === EstadoTarea.COMPLETADA).length
  return Math.round((completadas / tareasBase.value.length) * 100)
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

async function cargarTareas() {
  try {
    if (props.soloMisTareas) {
      await tareaStore.cargarMisTareas()
    } else {
      await tareaStore.cargarTareasProyecto(props.proyectoId)
    }
  } catch (error) {
    mostrarMensaje('Error al cargar las tareas', 'error')
  }
}

function abrirEdicion(tarea: TareaListItem) {
  tareaSeleccionada.value = tarea
  mostrarDialogoEditar.value = true
}

function confirmarEliminacion(tarea: TareaListItem) {
  tareaAEliminar.value = tarea
  mostrarConfirmacionEliminacion.value = true
}

async function cambiarEstadoTarea(tarea: TareaListItem, nuevoEstado: EstadoTarea) {
  try {
    await tareaStore.cambiarEstado(tarea.idTarea, nuevoEstado)
    // Recargar la lista según el toggle
    if (props.soloMisTareas) {
      await tareaStore.cargarMisTareas()
    } else {
      await tareaStore.cargarTareasProyecto(props.proyectoId)
    }
    mostrarMensaje(`Tarea marcada como ${formatearEstado(nuevoEstado).toLowerCase()}`, 'success')
    emit('tarea-actualizada')
  } catch (error) {
    mostrarMensaje('Error al cambiar el estado de la tarea', 'error')
  }
}

async function eliminarTarea() {
  if (!tareaAEliminar.value) return

  try {
    await tareaStore.eliminarTarea(tareaAEliminar.value.idTarea)
    mostrarConfirmacionEliminacion.value = false
    tareaAEliminar.value = null
    mostrarMensaje('Tarea eliminada correctamente', 'success')
    emit('tarea-actualizada')
  } catch (error) {
    mostrarMensaje('Error al eliminar la tarea', 'error')
  }
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstado.value = 'todos'
  filtroResponsable.value = ''
  filtroVencidas.value = false
  filtroSinAsignar.value = false
}

// Event handlers
function onTareaCreada() {
  mostrarDialogoCrear.value = false
  mostrarMensaje('Tarea creada correctamente', 'success')
  emit('tarea-creada')
}

async function onTareaActualizada() {
  mostrarDialogoEditar.value = false
  tareaSeleccionada.value = null
  // Recargar la lista según el toggle
  if (props.soloMisTareas) {
    await tareaStore.cargarMisTareas()
  } else {
    await tareaStore.cargarTareasProyecto(props.proyectoId)
  }
  mostrarMensaje('Tarea actualizada correctamente', 'success')
  emit('tarea-actualizada')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

function formatearEstado(estado: EstadoTarea): string {
  const estados = {
    [EstadoTarea.PENDIENTE]: 'Pendiente',
    [EstadoTarea.EN_PROGRESO]: 'En Progreso',
    [EstadoTarea.COMPLETADA]: 'Completada',
  }
  return estados[estado] || estado
}

function onClearBusqueda() {
  busqueda.value = ''
  cargarTareas()
}

// Watchers

watch(
  () => [props.proyectoId, props.soloMisTareas],
  ([nuevoId, soloMisTareas]) => {
    if (nuevoId) {
      cargarTareas()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.proyectoId) {
    cargarTareas()
  }
})
</script>

<style scoped>
.tareas-proyecto-tab {
  padding: 2px;
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

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}
@media (max-width: 960px) {
  .tareas-proyecto-tab {
    padding: 0;
  }
}
</style>
