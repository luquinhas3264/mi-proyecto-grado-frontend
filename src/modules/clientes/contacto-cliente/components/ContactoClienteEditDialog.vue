<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card v-if="contacto">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-account-edit</v-icon>
        Editar Contacto
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Información del Cliente (solo lectura) -->
          <v-card variant="tonal" color="info" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar size="40" color="orange" class="mr-3">
                  <span class="text-h6">{{ clienteInfo?.razonSocial?.charAt(0) || 'C' }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ clienteInfo?.razonSocial || 'Cliente' }}</div>
                  <div class="text-caption text-grey-darken-1">{{ clienteInfo?.rubro || '' }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

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
              />
            </v-col>
            <!-- Email -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="#485696"
                :rules="rules.email"
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
            <!-- Cliente (opcional) -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.idCliente"
                :items="
                  clienteEmpresaStore.clientes.map((c) => ({
                    title: c.razonSocial,
                    value: c.idCliente,
                  }))
                "
                label="Cliente asociado"
                prepend-inner-icon="mdi-domain"
                variant="outlined"
                color="#485696"
                clearable
              />
            </v-col>
          </v-row>

          <!-- Información Adicional -->
          <v-card variant="tonal" color="info" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                <span class="font-weight-medium">Información del Contacto</span>
              </div>
              <div class="text-body-2">
                <strong>ID:</strong> {{ contacto.idContacto }}<br />
                <strong>Estado:</strong>
                <v-chip
                  :color="contacto.activo ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                  class="ml-2"
                >
                  {{ contacto.activo ? 'Activo' : 'Inactivo' }}
                </v-chip>
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
import { useContactoClienteStore } from '../store/contacto-cliente.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import { ContactoClienteService } from '../services/contacto-cliente.service'
import type {
  ContactoClienteListItem,
  UpdateContactoClienteDto,
} from '../interfaces/contacto-cliente.interface'

interface Props {
  modelValue: boolean
  contacto: ContactoClienteListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'contacto-actualizado': []
}>()

const contactoClienteStore = useContactoClienteStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateContactoClienteDto>({
  nombre: '',
  cargo: '',
  email: '',
  telefono: '',
  idCliente: '',
})

const valoresOriginales = ref<UpdateContactoClienteDto>({})
const loading = ref(false)
const error = ref('')
const cargosDisponibles = ref<string[]>([])

// Validaciones
const rules = {
  nombre: [
    (v: string) => !v || v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => !v || v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  cargo: [(v: string) => !v || v.length >= 2 || 'El cargo debe tener al menos 2 caracteres'],
  email: [(v: string) => !v || /^\S+@\S+\.\S+$/.test(v) || 'El formato del correo no es válido'],
  telefono: [(v: string) => !v || v.length >= 7 || 'El teléfono debe tener al menos 7 caracteres'],
}

// Computed
const hayCambios = computed(() => {
  return (
    form.value.nombre !== valoresOriginales.value.nombre ||
    form.value.cargo !== valoresOriginales.value.cargo ||
    form.value.email !== valoresOriginales.value.email ||
    form.value.telefono !== valoresOriginales.value.telefono ||
    form.value.idCliente !== valoresOriginales.value.idCliente
  )
})

const clienteInfo = computed(() => {
  if (!props.contacto?.idCliente) return null
  return clienteEmpresaStore.clientes.find((c) => c.idCliente === props.contacto?.idCliente)
})

// Métodos
async function cargarCargos() {
  try {
    cargosDisponibles.value = await ContactoClienteService.obtenerCargos()
  } catch (error) {
    console.error('Error al cargar cargos:', error)
  }
}

function cargarDatosContacto() {
  if (props.contacto) {
    form.value = {
      nombre: props.contacto.nombre,
      cargo: props.contacto.cargo,
      email: props.contacto.email,
      telefono: props.contacto.telefono,
      idCliente: props.contacto.idCliente,
    }

    valoresOriginales.value = { ...form.value }
  }
}

async function onSubmit() {
  if (!props.contacto) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateContactoClienteDto = {}

    if (form.value.nombre !== valoresOriginales.value.nombre) {
      cambios.nombre = form.value.nombre || undefined
    }

    if (form.value.cargo !== valoresOriginales.value.cargo) {
      cambios.cargo = form.value.cargo || undefined
    }

    if (form.value.email !== valoresOriginales.value.email) {
      cambios.email = form.value.email || undefined
    }

    if (form.value.telefono !== valoresOriginales.value.telefono) {
      cambios.telefono = form.value.telefono || undefined
    }

    if (form.value.idCliente !== valoresOriginales.value.idCliente) {
      cambios.idCliente = form.value.idCliente || undefined
    }

    await contactoClienteStore.actualizarContacto(props.contacto.idContacto, cambios)
    emit('contacto-actualizado')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar el contacto'
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
    if (newVal && props.contacto) {
      cargarCargos()
      cargarDatosContacto()
    }
  },
)

watch(
  () => props.contacto,
  () => {
    if (props.modelValue && props.contacto) {
      cargarDatosContacto()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    cargarCargos()
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
