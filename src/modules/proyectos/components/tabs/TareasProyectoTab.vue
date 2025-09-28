<template>
  <div class="tareas-proyecto">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Tareas del Proyecto</h3>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus-circle"
        @click="mostrarDialogoNuevaTarea = true"
      >
        Nueva Tarea
      </v-btn>
    </div>

    <!-- Lista de tareas existentes -->
    <div v-if="tareas.length > 0">
      <v-card v-for="tarea in tareas" :key="tarea.idTarea" class="mb-3" elevation="2">
        <v-card-text>
          <div class="d-flex align-center">
            <v-checkbox
              :model-value="tarea.estado === 'COMPLETADA'"
              @change="toggleTarea(tarea)"
              color="success"
              hide-details
              class="mr-3"
            />
            <div class="flex-grow-1">
              <div
                class="text-body-1"
                :class="{
                  'text-decoration-line-through text-grey-darken-1': tarea.estado === 'COMPLETADA',
                }"
              >
                {{ tarea.nombre }}
              </div>
              <v-chip
                :color="obtenerColorEstado(tarea.estado)"
                size="small"
                variant="tonal"
                class="mt-1"
              >
                {{ tarea.estado }}
              </v-chip>
            </div>
            <v-btn icon="mdi-pencil" variant="text" size="small" @click="editarTarea(tarea)" />
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-12">
      <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-format-list-checks</v-icon>
      <h3 class="text-h5 mb-2">No hay tareas</h3>
      <p class="text-body-1 text-grey-darken-1 mb-4">
        Crea la primera tarea para organizar el trabajo de este proyecto
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-plus-circle"
        @click="mostrarDialogoNuevaTarea = true"
      >
        Crear Primera Tarea
      </v-btn>
    </div>

    <!-- Dialog placeholder para nueva tarea -->
    <v-dialog v-model="mostrarDialogoNuevaTarea" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2" color="primary">mdi-plus-circle</v-icon>
          Nueva Tarea
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <template v-slot:title>🚧 Módulo en Desarrollo</template>
            El módulo de tareas de proyecto está siendo desarrollado. Próximamente podrás crear y
            gestionar tareas dentro de tus proyectos.
          </v-alert>
          <p>Funcionalidades que incluirá:</p>
          <ul class="ml-4">
            <li>Crear y asignar tareas</li>
            <li>Estados: Pendiente, En Progreso, Completada</li>
            <li>Fechas límite y prioridades</li>
            <li>Subtareas y dependencias</li>
            <li>Comentarios y archivos adjuntos</li>
            <li>Seguimiento de progreso</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="mostrarDialogoNuevaTarea = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TareaProyecto } from '../../proyecto/interfaces/proyecto.interface'

interface Props {
  proyectoId: string
  tareas: TareaProyecto[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'tarea-creada': []
  'tarea-actualizada': []
}>()

const mostrarDialogoNuevaTarea = ref(false)

function obtenerColorEstado(estado: string): string {
  const colores: Record<string, string> = {
    PENDIENTE: 'warning',
    EN_PROGRESO: 'info',
    COMPLETADA: 'success',
  }
  return colores[estado] || 'grey'
}

function toggleTarea(tarea: TareaProyecto) {
  // TODO: Implementar cambio de estado de tarea
  console.log('Toggle tarea:', tarea)
  emit('tarea-actualizada')
}

function editarTarea(tarea: TareaProyecto) {
  // TODO: Implementar edición de tareas
  console.log('Editar tarea:', tarea)
}
</script>

<style scoped>
.tareas-proyecto {
  padding: 1rem 0;
}

.v-card {
  border-radius: 12px;
}
</style>
