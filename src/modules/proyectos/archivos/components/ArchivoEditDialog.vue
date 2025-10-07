<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card v-if="archivo">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-pencil</v-icon>
        Editar {{ archivo.esEnlace ? 'Enlace' : 'Archivo' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Preview del archivo -->
          <v-card variant="tonal" :color="obtenerColorCategoria(archivo.categoria)" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar size="48" :color="obtenerColorCategoria(archivo.categoria)" class="mr-3">
                  <v-icon :icon="archivo.icono" color="white" />
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-medium">{{ archivo.nombre }}</div>
                  <div class="text-caption">
                    <v-chip
                      size="x-small"
                      :color="obtenerColorCategoria(archivo.categoria)"
                      variant="tonal"
                    >
                      {{ archivo.tipo.toUpperCase() }}
                    </v-chip>
                    <span v-if="archivo.tamañoFormateado" class="ml-2">
                      {{ archivo.tamañoFormateado }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Nombre del archivo -->
          <v-text-field
            v-model="form.nombre"
            label="Nombre *"
            prepend-inner-icon="mdi-text"
            variant="outlined"
            color="#485696"
            :rules="rules.nombre"
            hint="Nombre descriptivo para identificar el archivo"
          />

          <!-- Descripción -->
          <v-textarea
            v-model="form.descripcion"
            label="Descripción (opcional)"
            prepend-inner-icon="mdi-text-box"
            variant="outlined"
            rows="3"
            color="#485696"
            :rules="rules.descripcion"
            counter="500"
            class="mt-4"
          />

          <!-- Información adicional -->
          <v-card variant="tonal" color="info" class="mt-4">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                <span class="font-weight-medium">Información del Archivo</span>
              </div>
              <div class="text-body-2">
                <strong>ID:</strong> {{ archivo.idArchivo }}<br />
                <strong>Subido el:</strong> {{ formatearFecha(archivo.creadoEn) }}<br />
                <strong v-if="archivo.usuarioCreador">Subido por:</strong>
                {{ archivo.usuarioCreador?.nombre }}<br />
                <strong v-if="archivo.esEnlace">URL:</strong>
                <a
                  v-if="archivo.esEnlace"
                  :href="archivo.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary"
                >
                  {{ archivo.url }}
                </a>
              </div>
            </v-card-text>
          </v-card>
        </v-form>

        <!-- Error -->
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4" border="start" prominent>
          {{ error }}
        </v-alert>

        <!-- Confirmación de cambios -->
        <v-alert
          v-if="hayCambios"
          type="info"
          variant="tonal"
          class="mt-4"
          border="start"
          prominent
        >
          <template v-slot:title>📝 Cambios Pendientes</template>
          Se han detectado cambios. Recuerda guardar para aplicarlos.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="outlined" @click="cancelar" :disabled="loading"> Cancelar </v-btn>
        <v-btn color="#485696" @click="onSubmit" :loading="loading" :disabled="!hayCambios">
          <v-icon start>mdi-content-save</v-icon>
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useArchivoStore } from '../store/archivo.store'
import type { ArchivoListItem, UpdateArchivoDto } from '../interfaces/archivo.interface'
import { obtenerColorCategoria } from '../interfaces/archivo.interface'

interface Props {
  modelValue: boolean
  archivo: ArchivoListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'archivo-actualizado': []
}>()

const archivoStore = useArchivoStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateArchivoDto>({
  nombre: '',
  descripcion: '',
})

const valoresOriginales = ref<UpdateArchivoDto>({})
const loading = ref(false)
const error = ref('')

// Validaciones
const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre es obligatorio',
    (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
    (v: string) => v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  descripcion: [(v: string) => !v || v.length <= 500 || 'Máximo 500 caracteres'],
}

// Computed
const hayCambios = computed(() => {
  return (
    form.value.nombre !== valoresOriginales.value.nombre ||
    form.value.descripcion !== valoresOriginales.value.descripcion
  )
})

// Métodos
function cargarDatosArchivo() {
  if (props.archivo) {
    form.value = {
      nombre: props.archivo.nombre,
      descripcion: props.archivo.descripcion || '',
    }

    valoresOriginales.value = { ...form.value }
  }
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function onSubmit() {
  if (!props.archivo) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateArchivoDto = {}

    if ((form.value.nombre ?? '') !== (valoresOriginales.value.nombre ?? '')) {
      cambios.nombre = (form.value.nombre ?? '').trim()
    }

    if (form.value.descripcion !== valoresOriginales.value.descripcion) {
      cambios.descripcion = form.value.descripcion?.trim() || undefined
    }

    await archivoStore.actualizarArchivo(props.archivo.idArchivo, cambios)
    emit('archivo-actualizado')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar el archivo'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  error.value = ''
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.archivo) {
      cargarDatosArchivo()
    }
  },
)

watch(
  () => props.archivo,
  () => {
    if (props.modelValue && props.archivo) {
      cargarDatosArchivo()
    }
  },
)
</script>

<style scoped>
.v-card-title {
  padding: 1.5rem;
  background: linear-gradient(135deg, #ff9800 0%, #fb8c00 100%);
  color: white;
  font-weight: 600;
}

.v-card-actions {
  background: #f8f9fa;
}
</style>
