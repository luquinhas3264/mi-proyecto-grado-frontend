// src/modules/clientes/cliente-empresa/services/cliente-empresa.service.ts
import axios from 'axios'
import type {
  ClienteEmpresa,
  ClienteEmpresaListItem,
  ClienteEmpresaDetalle,
  CreateClienteEmpresaDto,
  UpdateClienteEmpresaDto,
  ClienteEmpresaFilters,
} from '../interfaces/cliente-empresa.interface'

const API_URL = 'http://localhost:3000/clientes'

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

export class ClienteEmpresaService {
  // Crear nuevo cliente empresa
  static async crear(dto: CreateClienteEmpresaDto): Promise<ClienteEmpresa> {
    const response = await api.post('/', dto)
    return response.data
  }

  // Obtener lista de todos los clientes
  static async obtenerTodos(filters?: ClienteEmpresaFilters): Promise<ClienteEmpresaListItem[]> {
    const params = new URLSearchParams()

    if (filters?.etiquetaId) {
      params.append('etiquetaId', filters.etiquetaId)
    }

    const url = params.toString() ? `/?${params.toString()}` : '/'
    const response = await api.get(url)
    return response.data
  }

  // Obtener cliente específico por ID con detalles completos
  static async obtenerPorId(id: string): Promise<ClienteEmpresaDetalle> {
    const response = await api.get(`/${id}`)
    return response.data
  }

  // Actualizar cliente específico
  static async actualizar(id: string, dto: UpdateClienteEmpresaDto): Promise<ClienteEmpresa> {
    const response = await api.patch(`/${id}`, dto)
    return response.data
  }

  // Eliminar cliente (soft delete)
  static async eliminar(id: string): Promise<ClienteEmpresa> {
    const response = await api.delete(`/${id}`)
    return response.data
  }

  // Obtener estadísticas de clientes (método auxiliar)
  static async obtenerEstadisticas(): Promise<{
    totalClientes: number
    clientesActivos: number
    clientesInactivos: number
    clientesPorRubro: Record<string, number>
  }> {
    const clientes = await this.obtenerTodos()

    const stats = {
      totalClientes: clientes.length,
      clientesActivos: clientes.filter((c) => c.activo).length,
      clientesInactivos: clientes.filter((c) => !c.activo).length,
      clientesPorRubro: clientes.reduce(
        (acc, cliente) => {
          acc[cliente.rubro] = (acc[cliente.rubro] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    return stats
  }

  // Obtener rubros únicos (para filtros y formularios)
  static async obtenerRubros(): Promise<string[]> {
    const clientes = await this.obtenerTodos()
    const rubros = [...new Set(clientes.map((c) => c.rubro))]
    return rubros.sort()
  }

  // Buscar clientes por término de búsqueda
  static async buscar(termino: string): Promise<ClienteEmpresaListItem[]> {
    const clientes = await this.obtenerTodos()

    if (!termino.trim()) {
      return clientes
    }

    const terminoLower = termino.toLowerCase()
    return clientes.filter(
      (cliente) =>
        cliente.razonSocial.toLowerCase().includes(terminoLower) ||
        cliente.correo.toLowerCase().includes(terminoLower) ||
        cliente.rubro.toLowerCase().includes(terminoLower) ||
        cliente.telefono.includes(termino) ||
        cliente.direccion.toLowerCase().includes(terminoLower),
    )
  }
}
