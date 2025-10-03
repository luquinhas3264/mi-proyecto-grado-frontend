<template>
  <v-card class="tarea-card" elevation="2" :class="{ 'tarea-vencida': estaVencida }">
    <v-card-text class="pa-4">
      <!-- Header con estado y acciones -->
      <div class="d-flex align-center mb-3">
        <v-chip :color="obtenerColorEstado(tarea.estado)" size="small" variant="tonal" class="mr-2">
          <v-icon start :icon="obtenerIconoEstado(tarea.estado)" size="16" />
          {{ formatearEstado(tarea.estado) }}
        </v-chip>

        <v-chip
          v-if="tarea.fechaLimite"
          :color="obtenerColorFechaLimite()"
          size="small"
          variant="tonal"
        >
          <v-icon start :icon="estaVencida ? 'mdi-alert-circle' : 'mdi-calendar-clock'" size="16" />
          {{ formatearDiasRestantes() }}
        </v-chip>

        <v-spacer />

        <!-- Menú de acciones -->
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" size="small" />
          </template>
          <v-list density="compact">
            <v-list-item @click="$emit('editar', tarea)">
              <template #prepend>
                <v-icon color="warning" style="opacity: 1 !important">mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Editar</v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="tarea.estado !== 'COMPLETADA'"
              @click="$emit('cambiar-estado', tarea, EstadoTarea.COMPLETADA)"
            >
              <template #prepend>
                <v-icon color="success" style="opacity: 1 !important">mdi-check-circle</v-icon>
              </template>

              <v-list-item-title>Marcar como completada</v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="tarea.estado === 'COMPLETADA'"
              @click="$emit('cambiar-estado', tarea, EstadoTarea.PENDIENTE)"
            >
              <template #prepend>
                <v-icon color="grey-darken-2" style="opacity: 1 !important">mdi-restore</v-icon>
              </template>

              <v-list-item-title>Marcar como pendiente</v-list-item-title>
            </v-list-item>

            <v-divider />

            <v-list-item @click="$emit('eliminar', tarea)" class="text-error">
              <template #prepend>
                <v-icon color="error" style="opacity: 1 !important">mdi-delete</v-icon>
              </template>
              <v-list-item-title>Eliminar</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Nombre de la tarea -->
      <h3
        class="text-h6 mb-2"
        :class="{ 'text-decoration-line-through': tarea.estado === 'COMPLETADA' }"
      >
        {{ tarea.nombre }}
      </h3>

      <!-- Descripción -->
      <p
        v-if="tarea.descripcion"
        class="text-body-2 text-grey-darken-1 mb-3"
        style="white-space: pre-wrap"
      >
        {{
          tarea.descripcion.length > 100
            ? tarea.descripcion.substring(0, 100) + '...'
            : tarea.descripcion
        }}
      </p>

      <!-- Footer con información adicional -->
      <div class="d-flex align-center justify-space-between mt-3">
        <!-- Responsable -->
        <div class="d-flex align-center">
          <v-tooltip :text="tarea.usuarioResponsable?.nombre || 'Sin asignar'" location="top">
            <template v-slot:activator="{ props }">
              <v-avatar
                v-bind="props"
                size="32"
                :color="tarea.usuarioResponsable ? 'primary' : 'grey'"
              >
                <v-icon v-if="!tarea.usuarioResponsable" size="20">mdi-account-question</v-icon>
                <span v-else class="text-caption">
                  {{ obtenerIniciales(tarea.usuarioResponsable.nombre) }}
                </span>
              </v-avatar>
            </template>
          </v-tooltip>
        </div>

        <!-- Fecha límite -->
        <div v-if="tarea.fechaLimite" class="text-caption text-grey-darken-1">
          <v-icon size="14">mdi-calendar</v-icon>
          {{ formatearFecha(tarea.fechaLimite) }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TareaListItem } from '../interfaces/tarea.interface'
import { EstadoTarea } from '../interfaces/tarea.interface'
import { TareaService } from '../services/tarea.service'

interface Props {
  tarea: TareaListItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  editar: [tarea: TareaListItem]
  eliminar: [tarea: TareaListItem]
  'cambiar-estado': [tarea: TareaListItem, nuevoEstado: EstadoTarea]
}>()

// Computed
const estaVencida = computed(() => TareaService.estaVencida(props.tarea))

const diasRestantes = computed(() => {
  if (!props.tarea.fechaLimite) return null
  return TareaService.calcularDiasRestantes(props.tarea.fechaLimite)
})

// Métodos de formato
function formatearEstado(estado: EstadoTarea): string {
  const estados = {
    [EstadoTarea.PENDIENTE]: 'Pendiente',
    [EstadoTarea.EN_PROGRESO]: 'En Progreso',
    [EstadoTarea.COMPLETADA]: 'Completada',
  }
  return estados[estado] || estado
}

function obtenerColorEstado(estado: EstadoTarea): string {
  const colores = {
    [EstadoTarea.PENDIENTE]: 'grey',
    [EstadoTarea.EN_PROGRESO]: 'warning',
    [EstadoTarea.COMPLETADA]: 'success',
  }
  return colores[estado] || 'grey'
}

function obtenerIconoEstado(estado: EstadoTarea): string {
  const iconos = {
    [EstadoTarea.PENDIENTE]: 'mdi-clock-outline',
    [EstadoTarea.EN_PROGRESO]: 'mdi-progress-clock',
    [EstadoTarea.COMPLETADA]: 'mdi-check-circle',
  }
  return iconos[estado] || 'mdi-help-circle'
}

function obtenerColorFechaLimite(): string {
  if (estaVencida.value) return 'error'
  if (diasRestantes.value !== null && diasRestantes.value <= 3) return 'warning'
  return 'info'
}

function formatearDiasRestantes(): string {
  if (estaVencida.value) {
    const dias = Math.abs(diasRestantes.value || 0)
    return `Vencida hace ${dias} día${dias !== 1 ? 's' : ''}`
  }

  if (diasRestantes.value === 0) return 'Vence hoy'
  if (diasRestantes.value === 1) return 'Vence mañana'
  return `${diasRestantes.value} días restantes`
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}
</script>

<style scoped>
.tarea-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
  cursor: pointer;
}

.tarea-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.tarea-vencida {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.text-decoration-line-through {
  text-decoration: line-through;
  opacity: 0.7;
}
</style>
