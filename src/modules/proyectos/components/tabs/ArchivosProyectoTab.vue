<template>
  <div class="archivos-proyecto-tab">
    <!-- Header con estadísticas -->
    <v-card class="mb-4" elevation="2">
      <v-card-text class="pa-4">
        <div class="d-flex justify-space-between align-center flex-wrap gap-4">
          <!-- Estadísticas inline -->
          <div class="d-flex gap-6 flex-wrap">
            <div class="text-center">
              <div class="d-flex align-center gap-2">
                <v-icon color="primary" size="20">mdi-file-multiple</v-icon>
                <span class="text-h6 font-weight-bold">{{ archivoStore.totalArchivos }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">Total Archivos</div>
            </div>

            <v-divider vertical />

            <div class="text-center">
              <div class="d-flex align-center gap-2">
                <v-icon color="blue" size="20">mdi-file</v-icon>
                <span class="text-h6 font-weight-bold">{{
                  archivoStore.archivosFisicos.length
                }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">Archivos</div>
            </div>

            <v-divider vertical />

            <div class="text-center">
              <div class="d-flex align-center gap-2">
                <v-icon color="purple" size="20">mdi-link-variant</v-icon>
                <span class="text-h6 font-weight-bold">{{ archivoStore.enlaces.length }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">Enlaces</div>
            </div>

            <v-divider vertical />

            <div class="text-center">
              <div class="d-flex align-center gap-2">
                <v-icon color="success" size="20">mdi-harddisk</v-icon>
                <span class="text-h6 font-weight-bold">{{
                  archivoStore.espacioUsadoFormateado
                }}</span>
              </div>
              <div class="text-caption text-grey-darken-1">Espacio Usado</div>
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
              label="Buscar archivos"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <!-- Filtro por tipo -->
          <v-col cols="12" md="2">
            <v-select
              v-model="filtroTipo"
              label="Tipo"
              :items="opcionesTipo"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <!-- Filtro por categoría -->
          <v-col cols="12" md="2">
            <v-select
              v-model="filtroCategoria"
              label="Categoría"
              :items="opcionesCategoria"
              variant="outlined"
              density="compact"
              clearable
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

          <!-- Botón subir -->
          <v-col cols="12" md="2" class="d-flex justify-end">
            <v-btn
              v-if="hasPermission('archivos', 'subir')"
              color="#485696"
              prepend-icon="mdi-cloud-upload"
              @click="mostrarDialogoSubir = true"
              block
            >
              Subir
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="archivoStore.loading && archivosFiltrados.length === 0" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-subtitle-1 mt-4 text-grey-darken-1">Cargando archivos...</p>
    </div>

    <!-- Estado vacío -->
    <v-card
      v-else-if="!archivoStore.loading && archivosFiltrados.length === 0"
      class="text-center py-12"
      elevation="0"
      variant="tonal"
    >
      <v-icon size="80" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
      <h3 class="text-h6 mt-4 mb-2">
        {{
          tieneFiltrosActivos
            ? 'No se encontraron archivos que coincidan con los filtros'
            : 'No hay archivos aún'
        }}
      </h3>
      <p class="text-body-2 text-grey-darken-1 mb-4">
        {{
          tieneFiltrosActivos
            ? 'Intenta ajustar los filtros o sube un nuevo archivo'
            : 'Comienza subiendo el primer archivo o enlace del proyecto'
        }}
      </p>
      <v-btn
        v-if="hasPermission('archivos', 'subir')"
        color="#485696"
        variant="elevated"
        prepend-icon="mdi-cloud-upload"
        @click="mostrarDialogoSubir = true"
      >
        {{ tieneFiltrosActivos ? 'Subir Archivo' : 'Subir Primer Archivo' }}
      </v-btn>
    </v-card>

    <!-- Grid de archivos -->
    <v-row v-else>
      <v-col
        v-for="archivo in archivosFiltrados"
        :key="archivo.idArchivo"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <ArchivoCard
          :archivo="archivo"
          :puede-editar="hasPermission('archivos', 'editar')"
          :puede-eliminar="hasPermission('archivos', 'eliminar')"
          @previsualizar="abrirPreview"
          @descargar="descargarArchivo"
          @editar="abrirEdicion"
          @eliminar="confirmarEliminacion"
          @abrir-enlace="abrirEnlace"
        />
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <ArchivoUploadDialog
      v-model="mostrarDialogoSubir"
      :proyecto-id="proyectoId"
      @archivo-subido="onArchivoSubido"
      @enlace-agregado="onEnlaceAgregado"
    />

    <ArchivoEditDialog
      v-model="mostrarDialogoEditar"
      :archivo="archivoSeleccionado"
      @archivo-actualizado="onArchivoActualizado"
    />

    <ArchivoPreviewDialog
      v-model="mostrarDialogoPreview"
      :archivo="archivoPreview"
      @descargar="descargarArchivo"
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
            ¿Está seguro que desea eliminar este
            {{ archivoAEliminar?.esEnlace ? 'enlace' : 'archivo' }}?
          </p>
          <v-card variant="tonal" color="grey-lighten-4" class="pa-3">
            <div class="d-flex align-center mb-2">
              <v-icon :icon="archivoAEliminar?.icono" class="mr-2" color="grey" size="32" />
              <p class="text-h6 font-weight-bold text-grey-darken-3 mb-0">
                {{ archivoAEliminar?.nombre }}
              </p>
            </div>
            <p v-if="archivoAEliminar?.descripcion" class="text-body-2 mb-0 text-grey-darken-3">
              {{ archivoAEliminar.descripcion }}
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
            :disabled="archivoStore.loading"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarArchivo" :loading="archivoStore.loading">
            Eliminar {{ archivoAEliminar?.esEnlace ? 'Enlace' : 'Archivo' }}
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
import { useArchivoStore } from '../../archivos/store/archivo.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { ArchivoListItem, CategoriaArchivo } from '../../archivos/interfaces/archivo.interface'
import { TipoArchivo } from '../../archivos/interfaces/archivo.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Importar componentes
import ArchivoCard from '../../archivos/components/ArchivoCard.vue'
import ArchivoUploadDialog from '../../archivos/components/ArchivoUploadDialog.vue'
import ArchivoEditDialog from '../../archivos/components/ArchivoEditDialog.vue'
import ArchivoPreviewDialog from '../../archivos/components/ArchivoPreviewDialog.vue'

interface Props {
  proyectoId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'archivo-subido': []
  'archivo-actualizado': []
}>()

const archivoStore = useArchivoStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroTipo = ref('')
const filtroCategoria = ref('')
const ordenamiento = ref('reciente')
const mostrarDialogoSubir = ref(false)
const mostrarDialogoEditar = ref(false)
const mostrarDialogoPreview = ref(false)
const mostrarConfirmacionEliminacion = ref(false)
const archivoSeleccionado = ref<ArchivoListItem | null>(null)
const archivoAEliminar = ref<ArchivoListItem | null>(null)
const archivoPreview = ref<ArchivoListItem | null>(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Opciones de filtros
const opcionesTipo = computed(() => {
  const tipos = Object.values(TipoArchivo).map((tipo) => ({
    title: tipo.toUpperCase(),
    value: tipo,
  }))
  return tipos
})

const opcionesCategoria = [
  { title: 'Documentos', value: 'documento' },
  { title: 'Imágenes', value: 'imagen' },
  { title: 'Comprimidos', value: 'comprimido' },
  { title: 'Enlaces', value: 'enlace' },
]

const opcionesOrdenamiento = [
  { title: 'Más recientes', value: 'reciente' },
  { title: 'Más antiguos', value: 'antigua' },
  { title: 'Por nombre (A-Z)', value: 'nombre-asc' },
  { title: 'Por nombre (Z-A)', value: 'nombre-desc' },
  { title: 'Por tamaño', value: 'tamaño' },
]

// Computed
const tieneFiltrosActivos = computed(() => {
  return busqueda.value.trim() !== '' || filtroTipo.value !== '' || filtroCategoria.value !== ''
})

const archivosFiltrados = computed(() => {
  let resultado = [...archivoStore.archivos]

  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (archivo) =>
        archivo.nombre.toLowerCase().includes(termino) ||
        archivo.descripcion?.toLowerCase().includes(termino),
    )
  }

  // Filtrar por tipo
  if (filtroTipo.value) {
    resultado = resultado.filter((archivo) => archivo.tipo === filtroTipo.value)
  }

  // Filtrar por categoría
  if (filtroCategoria.value) {
    resultado = resultado.filter((archivo) => archivo.categoria === filtroCategoria.value)
  }

  // Ordenar
  switch (ordenamiento.value) {
    case 'reciente':
      resultado.sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
      break
    case 'antigua':
      resultado.sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime())
      break
    case 'nombre-asc':
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
      break
    case 'nombre-desc':
      resultado.sort((a, b) => b.nombre.localeCompare(a.nombre))
      break
    case 'tamaño':
      resultado.sort((a, b) => (b.tamaño || 0) - (a.tamaño || 0))
      break
  }

  return resultado
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

async function cargarArchivos() {
  try {
    await archivoStore.cargarArchivosPorProyecto(props.proyectoId)
  } catch (error) {
    mostrarMensaje('Error al cargar los archivos', 'error')
  }
}

function abrirPreview(archivo: ArchivoListItem) {
  archivoPreview.value = archivo
  mostrarDialogoPreview.value = true
}

async function descargarArchivo(archivo: ArchivoListItem) {
  if (archivo.esEnlace) {
    // Si es enlace, abrir en nueva pestaña
    window.open(archivo.url, '_blank', 'noopener,noreferrer')
    return
  }

  try {
    await archivoStore.descargarArchivo(archivo.idArchivo, archivo.nombre)
    mostrarMensaje('Archivo descargado correctamente', 'success')
  } catch (error) {
    mostrarMensaje('Error al descargar el archivo', 'error')
  }
}

function abrirEdicion(archivo: ArchivoListItem) {
  archivoSeleccionado.value = archivo
  mostrarDialogoEditar.value = true
}

function confirmarEliminacion(archivo: ArchivoListItem) {
  archivoAEliminar.value = archivo
  mostrarConfirmacionEliminacion.value = true
}

async function eliminarArchivo() {
  if (!archivoAEliminar.value) return

  try {
    const esEnlace = archivoAEliminar.value.esEnlace
    await archivoStore.eliminarArchivo(archivoAEliminar.value.idArchivo)
    mostrarConfirmacionEliminacion.value = false
    archivoAEliminar.value = null
    mostrarMensaje(`${esEnlace ? 'Enlace' : 'Archivo'} eliminado correctamente`, 'success')
    emit('archivo-actualizado')
  } catch (error) {
    mostrarMensaje('Error al eliminar', 'error')
  }
}

function abrirEnlace(archivo: ArchivoListItem) {
  if (archivo.esEnlace) {
    window.open(archivo.url, '_blank', 'noopener,noreferrer')
  }
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroTipo.value = ''
  filtroCategoria.value = ''
}

// Event handlers
function onArchivoSubido() {
  mostrarDialogoSubir.value = false
  mostrarMensaje('Archivo(s) subido(s) correctamente', 'success')
  emit('archivo-subido')
}

function onEnlaceAgregado() {
  mostrarDialogoSubir.value = false
  mostrarMensaje('Enlace agregado correctamente', 'success')
  emit('archivo-subido')
}

async function onArchivoActualizado() {
  mostrarDialogoEditar.value = false
  archivoSeleccionado.value = null
  await cargarArchivos()
  mostrarMensaje('Archivo actualizado correctamente', 'success')
  emit('archivo-actualizado')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Watchers
watch(
  () => props.proyectoId,
  (nuevoId) => {
    if (nuevoId) {
      cargarArchivos()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.proyectoId) {
    cargarArchivos()
  }
})
</script>

<style scoped>
.archivos-proyecto-tab {
  padding: 2px;
}

.v-card {
  border-radius: 12px;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

@media (max-width: 960px) {
  .archivos-proyecto-tab {
    padding: 0;
  }
}
</style>
