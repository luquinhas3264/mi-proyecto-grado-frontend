// src/modules/proyectos/nota-proyecto/services/nota.service.ts
import axios from 'axios'
import type {
  NotaProyecto,
  CreateNotaProyectoDto,
  UpdateNotaProyectoDto,
  NotaEliminacionRespuesta,
} from '../interfaces/nota.interface'

const API_URL = 'http://localhost:3000/notas-proyecto'

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

export class NotaProyectoService {
  /**
   * Crear una nueva nota en un proyecto
   */
  static async crear(idProyecto: string, dto: CreateNotaProyectoDto): Promise<NotaProyecto> {
    const response = await api.post(`/proyectos/${idProyecto}/notas`, dto)
    return response.data
  }

  /**
   * Listar todas las notas de un proyecto
   */
  static async listarPorProyecto(idProyecto: string): Promise<NotaProyecto[]> {
    const response = await api.get(`/proyectos/${idProyecto}/notas`)
    return response.data
  }

  /**
   * Actualizar una nota específica
   */
  static async actualizar(idNota: string, dto: UpdateNotaProyectoDto): Promise<NotaProyecto> {
    const response = await api.patch(`/notas-proyecto/${idNota}`, dto)
    return response.data
  }

  /**
   * Eliminar una nota específica
   */
  static async eliminar(idNota: string): Promise<NotaEliminacionRespuesta> {
    const response = await api.delete(`/notas-proyecto/${idNota}`)
    return response.data
  }

  /**
   * Buscar notas por contenido (búsqueda local)
   */
  static async buscar(idProyecto: string, termino: string): Promise<NotaProyecto[]> {
    const notas = await this.listarPorProyecto(idProyecto)

    if (!termino.trim()) {
      return notas
    }

    const terminoLower = termino.toLowerCase()
    return notas.filter((nota) => nota.contenido.toLowerCase().includes(terminoLower))
  }

  /**
   * Obtener notas recientes (últimos 7 días)
   */
  static async obtenerRecientes(idProyecto: string): Promise<NotaProyecto[]> {
    const notas = await this.listarPorProyecto(idProyecto)
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)

    return notas.filter((nota) => new Date(nota.fecha) >= hace7Dias)
  }

  /**
   * Obtener notas por rango de fechas
   */
  static async obtenerPorRangoFechas(
    idProyecto: string,
    fechaDesde: string,
    fechaHasta: string,
  ): Promise<NotaProyecto[]> {
    const notas = await this.listarPorProyecto(idProyecto)
    const desde = new Date(fechaDesde)
    const hasta = new Date(fechaHasta)

    return notas.filter((nota) => {
      const fechaNota = new Date(nota.fecha)
      return fechaNota >= desde && fechaNota <= hasta
    })
  }

  /**
   * Contar notas de un proyecto
   */
  static async contarNotas(idProyecto: string): Promise<number> {
    const notas = await this.listarPorProyecto(idProyecto)
    return notas.length
  }

  /**
   * Obtener nota más reciente de un proyecto
   */
  static async obtenerMasReciente(idProyecto: string): Promise<NotaProyecto | null> {
    const notas = await this.listarPorProyecto(idProyecto)

    if (notas.length === 0) return null

    return notas.reduce((masReciente, nota) => {
      return new Date(nota.fecha) > new Date(masReciente.fecha) ? nota : masReciente
    })
  }

  /**
   * Obtener nota más antigua de un proyecto
   */
  static async obtenerMasAntigua(idProyecto: string): Promise<NotaProyecto | null> {
    const notas = await this.listarPorProyecto(idProyecto)

    if (notas.length === 0) return null

    return notas.reduce((masAntigua, nota) => {
      return new Date(nota.fecha) < new Date(masAntigua.fecha) ? nota : masAntigua
    })
  }
}
