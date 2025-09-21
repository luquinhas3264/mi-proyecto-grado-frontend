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
          <EtiquetaClienteListPage
            @crear-etiqueta="mostrarDialogoCrearEtiqueta = true"
            @editar-etiqueta="editarEtiqueta"
            @ver-etiqueta="verEtiqueta"
            @asignar-etiqueta="asignarEtiqueta"
            @confirmar-eliminacion="confirmarEliminacionEtiqueta"
            @asignar-masivo="abrirAsignacionMasiva"
            @remover-etiqueta="abrirRemoverEtiqueta"
          />
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

    <EtiquetaClienteCreateDialog
      v-model="mostrarDialogoCrearEtiqueta"
      @etiqueta-creada="onEtiquetaCreada"
    />

    <EtiquetaClienteEditDialog
      v-model="mostrarDialogoEditarEtiqueta"
      :etiqueta="etiquetaSeleccionada"
      @etiqueta-actualizada="onEtiquetaActualizada"
    />

    <EtiquetaClienteViewDialog
      v-model="mostrarDialogoVerEtiqueta"
      :etiqueta="etiquetaSeleccionada"
      @editar-etiqueta="editarEtiqueta"
      @confirmar-eliminacion="confirmarEliminacionEtiqueta"
      @asignar-etiqueta="asignarEtiqueta"
      @ver-cliente="verClienteDesdeEtiqueta"
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

    <!-- Dialog de confirmación de eliminación para etiquetas -->
    <v-dialog v-model="mostrarConfirmacionEliminacionEtiqueta" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmar Eliminación de Etiqueta
        </v-card-title>
        <v-card-text>
          <p>
            ¿Está seguro que desea eliminar la etiqueta
            <strong>{{ etiquetaAEliminar?.nombre }}</strong
            >?
          </p>
          <v-alert type="error" variant="tonal" class="mt-3">
            <template v-slot:title>⚠️ Advertencia</template>
            Esta acción eliminará permanentemente la etiqueta y todas sus asignaciones. Esta acción
            no se puede deshacer.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="mostrarConfirmacionEliminacionEtiqueta = false"
            :disabled="loading"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarEtiqueta" :loading="loading">
            Confirmar Eliminación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para asignación masiva de etiquetas (opcional) -->
    <v-dialog v-model="mostrarDialogoAsignacionMasiva" max-width="800">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="primary">mdi-account-multiple-plus</v-icon>
          Asignación Masiva de Etiquetas
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            Selecciona los clientes y etiquetas para realizar asignaciones masivas.
          </p>

          <!-- Contenido del dialog de asignación masiva -->
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1">Clientes Disponibles</v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item
                      v-for="cliente in clienteEmpresaStore.clientesActivos"
                      :key="cliente.idCliente"
                      @click="toggleClienteSeleccionado(cliente.idCliente)"
                    >
                      <template v-slot:prepend>
                        <v-checkbox
                          :model-value="clientesSeleccionados.includes(cliente.idCliente)"
                          @click.stop="toggleClienteSeleccionado(cliente.idCliente)"
                        />
                      </template>
                      <v-list-item-title>{{ cliente.razonSocial }}</v-list-item-title>
                      <v-list-item-subtitle>{{ cliente.rubro }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1">Etiquetas Disponibles</v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item
                      v-for="etiqueta in etiquetaClienteStore.etiquetas"
                      :key="etiqueta.idEtiqueta"
                      @click="toggleEtiquetaSeleccionada(etiqueta.idEtiqueta)"
                    >
                      <template v-slot:prepend>
                        <v-checkbox
                          :model-value="etiquetasSeleccionadas.includes(etiqueta.idEtiqueta)"
                          @click.stop="toggleEtiquetaSeleccionada(etiqueta.idEtiqueta)"
                        />
                      </template>
                      <v-list-item-title>
                        <v-chip
                          :color="generarColorEtiqueta(etiqueta.nombre)"
                          size="small"
                          variant="tonal"
                        >
                          {{ etiqueta.nombre }}
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-alert
            v-if="clientesSeleccionados.length > 0 && etiquetasSeleccionadas.length > 0"
            type="info"
            variant="tonal"
            class="mt-4"
          >
            Se realizarán
            {{ clientesSeleccionados.length * etiquetasSeleccionadas.length }} asignaciones.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="cerrarAsignacionMasiva" :disabled="loading">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="ejecutarAsignacionMasiva"
            :loading="loading"
            :disabled="clientesSeleccionados.length === 0 || etiquetasSeleccionadas.length === 0"
          >
            Asignar Etiquetas
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para remoción de etiquetas de clientes -->
    <v-dialog v-model="mostrarDialogoRemoverEtiqueta" max-width="600">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-tag-remove</v-icon>
          Remover etiqueta de clientes
        </v-card-title>
        <v-card-text>
          <div v-if="!etiquetaSeleccionada">
            <v-alert type="info">Selecciona una etiqueta para remover asignaciones.</v-alert>
          </div>
          <div v-else>
            <div class="mb-2 text-caption">
              Clientes asignados a <strong>{{ etiquetaSeleccionada.nombre }}</strong
              >:
            </div>
            <v-checkbox
              v-for="cliente in clientesAsignadosEtiqueta"
              :key="cliente.idCliente"
              v-model="clientesRemoverSeleccionados"
              :label="cliente.razonSocial"
              :value="cliente.idCliente"
              hide-details
            />
            <div v-if="clientesAsignadosEtiqueta.length === 0" class="text-caption mt-2">
              No hay clientes asignados a esta etiqueta.
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="cerrarRemoverEtiqueta" :disabled="loading">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="ejecutarRemoverEtiqueta"
            :loading="loading"
            :disabled="clientesRemoverSeleccionados.length === 0"
          >
            Remover Etiqueta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para asignar etiqueta a clientes seleccionados -->
    <v-dialog v-model="mostrarDialogoAsignarEtiqueta" max-width="600">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="primary">mdi-tag-plus</v-icon>
          Asignar etiqueta a clientes
        </v-card-title>
        <v-card-text>
          <div v-if="!etiquetaSeleccionada">
            <v-alert type="info">Selecciona una etiqueta para asignar a clientes.</v-alert>
          </div>
          <div v-else>
            <div class="mb-2 text-caption">
              Clientes disponibles para <strong>{{ etiquetaSeleccionada.nombre }}</strong
              >:
            </div>
            <v-checkbox
              v-for="cliente in clientesDisponiblesAsignacion"
              :key="cliente.idCliente"
              v-model="clientesAsignarSeleccionados"
              :label="cliente.razonSocial"
              :value="cliente.idCliente"
              hide-details
            />
            <div v-if="clientesDisponiblesAsignacion.length === 0" class="text-caption mt-2">
              Todos los clientes ya tienen esta etiqueta asignada.
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="cerrarAsignarEtiqueta" :disabled="loading">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="ejecutarAsignarEtiqueta"
            :loading="loading"
            :disabled="clientesAsignarSeleccionados.length === 0"
          >
            Asignar Etiqueta
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
// Script setup actualizado para ClientesMainPage.vue

import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useClienteEmpresaStore } from '../cliente-empresa/store/cliente-empresa.store'
import { useContactoClienteStore } from '../contacto-cliente/store/contacto-cliente.store'
import { useEtiquetaClienteStore } from '../etiqueta-cliente/store/etiqueta-cliente.store'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'
import type { ClienteEmpresaListItem } from '../cliente-empresa/interfaces/cliente-empresa.interface'
import type { ContactoClienteListItem } from '../contacto-cliente/interfaces/contacto-cliente.interface'
import type { EtiquetaClienteListItem } from '../etiqueta-cliente/interfaces/etiqueta-cliente.interface'

// Importar componentes de cada submódulo
import ClienteEmpresaListPage from '../cliente-empresa/pages/ClienteEmpresaListPage.vue'
import ClienteEmpresaCreateDialog from '../cliente-empresa/components/ClienteEmpresaCreateDialog.vue'
import ClienteEmpresaEditDialog from '../cliente-empresa/components/ClienteEmpresaEditDialog.vue'
import ClienteEmpresaViewDialog from '../cliente-empresa/components/ClienteEmpresaViewDialog.vue'

import ContactoClienteListPage from '../contacto-cliente/pages/ContactoClienteListPage.vue'
import ContactoClienteCreateDialog from '../contacto-cliente/components/ContactoClienteCreateDialog.vue'
import ContactoClienteEditDialog from '../contacto-cliente/components/ContactoClienteEditDialog.vue'
import ContactoClienteViewDialog from '../contacto-cliente/components/ContactoClienteViewDialog.vue'

import EtiquetaClienteListPage from '../etiqueta-cliente/pages/EtiquetaClienteListPage.vue'
import EtiquetaClienteCreateDialog from '../etiqueta-cliente/components/EtiquetaClienteCreateDialog.vue'
import EtiquetaClienteEditDialog from '../etiqueta-cliente/components/EtiquetaClienteEditDialog.vue'
import EtiquetaClienteViewDialog from '../etiqueta-cliente/components/EtiquetaClienteViewDialog.vue'

// Componente temporal mientras no existe
const InteraccionClienteListPage = {
  template: '<div class="pa-4"><h3>Módulo de Interacciones (En desarrollo)</h3></div>',
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const contactoClienteStore = useContactoClienteStore()
const etiquetaClienteStore = useEtiquetaClienteStore()

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

// Estados de dialogs de Etiqueta Cliente
const mostrarDialogoCrearEtiqueta = ref(false)
const mostrarDialogoEditarEtiqueta = ref(false)
const mostrarDialogoVerEtiqueta = ref(false)
const mostrarConfirmacionEliminacionEtiqueta = ref(false)
const etiquetaSeleccionada = ref<EtiquetaClienteListItem | null>(null)
const etiquetaAEliminar = ref<EtiquetaClienteListItem | null>(null)

// Estados para asignación masiva
const mostrarDialogoAsignacionMasiva = ref(false)
const clientesSeleccionados = ref<string[]>([])
const etiquetasSeleccionadas = ref<string[]>([])

// Estados para remoción de etiquetas de clientes
const mostrarDialogoRemoverEtiqueta = ref(false)
const clientesRemoverSeleccionados = ref<string[]>([])
// Computed: clientes asignados a la etiqueta seleccionada
const clientesAsignadosEtiqueta = computed(() => {
  if (!etiquetaSeleccionada.value) return []
  // Devuelve los clientes que tienen la etiqueta seleccionada en su array de etiquetas
  return clienteEmpresaStore.clientes.filter((cliente) =>
    cliente.etiquetas?.some((e) => e.idEtiqueta === etiquetaSeleccionada.value?.idEtiqueta),
  )
})

// Asignación individual de etiqueta a clientes
const mostrarDialogoAsignarEtiqueta = ref(false)
const clientesAsignarSeleccionados = ref<string[]>([])
const clientesDisponiblesAsignacion = computed(() => {
  if (!etiquetaSeleccionada.value) return []
  // Devuelve los clientes que NO tienen la etiqueta seleccionada y están activos
  return clienteEmpresaStore.clientes.filter(
    (cliente) =>
      cliente.activo &&
      !cliente.etiquetas?.some((e) => e.idEtiqueta === etiquetaSeleccionada.value?.idEtiqueta),
  )
})

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
  etiquetas: etiquetaClienteStore.totalEtiquetas,
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
    mostrarDialogoCrearEtiqueta.value = true
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

// Métodos para manejo de Etiqueta Cliente
function editarEtiqueta(etiqueta: EtiquetaClienteListItem) {
  etiquetaSeleccionada.value = etiqueta
  mostrarDialogoEditarEtiqueta.value = true
}

function verEtiqueta(etiqueta: EtiquetaClienteListItem) {
  etiquetaSeleccionada.value = etiqueta
  mostrarDialogoVerEtiqueta.value = true
}

function confirmarEliminacionEtiqueta(etiqueta: EtiquetaClienteListItem) {
  etiquetaAEliminar.value = etiqueta
  mostrarConfirmacionEliminacionEtiqueta.value = true
}

async function eliminarEtiqueta() {
  if (!etiquetaAEliminar.value) return

  try {
    loading.value = true
    await etiquetaClienteStore.eliminarEtiqueta(etiquetaAEliminar.value.idEtiqueta)
    mostrarConfirmacionEliminacionEtiqueta.value = false
    etiquetaAEliminar.value = null
    mostrarMensaje('Etiqueta eliminada correctamente', 'success')
  } catch (error) {
    mostrarMensaje('Error al eliminar la etiqueta', 'error')
  } finally {
    loading.value = false
  }
}

// Método para abrir el diálogo de asignar etiqueta individual
function asignarEtiqueta(etiqueta: EtiquetaClienteListItem) {
  etiquetaSeleccionada.value = etiqueta
  clientesAsignarSeleccionados.value = []
  mostrarDialogoAsignarEtiqueta.value = true
}

function cerrarAsignarEtiqueta() {
  mostrarDialogoAsignarEtiqueta.value = false
  clientesAsignarSeleccionados.value = []
}

async function ejecutarAsignarEtiqueta() {
  if (!etiquetaSeleccionada.value || clientesAsignarSeleccionados.value.length === 0) return
  try {
    loading.value = true
    let exitosos = 0
    let errores = 0
    for (const idCliente of clientesAsignarSeleccionados.value) {
      try {
        await etiquetaClienteStore.asignarEtiqueta(idCliente, etiquetaSeleccionada.value.idEtiqueta)
        exitosos++
      } catch (error) {
        errores++
      }
    }

    await clienteEmpresaStore.cargarClientes()
    await etiquetaClienteStore.cargarEtiquetas()

    cerrarAsignarEtiqueta()
    if (errores === 0) {
      mostrarMensaje(`Se asignó la etiqueta a ${exitosos} clientes correctamente`, 'success')
    } else {
      mostrarMensaje(`${exitosos} asignaciones exitosas, ${errores} errores`, 'warning')
    }
  } catch (error) {
    mostrarMensaje('Error al asignar la etiqueta', 'error')
  } finally {
    loading.value = false
  }
}

// Método para abrir el diálogo de remoción de etiqueta
function abrirRemoverEtiqueta(etiqueta: EtiquetaClienteListItem) {
  etiquetaSeleccionada.value = etiqueta
  clientesRemoverSeleccionados.value = []
  mostrarDialogoRemoverEtiqueta.value = true
}

function cerrarRemoverEtiqueta() {
  mostrarDialogoRemoverEtiqueta.value = false
  clientesRemoverSeleccionados.value = []
}

async function ejecutarRemoverEtiqueta() {
  if (!etiquetaSeleccionada.value || clientesRemoverSeleccionados.value.length === 0) return
  try {
    loading.value = true
    let exitosos = 0
    let errores = 0
    for (const idCliente of clientesRemoverSeleccionados.value) {
      try {
        await etiquetaClienteStore.removerEtiqueta(idCliente, etiquetaSeleccionada.value.idEtiqueta)
        exitosos++
      } catch (error) {
        errores++
      }
    }

    await clienteEmpresaStore.cargarClientes()
    await etiquetaClienteStore.cargarEtiquetas()
    cerrarRemoverEtiqueta()

    if (errores === 0) {
      mostrarMensaje(`Se removió la etiqueta de ${exitosos} clientes correctamente`, 'success')
    } else {
      mostrarMensaje(`${exitosos} remociones exitosas, ${errores} errores`, 'warning')
    }
  } catch (error) {
    mostrarMensaje('Error al remover la etiqueta', 'error')
  } finally {
    loading.value = false
  }
}

function verClienteDesdeEtiqueta(idCliente: string) {
  // Similar a verClienteDesdeContacto
  tabActivo.value = 'empresas'
  const cliente = clienteEmpresaStore.clientes.find((c) => c.idCliente === idCliente)
  if (cliente) {
    verEmpresa(cliente)
  }
}

// Métodos para asignación masiva
function abrirAsignacionMasiva() {
  clientesSeleccionados.value = []
  etiquetasSeleccionadas.value = []
  mostrarDialogoAsignacionMasiva.value = true
}

function toggleClienteSeleccionado(idCliente: string) {
  const index = clientesSeleccionados.value.indexOf(idCliente)
  if (index > -1) {
    clientesSeleccionados.value.splice(index, 1)
  } else {
    clientesSeleccionados.value.push(idCliente)
  }
}

function toggleEtiquetaSeleccionada(idEtiqueta: string) {
  const index = etiquetasSeleccionadas.value.indexOf(idEtiqueta)
  if (index > -1) {
    etiquetasSeleccionadas.value.splice(index, 1)
  } else {
    etiquetasSeleccionadas.value.push(idEtiqueta)
  }
}

async function ejecutarAsignacionMasiva() {
  try {
    loading.value = true
    let exitosos = 0
    let errores = 0

    for (const idCliente of clientesSeleccionados.value) {
      for (const idEtiqueta of etiquetasSeleccionadas.value) {
        try {
          await etiquetaClienteStore.asignarEtiqueta(idCliente, idEtiqueta)
          exitosos++
        } catch (error) {
          errores++
        }
      }
    }

    await clienteEmpresaStore.cargarClientes()
    await etiquetaClienteStore.cargarEtiquetas()
    cerrarAsignacionMasiva()

    if (errores === 0) {
      mostrarMensaje(`Se asignaron ${exitosos} etiquetas correctamente`, 'success')
    } else {
      mostrarMensaje(`${exitosos} asignaciones exitosas, ${errores} errores`, 'warning')
    }
  } catch (error) {
    mostrarMensaje('Error en la asignación masiva', 'error')
  } finally {
    loading.value = false
  }
}

function cerrarAsignacionMasiva() {
  mostrarDialogoAsignacionMasiva.value = false
  clientesSeleccionados.value = []
  etiquetasSeleccionadas.value = []
}

function generarColorEtiqueta(nombre: string) {
  let hash = 0
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

function onEtiquetaCreada() {
  mostrarDialogoCrearEtiqueta.value = false
  mostrarMensaje('Etiqueta creada correctamente', 'success')
}

function onEtiquetaActualizada() {
  mostrarDialogoEditarEtiqueta.value = false
  mostrarMensaje('Etiqueta actualizada correctamente', 'success')
}

function mostrarMensaje(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

// Cargar estadísticas
async function cargarEstadisticas() {
  try {
    if (tabActivo.value === 'empresas') {
      await clienteEmpresaStore.cargarClientes()
      await etiquetaClienteStore.cargarEtiquetas()
    } else if (tabActivo.value === 'contactos') {
      // Los contactos se cargan por cliente, no hay endpoint general aún
      // await contactoClienteStore.cargarTodosContactos()
    } else if (tabActivo.value === 'etiquetas') {
      await etiquetaClienteStore.cargarEtiquetas()
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
