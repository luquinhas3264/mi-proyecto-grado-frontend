// src/modules/proyectos/proyecto/store/proyecto.store.ts
import { defineStore } from 'pinia'
import type {
  Proyecto,
  ProyectoListItem,
  ProyectoDetalle,
  CreateProyectoDto,
  UpdateProyectoDto,
  ProyectoEstadisticas,
  ProyectoFilters,
} from '../interfaces/proyecto.interface'
import { EstadoProyecto } from '../interfaces/proyecto.interface'
import { ProyectoService } from '../services/proyecto.service'

interface ProyectoState {
  proyectos: ProyectoListItem[]
  proyectoActual: ProyectoDetalle | null
  estadisticas: ProyectoEstadisticas | null
  loading: boolean
  error: string | null
  filtros: ProyectoFilters
}

export const useProyectoStore = defineStore('proyecto', {
  state: (): ProyectoState => ({
    proyectos: [],
    proyectoActual: null,
    estadisticas: null,
    loading: false,
    error: null,
    filtros: {},
  }),

  getters: {
    // Proyectos filtrados por estado
    proyectosPorEstado: (state) => {
      return (estado: EstadoProyecto) => state.proyectos.filter((p) => p.estado === estado)
    },

    // Estadísticas básicas
    totalProyectos: (state) => state.proyectos.length,

    // Proyectos activos (no finalizados)
    proyectosActivos: (state) =>
      state.proyectos.filter((p) => p.estado !== EstadoProyecto.FINALIZADO),

    // Proyectos finalizados
    proyectosFinalizados: (state) =>
      state.proyectos.filter((p) => p.estado === EstadoProyecto.FINALIZADO),

    // Proyectos por cliente
    proyectosPorCliente: (state) => {
      return state.proyectos.reduce(
        (acc, proyecto) => {
          if (!acc[proyecto.idCliente]) {
            acc[proyecto.idCliente] = {
              cliente: proyecto.cliente,
              proyectos: [],
            }
          }
          acc[proyecto.idCliente].proyectos.push(proyecto)
          return acc
        },
        {} as Record<string, { cliente: any; proyectos: ProyectoListItem[] }>,
      )
    },

    // Proyectos próximos a vencer
    proyectosProximosAVencer: (state) =>
      state.proyectos.filter((p) => p.diasRestantes <= 7 && p.diasRestantes >= 0),

    // Proyectos atrasados
    proyectosAtrasados: (state) => state.proyectos.filter((p) => p.estaAtrasado),

    // Proyecto por ID
    obtenerProyectoPorId: (state) => {
      return (id: string) => state.proyectos.find((p) => p.idProyecto === id)
    },

    // Clientes únicos con proyectos
    clientesConProyectos: (state) => {
      const clientesMap = new Map()
      state.proyectos.forEach((proyecto) => {
        if (!clientesMap.has(proyecto.idCliente)) {
          clientesMap.set(proyecto.idCliente, {
            id: proyecto.idCliente,
            razonSocial: proyecto.cliente.razonSocial,
            rubro: proyecto.cliente.rubro,
            totalProyectos: 0,
            proyectosActivos: 0,
          })
        }
        const cliente = clientesMap.get(proyecto.idCliente)
        cliente.totalProyectos++
        if (proyecto.estado !== EstadoProyecto.FINALIZADO) {
          cliente.proyectosActivos++
        }
      })
      return Array.from(clientesMap.values())
    },

    // Resumen de estados
    resumenEstados: (state) => {
      const resumen = {
        [EstadoProyecto.PLANEADO]: 0,
        [EstadoProyecto.EN_PROGRESO]: 0,
        [EstadoProyecto.FINALIZADO]: 0,
      }

      state.proyectos.forEach((proyecto) => {
        resumen[proyecto.estado]++
      })

      return resumen
    },
  },

  actions: {
    // Cargar lista de proyectos
    async cargarProyectos(filtros?: ProyectoFilters) {
      this.loading = true
      this.error = null
      this.filtros = filtros || {}

      try {
        this.proyectos = await ProyectoService.obtenerTodos(filtros)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar proyectos'
        console.error('Error cargando proyectos:', error)
      } finally {
        this.loading = false
      }
    },

    // Cargar estadísticas
    async cargarEstadisticas(clienteId?: string) {
      this.loading = true
      this.error = null

      try {
        this.estadisticas = await ProyectoService.obtenerEstadisticas(clienteId)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar estadísticas'
        console.error('Error cargando estadísticas:', error)
      } finally {
        this.loading = false
      }
    },

    // Crear nuevo proyecto
    async crearProyecto(dto: CreateProyectoDto) {
      this.loading = true
      this.error = null

      try {
        const nuevoProyecto = await ProyectoService.crear(dto)
        // Recargar la lista para obtener datos completos
        await this.cargarProyectos(this.filtros)
        return nuevoProyecto
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear proyecto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener proyecto específico con detalles
    async obtenerProyectoDetalle(id: string) {
      this.loading = true
      this.error = null

      try {
        const proyecto = await ProyectoService.obtenerPorId(id)
        this.proyectoActual = proyecto
        return proyecto
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar proyecto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Actualizar proyecto
    async actualizarProyecto(id: string, dto: UpdateProyectoDto) {
      this.loading = true
      this.error = null

      try {
        const proyectoActualizado = await ProyectoService.actualizar(id, dto)

        // Actualizar en la lista local
        const index = this.proyectos.findIndex((p) => p.idProyecto === id)
        if (index !== -1) {
          // Mantener las propiedades adicionales de la lista
          this.proyectos[index] = {
            ...this.proyectos[index],
            ...proyectoActualizado,
          }
        }

        // Actualizar proyecto actual si coincide
        if (this.proyectoActual && this.proyectoActual.idProyecto === id) {
          this.proyectoActual = {
            ...this.proyectoActual,
            ...proyectoActualizado,
          }
        }

        return proyectoActualizado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar proyecto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Eliminar proyecto
    async eliminarProyecto(id: string) {
      this.loading = true
      this.error = null

      try {
        const resultado = await ProyectoService.eliminar(id)

        // Remover de la lista local
        this.proyectos = this.proyectos.filter((p) => p.idProyecto !== id)

        // Limpiar proyecto actual si coincide
        if (this.proyectoActual && this.proyectoActual.idProyecto === id) {
          this.proyectoActual = null
        }

        return resultado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar proyecto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Buscar proyectos
    async buscarProyectos(termino: string, clienteId?: string) {
      this.loading = true
      this.error = null

      try {
        this.proyectos = await ProyectoService.buscar(termino, clienteId)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al buscar proyectos'
        console.error('Error buscando proyectos:', error)
      } finally {
        this.loading = false
      }
    },

    // Cambiar estado de proyecto
    async cambiarEstadoProyecto(id: string, nuevoEstado: EstadoProyecto) {
      const proyecto = this.proyectos.find((p) => p.idProyecto === id)
      if (proyecto) {
        await this.actualizarProyecto(id, { estado: nuevoEstado })
      }
    },

    // Limpiar estado
    limpiarEstado() {
      this.proyectos = []
      this.proyectoActual = null
      this.estadisticas = null
      this.error = null
      this.filtros = {}
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Limpiar proyecto actual
    limpiarProyectoActual() {
      this.proyectoActual = null
    },
  },
})
