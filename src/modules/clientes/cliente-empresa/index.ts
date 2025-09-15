// src/modules/clientes/cliente-empresa/index.ts

// Exportar todas las interfaces
export * from './interfaces/cliente-empresa.interface'

// Exportar servicios
export { ClienteEmpresaService } from './services/cliente-empresa.service'

// Exportar store
export { useClienteEmpresaStore } from './store/cliente-empresa.store'

// Exportar componentes
export { default as ClienteEmpresaCreateDialog } from './components/ClienteEmpresaCreateDialog.vue'
export { default as ClienteEmpresaEditDialog } from './components/ClienteEmpresaEditDialog.vue'
export { default as ClienteEmpresaViewDialog } from './components/ClienteEmpresaViewDialog.vue'

// Exportar páginas
export { default as ClienteEmpresaListPage } from './pages/ClienteEmpresaListPage.vue'
