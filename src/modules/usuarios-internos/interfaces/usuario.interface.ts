export interface Rol {
  idRol: string
  nombre: string
  descripcion: string
}

export interface Usuario {
  idUsuario: string
  nombre: string
  correo: string
  contraseña?: string // Solo para respuestas del backend, no se usa en el frontend
  activo: boolean
  idRol: string
  rol?: Rol
  fechaCreacion: string
  ultimoAcceso?: string
}

export interface UsuarioListItem {
  idUsuario: string
  nombre: string
  correo: string
  activo: boolean
  rol: Rol
  fechaCreacion: string
  ultimoAcceso?: string
}

export interface CreateUsuarioDto {
  nombre: string
  correo: string
  contraseña: string
  idRol: string
}

export interface UpdatePerfilDto {
  nombre?: string
  nuevaContraseña?: string
}

export interface UpdateUsuarioDto {
  nombre?: string
  activo?: boolean
  idRol?: string
}
