<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
  >
    <v-card v-if="cliente">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-domain</v-icon>
        Detalles del Cliente
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Header con información principal -->
        <div class="text-center mb-6">
          <v-avatar size="100" color="#485696" class="mb-4">
            <span class="text-h3">{{ iniciales }}</span>
          </v-avatar>
          <h2 class="text-h4 mb-2">{{ cliente.razonSocial }}</h2>
          <v-chip :color="cliente.activo ? 'success' : 'error'" size="large" variant="tonal">
            <v-icon start :icon="cliente.activo ? 'mdi-check-circle' : 'mdi-close-circle'" />
            {{ cliente.activo ? 'Cliente Activo' : 'Cliente Inactivo' }}
          </v-chip>
        </div>

        <!-- Información Principal -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-information</v-icon>
            Información General
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="primary" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-domain</v-icon>
                    Razón Social
                  </v-chip>
                  <div class="text-body-1 font-weight-medium">{{ cliente.razonSocial }}</div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="info" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-tag</v-icon>
                    Rubro
                  </v-chip>
                  <div class="text-body-1">{{ cliente.rubro }}</div>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="mb-3">
                  <v-chip color="purple" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-identifier</v-icon>
                    ID de Cliente
                  </v-chip>
                  <div class="text-body-2 text-grey-darken-1 font-mono">
                    {{ cliente.idCliente }}
                  </div>
                </div>
              </v-col>
            </v-row>
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
                    {{ cliente.correo }}
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
                    {{ cliente.telefono }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="mb-3">
                  <v-chip color="indigo" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-map-marker</v-icon>
                    Dirección
                  </v-chip>
                  <div class="text-body-1">{{ cliente.direccion }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Etiquetas -->
        <v-card
          v-if="cliente.etiquetas && cliente.etiquetas.length > 0"
          variant="outlined"
          class="mb-4"
        >
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-tag-multiple</v-icon>
            Etiquetas Asignadas
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="etiquetaCliente in cliente.etiquetas"
                :key="etiquetaCliente.idEtiqueta"
                color="orange"
                variant="outlined"
                size="small"
              >
                <v-icon start>mdi-tag</v-icon>
                {{ etiquetaCliente.etiqueta.nombre }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <!-- Contactos -->
        <v-card
          v-if="cliente.contactos && cliente.contactos.length > 0"
          variant="outlined"
          class="mb-4"
        >
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Contactos ({{ cliente.contactos.length }})
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col
                v-for="contacto in cliente.contactos"
                :key="contacto.idContacto"
                cols="12"
                md="6"
              >
                <v-card variant="tonal" color="text-contrast" class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-avatar size="40" color="#485696" class="mr-3">
                      <span class="text-h6">{{ contacto.nombre.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ contacto.nombre }}</div>
                      <div class="text-caption text-grey-darken-3">{{ contacto.cargo }}</div>
                    </div>
                    <v-spacer />
                    <v-chip
                      :color="contacto.activo ? 'success' : 'error'"
                      size="large"
                      variant="tonal"
                    >
                      {{ contacto.activo ? 'Activo' : 'Inactivo' }}
                    </v-chip>
                  </div>
                  <div class="text-body-2">
                    <div><strong>Email:</strong> {{ contacto.email }}</div>
                    <div><strong>Teléfono:</strong> {{ contacto.telefono }}</div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Proyectos (solo si es detalle completo) -->
        <v-card
          v-if="clienteDetalle && clienteDetalle.proyectos && clienteDetalle.proyectos.length > 0"
          variant="outlined"
          class="mb-4"
        >
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-briefcase</v-icon>
            Proyectos ({{ clienteDetalle.proyectos.length }})
          </v-card-title>
          <v-card-text class="pt-4">
            <v-list density="compact">
              <template
                v-if="clienteDetalle.proyectos.filter((p) => p.activo !== false).length > 0"
              >
                <v-list-item
                  v-for="proyecto in clienteDetalle.proyectos.filter((p) => p.activo !== false)"
                  :key="proyecto.idProyecto"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-icon color="#485696" style="opacity: 1">mdi-folder</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">
                    {{ proyecto.nombre }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ proyecto.descripcion }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-chip
                      :color="getEstadoProyectoColor(proyecto.estado)"
                      size="small"
                      variant="tonal"
                    >
                      {{ proyecto.estado }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
              <template v-else>
                <div class="text-center text-grey-darken-1 py-4">
                  <v-icon size="32" color="grey">mdi-folder-remove</v-icon>
                  <div class="mt-2">Sin proyectos activos</div>
                </div>
              </template>
            </v-list>
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
                v-if="hasPermission('clientes', 'editar')"
                color="warning"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="editarCliente"
              >
                Editar Cliente
              </v-btn>

              <v-btn
                v-if="hasPermission('clientes', 'editar')"
                :color="cliente.activo ? 'error' : 'success'"
                variant="outlined"
                size="small"
                :prepend-icon="cliente.activo ? 'mdi-domain-remove' : 'mdi-domain-plus'"
                @click="toggleEstado"
              >
                {{ cliente.activo ? 'Desactivar' : 'Activar' }}
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
                v-if="hasPermission('clientes', 'ver')"
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-eye-plus"
                @click="verDetalleCompleto"
              >
                Ver Detalle Completo
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
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useClienteEmpresaStore } from '../store/cliente-empresa.store'
import type {
  ClienteEmpresaListItem,
  ClienteEmpresaDetalle,
} from '../interfaces/cliente-empresa.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Props {
  modelValue: boolean
  cliente: ClienteEmpresaListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'editar-cliente': [cliente: ClienteEmpresaListItem]
  'toggle-estado': [cliente: ClienteEmpresaListItem]
}>()

const authStore = useAuthStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const clienteDetalle = ref<ClienteEmpresaDetalle | null>(null)

// Computed
const iniciales = computed(() => {
  if (!props.cliente) return ''
  return props.cliente.razonSocial
    .split(' ')
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function getEstadoProyectoColor(estado: string): string {
  const colores: Record<string, string> = {
    PLANEADO: 'purple',
    EN_PROGRESO: 'info',
    FINALIZADO: 'success',
  }
  return colores[estado] || 'grey'
}

function editarCliente() {
  if (props.cliente) {
    emit('editar-cliente', props.cliente)
  }
}

function toggleEstado() {
  if (props.cliente) {
    emit('toggle-estado', props.cliente)
  }
}

function enviarCorreo() {
  if (props.cliente) {
    window.open(`mailto:${props.cliente.correo}`)
  }
}

function llamar() {
  if (props.cliente) {
    window.open(`tel:${props.cliente.telefono}`)
  }
}

async function verDetalleCompleto() {
  if (props.cliente && hasPermission('clientes', 'ver')) {
    try {
      clienteDetalle.value = await clienteEmpresaStore.obtenerClienteDetalle(
        props.cliente.idCliente,
      )
    } catch (error) {
      console.error('Error al cargar detalle completo:', error)
    }
  }
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      clienteDetalle.value = null
    }
  },
)
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
