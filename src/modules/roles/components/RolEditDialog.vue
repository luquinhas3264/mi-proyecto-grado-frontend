<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card v-if="rol">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-shield-edit</v-icon>
        Editar Rol
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Información del Rol -->
          <div class="mb-4">
            <h3 class="text-h6 mb-3 d-flex align-center">
              <v-icon class="mr-2" color="#485696">mdi-information-outline</v-icon>
              Información del Rol
            </h3>

            <v-row>
              <!-- Nombre del Rol -->
              <v-col cols="12">
                <v-text-field
                  v-model="form.nombre"
                  label="Nombre del rol"
                  prepend-inner-icon="mdi-shield-account"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.nombre"
                  required
                  counter="50"
                />
              </v-col>

              <!-- Descripción -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.descripcion"
                  label="Descripción (opcional)"
                  prepend-inner-icon="mdi-text"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.descripcion"
                  rows="3"
                  auto-grow
                  counter="200"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Información del Rol Original -->
          <v-card variant="tonal" color="info" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                <span class="font-weight-medium">Información Original</span>
              </div>
              <div class="text-body-2">
                <strong>ID:</strong> <span class="font-mono">{{ rol.idRol }}</span
                ><br />
                <strong>Nombre actual:</strong> {{ rol.nombre }}<br />
                <strong>Descripción actual:</strong> {{ rol.descripcion || 'Sin descripción' }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Vista previa de cambios -->
          <v-card variant="tonal" color="success" class="mb-4" v-if="hayCambios">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="success">mdi-pencil-outline</v-icon>
                <span class="font-weight-medium">Vista Previa de Cambios</span>
              </div>

              <div class="d-flex align-center">
                <v-avatar size="40" color="#485696" class="mr-3">
                  <v-icon color="white">mdi-shield-account</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold">{{ form.nombre || rol.nombre }}</div>
                  <div class="text-body-2 text-grey-darken-1">
                    {{ form.descripcion || 'Sin descripción' }}
                  </div>
                </div>
              </div>

              <div class="mt-2 d-flex flex-wrap gap-1">
                <v-chip
                  v-if="form.nombre !== valoresOriginales.nombre"
                  color="warning"
                  variant="tonal"
                  size="small"
                >
                  <v-icon start>mdi-pencil</v-icon>
                  Nombre modificado
                </v-chip>
                <v-chip
                  v-if="form.descripcion !== valoresOriginales.descripcion"
                  color="info"
                  variant="tonal"
                  size="small"
                >
                  <v-icon start>mdi-text</v-icon>
                  Descripción modificada
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Advertencia sobre permisos -->
          <v-alert type="warning" variant="tonal" class="mb-4">
            <template v-slot:title>
              <v-icon class="mr-2">mdi-alert-outline</v-icon>
              Importante
            </template>
            Los cambios en el nombre del rol pueden afectar a los usuarios que lo tienen asignado.
            Los permisos del rol no se modificarán con esta acción.
          </v-alert>
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
import { useRolesStore } from '../store/roles.store'
import type { RolListItem, UpdateRolDto } from '../interfaces/rol.interface'

interface Props {
  modelValue: boolean
  rol: RolListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'rol-actualizado': []
}>()

const rolesStore = useRolesStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateRolDto>({
  nombre: '',
  descripcion: '',
})

const valoresOriginales = ref<UpdateRolDto>({
  nombre: '',
  descripcion: '',
})

const loading = ref(false)
const error = ref('')

// Validaciones
const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre del rol es obligatorio',
    (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => v.length <= 50 || 'El nombre no puede exceder 50 caracteres',
    (v: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'Solo se permiten letras y espacios',
    (v: string) => {
      if (!props.rol) return true
      const nombreTrimmed = v.trim()
      return (
        !rolesStore.existeRolConNombre(nombreTrimmed, props.rol.idRol) ||
        'Ya existe un rol con este nombre'
      )
    },
  ],
  descripcion: [
    (v: string) => !v || v.length <= 200 || 'La descripción no puede exceder 200 caracteres',
  ],
}

// Computed
const hayCambios = computed(() => {
  return (
    form.value.nombre !== valoresOriginales.value.nombre ||
    form.value.descripcion !== valoresOriginales.value.descripcion
  )
})

// Métodos
function cargarDatosRol() {
  if (props.rol) {
    form.value = {
      nombre: props.rol.nombre,
      descripcion: props.rol.descripcion || '',
    }

    valoresOriginales.value = { ...form.value }
  }
}

async function onSubmit() {
  if (!props.rol) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateRolDto = {}

    if (form.value.nombre !== valoresOriginales.value.nombre) {
      cambios.nombre = form.value.nombre?.trim()
    }

    if (form.value.descripcion !== valoresOriginales.value.descripcion) {
      cambios.descripcion = form.value.descripcion?.trim() || undefined
    }

    await rolesStore.actualizarRol(props.rol.idRol, cambios)
    emit('rol-actualizado')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar el rol'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  error.value = ''
}

function limpiarFormulario() {
  form.value = {
    nombre: '',
    descripcion: '',
  }
  error.value = ''
  formRef.value?.resetValidation()
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.rol) {
      cargarDatosRol()
    }
  },
)

watch(
  () => props.rol,
  () => {
    if (props.modelValue && props.rol) {
      cargarDatosRol()
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

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.gap-1 {
  gap: 0.25rem;
}
</style>
