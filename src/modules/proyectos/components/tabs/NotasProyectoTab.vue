<template>
  <div class="notas-proyecto-tab">
    <!-- Header con estadísticas y acciones -->
    <!-- Barra de herramientas -->
    <v-card class="mb-4" elevation="2">
      <v-card-text class="pa-4">
        <v-row align="center">
          <!-- Búsqueda -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="busqueda"
              label="Buscar en notas"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="buscarNotas"
              @click:clear="onClearBusqueda"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="ordenamiento"
              label="Ordenar por"
              :items="opcionesOrdenamiento"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <!-- Acciones -->
          <v-col cols="12" md="3" class="d-flex gap-2 justify-end">
            <v-btn
              v-if="hasPermission('notas-proyecto', 'crear')"
              color="#485696"
              prepend-icon="mdi-plus"
              @click="mostrarDialogoCrear = true"
            >
              Nueva Nota
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Lista de notas -->
    <div v-if="notaStore.loading && notasOrdenadas.length === 0" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-subtitle-1 mt-4 text-grey-darken-1">Cargando notas...</p>
    </div>

    <!-- Estado vacío: sin notas o sin resultados de búsqueda -->
    <v-card
      v-else-if="!notaStore.loading && notasOrdenadas.length === 0"
      class="text-center py-12"
      elevation="0"
      variant="tonal"
    >
      <v-icon size="80" color="grey-lighten-1">mdi-note-text-outline</v-icon>
      <h3 class="text-h6 mt-4 mb-2">
        {{
          busqueda.trim()
            ? 'No se encontraron notas que coincidan con tu búsqueda.'
            : 'No hay notas aún'
        }}
      </h3>
      <p class="text-body-2 text-grey-darken-1 mb-4">
        {{
          busqueda.trim()
            ? 'Intenta con otro término o crea una nueva nota.'
            : 'Comienza agregando la primera nota de este proyecto'
        }}
      </p>
      <v-btn
        v-if="hasPermission('notas-proyecto', 'crear')"
        color="#485696"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="mostrarDialogoCrear = true"
      >
        {{ busqueda.trim() ? 'Crear Nota' : 'Crear Primera Nota' }}
      </v-btn>
    </v-card>

    <!-- Grid de notas -->
    <v-row v-else>
      <v-col v-for="nota in notasOrdenadas" :key="nota.idNota" cols="12" md="6" lg="4">
        <NotaCard :nota="nota" @editar="abrirEdicion" @eliminar="confirmarEliminacion" />
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <NotaCreateDialog
      v-model="mostrarDialogoCrear"
      :proyecto-id="proyectoId"
      @nota-creada="onNotaCreada"
    />

    <NotaEditDialog
      v-model="mostrarDialogoEditar"
      :nota="notaSeleccionada"
      @nota-actualizada="onNotaActualizada"
    />

    <!-- Dialog de confirmación de eliminación -->
    <v-dialog v-model="mostrarConfirmacionEliminacion" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          <p class="mb-3">¿Está seguro que desea eliminar esta nota?</p>
          <v-card variant="tonal" color="grey-lighten-4" class="pa-3">
            <p class="text-body-2 mb-0 text-grey-darken-3" style="white-space: pre-wrap">
              {{ notaAEliminar?.contenido }}
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
            :disabled="notaStore.loading"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarNota" :loading="notaStore.loading">
            Eliminar Nota
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
import { useNotaProyectoStore } from '../../nota-proyecto/store/nota.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type {
  NotaProyecto,
  NotaProyectoSimple,
} from '../../nota-proyecto/interfaces/nota.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Importar componentes
import NotaCard from '../../nota-proyecto/components/NotaCard.vue'
import NotaCreateDialog from '../../nota-proyecto/components/NotaCreateDialog.vue'
import NotaEditDialog from '../../nota-proyecto/components/NotaEditDialog.vue'

interface Props {
  proyectoId: string
  notas: NotaProyectoSimple[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'nota-creada': []
  'nota-actualizada': []
}>()

const notaStore = useNotaProyectoStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const ordenamiento = ref('reciente')
const mostrarDialogoCrear = ref(false)
const mostrarDialogoEditar = ref(false)
const mostrarConfirmacionEliminacion = ref(false)
const notaSeleccionada = ref<NotaProyecto | null>(null)
const notaAEliminar = ref<NotaProyecto | null>(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Opciones de ordenamiento
const opcionesOrdenamiento = [
  { title: 'Más recientes', value: 'reciente' },
  { title: 'Más antiguas', value: 'antigua' },
  { title: 'Contenido (A-Z)', value: 'contenido-asc' },
  { title: 'Contenido (Z-A)', value: 'contenido-desc' },
]

// Computed
const notasOrdenadas = computed(() => {
  let resultado = [...notaStore.notas]

  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter((nota) => nota.contenido.toLowerCase().includes(termino))
  }

  // Ordenar
  switch (ordenamiento.value) {
    case 'reciente':
      resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      break
    case 'antigua':
      resultado.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      break
    case 'contenido-asc':
      resultado.sort((a, b) => a.contenido.localeCompare(b.contenido))
      break
    case 'contenido-desc':
      resultado.sort((a, b) => b.contenido.localeCompare(a.contenido))
      break
  }

  return resultado
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

async function cargarNotas() {
  try {
    await notaStore.cargarNotasProyecto(props.proyectoId)
  } catch (error) {
    mostrarMensaje('Error al cargar las notas', 'error')
  }
}

async function buscarNotas() {
  if (!busqueda.value.trim()) {
    await cargarNotas()
    return
  }

  try {
    await notaStore.buscarNotas(busqueda.value)
  } catch (error) {
    mostrarMensaje('Error al buscar notas', 'error')
  }
}

function abrirEdicion(nota: NotaProyecto) {
  notaSeleccionada.value = nota
  mostrarDialogoEditar.value = true
}

function confirmarEliminacion(nota: NotaProyecto) {
  notaAEliminar.value = nota
  mostrarConfirmacionEliminacion.value = true
}

async function eliminarNota() {
  if (!notaAEliminar.value) return

  try {
    await notaStore.eliminarNota(notaAEliminar.value.idNota)
    mostrarConfirmacionEliminacion.value = false
    notaAEliminar.value = null
    mostrarMensaje('Nota eliminada correctamente', 'success')
    emit('nota-actualizada')
  } catch (error) {
    mostrarMensaje('Error al eliminar la nota', 'error')
  }
}

// Event handlers
function onNotaCreada() {
  mostrarDialogoCrear.value = false
  mostrarMensaje('Nota creada correctamente', 'success')
  emit('nota-creada')
}

function onNotaActualizada() {
  mostrarDialogoEditar.value = false
  notaSeleccionada.value = null
  mostrarMensaje('Nota actualizada correctamente', 'success')
  emit('nota-actualizada')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

function onClearBusqueda() {
  busqueda.value = ''
  cargarNotas()
}

// Watchers
watch(
  () => props.proyectoId,
  (nuevoId) => {
    if (nuevoId) {
      cargarNotas()
    }
  },
)

watch(
  () => props.notas,
  (nuevasNotas) => {
    // Sincronizar con el store - Convertir NotaProyectoSimple a NotaProyecto
    if (nuevasNotas && nuevasNotas.length > 0) {
      const notasCompletas: NotaProyecto[] = nuevasNotas.map((nota) => ({
        ...nota,
        idProyecto: props.proyectoId,
      }))
      notaStore.notas = notasCompletas
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  if (props.proyectoId) {
    cargarNotas()
  }
})
</script>

<style scoped>
.notas-proyecto-tab {
  padding: 5px;
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

@media (max-width: 960px) {
  .notas-proyecto-tab {
    padding: 0;
  }
}
</style>
