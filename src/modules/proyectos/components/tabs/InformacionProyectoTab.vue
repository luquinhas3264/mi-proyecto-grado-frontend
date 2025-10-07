<template>
  <div class="informacion-proyecto">
    <v-row>
      <!-- Información General -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2" color="primary">mdi-information</v-icon>
            Información General
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" sm="6">
                <div class="info-item mb-4">
                  <div class="info-label">Nombre del Proyecto</div>
                  <div class="info-value">{{ proyecto.nombre }}</div>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="info-item mb-4">
                  <div class="info-label">ID del Proyecto</div>
                  <div class="info-value font-mono">{{ proyecto.idProyecto }}</div>
                </div>
              </v-col>

              <v-col cols="12" v-if="proyecto.descripcion">
                <div class="info-item mb-4">
                  <div class="info-label">Descripción</div>
                  <div class="info-value">{{ proyecto.descripcion }}</div>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="info-item mb-4">
                  <div class="info-label">Estado Actual</div>
                  <v-chip :color="obtenerColorEstado(proyecto.estado)" variant="tonal" size="small">
                    <v-icon start :icon="obtenerIconoEstado(proyecto.estado)" />
                    {{ formatearEstado(proyecto.estado) }}
                  </v-chip>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="info-item mb-4">
                  <div class="info-label">Fecha de Creación</div>
                  <div class="info-value">{{ formatearFecha(proyecto.creadoEn) }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Cronología del Proyecto -->
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon class="mr-2" color="info">mdi-calendar-range</v-icon>
            Cronología del Proyecto
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <v-timeline density="compact" side="end">
              <!-- Fecha de inicio -->
              <v-timeline-item dot-color="success" icon="mdi-calendar-start" size="small">
                <div>
                  <div class="font-weight-medium">Inicio del Proyecto</div>
                  <div class="text-caption text-grey-darken-1">
                    {{ formatearFecha(proyecto.fechaInicio) }} - Proyecto iniciado oficialmente
                  </div>
                </div>
              </v-timeline-item>

              <!-- Fecha actual (solo si está en progreso) -->
              <v-timeline-item
                v-if="proyecto.estado === EstadoProyecto.EN_PROGRESO"
                dot-color="warning"
                icon="mdi-clock-outline"
                size="small"
              >
                <div>
                  <div class="font-weight-medium">Estado Actual</div>
                  <div class="text-caption text-grey-darken-1">
                    {{ formatearFecha(new Date().toISOString()) }} - Proyecto en desarrollo
                  </div>
                </div>
              </v-timeline-item>

              <!-- Fecha de fin -->
              <v-timeline-item
                v-if="proyecto.fechaFin"
                :dot-color="obtenerColorFin()"
                :icon="obtenerIconoFin()"
                size="small"
              >
                <div>
                  <div class="font-weight-medium">
                    {{
                      proyecto.estado === EstadoProyecto.FINALIZADO ? 'Finalizado' : 'Fin Estimado'
                    }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ formatearFecha(proyecto.fechaFin) }} - {{ obtenerDescripcionFin() }}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>

            <!-- Información de duración -->
            <div class="mt-4">
              <v-row>
                <v-col cols="12" sm="4">
                  <v-card variant="tonal" color="info" class="pa-3">
                    <div class="text-center">
                      <v-icon size="24" class="mb-2">mdi-calendar-clock</v-icon>
                      <div class="text-caption">Duración Total</div>
                      <div class="text-body-1 font-weight-bold">{{ calcularDuracionTotal() }}</div>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="4">
                  <v-card variant="tonal" color="success" class="pa-3">
                    <div class="text-center">
                      <v-icon size="24" class="mb-2">mdi-progress-clock</v-icon>
                      <div class="text-caption">Tiempo Transcurrido</div>
                      <div class="text-body-1 font-weight-bold">
                        {{ calcularTiempoTranscurrido() }}
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                  v-if="proyecto.fechaFin && proyecto.estado !== EstadoProyecto.FINALIZADO"
                >
                  <v-card variant="tonal" :color="obtenerColorTiempoRestante()" class="pa-3">
                    <div class="text-center">
                      <v-icon size="24" class="mb-2">mdi-timer-sand</v-icon>
                      <div class="text-caption">Tiempo Restante</div>
                      <div class="text-body-1 font-weight-bold">{{ calcularTiempoRestante() }}</div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Información del Cliente -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2" color="orange">mdi-domain</v-icon>
            Cliente
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <div class="text-center mb-4">
              <v-avatar size="64" color="orange" class="mb-3">
                <span class="text-h4">{{ obtenerIniciales(proyecto.cliente.razonSocial) }}</span>
              </v-avatar>
              <h3 class="text-h6 mb-1">{{ proyecto.cliente.razonSocial }}</h3>
              <div class="text-caption text-grey-darken-1" v-if="proyecto.cliente.rubro">
                {{ proyecto.cliente.rubro }}
              </div>
            </div>

            <v-list density="compact">
              <v-list-item v-if="proyecto.cliente.correo">
                <template v-slot:prepend>
                  <v-icon color="success" style="opacity: 1 !important">mdi-email</v-icon>
                </template>
                <v-list-item-title>{{ proyecto.cliente.correo }}</v-list-item-title>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-email-send"
                    variant="text"
                    size="small"
                    @click="contactarCliente"
                  />
                </template>
              </v-list-item>

              <v-list-item v-if="proyecto.cliente.telefono">
                <template v-slot:prepend>
                  <v-icon color="info" style="opacity: 1 !important">mdi-phone</v-icon>
                </template>
                <v-list-item-title>{{ proyecto.cliente.telefono }}</v-list-item-title>
                <template v-slot:append>
                  <v-btn icon="mdi-phone" variant="text" size="small" @click="llamarCliente" />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Resumen de Progreso -->
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon class="mr-2" color="purple">mdi-chart-arc</v-icon>
            Resumen de Progreso
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <div class="text-center mb-4">
              <v-progress-circular
                :model-value="calcularProgreso()"
                :color="obtenerColorEstado(proyecto.estado)"
                size="120"
                width="8"
              >
                <span class="text-h4 font-weight-bold">{{ calcularProgreso() }}%</span>
              </v-progress-circular>
            </div>

            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info" style="opacity: 1 !important">mdi-note-text</v-icon>
                </template>
                <v-list-item-title>Notas</v-list-item-title>
                <template v-slot:append>
                  <v-chip size="small" variant="tonal" color="info">
                    {{ proyecto.notas?.length || 0 }}
                  </v-chip>
                </template>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="warning" style="opacity: 1 !important"
                    >mdi-format-list-checks</v-icon
                  >
                </template>
                <v-list-item-title>Tareas</v-list-item-title>
                <template v-slot:append>
                  <v-chip size="small" variant="tonal" color="warning">
                    {{ proyecto.tareas?.length || 0 }}
                  </v-chip>
                </template>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="purple" style="opacity: 1 !important">mdi-file-multiple</v-icon>
                </template>
                <v-list-item-title>Archivos</v-list-item-title>
                <template v-slot:append>
                  <v-chip size="small" variant="tonal" color="purple">
                    {{ totalArchivosProyecto }}
                  </v-chip>
                </template>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success" style="opacity: 1 !important">mdi-history</v-icon>
                </template>
                <v-list-item-title>Actividades</v-list-item-title>
                <template v-slot:append>
                  <v-chip size="small" variant="tonal" color="success">
                    {{ proyecto.actividades?.length || 0 }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { EstadoProyecto, type ProyectoDetalle } from '../../proyecto/interfaces/proyecto.interface'
import { useArchivoStore } from '../../archivos/store/archivo.store'
import { storeToRefs } from 'pinia'

interface Props {
  proyecto: ProyectoDetalle
}

const props = defineProps<Props>()

const archivoStore = useArchivoStore()
const { totalArchivos } = storeToRefs(archivoStore)
const totalArchivosProyecto = totalArchivos

// Métodos de formato
function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
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

function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Métodos de cronología
function obtenerColorFin(): string {
  if (props.proyecto.estado === EstadoProyecto.FINALIZADO) return 'success'
  if (estaAtrasado()) return 'error'
  return 'warning'
}

function obtenerIconoFin(): string {
  if (props.proyecto.estado === EstadoProyecto.FINALIZADO) return 'mdi-check-circle'
  if (estaAtrasado()) return 'mdi-alert-circle'
  return 'mdi-calendar-end'
}

function obtenerDescripcionFin(): string {
  if (props.proyecto.estado === EstadoProyecto.FINALIZADO) return 'Proyecto completado exitosamente'
  if (estaAtrasado()) return 'Fecha límite vencida'
  return 'Fecha estimada de finalización'
}

function estaAtrasado(): boolean {
  if (!props.proyecto.fechaFin || props.proyecto.estado === EstadoProyecto.FINALIZADO) return false
  return new Date(props.proyecto.fechaFin) < new Date()
}

// Métodos de cálculo
function calcularDuracionTotal(): string {
  if (!props.proyecto.fechaFin) return 'Sin fecha fin'

  const inicio = new Date(props.proyecto.fechaInicio)
  const fin = new Date(props.proyecto.fechaFin)
  const diferencia = fin.getTime() - inicio.getTime()
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))

  if (dias === 1) return '1 día'
  if (dias < 30) return `${dias} días`
  if (dias < 365) {
    const meses = Math.round(dias / 30)
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  }

  const años = Math.round(dias / 365)
  return `${años} ${años === 1 ? 'año' : 'años'}`
}

function calcularTiempoTranscurrido(): string {
  const inicio = new Date(props.proyecto.fechaInicio)
  const ahora = new Date()
  const diferencia = ahora.getTime() - inicio.getTime()
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

  if (dias === 0) return 'Hoy'
  if (dias === 1) return '1 día'
  if (dias < 30) return `${dias} días`
  if (dias < 365) {
    const meses = Math.floor(dias / 30)
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  }

  const años = Math.floor(dias / 365)
  return `${años} ${años === 1 ? 'año' : 'años'}`
}

function calcularTiempoRestante(): string {
  if (!props.proyecto.fechaFin) return 'Sin fecha fin'
  // Normalizar ambas fechas a medianoche local (año, mes, día)
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const finDate = new Date(props.proyecto.fechaFin)
  const fin = new Date(finDate.getFullYear(), finDate.getMonth(), finDate.getDate())
  const diferencia = fin.getTime() - hoy.getTime()
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))

  if (dias < 0) return `${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'} de atraso`
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return '1 día'
  if (dias < 60) return `${dias} días`

  const meses = Math.floor(dias / 30)
  return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
}

function obtenerColorTiempoRestante(): string {
  if (!props.proyecto.fechaFin) return 'grey'

  const ahora = new Date()
  const fin = new Date(props.proyecto.fechaFin)
  const diferencia = fin.getTime() - ahora.getTime()
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))

  if (dias < 0) return 'error'
  if (dias <= 3) return 'error'
  if (dias <= 7) return 'warning'
  return 'success'
}

function calcularProgreso(): number {
  const tareas = props.proyecto.tareas || []
  if (tareas.length === 0) return 0
  const completadas = tareas.filter((t) => t.estado === 'COMPLETADA').length
  return Math.round((completadas / tareas.length) * 100)
}

// Métodos de contacto
function contactarCliente() {
  if (props.proyecto.cliente.correo) {
    window.open(`mailto:${props.proyecto.cliente.correo}`)
  }
}

function llamarCliente() {
  if (props.proyecto.cliente.telefono) {
    window.open(`tel:${props.proyecto.cliente.telefono}`)
  }
}
</script>

<style scoped>
.informacion-proyecto {
  padding: 2px;
}

.info-item {
  border-left: 3px solid #e0e0e0;
  padding-left: 12px;
}

.info-label {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.info-value {
  color: #333;
  font-size: 1rem;
  font-weight: 400;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.v-card {
  border-radius: 12px;
}

.v-timeline {
  margin-top: 1rem;
}
</style>
