// src/modules/actividades/index.ts

// Exportar todas las interfaces
export * from './interfaces/actividad.interface'

// Exportar servicios
export { ActividadesService } from './services/actividades.service'

// Exportar store
export { useActividadesStore } from './store/actividades.store'

// Exportar componentes
export { default as ActividadEditDialog } from './components/ActividadEditDialog.vue'
export { default as ActividadViewDialog } from './components/ActividadViewDialog.vue'
export { default as ActividadesFiltros } from './components/ActividadesFiltros.vue'

// Exportar páginas
export { default as ActividadesListPage } from './pages/ActividadesListPage.vue'
