<template>
  <div class="notas-proyecto">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Notas del Proyecto</h3>
      <v-btn color="primary" prepend-icon="mdi-note-plus" @click="mostrarDialogoNuevaNota = true">
        Nueva Nota
      </v-btn>
    </div>

    <!-- Lista de notas existentes -->
    <div v-if="notas.length > 0">
      <v-card v-for="nota in notas" :key="nota.idNota" class="mb-3" elevation="2">
        <v-card-text>
          <div class="d-flex align-start">
            <v-avatar size="32" color="info" class="mr-3 mt-1">
              <v-icon color="white" size="16">mdi-note-text</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-body-1 mb-2">{{ nota.contenido }}</div>
              <div class="text-caption text-grey-darken-1">
                <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                {{ formatearFecha(nota.fecha) }}
              </div>
            </div>
            <v-btn icon="mdi-pencil" variant="text" size="small" @click="editarNota(nota)" />
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-12">
      <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-note-text-outline</v-icon>
      <h3 class="text-h5 mb-2">No hay notas</h3>
      <p class="text-body-1 text-grey-darken-1 mb-4">Agrega la primera nota para este proyecto</p>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-note-plus"
        @click="mostrarDialogoNuevaNota = true"
      >
        Crear Primera Nota
      </v-btn>
    </div>

    <!-- Dialog placeholder para nueva nota -->
    <v-dialog v-model="mostrarDialogoNuevaNota" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2" color="primary">mdi-note-plus</v-icon>
          Nueva Nota
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <template v-slot:title>🚧 Módulo en Desarrollo</template>
            El módulo de notas de proyecto está siendo desarrollado. Próximamente podrás crear y
            gestionar notas asociadas a tus proyectos.
          </v-alert>
          <p>Funcionalidades que incluirá:</p>
          <ul class="ml-4">
            <li>Crear y editar notas</li>
            <li>Formato de texto enriquecido</li>
            <li>Fechas y timestamps</li>
            <li>Búsqueda y filtrado</li>
            <li>Notificaciones</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="mostrarDialogoNuevaNota = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NotaProyecto } from '../../proyecto/interfaces/proyecto.interface'

interface Props {
  proyectoId: string
  notas: NotaProyecto[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'nota-creada': []
  'nota-actualizada': []
}>()

const mostrarDialogoNuevaNota = ref(false)

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function editarNota(nota: NotaProyecto) {
  // TODO: Implementar edición de notas
  console.log('Editar nota:', nota)
}
</script>

<style scoped>
.notas-proyecto {
  padding: 1rem 0;
}

.v-card {
  border-radius: 12px;
}
</style>
