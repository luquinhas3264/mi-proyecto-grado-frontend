<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
  >
    <v-card v-if="contacto">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-account</v-icon>
        Detalles del Contacto
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Header con información principal -->
        <div class="text-center mb-6">
          <v-avatar size="80" color="#485696" class="mb-4">
            <span class="text-h4">{{ iniciales }}</span>
          </v-avatar>
          <h2 class="text-h5 mb-2">{{ contacto.nombre }}</h2>
          <v-chip color="info" size="large" variant="tonal" class="mb-2">
            {{ contacto.cargo }}
          </v-chip>
          <br />
          <v-chip :color="contacto.activo ? 'success' : 'error'" size="large" variant="tonal">
            <v-icon start :icon="contacto.activo ? 'mdi-check-circle' : 'mdi-close-circle'" />
            {{ contacto.activo ? 'Contacto Activo' : 'Contacto Inactivo' }}
          </v-chip>
        </div>

        <!-- Información del Cliente -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-domain</v-icon>
            Cliente Asociado
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex align-center">
              <v-avatar size="48" color="orange" class="mr-3">
                <span class="text-h6">{{ clienteInfo?.razonSocial?.charAt(0) || 'C' }}</span>
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

        <!-- Información de Contacto -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-contacts</v-icon>
            Información de Contacto
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="success" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-email</v-icon>
                    Correo
                  </v-chip>
                  <div class="text-body-1">
                    {{ contacto.email }}
                    <v-btn
                      icon="mdi-content-copy"
                      size="x-small"
                      variant="text"
                      @click="copiarTexto(contacto.email)"
                      class="ml-2"
                    />
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="warning" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-phone</v-icon>
                    Teléfono
                  </v-chip>
                  <div class="text-body-1">
                    {{ contacto.telefono }}
                    <v-btn
                      icon="mdi-content-copy"
                      size="x-small"
                      variant="text"
                      @click="copiarTexto(contacto.telefono)"
                      class="ml-2"
                    />
                  </div>
                </div>
              </v-col>
            </v-row>
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
                  ID de Contacto
                </v-chip>
                <div class="text-body-2 text-grey-darken-1 font-mono">
                  {{ contacto.idContacto }}
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
                v-if="hasPermission('contactos', 'editar')"
                color="warning"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="editarContacto"
              >
                Editar Contacto
              </v-btn>

              <v-btn
                v-if="hasPermission('contactos', 'editar')"
                :color="contacto.activo ? 'error' : 'success'"
                variant="outlined"
                size="small"
                :prepend-icon="contacto.activo ? 'mdi-account-off' : 'mdi-account-check'"
                @click="toggleEstado"
              >
                {{ contacto.activo ? 'Desactivar' : 'Activar' }}
              </v-btn>

              <v-btn
                color="info"
                variant="outlined"
                size="small"
                prepend-icon="mdi-email-send"
                @click="enviarCorreo"
              >
                Enviar Correo
              </v-btn>

              <v-btn
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
                prepend-icon="mdi-domain"
                @click="verCliente"
              >
                Ver Cliente
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
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import type { ContactoClienteListItem } from '../interfaces/contacto-cliente.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Props {
  modelValue: boolean
  contacto: ContactoClienteListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'editar-contacto': [contacto: ContactoClienteListItem]
  'toggle-estado': [contacto: ContactoClienteListItem]
  'ver-cliente': [idCliente: string]
}>()

const authStore = useAuthStore()
const clienteEmpresaStore = useClienteEmpresaStore()

// Estado local
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const iniciales = computed(() => {
  if (!props.contacto) return ''
  return props.contacto.nombre
    .split(' ')
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

const clienteInfo = computed(() => {
  if (!props.contacto?.idCliente) return null
  return clienteEmpresaStore.clientes.find((c) => c.idCliente === props.contacto?.idCliente)
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function editarContacto() {
  if (props.contacto) {
    emit('editar-contacto', props.contacto)
  }
}

function toggleEstado() {
  if (props.contacto) {
    emit('toggle-estado', props.contacto)
  }
}

function enviarCorreo() {
  if (props.contacto) {
    window.open(`mailto:${props.contacto.email}`)
  }
}

function llamar() {
  if (props.contacto) {
    window.open(`tel:${props.contacto.telefono}`)
  }
}

function verCliente() {
  if (props.contacto?.idCliente) {
    emit('ver-cliente', props.contacto.idCliente)
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

.v-chip {
  margin-bottom: 0.25rem;
}
</style>
