// src/modules/clientes/etiqueta-cliente/services/etiqueta-cliente.service.ts
import axios from 'axios'
import type {
  EtiquetaCliente,
  EtiquetaClienteListItem,
  EtiquetaClienteDetalle,
  CreateEtiquetaClienteDto,
  UpdateEtiquetaClienteDto,
  ClienteEtiquetaAsignacion,
  EtiquetaClienteFilters,
} from '../interfaces/etiqueta-cliente.interface'

const API_URL = 'http://localhost:3000/etiquetas'

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

export class EtiquetaClienteService {
  // Crear nueva etiqueta
  static async crear(dto: CreateEtiquetaClienteDto): Promise<EtiquetaCliente> {
    const response = await api.post('/', dto)
    return response.data
  }

  // Obtener todas las etiquetas
  static async obtenerTodas(): Promise<EtiquetaClienteListItem[]> {
    const response = await api.get('/')
    return response.data
  }

  // Obtener etiqueta específica por ID
  static async obtenerPorId(id: string): Promise<EtiquetaClienteListItem> {
    // Como no hay endpoint específico, usar el filtrado por ID desde obtenerTodas
    const etiquetas = await this.obtenerTodas()
    const etiqueta = etiquetas.find((e) => e.idEtiqueta === id)
    if (!etiqueta) {
      throw new Error('Etiqueta no encontrada')
    }
    return etiqueta
  }

  // Actualizar etiqueta específica
  static async actualizar(id: string, dto: UpdateEtiquetaClienteDto): Promise<EtiquetaCliente> {
    const response = await api.patch(`/${id}`, dto)
    return response.data
  }

  // Eliminar etiqueta (hard delete)
  static async eliminar(id: string): Promise<EtiquetaCliente> {
    const response = await api.delete(`/${id}`)
    return response.data
  }

  // Asignar etiqueta a cliente
  static async asignarEtiqueta(
    idCliente: string,
    idEtiqueta: string,
  ): Promise<ClienteEtiquetaAsignacion> {
    const response = await api.post(`/asignar/${idCliente}/${idEtiqueta}`)
    return response.data
  }

  // Remover etiqueta de cliente
  static async removerEtiqueta(
    idCliente: string,
    idEtiqueta: string,
  ): Promise<ClienteEtiquetaAsignacion> {
    const response = await api.delete(`/remover/${idCliente}/${idEtiqueta}`)
    return response.data
  }

  // Obtener estadísticas de etiquetas (calculadas en frontend por ahora)
  static async obtenerEstadisticas(): Promise<{
    totalEtiquetas: number
    etiquetasMasUsadas: Array<{
      idEtiqueta: string
      nombre: string
      totalClientes: number
    }>
  }> {
    const etiquetas = await this.obtenerTodas()

    // Por ahora estadísticas básicas, se puede expandir cuando el backend provea más datos
    const stats = {
      totalEtiquetas: etiquetas.length,
      etiquetasMasUsadas: etiquetas
        .map((etiqueta) => ({
          idEtiqueta: etiqueta.idEtiqueta,
          nombre: etiqueta.nombre,
          totalClientes: etiqueta.totalClientes || 0,
        }))
        .sort((a, b) => b.totalClientes - a.totalClientes)
        .slice(0, 5),
    }

    return stats
  }

  // Buscar etiquetas por término de búsqueda
  static async buscar(termino: string): Promise<EtiquetaClienteListItem[]> {
    const etiquetas = await this.obtenerTodas()

    if (!termino.trim()) {
      return etiquetas
    }

    const terminoLower = termino.toLowerCase()
    return etiquetas.filter((etiqueta) => etiqueta.nombre.toLowerCase().includes(terminoLower))
  }

  // Validar nombre único (verificación del lado cliente)
  static async validarNombreUnico(nombre: string, idEtiquetaExcluir?: string): Promise<boolean> {
    const etiquetas = await this.obtenerTodas()
    return !etiquetas.some(
      (e) => e.nombre.toLowerCase() === nombre.toLowerCase() && e.idEtiqueta !== idEtiquetaExcluir,
    )
  }
}
