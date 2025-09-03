<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-shield-plus</v-icon>
        Crear Nuevo Rol
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
                  placeholder="Ej: Administrador, Editor, Supervisor..."
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
                  placeholder="Describe las responsabilidades y alcance de este rol..."
                />
              </v-col>
            </v-row>
          </div>

          <!-- Vista previa del rol -->
          <v-card variant="tonal" color="info" class="mb-4" v-if="form.nombre">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="info">mdi-eye-outline</v-icon>
                <span class="font-weight-medium">Vista Previa del Rol</span>
              </div>

              <div class="d-flex align-center mb-2">
                <v-avatar size="40" color="#485696" class="mr-3">
                  <v-icon color="white">mdi-shield-account</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold">{{ form.nombre }}</div>
                  <div class="text-body-2 text-grey-darken-1">
                    {{ form.descripcion || 'Sin descripción' }}
                  </div>
                </div>
              </div>

              <v-chip color="primary" variant="tonal" size="small">
                <v-icon start>mdi-new-box</v-icon>
                Nuevo Rol
              </v-chip>
            </v-card-text>
          </v-card>

          <!-- Información adicional -->
          <v-alert type="info" variant="tonal" class="mb-4">
            <template v-slot:title>
              <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
              Información Importante
            </template>
            <ul class="mt-2">
              <li>Una vez creado el rol, podrás asignarle permisos específicos</li>
              <li>El nombre del rol debe ser único en el sistema</li>
              <li>Los usuarios asignados a este rol heredarán todos sus permisos</li>
            </ul>
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
        <v-btn color="#485696" @click="onSubmit" :loading="loading" :disabled="!formValido">
          <v-icon start>mdi-shield-plus</v-icon>
          Crear Rol
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRolesStore } from '../store/roles.store'
import type { CreateRolDto } from '../interfaces/rol.interface'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'rol-creado': []
}>()

const rolesStore = useRolesStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateRolDto>({
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
    (v: string) => !rolesStore.existeRolConNombre(v.trim()) || 'Ya existe un rol con este nombre',
  ],
  descripcion: [
    (v: string) => !v || v.length <= 200 || 'La descripción no puede exceder 200 caracteres',
  ],
}

// Computed
const formValido = computed(() => {
  return (
    form.value.nombre &&
    form.value.nombre.length >= 2 &&
    form.value.nombre.length <= 50 &&
    (!form.value.descripcion || form.value.descripcion.length <= 200) &&
    !rolesStore.existeRolConNombre(form.value.nombre.trim())
  )
})

// Métodos
async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    const rolData: CreateRolDto = {
      nombre: form.value.nombre.trim(),
    }

    // Solo incluir descripción si no está vacía
    if (form.value.descripcion && form.value.descripcion.trim()) {
      rolData.descripcion = form.value.descripcion.trim()
    }

    await rolesStore.crearRol(rolData)
    emit('rol-creado')
    limpiarFormulario()
  } catch (err: any) {
    console.error('Error al crear rol:', err)
    error.value = err.response?.data?.message || 'Error al crear el rol'
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
    descripcion: '',
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

.v-alert ul {
  margin: 0;
  padding-left: 1.2rem;
}

.v-alert li {
  margin-bottom: 0.25rem;
}
</style>
