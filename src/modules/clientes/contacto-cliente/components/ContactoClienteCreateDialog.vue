<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-account-plus</v-icon>
        Crear Nuevo Contacto
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Seleccionar Cliente -->
          <v-autocomplete
            v-model="form.idCliente"
            label="Cliente"
            :items="clientesDisponibles"
            item-title="razonSocial"
            item-value="idCliente"
            prepend-inner-icon="mdi-domain"
            variant="outlined"
            color="#485696"
            :rules="rules.idCliente"
            :loading="loadingClientes"
            required
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-avatar size="32" color="orange">
                    <span class="text-caption">{{ item.raw.razonSocial.charAt(0) }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.raw.razonSocial }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.rubro }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-row>
            <!-- Nombre -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.nombre"
                label="Nombre completo"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                color="#485696"
                :rules="rules.nombre"
                required
              />
            </v-col>

            <!-- Cargo -->
            <v-col cols="12" md="6">
              <v-combobox
                v-model="form.cargo"
                label="Cargo"
                :items="cargosDisponibles"
                prepend-inner-icon="mdi-briefcase"
                variant="outlined"
                color="#485696"
                :rules="rules.cargo"
                required
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Correo electrónico"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="#485696"
                :rules="rules.email"
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
          <v-icon start>mdi-account-plus</v-icon>
          Crear Contacto
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useContactoClienteStore } from '../store/contacto-cliente.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import { ContactoClienteService } from '../services/contacto-cliente.service'
import type { CreateContactoClienteDto } from '../interfaces/contacto-cliente.interface'

interface Props {
  modelValue: boolean
  clientePreseleccionado?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'contacto-creado': []
}>()

const contactoClienteStore = useContactoClienteStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateContactoClienteDto>({
  nombre: '',
  cargo: '',
  email: '',
  telefono: '',
  idCliente: '',
})

const loading = ref(false)
const loadingClientes = ref(false)
const error = ref('')
const cargosDisponibles = ref<string[]>([])

// Computed
const clientesDisponibles = computed(() =>
  clienteEmpresaStore.clientesActivos.filter((c) => c.activo),
)

// Validaciones
const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre es obligatorio',
    (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  cargo: [
    (v: string) => !!v || 'El cargo es obligatorio',
    (v: string) => v.length >= 2 || 'El cargo debe tener al menos 2 caracteres',
  ],
  email: [
    (v: string) => !!v || 'El correo es obligatorio',
    (v: string) => /^\S+@\S+\.\S+$/.test(v) || 'El formato del correo no es válido',
  ],
  telefono: [
    (v: string) => !!v || 'El teléfono es obligatorio',
    (v: string) => v.length >= 7 || 'El teléfono debe tener al menos 7 caracteres',
  ],
  idCliente: [(v: string) => !!v || 'Debe seleccionar un cliente'],
}

const formValido = computed(() => {
  return (
    form.value.nombre &&
    form.value.cargo &&
    form.value.email &&
    form.value.telefono &&
    form.value.idCliente
  )
})

// Métodos
async function cargarClientes() {
  if (clienteEmpresaStore.clientes.length === 0) {
    loadingClientes.value = true
    try {
      await clienteEmpresaStore.cargarClientes()
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      loadingClientes.value = false
    }
  }
}

async function cargarCargos() {
  try {
    cargosDisponibles.value = await ContactoClienteService.obtenerCargos()
  } catch (error) {
    console.error('Error al cargar cargos:', error)
  }
}

async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    await contactoClienteStore.crearContacto(form.value)
    emit('contacto-creado')
    limpiarFormulario()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear el contacto'
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
    cargo: '',
    email: '',
    telefono: '',
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
      cargarCargos()
      limpiarFormulario()
    }
  },
)

watch(
  () => props.clientePreseleccionado,
  (nuevoCliente) => {
    if (nuevoCliente) {
      form.value.idCliente = nuevoCliente
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    cargarClientes()
    cargarCargos()
  }
  if (props.clientePreseleccionado) {
    form.value.idCliente = props.clientePreseleccionado
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
