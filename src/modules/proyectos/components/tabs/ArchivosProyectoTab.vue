<template>
  <div class="archivos-proyecto">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Archivos del Proyecto</h3>
      <v-btn
        color="primary"
        prepend-icon="mdi-file-plus"
        @click="mostrarDialogoSubirArchivo = true"
      >
        Subir Archivo
      </v-btn>
    </div>

    <!-- Estado vacío (ya que no hay archivos aún) -->
    <div class="text-center py-12">
      <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-file-multiple-outline</v-icon>
      <h3 class="text-h5 mb-2">No hay archivos</h3>
      <p class="text-body-1 text-grey-darken-1 mb-4">
        Sube documentos, imágenes y otros archivos relacionados con este proyecto
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-file-plus"
        @click="mostrarDialogoSubirArchivo = true"
      >
        Subir Primer Archivo
      </v-btn>
    </div>

    <!-- Preview de cómo se verán los archivos -->
    <v-expansion-panels v-if="false" class="mb-4">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon class="mr-2">mdi-eye</v-icon>
          Vista Previa de Funcionalidades
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="py-4">
            <v-row>
              <v-col cols="12" sm="6" md="4" v-for="i in 3" :key="i">
                <v-card variant="outlined" class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-avatar size="32" :color="obtenerColorArchivo('pdf')" class="mr-3">
                      <v-icon color="white" size="16">{{ obtenerIconoArchivo('pdf') }}</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-body-2 font-weight-medium">documento-ejemplo.pdf</div>
                      <div class="text-caption text-grey-darken-1">2.5 MB • Hace 2 días</div>
                    </div>
                  </div>
                  <v-chip size="small" variant="tonal" color="info">Documento</v-chip>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Dialog placeholder para subir archivo -->
    <v-dialog v-model="mostrarDialogoSubirArchivo" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2" color="primary">mdi-file-plus</v-icon>
          Subir Archivo
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <template v-slot:title>🚧 Módulo en Desarrollo</template>
            El módulo de archivos de proyecto está siendo desarrollado. Próximamente podrás subir y
            gestionar archivos en tus proyectos.
          </v-alert>

          <!-- Simulación de área de drag & drop -->
          <v-card variant="outlined" class="pa-8 text-center mb-4" style="border: 2px dashed #ccc">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-cloud-upload</v-icon>
            <div class="text-body-1 mb-2">Arrastra archivos aquí o haz clic para seleccionar</div>
            <div class="text-caption text-grey-darken-1">
              Formatos soportados: PDF, DOC, XLS, JPG, PNG, ZIP
            </div>
          </v-card>

          <p><strong>Funcionalidades que incluirá:</strong></p>
          <ul class="ml-4">
            <li>Subida de archivos por drag & drop</li>
            <li>Organización en carpetas</li>
            <li>Vista previa de imágenes y documentos</li>
            <li>Control de versiones</li>
            <li>Comentarios y etiquetas</li>
            <li>Búsqueda por nombre y contenido</li>
            <li>Permisos de acceso</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="mostrarDialogoSubirArchivo = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  proyectoId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'archivo-subido': []
}>()

const mostrarDialogoSubirArchivo = ref(false)

function obtenerColorArchivo(tipo: string): string {
  const colores: Record<string, string> = {
    pdf: 'error',
    doc: 'info',
    xls: 'success',
    jpg: 'purple',
    png: 'purple',
    zip: 'warning',
  }
  return colores[tipo] || 'grey'
}

function obtenerIconoArchivo(tipo: string): string {
  const iconos: Record<string, string> = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word-box',
    xls: 'mdi-file-excel-box',
    jpg: 'mdi-file-image',
    png: 'mdi-file-image',
    zip: 'mdi-zip-box',
  }
  return iconos[tipo] || 'mdi-file'
}
</script>

<style scoped>
.archivos-proyecto {
  padding: 1rem 0;
}

.v-card {
  border-radius: 12px;
}
</style>
