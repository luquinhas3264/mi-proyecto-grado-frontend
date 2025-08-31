<template>
  <div class="usuarios-container">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Gestión de Usuarios</h1>
          <p class="text-subtitle-1 text-contraste">Administra los usuarios internos del sistema</p>
        </div>
        <v-btn
          v-if="hasPermission('usuarios', 'crear')"
          color="#485696"
          size="large"
          prepend-icon="mdi-plus"
          @click="mostrarDialogoCrear = true"
        >
          Nuevo Usuario
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
                <v-icon color="white">mdi-account-group</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalUsuarios }}</div>
                <div class="text-caption text-grey-darken-1">Total Usuarios</div>
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
                <v-icon color="white">mdi-account-check</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ usuariosActivos.length }}</div>
                <div class="text-caption text-grey-darken-1">Activos</div>
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
                <v-icon color="white">mdi-account-off</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ usuariosInactivos.length }}</div>
                <div class="text-caption text-grey-darken-1">Inactivos</div>
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
                <v-icon color="white">mdi-shield-account</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ Object.keys(usuariosPorRol).length }}</div>
                <div class="text-caption text-grey-darken-1">Roles Únicos</div>
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
          <v-col cols="12" md="4">
            <v-text-field
              v-model="busqueda"
              label="Buscar usuarios"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filtroEstado"
              label="Estado"
              :items="opcionesEstado"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filtroRol"
              label="Rol"
              :items="opcionesRoles"
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

    <!-- Tabla de Usuarios -->
    <v-card elevation="3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#485696">mdi-account-multiple</v-icon>
        Lista de Usuarios
        <v-spacer />
        <v-chip color="primary" variant="tonal"> {{ usuariosFiltrados.length }} usuarios </v-chip>
      </v-card-title>

      <v-data-table
        v-model:page="pagina"
        :headers="headers"
        :items="usuariosFiltrados"
        :loading="loading"
        :items-per-page="itemsPorPagina"
        class="elevation-0"
        loading-text="Cargando usuarios..."
        no-data-text="No hay usuarios disponibles"
      >
        <!-- Estado -->
        <template v-slot:item.activo="{ item }">
          <v-chip :color="item.activo ? 'success' : 'error'" size="small" variant="tonal">
            <v-icon start :icon="item.activo ? 'mdi-check-circle' : 'mdi-close-circle'" />
            {{ item.activo ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Rol -->
        <template v-slot:item.rol="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.rol.nombre }}</div>
            <div class="text-caption text-grey-darken-1">{{ item.rol.descripcion }}</div>
          </div>
        </template>

        <!-- Acciones -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="Ver detalles">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="verUsuario(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Editar">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('usuarios', 'editar')"
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editarUsuario(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip :text="item.activo ? 'Desactivar' : 'Activar'">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('usuarios', 'editar')"
                  v-bind="props"
                  :icon="item.activo ? 'mdi-account-off' : 'mdi-account-check'"
                  size="small"
                  variant="text"
                  :color="item.activo ? 'error' : 'success'"
                  @click="toggleEstado(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog Crear Usuario -->
    <UsuarioCreateDialog v-model="mostrarDialogoCrear" @usuario-creado="onUsuarioCreado" />

    <!-- Dialog Editar Usuario -->
    <UsuarioEditDialog
      v-model="mostrarDialogoEditar"
      :usuario="usuarioSeleccionado"
      @usuario-actualizado="onUsuarioActualizado"
    />

    <!-- Dialog Ver Usuario -->
    <UsuarioViewDialog
      v-model="mostrarDialogoVer"
      :usuario="usuarioSeleccionado"
      @editar-usuario="editarUsuario"
      @toggle-estado="toggleEstado"
    />

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
import { useUsuariosStore } from '../store/usuarios.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { UsuarioListItem } from '../interfaces/usuario.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'
import UsuarioCreateDialog from '../components/UsuarioCreateDialog.vue'
import UsuarioEditDialog from '../components/UsuarioEditDialog.vue'
import UsuarioViewDialog from '../components/UsuarioViewDialog.vue'

const usuariosStore = useUsuariosStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroEstado = ref('todos')
const filtroRol = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)

// Dialogs
const mostrarDialogoCrear = ref(false)
const mostrarDialogoEditar = ref(false)
const mostrarDialogoVer = ref(false)
const usuarioSeleccionado = ref<UsuarioListItem | null>(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const loading = computed(() => usuariosStore.loading)
const usuarios = computed(() => usuariosStore.usuarios)
const totalUsuarios = computed(() => usuariosStore.totalUsuarios)
const usuariosActivos = computed(() => usuariosStore.usuariosActivos)
const usuariosInactivos = computed(() => usuariosStore.usuariosInactivos)
const usuariosPorRol = computed(() => usuariosStore.usuariosPorRol)

// Opciones para filtros
const opcionesEstado = [
  { title: 'Todos', value: 'todos' },
  { title: 'Activos', value: 'activo' },
  { title: 'Inactivos', value: 'inactivo' },
]

const opcionesRoles = computed(() =>
  [...new Set(usuarios.value.map((u) => u.rol.nombre))].map((rol) => ({ title: rol, value: rol })),
)

// Headers de la tabla
const headers = [
  { title: 'Nombre', key: 'nombre', sortable: true },
  { title: 'Correo', key: 'correo', sortable: true },
  { title: 'Rol', key: 'rol', sortable: false },
  { title: 'Estado', key: 'activo', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: 150 },
]

// Usuarios filtrados
const usuariosFiltrados = computed(() => {
  let resultado = usuarios.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (u) =>
        u.nombre.toLowerCase().includes(termino) ||
        u.correo.toLowerCase().includes(termino) ||
        u.rol.nombre.toLowerCase().includes(termino),
    )
  }

  // Filtrar por estado
  if (filtroEstado.value !== 'todos') {
    const estado = filtroEstado.value === 'activo'
    resultado = resultado.filter((u) => u.activo === estado)
  }

  // Filtrar por rol
  if (filtroRol.value) {
    resultado = resultado.filter((u) => u.rol.nombre === filtroRol.value)
  }

  return resultado
})

// Verificar permisos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

// Acciones
function verUsuario(usuario: UsuarioListItem) {
  usuarioSeleccionado.value = usuario
  mostrarDialogoVer.value = true
}

function editarUsuario(usuario: UsuarioListItem) {
  usuarioSeleccionado.value = usuario
  mostrarDialogoEditar.value = true
}

async function toggleEstado(usuario: UsuarioListItem) {
  try {
    await usuariosStore.toggleEstadoUsuario(usuario.idUsuario)
    // Actualizar usuarioSeleccionado para reflejar el nuevo estado instantáneamente
    const actualizado = usuarios.value.find((u) => u.idUsuario === usuario.idUsuario)
    if (actualizado) {
      usuarioSeleccionado.value = { ...actualizado }
    }
    mostrarMensaje(
      `Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`,
      'success',
    )
  } catch (error) {
    mostrarMensaje('Error al cambiar el estado del usuario', 'error')
  }
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstado.value = 'todos'
  filtroRol.value = ''
}

function onUsuarioCreado() {
  mostrarDialogoCrear.value = false
  usuariosStore.cargarUsuarios()
  mostrarMensaje('Usuario creado correctamente', 'success')
}

function onUsuarioActualizado() {
  mostrarDialogoEditar.value = false
  usuariosStore.cargarUsuarios()
  mostrarMensaje('Usuario actualizado correctamente', 'success')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Inicialización
onMounted(() => {
  usuariosStore.cargarUsuarios()
})
</script>

<style scoped>
.usuarios-container {
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

@media (max-width: 960px) {
  .usuarios-container {
    padding: 1rem;
  }
}
</style>
