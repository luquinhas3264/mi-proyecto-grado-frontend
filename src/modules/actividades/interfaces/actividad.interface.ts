// src/modules/actividades/interfaces/actividad.interface.ts

export enum TipoActividad {
  // Actividades básicas del sistema
  CREACION = 'creacion',
  EDICION = 'edicion',
  ELIMINACION = 'eliminacion',

  // Actividades de interacción
  REUNION = 'reunion',
  LLAMADA = 'llamada',
  CORREO = 'correo',

  // Actividades de gestión de clientes
  CAMBIO_ESTADO_CLIENTE = 'cambio_estado_cliente',

  // Actividades de gestión de contactos
  CAMBIO_ESTADO_CONTACTO = 'cambio_estado_contacto',

  // Actividades de gestión de proyectos
  FINALIZACION = 'finalizacion',
  CAMBIO_ESTADO_PROYECTO = 'cambio_estado_proyecto',

  // Actividades de gestión de tareas
  CAMBIO_ESTADO_TAREA = 'cambio_estado_tarea',
  ASIGNACION = 'asignacion',

  // Actividades de archivos y documentos
  ARCHIVO_SUBIDO = 'archivo_subido',
  ARCHIVO_ELIMINADO = 'archivo_eliminado',
  NOTA_AGREGADA = 'nota_agregada',

  // Genérico
  OTRO = 'otro',
}

export interface Usuario {
  nombre: string
}

export interface Actividad {
  idActividad: string
  fecha: string
  tipo: TipoActividad
  descripcion: string
  idUsuario: string
  usuario?: Usuario
  idCliente: string
  idProyecto?: string
}

export interface CreateActividadDto {
  fecha?: string
  tipo: TipoActividad
  descripcion: string
  idUsuario: string
  idCliente: string
  idProyecto?: string
}

export interface UpdateActividadDto {
  fecha?: string
  tipo?: TipoActividad
  descripcion?: string
  idUsuario?: string
  idCliente?: string
  idProyecto?: string
}

export interface FilterActividadDto {
  idUsuario?: string
  idCliente?: string
  idProyecto?: string
  tipo?: TipoActividad
  fechaInicio?: string
  fechaFin?: string
}

// Utilidades para trabajar con tipos de actividad
export const TipoActividadLabels: Record<TipoActividad, string> = {
  [TipoActividad.CREACION]: 'Creación',
  [TipoActividad.EDICION]: 'Edición',
  [TipoActividad.ELIMINACION]: 'Eliminación',
  [TipoActividad.REUNION]: 'Reunión',
  [TipoActividad.LLAMADA]: 'Llamada',
  [TipoActividad.CORREO]: 'Correo',
  [TipoActividad.CAMBIO_ESTADO_CLIENTE]: 'Cambio Estado Cliente',
  [TipoActividad.CAMBIO_ESTADO_CONTACTO]: 'Cambio Estado Contacto',
  [TipoActividad.FINALIZACION]: 'Finalización',
  [TipoActividad.CAMBIO_ESTADO_PROYECTO]: 'Cambio Estado Proyecto',
  [TipoActividad.CAMBIO_ESTADO_TAREA]: 'Cambio Estado Tarea',
  [TipoActividad.ASIGNACION]: 'Asignación',
  [TipoActividad.ARCHIVO_SUBIDO]: 'Archivo Subido',
  [TipoActividad.ARCHIVO_ELIMINADO]: 'Archivo Eliminado',
  [TipoActividad.NOTA_AGREGADA]: 'Nota Agregada',
  [TipoActividad.OTRO]: 'Otro',
}

export const TipoActividadIcons: Record<TipoActividad, string> = {
  [TipoActividad.CREACION]: 'mdi-plus-circle',
  [TipoActividad.EDICION]: 'mdi-pencil',
  [TipoActividad.ELIMINACION]: 'mdi-delete',
  [TipoActividad.REUNION]: 'mdi-account-group',
  [TipoActividad.LLAMADA]: 'mdi-phone',
  [TipoActividad.CORREO]: 'mdi-email',
  [TipoActividad.CAMBIO_ESTADO_CLIENTE]: 'mdi-swap-horizontal',
  [TipoActividad.CAMBIO_ESTADO_CONTACTO]: 'mdi-account-switch',
  [TipoActividad.FINALIZACION]: 'mdi-check-circle',
  [TipoActividad.CAMBIO_ESTADO_PROYECTO]: 'mdi-briefcase-edit',
  [TipoActividad.CAMBIO_ESTADO_TAREA]: 'mdi-checkbox-marked',
  [TipoActividad.ASIGNACION]: 'mdi-account-arrow-right',
  [TipoActividad.ARCHIVO_SUBIDO]: 'mdi-file-upload',
  [TipoActividad.ARCHIVO_ELIMINADO]: 'mdi-file-remove',
  [TipoActividad.NOTA_AGREGADA]: 'mdi-note-plus',
  [TipoActividad.OTRO]: 'mdi-dots-horizontal',
}

export const TipoActividadColors: Record<TipoActividad, string> = {
  [TipoActividad.CREACION]: 'success',
  [TipoActividad.EDICION]: 'warning',
  [TipoActividad.ELIMINACION]: 'error',
  [TipoActividad.REUNION]: 'purple',
  [TipoActividad.LLAMADA]: 'blue',
  [TipoActividad.CORREO]: 'indigo',
  [TipoActividad.CAMBIO_ESTADO_CLIENTE]: 'deep-orange-accent-2',
  [TipoActividad.CAMBIO_ESTADO_CONTACTO]: 'teal',
  [TipoActividad.FINALIZACION]: 'green',
  [TipoActividad.CAMBIO_ESTADO_PROYECTO]: 'cyan',
  [TipoActividad.CAMBIO_ESTADO_TAREA]: 'deep-purple',
  [TipoActividad.ASIGNACION]: 'primary',
  [TipoActividad.ARCHIVO_SUBIDO]: 'blue-grey',
  [TipoActividad.ARCHIVO_ELIMINADO]: 'red',
  [TipoActividad.NOTA_AGREGADA]: 'amber',
  [TipoActividad.OTRO]: 'grey',
}

// Categorías para agrupar tipos de actividad
export enum CategoriaActividad {
  SISTEMA = 'Sistema',
  INTERACCION = 'Interacción',
  GESTION = 'Gestión',
  ARCHIVOS = 'Archivos',
}

export const TipoActividadPorCategoria: Record<CategoriaActividad, TipoActividad[]> = {
  [CategoriaActividad.SISTEMA]: [
    TipoActividad.CREACION,
    TipoActividad.EDICION,
    TipoActividad.ELIMINACION,
  ],
  [CategoriaActividad.INTERACCION]: [
    TipoActividad.REUNION,
    TipoActividad.LLAMADA,
    TipoActividad.CORREO,
  ],
  [CategoriaActividad.GESTION]: [
    TipoActividad.CAMBIO_ESTADO_CLIENTE,
    TipoActividad.CAMBIO_ESTADO_CONTACTO,
    TipoActividad.FINALIZACION,
    TipoActividad.CAMBIO_ESTADO_PROYECTO,
    TipoActividad.CAMBIO_ESTADO_TAREA,
    TipoActividad.ASIGNACION,
  ],
  [CategoriaActividad.ARCHIVOS]: [
    TipoActividad.ARCHIVO_SUBIDO,
    TipoActividad.ARCHIVO_ELIMINADO,
    TipoActividad.NOTA_AGREGADA,
  ],
}
