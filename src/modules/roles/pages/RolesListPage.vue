<template>
  <div class="roles-container">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Gestión de Roles</h1>
          <p class="text-subtitle-1 text-contraste">Administra los roles y permisos del sistema</p>
        </div>
        <v-btn
          v-if="hasPermission('roles', 'crear')"
          color="#485696"
          size="large"
          prepend-icon="mdi-plus"
          @click="mostrarDialogoCrear = true"
        >
          Nuevo Rol
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="primary" class="mr-3">
                <v-icon color="white">mdi-shield-account</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalRoles }}</div>
                <div class="text-caption text-grey-darken-1">Total Roles</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="success" class="mr-3">
                <v-icon color="white">mdi-key</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalPermisos }}</div>
                <div class="text-caption text-grey-darken-1">Permisos Disponibles</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="info" class="mr-3">
                <v-icon color="white">mdi-folder-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ Object.keys(rolesPorModulo).length }}</div>
                <div class="text-caption text-grey-darken-1">Módulos</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="warning" class="mr-3">
                <v-icon color="white">mdi-account-group</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ promedioPermisosPorRol }}</div>
                <div class="text-caption text-grey-darken-1">Prom. Permisos/Rol</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros y Búsqueda -->
    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="busqueda"
              label="Buscar roles"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              placeholder="Buscar por nombre o descripción..."
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="filtroModulo"
              label="Filtrar por módulo"
              :items="opcionesModulos"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn color="primary" variant="outlined" @click="limpiarFiltros" block>
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla de Roles -->
    <v-card elevation="3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#485696">mdi-shield-account-variant</v-icon>
        Lista de Roles
        <v-spacer />
        <v-chip color="primary" variant="tonal"> {{ rolesFiltrados.length }} roles </v-chip>
      </v-card-title>

      <v-data-table
        v-model:page="pagina"
        :headers="headers"
        :items="rolesFiltrados"
        :loading="loading"
        :items-per-page="itemsPorPagina"
        class="elevation-0"
        loading-text="Cargando roles..."
        no-data-text="No hay roles disponibles"
      >
        <!-- Nombre con descripción -->
        <template v-slot:item.nombre="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.nombre }}</div>
            <div class="text-caption text-grey-darken-1">
              {{ item.descripcion || 'Sin descripción' }}
            </div>
          </div>
        </template>

        <!-- ID del rol -->
        <template v-slot:item.idRol="{ item }">
          <v-chip color="purple" variant="tonal" size="small">
            <span class="font-mono">{{ item.idRol.slice(0, 8) }}...</span>
          </v-chip>
        </template>

        <!-- Acciones -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="Ver detalles y permisos">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="verRol(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Editar rol">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('roles', 'editar')"
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editarRol(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Gestionar permisos">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('roles', 'editar-permisos')"
                  v-bind="props"
                  icon="mdi-key"
                  size="small"
                  variant="text"
                  color="info"
                  @click="gestionarPermisos(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Eliminar rol">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('roles', 'eliminar')"
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmarEliminacion(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog Crear Rol -->
    <RolCreateDialog v-model="mostrarDialogoCrear" @rol-creado="onRolCreado" />

    <!-- Dialog Editar Rol -->
    <RolEditDialog
      v-model="mostrarDialogoEditar"
      :rol="rolSeleccionado"
      @rol-actualizado="onRolActualizado"
    />

    <!-- Dialog Ver Rol -->
    <RolViewDialog
      v-model="mostrarDialogoVer"
      :rol="rolSeleccionado"
      @editar-rol="editarRol"
      @gestionar-permisos="gestionarPermisos"
      @eliminar-rol="confirmarEliminacion"
    />

    <!-- Dialog Gestionar Permisos -->
    <RolPermisosDialog
      v-model="mostrarDialogoPermisos"
      :rol="rolSeleccionado"
      @permisos-actualizados="onPermisosActualizados"
    />

    <!-- Dialog Confirmación Eliminación -->
    <v-dialog v-model="mostrarConfirmacionEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-error">
          <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          <p>
            ¿Estás seguro de que deseas eliminar el rol <strong>{{ rolAEliminar?.nombre }}</strong
            >?
          </p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Esta acción no se puede deshacer. Los usuarios con este rol perderán sus permisos.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="mostrarConfirmacionEliminar = false"> Cancelar </v-btn>
          <v-btn color="error" @click="eliminarRol" :loading="loadingEliminar"> Eliminar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRolesStore } from '../store/roles.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { RolListItem } from '../interfaces/rol.interface'
import type { Permiso } from '../interfaces/rol.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'
import RolCreateDialog from '../components/RolCreateDialog.vue'
import RolEditDialog from '../components/RolEditDialog.vue'
import RolViewDialog from '../components/RolViewDialog.vue'
import RolPermisosDialog from '../components/RolPermisosDialog.vue'

const rolesStore = useRolesStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroModulo = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)
const loadingEliminar = ref(false)

// Dialogs
const mostrarDialogoCrear = ref(false)
const mostrarDialogoEditar = ref(false)
const mostrarDialogoVer = ref(false)
const mostrarDialogoPermisos = ref(false)
const mostrarConfirmacionEliminar = ref(false)
const rolSeleccionado = ref<RolListItem | null>(null)
const rolAEliminar = ref<RolListItem | null>(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const loading = computed(() => rolesStore.loading)
const roles = computed(() => rolesStore.roles)
const totalRoles = computed(() => rolesStore.totalRoles)
const rolesPorModulo = computed(() => rolesStore.rolesPorModulo)
const totalPermisos = computed(() => rolesStore.permisosDisponibles.length)

// Calcular promedio real de permisos por rol
const promedioPermisosPorRol = computed(() => {
  if (roles.value.length === 0) return 0
  // Sumar la cantidad de permisos de cada rol
  const totalPermisosAsignados = roles.value.reduce((acc, rol) => {
    return acc + (Array.isArray(rol.permisos) ? rol.permisos.length : 0)
  }, 0)
  return Math.round(totalPermisosAsignados / roles.value.length)
})

// Opciones para filtros
const opcionesModulos = computed(() => {
  const modulos = [...new Set(rolesStore.permisosDisponibles.map((p) => p.modulo))]
  return modulos.map((modulo) => ({ title: modulo, value: modulo }))
})

// Headers de la tabla
const headers = [
  { title: 'Rol', key: 'nombre', sortable: true },
  { title: 'ID', key: 'idRol', sortable: false, width: 150 },
  { title: 'Acciones', key: 'actions', sortable: false, width: 200 },
]

// Roles filtrados
const rolesFiltrados = computed(() => {
  let resultado = roles.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (r) =>
        r.nombre.toLowerCase().includes(termino) ||
        (r.descripcion && r.descripcion.toLowerCase().includes(termino)),
    )
  }

  // Filtrar por módulo usando los permisos de cada rol
  if (filtroModulo.value) {
    resultado = resultado.filter(
      (rol) =>
        Array.isArray(rol.permisos) &&
        rol.permisos.some((permiso: Permiso) => permiso.modulo === filtroModulo.value),
    )
  }

  return resultado
})

// Verificar permisos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

// Acciones
function verRol(rol: RolListItem) {
  rolSeleccionado.value = rol
  mostrarDialogoVer.value = true
}

function editarRol(rol: RolListItem) {
  rolSeleccionado.value = rol
  mostrarDialogoEditar.value = true
}

function gestionarPermisos(rol: RolListItem) {
  rolSeleccionado.value = rol
  mostrarDialogoPermisos.value = true
}

function confirmarEliminacion(rol: RolListItem) {
  rolAEliminar.value = rol
  mostrarConfirmacionEliminar.value = true
}

async function eliminarRol() {
  if (!rolAEliminar.value) return

  loadingEliminar.value = true
  try {
    await rolesStore.eliminarRol(rolAEliminar.value.idRol)
    mostrarConfirmacionEliminar.value = false
    mostrarMensaje(`Rol "${rolAEliminar.value.nombre}" eliminado correctamente`, 'success')
  } catch (error) {
    mostrarMensaje('Error al eliminar el rol', 'error')
  } finally {
    loadingEliminar.value = false
    rolAEliminar.value = null
  }
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroModulo.value = ''
}

function onRolCreado() {
  mostrarDialogoCrear.value = false
  rolesStore.cargarRoles()
  mostrarMensaje('Rol creado correctamente', 'success')
}

function onRolActualizado() {
  mostrarDialogoEditar.value = false
  rolesStore.cargarRoles()
  mostrarMensaje('Rol actualizado correctamente', 'success')
}

function onPermisosActualizados() {
  mostrarDialogoPermisos.value = false
  mostrarMensaje('Permisos del rol actualizados correctamente', 'success')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Inicialización
onMounted(async () => {
  await rolesStore.cargarRoles()
  await rolesStore.cargarPermisosDisponibles()
})
</script>

<style scoped>
.roles-container {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffb74d 0%, #ebb768 100%);
  color: #212121;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.stats-card {
  height: 100%;
  transition: transform 0.2s ease;
  border-radius: 12px;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.v-card {
  border-radius: 12px;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

@media (max-width: 960px) {
  .roles-container {
    padding: 1rem;
  }
}
</style>
