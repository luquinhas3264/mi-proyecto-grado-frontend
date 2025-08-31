import { defineStore } from 'pinia'
import type { Usuario, UsuarioListItem } from '../interfaces/usuario.interface'
import { UsuariosService } from '../services/usuarios.service'

interface UsuariosState {
  usuarios: UsuarioListItem[]
  usuarioActual: Usuario | null
  loading: boolean
  error: string | null
}

export const useUsuariosStore = defineStore('usuarios', {
  state: (): UsuariosState => ({
    usuarios: [],
    usuarioActual: null,
    loading: false,
    error: null,
  }),

  getters: {
    usuariosActivos: (state) => state.usuarios.filter((u) => u.activo),
    usuariosInactivos: (state) => state.usuarios.filter((u) => !u.activo),
    totalUsuarios: (state) => state.usuarios.length,
    usuariosPorRol: (state) => {
      const grupos = state.usuarios.reduce(
        (acc, usuario) => {
          const rol = usuario.rol.nombre
          if (!acc[rol]) acc[rol] = []
          acc[rol].push(usuario)
          return acc
        },
        {} as Record<string, UsuarioListItem[]>,
      )
      return grupos
    },
  },

  actions: {
    // Cargar lista de usuarios
    async cargarUsuarios() {
      this.loading = true
      this.error = null
      try {
        this.usuarios = await UsuariosService.findAll()
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar usuarios'
        console.error('Error cargando usuarios:', error)
      } finally {
        this.loading = false
      }
    },

    // Crear nuevo usuario
    async crearUsuario(dto: any) {
      this.loading = true
      this.error = null
      try {
        const nuevoUsuario = await UsuariosService.crear(dto)
        // Recargar la lista para obtener datos completos con rol
        await this.cargarUsuarios()
        return nuevoUsuario
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear usuario'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener usuario específico
    async obtenerUsuario(id: string) {
      this.loading = true
      this.error = null
      try {
        const usuario = await UsuariosService.findById(id)
        this.usuarioActual = usuario
        return usuario
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar usuario'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Actualizar usuario
    async actualizarUsuario(id: string, dto: any) {
      this.loading = true
      this.error = null
      try {
        const usuarioActualizado = await UsuariosService.update(id, dto)
        // Actualizar en la lista local
        const index = this.usuarios.findIndex((u) => u.idUsuario === id)
        if (index !== -1) {
          // Recargar la lista para obtener datos completos
          await this.cargarUsuarios()
        }
        return usuarioActualizado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar usuario'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Alternar estado activo/inactivo
    async toggleEstadoUsuario(id: string) {
      const usuario = this.usuarios.find((u) => u.idUsuario === id)
      if (usuario) {
        await this.actualizarUsuario(id, { activo: !usuario.activo })
      }
    },

    // Limpiar estado
    limpiarEstado() {
      this.usuarios = []
      this.usuarioActual = null
      this.error = null
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },
  },
})
