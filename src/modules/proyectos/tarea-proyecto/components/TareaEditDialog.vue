<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
    persistent
  >
    <v-card v-if="tarea">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-pencil</v-icon>
        Editar Tarea
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-row>
            <!-- Nombre de la tarea -->
            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.nombre"
                label="Nombre de la tarea"
                prepend-inner-icon="mdi-text"
                variant="outlined"
                color="#485696"
                :rules="rules.nombre"
              />
            </v-col>

            <!-- Estado -->
            <v-col cols="12" md="4">
              <v-select
                v-model="form.estado"
                label="Estado"
                :items="estadosDisponibles"
                prepend-inner-icon="mdi-flag"
                variant="outlined"
                color="#485696"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :icon="obtenerIconoEstado(item.raw.value)"
                        :color="obtenerColorEstado(item.raw.value)"
                      />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Descripción -->
            <v-col cols="12">
              <v-textarea
                v-model="form.descripcion"
                label="Descripción"
                prepend-inner-icon="mdi-text-long"
                variant="outlined"
                color="#485696"
                :rules="rules.descripcion"
                rows="3"
              />
            </v-col>

            <!-- Fecha límite -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fechaLimite"
                label="Fecha límite"
                type="date"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                color="#485696"
                :rules="rules.fechaLimite"
                :min="fechaMinima"
                clearable
              />
            </v-col>

            <!-- Responsable -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.idUsuarioResponsable"
                label="Responsable"
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

            <!-- Información de la tarea original -->
            <v-col cols="12">
              <v-card variant="tonal" color="info">
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="info">mdi-information</v-icon>
                    <span class="font-weight-medium">Información de la Tarea</span>
                  </div>
                  <div class="text-body-2">
                    <strong>ID:</strong> {{ tarea.idTarea }}<br />
                    <strong>Creada:</strong> {{ formatearFecha(tarea.creadoEn) }}<br />
                    <strong>Última actualización:</strong> {{ formatearFecha(tarea.actualizadoEn)
                    }}<br />
                    <strong>Estado actual:</strong>
                    <v-chip
                      :color="obtenerColorEstado(tarea.estado)"
                      size="small"
                      variant="tonal"
                      class="ml-2"
                    >
                      <v-icon start :icon="obtenerIconoEstado(tarea.estado)" />
                      {{ formatearEstado(tarea.estado) }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
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
          Se han detectado cambios en el formulario. Recuerda guardar para aplicarlos.
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
import { ref, computed, watch, onMounted } from 'vue'
import { useTareaStore } from '../store/tarea.store'
import { useUsuariosStore } from '@/modules/usuarios-internos/store/usuarios.store'
import { EstadoTarea, type TareaListItem, type UpdateTareaDto } from '../interfaces/tarea.interface'

interface Props {
  modelValue: boolean
  tarea: TareaListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'tarea-actualizada': []
}>()

const tareaStore = useTareaStore()
const usuariosStore = useUsuariosStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateTareaDto>({
  nombre: '',
  descripcion: '',
  estado: EstadoTarea.PENDIENTE,
  fechaLimite: '',
  idUsuarioResponsable: '',
})

const valoresOriginales = ref<UpdateTareaDto>({})
const loading = ref(false)
const error = ref('')
const loadingUsuarios = computed(() => usuariosStore.loading)

// Fecha mínima (hoy)
const fechaMinima = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Estados disponibles
const estadosDisponibles = [
  { title: 'Pendiente', value: EstadoTarea.PENDIENTE },
  { title: 'En Progreso', value: EstadoTarea.EN_PROGRESO },
  { title: 'Completada', value: EstadoTarea.COMPLETADA },
]

// Validaciones
const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre es obligatorio',
    (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
    (v: string) => v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  descripcion: [
    (v: string) => !v || v.length <= 500 || 'La descripción no puede exceder 500 caracteres',
  ],
  fechaLimite: [
    (v: string) => {
      if (!v) return true
      // Solo validar si el usuario modificó la fecha respecto al valor original
      if (valoresOriginales.value && v !== valoresOriginales.value.fechaLimite) {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const fecha = new Date(v)
        fecha.setHours(0, 0, 0, 0)
        return fecha >= hoy || 'La fecha límite no puede ser anterior a hoy'
      }
      return true
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

const hayCambios = computed(() => {
  return (
    form.value.nombre !== valoresOriginales.value.nombre ||
    form.value.descripcion !== valoresOriginales.value.descripcion ||
    form.value.estado !== valoresOriginales.value.estado ||
    form.value.fechaLimite !== valoresOriginales.value.fechaLimite ||
    form.value.idUsuarioResponsable !== valoresOriginales.value.idUsuarioResponsable
  )
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

function cargarDatosTarea() {
  if (props.tarea) {
    form.value = {
      nombre: props.tarea.nombre,
      descripcion: props.tarea.descripcion || '',
      estado: props.tarea.estado,
      fechaLimite: props.tarea.fechaLimite ? props.tarea.fechaLimite.split('T')[0] : '',
      idUsuarioResponsable: props.tarea.idUsuarioResponsable || '',
    }

    valoresOriginales.value = { ...form.value }
  }
}

async function onSubmit() {
  if (!props.tarea) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateTareaDto = {}

    if (form.value.nombre !== valoresOriginales.value.nombre) {
      cambios.nombre = form.value.nombre
    }

    if (form.value.descripcion !== valoresOriginales.value.descripcion) {
      cambios.descripcion = form.value.descripcion || undefined
    }

    if (form.value.estado !== valoresOriginales.value.estado) {
      cambios.estado = form.value.estado
    }

    if (form.value.fechaLimite !== valoresOriginales.value.fechaLimite) {
      cambios.fechaLimite = form.value.fechaLimite || undefined
    }

    if (form.value.idUsuarioResponsable !== valoresOriginales.value.idUsuarioResponsable) {
      cambios.idUsuarioResponsable = form.value.idUsuarioResponsable || undefined
    }

    await tareaStore.actualizarTarea(props.tarea.idTarea, cambios)
    emit('tarea-actualizada')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar la tarea'
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

function formatearEstado(estado: EstadoTarea): string {
  const estados = {
    [EstadoTarea.PENDIENTE]: 'Pendiente',
    [EstadoTarea.EN_PROGRESO]: 'En Progreso',
    [EstadoTarea.COMPLETADA]: 'Completada',
  }
  return estados[estado] || estado
}

function obtenerColorEstado(estado: EstadoTarea): string {
  const colores = {
    [EstadoTarea.PENDIENTE]: 'grey',
    [EstadoTarea.EN_PROGRESO]: 'warning',
    [EstadoTarea.COMPLETADA]: 'success',
  }
  return colores[estado] || 'grey'
}

function obtenerIconoEstado(estado: EstadoTarea): string {
  const iconos = {
    [EstadoTarea.PENDIENTE]: 'mdi-clock-outline',
    [EstadoTarea.EN_PROGRESO]: 'mdi-progress-clock',
    [EstadoTarea.COMPLETADA]: 'mdi-check-circle',
  }
  return iconos[estado] || 'mdi-help-circle'
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.tarea) {
      cargarDatosTarea()
      cargarUsuarios()
    }
  },
)

watch(
  () => props.tarea,
  () => {
    if (props.modelValue && props.tarea) {
      cargarDatosTarea()
    }
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
  background: linear-gradient(135deg, #ff8c00 0%, #ffb74d 100%);
  color: white;
  font-weight: 600;
}

.v-card-actions {
  background: #f8f9fa;
}
</style>
