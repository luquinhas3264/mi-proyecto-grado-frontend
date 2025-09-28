// src/modules/proyectos/proyecto/services/proyecto.service.ts
import axios from 'axios'
import type {
  Proyecto,
  ProyectoListItem,
  ProyectoDetalle,
  CreateProyectoDto,
  UpdateProyectoDto,
  ProyectoEstadisticas,
  ProyectoFilters,
  ProyectoEliminacionRespuesta,
} from '../interfaces/proyecto.interface'

const API_URL = 'http://localhost:3000/proyectos'

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

export class ProyectoService {
  // Crear nuevo proyecto
  static async crear(dto: CreateProyectoDto): Promise<Proyecto> {
    const response = await api.post('/', dto)
    return response.data
  }

  // Obtener lista de todos los proyectos
  static async obtenerTodos(filters?: ProyectoFilters): Promise<ProyectoListItem[]> {
    const params = new URLSearchParams()

    if (filters?.clienteId) {
      params.append('clienteId', filters.clienteId)
    }

    const url = params.toString() ? `/?${params.toString()}` : '/'
    const response = await api.get(url)
    return response.data
  }

  // Obtener estadísticas de proyectos
  static async obtenerEstadisticas(clienteId?: string): Promise<ProyectoEstadisticas> {
    const params = new URLSearchParams()

    if (clienteId) {
      params.append('clienteId', clienteId)
    }

    const url = params.toString() ? `/estadisticas?${params.toString()}` : '/estadisticas'
    const response = await api.get(url)
    return response.data
  }

  // Obtener proyecto específico por ID con detalles completos
  static async obtenerPorId(id: string): Promise<ProyectoDetalle> {
    const response = await api.get(`/${id}`)
    return response.data
  }

  // Actualizar proyecto específico
  static async actualizar(id: string, dto: UpdateProyectoDto): Promise<Proyecto> {
    const response = await api.patch(`/${id}`, dto)
    return response.data
  }

  // Eliminar proyecto (soft delete)
  static async eliminar(id: string): Promise<ProyectoEliminacionRespuesta> {
    const response = await api.delete(`/${id}`)
    return response.data
  }

  // Métodos auxiliares para filtros y búsquedas locales
  static async buscar(termino: string, clienteId?: string): Promise<ProyectoListItem[]> {
    const proyectos = await this.obtenerTodos({ clienteId })

    if (!termino.trim()) {
      return proyectos
    }

    const terminoLower = termino.toLowerCase()
    return proyectos.filter(
      (proyecto) =>
        proyecto.nombre.toLowerCase().includes(terminoLower) ||
        proyecto.descripcion?.toLowerCase().includes(terminoLower) ||
        proyecto.cliente.razonSocial.toLowerCase().includes(terminoLower),
    )
  }

  // Obtener proyectos por estado
  static async obtenerPorEstado(estado: string, clienteId?: string): Promise<ProyectoListItem[]> {
    const proyectos = await this.obtenerTodos({ clienteId })
    return proyectos.filter((proyecto) => proyecto.estado === estado)
  }

  // Obtener proyectos próximos a vencer (menos de 7 días)
  static async obtenerProximosAVencer(clienteId?: string): Promise<ProyectoListItem[]> {
    const proyectos = await this.obtenerTodos({ clienteId })
    return proyectos.filter(
      (proyecto) => proyecto.diasRestantes <= 7 && proyecto.diasRestantes >= 0,
    )
  }

  // Obtener proyectos atrasados
  static async obtenerAtrasados(clienteId?: string): Promise<ProyectoListItem[]> {
    const proyectos = await this.obtenerTodos({ clienteId })
    return proyectos.filter((proyecto) => proyecto.estaAtrasado)
  }

  // Obtener proyectos de un cliente específico
  static async obtenerPorCliente(clienteId: string): Promise<ProyectoListItem[]> {
    return this.obtenerTodos({ clienteId })
  }
}
