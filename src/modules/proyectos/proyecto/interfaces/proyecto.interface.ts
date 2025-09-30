// src/modules/proyectos/proyecto/interfaces/proyecto.interface.ts

import type { NotaProyectoSimple } from '../../nota-proyecto/interfaces/nota.interface'

// Enum de estados (coincide con el backend)
export enum EstadoProyecto {
  PLANEADO = 'PLANEADO',
  EN_PROGRESO = 'EN_PROGRESO',
  FINALIZADO = 'FINALIZADO',
}

// Interfaces auxiliares
export interface ClienteProyecto {
  idCliente?: string
  razonSocial: string
  rubro?: string
  correo?: string
  telefono?: string
}

export interface UsuarioProyecto {
  nombre: string
}

export interface NotaProyecto {
  idNota: string
  contenido: string
  fecha: string
}

export interface ActividadProyecto {
  idActividad: string
  tipo: string
  descripcion: string
  usuario: UsuarioProyecto
  fecha: string
}

export interface TareaProyecto {
  idTarea: string
  nombre: string
  estado: string
}

// Interface base del Proyecto
export interface Proyecto {
  idProyecto: string
  nombre: string
  descripcion: string | null
  estado: EstadoProyecto
  fechaInicio: string
  fechaFin: string | null
  idCliente: string
  cliente: ClienteProyecto
  creadoEn: string
}

// Interface para la lista de proyectos (GET /proyectos)
export interface ProyectoListItem extends Proyecto {
  notas: NotaProyecto[]
  diasRestantes: number
  estaAtrasado: boolean
}

// Interface para el detalle completo (GET /proyectos/:id)
export interface ProyectoDetalle extends Proyecto {
  notas: NotaProyectoSimple[]
  actividades: ActividadProyecto[]
  tareas: TareaProyecto[]
  estaAtrasado: boolean
  diasRestantes: number | null
}

// DTOs para operaciones CRUD
export interface CreateProyectoDto {
  nombre: string
  descripcion?: string
  fechaInicio: string
  fechaFin?: string
  idCliente: string
}

export interface UpdateProyectoDto {
  nombre?: string
  descripcion?: string
  estado?: EstadoProyecto
  fechaInicio?: string
  fechaFin?: string
  idCliente?: string
}

// Interface para estadísticas
export interface ProyectoEstadisticas {
  total: number
  porEstado: Record<EstadoProyecto, number>
  proximosAVencer: number
  atrasados: number
}

// Interfaces para filtros y búsquedas
export interface ProyectoFilters {
  clienteId?: string
  estado?: EstadoProyecto
  search?: string
}

// Interface para respuesta de eliminación
export interface ProyectoEliminacionRespuesta {
  mensaje: string
}
