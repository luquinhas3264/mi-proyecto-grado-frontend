// src/modules/clientes/contacto-cliente/services/contacto-cliente.service.ts
import axios from 'axios'
import type {
  ContactoCliente,
  ContactoClienteListItem,
  ContactoClienteDetalle,
  CreateContactoClienteDto,
  UpdateContactoClienteDto,
  ContactoClienteFilters,
} from '../interfaces/contacto-cliente.interface'

const API_URL = 'http://localhost:3000/contactos'

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

export class ContactoClienteService {
  // Crear nuevo contacto
  static async crear(dto: CreateContactoClienteDto): Promise<ContactoCliente> {
    const response = await api.post('/', dto)
    return response.data
  }

  // Obtener contactos por cliente
  static async obtenerPorCliente(idCliente: string): Promise<ContactoClienteListItem[]> {
    const response = await api.get(`/cliente/${idCliente}`)
    return response.data
  }

  // Obtener contacto específico por ID
  static async obtenerPorId(id: string): Promise<ContactoClienteDetalle> {
    const response = await api.get(`/${id}`)
    return response.data
  }

  // Actualizar contacto específico
  static async actualizar(id: string, dto: UpdateContactoClienteDto): Promise<ContactoCliente> {
    const response = await api.patch(`/${id}`, dto)
    return response.data
  }

  // Eliminar contacto (soft delete)
  static async eliminar(id: string): Promise<ContactoCliente> {
    const response = await api.delete(`/${id}`)
    return response.data
  }

  // Obtener todos los contactos (método auxiliar para estadísticas)
  static async obtenerTodos(filters?: ContactoClienteFilters): Promise<ContactoClienteListItem[]> {
    // Si hay filtros, puedes agregarlos como query params (pendiente de implementar)
    const response = await api.get('/')
    return response.data
  }

  // Obtener estadísticas de contactos (calculadas en frontend)
  static async obtenerEstadisticas(): Promise<{
    totalContactos: number
    contactosActivos: number
    contactosInactivos: number
    contactosPorCargo: Record<string, number>
  }> {
    const contactos = await this.obtenerTodos()

    const stats = {
      totalContactos: contactos.length,
      contactosActivos: contactos.filter((c) => c.activo).length,
      contactosInactivos: contactos.filter((c) => !c.activo).length,
      contactosPorCargo: contactos.reduce(
        (acc, contacto) => {
          acc[contacto.cargo] = (acc[contacto.cargo] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    return stats
  }

  // Obtener cargos únicos (para filtros y formularios)
  static async obtenerCargos(): Promise<string[]> {
    // Simulado por ahora, se puede implementar con endpoint específico
    return [
      'Gerente General',
      'Director',
      'Gerente de Proyectos',
      'Coordinador',
      'Analista',
      'Asistente',
      'Contador',
      'Administrador',
    ]
  }

  // Buscar contactos por término de búsqueda
  static async buscar(termino: string, idCliente?: string): Promise<ContactoClienteListItem[]> {
    let contactos: ContactoClienteListItem[] = []
    if (idCliente) {
      contactos = await this.obtenerPorCliente(idCliente)
    } else {
      contactos = await this.obtenerTodos()
    }

    if (!termino.trim()) {
      return contactos
    }

    const terminoLower = termino.toLowerCase()
    return contactos.filter(
      (contacto) =>
        contacto.nombre.toLowerCase().includes(terminoLower) ||
        contacto.cargo.toLowerCase().includes(terminoLower) ||
        contacto.email.toLowerCase().includes(terminoLower) ||
        contacto.telefono.includes(termino),
    )
  }
}
