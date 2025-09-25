<template>
  <div class="interacciones-cliente-container">
    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="primary" class="mr-3">
                <v-icon color="white">mdi-calendar-account</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalInteracciones }}</div>
                <div class="text-caption text-grey-darken-1">Total Interacciones</div>
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
                <v-icon color="white">mdi-phone</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ interaccionesPorTipo.llamada?.length || 0 }}
                </div>
                <div class="text-caption text-grey-darken-1">Llamadas</div>
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
                <v-icon color="white">mdi-email</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ interaccionesPorTipo.correo?.length || 0 }}
                </div>
                <div class="text-caption text-grey-darken-1">Correos</div>
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
                <div class="text-h5 font-weight-bold">
                  {{ interaccionesPorTipo.reunion?.length || 0 }}
                </div>
                <div class="text-caption text-grey-darken-1">Reuniones</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="stat-card mb-6" elevation="3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#485696">mdi-calendar-month</v-icon>
        Interacciones por Mes
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="(cantidad, mes) in interaccionesPorMes" :key="mes" cols="12" md="3">
            <v-card variant="outlined" class="pa-2">
              <div class="text-h6">{{ mes }}</div>
              <div class="text-subtitle-1 font-weight-bold">{{ cantidad }} interacciones</div>
            </v-card>
          </v-col>
        </v-row>
        <div
          v-if="Object.keys(interaccionesPorMes).length === 0"
          class="text-caption text-grey-darken-1 py-6 text-center"
        >
          <v-icon color="grey-lighten-1" size="32" class="mb-2">mdi-calendar-remove</v-icon>
          <div>No hay interacciones registradas este año.</div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Filtros y Búsqueda -->
    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="busqueda"
              label="Buscar interacciones"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filtroTipo"
              label="Tipo"
              :items="opcionesTipo"
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
            <v-text-field
              v-model="filtroFecha"
              label="Fecha desde"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col cols="12" md="1">
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
                  @click="cargarInteracciones"
                  :loading="loading"
                />
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla de Interacciones -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#485696">mdi-calendar-account</v-icon>
        Lista de Interacciones
        <v-spacer />
        <div class="d-flex align-center gap-2">
          <v-chip color="primary" variant="tonal">
            {{ interaccionesFiltradas.length }} interacciones
          </v-chip>
          <v-btn
            v-if="hasPermission('interacciones', 'crear')"
            color="#485696"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            @click="$emit('crear-interaccion')"
          >
            Nueva Interacción
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        v-model:page="pagina"
        :headers="headers"
        :items="interaccionesFiltradas"
        :loading="loading"
        :items-per-page="itemsPorPagina"
        class="elevation-0"
        loading-text="Cargando interacciones..."
        no-data-text="No hay interacciones disponibles"
        :sort-by="[{ key: 'fecha', order: 'desc' }]"
      >
        <!-- Tipo con icono -->
        <template v-slot:item.tipo="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" :color="getTipoInfo(item.tipo).color" class="mr-3">
              <v-icon color="white" size="16">{{ getTipoInfo(item.tipo).icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ getTipoInfo(item.tipo).title }}</div>
              <div class="text-caption text-grey-darken-1">
                {{ getTipoInfo(item.tipo).description }}
              </div>
            </div>
          </div>
        </template>

        <!-- Contacto -->
        <template v-slot:item.contacto="{ item }">
          <div v-if="item.contacto">
            <div class="font-weight-medium">{{ item.contacto.nombre }}</div>
            <div class="text-caption text-grey-darken-1">
              {{ getContactoCompleto(item.idContacto)?.cargo || 'Contacto' }}
            </div>
          </div>
          <div v-else class="text-grey-darken-1">Contacto no encontrado</div>
        </template>

        <!-- Cliente -->
        <template v-slot:item.cliente="{ item }">
          <div v-if="getClienteInfo(item.idContacto)">
            <div class="font-weight-medium">{{ getClienteInfo(item.idContacto)?.razonSocial }}</div>
            <div class="text-caption text-grey-darken-1">
              {{ getClienteInfo(item.idContacto)?.rubro }}
            </div>
          </div>
          <div v-else class="text-grey-darken-1">Cliente no encontrado</div>
        </template>

        <!-- Fecha -->
        <template v-slot:item.fecha="{ item }">
          <div>
            <div class="font-weight-medium">{{ formatearFecha(item.fecha) }}</div>
            <div class="text-caption text-grey-darken-1">
              {{ formatearTiempoRelativo(item.fecha) }}
            </div>
          </div>
        </template>

        <!-- Descripción -->
        <template v-slot:item.descripcion="{ item }">
          <div class="description-cell" :title="item.descripcion">
            {{ truncarTexto(item.descripcion, 60) }}
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
                  @click="$emit('ver-interaccion', item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Ver contacto">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-account"
                  size="small"
                  variant="text"
                  color="success"
                  @click="$emit('ver-contacto', item.idContacto)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Ver cliente">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-domain"
                  size="small"
                  variant="text"
                  color="orange"
                  @click="verClienteDesdeInteraccion(item.idContacto)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Nueva interacción con este contacto">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('interacciones', 'crear')"
                  v-bind="props"
                  icon="mdi-plus-circle"
                  size="small"
                  variant="text"
                  color="info"
                  @click="$emit('nueva-interaccion-contacto', item.idContacto)"
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
                  color="secondary"
                  @click="enviarCorreo(item.idContacto)"
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
import { useInteraccionClienteStore } from '../store/interaccion-cliente.store'
import { useContactoClienteStore } from '../../contacto-cliente/store/contacto-cliente.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { InteraccionClienteService } from '../services/interaccion-cliente.service'
import type {
  InteraccionClienteConContacto,
  TipoInteraccion,
} from '../interfaces/interaccion-cliente.interface'
import { TIPOS_INTERACCION_OPTIONS } from '../interfaces/interaccion-cliente.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Definir eventos que emite el componente
const emit = defineEmits<{
  'crear-interaccion': []
  'ver-interaccion': [interaccion: InteraccionClienteConContacto]
  'ver-contacto': [idContacto: string]
  'ver-cliente': [idCliente: string]
  'nueva-interaccion-contacto': [idContacto: string]
}>()

const interaccionClienteStore = useInteraccionClienteStore()
const contactoClienteStore = useContactoClienteStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroTipo = ref('todos')
const filtroCliente = ref('')
const filtroFecha = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)

// Computed
const loading = computed(() => interaccionClienteStore.loading)
const interacciones = computed(() => interaccionClienteStore.interacciones)
const totalInteracciones = computed(() => interaccionClienteStore.totalInteracciones)
const interaccionesPorTipo = computed(() => interaccionClienteStore.interaccionesPorTipo)
const interaccionesPorMes = computed(() => interaccionClienteStore.interaccionesPorMes)

// Opciones para filtros
const opcionesTipo = computed(() => [
  { title: 'Todos', value: 'todos' },
  ...TIPOS_INTERACCION_OPTIONS.map((tipo) => ({
    title: tipo.title,
    value: tipo.value,
  })),
])

const clientesDisponibles = computed(() =>
  clienteEmpresaStore.clientesActivos.filter((c) => c.activo),
)

// Headers de la tabla
const headers = [
  { title: 'Tipo', key: 'tipo', sortable: true },
  { title: 'Contacto', key: 'contacto', sortable: false },
  { title: 'Cliente', key: 'cliente', sortable: false },
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Descripción', key: 'descripcion', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, width: 200 },
]

// Interacciones filtradas
const interaccionesFiltradas = computed(() => {
  let resultado = interacciones.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (i) =>
        i.descripcion.toLowerCase().includes(termino) ||
        i.tipo.toLowerCase().includes(termino) ||
        i.contacto.nombre.toLowerCase().includes(termino),
    )
  }

  // Filtrar por tipo
  if (filtroTipo.value !== 'todos') {
    resultado = resultado.filter((i) => i.tipo === filtroTipo.value)
  }

  // Filtrar por cliente
  if (filtroCliente.value) {
    resultado = resultado.filter((i) => {
      const contacto = getContactoCompleto(i.idContacto)
      return contacto?.idCliente === filtroCliente.value
    })
  }

  // Filtrar por fecha
  if (filtroFecha.value) {
    const fechaFiltro = new Date(filtroFecha.value)
    resultado = resultado.filter((i) => {
      const fechaInteraccion = new Date(i.fecha)
      return fechaInteraccion >= fechaFiltro
    })
  }

  // Ordenar por fecha descendente por defecto
  return resultado.slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function getTipoInfo(tipo: TipoInteraccion) {
  return TIPOS_INTERACCION_OPTIONS.find((t) => t.value === tipo) || TIPOS_INTERACCION_OPTIONS[0]
}

function getContactoCompleto(idContacto: string) {
  return contactoClienteStore.contactos.find((c) => c.idContacto === idContacto)
}

function getClienteInfo(idContacto: string) {
  // Buscar primero en la interacción (objeto contacto)
  const interaccion = interacciones.value.find((i) => i.idContacto === idContacto)
  const idCliente = interaccion?.contacto?.idCliente
  if (idCliente) {
    return clienteEmpresaStore.clientes.find((c) => c.idCliente === idCliente)
  }
  // Fallback: buscar en el store de contactos
  const contacto = getContactoCompleto(idContacto)
  if (contacto?.idCliente) {
    return clienteEmpresaStore.clientes.find((c) => c.idCliente === contacto.idCliente)
  }
  return null
}

function formatearFecha(fecha: string): string {
  return InteraccionClienteService.formatearFecha(fecha)
}

function formatearTiempoRelativo(fecha: string): string {
  const ahora = new Date()
  const fechaInteraccion = new Date(fecha)
  const diferencia = ahora.getTime() - fechaInteraccion.getTime()

  const minutos = Math.floor(diferencia / (1000 * 60))
  const horas = Math.floor(diferencia / (1000 * 60 * 60))
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

  if (minutos < 60) {
    return `hace ${minutos} min`
  } else if (horas < 24) {
    return `hace ${horas}h`
  } else if (dias < 7) {
    return `hace ${dias}d`
  } else {
    return fechaInteraccion.toLocaleDateString('es-ES')
  }
}

function truncarTexto(texto: string, limite: number): string {
  if (texto.length <= limite) return texto
  return texto.substring(0, limite) + '...'
}

function enviarCorreo(idContacto: string) {
  const contacto = getContactoCompleto(idContacto)
  if (contacto?.email) {
    window.open(`mailto:${contacto.email}`)
  }
}

function verClienteDesdeInteraccion(idContacto: string) {
  // Buscar primero en la interacción
  const interaccion = interacciones.value.find((i) => i.idContacto === idContacto)
  const idCliente = interaccion?.contacto?.idCliente
  if (idCliente) {
    emit('ver-cliente', idCliente)
    return
  }
  // Fallback al store de contactos
  const contacto = getContactoCompleto(idContacto)
  if (contacto?.idCliente) {
    emit('ver-cliente', contacto.idCliente)
  }
}

async function cargarInteracciones() {
  // Cargar datos necesarios
  if (clienteEmpresaStore.clientes.length === 0) {
    await clienteEmpresaStore.cargarClientes()
  }

  if (contactoClienteStore.contactos.length === 0) {
    await contactoClienteStore.cargarTodosContactos()
  }

  // Si hay filtro de cliente, cargar solo por cliente
  if (filtroCliente.value) {
    await interaccionClienteStore.cargarInteraccionesPorCliente(filtroCliente.value)
  } else {
    // Si no hay filtro, cargar todas las interacciones
    await interaccionClienteStore.cargarTodasInteracciones()
  }
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroTipo.value = 'todos'
  filtroCliente.value = ''
  filtroFecha.value = ''
}

// Watchers
watch(filtroCliente, async (nuevoCliente) => {
  if (nuevoCliente) {
    await interaccionClienteStore.cargarInteraccionesPorCliente(nuevoCliente)
  } else {
    // Si se quita el filtro, cargar todas las interacciones
    await interaccionClienteStore.cargarTodasInteracciones()
  }
})

// Lifecycle
onMounted(() => {
  cargarInteracciones()
})
</script>

<style scoped>
.interacciones-cliente-container {
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

.description-cell {
  max-width: 250px;
  word-wrap: break-word;
  cursor: pointer;
}

@media (max-width: 960px) {
  .interacciones-cliente-container {
    padding: 0;
  }
}
</style>
