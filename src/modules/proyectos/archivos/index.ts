// src/modules/proyectos/archivos/index.ts

// Exportar interfaces y tipos
export * from './interfaces/archivo.interface'

// Exportar servicios
export { ArchivoService } from './services/archivo.service'

// Exportar store
export { useArchivoStore } from './store/archivo.store'

// Exportar componentes
export { default as ArchivoCard } from './components/ArchivoCard.vue'
export { default as ArchivoUploadDialog } from './components/ArchivoUploadDialog.vue'
export { default as ArchivoPreviewDialog } from './components/ArchivoPreviewDialog.vue'
export { default as ArchivoEditDialog } from './components/ArchivoEditDialog.vue'
