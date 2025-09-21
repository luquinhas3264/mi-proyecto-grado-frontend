// src/modules/clientes/etiqueta-cliente/index.ts

// Exportar todas las interfaces
export * from './interfaces/etiqueta-cliente.interface'

// Exportar servicios
export { EtiquetaClienteService } from './services/etiqueta-cliente.service'

// Exportar store
export { useEtiquetaClienteStore } from './store/etiqueta-cliente.store'

// Exportar componentes
export { default as EtiquetaClienteCreateDialog } from './components/EtiquetaClienteCreateDialog.vue'
export { default as EtiquetaClienteEditDialog } from './components/EtiquetaClienteEditDialog.vue'
export { default as EtiquetaClienteViewDialog } from './components/EtiquetaClienteViewDialog.vue'

// Exportar páginas
export { default as EtiquetaClienteListPage } from './pages/EtiquetaClienteListPage.vue'

// Exportar composables
export { useEtiquetaCliente } from './composables/useEtiquetaCliente'
