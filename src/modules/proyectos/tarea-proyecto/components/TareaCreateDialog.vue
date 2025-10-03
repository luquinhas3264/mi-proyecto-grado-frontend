<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-checkbox-marked-circle-plus-outline</v-icon>
        Crear Nueva Tarea
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-row>
            <!-- Nombre de la tarea -->
            <v-col cols="12">
              <v-text-field
                v-model="form.nombre"
                label="Nombre de la tarea"
                prepend-inner-icon="mdi-text"
                variant="outlined"
                color="#485696"
                :rules="rules.nombre"
                required
                autofocus
              />
            </v-col>

            <!-- Descripción -->
            <v-col cols="12">
              <v-textarea
                v-model="form.descripcion"
                label="Descripción (opcional)"
                prepend-inner-icon="mdi-text-long"
                variant="outlined"
                color="#485696"
                :rules="rules.descripcion"
                rows="3"
                placeholder="Describe los detalles de la tarea..."
              />
            </v-col>

            <!-- Fecha límite -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fechaLimite"
                label="Fecha límite (opcional)"
                type="date"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                color="#485696"
                :rules="rules.fechaLimite"
                :min="fechaMinima"
              />
            </v-col>

            <!-- Responsable -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.idUsuarioResponsable"
                label="Responsable (opcional)"
                :items="usuariosDisponibles"
                item-title="text"
                item-value="value"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                color="#485696"
                :loading="loadingUsuarios"
                clearable
              />
            </v-col>

            <!-- Información adicional -->
            <v-col cols="12">
              <v-alert type="info" variant="tonal" density="compact">
                <template v-slot:prepend>
                  <v-icon>mdi-information</v-icon>
                </template>
                La tarea se creará en estado <strong>PENDIENTE</strong> por defecto.
              </v-alert>
            </v-col>
          </v-row>
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
          <v-icon start>mdi-checkbox-marked-circle-plus-outline</v-icon>
          Crear Tarea
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTareaStore } from '../store/tarea.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useUsuariosStore } from '@/modules/usuarios-internos/store/usuarios.store'
import type { CreateTareaDto } from '../interfaces/tarea.interface'

interface Props {
  modelValue: boolean
  proyectoId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'tarea-creada': []
}>()

const tareaStore = useTareaStore()
const authStore = useAuthStore()
const usuariosStore = useUsuariosStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateTareaDto>({
  nombre: '',
  descripcion: '',
  fechaLimite: '',
  idProyecto: props.proyectoId,
  idUsuarioResponsable: '',
})

const loading = ref(false)
const error = ref('')
const loadingUsuarios = computed(() => usuariosStore.loading)

// Fecha mínima (hoy)
const fechaMinima = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Validaciones
const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre de la tarea es obligatorio',
    (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
    (v: string) => v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  descripcion: [
    (v: string) => !v || v.length <= 500 || 'La descripción no puede exceder 500 caracteres',
  ],
  fechaLimite: [
    (v: string) => {
      if (!v) return true
      const fecha = new Date(v)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      return fecha >= hoy || 'La fecha límite no puede ser anterior a hoy'
    },
  ],
}

// Computed
const usuariosDisponibles = computed(() => {
  return usuariosStore.usuariosActivos.map((usuario) => ({
    text: `${usuario.nombre} - ${usuario.rol.nombre}`,
    value: usuario.idUsuario,
  }))
})

const formValido = computed(() => {
  return form.value.nombre.trim().length >= 3
})

// Métodos
async function cargarUsuarios() {
  try {
    if (usuariosStore.usuarios.length === 0) {
      await usuariosStore.cargarUsuarios()
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Clonar el formulario y limpiar campos opcionales vacíos
    const dto = { ...form.value }
    if (!dto.descripcion) delete dto.descripcion
    if (!dto.fechaLimite) delete dto.fechaLimite
    if (!dto.idUsuarioResponsable) delete dto.idUsuarioResponsable

    await tareaStore.crearTarea(dto)
    emit('tarea-creada')
    limpiarFormulario()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear la tarea'
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
    fechaLimite: '',
    idProyecto: props.proyectoId,
    idUsuarioResponsable: '',
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
      form.value.idProyecto = props.proyectoId
      cargarUsuarios()
    }
  },
)

watch(
  () => props.proyectoId,
  (nuevoId) => {
    form.value.idProyecto = nuevoId
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    cargarUsuarios()
  }
})
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
