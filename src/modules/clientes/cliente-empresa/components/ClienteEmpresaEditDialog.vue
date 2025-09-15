<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card v-if="cliente">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-domain</v-icon>
        Editar Cliente Empresa
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Información Básica -->
          <div class="mb-4">
            <h3 class="text-h6 mb-3">Información de la Empresa</h3>
            <v-row>
              <!-- Razón Social -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.razonSocial"
                  label="Razón Social"
                  prepend-inner-icon="mdi-domain"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.razonSocial"
                />
              </v-col>

              <!-- Rubro -->
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="form.rubro"
                  label="Rubro"
                  :items="rubrosDisponibles"
                  prepend-inner-icon="mdi-tag"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.rubro"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Información de Contacto -->
          <div class="mb-4">
            <h3 class="text-h6 mb-3">Información de Contacto</h3>
            <v-row>
              <!-- Correo -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.correo"
                  label="Correo electrónico"
                  type="email"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.correo"
                />
              </v-col>

              <!-- Teléfono -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.telefono"
                  label="Teléfono"
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.telefono"
                />
              </v-col>

              <!-- Dirección -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.direccion"
                  label="Dirección"
                  prepend-inner-icon="mdi-map-marker"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.direccion"
                  rows="3"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Información Adicional -->
          <v-card variant="tonal" color="info" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                <span class="font-weight-medium">Información del Cliente</span>
              </div>
              <div class="text-body-2">
                <strong>ID:</strong> {{ cliente.idCliente }}<br />
                <strong>Estado:</strong>
                <v-chip
                  :color="cliente.activo ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                  class="ml-2"
                >
                  {{ cliente.activo ? 'Activo' : 'Inactivo' }} </v-chip
                ><br />
                <strong>Contactos registrados:</strong> {{ cliente.contactos?.length || 0 }}<br />
                <strong>Etiquetas asignadas:</strong> {{ cliente.etiquetas?.length || 0 }}
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
          <template v-slot:title> 📝 Cambios Pendientes </template>
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
import { useClienteEmpresaStore } from '../store/cliente-empresa.store'
import { ClienteEmpresaService } from '../services/cliente-empresa.service'
import type {
  ClienteEmpresaListItem,
  UpdateClienteEmpresaDto,
} from '../interfaces/cliente-empresa.interface'

interface Props {
  modelValue: boolean
  cliente: ClienteEmpresaListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'cliente-actualizado': []
}>()

const clienteEmpresaStore = useClienteEmpresaStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateClienteEmpresaDto>({
  razonSocial: '',
  rubro: '',
  correo: '',
  telefono: '',
  direccion: '',
})

const valoresOriginales = ref<UpdateClienteEmpresaDto>({})
const loading = ref(false)
const error = ref('')
const rubrosDisponibles = ref<string[]>([])

// Validaciones
const rules = {
  razonSocial: [
    (v: string) => !v || v.length >= 2 || 'La razón social debe tener al menos 2 caracteres',
    (v: string) => !v || v.length <= 100 || 'La razón social no puede exceder 100 caracteres',
  ],
  rubro: [(v: string) => !v || v.length >= 2 || 'El rubro debe tener al menos 2 caracteres'],
  correo: [(v: string) => !v || /^\S+@\S+\.\S+$/.test(v) || 'El formato del correo no es válido'],
  telefono: [(v: string) => !v || v.length >= 7 || 'El teléfono debe tener al menos 7 caracteres'],
  direccion: [
    (v: string) => !v || v.length >= 10 || 'La dirección debe tener al menos 10 caracteres',
  ],
}

// Computed
const hayCambios = computed(() => {
  return (
    form.value.razonSocial !== valoresOriginales.value.razonSocial ||
    form.value.rubro !== valoresOriginales.value.rubro ||
    form.value.correo !== valoresOriginales.value.correo ||
    form.value.telefono !== valoresOriginales.value.telefono ||
    form.value.direccion !== valoresOriginales.value.direccion
  )
})

// Métodos
async function cargarRubros() {
  try {
    rubrosDisponibles.value = await ClienteEmpresaService.obtenerRubros()
  } catch (error) {
    console.error('Error al cargar rubros:', error)
  }
}

function cargarDatosCliente() {
  if (props.cliente) {
    form.value = {
      razonSocial: props.cliente.razonSocial,
      rubro: props.cliente.rubro,
      correo: props.cliente.correo,
      telefono: props.cliente.telefono,
      direccion: props.cliente.direccion,
    }

    valoresOriginales.value = { ...form.value }
  }
}

async function onSubmit() {
  if (!props.cliente) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateClienteEmpresaDto = {}

    if (form.value.razonSocial !== valoresOriginales.value.razonSocial) {
      cambios.razonSocial = form.value.razonSocial || undefined
    }

    if (form.value.rubro !== valoresOriginales.value.rubro) {
      cambios.rubro = form.value.rubro || undefined
    }

    if (form.value.correo !== valoresOriginales.value.correo) {
      cambios.correo = form.value.correo || undefined
    }

    if (form.value.telefono !== valoresOriginales.value.telefono) {
      cambios.telefono = form.value.telefono || undefined
    }

    if (form.value.direccion !== valoresOriginales.value.direccion) {
      cambios.direccion = form.value.direccion || undefined
    }

    await clienteEmpresaStore.actualizarCliente(props.cliente.idCliente, cambios)
    emit('cliente-actualizado')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar el cliente'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  error.value = ''
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.cliente) {
      cargarRubros()
      cargarDatosCliente()
    }
  },
)

watch(
  () => props.cliente,
  () => {
    if (props.modelValue && props.cliente) {
      cargarDatosCliente()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    cargarRubros()
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
