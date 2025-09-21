// src/modules/clientes/etiqueta-cliente/store/etiqueta-cliente.store.ts
import { defineStore } from 'pinia'
import type {
  EtiquetaCliente,
  EtiquetaClienteListItem,
  EtiquetaClienteDetalle,
  CreateEtiquetaClienteDto,
  UpdateEtiquetaClienteDto,
  ClienteEtiquetaAsignacion,
  EtiquetaClienteFilters,
} from '../interfaces/etiqueta-cliente.interface'
import { EtiquetaClienteService } from '../services/etiqueta-cliente.service'

interface EtiquetaClienteState {
  etiquetas: EtiquetaClienteListItem[]
  etiquetaActual: EtiquetaClienteDetalle | null
  asignaciones: Record<string, string[]> // idCliente -> array de idEtiquetas
  loading: boolean
  error: string | null
  filtros: EtiquetaClienteFilters
}

export const useEtiquetaClienteStore = defineStore('etiquetaCliente', {
  state: (): EtiquetaClienteState => ({
    etiquetas: [],
    etiquetaActual: null,
    asignaciones: {}, // Mapa de cliente -> etiquetas asignadas
    loading: false,
    error: null,
    filtros: {},
  }),

  getters: {
    // Estadísticas básicas
    totalEtiquetas: (state) => state.etiquetas.length,

    // Ordenar etiquetas por nombre
    etiquetasOrdenadas: (state) => {
      return [...state.etiquetas].sort((a, b) => a.nombre.localeCompare(b.nombre))
    },

    // Etiquetas más populares (simulado, necesitaría datos del backend)
    etiquetasMasUsadas: (state) => {
      return [...state.etiquetas]
        .sort((a, b) => (b.totalClientes || 0) - (a.totalClientes || 0))
        .slice(0, 5)
    },

    // Etiqueta por ID
    obtenerEtiquetaPorId: (state) => {
      return (id: string) => state.etiquetas.find((e) => e.idEtiqueta === id)
    },

    // Obtener etiquetas de un cliente específico
    obtenerEtiquetasDeCliente: (state) => {
      return (idCliente: string) => {
        const etiquetasIds = state.asignaciones[idCliente] || []
        return state.etiquetas.filter((e) => etiquetasIds.includes(e.idEtiqueta))
      }
    },

    // Obtener clientes que tienen una etiqueta específica
    obtenerClientesConEtiqueta: (state) => {
      return (idEtiqueta: string) => {
        return Object.entries(state.asignaciones)
          .filter(([, etiquetas]) => etiquetas.includes(idEtiqueta))
          .map(([idCliente]) => idCliente)
      }
    },

    // Verificar si un cliente tiene una etiqueta específica
    clienteTieneEtiqueta: (state) => {
      return (idCliente: string, idEtiqueta: string) => {
        const etiquetasCliente = state.asignaciones[idCliente] || []
        return etiquetasCliente.includes(idEtiqueta)
      }
    },
  },

  actions: {
    // Cargar todas las etiquetas
    async cargarEtiquetas() {
      this.loading = true
      this.error = null

      try {
        const etiquetas = await EtiquetaClienteService.obtenerTodas()
        this.etiquetas = etiquetas

        // Reconstruir asignaciones: idCliente -> array de idEtiquetas
        const asignaciones: Record<string, string[]> = {}
        etiquetas.forEach((etiqueta) => {
          if (etiqueta.clientes) {
            etiqueta.clientes.forEach((cliente) => {
              if (!asignaciones[cliente.idCliente]) asignaciones[cliente.idCliente] = []
              asignaciones[cliente.idCliente].push(etiqueta.idEtiqueta)
            })
          }
        })
        this.asignaciones = asignaciones
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar etiquetas'
        console.error('Error cargando etiquetas:', error)
      } finally {
        this.loading = false
      }
    },

    // Crear nueva etiqueta
    async crearEtiqueta(dto: CreateEtiquetaClienteDto) {
      this.loading = true
      this.error = null

      try {
        // Validar nombre único
        const esUnico = await EtiquetaClienteService.validarNombreUnico(dto.nombre)
        if (!esUnico) {
          throw new Error('Ya existe una etiqueta con ese nombre')
        }

        const nuevaEtiqueta = await EtiquetaClienteService.crear(dto)

        // Agregar a la lista local
        this.etiquetas.push(nuevaEtiqueta)

        return nuevaEtiqueta
      } catch (error: any) {
        this.error = error.message || error.response?.data?.message || 'Error al crear etiqueta'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener etiqueta específica con detalles
    async obtenerEtiquetaDetalle(id: string) {
      this.loading = true
      this.error = null

      try {
        const etiqueta = await EtiquetaClienteService.obtenerPorId(id)
        this.etiquetaActual = etiqueta
        return etiqueta
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar etiqueta'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Actualizar etiqueta
    async actualizarEtiqueta(id: string, dto: UpdateEtiquetaClienteDto) {
      this.loading = true
      this.error = null

      try {
        // Validar nombre único si se está actualizando el nombre
        if (dto.nombre) {
          const esUnico = await EtiquetaClienteService.validarNombreUnico(dto.nombre, id)
          if (!esUnico) {
            throw new Error('Ya existe una etiqueta con ese nombre')
          }
        }

        const etiquetaActualizada = await EtiquetaClienteService.actualizar(id, dto)

        // Actualizar en la lista local
        const index = this.etiquetas.findIndex((e) => e.idEtiqueta === id)
        if (index !== -1) {
          this.etiquetas[index] = etiquetaActualizada
        }

        // Actualizar etiqueta actual si coincide
        if (this.etiquetaActual && this.etiquetaActual.idEtiqueta === id) {
          this.etiquetaActual = {
            ...this.etiquetaActual,
            ...etiquetaActualizada,
          }
        }

        return etiquetaActualizada
      } catch (error: any) {
        this.error =
          error.message || error.response?.data?.message || 'Error al actualizar etiqueta'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Eliminar etiqueta (hard delete)
    async eliminarEtiqueta(id: string) {
      this.loading = true
      this.error = null

      try {
        await EtiquetaClienteService.eliminar(id)

        // Remover de la lista local
        this.etiquetas = this.etiquetas.filter((e) => e.idEtiqueta !== id)

        // Remover todas las asignaciones de esta etiqueta
        Object.keys(this.asignaciones).forEach((idCliente) => {
          this.asignaciones[idCliente] = this.asignaciones[idCliente].filter(
            (idEtiqueta) => idEtiqueta !== id,
          )
        })

        // Limpiar etiqueta actual si coincide
        if (this.etiquetaActual && this.etiquetaActual.idEtiqueta === id) {
          this.etiquetaActual = null
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar etiqueta'
        throw error
      } finally {
        this.loading = false
      }
    },
    // Asignar etiqueta a cliente
    async asignarEtiqueta(idCliente: string, idEtiqueta: string) {
      this.loading = true
      this.error = null

      try {
        await EtiquetaClienteService.asignarEtiqueta(idCliente, idEtiqueta)

        // Actualizar asignaciones locales
        if (!this.asignaciones[idCliente]) {
          this.asignaciones[idCliente] = []
        }

        if (!this.asignaciones[idCliente].includes(idEtiqueta)) {
          this.asignaciones[idCliente].push(idEtiqueta)
        }

        return { idCliente, idEtiqueta }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al asignar etiqueta'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Remover etiqueta de cliente
    async removerEtiqueta(idCliente: string, idEtiqueta: string) {
      this.loading = true
      this.error = null

      try {
        await EtiquetaClienteService.removerEtiqueta(idCliente, idEtiqueta)

        // Actualizar asignaciones locales
        if (this.asignaciones[idCliente]) {
          this.asignaciones[idCliente] = this.asignaciones[idCliente].filter(
            (id) => id !== idEtiqueta,
          )
        }

        return { idCliente, idEtiqueta }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al remover etiqueta'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Buscar etiquetas
    async buscarEtiquetas(termino: string) {
      this.loading = true
      this.error = null

      try {
        const etiquetas = await EtiquetaClienteService.buscar(termino)
        this.etiquetas = etiquetas
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al buscar etiquetas'
        console.error('Error buscando etiquetas:', error)
      } finally {
        this.loading = false
      }
    },

    // Cargar asignaciones de etiquetas para un cliente (simulado por ahora)
    cargarAsignacionesCliente(idCliente: string, etiquetasIds: string[]) {
      this.asignaciones[idCliente] = etiquetasIds
    },

    // Limpiar estado
    limpiarEstado() {
      this.etiquetas = []
      this.etiquetaActual = null
      this.asignaciones = {}
      this.error = null
      this.filtros = {}
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Limpiar etiqueta actual
    limpiarEtiquetaActual() {
      this.etiquetaActual = null
    },
  },
})
