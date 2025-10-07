// src/modules/proyectos/archivos/store/archivo.store.ts
import { defineStore } from 'pinia'
import type {
  Archivo,
  ArchivoListItem,
  CreateEnlaceDto,
  UpdateArchivoDto,
  FiltrosArchivoDto,
  ArchivoEstadisticas,
  CategoriaArchivo,
} from '../interfaces/archivo.interface'
import {
  obtenerCategoriaArchivo,
  formatearTamaño,
  obtenerExtension,
  obtenerIconoArchivo,
  esImagen,
  puedePrevisualizar,
} from '../interfaces/archivo.interface'
import { ArchivoService } from '../services/archivo.service'

interface ArchivoState {
  archivos: ArchivoListItem[]
  archivoActual: Archivo | null
  loading: boolean
  uploadProgress: number
  error: string | null
  filtros: FiltrosArchivoDto
}

export const useArchivoStore = defineStore('archivo', {
  state: (): ArchivoState => ({
    archivos: [],
    archivoActual: null,
    loading: false,
    uploadProgress: 0,
    error: null,
    filtros: {},
  }),

  getters: {
    // Total de archivos
    totalArchivos: (state) => state.archivos.length,

    // Archivos físicos (no enlaces)
    archivosFisicos: (state) => state.archivos.filter((a) => a.tipo !== 'url'),

    // Enlaces externos
    enlaces: (state) => state.archivos.filter((a) => a.tipo === 'url'),

    // Archivos por categoría
    archivosPorCategoria: (state) => {
      return (categoria: CategoriaArchivo) =>
        state.archivos.filter((a) => a.categoria === categoria)
    },

    // Archivos de imágenes
    imagenes: (state) => state.archivos.filter((a) => esImagen(a.tipo)),

    // Documentos
    documentos: (state) =>
      state.archivos.filter((a) => obtenerCategoriaArchivo(a.tipo) === 'documento'),

    // Archivos comprimidos
    comprimidos: (state) =>
      state.archivos.filter((a) => obtenerCategoriaArchivo(a.tipo) === 'comprimido'),

    // Espacio usado total
    espacioUsado: (state) => {
      return state.archivos.reduce((total, archivo) => total + (archivo.tamaño || 0), 0)
    },

    // Espacio usado formateado
    espacioUsadoFormateado: (state) => {
      const total = state.archivos.reduce((acc, archivo) => acc + (archivo.tamaño || 0), 0)
      return formatearTamaño(total)
    },

    // Estadísticas completas
    estadisticas: (state): ArchivoEstadisticas => {
      const stats: ArchivoEstadisticas = {
        totalArchivos: state.archivos.filter((a) => a.tipo !== 'url').length,
        totalEnlaces: state.archivos.filter((a) => a.tipo === 'url').length,
        espacioUsado: state.archivos.reduce((acc, archivo) => acc + (archivo.tamaño || 0), 0),
        espacioUsadoFormateado: '',
        porCategoria: {
          documento: 0,
          imagen: 0,
          comprimido: 0,
          enlace: 0,
          otro: 0,
        },
        porTipo: {},
      }

      stats.espacioUsadoFormateado = formatearTamaño(stats.espacioUsado)

      // Contar por categoría
      state.archivos.forEach((archivo) => {
        stats.porCategoria[archivo.categoria]++
        stats.porTipo[archivo.tipo] = (stats.porTipo[archivo.tipo] || 0) + 1
      })

      return stats
    },

    // Archivos ordenados por fecha (más recientes primero)
    archivosRecientes: (state) =>
      [...state.archivos].sort(
        (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
      ),

    // Archivos que pueden previsualizarse
    archivosConPreview: (state) => state.archivos.filter((a) => puedePrevisualizar(a.tipo)),

    // Obtener archivo por ID
    obtenerArchivoPorId: (state) => {
      return (id: string) => state.archivos.find((a) => a.idArchivo === id)
    },

    // Verificar si hay archivos cargando
    estaCargando: (state) => state.loading,

    // Verificar si hay progreso de subida
    tieneProgreso: (state) => state.uploadProgress > 0 && state.uploadProgress < 100,
  },

  actions: {
    // Cargar archivos de un proyecto
    async cargarArchivosPorProyecto(idProyecto: string, filtros?: FiltrosArchivoDto) {
      this.loading = true
      this.error = null
      this.filtros = filtros || {}

      try {
        const archivosRaw = await ArchivoService.obtenerArchivosPorProyecto(idProyecto, filtros)

        // Enriquecer archivos con datos calculados
        this.archivos = archivosRaw.map((archivo) => this.enriquecerArchivo(archivo))
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar archivos'
        console.error('Error cargando archivos:', error)
      } finally {
        this.loading = false
      }
    },

    // Subir archivo físico
    async subirArchivo(idProyecto: string, archivo: File, descripcion?: string) {
      this.loading = true
      this.uploadProgress = 0
      this.error = null

      try {
        const archivoSubido = await ArchivoService.subirArchivo(idProyecto, archivo, descripcion)

        // Agregar a la lista local
        const archivoEnriquecido = this.enriquecerArchivo(archivoSubido as any)
        this.archivos.unshift(archivoEnriquecido)

        this.uploadProgress = 100
        return archivoSubido
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al subir archivo'
        throw error
      } finally {
        this.loading = false
        setTimeout(() => {
          this.uploadProgress = 0
        }, 1000)
      }
    },

    // Subir múltiples archivos
    async subirMultiplesArchivos(idProyecto: string, archivos: File[], descripciones?: string[]) {
      this.loading = true
      this.uploadProgress = 0
      this.error = null

      try {
        const archivosSubidos = await ArchivoService.subirMultiplesArchivos(
          idProyecto,
          archivos,
          descripciones,
        )

        // Agregar a la lista local
        const archivosEnriquecidos = archivosSubidos.map((a) => this.enriquecerArchivo(a as any))
        this.archivos.unshift(...archivosEnriquecidos)

        this.uploadProgress = 100
        return archivosSubidos
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al subir archivos'
        throw error
      } finally {
        this.loading = false
        setTimeout(() => {
          this.uploadProgress = 0
        }, 1000)
      }
    },

    // Agregar enlace externo
    async agregarEnlace(idProyecto: string, dto: CreateEnlaceDto) {
      this.loading = true
      this.error = null

      try {
        const enlace = await ArchivoService.agregarEnlace(idProyecto, dto)

        // Agregar a la lista local
        const enlaceEnriquecido = this.enriquecerArchivo(enlace as any)
        this.archivos.unshift(enlaceEnriquecido)

        return enlace
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al agregar enlace'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Descargar archivo
    async descargarArchivo(idArchivo: string, nombreArchivo: string) {
      this.loading = true
      this.error = null

      try {
        await ArchivoService.descargarYGuardar(idArchivo, nombreArchivo)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al descargar archivo'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Actualizar archivo
    async actualizarArchivo(idArchivo: string, dto: UpdateArchivoDto) {
      this.loading = true
      this.error = null

      try {
        const archivoActualizado = await ArchivoService.actualizarArchivo(idArchivo, dto)

        // Actualizar en la lista local
        const index = this.archivos.findIndex((a) => a.idArchivo === idArchivo)
        if (index !== -1) {
          this.archivos[index] = this.enriquecerArchivo({
            ...this.archivos[index],
            ...archivoActualizado,
          } as any)
        }

        return archivoActualizado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar archivo'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Eliminar archivo
    async eliminarArchivo(idArchivo: string) {
      this.loading = true
      this.error = null

      try {
        await ArchivoService.eliminarArchivo(idArchivo)

        // Remover de la lista local
        this.archivos = this.archivos.filter((a) => a.idArchivo !== idArchivo)

        // Limpiar archivo actual si coincide
        if (this.archivoActual && this.archivoActual.idArchivo === idArchivo) {
          this.archivoActual = null
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar archivo'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Previsualizar URL
    async previsualizarUrl(url: string) {
      this.loading = true
      this.error = null

      try {
        const preview = await ArchivoService.previsualizarUrl({ url })
        return preview
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al previsualizar URL'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Filtrar archivos localmente
    filtrarArchivos(filtros: FiltrosArchivoDto) {
      let resultado = [...this.archivos]

      // Filtrar por tipo
      if (filtros.tipo) {
        resultado = resultado.filter((a) => a.tipo === filtros.tipo)
      }

      // Filtrar por búsqueda
      if (filtros.busqueda) {
        const termino = filtros.busqueda.toLowerCase()
        resultado = resultado.filter(
          (a) =>
            a.nombre.toLowerCase().includes(termino) ||
            a.descripcion?.toLowerCase().includes(termino),
        )
      }

      // Filtrar por fechas
      if (filtros.fechaDesde) {
        const fechaDesde = new Date(filtros.fechaDesde).getTime()
        resultado = resultado.filter((a) => new Date(a.creadoEn).getTime() >= fechaDesde)
      }

      if (filtros.fechaHasta) {
        const fechaHasta = new Date(filtros.fechaHasta).getTime()
        resultado = resultado.filter((a) => new Date(a.creadoEn).getTime() <= fechaHasta)
      }

      // Ordenar
      if (filtros.orderBy) {
        resultado = ArchivoService.ordenarArchivos(
          resultado,
          filtros.orderBy,
          filtros.orderDirection || 'asc',
        )
      }

      return resultado
    },

    // Enriquecer archivo con datos calculados
    enriquecerArchivo(archivo: Archivo): ArchivoListItem {
      const categoria = obtenerCategoriaArchivo(archivo.tipo)
      const extension = obtenerExtension(archivo.nombre)
      const icono = obtenerIconoArchivo(archivo.tipo)

      return {
        ...archivo,
        categoria,
        extension,
        tamañoFormateado: archivo.tamaño ? formatearTamaño(archivo.tamaño) : undefined,
        esEnlace: archivo.tipo === 'url',
        esImagen: esImagen(archivo.tipo),
        puedePrevisualizar: puedePrevisualizar(archivo.tipo),
        icono,
      }
    },

    // Buscar archivos
    buscarArchivos(termino: string) {
      if (!termino.trim()) return this.archivos

      const terminoLower = termino.toLowerCase()
      return this.archivos.filter(
        (a) =>
          a.nombre.toLowerCase().includes(terminoLower) ||
          a.descripcion?.toLowerCase().includes(terminoLower),
      )
    },

    // Limpiar estado
    limpiarEstado() {
      this.archivos = []
      this.archivoActual = null
      this.error = null
      this.filtros = {}
      this.uploadProgress = 0
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Establecer archivo actual
    establecerArchivoActual(archivo: Archivo | null) {
      this.archivoActual = archivo
    },

    // Actualizar progreso de subida (para uso externo)
    actualizarProgreso(progreso: number) {
      this.uploadProgress = Math.min(100, Math.max(0, progreso))
    },
  },
})
