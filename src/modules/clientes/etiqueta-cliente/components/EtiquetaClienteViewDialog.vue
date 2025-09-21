<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
  >
    <v-card v-if="etiqueta">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-tag</v-icon>
        Detalles de la Etiqueta
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Header con información principal -->
        <div class="text-center mb-6">
          <v-chip :color="colorEtiqueta" size="x-large" variant="elevated" class="mb-4">
            <v-icon start size="large">mdi-tag</v-icon>
            <span class="text-h6">{{ etiqueta.nombre }}</span>
          </v-chip>

          <div class="mt-4">
            <v-chip color="info" size="large" variant="tonal" class="mr-2">
              <v-icon start>mdi-identifier</v-icon>
              ID: {{ etiqueta.idEtiqueta }}
            </v-chip>

            <v-chip color="success" size="large" variant="tonal">
              <v-icon start>mdi-account-group</v-icon>
              {{ totalClientesTexto }}
            </v-chip>
          </div>
        </div>

        <!-- Estadísticas de uso -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-chart-bar</v-icon>
            Estadísticas de Uso
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="4">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-primary">
                    {{ totalClientes }}
                  </div>
                  <div class="text-caption text-grey-darken-1">Clientes Asignados</div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-success">
                    {{ clientesActivos }}
                  </div>
                  <div class="text-caption text-grey-darken-1">Clientes Activos</div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-warning">{{ porcentajeUso }}%</div>
                  <div class="text-caption text-grey-darken-1">% de Uso Total</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Clientes asociados -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-domain</v-icon>
            Clientes con esta Etiqueta
          </v-card-title>
          <v-card-text class="pt-4">
            <div v-if="clientesAsociados.length > 0">
              <v-chip
                v-for="cliente in clientesAsociados"
                :key="cliente.idCliente"
                :color="cliente.activo ? 'success' : 'error'"
                variant="tonal"
                size="large"
                class="ma-1"
                @click="$emit('ver-cliente', cliente.idCliente)"
                style="cursor: pointer"
              >
                <v-avatar start size="24" :color="cliente.activo ? 'success' : 'error'">
                  <span class="text-caption">{{ cliente.razonSocial.charAt(0) }}</span>
                </v-avatar>
                {{ cliente.razonSocial }}
                <v-icon
                  end
                  size="16"
                  :icon="cliente.activo ? 'mdi-check-circle' : 'mdi-close-circle'"
                />
              </v-chip>
            </div>
            <div v-else class="text-center py-4">
              <v-icon size="48" color="grey-lighten-1">mdi-tag-off</v-icon>
              <div class="text-h6 mt-2 text-grey-darken-1">Sin clientes asignados</div>
              <div class="text-caption text-grey-darken-1">
                Esta etiqueta aún no ha sido asignada a ningún cliente
              </div>
            </div>
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
              <v-chip color="purple" variant="tonal" size="small" class="mb-2">
                <v-icon start>mdi-identifier</v-icon>
                ID de Etiqueta
              </v-chip>
              <div class="text-body-2 text-grey-darken-1 font-mono mb-3">
                {{ etiqueta.idEtiqueta }}
              </div>

              <v-chip color="info" variant="tonal" size="small" class="mb-2">
                <v-icon start>mdi-palette</v-icon>
                Color Asignado
              </v-chip>
              <div class="d-flex align-center mb-3">
                <v-avatar :color="colorEtiqueta" size="24" class="mr-2"></v-avatar>
                <span class="font-mono">{{ colorEtiqueta }}</span>
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
                v-if="hasPermission('etiquetas', 'editar')"
                color="warning"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="editarEtiqueta"
              >
                Editar Etiqueta
              </v-btn>

              <v-btn
                v-if="hasPermission('etiquetas', 'asignar')"
                color="success"
                variant="outlined"
                size="small"
                prepend-icon="mdi-account-plus"
                @click="$emit('asignar-etiqueta', etiqueta)"
              >
                Asignar a Clientes
              </v-btn>

              <v-btn
                v-if="hasPermission('etiquetas', 'eliminar')"
                color="error"
                variant="outlined"
                size="small"
                prepend-icon="mdi-delete"
                :disabled="totalClientes > 0"
                @click="$emit('confirmar-eliminacion', etiqueta)"
              >
                Eliminar Etiqueta
              </v-btn>

              <v-btn
                color="info"
                variant="outlined"
                size="small"
                prepend-icon="mdi-content-copy"
                @click="copiarInfo"
              >
                Copiar Información
              </v-btn>
            </div>
            <div v-if="hasPermission('etiquetas', 'eliminar') && totalClientes > 0" class="mt-2">
              <v-alert type="warning" variant="tonal" dense>
                No se puede eliminar la etiqueta porque tiene clientes asignados.
              </v-alert>
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
import { useEtiquetaClienteStore } from '../store/etiqueta-cliente.store'
import type { EtiquetaClienteListItem } from '../interfaces/etiqueta-cliente.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Props {
  modelValue: boolean
  etiqueta: EtiquetaClienteListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'editar-etiqueta': [etiqueta: EtiquetaClienteListItem]
  'confirmar-eliminacion': [etiqueta: EtiquetaClienteListItem]
  'asignar-etiqueta': [etiqueta: EtiquetaClienteListItem]
  'ver-cliente': [idCliente: string]
}>()

const authStore = useAuthStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const etiquetaClienteStore = useEtiquetaClienteStore()

// Estado local
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const colorEtiqueta = computed(() => {
  if (!props.etiqueta) return '#485696'

  let hash = 0
  const nombre = props.etiqueta.nombre
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colores = [
    '#1976D2',
    '#388E3C',
    '#F57C00',
    '#D32F2F',
    '#7B1FA2',
    '#0288D1',
    '#00796B',
    '#F9A825',
    '#C2185B',
    '#5D4037',
    '#455A64',
    '#E64A19',
    '#00BCD4',
    '#8BC34A',
    '#FF9800',
  ]

  return colores[Math.abs(hash) % colores.length]
})

const clientesAsociados = computed(() => {
  if (!props.etiqueta) return []

  const clientesIds = etiquetaClienteStore.obtenerClientesConEtiqueta(props.etiqueta.idEtiqueta)
  return clienteEmpresaStore.clientes.filter((cliente) => clientesIds.includes(cliente.idCliente))
})

const totalClientes = computed(() => clientesAsociados.value.length)

const clientesActivos = computed(
  () => clientesAsociados.value.filter((cliente) => cliente.activo).length,
)

const totalClientesTexto = computed(() => {
  const total = totalClientes.value
  return `${total} cliente${total !== 1 ? 's' : ''}`
})

const porcentajeUso = computed(() => {
  const totalClientesExistentes = clienteEmpresaStore.totalClientes
  if (totalClientesExistentes === 0) return 0
  return Math.round((totalClientes.value / totalClientesExistentes) * 100)
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function editarEtiqueta() {
  if (props.etiqueta) {
    emit('editar-etiqueta', props.etiqueta)
  }
}

async function copiarInfo() {
  if (!props.etiqueta) return

  try {
    const info = `Etiqueta: ${props.etiqueta.nombre}\nID: ${props.etiqueta.idEtiqueta}\nClientes asignados: ${totalClientes.value}\nClientes activos: ${clientesActivos.value}`
    await navigator.clipboard.writeText(info)
    snackbar.value = {
      show: true,
      message: 'Información copiada al portapapeles',
      color: 'success',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: 'Error al copiar la información',
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
