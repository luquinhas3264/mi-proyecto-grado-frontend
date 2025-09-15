<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-domain-plus</v-icon>
        Crear Nueva Empresa Cliente
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
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
                required
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
                required
              />
            </v-col>

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
                required
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
                required
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
                required
              />
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
          <v-icon start>mdi-domain-plus</v-icon>
          Crear Cliente
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useClienteEmpresaStore } from '../store/cliente-empresa.store'
import { ClienteEmpresaService } from '../services/cliente-empresa.service'
import type { CreateClienteEmpresaDto } from '../interfaces/cliente-empresa.interface'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'cliente-creado': []
}>()

const clienteEmpresaStore = useClienteEmpresaStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateClienteEmpresaDto>({
  razonSocial: '',
  rubro: '',
  correo: '',
  telefono: '',
  direccion: '',
})

const loading = ref(false)
const error = ref('')
const rubrosDisponibles = ref<string[]>([])

// Validaciones
const rules = {
  razonSocial: [
    (v: string) => !!v || 'La razón social es obligatoria',
    (v: string) => v.length >= 2 || 'La razón social debe tener al menos 2 caracteres',
    (v: string) => v.length <= 100 || 'La razón social no puede exceder 100 caracteres',
  ],
  rubro: [
    (v: string) => !!v || 'El rubro es obligatorio',
    (v: string) => v.length >= 2 || 'El rubro debe tener al menos 2 caracteres',
  ],
  correo: [
    (v: string) => !!v || 'El correo es obligatorio',
    (v: string) => /^\S+@\S+\.\S+$/.test(v) || 'El formato del correo no es válido',
  ],
  telefono: [
    (v: string) => !!v || 'El teléfono es obligatorio',
    (v: string) => v.length >= 7 || 'El teléfono debe tener al menos 7 caracteres',
  ],
  direccion: [
    (v: string) => !!v || 'La dirección es obligatoria',
    (v: string) => v.length >= 10 || 'La dirección debe tener al menos 10 caracteres',
  ],
}

// Computed
const formValido = computed(() => {
  return (
    form.value.razonSocial &&
    form.value.rubro &&
    form.value.correo &&
    form.value.telefono &&
    form.value.direccion
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

async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    await clienteEmpresaStore.crearCliente(form.value)
    emit('cliente-creado')
    limpiarFormulario()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear el cliente'
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
    razonSocial: '',
    rubro: '',
    correo: '',
    telefono: '',
    direccion: '',
  }
  error.value = ''
  formRef.value?.resetValidation()
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      cargarRubros()
      limpiarFormulario()
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
  background: linear-gradient(135deg, #485696 0%, #5c6bc0 100%);
  color: white;
  font-weight: 600;
}

.v-card-actions {
  background: #f8f9fa;
}
</style>
