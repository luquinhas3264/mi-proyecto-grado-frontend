// src/modules/actividades/store/actividades.store.ts

import { defineStore } from 'pinia'
import type {
  Actividad,
  CreateActividadDto,
  UpdateActividadDto,
  FilterActividadDto,
  TipoActividad,
} from '../interfaces/actividad.interface'
import { ActividadesService } from '../services/actividades.service'

interface ActividadesState {
  actividades: Actividad[]
  misActividades: Actividad[]
  actividadActual: Actividad | null
  loading: boolean
  error: string | null
  filtrosActivos: FilterActividadDto
}

export const useActividadesStore = defineStore('actividades', {
  state: (): ActividadesState => ({
    actividades: [],
    misActividades: [],
    actividadActual: null,
    loading: false,
    error: null,
    filtrosActivos: {},
  }),

  getters: {
    // Total de actividades
    totalActividades: (state) => state.actividades.length,

    // Actividades agrupadas por tipo
    actividadesPorTipo: (state) => {
      return state.actividades.reduce(
        (acc, actividad) => {
          if (!acc[actividad.tipo]) acc[actividad.tipo] = []
          acc[actividad.tipo].push(actividad)
          return acc
        },
        {} as Record<TipoActividad, Actividad[]>,
      )
    },

    // Actividades agrupadas por fecha
    actividadesPorFecha: (state) => {
      return state.actividades.reduce(
        (acc, actividad) => {
          const fecha = actividad.fecha.split(' ')[0] // Obtener solo la fecha
          if (!acc[fecha]) acc[fecha] = []
          acc[fecha].push(actividad)
          return acc
        },
        {} as Record<string, Actividad[]>,
      )
    },

    // Actividades por usuario
    actividadesPorUsuario: (state) => {
      return state.actividades.reduce(
        (acc, actividad) => {
          if (!acc[actividad.idUsuario]) {
            acc[actividad.idUsuario] = {
              nombre: actividad.usuario?.nombre || 'Usuario desconocido',
              actividades: [],
            }
          }
          acc[actividad.idUsuario].actividades.push(actividad)
          return acc
        },
        {} as Record<string, { nombre: string; actividades: Actividad[] }>,
      )
    },

    // Actividades recientes (últimas 10)
    actividadesRecientes: (state) => {
      return [...state.actividades]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 10)
    },

    // Estadísticas de actividades
    estadisticas: (state) => {
      const total = state.actividades.length
      const porTipo = state.actividades.reduce(
        (acc, act) => {
          acc[act.tipo] = (acc[act.tipo] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const usuariosUnicos = new Set(state.actividades.map((a) => a.idUsuario)).size
      const clientesUnicos = new Set(state.actividades.map((a) => a.idCliente)).size
      const proyectosUnicos = new Set(
        state.actividades.filter((a) => a.idProyecto).map((a) => a.idProyecto),
      ).size

      return {
        total,
        porTipo,
        usuariosUnicos,
        clientesUnicos,
        proyectosUnicos,
      }
    },

    // Verificar si hay filtros activos
    tieneFiltrosActivos: (state) => {
      return Object.keys(state.filtrosActivos).length > 0
    },
  },

  actions: {
    /**
     * Cargar todas las actividades con filtros opcionales
     */
    async cargarActividades(filtros?: FilterActividadDto) {
      this.loading = true
      this.error = null
      this.filtrosActivos = filtros || {}

      try {
        this.actividades = await ActividadesService.findAll(filtros)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar actividades'
        console.error('Error cargando actividades:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Cargar mis actividades (del usuario actual)
     */
    async cargarMisActividades() {
      this.loading = true
      this.error = null

      try {
        this.misActividades = await ActividadesService.obtenerMisActividades()
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar tus actividades'
        console.error('Error cargando mis actividades:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Crear nueva actividad
     */
    async crearActividad(dto: CreateActividadDto) {
      this.loading = true
      this.error = null

      try {
        const nuevaActividad = await ActividadesService.crear(dto)
        this.actividades.unshift(nuevaActividad) // Agregar al inicio
        return nuevaActividad
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear actividad'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar actividad existente
     */
    async actualizarActividad(idActividad: string, dto: UpdateActividadDto) {
      this.loading = true
      this.error = null

      try {
        const actividadActualizada = await ActividadesService.actualizar(idActividad, dto)

        // Actualizar en el array
        const index = this.actividades.findIndex((a) => a.idActividad === idActividad)
        if (index !== -1) {
          this.actividades[index] = actividadActualizada
        }

        // Actualizar actividad actual si coincide
        if (this.actividadActual?.idActividad === idActividad) {
          this.actividadActual = actividadActualizada
        }

        return actividadActualizada
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar actividad'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar actividad
     */
    async eliminarActividad(idActividad: string) {
      this.loading = true
      this.error = null

      try {
        await ActividadesService.eliminar(idActividad)

        // Remover del array
        this.actividades = this.actividades.filter((a) => a.idActividad !== idActividad)

        // Limpiar actividad actual si coincide
        if (this.actividadActual?.idActividad === idActividad) {
          this.actividadActual = null
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar actividad'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar actividades de forma masiva (por IDs o filtro)
     */
    async eliminarActividadesMasivo(ids?: string[], filtro?: any) {
      this.loading = true
      this.error = null
      try {
        const { eliminadas } = await ActividadesService.eliminarMasivo(ids, filtro)
        // Si se eliminaron por IDs, filtrar el array local
        if (ids && ids.length > 0) {
          this.actividades = this.actividades.filter((a) => !ids.includes(a.idActividad))
        } else if (filtro) {
          // Si fue por filtro, recargar todas las actividades
          await this.cargarActividades(this.filtrosActivos)
        }
        return eliminadas
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar actividades'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Cargar actividades por cliente
     */
    async cargarPorCliente(idCliente: string) {
      return this.cargarActividades({ idCliente })
    },

    /**
     * Cargar actividades por proyecto
     */
    async cargarPorProyecto(idProyecto: string) {
      return this.cargarActividades({ idProyecto })
    },

    /**
     * Cargar actividades por usuario
     */
    async cargarPorUsuario(idUsuario: string) {
      return this.cargarActividades({ idUsuario })
    },

    /**
     * Aplicar filtros
     */
    async aplicarFiltros(filtros: FilterActividadDto) {
      return this.cargarActividades(filtros)
    },

    /**
     * Limpiar filtros
     */
    async limpiarFiltros() {
      this.filtrosActivos = {}
      return this.cargarActividades()
    },

    /**
     * Establecer actividad actual
     */
    setActividadActual(actividad: Actividad | null) {
      this.actividadActual = actividad
    },

    /**
     * Limpiar estado
     */
    limpiarEstado() {
      this.actividades = []
      this.misActividades = []
      this.actividadActual = null
      this.error = null
      this.filtrosActivos = {}
    },

    /**
     * Limpiar error
     */
    limpiarError() {
      this.error = null
    },
  },
})
