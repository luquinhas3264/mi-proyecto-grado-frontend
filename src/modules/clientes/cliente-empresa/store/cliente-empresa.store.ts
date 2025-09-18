// src/modules/clientes/cliente-empresa/store/cliente-empresa.store.ts
import { defineStore } from 'pinia'
import type {
  ClienteEmpresa,
  ClienteEmpresaListItem,
  ClienteEmpresaDetalle,
  CreateClienteEmpresaDto,
  UpdateClienteEmpresaDto,
  ClienteEmpresaFilters,
} from '../interfaces/cliente-empresa.interface'
import { ClienteEmpresaService } from '../services/cliente-empresa.service'

interface ClienteEmpresaState {
  clientes: ClienteEmpresaListItem[]
  clienteActual: ClienteEmpresaDetalle | null
  loading: boolean
  error: string | null
  filtros: ClienteEmpresaFilters
}

export const useClienteEmpresaStore = defineStore('clienteEmpresa', {
  state: (): ClienteEmpresaState => ({
    clientes: [],
    clienteActual: null,
    loading: false,
    error: null,
    filtros: {},
  }),

  getters: {
    // Clientes filtrados por estado
    clientesActivos: (state) => state.clientes.filter((c) => c.activo),
    clientesInactivos: (state) => state.clientes.filter((c) => !c.activo),

    // Estadísticas básicas
    totalClientes: (state) => state.clientes.length,

    // Agrupar por rubro
    clientesPorRubro: (state) => {
      return state.clientes.reduce(
        (acc, cliente) => {
          if (!acc[cliente.rubro]) {
            acc[cliente.rubro] = []
          }
          acc[cliente.rubro].push(cliente)
          return acc
        },
        {} as Record<string, ClienteEmpresaListItem[]>,
      )
    },

    // Rubros únicos
    rubrosUnicos: (state) => {
      const rubros = [...new Set(state.clientes.map((c) => c.rubro))]
      return rubros.sort()
    },

    // Clientes con proyectos activos
    clientesConProyectos: (state) => {
      return state.clientes.filter((cliente) => {
        // Verificar si el cliente actual tiene proyectos cuando está cargado
        if (state.clienteActual && state.clienteActual.idCliente === cliente.idCliente) {
          return state.clienteActual.proyectos.some((p) => p.activo)
        }
        return false // Por defecto false si no tenemos info de proyectos
      })
    },

    // Clientes sin contactos
    clientesSinContactos: (state) => {
      return state.clientes.filter((c) => c.contactos.length === 0)
    },

    // Cliente por ID
    obtenerClientePorId: (state) => {
      return (id: string) => state.clientes.find((c) => c.idCliente === id)
    },
  },

  actions: {
    // Cargar lista de clientes
    async cargarClientes(filtros?: ClienteEmpresaFilters) {
      this.loading = true
      this.error = null
      this.filtros = filtros || {}

      try {
        this.clientes = await ClienteEmpresaService.obtenerTodos(filtros)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar clientes'
        console.error('Error cargando clientes:', error)
      } finally {
        this.loading = false
      }
    },

    // Crear nuevo cliente
    async crearCliente(dto: CreateClienteEmpresaDto) {
      this.loading = true
      this.error = null

      try {
        const nuevoCliente = await ClienteEmpresaService.crear(dto)
        // Recargar la lista para obtener datos completos
        await this.cargarClientes(this.filtros)
        return nuevoCliente
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear cliente'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener cliente específico con detalles
    async obtenerClienteDetalle(id: string) {
      this.loading = true
      this.error = null

      try {
        const cliente = await ClienteEmpresaService.obtenerPorId(id)
        this.clienteActual = cliente
        return cliente
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar cliente'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Actualizar cliente
    async actualizarCliente(id: string, dto: UpdateClienteEmpresaDto) {
      this.loading = true
      this.error = null

      try {
        const clienteActualizado = await ClienteEmpresaService.actualizar(id, dto)

        // Actualizar en la lista local
        const index = this.clientes.findIndex((c) => c.idCliente === id)
        if (index !== -1) {
          // Mantener las relaciones existentes y actualizar los datos básicos
          this.clientes[index] = {
            ...this.clientes[index],
            ...clienteActualizado,
          }
        }

        // Actualizar cliente actual si coincide
        if (this.clienteActual && this.clienteActual.idCliente === id) {
          this.clienteActual = {
            ...this.clienteActual,
            ...clienteActualizado,
          }
        }

        return clienteActualizado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar cliente'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Eliminar cliente (soft delete)
    async eliminarCliente(id: string) {
      this.loading = true
      this.error = null

      try {
        const clienteEliminado = await ClienteEmpresaService.eliminar(id)

        // Actualizar estado local - el cliente se marca como inactivo
        const index = this.clientes.findIndex((c) => c.idCliente === id)
        if (index !== -1) {
          this.clientes[index] = {
            ...this.clientes[index],
            activo: false,
          }
        }

        return clienteEliminado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar cliente'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Alternar estado activo/inactivo
    async toggleEstadoCliente(id: string) {
      const cliente = this.clientes.find((c) => c.idCliente === id)
      if (cliente) {
        await this.actualizarCliente(id, {
          razonSocial: cliente.razonSocial,
          rubro: cliente.rubro,
          correo: cliente.correo,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          activo: !cliente.activo,
        })

        // Recargar para obtener el estado actualizado desde el servidor
        await this.cargarClientes(this.filtros)
      }
    },

    // Buscar clientes
    async buscarClientes(termino: string) {
      this.loading = true
      this.error = null

      try {
        this.clientes = await ClienteEmpresaService.buscar(termino)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al buscar clientes'
        console.error('Error buscando clientes:', error)
      } finally {
        this.loading = false
      }
    },

    // Limpiar estado
    limpiarEstado() {
      this.clientes = []
      this.clienteActual = null
      this.error = null
      this.filtros = {}
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Limpiar cliente actual
    limpiarClienteActual() {
      this.clienteActual = null
    },
  },
})
