// src/modules/proyectos/tarea-proyecto/services/tarea.service.ts
import axios from 'axios'
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
  TareaEliminacionRespuesta,
} from '../interfaces/tarea.interface'

const API_URL = 'http://localhost:3000/tareas'

// Configurar interceptor para incluir token automáticamente
const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export class TareaService {
  // Crear nueva tarea
  static async crear(dto: CreateTareaDto): Promise<Tarea> {
    const response = await api.post('/', dto)
    return response.data
  }

  // Obtener tareas de un proyecto con filtros opcionales
  static async obtenerPorProyecto(
    idProyecto: string,
    filtros?: FiltrosTarea,
  ): Promise<TareaListItem[]> {
    const params = new URLSearchParams()

    if (filtros?.estado) params.append('estado', filtros.estado)
    if (filtros?.idUsuarioResponsable)
      params.append('idUsuarioResponsable', filtros.idUsuarioResponsable)
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda)
    if (filtros?.fechaLimiteDesde) params.append('fechaLimiteDesde', filtros.fechaLimiteDesde)
    if (filtros?.fechaLimiteHasta) params.append('fechaLimiteHasta', filtros.fechaLimiteHasta)
    if (filtros?.vencidas !== undefined) params.append('vencidas', String(filtros.vencidas))
    if (filtros?.orderBy) params.append('orderBy', filtros.orderBy)
    if (filtros?.orderDirection) params.append('orderDirection', filtros.orderDirection)

    const url = params.toString()
      ? `/proyecto/${idProyecto}?${params.toString()}`
      : `/proyecto/${idProyecto}`
    const response = await api.get(url)
    return response.data
  }

  // Obtener tareas asignadas al usuario actual
  static async obtenerMisTareas(filtros?: FiltrosTarea): Promise<TareaListItem[]> {
    const params = new URLSearchParams()

    if (filtros?.estado) params.append('estado', filtros.estado)
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda)
    if (filtros?.fechaLimiteDesde) params.append('fechaLimiteDesde', filtros.fechaLimiteDesde)
    if (filtros?.fechaLimiteHasta) params.append('fechaLimiteHasta', filtros.fechaLimiteHasta)
    if (filtros?.vencidas !== undefined) params.append('vencidas', String(filtros.vencidas))
    if (filtros?.orderBy) params.append('orderBy', filtros.orderBy)
    if (filtros?.orderDirection) params.append('orderDirection', filtros.orderDirection)

    const url = params.toString() ? `/mis-tareas?${params.toString()}` : '/mis-tareas'
    const response = await api.get(url)
    return response.data
  }

  // Obtener estadísticas de tareas de un proyecto
  static async obtenerEstadisticas(idProyecto: string): Promise<TareaEstadisticas> {
    const response = await api.get(`/estadisticas/proyecto/${idProyecto}`)
    return response.data
  }

  // Obtener tarea específica por ID
  static async obtenerPorId(id: string): Promise<TareaDetalle> {
    const response = await api.get(`/${id}`)
    return response.data
  }

  // Actualizar tarea
  static async actualizar(id: string, dto: UpdateTareaDto): Promise<Tarea> {
    const response = await api.patch(`/${id}`, dto)
    return response.data
  }

  // Cambiar estado de tarea
  static async cambiarEstado(id: string, dto: CambiarEstadoDto): Promise<Tarea> {
    const response = await api.patch(`/${id}/estado`, dto)
    return response.data
  }

  // Asignar responsable a tarea
  static async asignarResponsable(id: string, dto: AsignarResponsableDto): Promise<Tarea> {
    const response = await api.patch(`/${id}/responsable`, dto)
    return response.data
  }

  // Eliminar tarea
  static async eliminar(id: string): Promise<TareaEliminacionRespuesta> {
    const response = await api.delete(`/${id}`)
    return response.data
  }

  // Métodos auxiliares para cálculos locales

  // Verificar si una tarea está vencida
  static estaVencida(tarea: TareaListItem): boolean {
    if (!tarea.fechaLimite) return false
    if (tarea.estado === 'COMPLETADA') return false
    return new Date(tarea.fechaLimite) < new Date()
  }

  // Calcular días restantes
  static calcularDiasRestantes(fechaLimite: string | null): number | null {
    if (!fechaLimite) return null
    const hoy = new Date()
    const limite = new Date(fechaLimite)
    const diferencia = limite.getTime() - hoy.getTime()
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  }

  // Ordenar tareas localmente
  static ordenarTareas(
    tareas: TareaListItem[],
    orderBy: FiltrosTarea['orderBy'] = 'creadoEn',
    orderDirection: FiltrosTarea['orderDirection'] = 'desc',
  ): TareaListItem[] {
    return [...tareas].sort((a, b) => {
      let valorA: any
      let valorB: any

      switch (orderBy) {
        case 'nombre':
          valorA = a.nombre.toLowerCase()
          valorB = b.nombre.toLowerCase()
          break
        case 'fechaLimite':
          valorA = a.fechaLimite ? new Date(a.fechaLimite).getTime() : Infinity
          valorB = b.fechaLimite ? new Date(b.fechaLimite).getTime() : Infinity
          break
        case 'estado':
          valorA = a.estado
          valorB = b.estado
          break
        case 'creadoEn':
        default:
          valorA = new Date(a.creadoEn).getTime()
          valorB = new Date(b.creadoEn).getTime()
          break
      }

      if (valorA < valorB) return orderDirection === 'asc' ? -1 : 1
      if (valorA > valorB) return orderDirection === 'asc' ? 1 : -1
      return 0
    })
  }
}
