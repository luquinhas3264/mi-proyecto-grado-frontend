// src/modules/clientes/etiqueta-cliente/interfaces/etiqueta-cliente.interface.ts

// Interface base para Etiqueta Cliente
export interface EtiquetaCliente {
  idEtiqueta: string
  nombre: string
}

// Interface para lista (misma que la base en este caso)
export interface EtiquetaClienteListItem extends EtiquetaCliente {
  // Se puede extender con información computada
  totalClientes?: number
  clientesAsignados?: string[] // Array de IDs de clientes
  clientes?: Array<{
    idCliente: string
    razonSocial?: string
    activo?: boolean
  }>
}

// Interface para el detalle completo (misma que la base por ahora)
export interface EtiquetaClienteDetalle extends EtiquetaCliente {
  // Se puede extender luego con más detalles si es necesario
  clientes?: Array<{
    idCliente: string
    razonSocial: string
    activo: boolean
  }>
}

// DTOs para operaciones CRUD
export interface CreateEtiquetaClienteDto {
  nombre: string
}

export interface UpdateEtiquetaClienteDto {
  nombre?: string
}

// Interface para asignación cliente-etiqueta
export interface ClienteEtiquetaAsignacion {
  idCliente: string
  idEtiqueta: string
}

// Interfaces para filtros y búsquedas
export interface EtiquetaClienteFilters {
  search?: string
  idCliente?: string // Para filtrar etiquetas de un cliente específico
}

// Interface para estadísticas
export interface EtiquetaClienteStats {
  totalEtiquetas: number
  etiquetasMasUsadas: Array<{
    idEtiqueta: string
    nombre: string
    totalClientes: number
  }>
  clientesSinEtiquetas: number
}
