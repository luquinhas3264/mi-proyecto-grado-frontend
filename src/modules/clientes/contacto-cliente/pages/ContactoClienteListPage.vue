<template>
  <div class="contactos-cliente-container">
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
                <div class="text-h5 font-weight-bold">{{ totalContactos }}</div>
                <div class="text-caption text-grey-darken-1">Total Contactos</div>
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
                <div class="text-h5 font-weight-bold">{{ contactosActivos.length }}</div>
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
                <div class="text-h5 font-weight-bold">{{ contactosInactivos.length }}</div>
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
                <v-icon color="white">mdi-briefcase</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ Object.keys(contactosPorCargo).length }}
                </div>
                <div class="text-caption text-grey-darken-1">Cargos Únicos</div>
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
              label="Buscar contactos"
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
            <v-autocomplete
              v-model="filtroCliente"
              label="Cliente"
              :items="clientesDisponibles"
              item-title="razonSocial"
              item-value="idCliente"
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
                  @click="cargarContactos"
                  :loading="loading"
                />
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla de Contactos -->
    <v-card elevation="3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#485696">mdi-account-group</v-icon>
        Lista de Contactos
        <v-spacer />
        <div class="d-flex align-center gap-2">
          <v-chip color="primary" variant="tonal">
            {{ contactosFiltrados.length }} contactos
          </v-chip>
          <v-btn
            v-if="hasPermission('contactos', 'crear')"
            color="#485696"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            @click="$emit('crear-contacto')"
          >
            Nuevo Contacto
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        v-model:page="pagina"
        :headers="headers"
        :items="contactosFiltrados"
        :loading="loading"
        :items-per-page="itemsPorPagina"
        class="elevation-0"
        loading-text="Cargando contactos..."
        no-data-text="No hay contactos disponibles"
      >
        <!-- Nombre con avatar -->
        <template v-slot:item.nombre="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="#485696" class="mr-3">
              <span class="text-caption font-weight-bold">
                {{ item.nombre.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.nombre }}</div>
              <div class="text-caption text-grey-darken-1">{{ item.cargo }}</div>
            </div>
          </div>
        </template>

        <!-- Cliente -->
        <template v-slot:item.cliente="{ item }">
          <div v-if="getClienteInfo(item.idCliente)">
            <div class="font-weight-medium">{{ getClienteInfo(item.idCliente)?.razonSocial }}</div>
            <div class="text-caption text-grey-darken-1">
              {{ getClienteInfo(item.idCliente)?.rubro }}
            </div>
          </div>
          <div v-else class="text-grey-darken-1">Cliente no encontrado</div>
        </template>

        <!-- Información de contacto -->
        <template v-slot:item.contacto="{ item }">
          <div>
            <div class="text-body-2">
              <v-icon size="14" class="mr-1">mdi-email</v-icon>
              {{ item.email }}
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
                  @click="$emit('ver-contacto', item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Editar">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('contactos', 'editar')"
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="$emit('editar-contacto', item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip :text="item.activo ? 'Desactivar' : 'Activar'">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('contactos', 'eliminar')"
                  v-bind="props"
                  :icon="item.activo ? 'mdi-account-remove' : 'mdi-account-plus'"
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

            <v-tooltip text="Enviar correo">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-email"
                  size="small"
                  variant="text"
                  color="info"
                  @click="enviarCorreo(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Ver cliente">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="getClienteInfo(item.idCliente)"
                  v-bind="props"
                  icon="mdi-domain"
                  size="small"
                  variant="text"
                  color="orange"
                  @click="$emit('ver-cliente', item.idCliente)"
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
import { useContactoClienteStore } from '../store/contacto-cliente.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { ContactoClienteListItem } from '../interfaces/contacto-cliente.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Definir eventos que emite el componente
const emit = defineEmits<{
  'crear-contacto': []
  'editar-contacto': [contacto: ContactoClienteListItem]
  'ver-contacto': [contacto: ContactoClienteListItem]
  'toggle-estado': [contacto: ContactoClienteListItem]
  'confirmar-eliminacion': [contacto: ContactoClienteListItem]
  'ver-cliente': [idCliente: string]
}>()

const contactoClienteStore = useContactoClienteStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroEstado = ref('todos')
const filtroCliente = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)

// Computed
const loading = computed(() => contactoClienteStore.loading)
const contactos = computed(() => contactoClienteStore.contactos)
const totalContactos = computed(() => contactoClienteStore.totalContactos)
const contactosActivos = computed(() => contactoClienteStore.contactosActivos)
const contactosInactivos = computed(() => contactoClienteStore.contactosInactivos)
const contactosPorCargo = computed(() => contactoClienteStore.contactosPorCargo)

// Opciones para filtros
const opcionesEstado = [
  { title: 'Todos', value: 'todos' },
  { title: 'Activos', value: 'activo' },
  { title: 'Inactivos', value: 'inactivo' },
]

const cargosUnicos = computed(() => {
  return contactoClienteStore.cargosUnicos.map((cargo) => ({
    title: cargo,
    value: cargo,
  }))
})

const clientesDisponibles = computed(() =>
  clienteEmpresaStore.clientesActivos.filter((c) => c.activo),
)

// Headers de la tabla
const headers = [
  { title: 'Contacto', key: 'nombre', sortable: true },
  { title: 'Cliente', key: 'cliente', sortable: false },
  { title: 'Información', key: 'contacto', sortable: false },
  { title: 'Estado', key: 'activo', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: 200 },
]

// Contactos filtrados
const contactosFiltrados = computed(() => {
  let resultado = contactos.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (c) =>
        c.nombre.toLowerCase().includes(termino) ||
        c.cargo.toLowerCase().includes(termino) ||
        c.email.toLowerCase().includes(termino) ||
        c.telefono.includes(termino),
    )
  }

  // Filtrar por estado
  if (filtroEstado.value !== 'todos') {
    const estado = filtroEstado.value === 'activo'
    resultado = resultado.filter((c) => c.activo === estado)
  }

  // Filtrar por cliente
  if (filtroCliente.value) {
    resultado = resultado.filter((c) => c.idCliente === filtroCliente.value)
  }

  // Ordenar: activos primero, luego inactivos
  resultado = resultado.slice().sort((a, b) => {
    if (a.activo === b.activo) return 0
    return a.activo ? -1 : 1
  })

  return resultado
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function getClienteInfo(idCliente: string) {
  return clienteEmpresaStore.clientes.find((c) => c.idCliente === idCliente)
}

function enviarCorreo(contacto: ContactoClienteListItem) {
  window.open(`mailto:${contacto.email}`)
}

async function cargarContactos() {
  // Cargar clientes si no están cargados
  if (clienteEmpresaStore.clientes.length === 0) {
    await clienteEmpresaStore.cargarClientes()
  }

  // Si no hay filtro de cliente, cargar todos los contactos
  if (!filtroCliente.value) {
    await contactoClienteStore.cargarTodosContactos()
  } else {
    await contactoClienteStore.cargarContactosPorCliente(filtroCliente.value)
  }
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstado.value = 'todos'
  filtroCliente.value = ''
}

// Watchers
watch(filtroCliente, async (nuevoCliente) => {
  if (nuevoCliente) {
    await contactoClienteStore.cargarContactosPorCliente(nuevoCliente)
  } else {
    await contactoClienteStore.cargarTodosContactos()
  }
})

// Inicialización
onMounted(() => {
  cargarContactos()
})
</script>

<style scoped>
.contactos-cliente-container {
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
  .contactos-cliente-container {
    padding: 0;
  }
}
</style>
