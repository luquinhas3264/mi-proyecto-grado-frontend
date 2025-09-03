export interface Permiso {
  idPermiso: string
  modulo: string
  accion: string
}

export interface RolPermiso {
  idRol: string
  idPermiso: string
  permiso: Permiso
}

export interface Rol {
  idRol: string
  nombre: string
  descripcion: string
  permisos?: RolPermiso[]
}

export interface RolListItem {
  idRol: string
  nombre: string
  descripcion: string
  permisos: Permiso[]
}

export interface CreateRolDto {
  nombre: string
  descripcion?: string
}

export interface UpdateRolDto {
  nombre?: string
  descripcion?: string
}

export interface AsignarPermisosDto {
  permisosIds: string[]
}

export interface AsignarPermisosResponse {
  count: number
}
