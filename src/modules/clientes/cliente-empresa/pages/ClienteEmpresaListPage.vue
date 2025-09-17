<template>
  <div class="clientes-empresa-container">
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
        <div class="d-flex align-center gap-2">
          <v-chip color="primary" variant="tonal"> {{ clientesFiltrados.length }} clientes </v-chip>
          <v-btn
            v-if="hasPermission('clientes', 'crear')"
            color="#485696"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            @click="$emit('crear-cliente')"
          >
            Nuevo Cliente
          </v-btn>
        </div>
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
                  @click="$emit('ver-cliente', item)"
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
                  @click="$emit('editar-cliente', item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip :text="item.activo ? 'Desactivar' : 'Activar'">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('clientes', 'eliminar')"
                  v-bind="props"
                  :icon="item.activo ? 'mdi-domain-remove' : 'mdi-domain-plus'"
                  size="small"
                  variant="text"
                  :color="item.activo ? 'error' : 'success'"
                  @click="
                    item.activo
                      ? $emit('confirmar-eliminacion', item)
                      : $emit('toggle-estado', item)
                  "
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useClienteEmpresaStore } from '../store/cliente-empresa.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { ClienteEmpresaListItem } from '../interfaces/cliente-empresa.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Definir eventos que emite el componente
const emit = defineEmits<{
  'crear-cliente': []
  'editar-cliente': [cliente: ClienteEmpresaListItem]
  'ver-cliente': [cliente: ClienteEmpresaListItem]
  'toggle-estado': [cliente: ClienteEmpresaListItem]
  'confirmar-eliminacion': [cliente: ClienteEmpresaListItem]
}>()

const clienteEmpresaStore = useClienteEmpresaStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroEstado = ref('todos')
const filtroRubro = ref('')
const filtroEtiqueta = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)

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

  // Ordenar: activos primero, luego inactivos
  resultado = resultado.slice().sort((a, b) => {
    if (a.activo === b.activo) return 0
    return a.activo ? -1 : 1
  })

  return resultado
})

// Watchers
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

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstado.value = 'todos'
  filtroRubro.value = ''
  filtroEtiqueta.value = ''
}

// Inicialización
onMounted(() => {
  cargarClientes()
})
</script>

<style scoped>
.clientes-empresa-container {
  padding: 5px;
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

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 960px) {
  .clientes-empresa-container {
    padding: 0;
  }
}
</style>
