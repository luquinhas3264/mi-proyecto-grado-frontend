// src/modules/clientes/contacto-cliente/interfaces/contacto-cliente.interface.ts

// Interface base para Contacto Cliente
export interface ContactoCliente {
  idContacto: string
  nombre: string
  cargo: string
  email: string
  telefono: string
  activo: boolean
  idCliente: string
}

// Interface para lista (misma que la base en este caso)
export interface ContactoClienteListItem extends ContactoCliente {
  // Datos del cliente asociado (se pueden agregar luego si el backend los incluye)
  cliente?: {
    razonSocial: string
    rubro: string
    activo: boolean
  }
}

// Interface para el detalle completo (misma que la base por ahora)
export interface ContactoClienteDetalle extends ContactoCliente {
  // Se puede extender luego con interacciones, historial, etc.
}

// DTOs para operaciones CRUD
export interface CreateContactoClienteDto {
  nombre: string
  cargo: string
  email: string
  telefono: string
  idCliente: string
}

export interface UpdateContactoClienteDto {
  nombre?: string
  cargo?: string
  email?: string
  telefono?: string
  idCliente?: string
  activo?: boolean
}

// Interfaces para filtros y búsquedas
export interface ContactoClienteFilters {
  idCliente?: string
  cargo?: string
  activo?: boolean
  search?: string
}

// Interface para estadísticas
export interface ContactoClienteStats {
  totalContactos: number
  contactosActivos: number
  contactosInactivos: number
  contactosPorCargo: Record<string, number>
  contactosPorCliente: Record<string, number>
}
