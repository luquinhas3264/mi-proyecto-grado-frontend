<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-note-plus</v-icon>
        Nueva Nota
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Contenido de la nota -->
          <v-textarea
            v-model="form.contenido"
            label="Contenido de la Nota"
            placeholder="Escribe tu nota aquí..."
            prepend-inner-icon="mdi-text"
            variant="outlined"
            color="#485696"
            :rules="rules.contenido"
            rows="8"
            auto-grow
            counter
            maxlength="2000"
            required
            autofocus
          >
            <template v-slot:append-inner>
              <v-tooltip text="Soporte para texto enriquecido">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" color="info">mdi-information-outline</v-icon>
                </template>
              </v-tooltip>
            </template>
          </v-textarea>

          <!-- Tips de formato -->
          <v-alert type="info" variant="tonal" density="compact" class="mt-2">
            <template v-slot:prepend>
              <v-icon>mdi-lightbulb-outline</v-icon>
            </template>
            <div class="text-caption">
              <strong>Tip:</strong> Usa saltos de línea para organizar mejor tu nota. El contenido
              se guardará con el formato que escribas.
            </div>
          </v-alert>

          <!-- Contador de caracteres visual -->
          <div class="d-flex justify-end mt-2">
            <v-chip
              :color="obtenerColorContador()"
              variant="tonal"
              size="small"
              prepend-icon="mdi-text-box"
            >
              {{ form.contenido.length }} / 2000 caracteres
            </v-chip>
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
          :disabled="!formValido"
          prepend-icon="mdi-content-save"
        >
          Crear Nota
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNotaProyectoStore } from '../store/nota.store'
import type { CreateNotaProyectoDto } from '../interfaces/nota.interface'

interface Props {
  modelValue: boolean
  proyectoId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'nota-creada': []
}>()

const notaStore = useNotaProyectoStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateNotaProyectoDto>({
  contenido: '',
})

const loading = ref(false)
const error = ref('')

// Validaciones
const rules = {
  contenido: [
    (v: string) => !!v || 'El contenido de la nota es obligatorio',
    (v: string) => v.trim().length >= 3 || 'El contenido debe tener al menos 3 caracteres',
    (v: string) => v.length <= 2000 || 'El contenido no puede exceder 2000 caracteres',
  ],
}

// Computed
const formValido = computed(() => {
  return form.value.contenido.trim().length >= 3 && form.value.contenido.length <= 2000
})

// Métodos
function obtenerColorContador(): string {
  const longitud = form.value.contenido.length
  if (longitud > 1800) return 'error'
  if (longitud > 1500) return 'warning'
  return 'success'
}

async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    await notaStore.crearNota(props.proyectoId, {
      contenido: form.value.contenido.trim(),
    })
    emit('nota-creada')
    limpiarFormulario()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear la nota'
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
    contenido: '',
  }
  error.value = ''
  formRef.value?.resetValidation()
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

/* Mejorar la visualización del textarea */
:deep(.v-input__details) {
  padding-top: 4px;
}
</style>
