<template>
  <div class="clientes-container">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Gestión de Clientes Empresa</h1>
          <p class="text-subtitle-1">Administra las empresas cliente del sistema</p>
        </div>
        <v-btn
          v-if="hasPermission('clientes', 'crear')"
          color="#485696"
          size="large"
          prepend-icon="mdi-plus"
          @click="mostrarDialogoCrear = true"
        >
          Nueva Empresa Cliente
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
                <v-icon color="white">mdi-domain</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalClientes }}</div>
                <div class="text-caption text-grey-darken-1">Total Clientes</div>
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
                <v-icon color="white">mdi-check-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ clientesActivos.length }}</div>
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
                <v-icon color="white">mdi-pause-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ clientesInactivos.length }}</div>
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
                <v-icon color="white">mdi-tag-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ Object.keys(clientesPorRubro).length }}
                </div>
                <div class="text-caption text-grey-darken-1">Rubros Únicos</div>
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
              label="Buscar clientes"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2">
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
              v-model="filtroEtiqueta"
              label="Etiqueta"
              :items="etiquetasUnicas"
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

          <v-col cols="12" md="1">
            <v-tooltip text="Actualizar">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-refresh"
                  variant="outlined"
                  @click="cargarClientes"
                  :loading="loading"
                />
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla de Clientes -->
    <v-card elevation="3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#485696">mdi-domain</v-icon>
        Lista de Clientes Empresa
        <v-spacer />
        <v-chip color="primary" variant="tonal"> {{ clientesFiltrados.length }} clientes </v-chip>
      </v-card-title>

      <v-data-table
        v-model:page="pagina"
        :headers="headers"
        :items="clientesFiltrados"
        :loading="loading"
        :items-per-page="itemsPorPagina"
        class="elevation-0"
        loading-text="Cargando clientes..."
        no-data-text="No hay clientes disponibles"
      >
        <!-- Razón Social con avatar -->
        <template v-slot:item.razonSocial="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="orange" class="mr-3">
              <span class="text-caption font-weight-bold">
                {{ item.razonSocial.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.razonSocial }}</div>
              <div class="text-caption text-grey-darken-1">{{ item.rubro }}</div>
            </div>
          </div>
        </template>

        <!-- Información de contacto -->
        <template v-slot:item.contacto="{ item }">
          <div>
            <div class="text-body-2">
              <v-icon size="14" class="mr-1">mdi-email</v-icon>
              {{ item.correo }}
            </div>
            <div class="text-body-2">
              <v-icon size="14" class="mr-1">mdi-phone</v-icon>
              {{ item.telefono }}
            </div>
          </div>
        </template>

        <!-- Estado -->
        <template v-slot:item.activo="{ item }">
          <v-chip :color="item.activo ? 'success' : 'error'" size="small" variant="tonal">
            <v-icon start :icon="item.activo ? 'mdi-check-circle' : 'mdi-close-circle'" />
            {{ item.activo ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Etiquetas -->
        <template v-slot:item.etiquetas="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="etiquetaCliente in item.etiquetas.slice(0, 2)"
              :key="etiquetaCliente.idEtiqueta"
              color="orange"
              variant="outlined"
              size="x-small"
            >
              {{ etiquetaCliente.etiqueta.nombre }}
            </v-chip>
            <v-chip v-if="item.etiquetas.length > 2" color="grey" variant="text" size="x-small">
              +{{ item.etiquetas.length - 2 }}
            </v-chip>
          </div>
        </template>

        <!-- Contactos -->
        <template v-slot:item.contactos="{ item }">
          <div class="text-center">
            <v-chip
              :color="item.contactos.length > 0 ? 'info' : 'warning'"
              variant="tonal"
              size="small"
            >
              <v-icon start>mdi-account-group</v-icon>
              {{ item.contactos.length }}
            </v-chip>
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
                  @click="verCliente(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Editar">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('clientes', 'editar')"
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editarCliente(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip :text="item.activo ? 'Desactivar' : 'Activar'">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('clientes', 'editar')"
                  v-bind="props"
                  :icon="item.activo ? 'mdi-domain-remove' : 'mdi-domain-plus'"
                  size="small"
                  variant="text"
                  :color="item.activo ? 'error' : 'success'"
                  @click="item.activo ? confirmarEliminacion(item) : toggleEstado(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialogs -->
    <ClienteEmpresaCreateDialog v-model="mostrarDialogoCrear" @cliente-creado="onClienteCreado" />

    <ClienteEmpresaEditDialog
      v-model="mostrarDialogoEditar"
      :cliente="clienteSeleccionado"
      @cliente-actualizado="onClienteActualizado"
    />

    <ClienteEmpresaViewDialog
      v-model="mostrarDialogoVer"
      :cliente="clienteSeleccionado"
      @editar-cliente="editarCliente"
      @toggle-estado="toggleEstado"
    />

    <!-- Dialog de confirmación de eliminación -->
    <v-dialog v-model="mostrarConfirmacionEliminacion" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          <p>
            ¿Está seguro que desea eliminar el cliente
            <strong>{{ clienteAEliminar?.razonSocial }}</strong
            >?
          </p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Esta acción desactivará el cliente. Los datos no se perderán pero el cliente ya no
            estará disponible.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="mostrarConfirmacionEliminacion = false"
            :disabled="loading"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarCliente" :loading="loading">
            Confirmar Eliminación
          </v-btn>
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
import { useClienteEmpresaStore } from '../store/cliente-empresa.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { ClienteEmpresaListItem } from '../interfaces/cliente-empresa.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'
import ClienteEmpresaCreateDialog from '../components/ClienteEmpresaCreateDialog.vue'
import ClienteEmpresaEditDialog from '../components/ClienteEmpresaEditDialog.vue'
import ClienteEmpresaViewDialog from '../components/ClienteEmpresaViewDialog.vue'
import { watch } from 'vue'

const clienteEmpresaStore = useClienteEmpresaStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroEstado = ref('todos')
const filtroRubro = ref('')
const filtroEtiqueta = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)

// Dialogs
const mostrarDialogoCrear = ref(false)
const mostrarDialogoEditar = ref(false)
const mostrarDialogoVer = ref(false)
const mostrarConfirmacionEliminacion = ref(false)
const clienteSeleccionado = ref<ClienteEmpresaListItem | null>(null)
const clienteAEliminar = ref<ClienteEmpresaListItem | null>(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const loading = computed(() => clienteEmpresaStore.loading)
const clientes = computed(() => clienteEmpresaStore.clientes)
const totalClientes = computed(() => clienteEmpresaStore.totalClientes)
const clientesActivos = computed(() => clienteEmpresaStore.clientesActivos)
const clientesInactivos = computed(() => clienteEmpresaStore.clientesInactivos)
const clientesPorRubro = computed(() => clienteEmpresaStore.clientesPorRubro)

// Opciones para filtros
const opcionesEstado = [
  { title: 'Todos', value: 'todos' },
  { title: 'Activos', value: 'activo' },
  { title: 'Inactivos', value: 'inactivo' },
]

const opcionesRubros = computed(() =>
  [...new Set(clientes.value.map((c) => c.rubro))].map((rubro) => ({
    title: rubro,
    value: rubro,
  })),
)

const etiquetasUnicas = computed(() => {
  const etiquetasMap = new Map<string, string>()
  clientes.value.forEach((cliente) => {
    cliente.etiquetas.forEach((etiquetaCliente) => {
      etiquetasMap.set(etiquetaCliente.idEtiqueta, etiquetaCliente.etiqueta.nombre)
    })
  })
  return Array.from(etiquetasMap, ([id, nombre]) => ({ title: nombre, value: id }))
})

// Headers de la tabla
const headers = [
  { title: 'Empresa', key: 'razonSocial', sortable: true },
  { title: 'Contacto', key: 'contacto', sortable: false },
  { title: 'Estado', key: 'activo', sortable: true },
  { title: 'Etiquetas', key: 'etiquetas', sortable: false },
  { title: 'Contactos', key: 'contactos', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, width: 180 },
]

// Clientes filtrados
const clientesFiltrados = computed(() => {
  let resultado = clientes.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (c) =>
        c.razonSocial.toLowerCase().includes(termino) ||
        c.correo.toLowerCase().includes(termino) ||
        c.rubro.toLowerCase().includes(termino) ||
        c.telefono.includes(termino) ||
        c.direccion.toLowerCase().includes(termino),
    )
  }

  // Filtrar por estado
  if (filtroEstado.value !== 'todos') {
    const estado = filtroEstado.value === 'activo'
    resultado = resultado.filter((c) => c.activo === estado)
  }

  // Filtrar por rubro
  if (filtroRubro.value) {
    resultado = resultado.filter((c) => c.rubro === filtroRubro.value)
  }

  // Ordenar: activos primero, luego inactivos
  resultado = resultado.slice().sort((a, b) => {
    if (a.activo === b.activo) return 0
    return a.activo ? -1 : 1
  })

  return resultado
})

watch(filtroEtiqueta, (nuevoValor) => {
  if (nuevoValor) {
    clienteEmpresaStore.cargarClientes({ etiquetaId: nuevoValor })
  } else {
    clienteEmpresaStore.cargarClientes()
  }
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

async function cargarClientes() {
  await clienteEmpresaStore.cargarClientes()
}

function verCliente(cliente: ClienteEmpresaListItem) {
  clienteSeleccionado.value = cliente
  mostrarDialogoVer.value = true
}

function editarCliente(cliente: ClienteEmpresaListItem) {
  clienteSeleccionado.value = cliente
  mostrarDialogoEditar.value = true
}

async function toggleEstado(cliente: ClienteEmpresaListItem) {
  try {
    // Cambiar el estado activo usando PATCH
    const nuevoEstado = !cliente.activo
    await clienteEmpresaStore.actualizarCliente(cliente.idCliente, { activo: nuevoEstado })
    // Actualizar clienteSeleccionado si coincide
    if (clienteSeleccionado.value?.idCliente === cliente.idCliente) {
      const actualizado = clientes.value.find((c) => c.idCliente === cliente.idCliente)
      if (actualizado) {
        clienteSeleccionado.value = { ...actualizado }
      }
    }
    mostrarMensaje(
      `Cliente ${cliente.activo ? 'desactivado' : 'activado'} correctamente`,
      'success',
    )
  } catch (error) {
    mostrarMensaje('Error al cambiar el estado del cliente', 'error')
  }
}

function confirmarEliminacion(cliente: ClienteEmpresaListItem) {
  clienteAEliminar.value = cliente
  mostrarConfirmacionEliminacion.value = true
}

async function eliminarCliente() {
  if (!clienteAEliminar.value) return

  try {
    await clienteEmpresaStore.eliminarCliente(clienteAEliminar.value.idCliente)
    mostrarConfirmacionEliminacion.value = false
    clienteAEliminar.value = null
    mostrarMensaje('Cliente eliminado correctamente', 'success')
  } catch (error) {
    mostrarMensaje('Error al eliminar el cliente', 'error')
  }
}

function enviarCorreo(cliente: ClienteEmpresaListItem) {
  window.open(`mailto:${cliente.correo}`)
}

function llamar(cliente: ClienteEmpresaListItem) {
  window.open(`tel:${cliente.telefono}`)
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstado.value = 'todos'
  filtroRubro.value = ''
  filtroEtiqueta.value = ''
}

function onClienteCreado() {
  mostrarDialogoCrear.value = false
  cargarClientes()
  mostrarMensaje('Cliente creado correctamente', 'success')
}

function onClienteActualizado() {
  mostrarDialogoEditar.value = false
  cargarClientes()
  mostrarMensaje('Cliente actualizado correctamente', 'success')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Inicialización
onMounted(() => {
  cargarClientes()
})
</script>

<style scoped>
.clientes-container {
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

.gap-1 {
  gap: 0.25rem;
}

@media (max-width: 960px) {
  .clientes-container {
    padding: 1rem;
  }
}
</style>
