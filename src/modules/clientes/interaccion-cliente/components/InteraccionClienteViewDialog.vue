<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
  >
    <v-card v-if="interaccion">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-calendar-account</v-icon>
        Detalles de la Interacción
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Header con información principal -->
        <div class="text-center mb-6">
          <v-avatar size="80" :color="tipoInfo.color" class="mb-4">
            <v-icon size="40" color="white">{{ tipoInfo.icon }}</v-icon>
          </v-avatar>
          <h2 class="text-h5 mb-2">{{ tipoInfo.title }}</h2>
          <v-chip :color="tipoInfo.color" size="large" variant="tonal" class="mb-2">
            {{ tipoInfo.description }}
          </v-chip>
          <br />
          <v-chip color="info" size="large" variant="tonal">
            <v-icon start>mdi-calendar</v-icon>
            {{ fechaFormateada }}
          </v-chip>
        </div>

        <!-- Información del Contacto -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-account</v-icon>
            Contacto Involucrado
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex align-center">
              <v-avatar size="48" color="#485696" class="mr-3">
                <span class="text-h6">{{ contactoInfo?.nombre?.charAt(0) || 'C' }}</span>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-medium">
                  {{ contactoInfo?.nombre || 'Contacto no encontrado' }}
                </div>
                <div class="text-body-2 text-grey-darken-1">{{ contactoInfo?.cargo || '' }}</div>
                <div class="text-body-2">
                  <v-icon size="14" class="mr-1">mdi-email</v-icon>
                  {{ contactoInfo?.email || '' }}
                  <v-btn
                    v-if="contactoInfo?.email"
                    icon="mdi-content-copy"
                    size="x-small"
                    variant="text"
                    @click="copiarTexto(contactoInfo.email)"
                    class="ml-1"
                  />
                </div>
                <div class="text-body-2">
                  <v-icon size="14" class="mr-1">mdi-phone</v-icon>
                  {{ contactoInfo?.telefono || '' }}
                  <v-btn
                    v-if="contactoInfo?.telefono"
                    icon="mdi-content-copy"
                    size="x-small"
                    variant="text"
                    @click="copiarTexto(contactoInfo.telefono)"
                    class="ml-1"
                  />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Información del Cliente -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-domain</v-icon>
            Empresa Cliente
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex align-center">
              <v-avatar size="48" color="orange" class="mr-3">
                <span class="text-h6">{{ clienteInfo?.razonSocial?.charAt(0) || 'E' }}</span>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-medium">
                  {{ clienteInfo?.razonSocial || 'Cliente no encontrado' }}
                </div>
                <div class="text-body-2 text-grey-darken-1">{{ clienteInfo?.rubro || '' }}</div>
                <v-chip
                  v-if="clienteInfo"
                  :color="clienteInfo.activo ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                  class="mt-1"
                >
                  {{ clienteInfo.activo ? 'Cliente Activo' : 'Cliente Inactivo' }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Descripción de la Interacción -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-text-long</v-icon>
            Descripción
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="text-body-1 white-space-pre-wrap">{{ interaccion.descripcion }}</div>
          </v-card-text>
        </v-card>

        <!-- Información del Sistema -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-information</v-icon>
            Información del Sistema
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="text-body-2">
              <div class="mb-2">
                <v-chip color="purple" variant="tonal" size="small" class="mb-1">
                  <v-icon start>mdi-identifier</v-icon>
                  ID de Interacción
                </v-chip>
                <div class="text-body-2 text-grey-darken-1 font-mono">
                  {{ interaccion.idInteraccion }}
                </div>
              </div>
              <div class="mb-2">
                <v-chip color="info" variant="tonal" size="small" class="mb-1">
                  <v-icon start>mdi-clock</v-icon>
                  Fecha Completa
                </v-chip>
                <div class="text-body-2 text-grey-darken-1">
                  {{ new Date(interaccion.fecha).toLocaleString('es-ES') }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Acciones Rápidas -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Acciones Rápidas
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-if="contactoInfo?.email"
                color="info"
                variant="outlined"
                size="small"
                prepend-icon="mdi-email-send"
                @click="enviarCorreo"
              >
                Enviar Correo
              </v-btn>

              <v-btn
                v-if="contactoInfo?.telefono"
                color="success"
                variant="outlined"
                size="small"
                prepend-icon="mdi-phone"
                @click="llamar"
              >
                Llamar
              </v-btn>

              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-account"
                @click="verContacto"
              >
                Ver Contacto
              </v-btn>

              <v-btn
                color="orange"
                variant="outlined"
                size="small"
                prepend-icon="mdi-domain"
                @click="verCliente"
              >
                Ver Cliente
              </v-btn>

              <v-btn
                color="secondary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-calendar-plus"
                @click="nuevaInteraccion"
              >
                Nueva Interacción
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          prepend-icon="mdi-close"
          @click="$emit('update:modelValue', false)"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar para confirmación de copiado -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="2000"
      location="top right"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useContactoClienteStore } from '../../contacto-cliente/store/contacto-cliente.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import { InteraccionClienteService } from '../services/interaccion-cliente.service'
import type { InteraccionClienteConContacto } from '../interfaces/interaccion-cliente.interface'
import { TIPOS_INTERACCION_OPTIONS } from '../interfaces/interaccion-cliente.interface'

interface Props {
  modelValue: boolean
  interaccion: InteraccionClienteConContacto | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'ver-contacto': [idContacto: string]
  'ver-cliente': [idCliente: string]
  'nueva-interaccion': [idContacto: string]
}>()

const contactoClienteStore = useContactoClienteStore()
const clienteEmpresaStore = useClienteEmpresaStore()

// Estado local
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const tipoInfo = computed(() => {
  if (!props.interaccion) return TIPOS_INTERACCION_OPTIONS[0]
  return (
    TIPOS_INTERACCION_OPTIONS.find((t) => t.value === props.interaccion?.tipo) ||
    TIPOS_INTERACCION_OPTIONS[0]
  )
})

const fechaFormateada = computed(() => {
  if (!props.interaccion) return ''
  return InteraccionClienteService.formatearFecha(props.interaccion.fecha)
})

const contactoInfo = computed(() => {
  if (!props.interaccion?.idContacto) return null
  return contactoClienteStore.contactos.find((c) => c.idContacto === props.interaccion?.idContacto)
})

const clienteInfo = computed(() => {
  const idCliente = contactoInfo.value?.idCliente
  if (!idCliente) return null
  return clienteEmpresaStore.clientes.find((c) => c.idCliente === idCliente)
})

// Métodos
function enviarCorreo() {
  if (contactoInfo.value?.email) {
    window.open(`mailto:${contactoInfo.value.email}`)
  }
}

function llamar() {
  if (contactoInfo.value?.telefono) {
    window.open(`tel:${contactoInfo.value.telefono}`)
  }
}

function verContacto() {
  if (props.interaccion?.idContacto) {
    emit('ver-contacto', props.interaccion.idContacto)
  }
}

function verCliente() {
  const idCliente = contactoInfo.value?.idCliente
  if (idCliente) {
    emit('ver-cliente', idCliente)
  }
}

function nuevaInteraccion() {
  if (props.interaccion?.idContacto) {
    emit('nueva-interaccion', props.interaccion.idContacto)
  }
}

async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    snackbar.value = {
      show: true,
      message: 'Copiado al portapapeles',
      color: 'success',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: 'Error al copiar',
      color: 'error',
    }
  }
}
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

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.gap-2 {
  gap: 0.5rem;
}

.white-space-pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.v-chip {
  margin-bottom: 0.25rem;
}
</style>
