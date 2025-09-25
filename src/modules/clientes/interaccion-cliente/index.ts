// src/modules/clientes/interaccion-cliente/index.ts

// Exportar todas las interfaces
export * from './interfaces/interaccion-cliente.interface'

// Exportar servicios
export { InteraccionClienteService } from './services/interaccion-cliente.service'

// Exportar store
export { useInteraccionClienteStore } from './store/interaccion-cliente.store'

// Exportar componentes
export { default as InteraccionClienteCreateDialog } from './components/InteraccionClienteCreateDialog.vue'
export { default as InteraccionClienteViewDialog } from './components/InteraccionClienteViewDialog.vue'

// Exportar páginas
export { default as InteraccionClienteListPage } from './pages/InteraccionClienteListPage.vue'

// Exportar composables
export { useInteraccionCliente } from './composables/useInteraccionCliente'
