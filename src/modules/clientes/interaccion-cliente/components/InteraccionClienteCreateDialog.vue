<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-calendar-plus</v-icon>
        Registrar Nueva Interacción
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Seleccionar Contacto -->
          <v-autocomplete
            v-model="form.idContacto"
            label="Contacto"
            :items="contactosDisponibles"
            item-title="nombre"
            item-value="idContacto"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            color="#485696"
            :rules="rules.idContacto"
            :loading="loadingContactos"
            required
            class="mb-4"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-avatar size="32" color="#485696">
                    <span class="text-caption">{{ item.raw.nombre.charAt(0) }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.raw.nombre }}</v-list-item-title>
                <v-list-item-subtitle
                  >{{ item.raw.cargo }} - {{ item.raw.empresa }}</v-list-item-subtitle
                >
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-row class="mb-1">
            <!-- Tipo de Interacción -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.tipo"
                label="Tipo de Interacción"
                :items="tiposInteraccion"
                item-title="title"
                item-value="value"
                prepend-inner-icon="mdi-format-list-bulleted-type"
                variant="outlined"
                color="#485696"
                :rules="rules.tipo"
                required
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                  </v-list-item>
                </template>

                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon :color="item.raw.color" class="mr-2">{{ item.raw.icon }}</v-icon>
                    {{ item.raw.title }}
                  </div>
                </template>
              </v-select>
            </v-col>

            <!-- Fecha y Hora -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fecha"
                label="Fecha y Hora"
                type="datetime-local"
                prepend-inner-icon="mdi-calendar-clock"
                variant="outlined"
                color="#485696"
                :rules="rules.fecha"
                required
              />
            </v-col>
          </v-row>

          <!-- Descripción -->
          <v-textarea
            v-model="form.descripcion"
            label="Descripción de la Interacción"
            prepend-inner-icon="mdi-text"
            variant="outlined"
            color="#485696"
            :rules="rules.descripcion"
            rows="4"
            counter="500"
            required
            placeholder="Describe los detalles de esta interacción..."
            class="mb-4"
          />

          <!-- Vista previa del tipo seleccionado -->
          <v-card
            v-if="tipoSeleccionado"
            variant="tonal"
            :color="tipoSeleccionado.color"
            class="mb-4"
          >
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon :color="tipoSeleccionado.color" class="mr-3" size="32">
                  {{ tipoSeleccionado.icon }}
                </v-icon>
                <div>
                  <div class="font-weight-medium">{{ tipoSeleccionado.title }}</div>
                  <div class="text-caption">{{ tipoSeleccionado.description }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
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
          <v-icon start>mdi-calendar-plus</v-icon>
          Registrar Interacción
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useInteraccionClienteStore } from '../store/interaccion-cliente.store'
import { useContactoClienteStore } from '../../contacto-cliente/store/contacto-cliente.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import { InteraccionClienteService } from '../services/interaccion-cliente.service'
import type {
  CreateInteraccionClienteDto,
  TipoInteraccion,
} from '../interfaces/interaccion-cliente.interface'
import { TIPOS_INTERACCION_OPTIONS } from '../interfaces/interaccion-cliente.interface'

interface Props {
  modelValue: boolean
  contactoPreseleccionado?: string
  clientePreseleccionado?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'interaccion-creada': []
}>()

const interaccionClienteStore = useInteraccionClienteStore()
const contactoClienteStore = useContactoClienteStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateInteraccionClienteDto>({
  tipo: '' as TipoInteraccion,
  descripcion: '',
  fecha: '',
  idContacto: '',
})

const loading = ref(false)
const loadingContactos = ref(false)
const error = ref('')

// Computed
const tiposInteraccion = computed(() => TIPOS_INTERACCION_OPTIONS)

const tipoSeleccionado = computed(() => {
  return tiposInteraccion.value.find((tipo) => tipo.value === form.value.tipo)
})

const contactosDisponibles = computed(() => {
  const contactos = contactoClienteStore.contactos

  // Si hay un cliente preseleccionado, filtrar solo sus contactos
  if (props.clientePreseleccionado) {
    return contactos
      .filter((c) => c.idCliente === props.clientePreseleccionado && c.activo)
      .map((c) => ({
        ...c,
        empresa: getClienteInfo(c.idCliente)?.razonSocial || 'Empresa',
      }))
  }

  // Si no, mostrar todos los contactos activos
  return contactos
    .filter((c) => c.activo)
    .map((c) => ({
      ...c,
      empresa: getClienteInfo(c.idCliente)?.razonSocial || 'Empresa',
    }))
})

// Validaciones
const rules = {
  idContacto: [(v: string) => !!v || 'Debe seleccionar un contacto'],
  tipo: [(v: TipoInteraccion) => !!v || 'Debe seleccionar un tipo de interacción'],
  fecha: [
    (v: string) => !!v || 'La fecha es obligatoria',
    (v: string) => {
      const fecha = new Date(v)
      const ahora = new Date()
      return fecha <= ahora || 'La fecha no puede ser futura'
    },
  ],
  descripcion: [
    (v: string) => !!v || 'La descripción es obligatoria',
    (v: string) => v.length >= 10 || 'La descripción debe tener al menos 10 caracteres',
    (v: string) => v.length <= 500 || 'La descripción no puede exceder 500 caracteres',
  ],
}

const formValido = computed(() => {
  return (
    form.value.idContacto &&
    form.value.tipo &&
    form.value.fecha &&
    form.value.descripcion &&
    form.value.descripcion.length >= 10
  )
})

// Métodos
function getClienteInfo(idCliente: string) {
  return clienteEmpresaStore.clientes.find((c) => c.idCliente === idCliente)
}

async function cargarContactos() {
  if (contactoClienteStore.contactos.length === 0) {
    loadingContactos.value = true
    try {
      await contactoClienteStore.cargarTodosContactos()
    } catch (error) {
      console.error('Error al cargar contactos:', error)
    } finally {
      loadingContactos.value = false
    }
  }
}

async function cargarClientes() {
  if (clienteEmpresaStore.clientes.length === 0) {
    try {
      await clienteEmpresaStore.cargarClientes()
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }
}

async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Convertir fecha de input a ISO string
    const fechaISO = InteraccionClienteService.convertirFechaInput(form.value.fecha)

    const dto: CreateInteraccionClienteDto = {
      ...form.value,
      fecha: fechaISO,
    }

    await interaccionClienteStore.crearInteraccion(dto)
    emit('interaccion-creada')
    limpiarFormulario()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear la interacción'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  limpiarFormulario()
}

function limpiarFormulario() {
  // Establecer fecha actual por defecto
  const ahora = new Date()
  const fechaActual = ahora.toISOString().slice(0, 16)

  form.value = {
    tipo: '' as TipoInteraccion,
    descripcion: '',
    fecha: fechaActual,
    idContacto: props.contactoPreseleccionado || '',
  }
  error.value = ''
  formRef.value?.resetValidation()
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      cargarContactos()
      cargarClientes()
      limpiarFormulario()
    }
  },
)

watch(
  () => props.contactoPreseleccionado,
  (nuevoContacto) => {
    if (nuevoContacto) {
      form.value.idContacto = nuevoContacto
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    cargarContactos()
    cargarClientes()
  }
  if (props.contactoPreseleccionado) {
    form.value.idContacto = props.contactoPreseleccionado
  }

  // Establecer fecha actual por defecto
  const ahora = new Date()
  form.value.fecha = ahora.toISOString().slice(0, 16)
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
