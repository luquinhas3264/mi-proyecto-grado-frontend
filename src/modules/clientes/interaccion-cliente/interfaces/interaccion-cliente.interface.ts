// src/modules/clientes/interaccion-cliente/interfaces/interaccion-cliente.interface.ts

// Enum para tipos de interacción
export enum TipoInteraccion {
  LLAMADA = 'llamada',
  CORREO = 'correo',
  REUNION = 'reunion',
  OTRO = 'otro',
}

// Interface base para Interacción Cliente
export interface InteraccionCliente {
  idInteraccion: string
  tipo: TipoInteraccion
  descripcion: string
  fecha: string // ISO 8601
  idContacto: string
}

// Interface para lista de interacciones por contacto
export interface InteraccionClienteListItem extends InteraccionCliente {
  // Misma estructura que la base
}

// Interface para lista de interacciones por cliente (incluye info del contacto)
export interface InteraccionClienteConContacto extends InteraccionCliente {
  contacto: {
    nombre: string
    idCliente: string
  }
}

// Interface para el detalle completo (incluye info del contacto y cliente)
export interface InteraccionClienteDetalle extends InteraccionCliente {
  contacto: {
    nombre: string
    idCliente: string
  }
}

// DTOs para operaciones CRUD
export interface CreateInteraccionClienteDto {
  tipo: TipoInteraccion
  descripcion: string
  fecha: string // ISO 8601
  idContacto: string
}

export interface UpdateInteraccionClienteDto {
  tipo?: TipoInteraccion
  descripcion?: string
  fecha?: string // ISO 8601
  idContacto?: string
}

// Interfaces para filtros y búsquedas
export interface InteraccionClienteFilters {
  idCliente?: string
  idContacto?: string
  tipo?: TipoInteraccion
  fechaDesde?: string
  fechaHasta?: string
  search?: string
}

// Interface para estadísticas
export interface InteraccionClienteStats {
  totalInteracciones: number
  interaccionesPorTipo: Record<TipoInteraccion, number>
  interaccionesPorMes: Record<string, number>
  interaccionesPorContacto: Record<string, number>
}

// Interface para opciones de tipo de interacción (para UI)
export interface TipoInteraccionOption {
  value: TipoInteraccion
  title: string
  icon: string
  color: string
  description: string
}

// Constantes para la UI
export const TIPOS_INTERACCION_OPTIONS: TipoInteraccionOption[] = [
  {
    value: TipoInteraccion.LLAMADA,
    title: 'Llamada',
    icon: 'mdi-phone',
    color: 'success',
    description: 'Conversación telefónica',
  },
  {
    value: TipoInteraccion.CORREO,
    title: 'Correo',
    icon: 'mdi-email',
    color: 'info',
    description: 'Comunicación por email',
  },
  {
    value: TipoInteraccion.REUNION,
    title: 'Reunión',
    icon: 'mdi-account-group',
    color: 'warning',
    description: 'Encuentro presencial o virtual',
  },
  {
    value: TipoInteraccion.OTRO,
    title: 'Otro',
    icon: 'mdi-dots-horizontal',
    color: 'grey',
    description: 'Otra forma de interacción',
  },
]
