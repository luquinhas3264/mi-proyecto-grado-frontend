<!-- src/modules/clientes/pages/ClientesMainPage.vue -->
<template>
  <div class="clientes-main">
    <!-- Header con navegación de tabs -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Gestión de Clientes</h1>
          <p class="text-subtitle-1">Sistema integral de administración de clientes</p>
        </div>

        <!-- Actions según el tab activo -->
        <div>
          <v-btn
            v-if="tabActivo === 'empresas' && hasPermission('clientes', 'crear')"
            color="#485696"
            size="large"
            prepend-icon="mdi-plus"
            @click="accionesRapidas.nuevaEmpresa"
          >
            Nueva Empresa
          </v-btn>

          <v-btn
            v-else-if="tabActivo === 'contactos' && hasPermission('contactos', 'crear')"
            color="#485696"
            size="large"
            prepend-icon="mdi-account-plus"
            @click="accionesRapidas.nuevoContacto"
          >
            Nuevo Contacto
          </v-btn>

          <v-btn
            v-else-if="tabActivo === 'etiquetas' && hasPermission('etiquetas', 'crear')"
            color="#485696"
            size="large"
            prepend-icon="mdi-tag-plus"
            @click="accionesRapidas.nuevaEtiqueta"
          >
            Nueva Etiqueta
          </v-btn>

          <v-btn
            v-else-if="tabActivo === 'interacciones' && hasPermission('interacciones', 'crear')"
            color="#485696"
            size="large"
            prepend-icon="mdi-plus-circle"
            @click="accionesRapidas.nuevaInteraccion"
          >
            Registrar Interacción
          </v-btn>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <v-card class="tabs-container" elevation="2">
        <v-tabs v-model="tabActivo" color="#485696" grow height="60">
          <v-tab value="empresas" :disabled="!hasPermission('clientes', 'ver')">
            <v-icon start>mdi-domain</v-icon>
            Empresas Cliente
            <v-chip
              v-if="estadisticas.empresas > 0"
              size="small"
              variant="tonal"
              color="primary"
              class="ml-2"
            >
              {{ estadisticas.empresas }}
            </v-chip>
          </v-tab>

          <v-tab value="contactos" :disabled="!hasPermission('contactos', 'ver')">
            <v-icon start>mdi-account-group</v-icon>
            Contactos
            <v-chip
              v-if="estadisticas.contactos > 0"
              size="small"
              variant="tonal"
              color="success"
              class="ml-2"
            >
              {{ estadisticas.contactos }}
            </v-chip>
          </v-tab>

          <v-tab value="etiquetas" :disabled="!hasPermission('etiquetas', 'ver')">
            <v-icon start>mdi-tag-multiple</v-icon>
            Etiquetas
            <v-chip
              v-if="estadisticas.etiquetas > 0"
              size="small"
              variant="tonal"
              color="warning"
              class="ml-2"
            >
              {{ estadisticas.etiquetas }}
            </v-chip>
          </v-tab>

          <v-tab value="interacciones" :disabled="!hasPermission('interacciones', 'ver')">
            <v-icon start>mdi-calendar-clock</v-icon>
            Interacciones
            <v-chip
              v-if="estadisticas.interacciones > 0"
              size="small"
              variant="tonal"
              color="info"
              class="ml-2"
            >
              {{ estadisticas.interacciones }}
            </v-chip>
          </v-tab>
        </v-tabs>
      </v-card>
    </div>

    <!-- Contenido dinámico según tab -->
    <div class="content-container">
      <v-window v-model="tabActivo">
        <!-- Tab de Empresas Cliente -->
        <v-window-item value="empresas">
          <ClienteEmpresaListPage
            @crear-cliente="mostrarDialogoCrearEmpresa = true"
            @editar-cliente="editarEmpresa"
            @ver-cliente="verEmpresa"
            @toggle-estado="toggleEstadoEmpresa"
            @confirmar-eliminacion="confirmarEliminacionEmpresa"
          />
        </v-window-item>

        <!-- Tab de Contactos -->
        <v-window-item value="contactos">
          <ContactoClienteListPage
            @crear-contacto="mostrarDialogoCrearContacto = true"
            @editar-contacto="editarContacto"
            @ver-contacto="verContacto"
            @toggle-estado="toggleEstadoContacto"
            @confirmar-eliminacion="confirmarEliminacionContacto"
            @ver-cliente="verClienteDesdeContacto"
          />
        </v-window-item>

        <!-- Tab de Etiquetas -->
        <v-window-item value="etiquetas">
          <EtiquetaClienteListPage />
        </v-window-item>

        <!-- Tab de Interacciones -->
        <v-window-item value="interacciones">
          <InteraccionClienteListPage />
        </v-window-item>
      </v-window>
    </div>

    <!-- Dialogs de Cliente Empresa -->
    <ClienteEmpresaCreateDialog
      v-model="mostrarDialogoCrearEmpresa"
      @cliente-creado="onEmpresaCreada"
    />

    <ClienteEmpresaEditDialog
      v-model="mostrarDialogoEditarEmpresa"
      :cliente="empresaSeleccionada"
      @cliente-actualizado="onEmpresaActualizada"
    />

    <ClienteEmpresaViewDialog
      v-model="mostrarDialogoVerEmpresa"
      :cliente="empresaSeleccionada"
      @editar-cliente="editarEmpresa"
      @toggle-estado="toggleEstadoEmpresa"
    />

    <!-- Dialogs de Contacto Cliente -->
    <ContactoClienteCreateDialog
      v-model="mostrarDialogoCrearContacto"
      :cliente-preseleccionado="clientePreseleccionado"
      @contacto-creado="onContactoCreado"
    />

    <ContactoClienteEditDialog
      v-model="mostrarDialogoEditarContacto"
      :contacto="contactoSeleccionado"
      @contacto-actualizado="onContactoActualizado"
    />

    <ContactoClienteViewDialog
      v-model="mostrarDialogoVerContacto"
      :contacto="contactoSeleccionado"
      @editar-contacto="editarContacto"
      @toggle-estado="toggleEstadoContacto"
      @ver-cliente="verClienteDesdeContacto"
    />

    <!-- Dialog de confirmación de eliminación para empresas -->
    <v-dialog v-model="mostrarConfirmacionEliminacionEmpresa" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmar Eliminación de Cliente
        </v-card-title>
        <v-card-text>
          <p>
            ¿Está seguro que desea eliminar el cliente
            <strong>{{ empresaAEliminar?.razonSocial }}</strong
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
            @click="mostrarConfirmacionEliminacionEmpresa = false"
            :disabled="loading"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarEmpresa" :loading="loading">
            Confirmar Eliminación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación de eliminación para contactos -->
    <v-dialog v-model="mostrarConfirmacionEliminacionContacto" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmar Eliminación de Contacto
        </v-card-title>
        <v-card-text>
          <p>
            ¿Está seguro que desea eliminar el contacto
            <strong>{{ contactoAEliminar?.nombre }}</strong
            >?
          </p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            Esta acción desactivará el contacto. Los datos no se perderán pero el contacto ya no
            estará disponible.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="mostrarConfirmacionEliminacionContacto = false"
            :disabled="loading"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarContacto" :loading="loading">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useClienteEmpresaStore } from '../cliente-empresa/store/cliente-empresa.store'
import { useContactoClienteStore } from '../contacto-cliente/store/contacto-cliente.store'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'
import type { ClienteEmpresaListItem } from '../cliente-empresa/interfaces/cliente-empresa.interface'
import type { ContactoClienteListItem } from '../contacto-cliente/interfaces/contacto-cliente.interface'

// Importar componentes de cada submódulo
import ClienteEmpresaListPage from '../cliente-empresa/pages/ClienteEmpresaListPage.vue'
import ClienteEmpresaCreateDialog from '../cliente-empresa/components/ClienteEmpresaCreateDialog.vue'
import ClienteEmpresaEditDialog from '../cliente-empresa/components/ClienteEmpresaEditDialog.vue'
import ClienteEmpresaViewDialog from '../cliente-empresa/components/ClienteEmpresaViewDialog.vue'

import ContactoClienteListPage from '../contacto-cliente/pages/ContactoClienteListPage.vue'
import ContactoClienteCreateDialog from '../contacto-cliente/components/ContactoClienteCreateDialog.vue'
import ContactoClienteEditDialog from '../contacto-cliente/components/ContactoClienteEditDialog.vue'
import ContactoClienteViewDialog from '../contacto-cliente/components/ContactoClienteViewDialog.vue'

// Componentes temporales mientras no existan
const EtiquetaClienteListPage = {
  template: '<div class="pa-4"><h3>Módulo de Etiquetas (En desarrollo)</h3></div>',
}
const InteraccionClienteListPage = {
  template: '<div class="pa-4"><h3>Módulo de Interacciones (En desarrollo)</h3></div>',
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const contactoClienteStore = useContactoClienteStore()

// Estado local
const tabActivo = ref('empresas')
const loading = ref(false)

// Estados de dialogs de Cliente Empresa
const mostrarDialogoCrearEmpresa = ref(false)
const mostrarDialogoEditarEmpresa = ref(false)
const mostrarDialogoVerEmpresa = ref(false)
const mostrarConfirmacionEliminacionEmpresa = ref(false)
const empresaSeleccionada = ref<ClienteEmpresaListItem | null>(null)
const empresaAEliminar = ref<ClienteEmpresaListItem | null>(null)

// Estados de dialogs de Contacto Cliente
const mostrarDialogoCrearContacto = ref(false)
const mostrarDialogoEditarContacto = ref(false)
const mostrarDialogoVerContacto = ref(false)
const mostrarConfirmacionEliminacionContacto = ref(false)
const contactoSeleccionado = ref<ContactoClienteListItem | null>(null)
const contactoAEliminar = ref<ContactoClienteListItem | null>(null)
const clientePreseleccionado = ref<string>('')

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Estadísticas computadas
const estadisticas = computed(() => ({
  empresas: clienteEmpresaStore.totalClientes,
  contactos: contactoClienteStore.totalContactos,
  etiquetas: 0, // Pendiente de implementar
  interacciones: 0, // Pendiente de implementar
}))

// Computed
const hasPermission = (modulo: string, accion: string): boolean => {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

// Acciones rápidas por módulo
const accionesRapidas = {
  nuevaEmpresa: () => {
    mostrarDialogoCrearEmpresa.value = true
  },
  nuevoContacto: () => {
    mostrarDialogoCrearContacto.value = true
  },
  nuevaEtiqueta: () => {
    console.log('Abrir dialog nueva etiqueta')
  },
  nuevaInteraccion: () => {
    console.log('Abrir dialog nueva interacción')
  },
}

// Métodos para manejo de Cliente Empresa
function editarEmpresa(empresa: ClienteEmpresaListItem) {
  empresaSeleccionada.value = empresa
  mostrarDialogoEditarEmpresa.value = true
}

function verEmpresa(empresa: ClienteEmpresaListItem) {
  empresaSeleccionada.value = empresa
  mostrarDialogoVerEmpresa.value = true
}

async function toggleEstadoEmpresa(empresa: ClienteEmpresaListItem) {
  try {
    loading.value = true
    await clienteEmpresaStore.toggleEstadoCliente(empresa.idCliente)

    // Actualizar empresaSeleccionada si coincide
    if (empresaSeleccionada.value?.idCliente === empresa.idCliente) {
      const actualizada = clienteEmpresaStore.clientes.find(
        (c) => c.idCliente === empresa.idCliente,
      )
      if (actualizada) {
        empresaSeleccionada.value = { ...actualizada }
      }
    }

    mostrarMensaje(
      `Cliente ${empresa.activo ? 'desactivado' : 'activado'} correctamente`,
      'success',
    )
  } catch (error) {
    mostrarMensaje('Error al cambiar el estado del cliente', 'error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminacionEmpresa(empresa: ClienteEmpresaListItem) {
  empresaAEliminar.value = empresa
  mostrarConfirmacionEliminacionEmpresa.value = true
}

async function eliminarEmpresa() {
  if (!empresaAEliminar.value) return

  try {
    loading.value = true
    await clienteEmpresaStore.eliminarCliente(empresaAEliminar.value.idCliente)
    mostrarConfirmacionEliminacionEmpresa.value = false
    empresaAEliminar.value = null
    mostrarMensaje('Cliente eliminado correctamente', 'success')
  } catch (error) {
    mostrarMensaje('Error al eliminar el cliente', 'error')
  } finally {
    loading.value = false
  }
}

// Métodos para manejo de Contacto Cliente
function editarContacto(contacto: ContactoClienteListItem) {
  contactoSeleccionado.value = contacto
  mostrarDialogoEditarContacto.value = true
}

function verContacto(contacto: ContactoClienteListItem) {
  contactoSeleccionado.value = contacto
  mostrarDialogoVerContacto.value = true
}

async function toggleEstadoContacto(contacto: ContactoClienteListItem) {
  try {
    loading.value = true
    await contactoClienteStore.toggleEstadoContacto(contacto.idContacto)

    // Actualizar contactoSeleccionado si coincide
    if (contactoSeleccionado.value?.idContacto === contacto.idContacto) {
      const actualizado = contactoClienteStore.contactos.find(
        (c) => c.idContacto === contacto.idContacto,
      )
      if (actualizado) {
        contactoSeleccionado.value = { ...actualizado }
      }
    }

    mostrarMensaje(
      `Contacto ${contacto.activo ? 'desactivado' : 'activado'} correctamente`,
      'success',
    )
  } catch (error) {
    mostrarMensaje('Error al cambiar el estado del contacto', 'error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminacionContacto(contacto: ContactoClienteListItem) {
  contactoAEliminar.value = contacto
  mostrarConfirmacionEliminacionContacto.value = true
}

async function eliminarContacto() {
  if (!contactoAEliminar.value) return

  try {
    loading.value = true
    await contactoClienteStore.eliminarContacto(contactoAEliminar.value.idContacto)
    mostrarConfirmacionEliminacionContacto.value = false
    contactoAEliminar.value = null
    mostrarMensaje('Contacto eliminado correctamente', 'success')
  } catch (error) {
    mostrarMensaje('Error al eliminar el contacto', 'error')
  } finally {
    loading.value = false
  }
}

function verClienteDesdeContacto(idCliente: string) {
  // Cambiar al tab de empresas y buscar el cliente
  tabActivo.value = 'empresas'
  const cliente = clienteEmpresaStore.clientes.find((c) => c.idCliente === idCliente)
  if (cliente) {
    verEmpresa(cliente)
  }
}

// Event handlers
function onEmpresaCreada() {
  mostrarDialogoCrearEmpresa.value = false
  mostrarMensaje('Cliente creado correctamente', 'success')
}

function onEmpresaActualizada() {
  mostrarDialogoEditarEmpresa.value = false
  mostrarMensaje('Cliente actualizado correctamente', 'success')
}

function onContactoCreado() {
  mostrarDialogoCrearContacto.value = false
  clientePreseleccionado.value = ''
  mostrarMensaje('Contacto creado correctamente', 'success')
}

function onContactoActualizado() {
  mostrarDialogoEditarContacto.value = false
  mostrarMensaje('Contacto actualizado correctamente', 'success')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Cargar estadísticas
async function cargarEstadisticas() {
  try {
    if (tabActivo.value === 'empresas') {
      await clienteEmpresaStore.cargarClientes()
    } else if (tabActivo.value === 'contactos') {
      // Los contactos se cargan por cliente, no hay endpoint general aún
      // await contactoClienteStore.cargarTodosContactos()
    }
    // Aquí cargarías estadísticas de otros módulos según el tab activo
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
  }
}

// Manejar cambios de tab y URL
watch(tabActivo, (nuevoTab) => {
  // Actualizar URL sin recargar
  const nuevaRuta = nuevoTab === 'empresas' ? '/clientes' : `/clientes/${nuevoTab}`
  router.replace(nuevaRuta)

  // Cargar datos del nuevo tab
  cargarEstadisticas()
})

// Determinar tab activo según la ruta
function determinarTabPorRuta() {
  const path = route.path
  if (path.includes('/contactos')) {
    tabActivo.value = 'contactos'
  } else if (path.includes('/etiquetas')) {
    tabActivo.value = 'etiquetas'
  } else if (path.includes('/interacciones')) {
    tabActivo.value = 'interacciones'
  } else {
    tabActivo.value = 'empresas'
  }
}

// Lifecycle
onMounted(() => {
  determinarTabPorRuta()
  cargarEstadisticas()
})
</script>

<style scoped>
.clientes-main {
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

.tabs-container {
  border-radius: 12px;
  overflow: hidden;
}

.content-container {
  border-radius: 16px;
  min-height: 600px;
  background: transparent;
  box-shadow: none;
}

.v-tab {
  text-transform: none !important;
  font-weight: 500;
}

@media (max-width: 960px) {
  .clientes-main {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .v-tab {
    flex-direction: column;
    height: auto !important;
    padding: 12px 8px;
  }

  .v-tab .v-icon {
    margin-bottom: 4px;
  }
}
</style>
