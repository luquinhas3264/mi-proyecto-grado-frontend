<template>
  <v-card elevation="2" class="filtros-card">
    <v-card-text>
      <v-row align="center">
        <!-- Búsqueda por descripción -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="busquedaLocal"
            label="Buscar actividades"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            placeholder="Buscar por descripción..."
          />
        </v-col>

        <!-- Filtro por tipo -->
        <v-col cols="12" md="3">
          <v-select
            v-model="filtros.tipo"
            label="Tipo de actividad"
            :items="tiposActividad"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <!-- Filtro por fecha inicio -->
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filtros.fechaInicio"
            label="Desde"
            type="date"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>

        <!-- Filtro por fecha fin -->
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filtros.fechaFin"
            label="Hasta"
            type="date"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>

        <!-- Botón limpiar -->
        <v-col cols="12" md="1">
          <v-btn color="primary" variant="outlined" @click="limpiarFiltros" block> Limpiar </v-btn>
        </v-col>
      </v-row>

      <!-- Filtros adicionales expandibles -->
      <v-expand-transition>
        <div v-if="mostrarFiltrosAvanzados" class="mt-4">
          <v-divider class="mb-4" />
          <v-row>
            <!-- Filtro por usuario (select de usuarios activos) -->
            <v-col cols="12" md="4">
              <v-select
                v-model="filtros.idUsuario"
                :items="usuariosActivos"
                item-title="nombre"
                item-value="idUsuario"
                label="Usuario"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                placeholder="Selecciona un usuario"
                :loading="usuariosLoading"
              />
            </v-col>

            <!-- Filtro por cliente -->
            <v-col cols="12" md="4">
              <v-select
                v-model="filtros.idCliente"
                :items="clientesActivos"
                item-title="razonSocial"
                item-value="idCliente"
                label="Cliente"
                prepend-inner-icon="mdi-domain"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                placeholder="Selecciona un cliente"
                :loading="clientesLoading"
              />
            </v-col>

            <!-- Filtro por proyecto -->
            <v-col cols="12" md="4">
              <v-select
                v-model="filtros.idProyecto"
                :items="proyectosActivos"
                item-title="nombre"
                item-value="idProyecto"
                label="Proyecto"
                prepend-inner-icon="mdi-briefcase"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                placeholder="Selecciona un proyecto"
                :loading="proyectosLoading"
              />
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>

      <!-- Toggle filtros avanzados -->
      <div class="mt-3">
        <v-btn
          variant="text"
          size="small"
          :prepend-icon="mostrarFiltrosAvanzados ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
        >
          {{ mostrarFiltrosAvanzados ? 'Ocultar' : 'Mostrar' }} filtros avanzados
        </v-btn>
      </div>

      <!-- Chips de filtros activos -->
      <div v-if="hayFiltrosActivos" class="mt-3">
        <v-divider class="mb-2" />
        <div class="d-flex flex-wrap gap-2 align-center">
          <span class="text-caption text-grey-darken-1">Filtros activos:</span>

          <v-chip
            v-if="filtros.tipo"
            closable
            size="small"
            color="primary"
            @click:close="filtros.tipo = undefined"
          >
            <v-icon start>{{ getTipoIcon(filtros.tipo) }}</v-icon>
            {{ getTipoLabel(filtros.tipo) }}
          </v-chip>

          <v-chip
            v-if="filtros.fechaInicio"
            closable
            size="small"
            color="info"
            @click:close="filtros.fechaInicio = undefined"
          >
            <v-icon start>mdi-calendar-start</v-icon>
            Desde: {{ filtros.fechaInicio }}
          </v-chip>

          <v-chip
            v-if="filtros.fechaFin"
            closable
            size="small"
            color="info"
            @click:close="filtros.fechaFin = undefined"
          >
            <v-icon start>mdi-calendar-end</v-icon>
            Hasta: {{ filtros.fechaFin }}
          </v-chip>

          <v-chip
            v-if="filtros.idUsuario"
            closable
            size="small"
            color="success"
            @click:close="filtros.idUsuario = undefined"
          >
            <v-icon start>mdi-account</v-icon>
            Usuario
          </v-chip>

          <v-chip
            v-if="filtros.idCliente"
            closable
            size="small"
            color="warning"
            @click:close="filtros.idCliente = undefined"
          >
            <v-icon start>mdi-domain</v-icon>
            Cliente
          </v-chip>

          <v-chip
            v-if="filtros.idProyecto"
            closable
            size="small"
            color="purple"
            @click:close="filtros.idProyecto = undefined"
          >
            <v-icon start>mdi-briefcase</v-icon>
            Proyecto
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { FilterActividadDto, TipoActividad } from '../interfaces/actividad.interface'
import {
  TipoActividadLabels,
  TipoActividadIcons,
  TipoActividadColors,
} from '../interfaces/actividad.interface'
import { useUsuariosStore } from '../../usuarios-internos/store/usuarios.store'
// Store de usuarios internos
const usuariosStore = useUsuariosStore()
const usuariosActivos = computed(() => usuariosStore.usuariosActivos)
const usuariosLoading = computed(() => usuariosStore.loading)

// Store de clientes empresa
import { useClienteEmpresaStore } from '../../clientes/cliente-empresa/store/cliente-empresa.store'
const clienteEmpresaStore = useClienteEmpresaStore()
const clientesActivos = computed(() => clienteEmpresaStore.clientesActivos)
const clientesLoading = computed(() => clienteEmpresaStore.loading)

// Store de proyectos
import { useProyectoStore } from '../../proyectos/proyecto/store/proyecto.store'
const proyectoStore = useProyectoStore()
const proyectosActivos = computed(() => proyectoStore.proyectosActivos)
const proyectosLoading = computed(() => proyectoStore.loading)

onMounted(() => {
  if (!usuariosStore.usuarios.length) {
    usuariosStore.cargarUsuarios()
  }
  if (!clienteEmpresaStore.clientes.length) {
    clienteEmpresaStore.cargarClientes()
  }
  if (!proyectoStore.proyectos.length) {
    proyectoStore.cargarProyectos()
  }
})

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'aplicar-filtros': [filtros: FilterActividadDto]
  'limpiar-filtros': []
}>()

// Estado local
const busquedaLocal = ref(props.modelValue)
const mostrarFiltrosAvanzados = ref(false)

const filtros = ref<FilterActividadDto>({
  tipo: undefined,
  fechaInicio: undefined,
  fechaFin: undefined,
  idUsuario: undefined,
  idCliente: undefined,
  idProyecto: undefined,
})

// Tipos de actividad para el select
const tiposActividad = computed(() => {
  return Object.entries(TipoActividadLabels).map(([value, label]) => ({
    value: value as TipoActividad,
    label,
    icon: TipoActividadIcons[value as TipoActividad],
    color: TipoActividadColors[value as TipoActividad],
  }))
})

// Verificar si hay filtros activos
const hayFiltrosActivos = computed(() => {
  return Object.values(filtros.value).some((v) => v !== undefined && v !== '')
})

function limpiarFiltros() {
  filtros.value = {
    tipo: undefined,
    fechaInicio: undefined,
    fechaFin: undefined,
    idUsuario: undefined,
    idCliente: undefined,
    idProyecto: undefined,
  }
  busquedaLocal.value = ''
  emit('limpiar-filtros')
}

function getTipoLabel(tipo: TipoActividad): string {
  return TipoActividadLabels[tipo]
}

function getTipoIcon(tipo: TipoActividad): string {
  return TipoActividadIcons[tipo]
}

// Watchers
watch(busquedaLocal, (newVal) => {
  emit('update:modelValue', newVal || '')
  emit('aplicar-filtros', filtros.value)
})

watch(
  () => props.modelValue,
  (newVal) => {
    busquedaLocal.value = newVal
  },
)

watch(
  () => ({ ...filtros.value }),
  () => {
    emit('aplicar-filtros', filtros.value)
  },
  { deep: true },
)
</script>

<style scoped>
.filtros-card {
  border-radius: 12px;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
