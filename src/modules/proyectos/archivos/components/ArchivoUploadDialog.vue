<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-cloud-upload</v-icon>
        {{ tipoSubida === 'archivo' ? 'Subir Archivo' : 'Agregar Enlace' }}
      </v-card-title>

      <v-divider />

      <!-- Tabs para cambiar entre Archivo y Enlace -->
      <v-tabs v-model="tipoSubida" color="#485696" grow>
        <v-tab value="archivo">
          <v-icon start>mdi-file-upload</v-icon>
          Subir Archivo
        </v-tab>
        <v-tab value="enlace">
          <v-icon start>mdi-link-plus</v-icon>
          Agregar Enlace
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Tab de Subir Archivo -->
        <div v-if="tipoSubida === 'archivo'">
          <!-- Zona de drop -->
          <div
            class="upload-zone"
            :class="{ 'upload-zone--dragging': isDragging, 'upload-zone--error': uploadError }"
            @drop.prevent="onDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              :accept="acceptedTypes"
              multiple
              style="display: none"
              @change="onFileSelect"
            />

            <v-icon size="64" color="primary" class="mb-4">
              {{ isDragging ? 'mdi-cloud-download' : 'mdi-cloud-upload-outline' }}
            </v-icon>

            <h3 class="text-h6 mb-2">
              {{ isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic' }}
            </h3>

            <p class="text-body-2 text-grey-darken-1 mb-2">
              Tipos permitidos: {{ tiposPermitidosTexto }}
            </p>

            <p class="text-caption text-grey-darken-1">
              Tamaño máximo: {{ tamañoMaximoTexto }} por archivo
            </p>
          </div>

          <!-- Lista de archivos seleccionados -->
          <v-list v-if="archivosSeleccionados.length > 0" class="mt-4">
            <v-list-subheader>
              Archivos seleccionados ({{ archivosSeleccionados.length }})
            </v-list-subheader>
            <v-list-item
              v-for="(archivo, index) in archivosSeleccionados"
              :key="index"
              class="border mb-2 rounded"
            >
              <template v-slot:prepend>
                <v-icon :icon="obtenerIconoPorTipo(archivo.type)" color="primary" />
              </template>

              <v-list-item-title>{{ archivo.name }}</v-list-item-title>
              <v-list-item-subtitle>{{
                formatearTamañoArchivo(archivo.size)
              }}</v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon="mdi-close"
                  size="small"
                  variant="text"
                  @click="removerArchivo(index)"
                />
              </template>
              <!-- Solo mostrar campo de descripción individual si hay más de un archivo -->
              <v-text-field
                v-if="archivosSeleccionados.length > 1"
                v-model="descripcionesArchivos[index]"
                label="Descripción (opcional)"
                variant="outlined"
                rows="2"
                color="#485696"
                class="mt-2"
                hint="Agrega una descripción para el archivo"
                counter="500"
                :rules="[(v) => !v || v.length <= 500 || 'Máximo 500 caracteres']"
              />
            </v-list-item>
          </v-list>

          <!-- Solo mostrar campo de descripción general si hay un solo archivo -->
          <v-textarea
            v-if="archivosSeleccionados.length === 1"
            v-model="descripcionArchivo"
            label="Descripción (opcional)"
            variant="outlined"
            rows="2"
            color="#485696"
            class="mt-4"
            hint="Agrega una descripción para el archivo"
            counter="500"
            :rules="[(v) => !v || v.length <= 500 || 'Máximo 500 caracteres']"
          />
        </div>

        <!-- Tab de Agregar Enlace -->
        <div v-else>
          <v-form ref="formEnlaceRef">
            <!-- URL del enlace -->
            <v-text-field
              v-model="formEnlace.url"
              label="URL del enlace *"
              prepend-inner-icon="mdi-link"
              variant="outlined"
              color="#485696"
              :rules="rulesEnlace.url"
              :loading="previsualizando"
              @blur="previsualizarUrlAutomatico"
              class="pb-3"
            />

            <!-- Preview de URL -->
            <v-card v-if="previewUrl" variant="tonal" color="info" class="mb-4 pb-2">
              <v-card-text>
                <div class="d-flex align-center">
                  <span class="text-h4 mr-3">{{ previewUrl.icono }}</span>
                  <div class="flex-grow-1">
                    <div class="font-weight-medium">{{ previewUrl.nombre }}</div>
                    <div class="text-caption text-grey-darken-1">
                      {{ previewUrl.descripcionSugerida }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Nombre del enlace -->
            <v-text-field
              v-model="formEnlace.nombre"
              label="Nombre del enlace *"
              prepend-inner-icon="mdi-text"
              variant="outlined"
              color="#485696"
              :rules="rulesEnlace.nombre"
              hint="Nombre descriptivo para identificar el enlace"
              class="pb-4"
            />

            <!-- Descripción -->
            <v-textarea
              v-model="formEnlace.descripcion"
              label="Descripción (opcional)"
              prepend-inner-icon="mdi-text-box"
              variant="outlined"
              rows="3"
              color="#485696"
              :rules="rulesEnlace.descripcion"
              counter="500"
            />

            <!-- Información de dominios seguros -->
            <v-alert type="info" variant="tonal" class="mt-2">
              <template v-slot:title>💡 Dominios recomendados</template>
              Google Drive, Dropbox, OneDrive, Figma, Canva, GitHub y más.
            </v-alert>
          </v-form>
        </div>

        <!-- Barra de progreso de subida -->
        <v-progress-linear
          v-if="uploading"
          :model-value="uploadProgress"
          color="success"
          height="8"
          rounded
          class="mt-4"
        >
          <template v-slot:default="{ value }">
            <strong>{{ Math.ceil(value) }}%</strong>
          </template>
        </v-progress-linear>

        <!-- Error -->
        <v-alert v-if="uploadError" type="error" variant="tonal" class="mt-4" prominent>
          {{ uploadError }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="outlined" @click="cancelar" :disabled="uploading"> Cancelar </v-btn>
        <v-btn color="#485696" @click="confirmar" :loading="uploading" :disabled="!puedeConfirmar">
          <v-icon start>
            {{ tipoSubida === 'archivo' ? 'mdi-cloud-upload' : 'mdi-link-plus' }}
          </v-icon>
          {{ tipoSubida === 'archivo' ? 'Subir Archivos' : 'Agregar Enlace' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useArchivoStore } from '../store/archivo.store'
import { ARCHIVO_CONSTANTS, formatearTamaño } from '../interfaces/archivo.interface'

interface Props {
  modelValue: boolean
  proyectoId: string
}

interface MetadatosUrl {
  nombre: string
  descripcionSugerida: string
  icono: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'archivo-subido': []
  'enlace-agregado': []
}>()

const archivoStore = useArchivoStore()

// Estado local
const tipoSubida = ref<'archivo' | 'enlace'>('archivo')
const archivosSeleccionados = ref<File[]>([])
const descripcionArchivo = ref('')
const descripcionesArchivos = ref<string[]>([])
const formEnlace = ref({
  url: '',
  nombre: '',
  descripcion: '',
})
const fileInput = ref<HTMLInputElement>()
const formEnlaceRef = ref()
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const previsualizando = ref(false)
const previewUrl = ref<MetadatosUrl | null>(null)

// Computed
const acceptedTypes = computed(() => {
  const mimeTypes = Object.values(ARCHIVO_CONSTANTS.MIME_TYPES)
  return mimeTypes.join(',')
})

const tiposPermitidosTexto = computed(() => {
  return ARCHIVO_CONSTANTS.TIPOS_PERMITIDOS.slice(0, 10).join(', ') + '...'
})

const tamañoMaximoTexto = computed(() => {
  return formatearTamaño(ARCHIVO_CONSTANTS.TAMAÑO_MAX_ARCHIVO)
})

const puedeConfirmar = computed(() => {
  if (tipoSubida.value === 'archivo') {
    return archivosSeleccionados.value.length > 0 && !uploading.value
  } else {
    return formEnlace.value.url && formEnlace.value.nombre && !uploading.value
  }
})

// Validaciones para enlace
const rulesEnlace = {
  url: [
    (v: string) => !!v || 'La URL es obligatoria',
    (v: string) => {
      try {
        const url = new URL(v)
        return (
          ['http:', 'https:'].includes(url.protocol) ||
          'Solo se permiten URLs con protocolo HTTP o HTTPS'
        )
      } catch {
        return 'URL inválida'
      }
    },
  ],
  nombre: [
    (v: string) => !!v || 'El nombre es obligatorio',
    (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
    (v: string) => v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  descripcion: [(v: string) => !v || v.length <= 500 || 'Máximo 500 caracteres'],
}

// Métodos
function triggerFileInput() {
  fileInput.value?.click()
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    agregarArchivos(Array.from(target.files))
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    agregarArchivos(Array.from(event.dataTransfer.files))
  }
}

function agregarArchivos(archivos: File[]) {
  uploadError.value = ''

  archivos.forEach((archivo) => {
    archivosSeleccionados.value.push(archivo)
    descripcionesArchivos.value.push('')
  })

  // Validar cada archivo
  for (const archivo of archivos) {
    // Validar tamaño
    if (archivo.size > ARCHIVO_CONSTANTS.TAMAÑO_MAX_ARCHIVO) {
      uploadError.value = `El archivo "${archivo.name}" excede el tamaño máximo permitido`
      continue
    }

    // Validar tipo
    const extension = archivo.name.split('.').pop()?.toLowerCase()
    if (!extension || !ARCHIVO_CONSTANTS.TIPOS_PERMITIDOS.includes(extension as any)) {
      uploadError.value = `El archivo "${archivo.name}" no es un tipo permitido`
      continue
    }

    // Agregar si no existe
    if (!archivosSeleccionados.value.some((a) => a.name === archivo.name)) {
      archivosSeleccionados.value.push(archivo)
    }
  }
}

function removerArchivo(index: number) {
  archivosSeleccionados.value.splice(index, 1)
}

function formatearTamañoArchivo(bytes: number): string {
  return formatearTamaño(bytes)
}

function obtenerIconoPorTipo(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'mdi-file-image'
  if (mimeType.includes('pdf')) return 'mdi-file-pdf-box'
  if (mimeType.includes('word')) return 'mdi-file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'mdi-file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
    return 'mdi-file-powerpoint'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'mdi-folder-zip'
  if (mimeType.includes('text')) return 'mdi-file-document'
  return 'mdi-file'
}

async function previsualizarUrlAutomatico() {
  if (!formEnlace.value.url) return

  try {
    previsualizando.value = true
    uploadError.value = ''

    // Validar URL básica
    const urlObj = new URL(formEnlace.value.url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      uploadError.value = 'Solo se permiten URLs con protocolo HTTP o HTTPS'
      return
    }

    // Extraer metadatos simples del dominio
    const dominio = urlObj.hostname.toLowerCase()
    let nombre = ''
    let descripcionSugerida = ''
    let icono = '🔗'

    if (dominio.includes('drive.google.com')) {
      nombre = 'Carpeta de Google Drive'
      descripcionSugerida = 'Carpeta compartida de Google Drive'
      icono = '📁'
    } else if (dominio.includes('docs.google.com')) {
      nombre = 'Documento de Google'
      descripcionSugerida = 'Documento colaborativo de Google'
      icono = '📄'
    } else if (dominio.includes('sheets.google.com')) {
      nombre = 'Hoja de cálculo de Google'
      descripcionSugerida = 'Hoja de cálculo colaborativa'
      icono = '📊'
    } else if (dominio.includes('slides.google.com')) {
      nombre = 'Presentación de Google'
      descripcionSugerida = 'Presentación colaborativa'
      icono = '📽️'
    } else if (dominio.includes('dropbox.com')) {
      nombre = 'Enlace de Dropbox'
      descripcionSugerida = 'Archivo o carpeta compartida en Dropbox'
      icono = '📦'
    } else if (dominio.includes('figma.com')) {
      nombre = 'Proyecto de Figma'
      descripcionSugerida = 'Diseño colaborativo en Figma'
      icono = '🎨'
    } else if (dominio.includes('canva.com')) {
      nombre = 'Diseño de Canva'
      descripcionSugerida = 'Diseño creado en Canva'
      icono = '🎨'
    } else if (dominio.includes('github.com')) {
      nombre = 'Repositorio de GitHub'
      descripcionSugerida = 'Código fuente en GitHub'
      icono = '💻'
    } else {
      nombre = `Enlace de ${dominio}`
      descripcionSugerida = `Recurso externo de ${dominio}`
    }

    previewUrl.value = { nombre, descripcionSugerida, icono }

    // Auto-rellenar nombre si está vacío
    if (!formEnlace.value.nombre) {
      formEnlace.value.nombre = nombre
    }
    if (!formEnlace.value.descripcion) {
      formEnlace.value.descripcion = descripcionSugerida
    }
  } catch (error) {
    uploadError.value = 'URL inválida'
    previewUrl.value = null
  } finally {
    previsualizando.value = false
  }
}

async function confirmar() {
  uploadError.value = ''
  uploading.value = true
  uploadProgress.value = 0

  try {
    if (tipoSubida.value === 'archivo') {
      await subirArchivos()
    } else {
      await agregarEnlace()
    }
  } catch (error: any) {
    uploadError.value = error.response?.data?.message || 'Error al procesar la solicitud'
  } finally {
    uploading.value = false
  }
}

async function subirArchivos() {
  if (archivosSeleccionados.value.length === 0) return

  try {
    if (archivosSeleccionados.value.length === 1) {
      // Subir un solo archivo, pero enviar array de descripciones
      await archivoStore.subirMultiplesArchivos(props.proyectoId, archivosSeleccionados.value, [
        descripcionArchivo.value || '',
      ])
    } else {
      // Subir múltiples archivos
      await archivoStore.subirMultiplesArchivos(
        props.proyectoId,
        archivosSeleccionados.value,
        descripcionesArchivos.value,
      )
    }

    emit('archivo-subido')
    limpiarFormulario()
    emit('update:modelValue', false)
  } catch (error) {
    throw error
  }
}

async function agregarEnlace() {
  const { valid } = await formEnlaceRef.value?.validate()
  if (!valid) return

  try {
    await archivoStore.agregarEnlace(props.proyectoId, {
      nombre: formEnlace.value.nombre.trim(),
      url: formEnlace.value.url.trim(),
      descripcion: formEnlace.value.descripcion?.trim() || undefined,
    })

    emit('enlace-agregado')
    limpiarFormulario()
    emit('update:modelValue', false)
  } catch (error) {
    throw error
  }
}

function cancelar() {
  emit('update:modelValue', false)
  limpiarFormulario()
}

function limpiarFormulario() {
  archivosSeleccionados.value = []
  descripcionArchivo.value = ''
  formEnlace.value = {
    url: '',
    nombre: '',
    descripcion: '',
  }
  uploadError.value = ''
  uploadProgress.value = 0
  previewUrl.value = null
  formEnlaceRef.value?.resetValidation()
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      limpiarFormulario()
    }
  },
)

watch(
  () => archivoStore.uploadProgress,
  (newProgress) => {
    uploadProgress.value = newProgress
  },
)
</script>

<style scoped>
.v-card-title {
  padding: 1.5rem;
  background: linear-gradient(135deg, #485696 0%, #5c6bc0 100%);
  color: white;
  font-weight: 600;
}

.upload-zone {
  border: 3px dashed #e0e0e0;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-zone:hover {
  border-color: #485696;
  background: #f5f5f5;
}

.upload-zone--dragging {
  border-color: #485696;
  background: #e8eaf6;
  transform: scale(1.02);
}

.upload-zone--error {
  border-color: #f44336;
  background: #ffebee;
}

.v-card-actions {
  background: #f8f9fa;
}

.border {
  border: 1px solid #e0e0e0;
}
</style>
