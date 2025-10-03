// src/modules/proyectos/tarea-proyecto/index.ts

// Exportar interfaces
export * from './interfaces/tarea.interface'

// Exportar servicios
export { TareaService } from './services/tarea.service'

// Exportar store
export { useTareaStore } from './store/tarea.store'

// Exportar componentes
export { default as TareaCard } from './components/TareaCard.vue'
export { default as TareaCreateDialog } from './components/TareaCreateDialog.vue'
export { default as TareaEditDialog } from './components/TareaEditDialog.vue'
