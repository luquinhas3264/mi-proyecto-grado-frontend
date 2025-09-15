import axios from 'axios'
import type {
  Usuario,
  UsuarioListItem,
  CreateUsuarioDto,
  UpdatePerfilDto,
  UpdateUsuarioDto,
} from '../interfaces/usuario.interface'

const API_URL = 'http://localhost:3000/usuarios-internos'

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

export class UsuariosService {
  // Crear nuevo usuario
  static async crear(dto: CreateUsuarioDto): Promise<Usuario> {
    const response = await api.post('/', dto)
    return response.data
  }

  // Obtener lista de todos los usuarios
  static async findAll(): Promise<UsuarioListItem[]> {
    const response = await api.get('/')
    return response.data
  }

  // Obtener perfil del usuario logueado
  static async getMiPerfil(): Promise<Usuario> {
    const response = await api.get('/mi-perfil')
    return response.data
  }

  // Actualizar perfil del usuario logueado
  static async updateMiPerfil(dto: UpdatePerfilDto): Promise<Usuario> {
    const response = await api.patch('/mi-perfil', dto)
    return response.data
  }

  // Obtener usuario específico por ID
  static async findById(id: string): Promise<Usuario> {
    const response = await api.get(`/${id}`)
    return response.data
  }

  // Actualizar usuario específico (admin)
  static async update(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    const response = await api.patch(`/${id}`, dto)
    return response.data
  }

  // Obtener roles disponibles
  static async getRoles(): Promise<Array<{ idRol: string; nombre: string; descripcion: string }>> {
    try {
      const response = await axios.get('http://localhost:3000/roles', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener roles:', error)
      return []
    }
  }
}
