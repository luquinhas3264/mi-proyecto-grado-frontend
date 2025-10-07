<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="900"
    max-height="90vh"
  >
    <v-card v-if="archivo">
      <!-- Header -->
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" :icon="archivo.icono" color="white" />
        <span class="text-truncate flex-grow-1">{{ archivo.nombre }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <!-- Contenido del preview -->
      <v-card-text class="pa-0" style="max-height: 70vh; overflow-y: auto">
        <!-- Preview de Imagen -->
        <div v-if="archivo.esImagen" class="preview-container">
          <v-img :src="urlCompleta" :alt="archivo.nombre" contain max-height="600">
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="primary" size="64" />
              </div>
            </template>
          </v-img>
        </div>

        <!-- Preview de PDF -->
        <div v-else-if="archivo.tipo === 'pdf'" class="preview-container">
          <iframe
            :src="urlCompleta"
            width="100%"
            height="600"
            frameborder="0"
            style="border: none"
          />
        </div>

        <!-- Preview de Enlace -->
        <div v-else-if="archivo.esEnlace" class="preview-container pa-6">
          <div class="text-center">
            <v-icon size="80" color="purple" class="mb-4">mdi-link-variant</v-icon>
            <h2 class="text-h5 mb-2">Enlace Externo</h2>
            <p class="text-body-1 text-grey-darken-1 mb-4">
              Este es un enlace a un recurso externo
            </p>

            <v-card variant="outlined" class="mx-auto" max-width="600">
              <v-card-text>
                <div class="text-subtitle-2 text-grey-darken-1 mb-2">URL:</div>
                <a
                  :href="archivo.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary"
                >
                  {{ archivo.url }}
                </a>
              </v-card-text>
            </v-card>

            <v-btn
              color="purple"
              variant="elevated"
              size="large"
              class="mt-6"
              prepend-icon="mdi-open-in-new"
              :href="archivo.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir en nueva pestaña
            </v-btn>
          </div>
        </div>

        <!-- No se puede previsualizar -->
        <div v-else class="preview-container pa-6">
          <div class="text-center">
            <v-icon size="80" :color="obtenerColorCategoria(archivo.categoria)" class="mb-4">
              {{ archivo.icono }}
            </v-icon>
            <h2 class="text-h5 mb-2">Vista previa no disponible</h2>
            <p class="text-body-1 text-grey-darken-1 mb-4">
              Este tipo de archivo no se puede previsualizar en el navegador
            </p>

            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              prepend-icon="mdi-download"
              @click="descargarArchivo"
            >
              Descargar Archivo
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <!-- Información del archivo -->
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-3">
              <v-icon class="mr-2" size="20">mdi-information</v-icon>
              <span class="font-weight-medium">Información del Archivo</span>
            </div>

            <div class="text-body-2 mb-2"><strong>Nombre:</strong> {{ archivo.nombre }}</div>

            <div class="text-body-2 mb-2">
              <strong>Tipo:</strong>
              <v-chip
                size="x-small"
                :color="obtenerColorCategoria(archivo.categoria)"
                variant="tonal"
              >
                {{ archivo.tipo.toUpperCase() }}
              </v-chip>
            </div>

            <div v-if="archivo.tamañoFormateado" class="text-body-2 mb-2">
              <strong>Tamaño:</strong> {{ archivo.tamañoFormateado }}
            </div>

            <div class="text-body-2 mb-2">
              <strong>Categoría:</strong>
              <v-chip
                size="x-small"
                :color="obtenerColorCategoria(archivo.categoria)"
                variant="tonal"
              >
                {{ archivo.categoria }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-3">
              <v-icon class="mr-2" size="20">mdi-clock-outline</v-icon>
              <span class="font-weight-medium">Metadatos</span>
            </div>

            <div class="text-body-2 mb-2">
              <strong>Subido el:</strong> {{ formatearFechaCompleta(archivo.creadoEn) }}
            </div>

            <div v-if="archivo.usuarioCreador" class="text-body-2 mb-2">
              <strong>Subido por:</strong> {{ archivo.usuarioCreador.nombre }}
            </div>

            <div v-if="archivo.descripcion" class="text-body-2 mt-3">
              <strong>Descripción:</strong>
              <p class="mt-1">{{ archivo.descripcion }}</p>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <!-- Acciones -->
      <v-card-actions class="px-6 py-4">
        <v-btn
          v-if="!archivo.esEnlace"
          color="primary"
          variant="outlined"
          prepend-icon="mdi-download"
          @click="descargarArchivo"
        >
          Descargar
        </v-btn>

        <v-btn
          v-else
          color="purple"
          variant="outlined"
          prepend-icon="mdi-open-in-new"
          :href="archivo.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir Enlace
        </v-btn>

        <v-spacer />

        <v-btn variant="text" @click="$emit('update:modelValue', false)"> Cerrar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ArchivoListItem } from '../interfaces/archivo.interface'
import { obtenerColorCategoria } from '../interfaces/archivo.interface'
import { ArchivoService } from '../services/archivo.service'

interface Props {
  modelValue: boolean
  archivo: ArchivoListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  descargar: [archivo: ArchivoListItem]
}>()

// Computed
const urlCompleta = computed(() => {
  if (!props.archivo) return ''
  return ArchivoService.obtenerUrlCompleta(props.archivo)
})

// Métodos
function formatearFechaCompleta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function descargarArchivo() {
  if (props.archivo) {
    emit('descargar', props.archivo)
  }
}
</script>

<style scoped>
.v-card-title {
  padding: 1.5rem;
  background: linear-gradient(135deg, #485696 0%, #5c6bc0 100%);
  color: white;
  font-weight: 600;
}

.preview-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
