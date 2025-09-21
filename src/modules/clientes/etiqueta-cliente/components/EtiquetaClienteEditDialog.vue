<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
    persistent
  >
    <v-card v-if="etiqueta">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-tag-edit</v-icon>
        Editar Etiqueta
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Información actual -->
          <v-card variant="tonal" color="info" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center">
                <v-chip :color="colorOriginal" size="large" variant="elevated" class="mr-3">
                  <v-icon start>mdi-tag</v-icon>
                  {{ etiqueta.nombre }}
                </v-chip>
                <div>
                  <div class="font-weight-medium">Etiqueta Actual</div>
                  <div class="text-caption text-grey-darken-1">ID: {{ etiqueta.idEtiqueta }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Nuevo nombre de la etiqueta -->
          <v-text-field
            v-model="form.nombre"
            label="Nombre de la etiqueta"
            prepend-inner-icon="mdi-tag"
            variant="outlined"
            color="#485696"
            :rules="rules.nombre"
            :error-messages="errorNombreUnico"
            @input="validarNombreUnico"
            counter="50"
          />

          <!-- Vista previa del cambio -->
          <div class="mt-4" v-if="hayCambios">
            <v-label class="text-subtitle-2 mb-2">Vista previa del cambio:</v-label>
            <div class="d-flex align-center gap-2">
              <v-chip
                :color="colorOriginal"
                size="large"
                variant="outlined"
                class="text-decoration-line-through"
              >
                <v-icon start>mdi-tag</v-icon>
                {{ etiqueta.nombre }}
              </v-chip>
              <v-icon>mdi-arrow-right</v-icon>
              <v-chip :color="colorNuevo" size="large" variant="elevated">
                <v-icon start>mdi-tag</v-icon>
                {{ (form.nombre ?? '').trim() }}
              </v-chip>
            </div>
          </div>
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
          Se han detectado cambios en la etiqueta. Recuerda guardar para aplicarlos.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="outlined" @click="cancelar" :disabled="loading"> Cancelar </v-btn>
        <v-btn
          color="#485696"
          @click="onSubmit"
          :loading="loading"
          :disabled="!hayCambios || !!errorNombreUnico"
        >
          <v-icon start>mdi-content-save</v-icon>
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEtiquetaClienteStore } from '../store/etiqueta-cliente.store'
import type {
  EtiquetaClienteListItem,
  UpdateEtiquetaClienteDto,
} from '../interfaces/etiqueta-cliente.interface'

interface Props {
  modelValue: boolean
  etiqueta: EtiquetaClienteListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'etiqueta-actualizada': []
}>()

const etiquetaClienteStore = useEtiquetaClienteStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateEtiquetaClienteDto>({
  nombre: '',
})

const valorOriginal = ref('')
const loading = ref(false)
const error = ref('')
const errorNombreUnico = ref('')

// Validaciones
const rules = {
  nombre: [
    (v: string) => !v || v.trim().length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => !v || v.trim().length <= 50 || 'El nombre no puede exceder 50 caracteres',
    (v: string) =>
      !v ||
      /^[a-zA-ZÀ-ÿ0-9\s\-_]+$/.test(v) ||
      'Solo se permiten letras, números, espacios, guiones y guiones bajos',
  ],
}

// Computed
const hayCambios = computed(() => {
  return form.value.nombre?.trim() !== valorOriginal.value
})

const generarColor = (nombre: string) => {
  if (!nombre) return '#485696'

  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colores = [
    '#1976D2',
    '#388E3C',
    '#F57C00',
    '#D32F2F',
    '#7B1FA2',
    '#0288D1',
    '#00796B',
    '#F9A825',
    '#C2185B',
    '#5D4037',
    '#455A64',
    '#E64A19',
    '#00BCD4',
    '#8BC34A',
    '#FF9800',
  ]

  return colores[Math.abs(hash) % colores.length]
}

const colorOriginal = computed(() => {
  return props.etiqueta ? generarColor(props.etiqueta.nombre) : '#485696'
})

const colorNuevo = computed(() => {
  return form.value.nombre ? generarColor(form.value.nombre.trim()) : '#485696'
})

// Métodos
let timeoutId: ReturnType<typeof setTimeout> | null = null

const validarNombreUnico = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  errorNombreUnico.value = ''

  if (!form.value.nombre?.trim() || form.value.nombre.trim().length < 2) {
    return
  }

  // No validar si el nombre no ha cambiado
  if (form.value.nombre.trim() === valorOriginal.value) {
    return
  }

  timeoutId = setTimeout(async () => {
    try {
      const esUnico = await etiquetaClienteStore.etiquetas.every(
        (e) =>
          e.nombre.toLowerCase() !== form.value.nombre!.trim().toLowerCase() ||
          e.idEtiqueta === props.etiqueta?.idEtiqueta,
      )

      if (!esUnico) {
        errorNombreUnico.value = 'Ya existe una etiqueta con ese nombre'
      }
    } catch (error) {
      console.error('Error validando nombre único:', error)
    }
  }, 500)
}

function cargarDatosEtiqueta() {
  if (props.etiqueta) {
    form.value = {
      nombre: props.etiqueta.nombre,
    }
    valorOriginal.value = props.etiqueta.nombre
  }
}

async function onSubmit() {
  if (!props.etiqueta) return

  const { valid } = await formRef.value?.validate()
  if (!valid || errorNombreUnico.value) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateEtiquetaClienteDto = {}

    if (form.value.nombre?.trim() !== valorOriginal.value) {
      cambios.nombre = form.value.nombre?.trim()
    }

    await etiquetaClienteStore.actualizarEtiqueta(props.etiqueta.idEtiqueta, cambios)
    emit('etiqueta-actualizada')
  } catch (err: any) {
    error.value = err.message || 'Error al actualizar la etiqueta'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  error.value = ''
  errorNombreUnico.value = ''

  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.etiqueta) {
      cargarDatosEtiqueta()
    }
  },
)

watch(
  () => props.etiqueta,
  () => {
    if (props.modelValue && props.etiqueta) {
      cargarDatosEtiqueta()
    }
  },
)
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-card-title {
  padding: 1.5rem;
  background: linear-gradient(135deg, #ff8c00 0%, #ffb74d 100%);
  color: white;
  font-weight: 600;
}

.v-card-actions {
  background: #f8f9fa;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
