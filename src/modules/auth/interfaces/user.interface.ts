import type { Permission } from './permission.interface'

export interface User {
  id: string
  nombre: string
  correo: string
  rol: string
  permisos: Permission[]
}
