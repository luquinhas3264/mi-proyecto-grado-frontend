<template>
  <v-card class="archivo-card" elevation="2" :ripple="false">
    <!-- Preview o Icono -->
    <div class="archivo-preview" @click="previsualizarArchivo">
      <!-- Preview de imagen -->
      <v-img
        v-if="archivo.esImagen && urlCompleta"
        :src="urlCompleta"
        :alt="archivo.nombre"
        cover
        height="140"
        class="cursor-pointer"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="grey-lighten-2" />
          </div>
        </template>
      </v-img>

      <!-- Icono para archivos no-imagen -->
      <div
        v-else
        class="archivo-icon-container"
        :class="`bg-${colorCategoria}`"
        @click="previsualizarArchivo"
      >
        <v-icon :icon="archivo.icono" size="64" color="white" />
        <div class="archivo-extension">{{ archivo.extension.toUpperCase() }}</div>
      </div>

      <!-- Badge de categoría -->
      <v-chip :color="colorCategoria" size="x-small" class="archivo-categoria-badge" variant="flat">
        {{ archivo.categoria }}
      </v-chip>

      <!-- Overlay de acciones rápidas -->
      <div class="archivo-overlay">
        <v-btn
          v-if="archivo.puedePrevisualizar"
          icon="mdi-eye"
          size="small"
          variant="flat"
          color="white"
          @click.stop="previsualizarArchivo"
        />
        <v-btn
          v-if="!archivo.esEnlace"
          icon="mdi-download"
          size="small"
          variant="flat"
          color="white"
          @click.stop="descargarArchivo"
        />
        <v-btn
          v-else
          icon="mdi-open-in-new"
          size="small"
          variant="flat"
          color="white"
          @click.stop="abrirEnlace"
        />
      </div>
    </div>

    <!-- Información del archivo -->
    <v-card-text class="pa-3">
      <!-- Nombre del archivo -->
      <v-tooltip :text="archivo.nombre" location="top">
        <template v-slot:activator="{ props }">
          <div v-bind="props" class="archivo-nombre text-subtitle-2 font-weight-medium mb-1">
            {{ archivo.nombre }}
          </div>
        </template>
      </v-tooltip>

      <!-- Descripción -->
      <div
        v-if="archivo.descripcion"
        class="archivo-descripcion text-caption text-grey-darken-1 mb-2"
      >
        {{ archivo.descripcion }}
      </div>

      <!-- Metadatos -->
      <div class="d-flex align-center justify-space-between">
        <div class="text-caption text-grey-darken-1">
          <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
          {{ formatearFecha(archivo.creadoEn) }}
        </div>
        <v-chip v-if="archivo.tamañoFormateado" size="x-small" variant="tonal" color="grey">
          {{ archivo.tamañoFormateado }}
        </v-chip>
      </div>

      <!-- Usuario creador -->
      <div v-if="archivo.usuarioCreador" class="text-caption text-grey-darken-1 mt-2">
        <v-icon size="14" class="mr-1">mdi-account</v-icon>
        {{ archivo.usuarioCreador.nombre }}
      </div>
    </v-card-text>

    <!-- Acciones -->
    <v-card-actions class="px-3 pb-3 pt-0">
      <v-spacer />

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            size="small"
            variant="text"
            color="grey-darken-1"
          />
        </template>
        <v-list density="compact">
          <v-list-item v-if="archivo.puedePrevisualizar" @click="previsualizarArchivo">
            <template #prepend>
              <v-icon color="primary" style="opacity: 1 !important">mdi-eye</v-icon>
            </template>
            <v-list-item-title>Ver</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="!archivo.esEnlace" @click="descargarArchivo">
            <template #prepend>
              <v-icon color="success" style="opacity: 1 !important">mdi-download</v-icon>
            </template>
            <v-list-item-title>Descargar</v-list-item-title>
          </v-list-item>

          <v-list-item v-else @click="abrirEnlace">
            <template #prepend>
              <v-icon color="success" style="opacity: 1 !important">mdi-open-in-new</v-icon>
            </template>
            <v-list-item-title>Abrir enlace</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="puedeEditar" @click="editarArchivo">
            <template #prepend>
              <v-icon color="warning" style="opacity: 1 !important">mdi-pencil</v-icon>
            </template>
            <v-list-item-title>Editar</v-list-item-title>
          </v-list-item>

          <v-divider />

          <v-list-item v-if="puedeEliminar" @click="eliminarArchivo">
            <template #prepend>
              <v-icon color="error" style="opacity: 1 !important">mdi-delete</v-icon>
            </template>
            <v-list-item-title>Eliminar</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ArchivoListItem } from '../interfaces/archivo.interface'
import { obtenerColorCategoria } from '../interfaces/archivo.interface'
import { ArchivoService } from '../services/archivo.service'

interface Props {
  archivo: ArchivoListItem
  puedeEditar?: boolean
  puedeEliminar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  puedeEditar: true,
  puedeEliminar: true,
})

const emit = defineEmits<{
  previsualizar: [archivo: ArchivoListItem]
  descargar: [archivo: ArchivoListItem]
  editar: [archivo: ArchivoListItem]
  eliminar: [archivo: ArchivoListItem]
  'abrir-enlace': [archivo: ArchivoListItem]
}>()

// Computed
const colorCategoria = computed(() => obtenerColorCategoria(props.archivo.categoria))

const urlCompleta = computed(() => {
  if (props.archivo.esEnlace) {
    return props.archivo.url
  }
  return ArchivoService.obtenerUrlCompleta(props.archivo)
})

// Métodos
function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function previsualizarArchivo() {
  emit('previsualizar', props.archivo)
}

function descargarArchivo() {
  emit('descargar', props.archivo)
}

function editarArchivo() {
  emit('editar', props.archivo)
}

function eliminarArchivo() {
  emit('eliminar', props.archivo)
}

function abrirEnlace() {
  emit('abrir-enlace', props.archivo)
}
</script>

<style scoped>
.archivo-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.archivo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.archivo-preview {
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.archivo-icon-container {
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: opacity 0.2s ease;
}

.archivo-icon-container:hover {
  opacity: 0.9;
}

.archivo-extension {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.archivo-categoria-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  text-transform: capitalize;
}

.archivo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.archivo-preview:hover .archivo-overlay {
  opacity: 1;
}

.archivo-nombre {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  min-height: 2.6em;
}

.archivo-descripcion {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.cursor-pointer {
  cursor: pointer;
}

/* Colores por categoría */
.bg-documento {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

.bg-imagen {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
}

.bg-comprimido {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.bg-enlace {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
}

.bg-otro {
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
}
</style>
