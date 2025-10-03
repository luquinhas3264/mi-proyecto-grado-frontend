<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-folder-plus</v-icon>
        Crear Nuevo Proyecto
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-row>
            <!-- Información Básica -->
            <v-col cols="12">
              <h3 class="text-h6 mb-3">Información del Proyecto</h3>
            </v-col>

            <!-- Nombre del Proyecto -->
            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.nombre"
                label="Nombre del Proyecto"
                prepend-inner-icon="mdi-folder-text"
                variant="outlined"
                color="#485696"
                :rules="rules.nombre"
                required
              />
            </v-col>

            <!-- Cliente -->
            <v-col cols="12" md="4">
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
                required
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
                placeholder="Describe los objetivos y alcance del proyecto..."
              />
            </v-col>

            <!-- Fechas -->
            <v-col cols="12">
              <h3 class="text-h6 mb-3">Fechas del Proyecto</h3>
            </v-col>

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
                required
              />
            </v-col>

            <!-- Fecha de Fin -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fechaFin"
                label="Fecha de Fin (Opcional)"
                type="date"
                prepend-inner-icon="mdi-calendar-end"
                variant="outlined"
                color="#485696"
                :rules="rules.fechaFin"
                :min="form.fechaInicio"
              />
            </v-col>

            <!-- Información adicional -->
            <v-col cols="12" v-if="clienteSeleccionado">
              <v-card variant="tonal" color="info" class="mt-2">
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="info">mdi-information</v-icon>
                    <span class="font-weight-medium">Información del Cliente</span>
                  </div>
                  <div class="text-body-2">
                    <strong>Razón Social:</strong> {{ clienteSeleccionado.razonSocial }}<br />
                    <strong>Rubro:</strong> {{ clienteSeleccionado.rubro || 'No especificado'
                    }}<br />
                    <strong>Proyectos activos:</strong>
                    {{ clienteSeleccionado.proyectosActivos || 0 }}
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
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="outlined" @click="cancelar" :disabled="loading"> Cancelar </v-btn>
        <v-btn color="#485696" @click="onSubmit" :loading="loading" :disabled="!formValido">
          <v-icon start>mdi-folder-plus</v-icon>
          Crear Proyecto
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProyectoStore } from '../store/proyecto.store'
import { useClienteEmpresaStore } from '@/modules/clientes/cliente-empresa/store/cliente-empresa.store'
import type { CreateProyectoDto } from '../interfaces/proyecto.interface'

interface Props {
  modelValue: boolean
  clientePreseleccionado?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'proyecto-creado': []
}>()

const proyectoStore = useProyectoStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateProyectoDto>({
  nombre: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  idCliente: '',
})

const loading = ref(false)
const error = ref('')
const loadingClientes = ref(false)

// Validaciones
const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre del proyecto es obligatorio',
    (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
    (v: string) => v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  idCliente: [(v: string) => !!v || 'Debe seleccionar un cliente'],
  descripcion: [
    (v: string) => !v || v.length <= 500 || 'La descripción no puede exceder 500 caracteres',
  ],
  fechaInicio: [
    (v: string) => !!v || 'La fecha de inicio es obligatoria',
    (v: string) => {
      if (!v) return true
      // Comparar como cadenas YYYY-MM-DD para evitar problemas de zona horaria
      const hoy = new Date()
      const yyyy = hoy.getFullYear()
      const mm = String(hoy.getMonth() + 1).padStart(2, '0')
      const dd = String(hoy.getDate()).padStart(2, '0')
      const hoyStr = `${yyyy}-${mm}-${dd}`
      return v >= hoyStr || 'La fecha de inicio no puede ser anterior a hoy'
    },
  ],
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
    razonSocial: cliente.razonSocial,
    rubro: cliente.rubro,
    // Contar proyectos activos del cliente (esto se puede mejorar con datos del store)
    proyectosActivos: 0,
  }))
})

const clienteSeleccionado = computed(() => {
  if (!form.value.idCliente) return null
  return clientesDisponibles.value.find((c) => c.value === form.value.idCliente)
})

const formValido = computed(() => {
  return form.value.nombre && form.value.idCliente && form.value.fechaInicio
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

async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Clonar el formulario y limpiar fechaFin si está vacía
    const dto = { ...form.value }
    if (!dto.fechaFin) {
      delete dto.fechaFin
    }
    await proyectoStore.crearProyecto(dto)
    emit('proyecto-creado')
    limpiarFormulario()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear el proyecto'
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
    fechaInicio: '',
    fechaFin: '',
    idCliente: props.clientePreseleccionado || '',
  }
  error.value = ''
  formRef.value?.resetValidation()
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      cargarClientes()
      limpiarFormulario()
    }
  },
)

watch(
  () => props.clientePreseleccionado,
  (nuevoCliente) => {
    if (nuevoCliente && props.modelValue) {
      form.value.idCliente = nuevoCliente
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
  background: linear-gradient(135deg, #485696 0%, #5c6bc0 100%);
  color: white;
  font-weight: 600;
}

.v-card-actions {
  background: #f8f9fa;
}
</style>
