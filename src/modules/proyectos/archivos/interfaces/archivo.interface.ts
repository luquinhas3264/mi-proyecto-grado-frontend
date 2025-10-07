// src/modules/proyectos/archivos/interfaces/archivo.interface.ts

// Enum de tipos de archivo (coincide con backend)
export enum TipoArchivo {
  // Documentos
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PPT = 'ppt',
  PPTX = 'pptx',
  TXT = 'txt',

  // Imágenes
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  GIF = 'gif',
  BMP = 'bmp',

  // Comprimidos
  ZIP = 'zip',
  RAR = 'rar',

  // Enlaces externos
  URL = 'url',
}

// Enum de categorías de archivo
export enum CategoriaArchivo {
  DOCUMENTO = 'documento',
  IMAGEN = 'imagen',
  COMPRIMIDO = 'comprimido',
  ENLACE = 'enlace',
  OTRO = 'otro',
}

// Interface del Usuario Creador
export interface UsuarioCreadorArchivo {
  idUsuario: string
  nombre: string
  correo?: string
}

// Interface base del Archivo
export interface Archivo {
  idArchivo: string
  nombre: string
  tipo: string // TipoArchivo como string
  tamaño?: number // En bytes, null para enlaces
  url: string // Ruta local o URL externa
  descripcion?: string
  idProyecto: string
  idUsuarioCreador: string
  usuarioCreador?: UsuarioCreadorArchivo
  creadoEn: string
  actualizadoEn: string
}

// Interface para item de lista (con campos calculados)
export interface ArchivoListItem extends Archivo {
  categoria: CategoriaArchivo
  extension: string
  tamañoFormateado?: string
  esEnlace: boolean
  esImagen: boolean
  puedePrevisualizar: boolean
  icono: string
}

// DTOs para operaciones CRUD

// DTO para subir archivo físico
export interface UploadArchivoDto {
  archivo: File
  descripcion?: string
}

// DTO para crear enlace externo
export interface CreateEnlaceDto {
  nombre: string
  url: string
  descripcion?: string
}

// DTO para actualizar archivo/enlace
export interface UpdateArchivoDto {
  nombre?: string
  descripcion?: string
}

// DTO para filtros de búsqueda
export interface FiltrosArchivoDto {
  tipo?: TipoArchivo
  busqueda?: string
  fechaDesde?: string // YYYY-MM-DD
  fechaHasta?: string // YYYY-MM-DD
  orderBy?: 'nombre' | 'tipo' | 'creadoEn' | 'tamaño'
  orderDirection?: 'asc' | 'desc'
}

// Interface para preview de URL
export interface PreviewUrlDto {
  url: string
}

// Interface para respuesta de preview
export interface PreviewUrlResponse {
  titulo: string
  descripcion: string
  imagen?: string
  url: string
}

// Interface para validación de URL
export interface ValidacionUrl {
  esValida: boolean
  dominio: string
  tipo: string
}

// Interface para metadatos extraídos de URL
export interface MetadatosUrl {
  nombre: string
  descripcionSugerida: string
  icono: string
}

// Interface para estadísticas de archivos
export interface ArchivoEstadisticas {
  totalArchivos: number
  totalEnlaces: number
  espacioUsado: number // En bytes
  espacioUsadoFormateado: string
  porCategoria: Record<CategoriaArchivo, number>
  porTipo: Record<string, number>
}

// Interface para respuesta de eliminación
export interface ArchivoEliminacionRespuesta {
  mensaje: string
}

// Constantes del módulo
export const ARCHIVO_CONSTANTS = {
  TAMAÑO_MAX_ARCHIVO: 50 * 1024 * 1024, // 50MB
  TAMAÑO_MAX_PROYECTO: 500 * 1024 * 1024, // 500MB
  CANTIDAD_MAX_ARCHIVOS: 100,
  TIPOS_PERMITIDOS: [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'zip',
    'rar',
    'url',
  ] as const,
  CATEGORIAS: {
    DOCUMENTOS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    IMAGENES: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
    COMPRIMIDOS: ['zip', 'rar'],
    ENLACES: ['url'],
  },
  MIME_TYPES: {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    txt: 'text/plain',
  } as Record<string, string>,
  ICONOS_POR_TIPO: {
    // Documentos
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word',
    docx: 'mdi-file-word',
    xls: 'mdi-file-excel',
    xlsx: 'mdi-file-excel',
    ppt: 'mdi-file-powerpoint',
    pptx: 'mdi-file-powerpoint',
    txt: 'mdi-file-document',
    // Imágenes
    jpg: 'mdi-file-image',
    jpeg: 'mdi-file-image',
    png: 'mdi-file-image',
    gif: 'mdi-file-image',
    bmp: 'mdi-file-image',
    // Comprimidos
    zip: 'mdi-folder-zip',
    rar: 'mdi-folder-zip',
    // Enlaces
    url: 'mdi-link-variant',
  } as Record<string, string>,
  COLORES_POR_CATEGORIA: {
    [CategoriaArchivo.DOCUMENTO]: 'blue',
    [CategoriaArchivo.IMAGEN]: 'green',
    [CategoriaArchivo.COMPRIMIDO]: 'orange',
    [CategoriaArchivo.ENLACE]: 'purple',
    [CategoriaArchivo.OTRO]: 'grey',
  } as Record<CategoriaArchivo, string>,
}

// Helper para obtener categoría desde tipo
export function obtenerCategoriaArchivo(tipo: string): CategoriaArchivo {
  const tipoLower = tipo.toLowerCase()

  if (ARCHIVO_CONSTANTS.CATEGORIAS.DOCUMENTOS.includes(tipoLower)) {
    return CategoriaArchivo.DOCUMENTO
  }
  if (ARCHIVO_CONSTANTS.CATEGORIAS.IMAGENES.includes(tipoLower)) {
    return CategoriaArchivo.IMAGEN
  }
  if (ARCHIVO_CONSTANTS.CATEGORIAS.COMPRIMIDOS.includes(tipoLower)) {
    return CategoriaArchivo.COMPRIMIDO
  }
  if (ARCHIVO_CONSTANTS.CATEGORIAS.ENLACES.includes(tipoLower)) {
    return CategoriaArchivo.ENLACE
  }
  return CategoriaArchivo.OTRO
}

// Helper para formatear tamaño de archivo
export function formatearTamaño(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Helper para obtener extensión desde nombre de archivo
export function obtenerExtension(nombre: string): string {
  const partes = nombre.split('.')
  return partes.length > 1 ? partes[partes.length - 1].toLowerCase() : ''
}

// Helper para obtener icono según tipo
export function obtenerIconoArchivo(tipo: string): string {
  return ARCHIVO_CONSTANTS.ICONOS_POR_TIPO[tipo.toLowerCase()] || 'mdi-file'
}

// Helper para obtener color según categoría
export function obtenerColorCategoria(categoria: CategoriaArchivo): string {
  return ARCHIVO_CONSTANTS.COLORES_POR_CATEGORIA[categoria] || 'grey'
}

// Helper para verificar si es imagen
export function esImagen(tipo: string): boolean {
  return ARCHIVO_CONSTANTS.CATEGORIAS.IMAGENES.includes(tipo.toLowerCase())
}

// Helper para verificar si puede previsualizarse
export function puedePrevisualizar(tipo: string): boolean {
  const tipoLower = tipo.toLowerCase()
  return esImagen(tipoLower) || tipoLower === 'pdf' || tipoLower === 'url'
}

// Helper para validar tamaño de archivo
export function validarTamañoArchivo(tamaño: number): { valido: boolean; mensaje?: string } {
  if (tamaño > ARCHIVO_CONSTANTS.TAMAÑO_MAX_ARCHIVO) {
    return {
      valido: false,
      mensaje: `El archivo excede el tamaño máximo permitido (${formatearTamaño(ARCHIVO_CONSTANTS.TAMAÑO_MAX_ARCHIVO)})`,
    }
  }
  return { valido: true }
}

// Helper para validar tipo de archivo
export function validarTipoArchivo(tipo: string): { valido: boolean; mensaje?: string } {
  if (!ARCHIVO_CONSTANTS.TIPOS_PERMITIDOS.includes(tipo.toLowerCase() as any)) {
    return {
      valido: false,
      mensaje: `Tipo de archivo no permitido. Tipos válidos: ${ARCHIVO_CONSTANTS.TIPOS_PERMITIDOS.join(', ')}`,
    }
  }
  return { valido: true }
}
