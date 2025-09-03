import { defineStore } from 'pinia'
import type { Rol, RolListItem, Permiso } from '../interfaces/rol.interface'
import { RolesService } from '../services/roles.service'

interface RolesState {
  roles: RolListItem[]
  rolActual: Rol | null
  permisosDisponibles: Permiso[]
  loading: boolean
  error: string | null
}

export const useRolesStore = defineStore('roles', {
  state: (): RolesState => ({
    roles: [],
    rolActual: null,
    permisosDisponibles: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalRoles: (state) => state.roles.length,

    rolesPorModulo: (state) => {
      // Agrupar permisos por módulo para análisis
      const modulos = state.permisosDisponibles.reduce(
        (acc, permiso) => {
          if (!acc[permiso.modulo]) acc[permiso.modulo] = []
          acc[permiso.modulo].push(permiso)
          return acc
        },
        {} as Record<string, Permiso[]>,
      )
      return modulos
    },

    // Obtener rol por ID
    getRolById: (state) => (idRol: string) => {
      return state.roles.find((rol) => rol.idRol === idRol)
    },

    // Verificar si existe un rol con cierto nombre
    existeRolConNombre: (state) => (nombre: string, excludeId?: string) => {
      return state.roles.some(
        (rol) => rol.nombre.toLowerCase() === nombre.toLowerCase() && rol.idRol !== excludeId,
      )
    },
  },

  actions: {
    // Cargar lista de roles
    async cargarRoles() {
      this.loading = true
      this.error = null
      try {
        this.roles = await RolesService.findAll()
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar roles'
        console.error('Error cargando roles:', error)
      } finally {
        this.loading = false
      }
    },

    // Cargar permisos disponibles
    async cargarPermisosDisponibles() {
      try {
        this.permisosDisponibles = await RolesService.getPermisosDisponibles()
      } catch (error: any) {
        console.error('Error cargando permisos disponibles:', error)
      }
    },

    // Crear nuevo rol
    async crearRol(dto: any) {
      this.loading = true
      this.error = null
      try {
        const nuevoRol = await RolesService.crear(dto)
        await this.cargarRoles() // Recargar lista
        return nuevoRol
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear rol'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener rol específico con permisos
    async obtenerRol(idRol: string) {
      this.loading = true
      this.error = null
      try {
        const rol = await RolesService.findById(idRol)
        this.rolActual = rol
        return rol
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar rol'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Actualizar rol
    async actualizarRol(idRol: string, dto: any) {
      this.loading = true
      this.error = null
      try {
        const rolActualizado = await RolesService.update(idRol, dto)
        await this.cargarRoles() // Recargar lista
        return rolActualizado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar rol'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Eliminar rol
    async eliminarRol(idRol: string) {
      this.loading = true
      this.error = null
      try {
        const rolEliminado = await RolesService.delete(idRol)
        await this.cargarRoles() // Recargar lista
        return rolEliminado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar rol'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Asignar permisos a un rol
    async asignarPermisos(idRol: string, permisosIds: string[]) {
      this.loading = true
      this.error = null
      try {
        const resultado = await RolesService.asignarPermisos(idRol, permisosIds)
        // Recargar el rol actual si coincide
        if (this.rolActual?.idRol === idRol) {
          await this.obtenerRol(idRol)
        }
        return resultado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al asignar permisos'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Limpiar estado
    limpiarEstado() {
      this.roles = []
      this.rolActual = null
      this.permisosDisponibles = []
      this.error = null
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Limpiar rol actual
    limpiarRolActual() {
      this.rolActual = null
    },
  },
})
