<template>
  <div class="etiquetas-cliente-container">
    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="primary" class="mr-3">
                <v-icon color="white">mdi-tag-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalEtiquetas }}</div>
                <div class="text-caption text-grey-darken-1">Total Etiquetas</div>
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
                <v-icon color="white">mdi-account-group</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalAsignaciones }}</div>
                <div class="text-caption text-grey-darken-1">Asignaciones</div>
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
                <v-icon color="white">mdi-chart-line</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ etiquetasMasUsadas.length }}</div>
                <div class="text-caption text-grey-darken-1">Más Populares</div>
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
                <v-icon color="white">mdi-domain</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ clientesConEtiquetas }}</div>
                <div class="text-caption text-grey-darken-1">Clientes Etiquetados</div>
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
              label="Buscar etiquetas"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="filtroCliente"
              label="Filtrar por Cliente"
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
                  @click="cargarEtiquetas"
                  :loading="loading"
                />
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Vista de Etiquetas -->
    <v-row>
      <!-- Vista de Tabla -->
      <v-col cols="12" md="8">
        <v-card elevation="3">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#485696">mdi-tag-multiple</v-icon>
            Lista de Etiquetas
            <v-spacer />
            <div class="d-flex align-center gap-2">
              <v-chip color="primary" variant="tonal">
                {{ etiquetasFiltradas.length }} etiquetas
              </v-chip>
              <v-btn
                v-if="hasPermission('etiquetas', 'crear')"
                color="#485696"
                variant="outlined"
                size="small"
                prepend-icon="mdi-plus"
                @click="$emit('crear-etiqueta')"
              >
                Nueva Etiqueta
              </v-btn>
            </div>
          </v-card-title>

          <v-data-table
            v-model:page="pagina"
            :headers="headers"
            :items="etiquetasFiltradas"
            :loading="loading"
            :items-per-page="itemsPorPagina"
            class="elevation-0"
            loading-text="Cargando etiquetas..."
            no-data-text="No hay etiquetas disponibles"
          >
            <!-- Nombre de la etiqueta con chip -->
            <template v-slot:item.nombre="{ item }">
              <div class="d-flex align-center">
                <v-chip
                  :color="generarColorEtiqueta(item.nombre)"
                  size="large"
                  variant="elevated"
                  class="mr-2"
                >
                  <v-icon start>mdi-tag</v-icon>
                  {{ item.nombre }}
                </v-chip>
              </div>
            </template>

            <!-- Clientes asignados -->
            <template v-slot:item.clientes="{ item }">
              <div>
                <v-chip color="success" size="small" variant="tonal" class="mr-1">
                  <v-icon start size="14">mdi-account-group</v-icon>
                  {{ item.totalClientes || 0 }}
                </v-chip>
                <div class="text-caption text-grey-darken-1 mt-1">clientes asignados</div>
              </div>
            </template>

            <!-- ID de etiqueta -->
            <template v-slot:item.idEtiqueta="{ item }">
              <div class="font-mono text-caption">{{ item.idEtiqueta.substring(0, 8) }}...</div>
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
                      @click="$emit('ver-etiqueta', item)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="Editar">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-if="hasPermission('etiquetas', 'editar')"
                      v-bind="props"
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      color="warning"
                      @click="$emit('editar-etiqueta', item)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="Asignar a clientes">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-if="hasPermission('etiquetas', 'asignar')"
                      v-bind="props"
                      icon="mdi-account-plus"
                      size="small"
                      variant="text"
                      color="success"
                      @click="$emit('asignar-etiqueta', item)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="Remover de clientes">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-if="(item.totalClientes || 0) > 0 && hasPermission('etiquetas', 'asignar')"
                      v-bind="props"
                      icon="mdi-tag-remove"
                      size="small"
                      variant="text"
                      color="error"
                      @click="$emit('remover-etiqueta', item)"
                    />
                  </template>
                </v-tooltip>

                <template v-if="hasPermission('etiquetas', 'eliminar')">
                  <v-tooltip text="Eliminar">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        @click="onEliminarEtiqueta(item)"
                      />
                    </template>
                  </v-tooltip>
                  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
                    {{ snackbar.text }}
                  </v-snackbar>
                </template>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Panel lateral con estadísticas -->
      <v-col cols="12" md="4">
        <!-- Etiquetas más populares -->
        <v-card class="mb-4" elevation="2">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-trending-up</v-icon>
            Más Populares
          </v-card-title>
          <v-card-text>
            <div v-if="etiquetasMasUsadas.length > 0">
              <div
                v-for="etiqueta in etiquetasMasUsadas.slice(0, 5)"
                :key="etiqueta.idEtiqueta"
                class="mb-3"
              >
                <div class="d-flex align-center mb-1">
                  <v-chip
                    :color="generarColorEtiqueta(etiqueta.nombre)"
                    size="small"
                    variant="tonal"
                    class="mr-2"
                  >
                    {{ etiqueta.nombre }}
                  </v-chip>
                  <v-spacer />
                  <span class="text-caption">
                    {{ etiqueta.totalClientes || 0 }}
                  </span>
                </div>
                <v-progress-linear
                  :model-value="calcularPorcentaje(etiqueta.totalClientes || 0)"
                  :color="generarColorEtiqueta(etiqueta.nombre)"
                  height="4"
                  rounded
                />
              </div>
            </div>
            <div v-else class="text-center py-4">
              <v-icon size="48" color="grey-lighten-1">mdi-tag-off</v-icon>
              <div class="text-body-2 text-grey-darken-1 mt-2">No hay datos de uso disponibles</div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Acciones rápidas -->
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Acciones Rápidas
          </v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-2">
              <v-btn
                v-if="hasPermission('etiquetas', 'crear')"
                color="primary"
                variant="outlined"
                block
                prepend-icon="mdi-tag-plus"
                @click="$emit('crear-etiqueta')"
              >
                Nueva Etiqueta
              </v-btn>

              <v-btn
                v-if="hasPermission('etiquetas', 'asignar')"
                color="success"
                variant="outlined"
                block
                prepend-icon="mdi-account-multiple-plus"
                @click="$emit('asignar-masivo')"
              >
                Asignación Masiva
              </v-btn>

              <v-btn
                color="info"
                variant="outlined"
                block
                prepend-icon="mdi-download"
                @click="exportarEtiquetas"
              >
                Exportar Lista
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useEtiquetaClienteStore } from '../store/etiqueta-cliente.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { EtiquetaClienteListItem } from '../interfaces/etiqueta-cliente.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Definir eventos que emite el componente
const emit = defineEmits<{
  'crear-etiqueta': []
  'editar-etiqueta': [etiqueta: EtiquetaClienteListItem]
  'ver-etiqueta': [etiqueta: EtiquetaClienteListItem]
  'asignar-etiqueta': [etiqueta: EtiquetaClienteListItem]
  'confirmar-eliminacion': [etiqueta: EtiquetaClienteListItem]
  'asignar-masivo': []
  'remover-etiqueta': [etiqueta: EtiquetaClienteListItem]
}>()

const etiquetaClienteStore = useEtiquetaClienteStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroCliente = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)
const snackbar = ref({ show: false, text: '', color: 'error' })

// Computed
const loading = computed(() => etiquetaClienteStore.loading)
const etiquetas = computed(() => etiquetaClienteStore.etiquetas)
const totalEtiquetas = computed(() => etiquetaClienteStore.totalEtiquetas)
const etiquetasMasUsadas = computed(() => etiquetaClienteStore.etiquetasMasUsadas)

const clientesDisponibles = computed(() =>
  clienteEmpresaStore.clientesActivos.filter((c) => c.activo),
)

// Headers de la tabla
const headers = [
  { title: 'Etiqueta', key: 'nombre', sortable: true },
  { title: 'Clientes', key: 'clientes', sortable: false },
  { title: 'ID', key: 'idEtiqueta', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, width: 200 },
]

// Etiquetas filtradas
const etiquetasFiltradas = computed(() => {
  let resultado = etiquetas.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter((e) => e.nombre.toLowerCase().includes(termino))
  }

  // Filtrar por cliente (etiquetas que tiene ese cliente)
  if (filtroCliente.value) {
    // Buscar el cliente en el store
    const cliente = clienteEmpresaStore.clientes.find((c) => c.idCliente === filtroCliente.value)
    if (cliente && cliente.etiquetas) {
      const idsEtiquetasDelCliente = cliente.etiquetas.map((e) => e.idEtiqueta)
      resultado = resultado.filter((e) => idsEtiquetasDelCliente.includes(e.idEtiqueta))
    } else {
      resultado = []
    }
  }

  // Ordenar por nombre
  resultado = resultado.slice().sort((a, b) => a.nombre.localeCompare(b.nombre))

  return resultado
})

// Estadísticas calculadas
const totalAsignaciones = computed(() => {
  return Object.values(etiquetaClienteStore.asignaciones).reduce(
    (total, etiquetas) => total + etiquetas.length,
    0,
  )
})

const clientesConEtiquetas = computed(() => {
  return Object.keys(etiquetaClienteStore.asignaciones).length
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
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

function obtenerClientesConEtiqueta(idEtiqueta: string) {
  return etiquetaClienteStore.obtenerClientesConEtiqueta(idEtiqueta)
}

function calcularPorcentaje(valor: number): number {
  const maximo = Math.max(...etiquetasMasUsadas.value.map((e) => e.totalClientes || 0))
  return maximo > 0 ? (valor / maximo) * 100 : 0
}

async function cargarEtiquetas() {
  // Cargar clientes si no están cargados
  if (clienteEmpresaStore.clientes.length === 0) {
    await clienteEmpresaStore.cargarClientes()
  }

  // Cargar etiquetas
  await etiquetaClienteStore.cargarEtiquetas()
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroCliente.value = ''
}

function exportarEtiquetas() {
  // Simulado - implementar exportación real
  const data = etiquetasFiltradas.value.map((e) => ({
    nombre: e.nombre,
    id: e.idEtiqueta,
    clientes: obtenerClientesConEtiqueta(e.idEtiqueta).length,
  }))

  console.log('Exportar etiquetas:', data)
  // Aquí implementarías la lógica de exportación real
}

function onEliminarEtiqueta(item: EtiquetaClienteListItem) {
  if ((item.totalClientes || 0) > 0) {
    snackbar.value = {
      show: true,
      text: 'No se puede eliminar la etiqueta porque tiene clientes asignados',
      color: 'error',
    }
    return
  }
  emit('confirmar-eliminacion', item)
}

// Watchers
watch(filtroCliente, async (nuevoCliente) => {
  // Podría cargar asignaciones específicas si fuera necesario
  console.log('Cliente filtrado:', nuevoCliente)
})

// Inicialización
onMounted(() => {
  cargarEtiquetas()
})
</script>

<style scoped>
.etiquetas-cliente-container {
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

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

@media (max-width: 960px) {
  .etiquetas-cliente-container {
    padding: 0;
  }
}
</style>
