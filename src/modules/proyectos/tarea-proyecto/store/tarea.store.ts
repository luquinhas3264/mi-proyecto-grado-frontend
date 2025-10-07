// src/modules/proyectos/tarea-proyecto/store/tarea.store.ts
import { defineStore } from 'pinia'
import type {
  Tarea,
  TareaListItem,
  TareaDetalle,
  CreateTareaDto,
  UpdateTareaDto,
  CambiarEstadoDto,
  AsignarResponsableDto,
  TareaEstadisticas,
  FiltrosTarea,
} from '../interfaces/tarea.interface'
import { EstadoTarea } from '../interfaces/tarea.interface'
import { TareaService } from '../services/tarea.service'

interface TareaState {
  tareas: TareaListItem[]
  tareaActual: TareaDetalle | null
  estadisticas: TareaEstadisticas | null
  misTareas: TareaListItem[]
  loading: boolean
  error: string | null
  filtros: FiltrosTarea
}

export const useTareaStore = defineStore('tarea', {
  state: (): TareaState => ({
    tareas: [],
    tareaActual: null,
    estadisticas: null,
    misTareas: [],
    loading: false,
    error: null,
    filtros: {},
  }),

  getters: {
    // Tareas filtradas por estado
    tareasPorEstado: (state) => {
      return (estado: EstadoTarea) => state.tareas.filter((t) => t.estado === estado)
    },

    // Estadísticas básicas
    totalTareas: (state) => state.tareas.length,

    // Tareas pendientes
    tareasPendientes: (state) => state.tareas.filter((t) => t.estado === EstadoTarea.PENDIENTE),

    // Tareas en progreso
    tareasEnProgreso: (state) => state.tareas.filter((t) => t.estado === EstadoTarea.EN_PROGRESO),

    // Tareas completadas
    tareasCompletadas: (state) => state.tareas.filter((t) => t.estado === EstadoTarea.COMPLETADA),

    // Tareas vencidas
    tareasVencidas: (state) => {
      return state.tareas.filter((tarea) => TareaService.estaVencida(tarea))
    },

    // Tareas próximas a vencer (menos de 3 días)
    tareasProximasAVencer: (state) => {
      return state.tareas.filter((tarea) => {
        if (!tarea.fechaLimite || tarea.estado === EstadoTarea.COMPLETADA) return false
        const dias = TareaService.calcularDiasRestantes(tarea.fechaLimite)
        return dias !== null && dias >= 0 && dias <= 3
      })
    },

    // Tareas por responsable
    tareasPorResponsable: (state) => {
      return state.tareas.reduce(
        (acc, tarea) => {
          const idResponsable = tarea.idUsuarioResponsable || 'sin-asignar'
          if (!acc[idResponsable]) {
            acc[idResponsable] = {
              usuarioResponsable: tarea.usuarioResponsable || null,
              tareas: [],
            }
          }
          acc[idResponsable].tareas.push(tarea)
          return acc
        },
        {} as Record<string, { usuarioResponsable: any; tareas: TareaListItem[] }>,
      )
    },

    // Tarea por ID
    obtenerTareaPorId: (state) => {
      return (id: string) => state.tareas.find((t) => t.idTarea === id)
    },

    // Resumen de estados
    resumenEstados: (state) => {
      const resumen = {
        [EstadoTarea.PENDIENTE]: 0,
        [EstadoTarea.EN_PROGRESO]: 0,
        [EstadoTarea.COMPLETADA]: 0,
      }

      state.tareas.forEach((tarea) => {
        resumen[tarea.estado]++
      })

      return resumen
    },

    // Porcentaje de progreso
    porcentajeProgreso: (state) => {
      if (state.tareas.length === 0) return 0
      const completadas = state.tareas.filter((t) => t.estado === EstadoTarea.COMPLETADA).length
      return Math.round((completadas / state.tareas.length) * 100)
    },

    // Tareas sin asignar
    tareasSinAsignar: (state) => {
      return state.tareas.filter((t) => !t.idUsuarioResponsable)
    },
  },

  actions: {
    // Cargar tareas de un proyecto
    async cargarTareasProyecto(idProyecto: string, filtros?: FiltrosTarea) {
      this.loading = true
      this.error = null
      this.filtros = filtros || {}

      try {
        this.tareas = await TareaService.obtenerPorProyecto(idProyecto, filtros)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar tareas'
        console.error('Error cargando tareas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cargar mis tareas
    async cargarMisTareas(idProyecto?: string, filtros?: FiltrosTarea) {
      this.loading = true
      this.error = null

      try {
        this.misTareas = await TareaService.obtenerMisTareas(idProyecto, filtros)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar mis tareas'
        console.error('Error cargando mis tareas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cargar estadísticas
    async cargarEstadisticas(idProyecto: string) {
      this.loading = true
      this.error = null

      try {
        this.estadisticas = await TareaService.obtenerEstadisticas(idProyecto)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar estadísticas'
        console.error('Error cargando estadísticas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Crear nueva tarea
    async crearTarea(dto: CreateTareaDto) {
      this.loading = true
      this.error = null

      try {
        const nuevaTarea = await TareaService.crear(dto)
        // Recargar tareas del proyecto
        await this.cargarTareasProyecto(dto.idProyecto, this.filtros)
        return nuevaTarea
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear tarea'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener tarea específica con detalles
    async obtenerTareaDetalle(id: string) {
      this.loading = true
      this.error = null

      try {
        const tarea = await TareaService.obtenerPorId(id)
        this.tareaActual = tarea
        return tarea
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar tarea'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Actualizar tarea
    async actualizarTarea(id: string, dto: UpdateTareaDto) {
      this.loading = true
      this.error = null

      try {
        const tareaActualizada = await TareaService.actualizar(id, dto)

        // Actualizar en la lista local
        const index = this.tareas.findIndex((t) => t.idTarea === id)
        if (index !== -1) {
          this.tareas[index] = {
            ...this.tareas[index],
            ...tareaActualizada,
          }
        }

        // Actualizar tarea actual si coincide
        if (this.tareaActual && this.tareaActual.idTarea === id) {
          this.tareaActual = {
            ...this.tareaActual,
            ...tareaActualizada,
          }
        }

        return tareaActualizada
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar tarea'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cambiar estado de tarea
    async cambiarEstado(id: string, estado: EstadoTarea) {
      this.loading = true
      this.error = null

      try {
        const tareaActualizada = await TareaService.cambiarEstado(id, { estado })

        // Actualizar en la lista local
        const index = this.tareas.findIndex((t) => t.idTarea === id)
        if (index !== -1) {
          this.tareas[index] = {
            ...this.tareas[index],
            estado,
          }
        }

        return tareaActualizada
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cambiar estado'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Asignar responsable
    async asignarResponsable(id: string, idUsuarioResponsable: string) {
      this.loading = true
      this.error = null

      try {
        const tareaActualizada = await TareaService.asignarResponsable(id, { idUsuarioResponsable })

        // Actualizar en la lista local
        const index = this.tareas.findIndex((t) => t.idTarea === id)
        if (index !== -1) {
          this.tareas[index] = {
            ...this.tareas[index],
            idUsuarioResponsable,
          }
        }

        return tareaActualizada
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al asignar responsable'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Eliminar tarea
    async eliminarTarea(id: string) {
      this.loading = true
      this.error = null

      try {
        const resultado = await TareaService.eliminar(id)

        // Remover de la lista local
        this.tareas = this.tareas.filter((t) => t.idTarea !== id)

        // Limpiar tarea actual si coincide
        if (this.tareaActual && this.tareaActual.idTarea === id) {
          this.tareaActual = null
        }

        return resultado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar tarea'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Limpiar estado
    limpiarEstado() {
      this.tareas = []
      this.tareaActual = null
      this.estadisticas = null
      this.misTareas = []
      this.error = null
      this.filtros = {}
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Limpiar tarea actual
    limpiarTareaActual() {
      this.tareaActual = null
    },
  },
})
