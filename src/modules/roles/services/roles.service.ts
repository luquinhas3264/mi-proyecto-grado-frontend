import axios from 'axios'
import type {
  Rol,
  RolListItem,
  CreateRolDto,
  UpdateRolDto,
  AsignarPermisosDto,
  AsignarPermisosResponse,
  Permiso,
} from '../interfaces/rol.interface'

const API_URL = 'http://localhost:3000/roles'

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

export class RolesService {
  // Crear nuevo rol
  static async crear(dto: CreateRolDto): Promise<Rol> {
    const response = await api.post('/', dto)
    return response.data
  }

  // Obtener lista de todos los roles
  static async findAll(): Promise<RolListItem[]> {
    const response = await api.get('/')
    return response.data
  }

  // Obtener rol específico con sus permisos
  static async findById(idRol: string): Promise<Rol> {
    const response = await api.get(`/${idRol}`)
    return response.data
  }

  // Actualizar rol
  static async update(idRol: string, dto: UpdateRolDto): Promise<Rol> {
    const response = await api.patch(`/${idRol}`, dto)
    return response.data
  }

  // Eliminar rol
  static async delete(idRol: string): Promise<Rol> {
    const response = await api.delete(`/${idRol}`)
    return response.data
  }

  // Asignar permisos a un rol
  static async asignarPermisos(
    idRol: string,
    permisosIds: string[],
  ): Promise<AsignarPermisosResponse> {
    const response = await api.post(`/${idRol}/permisos`, { permisosIds })
    return response.data
  }

  // Obtener todos los permisos disponibles (asumiendo que existe este endpoint)
  static async getPermisosDisponibles(): Promise<Permiso[]> {
    try {
      const response = await axios.get('http://localhost:3000/permisos', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener permisos disponibles:', error)
      return []
    }
  }
}
