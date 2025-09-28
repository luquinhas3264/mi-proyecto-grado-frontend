// src/modules/proyectos/proyecto/index.ts

// Interfaces
export * from './interfaces/proyecto.interface'

// Services
export { ProyectoService } from './services/proyecto.service'

// Store
export { useProyectoStore } from './store/proyecto.store'

// Composables
export { useProyecto } from './composables/useProyecto'

// Components
export { default as ProyectoCreateDialog } from './components/ProyectoCreateDialog.vue'
export { default as ProyectoEditDialog } from './components/ProyectoEditDialog.vue'
export { default as ProyectoViewDialog } from './components/ProyectoViewDialog.vue'

// Pages
export { default as ProyectoListPage } from './pages/ProyectoListPage.vue'
