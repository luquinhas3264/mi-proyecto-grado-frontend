<template>
  <v-card class="nota-card" elevation="2">
    <v-card-text class="pa-4">
      <!-- Header con fecha y acciones -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-icon color="#485696" class="mr-2">mdi-note-text-outline</v-icon>
          <span class="text-caption text-grey-darken-1">
            {{ formatearFechaRelativa(nota.fecha) }}
          </span>
        </div>

        <!-- Menú de acciones -->
        <v-menu v-if="mostrarAcciones">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              density="compact"
            />
          </template>
          <v-list density="compact">
            <v-list-item
              v-if="hasPermission('notas-proyecto', 'editar')"
              @click="$emit('editar', nota)"
            >
              <template v-slot:prepend>
                <v-icon color="warning" style="opacity: 1 !important">mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Editar</v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="hasPermission('notas-proyecto', 'eliminar')"
              @click="$emit('eliminar', nota)"
              class="text-error"
            >
              <template v-slot:prepend>
                <v-icon color="error" style="opacity: 1 !important">mdi-delete</v-icon>
              </template>
              <v-list-item-title>Eliminar</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Contenido de la nota -->
      <div class="nota-contenido">
        <p class="text-body-1 mb-0" style="white-space: pre-wrap">{{ nota.contenido }}</p>
      </div>

      <!-- Footer con metadata adicional -->
      <div class="d-flex align-center justify-space-between mt-3 pt-3 border-t">
        <div class="text-caption text-grey-darken-1">
          <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
          {{ formatearFechaCompleta(nota.fecha) }}
        </div>

        <!-- Badge opcional si es reciente -->
        <v-chip
          v-if="esReciente"
          color="success"
          variant="tonal"
          size="x-small"
          prepend-icon="mdi-new-box"
        >
          Nueva
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { NotaProyecto } from '../interfaces/nota.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

interface Props {
  nota: NotaProyecto
  mostrarAcciones?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mostrarAcciones: true,
})

const emit = defineEmits<{
  editar: [nota: NotaProyecto]
  eliminar: [nota: NotaProyecto]
}>()

const authStore = useAuthStore()

// Computed
const esReciente = computed(() => {
  const hace24Horas = new Date()
  hace24Horas.setHours(hace24Horas.getHours() - 24)
  return new Date(props.nota.fecha) >= hace24Horas
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function formatearFechaRelativa(fecha: string): string {
  const ahora = new Date()
  const fechaNota = new Date(fecha)
  const diferencia = ahora.getTime() - fechaNota.getTime()

  const minutos = Math.floor(diferencia / 60000)
  const horas = Math.floor(diferencia / 3600000)
  const dias = Math.floor(diferencia / 86400000)

  if (minutos < 1) return 'Hace un momento'
  if (minutos < 60) return `Hace ${minutos} minuto${minutos === 1 ? '' : 's'}`
  if (horas < 24) return `Hace ${horas} hora${horas === 1 ? '' : 's'}`
  if (dias < 7) return `Hace ${dias} día${dias === 1 ? '' : 's'}`

  return formatearFechaCompleta(fecha)
}

function formatearFechaCompleta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.nota-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  border-left: 4px solid #485696;
}

.nota-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.nota-contenido {
  min-height: 60px;
  max-height: 300px;
  overflow-y: auto;
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* Scrollbar personalizado */
.nota-contenido::-webkit-scrollbar {
  width: 6px;
}

.nota-contenido::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.nota-contenido::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.nota-contenido::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
