// Exportar todas las interfaces
export * from './interfaces/rol.interface'

// Exportar servicios
export { RolesService } from './services/roles.service'

// Exportar store
export { useRolesStore } from './store/roles.store'

// Exportar componentes
export { default as RolCreateDialog } from './components/RolCreateDialog.vue'
export { default as RolEditDialog } from './components/RolEditDialog.vue'
export { default as RolViewDialog } from './components/RolViewDialog.vue'
export { default as RolPermisosDialog } from './components/RolPermisosDialog.vue'

// Exportar páginas
export { default as RolesListPage } from './pages/RolesListPage.vue'
