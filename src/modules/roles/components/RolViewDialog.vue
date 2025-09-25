<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
  >
    <v-card v-if="rol">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-shield-search</v-icon>
        Detalles del Rol
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Header del Rol -->
        <div class="text-center mb-6">
          <v-avatar size="100" color="#485696" class="mb-4">
            <v-icon color="white" size="48">mdi-shield-account</v-icon>
          </v-avatar>
          <h2 class="text-h5 mb-2">{{ rol.nombre }}</h2>
          <p class="text-body-1 text-grey-darken-1 mb-3">
            {{ rol.descripcion || 'Sin descripción' }}
          </p>
          <v-chip color="primary" variant="tonal" size="large">
            <v-icon start>mdi-identifier</v-icon>
            {{ rol.idRol.slice(0, 8) }}...
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
                    <v-icon start>mdi-shield-account</v-icon>
                    Nombre del Rol
                  </v-chip>
                  <div class="text-body-1 font-weight-medium">{{ rol.nombre }}</div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="info" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-text</v-icon>
                    Descripción
                  </v-chip>
                  <div class="text-body-1">{{ rol.descripcion || 'Sin descripción' }}</div>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="mb-3">
                  <v-chip color="purple" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-identifier</v-icon>
                    ID del Rol
                  </v-chip>
                  <div class="text-body-2 text-grey-darken-1 font-mono">
                    {{ rol.idRol }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Permisos del Rol -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6 text-contraste">
            <v-icon class="mr-2">mdi-key-outline</v-icon>
            Permisos Asignados
            <v-btn
              v-if="hasPermission('roles', 'editar-permisos')"
              color="white"
              variant="elevated"
              size="small"
              prepend-icon="mdi-key"
              style="color: #ff8c00; border: 1px solid #ff8c00"
              @click="$emit('gestionar-permisos', rol)"
            >
              Gestionar
            </v-btn>
          </v-card-title>
          <v-card-text class="pt-4">
            <div v-if="loadingPermisos" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" />
              <div class="mt-2">Cargando permisos...</div>
            </div>

            <div v-else-if="rolDetallado?.permisos && rolDetallado.permisos.length > 0">
              <!-- Permisos agrupados por módulo -->
              <div v-for="(permisosModulo, modulo) in permisosAgrupados" :key="modulo" class="mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon color="#485696" class="mr-2">mdi-folder</v-icon>
                  <span class="text-h6 font-weight-bold">{{ modulo }}</span>
                  <v-chip color="primary" variant="tonal" size="small" class="ml-2">
                    {{ permisosModulo.length }}
                  </v-chip>
                </div>

                <div class="d-flex flex-wrap gap-2 ml-8">
                  <v-chip
                    v-for="permisoRol in permisosModulo"
                    :key="permisoRol.idPermiso"
                    color="success"
                    variant="tonal"
                    size="small"
                  >
                    <v-icon start>mdi-check</v-icon>
                    {{ permisoRol.permiso.accion }}
                  </v-chip>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4">
              <v-icon size="48" color="grey" class="mb-2">mdi-key-off</v-icon>
              <div class="text-body-1 text-grey-darken-1">Este rol no tiene permisos asignados</div>
              <v-btn
                v-if="hasPermission('roles', 'editar-permisos')"
                color="primary"
                variant="outlined"
                size="small"
                class="mt-2"
                @click="$emit('gestionar-permisos', rol)"
              >
                Asignar Permisos
              </v-btn>
            </div>
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
                v-if="hasPermission('roles', 'editar')"
                color="warning"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="$emit('editar-rol', rol)"
              >
                Editar Rol
              </v-btn>

              <v-btn
                v-if="hasPermission('roles', 'editar-permisos')"
                color="info"
                variant="outlined"
                size="small"
                prepend-icon="mdi-key"
                @click="$emit('gestionar-permisos', rol)"
              >
                Gestionar Permisos
              </v-btn>

              <v-btn
                v-if="hasPermission('roles', 'eliminar')"
                color="error"
                variant="outlined"
                size="small"
                prepend-icon="mdi-delete"
                @click="$emit('eliminar-rol', rol)"
              >
                Eliminar Rol
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
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useRolesStore } from '../store/roles.store'
import type { RolListItem, Rol, RolPermiso } from '../interfaces/rol.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Props {
  modelValue: boolean
  rol: RolListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'editar-rol': [rol: RolListItem]
  'gestionar-permisos': [rol: RolListItem]
  'eliminar-rol': [rol: RolListItem]
}>()

const authStore = useAuthStore()
const rolesStore = useRolesStore()

// Estado
const rolDetallado = ref<Rol | null>(null)
const loadingPermisos = ref(false)

// Computed
const permisosAgrupados = computed(() => {
  if (!rolDetallado.value?.permisos) return {}

  return rolDetallado.value.permisos.reduce(
    (acc, permisoRol: RolPermiso) => {
      const modulo = permisoRol.permiso.modulo
      if (!acc[modulo]) acc[modulo] = []
      acc[modulo].push(permisoRol)
      return acc
    },
    {} as Record<string, RolPermiso[]>,
  )
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

async function cargarDetallesRol() {
  if (!props.rol) return

  loadingPermisos.value = true
  try {
    rolDetallado.value = await rolesStore.obtenerRol(props.rol.idRol)
  } catch (error) {
    console.error('Error al cargar detalles del rol:', error)
  } finally {
    loadingPermisos.value = false
  }
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.rol) {
      cargarDetallesRol()
    } else {
      rolDetallado.value = null
    }
  },
)

watch(
  () => props.rol,
  () => {
    if (props.modelValue && props.rol) {
      cargarDetallesRol()
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
