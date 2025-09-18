// src/modules/clientes/contacto-cliente/index.ts

// Exportar todas las interfaces
export * from './interfaces/contacto-cliente.interface'

// Exportar servicios
export { ContactoClienteService } from './services/contacto-cliente.service'

// Exportar store
export { useContactoClienteStore } from './store/contacto-cliente.store'

// Exportar componentes
export { default as ContactoClienteCreateDialog } from './components/ContactoClienteCreateDialog.vue'
export { default as ContactoClienteEditDialog } from './components/ContactoClienteEditDialog.vue'
export { default as ContactoClienteViewDialog } from './components/ContactoClienteViewDialog.vue'

// Exportar páginas
export { default as ContactoClienteListPage } from './pages/ContactoClienteListPage.vue'

// Exportar composables
export { useContactoCliente } from './composables/useContactoCliente'
