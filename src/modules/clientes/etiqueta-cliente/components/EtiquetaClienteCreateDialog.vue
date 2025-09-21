<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-tag-plus</v-icon>
        Crear Nueva Etiqueta
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Nombre de la etiqueta -->
          <v-text-field
            v-model="form.nombre"
            label="Nombre de la etiqueta"
            prepend-inner-icon="mdi-tag"
            variant="outlined"
            color="#485696"
            :rules="rules.nombre"
            :error-messages="errorNombreUnico"
            @input="validarNombreUnico"
            required
            autofocus
            counter="50"
          />

          <!-- Vista previa de la etiqueta -->
          <div class="mt-4">
            <v-label class="text-subtitle-2 mb-2">Vista previa:</v-label>
            <div class="d-flex align-center">
              <v-chip
                v-if="form.nombre.trim()"
                :color="colorPreview"
                size="large"
                variant="elevated"
                class="mr-2"
              >
                <v-icon start>mdi-tag</v-icon>
                {{ form.nombre.trim() }}
              </v-chip>
              <span v-else class="text-grey-darken-1"
                >Ingresa un nombre para ver la vista previa</span
              >
            </div>
          </div>
        </v-form>

        <!-- Error -->
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4" border="start" prominent>
          {{ error }}
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
          :disabled="!formValido || !!errorNombreUnico"
        >
          <v-icon start>mdi-tag-plus</v-icon>
          Crear Etiqueta
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEtiquetaClienteStore } from '../store/etiqueta-cliente.store'
import type { CreateEtiquetaClienteDto } from '../interfaces/etiqueta-cliente.interface'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'etiqueta-creada': []
}>()

const etiquetaClienteStore = useEtiquetaClienteStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateEtiquetaClienteDto>({
  nombre: '',
})

const loading = ref(false)
const error = ref('')
const errorNombreUnico = ref('')

// Validaciones
const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre es obligatorio',
    (v: string) => v.trim().length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => v.trim().length <= 50 || 'El nombre no puede exceder 50 caracteres',
    (v: string) =>
      /^[a-zA-ZÀ-ÿ0-9\s\-_]+$/.test(v) ||
      'Solo se permiten letras, números, espacios, guiones y guiones bajos',
  ],
}

// Computed
const formValido = computed(() => {
  return form.value.nombre.trim().length >= 2 && form.value.nombre.trim().length <= 50
})

// Color preview para la etiqueta
const colorPreview = computed(() => {
  if (!form.value.nombre.trim()) return '#485696'

  // Generar color basado en el hash del nombre
  let hash = 0
  const nombre = form.value.nombre.trim()
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
})

// Métodos
let timeoutId: ReturnType<typeof setTimeout> | null = null

const validarNombreUnico = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  errorNombreUnico.value = ''

  if (!form.value.nombre.trim() || form.value.nombre.trim().length < 2) {
    return
  }

  timeoutId = setTimeout(async () => {
    try {
      const esUnico = await etiquetaClienteStore.etiquetas.every(
        (e) => e.nombre.toLowerCase() !== form.value.nombre.trim().toLowerCase(),
      )

      if (!esUnico) {
        errorNombreUnico.value = 'Ya existe una etiqueta con ese nombre'
      }
    } catch (error) {
      console.error('Error validando nombre único:', error)
    }
  }, 500)
}

async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid || errorNombreUnico.value) return

  loading.value = true
  error.value = ''

  try {
    await etiquetaClienteStore.crearEtiqueta({
      nombre: form.value.nombre.trim(),
    })
    emit('etiqueta-creada')
    limpiarFormulario()
  } catch (err: any) {
    error.value = err.message || 'Error al crear la etiqueta'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  limpiarFormulario()
}

function limpiarFormulario() {
  form.value = {
    nombre: '',
  }
  error.value = ''
  errorNombreUnico.value = ''
  formRef.value?.resetValidation()

  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
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
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-card-title {
  padding: 1.5rem;
  background: linear-gradient(135deg, #485696 0%, #5c6bc0 100%);
  color: white;
  font-weight: 600;
}

.v-card-actions {
  background: #f8f9fa;
}
</style>
