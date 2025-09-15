// src/modules/clientes/cliente-empresa/interfaces/cliente-empresa.interface.ts

// Interfaces base
export interface Etiqueta {
  idEtiqueta: string
  nombre: string
}

export interface ClienteEtiqueta {
  idCliente: string
  idEtiqueta: string
  etiqueta: Etiqueta
}

export interface ContactoCliente {
  idContacto: string
  nombre: string
  cargo: string
  email: string
  telefono: string
  activo: boolean
  idCliente: string
}

export interface Proyecto {
  idProyecto: string
  nombre: string
  descripcion: string
  estado: string
  fechaInicio: string
  fechaFin: string
  activo: boolean
  idCliente: string
  creadoEn: string
  actualizadoEn: string
}

export interface Actividad {
  idActividad: string
  fecha: string
  tipo: string
  descripcion: string
  idUsuario: string
  idCliente: string
  idProyecto: string
}

// Interface principal - Cliente Empresa
export interface ClienteEmpresa {
  idCliente: string
  razonSocial: string
  rubro: string
  correo: string
  telefono: string
  direccion: string
  activo: boolean
}

// Interface para la lista de clientes (GET /clientes)
export interface ClienteEmpresaListItem extends ClienteEmpresa {
  etiquetas: ClienteEtiqueta[]
  contactos: ContactoCliente[]
}

// Interface para el detalle completo (GET /clientes/:id)
export interface ClienteEmpresaDetalle extends ClienteEmpresa {
  contactos: ContactoCliente[]
  etiquetas: ClienteEtiqueta[]
  proyectos: Proyecto[]
  actividades: Actividad[]
}

// DTOs para operaciones CRUD
export interface CreateClienteEmpresaDto {
  razonSocial: string
  rubro: string
  correo: string
  telefono: string
  direccion: string
}

export interface UpdateClienteEmpresaDto {
  razonSocial?: string
  rubro?: string
  correo?: string
  telefono?: string
  direccion?: string
  activo?: boolean
}

// Interfaces para filtros y búsquedas
export interface ClienteEmpresaFilters {
  etiquetaId?: string
  rubro?: string
  activo?: boolean
  search?: string
}

// Interface para estadísticas
export interface ClienteEmpresaStats {
  totalClientes: number
  clientesActivos: number
  clientesInactivos: number
  clientesPorRubro: Record<string, number>
  clientesConProyectos: number
  clientesSinContacto: number
}
