<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="900"
    persistent
  >
    <v-card v-if="proyecto">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-folder-edit</v-icon>
        Editar Proyecto
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Información Básica -->
          <div class="mb-4">
            <h3 class="text-h6 mb-3">Información del Proyecto</h3>
            <v-row>
              <!-- Nombre del Proyecto -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.nombre"
                  label="Nombre del Proyecto"
                  prepend-inner-icon="mdi-folder-text"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.nombre"
                />
              </v-col>

              <!-- Estado -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.estado"
                  label="Estado del Proyecto"
                  :items="estadosDisponibles"
                  prepend-inner-icon="mdi-flag"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.estado"
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

              <!-- Cliente -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.idCliente"
                  label="Cliente"
                  :items="clientesDisponibles"
                  item-title="text"
                  item-value="value"
                  prepend-inner-icon="mdi-domain"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.idCliente"
                  :loading="loadingClientes"
                />
              </v-col>

              <!-- Descripción -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.descripcion"
                  label="Descripción"
                  prepend-inner-icon="mdi-text"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.descripcion"
                  rows="3"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Fechas -->
          <div class="mb-4">
            <h3 class="text-h6 mb-3">Fechas del Proyecto</h3>
            <v-row>
              <!-- Fecha de Inicio -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.fechaInicio"
                  label="Fecha de Inicio"
                  type="date"
                  prepend-inner-icon="mdi-calendar-start"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.fechaInicio"
                />
              </v-col>

              <!-- Fecha de Fin -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.fechaFin"
                  label="Fecha de Fin"
                  type="date"
                  prepend-inner-icon="mdi-calendar-end"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.fechaFin"
                  :min="form.fechaInicio"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Información del Proyecto Original -->
          <v-card variant="tonal" color="info" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                <span class="font-weight-medium">Información del Proyecto</span>
              </div>
              <div class="text-body-2">
                <strong>ID:</strong> {{ proyecto.idProyecto }}<br />
                <strong>Creado:</strong> {{ formatearFecha(proyecto.creadoEn) }}<br />
                <strong>Estado actual:</strong>
                <v-chip
                  :color="obtenerColorEstado(proyecto.estado)"
                  size="small"
                  variant="tonal"
                  class="ml-2"
                >
                  <v-icon start :icon="obtenerIconoEstado(proyecto.estado)" />
                  {{ proyecto.estado }}
                </v-chip>
                <br />
                <strong>Cliente original:</strong> {{ proyecto.cliente.razonSocial }}
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
          Se han detectado cambios en el formulario. Recuerda guardar para aplicarlos.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="outlined" @click="cancelar" :disabled="loading"> Cancelar </v-btn>
        <v-btn color="#485696" @click="onSubmit" :loading="loading" :disabled="!hayCambios">
          <v-icon>mdi-content-save</v-icon>
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProyectoStore } from '../store/proyecto.store'
import { useClienteEmpresaStore } from '@/modules/clientes/cliente-empresa/store/cliente-empresa.store'
import {
  EstadoProyecto,
  type ProyectoListItem,
  type UpdateProyectoDto,
} from '../interfaces/proyecto.interface'

interface Props {
  modelValue: boolean
  proyecto: ProyectoListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'proyecto-actualizado': []
}>()

const proyectoStore = useProyectoStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateProyectoDto>({
  nombre: '',
  descripcion: '',
  estado: EstadoProyecto.PLANEADO,
  fechaInicio: '',
  fechaFin: '',
  idCliente: '',
})

const valoresOriginales = ref<UpdateProyectoDto>({})
const loading = ref(false)
const error = ref('')
const loadingClientes = ref(false)

// Estados disponibles
const estadosDisponibles = [
  { title: 'Planeado', value: EstadoProyecto.PLANEADO },
  { title: 'En Progreso', value: EstadoProyecto.EN_PROGRESO },
  { title: 'Finalizado', value: EstadoProyecto.FINALIZADO },
]

// Validaciones
const rules = {
  nombre: [
    (v: string) => !v || v.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
    (v: string) => !v || v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  descripcion: [
    (v: string) => !v || v.length <= 500 || 'La descripción no puede exceder 500 caracteres',
  ],
  estado: [(v: string) => !!v || 'Debe seleccionar un estado'],
  idCliente: [(v: string) => !!v || 'Debe seleccionar un cliente'],
  fechaInicio: [(v: string) => !!v || 'La fecha de inicio es obligatoria'],
  fechaFin: [
    (v: string) => {
      if (!v || !form.value.fechaInicio) return true
      const inicio = new Date(form.value.fechaInicio)
      const fin = new Date(v)
      return fin >= inicio || 'La fecha de fin debe ser posterior a la fecha de inicio'
    },
  ],
}

// Computed
const clientesDisponibles = computed(() => {
  return clienteEmpresaStore.clientesActivos.map((cliente) => ({
    text: `${cliente.razonSocial} - ${cliente.rubro || 'Sin rubro'}`,
    value: cliente.idCliente,
  }))
})

const hayCambios = computed(() => {
  return (
    form.value.nombre !== valoresOriginales.value.nombre ||
    form.value.descripcion !== valoresOriginales.value.descripcion ||
    form.value.estado !== valoresOriginales.value.estado ||
    form.value.fechaInicio !== valoresOriginales.value.fechaInicio ||
    form.value.fechaFin !== valoresOriginales.value.fechaFin ||
    form.value.idCliente !== valoresOriginales.value.idCliente
  )
})

// Métodos
async function cargarClientes() {
  try {
    loadingClientes.value = true
    if (clienteEmpresaStore.clientes.length === 0) {
      await clienteEmpresaStore.cargarClientes()
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  } finally {
    loadingClientes.value = false
  }
}

function cargarDatosProyecto() {
  if (props.proyecto) {
    form.value = {
      nombre: props.proyecto.nombre,
      descripcion: props.proyecto.descripcion || '',
      estado: props.proyecto.estado,
      fechaInicio: props.proyecto.fechaInicio.split('T')[0], // Convertir a formato date input
      fechaFin: props.proyecto.fechaFin ? props.proyecto.fechaFin.split('T')[0] : '',
      idCliente: props.proyecto.idCliente,
    }

    valoresOriginales.value = { ...form.value }
  }
}

async function onSubmit() {
  if (!props.proyecto) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateProyectoDto = {}

    if (form.value.nombre !== valoresOriginales.value.nombre) {
      cambios.nombre = form.value.nombre
    }

    if (form.value.descripcion !== valoresOriginales.value.descripcion) {
      cambios.descripcion = form.value.descripcion || undefined
    }

    if (form.value.estado !== valoresOriginales.value.estado) {
      cambios.estado = form.value.estado
    }

    if (form.value.fechaInicio !== valoresOriginales.value.fechaInicio) {
      if (form.value.fechaInicio) {
        cambios.fechaInicio = form.value.fechaInicio
      }
    }

    if (form.value.fechaFin !== valoresOriginales.value.fechaFin) {
      if (form.value.fechaFin) {
        cambios.fechaFin = form.value.fechaFin
      }
    }

    if (form.value.idCliente !== valoresOriginales.value.idCliente) {
      cambios.idCliente = form.value.idCliente
    }

    await proyectoStore.actualizarProyecto(props.proyecto.idProyecto, cambios)
    emit('proyecto-actualizado')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar el proyecto'
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
  })
}

function obtenerColorEstado(estado: EstadoProyecto): string {
  const colores = {
    [EstadoProyecto.PLANEADO]: 'info',
    [EstadoProyecto.EN_PROGRESO]: 'warning',
    [EstadoProyecto.FINALIZADO]: 'success',
  }
  return colores[estado] || 'grey'
}

function obtenerIconoEstado(estado: EstadoProyecto): string {
  const iconos = {
    [EstadoProyecto.PLANEADO]: 'mdi-clock-outline',
    [EstadoProyecto.EN_PROGRESO]: 'mdi-play-circle',
    [EstadoProyecto.FINALIZADO]: 'mdi-check-circle',
  }
  return iconos[estado] || 'mdi-help-circle'
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.proyecto) {
      cargarClientes()
      cargarDatosProyecto()
    }
  },
)

watch(
  () => props.proyecto,
  () => {
    if (props.modelValue && props.proyecto) {
      cargarDatosProyecto()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    cargarClientes()
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
