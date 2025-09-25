// src/modules/clientes/interaccion-cliente/store/interaccion-cliente.store.ts
import { defineStore } from 'pinia'
import type {
  InteraccionCliente,
  InteraccionClienteListItem,
  InteraccionClienteDetalle,
  InteraccionClienteConContacto,
  CreateInteraccionClienteDto,
  UpdateInteraccionClienteDto,
  InteraccionClienteFilters,
  TipoInteraccion,
} from '../interfaces/interaccion-cliente.interface'
import { InteraccionClienteService } from '../services/interaccion-cliente.service'

interface InteraccionClienteState {
  interacciones: InteraccionClienteConContacto[]
  interaccionesPorContacto: Record<string, InteraccionClienteListItem[]>
  interaccionesPorCliente: Record<string, InteraccionClienteConContacto[]>
  interaccionActual: InteraccionClienteDetalle | null
  loading: boolean
  error: string | null
  filtros: InteraccionClienteFilters
}

export const useInteraccionClienteStore = defineStore('interaccionCliente', {
  state: (): InteraccionClienteState => ({
    interacciones: [],
    interaccionesPorContacto: {},
    interaccionesPorCliente: {},
    interaccionActual: null,
    loading: false,
    error: null,
    filtros: {},
  }),

  getters: {
    // Total de interacciones
    totalInteracciones: (state) => state.interacciones.length,

    // Interacciones agrupadas por tipo
    interaccionesPorTipo: (state) => {
      return state.interacciones.reduce(
        (acc, interaccion) => {
          if (!acc[interaccion.tipo]) {
            acc[interaccion.tipo] = []
          }
          acc[interaccion.tipo].push(interaccion)
          return acc
        },
        {} as Record<TipoInteraccion, InteraccionClienteConContacto[]>,
      )
    },

    // Tipos únicos de interacción en uso
    tiposUnicos: (state) => {
      const tipos = [...new Set(state.interacciones.map((i) => i.tipo))]
      return tipos.sort()
    },

    // Contactos únicos con interacciones
    contactosConInteracciones: (state) => {
      const contactos = state.interacciones.reduce(
        (acc, interaccion) => {
          const contactoId = interaccion.idContacto
          if (!acc[contactoId]) {
            acc[contactoId] = {
              idContacto: contactoId,
              nombre: interaccion.contacto.nombre,
              totalInteracciones: 0,
            }
          }
          acc[contactoId].totalInteracciones += 1
          return acc
        },
        {} as Record<string, { idContacto: string; nombre: string; totalInteracciones: number }>,
      )

      return Object.values(contactos)
    },

    // Estadísticas por mes
    interaccionesPorMes: (state) => {
      return state.interacciones.reduce(
        (acc, interaccion) => {
          const fecha = new Date(interaccion.fecha)
          const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
          acc[mesAno] = (acc[mesAno] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )
    },

    // Obtener interacciones de un contacto específico
    obtenerInteraccionesDeContacto: (state) => {
      return (idContacto: string) => state.interaccionesPorContacto[idContacto] || []
    },

    // Obtener interacciones de un cliente específico
    obtenerInteraccionesDeCliente: (state) => {
      return (idCliente: string) => state.interaccionesPorCliente[idCliente] || []
    },

    // Interacción por ID
    obtenerInteraccionPorId: (state) => {
      return (id: string) => state.interacciones.find((i) => i.idInteraccion === id)
    },

    // Últimas interacciones (ordenadas por fecha)
    ultimasInteracciones: (state) => {
      return state.interacciones
        .slice()
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 10)
    },
  },

  actions: {
    // Cargar todas las interacciones (global)
    async cargarTodasInteracciones() {
      this.loading = true
      this.error = null

      try {
        const interacciones = await InteraccionClienteService.obtenerTodas()
        this.interacciones = interacciones
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar todas las interacciones'
        console.error('Error cargando todas las interacciones:', error)
      } finally {
        this.loading = false
      }
    },

    // Cargar interacciones por contacto específico
    async cargarInteraccionesPorContacto(idContacto: string) {
      this.loading = true
      this.error = null

      try {
        const interacciones = await InteraccionClienteService.obtenerPorContacto(idContacto)
        this.interaccionesPorContacto[idContacto] = interacciones

        // También actualizar la lista general si no existen
        interacciones.forEach((interaccion) => {
          const index = this.interacciones.findIndex(
            (i) => i.idInteraccion === interaccion.idInteraccion,
          )
          if (index === -1) {
            // Usar el objeto contacto que viene del backend
            const interaccionConContacto: InteraccionClienteConContacto = {
              ...interaccion,
              contacto: {
                nombre: interaccion.contacto?.nombre || 'Contacto',
                idCliente: interaccion.contacto?.idCliente || '',
              },
            }
            this.interacciones.push(interaccionConContacto)
          }
        })
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar interacciones del contacto'
        console.error('Error cargando interacciones por contacto:', error)
      } finally {
        this.loading = false
      }
    },

    // Cargar interacciones por cliente específico
    async cargarInteraccionesPorCliente(idCliente: string) {
      this.loading = true
      this.error = null

      try {
        const interacciones = await InteraccionClienteService.obtenerPorCliente(idCliente)
        this.interaccionesPorCliente[idCliente] = interacciones

        // Actualizar la lista general
        interacciones.forEach((interaccion) => {
          const index = this.interacciones.findIndex(
            (i) => i.idInteraccion === interaccion.idInteraccion,
          )
          if (index === -1) {
            this.interacciones.push(interaccion)
          } else {
            this.interacciones[index] = interaccion
          }
        })
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar interacciones del cliente'
        console.error('Error cargando interacciones por cliente:', error)
      } finally {
        this.loading = false
      }
    },

    // Crear nueva interacción
    async crearInteraccion(dto: CreateInteraccionClienteDto) {
      this.loading = true
      this.error = null

      try {
        const nuevaInteraccion = await InteraccionClienteService.crear(dto)

        // Agregar a la lista general (convertir a InteraccionClienteConContacto)
        const interaccionConContacto: InteraccionClienteConContacto = {
          idInteraccion: nuevaInteraccion.idInteraccion,
          tipo: nuevaInteraccion.tipo,
          descripcion: nuevaInteraccion.descripcion,
          fecha: nuevaInteraccion.fecha,
          idContacto: nuevaInteraccion.idContacto,
          contacto: {
            nombre: nuevaInteraccion.contacto?.nombre || 'Contacto',
            idCliente: nuevaInteraccion.contacto?.idCliente || '',
          },
        }
        this.interacciones.push(interaccionConContacto)

        // Agregar a la lista del contacto específico
        if (!this.interaccionesPorContacto[dto.idContacto]) {
          this.interaccionesPorContacto[dto.idContacto] = []
        }
        this.interaccionesPorContacto[dto.idContacto].push({
          idInteraccion: nuevaInteraccion.idInteraccion,
          tipo: nuevaInteraccion.tipo,
          descripcion: nuevaInteraccion.descripcion,
          fecha: nuevaInteraccion.fecha,
          idContacto: nuevaInteraccion.idContacto,
        })

        // Agregar a la lista del cliente específico si ya está cargada
        const idCliente = nuevaInteraccion.contacto.idCliente
        if (this.interaccionesPorCliente[idCliente]) {
          this.interaccionesPorCliente[idCliente].push(interaccionConContacto)
        }

        return nuevaInteraccion
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear interacción'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Buscar interacciones
    async buscarInteracciones(termino: string, idCliente?: string, idContacto?: string) {
      this.loading = true
      this.error = null

      try {
        const interacciones = await InteraccionClienteService.buscar(termino, idCliente, idContacto)

        if (idCliente && this.interaccionesPorCliente[idCliente]) {
          this.interaccionesPorCliente[idCliente] = interacciones
        } else if (idContacto && this.interaccionesPorContacto[idContacto]) {
          // Convertir resultados de búsqueda a formato de contacto
          this.interaccionesPorContacto[idContacto] = interacciones.map((i) => ({
            idInteraccion: i.idInteraccion,
            tipo: i.tipo,
            descripcion: i.descripcion,
            fecha: i.fecha,
            idContacto: i.idContacto,
          }))
        } else {
          this.interacciones = interacciones
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al buscar interacciones'
        console.error('Error buscando interacciones:', error)
      } finally {
        this.loading = false
      }
    },

    // Obtener estadísticas
    async obtenerEstadisticas(idCliente?: string) {
      this.loading = true
      this.error = null

      try {
        const stats = await InteraccionClienteService.obtenerEstadisticas(idCliente)
        return stats
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al obtener estadísticas'
        console.error('Error obteniendo estadísticas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Limpiar estado
    limpiarEstado() {
      this.interacciones = []
      this.interaccionesPorContacto = {}
      this.interaccionesPorCliente = {}
      this.interaccionActual = null
      this.error = null
      this.filtros = {}
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Limpiar interacción actual
    limpiarInteraccionActual() {
      this.interaccionActual = null
    },

    // Establecer filtros
    establecerFiltros(filtros: InteraccionClienteFilters) {
      this.filtros = { ...filtros }
    },

    // Limpiar filtros
    limpiarFiltros() {
      this.filtros = {}
    },
  },
})
