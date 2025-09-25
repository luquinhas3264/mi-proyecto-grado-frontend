// src/modules/clientes/interaccion-cliente/services/interaccion-cliente.service.ts
import axios from 'axios'
import type {
  InteraccionCliente,
  InteraccionClienteListItem,
  InteraccionClienteDetalle,
  InteraccionClienteConContacto,
  CreateInteraccionClienteDto,
  UpdateInteraccionClienteDto,
  InteraccionClienteFilters,
} from '../interfaces/interaccion-cliente.interface'
import { TipoInteraccion } from '../interfaces/interaccion-cliente.interface'

const API_URL = 'http://localhost:3000/interacciones'

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

export class InteraccionClienteService {
  // Crear nueva interacción
  static async crear(dto: CreateInteraccionClienteDto): Promise<InteraccionClienteDetalle> {
    const response = await api.post('/', dto)
    return response.data
  }

  // Obtener interacciones por contacto específico
  static async obtenerPorContacto(idContacto: string): Promise<InteraccionClienteConContacto[]> {
    const response = await api.get(`/contacto/${idContacto}`)
    return response.data
  }

  // Obtener interacciones por cliente específico
  static async obtenerPorCliente(idCliente: string): Promise<InteraccionClienteConContacto[]> {
    const response = await api.get(`/cliente/${idCliente}`)
    return response.data
  }

  // Obtener todas las interacciones (endpoint global)
  static async obtenerTodas(): Promise<InteraccionClienteConContacto[]> {
    const response = await api.get('/')
    return response.data
  }

  // Obtener estadísticas de interacciones
  static async obtenerEstadisticas(idCliente?: string): Promise<{
    totalInteracciones: number
    interaccionesPorTipo: Record<TipoInteraccion, number>
    interaccionesPorMes: Record<string, number>
  }> {
    let interacciones: InteraccionClienteConContacto[] = []

    if (idCliente) {
      interacciones = await this.obtenerPorCliente(idCliente)
    } else {
      // Para estadísticas globales necesitaríamos un endpoint especial
      // o cargar de todos los clientes
      interacciones = []
    }

    const stats = {
      totalInteracciones: interacciones.length,
      interaccionesPorTipo: interacciones.reduce(
        (acc, interaccion) => {
          acc[interaccion.tipo] = (acc[interaccion.tipo] || 0) + 1
          return acc
        },
        {} as Record<TipoInteraccion, number>,
      ),
      interaccionesPorMes: interacciones.reduce(
        (acc, interaccion) => {
          const fecha = new Date(interaccion.fecha)
          const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
          acc[mesAno] = (acc[mesAno] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    return stats
  }

  // Buscar interacciones por término de búsqueda
  static async buscar(
    termino: string,
    idCliente?: string,
    idContacto?: string,
  ): Promise<InteraccionClienteConContacto[]> {
    let interacciones: InteraccionClienteConContacto[] = []

    if (idContacto) {
      interacciones = await this.obtenerPorContacto(idContacto)
    } else if (idCliente) {
      interacciones = await this.obtenerPorCliente(idCliente)
    }

    if (!termino.trim()) {
      return interacciones
    }

    const terminoLower = termino.toLowerCase()
    return interacciones.filter(
      (interaccion) =>
        interaccion.descripcion.toLowerCase().includes(terminoLower) ||
        interaccion.tipo.toLowerCase().includes(terminoLower) ||
        interaccion.contacto.nombre.toLowerCase().includes(terminoLower),
    )
  }

  // Obtener tipos de interacción disponibles
  static async obtenerTipos(): Promise<TipoInteraccion[]> {
    return [
      TipoInteraccion.LLAMADA,
      TipoInteraccion.CORREO,
      TipoInteraccion.REUNION,
      TipoInteraccion.OTRO,
    ]
  }

  // Formatear fecha para mostrar
  static formatearFecha(fecha: string): string {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Formatear fecha para input datetime-local
  static formatearFechaParaInput(fecha: string): string {
    const date = new Date(fecha)
    return date.toISOString().slice(0, 16)
  }

  // Convertir fecha de input a ISO string
  static convertirFechaInput(fechaInput: string): string {
    return new Date(fechaInput).toISOString()
  }
}
