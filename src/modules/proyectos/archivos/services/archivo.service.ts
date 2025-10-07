// src/modules/proyectos/archivos/services/archivo.service.ts
import axios from 'axios'
import type {
  Archivo,
  ArchivoListItem,
  CreateEnlaceDto,
  UpdateArchivoDto,
  FiltrosArchivoDto,
  PreviewUrlDto,
  PreviewUrlResponse,
  ArchivoEliminacionRespuesta,
} from '../interfaces/archivo.interface'

const API_URL = 'http://localhost:3000/archivos'

// Configurar interceptor para incluir token automáticamente
const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export class ArchivoService {
  // Subir archivo físico a un proyecto
  static async subirArchivo(
    idProyecto: string,
    archivo: File,
    descripcion?: string,
  ): Promise<Archivo> {
    const formData = new FormData()
    formData.append('file', archivo) // El backend espera 'file'
    if (descripcion) {
      formData.append('descripcion', descripcion)
    }

    const response = await api.post(`/subir/${idProyecto}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Subir múltiples archivos a un proyecto
  static async subirMultiplesArchivos(
    idProyecto: string,
    archivos: File[],
    descripciones?: string[],
  ): Promise<Archivo[]> {
    const formData = new FormData()
    archivos.forEach((archivo, i) => {
      formData.append('files', archivo)
      if (descripciones && descripciones[i]) {
        formData.append(`descripcion[${i}]`, descripciones[i])
      }
    })

    const response = await api.post(`/subir-multiples/${idProyecto}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return Array.isArray(response.data) ? response.data : [response.data]
  }

  // Agregar enlace externo a un proyecto
  static async agregarEnlace(idProyecto: string, dto: CreateEnlaceDto): Promise<Archivo> {
    const response = await api.post(`/enlace/${idProyecto}`, dto)
    return response.data
  }

  // Listar archivos y enlaces de un proyecto
  static async obtenerArchivosPorProyecto(
    idProyecto: string,
    filtros?: FiltrosArchivoDto,
  ): Promise<ArchivoListItem[]> {
    const params = new URLSearchParams()

    if (filtros?.tipo) params.append('tipo', filtros.tipo)
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda)
    if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
    if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)
    if (filtros?.orderBy) params.append('orderBy', filtros.orderBy)
    if (filtros?.orderDirection) params.append('orderDirection', filtros.orderDirection)

    const url = params.toString()
      ? `/proyecto/${idProyecto}?${params.toString()}`
      : `/proyecto/${idProyecto}`
    const response = await api.get(url)
    return response.data
  }

  // Descargar archivo por ID
  static async descargarArchivo(idArchivo: string): Promise<Blob> {
    const response = await api.get(`/${idArchivo}/descargar`, {
      responseType: 'blob',
    })
    return response.data
  }

  // Helper para descargar archivo y disparar descarga en navegador
  static async descargarYGuardar(idArchivo: string, nombreArchivo: string): Promise<void> {
    const blob = await this.descargarArchivo(idArchivo)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivo
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // Eliminar archivo o enlace por ID
  static async eliminarArchivo(idArchivo: string): Promise<ArchivoEliminacionRespuesta> {
    const response = await api.delete(`/${idArchivo}`)
    return response.data
  }

  // Actualizar metadatos de archivo o enlace
  static async actualizarArchivo(idArchivo: string, dto: UpdateArchivoDto): Promise<Archivo> {
    const response = await api.patch(`/${idArchivo}`, dto)
    return response.data
  }

  // Previsualizar metadatos de una URL externa
  static async previsualizarUrl(dto: PreviewUrlDto): Promise<PreviewUrlResponse> {
    const response = await api.post('/previsualizar-url', dto)
    return response.data
  }

  // Métodos auxiliares locales

  // Filtrar archivos por categoría
  static filtrarPorCategoria(archivos: ArchivoListItem[], categoria: string): ArchivoListItem[] {
    return archivos.filter((archivo) => archivo.categoria === categoria)
  }

  // Buscar archivos localmente
  static buscarArchivos(archivos: ArchivoListItem[], termino: string): ArchivoListItem[] {
    if (!termino.trim()) return archivos

    const terminoLower = termino.toLowerCase()
    return archivos.filter(
      (archivo) =>
        archivo.nombre.toLowerCase().includes(terminoLower) ||
        archivo.descripcion?.toLowerCase().includes(terminoLower),
    )
  }

  // Ordenar archivos
  static ordenarArchivos(
    archivos: ArchivoListItem[],
    campo: 'nombre' | 'tipo' | 'creadoEn' | 'tamaño',
    direccion: 'asc' | 'desc' = 'asc',
  ): ArchivoListItem[] {
    return [...archivos].sort((a, b) => {
      let valorA: any
      let valorB: any

      switch (campo) {
        case 'nombre':
          valorA = a.nombre.toLowerCase()
          valorB = b.nombre.toLowerCase()
          break
        case 'tipo':
          valorA = a.tipo
          valorB = b.tipo
          break
        case 'creadoEn':
          valorA = new Date(a.creadoEn).getTime()
          valorB = new Date(b.creadoEn).getTime()
          break
        case 'tamaño':
          valorA = a.tamaño || 0
          valorB = b.tamaño || 0
          break
        default:
          return 0
      }

      if (valorA < valorB) return direccion === 'asc' ? -1 : 1
      if (valorA > valorB) return direccion === 'asc' ? 1 : -1
      return 0
    })
  }

  // Validar URL
  static validarUrl(url: string): { valido: boolean; mensaje?: string } {
    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valido: false, mensaje: 'Solo se permiten URLs con protocolo HTTP o HTTPS' }
      }
      return { valido: true }
    } catch {
      return { valido: false, mensaje: 'URL inválida' }
    }
  }

  // Obtener URL completa del archivo
  static obtenerUrlCompleta(archivo: Archivo): string {
    if (archivo.tipo === 'url') {
      return archivo.url
    }
    // Para archivos físicos, construir URL del backend
    return `http://localhost:3000${archivo.url}`
  }

  // Verificar si puede previsualizar archivo
  static puedePrevisualizar(archivo: Archivo): boolean {
    const tipoLower = archivo.tipo.toLowerCase()
    const imagenes = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
    return imagenes.includes(tipoLower) || tipoLower === 'pdf' || tipoLower === 'url'
  }
}
