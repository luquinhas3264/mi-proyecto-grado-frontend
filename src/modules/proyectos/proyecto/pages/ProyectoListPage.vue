<template>
  <div class="proyectos-container">
    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="primary" class="mr-3">
                <v-icon color="white">mdi-folder-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalProyectos }}</div>
                <div class="text-caption text-grey-darken-1">Total Proyectos</div>
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
                <v-icon color="white">mdi-play-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ proyectosEnProgreso.length }}</div>
                <div class="text-caption text-grey-darken-1">En Progreso</div>
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
                <div class="text-h5 font-weight-bold">{{ proyectosFinalizados.length }}</div>
                <div class="text-caption text-grey-darken-1">Finalizados</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="48" color="error" class="mr-3">
                <v-icon color="white">mdi-alert-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ proyectosAtrasados.length }}</div>
                <div class="text-caption text-grey-darken-1">Atrasados</div>
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
              label="Buscar proyectos"
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
              v-model="filtroCliente"
              label="Cliente"
              :items="clientesUnicos"
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
                  @click="cargarProyectos"
                  :loading="loading"
                />
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla de Proyectos -->
    <v-card elevation="3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#485696">mdi-folder-multiple</v-icon>
        Lista de Proyectos
        <v-spacer />
        <div class="d-flex align-center gap-2">
          <v-chip color="primary" variant="tonal">{{ proyectosFiltrados.length }} proyectos</v-chip>
          <v-btn
            v-if="hasPermission('proyectos', 'crear')"
            color="#485696"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            @click="$emit('crear-proyecto')"
          >
            Nuevo Proyecto
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        v-model:page="pagina"
        :headers="headers"
        :items="proyectosFiltrados"
        :loading="loading"
        :items-per-page="itemsPorPagina"
        class="elevation-0"
        loading-text="Cargando proyectos..."
        no-data-text="No hay proyectos disponibles"
      >
        <!-- Nombre del proyecto con progreso -->
        <template v-slot:item.nombre="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" :color="obtenerColorEstado(item.estado)" class="mr-3">
              <v-icon color="white" :icon="obtenerIconoEstado(item.estado)" />
            </v-avatar>
            <div class="flex-grow-1">
              <div class="font-weight-medium">{{ item.nombre }}</div>
              <div class="text-caption text-grey-darken-1">
                {{ item.descripcion || 'Sin descripción' }}
              </div>
              <!-- Barra de progreso -->
              <v-progress-linear
                :model-value="calcularProgreso(item)"
                :color="obtenerColorEstado(item.estado)"
                height="4"
                rounded
                class="mt-1"
              />
            </div>
          </div>
        </template>

        <!-- Cliente -->
        <template v-slot:item.cliente="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.cliente.razonSocial }}</div>
            <div class="text-caption text-grey-darken-1">
              {{ item.cliente.rubro || 'Sin rubro' }}
            </div>
          </div>
        </template>

        <!-- Estado -->
        <template v-slot:item.estado="{ item }">
          <v-chip :color="obtenerColorEstado(item.estado)" size="small" variant="tonal">
            <v-icon start :icon="obtenerIconoEstado(item.estado)" />
            {{ formatearEstado(item.estado) }}
          </v-chip>
        </template>

        <!-- Fechas -->
        <template v-slot:item.fechas="{ item }">
          <div>
            <div class="text-body-2">
              <v-icon size="14" class="mr-1">mdi-calendar-start</v-icon>
              {{ formatearFecha(item.fechaInicio) }}
            </div>
            <div class="text-body-2" v-if="item.fechaFin">
              <v-icon size="14" class="mr-1">mdi-calendar-end</v-icon>
              {{ formatearFecha(item.fechaFin) }}
            </div>
            <div class="text-caption text-grey-darken-1" v-else>Sin fecha fin</div>
          </div>
        </template>

        <!-- Días restantes -->
        <template v-slot:item.diasRestantes="{ item }">
          <div class="text-center">
            <v-chip
              v-if="item.diasRestantes !== null"
              :color="obtenerColorDiasRestantes(item.diasRestantes, item.estaAtrasado)"
              variant="tonal"
              size="small"
            >
              <v-icon start :icon="item.estaAtrasado ? 'mdi-alert-circle' : 'mdi-clock-outline'" />
              {{
                item.estaAtrasado
                  ? `${Math.abs(item.diasRestantes)} atrasado`
                  : `${item.diasRestantes} días`
              }}
            </v-chip>
            <span v-else class="text-caption text-grey-darken-1">Sin fecha fin</span>
          </div>
        </template>

        <!-- Notas -->
        <template v-slot:item.notas="{ item }">
          <div class="text-center">
            <v-chip :color="item.notas.length > 0 ? 'info' : 'grey'" variant="tonal" size="small">
              <v-icon start>mdi-note-text</v-icon>
              {{ item.notas.length }}
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
                  @click="$emit('ver-proyecto', item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Editar">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('proyectos', 'editar')"
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="$emit('editar-proyecto', item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Cambiar estado">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('proyectos', 'editar')"
                  v-bind="props"
                  icon="mdi-flag"
                  size="small"
                  variant="text"
                  color="info"
                  @click="$emit('cambiar-estado', item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Eliminar">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="hasPermission('proyectos', 'eliminar')"
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="$emit('confirmar-eliminacion', item)"
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
import { useProyectoStore } from '../store/proyecto.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { EstadoProyecto, type ProyectoListItem } from '../interfaces/proyecto.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

// Definir eventos que emite el componente
const emit = defineEmits<{
  'crear-proyecto': []
  'editar-proyecto': [proyecto: ProyectoListItem]
  'ver-proyecto': [proyecto: ProyectoListItem]
  'cambiar-estado': [proyecto: ProyectoListItem]
  'confirmar-eliminacion': [proyecto: ProyectoListItem]
}>()

const proyectoStore = useProyectoStore()
const authStore = useAuthStore()

// Estado local
const busqueda = ref('')
const filtroEstado = ref('todos')
const filtroCliente = ref('')
const pagina = ref(1)
const itemsPorPagina = ref(10)

// Computed
const loading = computed(() => proyectoStore.loading)
const proyectos = computed(() => proyectoStore.proyectos)
const totalProyectos = computed(() => proyectoStore.totalProyectos)
const proyectosEnProgreso = computed(() =>
  proyectoStore.proyectosPorEstado(EstadoProyecto.EN_PROGRESO),
)
const proyectosFinalizados = computed(() => proyectoStore.proyectosFinalizados)
const proyectosAtrasados = computed(() => proyectoStore.proyectosAtrasados)

// Opciones para filtros
const opcionesEstado = [
  { title: 'Todos', value: 'todos' },
  { title: 'Planeados', value: EstadoProyecto.PLANEADO },
  { title: 'En Progreso', value: EstadoProyecto.EN_PROGRESO },
  { title: 'Finalizados', value: EstadoProyecto.FINALIZADO },
]

const clientesUnicos = computed(() => {
  const clientesMap = new Map<string, string>()
  proyectos.value.forEach((proyecto) => {
    clientesMap.set(proyecto.idCliente, proyecto.cliente.razonSocial)
  })
  return Array.from(clientesMap, ([id, nombre]) => ({ title: nombre, value: id }))
})

// Headers de la tabla
const headers = [
  { title: 'Proyecto', key: 'nombre', sortable: true },
  { title: 'Cliente', key: 'cliente', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
  { title: 'Fechas', key: 'fechas', sortable: false },
  { title: 'Tiempo', key: 'diasRestantes', sortable: true },
  { title: 'Notas', key: 'notas', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, width: 200 },
]

// Proyectos filtrados
const proyectosFiltrados = computed(() => {
  let resultado = proyectos.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (p) =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino) ||
        p.cliente.razonSocial.toLowerCase().includes(termino),
    )
  }

  // Filtrar por estado
  if (filtroEstado.value !== 'todos') {
    resultado = resultado.filter((p) => p.estado === filtroEstado.value)
  }

  // Filtrar por cliente
  if (filtroCliente.value) {
    resultado = resultado.filter((p) => p.idCliente === filtroCliente.value)
  }

  // Ordenar: en progreso primero, luego por fecha de inicio
  resultado = resultado.slice().sort((a, b) => {
    // Primero por estado (en progreso primero)
    if (a.estado === EstadoProyecto.EN_PROGRESO && b.estado !== EstadoProyecto.EN_PROGRESO)
      return -1
    if (b.estado === EstadoProyecto.EN_PROGRESO && a.estado !== EstadoProyecto.EN_PROGRESO) return 1

    // Luego por fecha de inicio (más recientes primero)
    return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
  })

  return resultado
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

async function cargarProyectos() {
  await proyectoStore.cargarProyectos()
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstado.value = 'todos'
  filtroCliente.value = ''
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatearEstado(estado: EstadoProyecto): string {
  const estados = {
    [EstadoProyecto.PLANEADO]: 'Planeado',
    [EstadoProyecto.EN_PROGRESO]: 'En Progreso',
    [EstadoProyecto.FINALIZADO]: 'Finalizado',
  }
  return estados[estado] || estado
}

function obtenerColorEstado(estado: EstadoProyecto): string {
  const colores = {
    [EstadoProyecto.PLANEADO]: 'info',
    [EstadoProyecto.EN_PROGRESO]: 'warning',
    [EstadoProyecto.FINALIZADO]: 'success',
  }
  return colores[estado] || 'grey'
}

function obtenerIconoEstado(estado: EstadoProyecto): string {
  const iconos = {
    [EstadoProyecto.PLANEADO]: 'mdi-clock-outline',
    [EstadoProyecto.EN_PROGRESO]: 'mdi-play-circle',
    [EstadoProyecto.FINALIZADO]: 'mdi-check-circle',
  }
  return iconos[estado] || 'mdi-help-circle'
}

function obtenerColorDiasRestantes(dias: number, atrasado: boolean): string {
  if (atrasado) return 'error'
  if (dias <= 3) return 'error'
  if (dias <= 7) return 'warning'
  return 'success'
}

function calcularProgreso(proyecto: ProyectoListItem): number {
  switch (proyecto.estado) {
    case EstadoProyecto.PLANEADO:
      return 0
    case EstadoProyecto.EN_PROGRESO:
      // Calcular progreso basado en tiempo transcurrido
      if (proyecto.fechaFin) {
        const inicio = new Date(proyecto.fechaInicio).getTime()
        const fin = new Date(proyecto.fechaFin).getTime()
        const ahora = new Date().getTime()

        if (ahora <= inicio) return 0
        if (ahora >= fin) return 90 // No 100% hasta que esté FINALIZADO

        const progreso = ((ahora - inicio) / (fin - inicio)) * 90
        return Math.round(progreso)
      }
      return 50 // Progreso estimado si no hay fecha fin
    case EstadoProyecto.FINALIZADO:
      return 100
    default:
      return 0
  }
}

// Watchers
watch(filtroCliente, (nuevoValor) => {
  if (nuevoValor) {
    proyectoStore.cargarProyectos({ clienteId: nuevoValor })
  } else {
    proyectoStore.cargarProyectos()
  }
})

// Inicialización
onMounted(() => {
  cargarProyectos()
})
</script>

<style scoped>
.proyectos-container {
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
  .proyectos-container {
    padding: 0;
  }
}
</style>
