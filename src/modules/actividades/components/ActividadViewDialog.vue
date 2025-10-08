<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
  >
    <v-card v-if="actividad">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-eye</v-icon>
        Detalles de la Actividad
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Header de la Actividad -->
        <div class="text-center mb-6">
          <v-avatar size="100" :color="tipoColor" class="mb-4">
            <v-icon color="white" size="48">{{ tipoIcon }}</v-icon>
          </v-avatar>
          <h2 class="text-h5 mb-2">{{ tipoLabel }}</h2>
          <p class="text-body-1 text-grey-darken-1 mb-3">
            {{ actividad.descripcion }}
          </p>
          <v-chip :color="tipoColor" variant="tonal" size="large">
            <v-icon start>{{ tipoIcon }}</v-icon>
            {{ tipoLabel }}
          </v-chip>
        </div>

        <!-- Información Básica -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6 text-contraste">
            <v-icon class="mr-2">mdi-information</v-icon>
            Información Básica
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="primary" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-calendar-clock</v-icon>
                    Fecha y Hora
                  </v-chip>
                  <div class="text-body-1 font-weight-medium">
                    {{ formatearFecha(actividad.fecha) }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="info" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-account</v-icon>
                    Usuario
                  </v-chip>
                  <div class="text-body-1">
                    {{ actividad.usuario?.nombre || 'Usuario desconocido' }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="mb-3">
                  <v-chip color="success" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-text</v-icon>
                    Descripción
                  </v-chip>
                  <div class="text-body-1">{{ actividad.descripcion }}</div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="orange" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-domain</v-icon>
                    Cliente
                  </v-chip>
                  <div class="text-body-1">
                    {{ nombreCliente }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6" v-if="actividad.idProyecto">
                <div class="mb-3">
                  <v-chip color="cyan" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-briefcase</v-icon>
                    Proyecto
                  </v-chip>
                  <div class="text-body-1">
                    {{ nombreProyecto }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-col cols="12" md="6">
            <div class="mb-3">
              <v-chip color="purple" variant="tonal" size="small" class="mb-1">
                <v-icon start>mdi-identifier</v-icon>
                ID Actividad
              </v-chip>
              <div class="text-body-2 text-grey-darken-1 font-mono">
                {{ actividad.idActividad.slice(0, 16) }}...
              </div>
            </div>
          </v-col>
        </v-card>

        <!-- Acciones Rápidas -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6 text-contraste">
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Acciones Rápidas
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-if="hasPermission('historial_actividades', 'editar')"
                color="warning"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="$emit('editar-actividad', actividad)"
              >
                Editar
              </v-btn>

              <v-btn
                v-if="hasPermission('historial_actividades', 'eliminar')"
                color="error"
                variant="outlined"
                size="small"
                prepend-icon="mdi-delete"
                @click="$emit('eliminar-actividad', actividad)"
              >
                Eliminar
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
import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useClienteEmpresaStore } from '@/modules/clientes/cliente-empresa/store/cliente-empresa.store'
import { useProyectoStore } from '@/modules/proyectos/proyecto/store/proyecto.store'
import type { Actividad } from '../interfaces/actividad.interface'
import {
  TipoActividadLabels,
  TipoActividadIcons,
  TipoActividadColors,
} from '../interfaces/actividad.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Props {
  modelValue: boolean
  actividad: Actividad | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'editar-actividad', 'eliminar-actividad'])

const authStore = useAuthStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const proyectoStore = useProyectoStore()

// Computed
const tipoLabel = computed(() => {
  if (!props.actividad) return ''
  return TipoActividadLabels[props.actividad.tipo]
})

const tipoIcon = computed(() => {
  if (!props.actividad) return ''
  return TipoActividadIcons[props.actividad.tipo]
})

const tipoColor = computed(() => {
  if (!props.actividad) return 'grey'
  return TipoActividadColors[props.actividad.tipo]
})

const nombreCliente = computed(() => {
  const idCliente = props.actividad?.idCliente
  if (!idCliente) return ''
  const cliente = clienteEmpresaStore.clientes.find((c) => c.idCliente === idCliente)
  return cliente?.razonSocial || idCliente
})

const nombreProyecto = computed(() => {
  const idProyecto = props.actividad?.idProyecto
  if (!idProyecto) return ''
  const proyecto = proyectoStore.proyectos.find((p) => p.idProyecto === idProyecto)
  return proyecto?.nombre || idProyecto
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function formatearFecha(fecha: string): string {
  try {
    const date = new Date(fecha)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return fecha
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
</style>
