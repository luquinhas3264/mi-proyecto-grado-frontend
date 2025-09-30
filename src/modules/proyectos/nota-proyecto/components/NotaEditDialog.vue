<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card v-if="nota">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-note-edit</v-icon>
        Editar Nota
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
          />

          <!-- Contador de caracteres visual -->
          <div class="d-flex justify-end mt-2">
            <v-chip
              :color="obtenerColorContador()"
              variant="tonal"
              size="small"
              prepend-icon="mdi-text-box"
            >
              {{ form.contenido?.length || 0 }} / 2000 caracteres
            </v-chip>
          </div>

          <!-- Información de la nota original -->
          <v-card variant="tonal" color="info" class="mt-4">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                <span class="font-weight-medium">Información de la Nota</span>
              </div>
              <div class="text-body-2">
                <strong>Creada:</strong> {{ formatearFecha(nota.fecha) }}<br />
                <strong>ID:</strong> {{ nota.idNota }}
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
          type="warning"
          variant="tonal"
          class="mt-4"
          border="start"
          prominent
        >
          <template v-slot:title>📝 Cambios Pendientes</template>
          Se han detectado cambios en el contenido. Recuerda guardar para aplicarlos.
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
          :disabled="!hayCambios || !formValido"
          prepend-icon="mdi-content-save"
        >
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNotaProyectoStore } from '../store/nota.store'
import type { NotaProyecto, UpdateNotaProyectoDto } from '../interfaces/nota.interface'

interface Props {
  modelValue: boolean
  nota: NotaProyecto | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'nota-actualizada': []
}>()

const notaStore = useNotaProyectoStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateNotaProyectoDto>({
  contenido: '',
})

const contenidoOriginal = ref('')
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
  return (
    form.value.contenido &&
    form.value.contenido.trim().length >= 3 &&
    form.value.contenido.length <= 2000
  )
})

const hayCambios = computed(() => {
  return form.value.contenido !== contenidoOriginal.value
})

// Métodos
function obtenerColorContador(): string {
  const longitud = form.value.contenido?.length || 0
  if (longitud > 1800) return 'error'
  if (longitud > 1500) return 'warning'
  return 'success'
}

function cargarDatosNota() {
  if (props.nota) {
    form.value.contenido = props.nota.contenido
    contenidoOriginal.value = props.nota.contenido
  }
}

async function onSubmit() {
  if (!props.nota) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    await notaStore.actualizarNota(props.nota.idNota, {
      contenido: form.value.contenido?.trim(),
    })
    emit('nota-actualizada')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar la nota'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  error.value = ''
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

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.nota) {
      cargarDatosNota()
    }
  },
)

watch(
  () => props.nota,
  () => {
    if (props.modelValue && props.nota) {
      cargarDatosNota()
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
</style>
