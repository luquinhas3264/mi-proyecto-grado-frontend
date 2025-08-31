<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
  >
    <v-card v-if="usuario">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-account-details</v-icon>
        Detalles del Usuario
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Avatar y Estado -->
        <div class="text-center mb-6">
          <v-avatar size="100" color="#485696" class="mb-4">
            <span class="text-h3">{{ iniciales }}</span>
          </v-avatar>
          <h2 class="text-h5 mb-2">{{ usuario.nombre }}</h2>
          <v-chip :color="usuario.activo ? 'success' : 'error'" size="large" variant="tonal">
            <v-icon start :icon="usuario.activo ? 'mdi-check-circle' : 'mdi-close-circle'" />
            {{ usuario.activo ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </div>

        <!-- Información Personal -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6 text-contraste">
            <v-icon class="mr-2">mdi-account</v-icon>
            Información Personal
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="primary" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-account</v-icon>
                    Nombre
                  </v-chip>
                  <div class="text-body-1 font-weight-medium">{{ usuario.nombre }}</div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="info" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-email</v-icon>
                    Correo
                  </v-chip>
                  <div class="text-body-1">{{ usuario.correo }}</div>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="mb-3">
                  <v-chip color="purple" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-identifier</v-icon>
                    ID de Usuario
                  </v-chip>
                  <div class="text-body-2 text-grey-darken-1 font-mono">
                    {{ usuario.idUsuario }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Información de Rol -->
        <v-card variant="outlined" class="mb-4" v-if="usuario.rol">
          <v-card-title class="text-h6 text-contraste">
            <v-icon class="mr-2">mdi-shield-account</v-icon>
            Rol y Permisos
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex align-center mb-3">
              <v-avatar size="48" color="#FF7043" class="mr-3">
                <v-icon color="white">mdi-shield-account</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ usuario.rol.nombre }}</div>
                <div class="text-body-2 text-grey-darken-1">{{ usuario.rol.descripcion }}</div>
              </div>
            </div>

            <v-chip color="orange" variant="tonal" size="small">
              <v-icon start>mdi-identifier</v-icon>
              ID: {{ usuario.rol.idRol }}
            </v-chip>
          </v-card-text>
        </v-card>

        <!-- Estadísticas y Actividad -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6 text-contraste">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Actividad del Usuario
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="4">
                <div class="text-center">
                  <v-icon size="32" color="success" class="mb-2">mdi-calendar-check</v-icon>
                  <div class="text-caption text-grey-darken-1">Fecha de Registro</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ formatearFecha(usuario.fechaCreacion) }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-center">
                  <v-icon size="32" color="info" class="mb-2">mdi-clock-outline</v-icon>
                  <div class="text-caption text-grey-darken-1">Último Acceso</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ formatearFecha(usuario.ultimoAcceso) }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-center">
                  <v-icon size="32" color="warning" class="mb-2">mdi-account-clock</v-icon>
                  <div class="text-caption text-grey-darken-1">Estado</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ usuario.activo ? 'Usuario Activo' : 'Usuario Inactivo' }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
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
                v-if="hasPermission('usuarios', 'editar')"
                color="warning"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="editarUsuario"
              >
                Editar Usuario
              </v-btn>

              <v-btn
                v-if="hasPermission('usuarios', 'editar')"
                :color="usuario.activo ? 'error' : 'success'"
                variant="outlined"
                size="small"
                :prepend-icon="usuario.activo ? 'mdi-account-off' : 'mdi-account-check'"
                @click="toggleEstado"
              >
                {{ usuario.activo ? 'Desactivar' : 'Activar' }}
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
import type { UsuarioListItem } from '../interfaces/usuario.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Props {
  modelValue: boolean
  usuario: UsuarioListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'editar-usuario': [usuario: UsuarioListItem]
  'toggle-estado': [usuario: UsuarioListItem]
}>()

const authStore = useAuthStore()

// Computed
const iniciales = computed(() => {
  if (!props.usuario) return ''
  return props.usuario.nombre
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

function formatearFecha(fecha: string | undefined): string {
  if (!fecha) return 'No disponible'
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha))
  } catch (error) {
    return 'Fecha inválida'
  }
}

function editarUsuario() {
  if (props.usuario) {
    emit('editar-usuario', props.usuario)
  }
}

function toggleEstado() {
  if (props.usuario) {
    emit('toggle-estado', props.usuario)
  }
}

function enviarCorreo() {
  if (props.usuario) {
    window.open(`mailto:${props.usuario.correo}`)
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
