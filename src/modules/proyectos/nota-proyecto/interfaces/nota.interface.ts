// src/modules/proyectos/nota-proyecto/interfaces/nota.interface.ts

// Interface base de Nota
export interface NotaProyecto {
  idNota: string
  idProyecto: string
  contenido: string
  fecha: string
}

// DTO para crear nota
export interface CreateNotaProyectoDto {
  contenido: string
}

// DTO para actualizar nota
export interface UpdateNotaProyectoDto {
  contenido?: string
}

// Interface para respuesta de eliminación
export interface NotaEliminacionRespuesta {
  mensaje: string
}

// Interface extendida con información del usuario (para futuro)
export interface NotaProyectoDetalle extends NotaProyecto {
  usuario?: {
    idUsuario: string
    nombre: string
  }
  actualizadoEn?: string
}

// Filtros para notas
export interface NotaFilters {
  proyectoId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}
