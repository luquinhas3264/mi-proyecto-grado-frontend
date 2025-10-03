// src/modules/proyectos/tarea-proyecto/interfaces/tarea.interface.ts

// Enum de estados (coincide con el backend)
export enum EstadoTarea {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
}

// Interfaces auxiliares
export interface UsuarioResponsable {
  idUsuario: string
  nombre: string
  correo?: string
}

// Interface base de Tarea
export interface Tarea {
  idTarea: string
  nombre: string
  descripcion: string | null
  estado: EstadoTarea
  fechaLimite: string | null
  idProyecto: string
  idUsuarioResponsable: string | null
  creadoEn: string
  actualizadoEn: string
}

// Interface para la lista de tareas (GET /tareas/proyecto/:id)
export interface TareaListItem {
  idTarea: string
  nombre: string
  descripcion: string | null
  estado: EstadoTarea
  fechaLimite: string | null
  idUsuarioResponsable: string | null
  usuarioResponsable?: UsuarioResponsable | null
  creadoEn: string
  actualizadoEn: string
}

// Interface para el detalle de tarea (GET /tareas/:id)
export interface TareaDetalle extends Tarea {
  usuarioResponsable?: UsuarioResponsable | null
  estaVencida?: boolean
  diasRestantes?: number | null
}

// DTOs para operaciones CRUD
export interface CreateTareaDto {
  nombre: string
  descripcion?: string
  fechaLimite?: string
  idProyecto: string
  idUsuarioResponsable?: string
}

export interface UpdateTareaDto {
  nombre?: string
  descripcion?: string
  estado?: EstadoTarea
  fechaLimite?: string
  idUsuarioResponsable?: string
}

export interface CambiarEstadoDto {
  estado: EstadoTarea
}

export interface AsignarResponsableDto {
  idUsuarioResponsable: string
}

// Interface para filtros
export interface FiltrosTarea {
  estado?: EstadoTarea
  idUsuarioResponsable?: string
  busqueda?: string
  fechaLimiteDesde?: string
  fechaLimiteHasta?: string
  vencidas?: boolean
  orderBy?: 'nombre' | 'fechaLimite' | 'estado' | 'creadoEn'
  orderDirection?: 'asc' | 'desc'
}

// Interface para estadísticas
export interface TareaEstadisticas {
  total: number
  porEstado: Record<EstadoTarea, number>
  vencidas?: number
  proximasAVencer?: number
}

// Interface para respuesta de eliminación
export interface TareaEliminacionRespuesta {
  mensaje: string
}

// Tipos auxiliares
export type OrdenTarea = 'nombre' | 'fechaLimite' | 'estado' | 'creadoEn'
export type DireccionOrden = 'asc' | 'desc'
