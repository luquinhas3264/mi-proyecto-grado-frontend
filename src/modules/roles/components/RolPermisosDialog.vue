<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
    persistent
    scrollable
  >
    <v-card v-if="rol">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-key-outline</v-icon>
        Gestionar Permisos - {{ rol.nombre }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4" style="max-height: 70vh">
        <div v-if="loadingPermisos" class="text-center py-8">
          <v-progress-circular indeterminate size="64" color="primary" />
          <div class="mt-4">Cargando permisos...</div>
        </div>

        <div v-else>
          <!-- Información del Rol -->
          <v-card variant="tonal" color="info" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar size="48" color="#485696" class="mr-3">
                  <v-icon color="white">mdi-shield-account</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold">{{ rol.nombre }}</div>
                  <div class="text-body-2 text-grey-darken-1">
                    {{ rol.descripcion || 'Sin descripción' }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Estadísticas de Permisos -->
          <v-row class="mb-4">
            <v-col cols="6" md="3">
              <v-card variant="tonal" color="success" class="text-center">
                <v-card-text>
                  <v-icon size="32" color="success" class="mb-2">mdi-check-circle</v-icon>
                  <div class="text-h6 font-weight-bold">{{ permisosSeleccionados.length }}</div>
                  <div class="text-caption">Asignados</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card variant="tonal" color="warning" class="text-center">
                <v-card-text>
                  <v-icon size="32" color="warning" class="mb-2">mdi-clock-outline</v-icon>
                  <div class="text-h6 font-weight-bold">
                    {{ permisosDisponibles.length - permisosSeleccionados.length }}
                  </div>
                  <div class="text-caption">Disponibles</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card variant="tonal" color="info" class="text-center">
                <v-card-text>
                  <v-icon size="32" color="info" class="mb-2">mdi-folder-multiple</v-icon>
                  <div class="text-h6 font-weight-bold">
                    {{ Object.keys(permisosPorModulo).length }}
                  </div>
                  <div class="text-caption">Módulos</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card variant="tonal" color="primary" class="text-center">
                <v-card-text>
                  <v-icon size="32" color="primary" class="mb-2">mdi-percent</v-icon>
                  <div class="text-h6 font-weight-bold">{{ porcentajeCobertura }}%</div>
                  <div class="text-caption">Cobertura</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Búsqueda de Permisos -->
          <v-text-field
            v-model="busquedaPermisos"
            label="Buscar permisos"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            class="mb-4"
            placeholder="Buscar por módulo o acción..."
          />

          <!-- Acciones Rápidas -->
          <div class="mb-4">
            <v-btn
              color="success"
              variant="outlined"
              size="small"
              prepend-icon="mdi-check-all"
              @click="seleccionarTodos"
              class="mr-2"
            >
              Seleccionar Todos
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              prepend-icon="mdi-close-circle"
              @click="deseleccionarTodos"
            >
              Deseleccionar Todos
            </v-btn>
          </div>

          <!-- Lista de Permisos por Módulo -->
          <div v-for="(permisos, modulo) in permisosFiltradosPorModulo" :key="modulo" class="mb-4">
            <v-card variant="outlined">
              <v-card-title class="d-flex align-center justify-space-between bg-grey-lighten-5">
                <div class="d-flex align-center modulo-titulo">
                  <v-icon class="mr-2" color="white">mdi-folder-account</v-icon>
                  <span class="text-h6 modulo-texto">{{ modulo }}</span>
                  <v-chip color="white" variant="tonal" size="small" class="ml-2">
                    {{
                      permisos.filter((p) => permisosSeleccionados.includes(p.idPermiso)).length
                    }}/{{ permisos.length }}
                  </v-chip>
                </div>

                <!-- Selección de módulo completo -->
                <v-checkbox
                  :model-value="todoElModuloSeleccionado(modulo)"
                  :indeterminate="
                    algunPermisoDelModuloSeleccionado(modulo) && !todoElModuloSeleccionado(modulo)
                  "
                  @update:model-value="toggleModuloCompleto(modulo, Boolean($event))"
                  hide-details
                  color="white"
                  class="modulo-checkbox"
                />
              </v-card-title>

              <v-card-text class="pt-4">
                <v-row>
                  <v-col
                    v-for="permiso in permisos"
                    :key="permiso.idPermiso"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-checkbox
                      :model-value="permisosSeleccionados.includes(permiso.idPermiso)"
                      @update:model-value="togglePermiso(permiso.idPermiso, Boolean($event))"
                      :label="permiso.accion"
                      color="primary"
                      hide-details
                    >
                      <template v-slot:label>
                        <div class="d-flex align-center">
                          <v-icon class="mr-2" size="small" color="#ffb74d">mdi-key-variant</v-icon>
                          <span>{{ permiso.accion }}</span>
                        </div>
                      </template>
                    </v-checkbox>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>

          <!-- Sin permisos encontrados -->
          <div v-if="Object.keys(permisosFiltradosPorModulo).length === 0" class="text-center py-8">
            <v-icon size="64" color="grey">mdi-magnify</v-icon>
            <div class="text-h6 text-grey-darken-1 mt-2">No se encontraron permisos</div>
            <div class="text-body-2 text-grey-darken-1">
              Intenta cambiar los términos de búsqueda
            </div>
          </div>
        </div>

        <!-- Error -->
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4" border="start" prominent>
          {{ error }}
        </v-alert>

        <!-- Información sobre cambios -->
        <v-alert v-if="hayCambios" type="warning" variant="tonal" class="mt-4">
          <template v-slot:title>
            <v-icon class="mr-2">mdi-information-outline</v-icon>
            Cambios Pendientes
          </template>
          Has realizado {{ cambiosPendientes }} cambios que se aplicarán al guardar.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <div class="d-flex align-center">
          <v-chip color="primary" variant="tonal" size="small">
            <v-icon start>mdi-check-circle</v-icon>
            {{ permisosSeleccionados.length }} seleccionados
          </v-chip>
        </div>
        <v-spacer />
        <v-btn variant="outlined" @click="cancelar" :disabled="loading"> Cancelar </v-btn>
        <v-btn color="#485696" @click="guardarPermisos" :loading="loading" :disabled="!hayCambios">
          <v-icon start>mdi-content-save</v-icon>
          Guardar Permisos
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useRolesStore } from '../store/roles.store'
import type { RolListItem, Rol, Permiso } from '../interfaces/rol.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Props {
  modelValue: boolean
  rol: RolListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'permisos-actualizados': []
}>()

const authStore = useAuthStore()
const rolesStore = useRolesStore()

// Estado
const rolDetallado = ref<Rol | null>(null)
const permisosSeleccionados = ref<string[]>([])
const permisosOriginales = ref<string[]>([])
const loadingPermisos = ref(false)
const loading = ref(false)
const error = ref('')
const busquedaPermisos = ref('')

// Computed
const permisosDisponibles = computed(() => rolesStore.permisosDisponibles)

const permisosPorModulo = computed(() => {
  return permisosDisponibles.value.reduce(
    (acc, permiso: Permiso) => {
      if (!acc[permiso.modulo]) acc[permiso.modulo] = []
      acc[permiso.modulo].push(permiso)
      return acc
    },
    {} as Record<string, Permiso[]>,
  )
})

const permisosFiltradosPorModulo = computed(() => {
  if (!busquedaPermisos.value) return permisosPorModulo.value

  const termino = busquedaPermisos.value.toLowerCase()
  const resultado: Record<string, Permiso[]> = {}

  Object.entries(permisosPorModulo.value).forEach(([modulo, permisos]) => {
    const permisosFiltrados = permisos.filter(
      (p) => p.modulo.toLowerCase().includes(termino) || p.accion.toLowerCase().includes(termino),
    )

    if (permisosFiltrados.length > 0) {
      resultado[modulo] = permisosFiltrados
    }
  })

  return resultado
})

const hayCambios = computed(() => {
  return (
    JSON.stringify(permisosSeleccionados.value.sort()) !==
    JSON.stringify(permisosOriginales.value.sort())
  )
})

const cambiosPendientes = computed(() => {
  const seleccionados = new Set(permisosSeleccionados.value)
  const originales = new Set(permisosOriginales.value)

  const agregados = permisosSeleccionados.value.filter((id) => !originales.has(id))
  const removidos = permisosOriginales.value.filter((id) => !seleccionados.has(id))

  return agregados.length + removidos.length
})

const porcentajeCobertura = computed(() => {
  if (permisosDisponibles.value.length === 0) return 0
  return Math.round((permisosSeleccionados.value.length / permisosDisponibles.value.length) * 100)
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

async function cargarPermisos() {
  if (!props.rol) return

  loadingPermisos.value = true
  try {
    // Cargar permisos disponibles si no están cargados
    if (permisosDisponibles.value.length === 0) {
      await rolesStore.cargarPermisosDisponibles()
    }

    // Cargar detalles del rol con sus permisos
    rolDetallado.value = await rolesStore.obtenerRol(props.rol.idRol)

    // Extraer IDs de permisos actuales
    const permisosActuales = rolDetallado.value.permisos?.map((rp) => rp.idPermiso) || []
    permisosSeleccionados.value = [...permisosActuales]
    permisosOriginales.value = [...permisosActuales]
  } catch (error) {
    console.error('Error al cargar permisos:', error)
  } finally {
    loadingPermisos.value = false
  }
}

function togglePermiso(idPermiso: string, seleccionado: boolean) {
  if (seleccionado) {
    if (!permisosSeleccionados.value.includes(idPermiso)) {
      permisosSeleccionados.value.push(idPermiso)
    }
  } else {
    const index = permisosSeleccionados.value.indexOf(idPermiso)
    if (index > -1) {
      permisosSeleccionados.value.splice(index, 1)
    }
  }
}

function todoElModuloSeleccionado(modulo: string): boolean {
  const permisosDelModulo = permisosPorModulo.value[modulo] || []
  return permisosDelModulo.every((p) => permisosSeleccionados.value.includes(p.idPermiso))
}

function algunPermisoDelModuloSeleccionado(modulo: string): boolean {
  const permisosDelModulo = permisosPorModulo.value[modulo] || []
  return permisosDelModulo.some((p) => permisosSeleccionados.value.includes(p.idPermiso))
}

function toggleModuloCompleto(modulo: string, seleccionar: boolean) {
  const permisosDelModulo = permisosPorModulo.value[modulo] || []

  permisosDelModulo.forEach((permiso) => {
    const index = permisosSeleccionados.value.indexOf(permiso.idPermiso)

    if (seleccionar && index === -1) {
      permisosSeleccionados.value.push(permiso.idPermiso)
    } else if (!seleccionar && index > -1) {
      permisosSeleccionados.value.splice(index, 1)
    }
  })
}

function seleccionarTodos() {
  permisosSeleccionados.value = permisosDisponibles.value.map((p) => p.idPermiso)
}

function deseleccionarTodos() {
  permisosSeleccionados.value = []
}

async function guardarPermisos() {
  if (!props.rol || !hayCambios.value) return

  loading.value = true
  error.value = ''

  try {
    await rolesStore.asignarPermisos(props.rol.idRol, permisosSeleccionados.value)
    permisosOriginales.value = [...permisosSeleccionados.value]
    emit('permisos-actualizados')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al guardar los permisos'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  // Restaurar permisos originales
  permisosSeleccionados.value = [...permisosOriginales.value]
  error.value = ''
  emit('update:modelValue', false)
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.rol) {
      cargarPermisos()
    } else {
      // Limpiar estado al cerrar
      rolDetallado.value = null
      permisosSeleccionados.value = []
      permisosOriginales.value = []
      error.value = ''
      busquedaPermisos.value = ''
    }
  },
)

watch(
  () => props.rol,
  () => {
    if (props.modelValue && props.rol) {
      cargarPermisos()
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
  background: linear-gradient(135deg, #485696 0%, #5c6bc0 100%);
  color: white;
  font-weight: 600;
}
.modulo-titulo {
  color: #fff;
}
.modulo-texto {
  color: #fff;
  font-weight: bold;
  text-shadow: 0 1px 4px rgba(44, 44, 44, 0.25);
}
.modulo-checkbox :deep(.v-selection-control__input) {
  border-color: #fff !important;
}
.modulo-checkbox :deep(.v-selection-control__input .v-icon) {
  color: #fff !important;
}

.v-card-actions {
  background: #f8f9fa;
}

.v-checkbox :deep(.v-selection-control__input) {
  margin-right: 8px;
}

.text-contraste {
  color: #485696 !important;
}
</style>
