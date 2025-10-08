// src/modules/actividades/services/actividades.service.ts

import axios from 'axios'
import type {
  Actividad,
  CreateActividadDto,
  UpdateActividadDto,
  FilterActividadDto,
} from '../interfaces/actividad.interface'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Configurar instancia de axios con interceptor
const api = axios.create({
  baseURL: `${API_URL}/actividades`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export class ActividadesService {
  /**
   * Obtener todas las actividades con filtros opcionales
   */
  static async findAll(filter?: FilterActividadDto): Promise<Actividad[]> {
    const params = new URLSearchParams()

    if (filter?.idUsuario) params.append('idUsuario', filter.idUsuario)
    if (filter?.idCliente) params.append('idCliente', filter.idCliente)
    if (filter?.idProyecto) params.append('idProyecto', filter.idProyecto)
    if (filter?.tipo) params.append('tipo', filter.tipo)
    if (filter?.fechaInicio) params.append('fechaInicio', filter.fechaInicio)
    if (filter?.fechaFin) params.append('fechaFin', filter.fechaFin)

    const response = await api.get('/', { params })
    return response.data
  }

  /**
   * Obtener las actividades del usuario actual
   */
  static async obtenerMisActividades(): Promise<Actividad[]> {
    const response = await api.get('/mias')
    return response.data
  }

  /**
   * Crear nueva actividad
   */
  static async crear(dto: CreateActividadDto): Promise<Actividad> {
    const response = await api.post('/', dto)
    return response.data
  }

  /**
   * Actualizar actividad existente
   */
  static async actualizar(idActividad: string, dto: UpdateActividadDto): Promise<Actividad> {
    const response = await api.patch(`/${idActividad}`, dto)
    return response.data
  }

  /**
   * Eliminar actividad
   */
  static async eliminar(idActividad: string): Promise<{ mensaje: string }> {
    const response = await api.delete(`/${idActividad}`)
    return response.data
  }

  /**
   * Obtener actividades por cliente
   */
  static async obtenerPorCliente(idCliente: string): Promise<Actividad[]> {
    return this.findAll({ idCliente })
  }

  /**
   * Obtener actividades por proyecto
   */
  static async obtenerPorProyecto(idProyecto: string): Promise<Actividad[]> {
    return this.findAll({ idProyecto })
  }

  /**
   * Obtener actividades por usuario
   */
  static async obtenerPorUsuario(idUsuario: string): Promise<Actividad[]> {
    return this.findAll({ idUsuario })
  }

  /**
   * Obtener actividades por rango de fechas
   */
  static async obtenerPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<Actividad[]> {
    return this.findAll({ fechaInicio, fechaFin })
  }

  /**
   * Eliminar actividades de forma masiva (por IDs o filtro)
   */
  static async eliminarMasivo(ids?: string[], filtro?: any): Promise<{ eliminadas: number }> {
    const response = await api.post('/eliminar-masivo', { ids, filtro })
    return response.data
  }
}
