// src/modules/clientes/contacto-cliente/store/contacto-cliente.store.ts
import { defineStore } from 'pinia'
import type {
  ContactoCliente,
  ContactoClienteListItem,
  ContactoClienteDetalle,
  CreateContactoClienteDto,
  UpdateContactoClienteDto,
  ContactoClienteFilters,
} from '../interfaces/contacto-cliente.interface'
import { ContactoClienteService } from '../services/contacto-cliente.service'

interface ContactoClienteState {
  contactos: ContactoClienteListItem[]
  contactoActual: ContactoClienteDetalle | null
  contactosPorCliente: Record<string, ContactoClienteListItem[]>
  loading: boolean
  error: string | null
  filtros: ContactoClienteFilters
}

export const useContactoClienteStore = defineStore('contactoCliente', {
  state: (): ContactoClienteState => ({
    contactos: [],
    contactoActual: null,
    contactosPorCliente: {},
    loading: false,
    error: null,
    filtros: {},
  }),

  getters: {
    // Contactos filtrados por estado
    contactosActivos: (state) => state.contactos.filter((c) => c.activo),
    contactosInactivos: (state) => state.contactos.filter((c) => !c.activo),

    // Estadísticas básicas
    totalContactos: (state) => state.contactos.length,

    // Agrupar por cargo
    contactosPorCargo: (state) => {
      return state.contactos.reduce(
        (acc, contacto) => {
          if (!acc[contacto.cargo]) {
            acc[contacto.cargo] = []
          }
          acc[contacto.cargo].push(contacto)
          return acc
        },
        {} as Record<string, ContactoClienteListItem[]>,
      )
    },

    // Cargos únicos
    cargosUnicos: (state) => {
      const cargos = [...new Set(state.contactos.map((c) => c.cargo))]
      return cargos.sort()
    },

    // Contacto por ID
    obtenerContactoPorId: (state) => {
      return (id: string) => state.contactos.find((c) => c.idContacto === id)
    },

    // Obtener contactos de un cliente específico
    obtenerContactosDeCliente: (state) => {
      return (idCliente: string) => state.contactosPorCliente[idCliente] || []
    },
  },

  actions: {
    // Cargar contactos de un cliente específico
    async cargarContactosPorCliente(idCliente: string) {
      this.loading = true
      this.error = null

      try {
        const contactos = await ContactoClienteService.obtenerPorCliente(idCliente)
        this.contactosPorCliente[idCliente] = contactos

        // También actualizar la lista general si no existe
        contactos.forEach((contacto) => {
          const index = this.contactos.findIndex((c) => c.idContacto === contacto.idContacto)
          if (index === -1) {
            this.contactos.push(contacto)
          } else {
            this.contactos[index] = contacto
          }
        })
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar contactos'
        console.error('Error cargando contactos:', error)
      } finally {
        this.loading = false
      }
    },

    // Cargar todos los contactos (sin filtro de cliente)
    async cargarTodosContactos() {
      this.loading = true
      this.error = null

      try {
        const contactos = await ContactoClienteService.obtenerTodos()
        this.contactos = contactos
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar todos los contactos'
        console.error('Error cargando todos los contactos:', error)
      } finally {
        this.loading = false
      }
    },

    // Crear nuevo contacto
    async crearContacto(dto: CreateContactoClienteDto) {
      this.loading = true
      this.error = null

      try {
        const nuevoContacto = await ContactoClienteService.crear(dto)

        // Agregar a la lista general
        this.contactos.push(nuevoContacto)

        // Agregar a la lista del cliente específico
        if (!this.contactosPorCliente[dto.idCliente]) {
          this.contactosPorCliente[dto.idCliente] = []
        }
        this.contactosPorCliente[dto.idCliente].push(nuevoContacto)

        return nuevoContacto
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear contacto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener contacto específico con detalles
    async obtenerContactoDetalle(id: string) {
      this.loading = true
      this.error = null

      try {
        const contacto = await ContactoClienteService.obtenerPorId(id)
        this.contactoActual = contacto
        return contacto
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar contacto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Actualizar contacto
    async actualizarContacto(id: string, dto: UpdateContactoClienteDto) {
      this.loading = true
      this.error = null

      try {
        const contactoActualizado = await ContactoClienteService.actualizar(id, dto)

        // Actualizar en la lista general
        const index = this.contactos.findIndex((c) => c.idContacto === id)
        if (index !== -1) {
          this.contactos[index] = contactoActualizado
        }

        // Actualizar en la lista del cliente específico
        const idCliente = contactoActualizado.idCliente
        if (this.contactosPorCliente[idCliente]) {
          const clienteIndex = this.contactosPorCliente[idCliente].findIndex(
            (c) => c.idContacto === id,
          )
          if (clienteIndex !== -1) {
            this.contactosPorCliente[idCliente][clienteIndex] = contactoActualizado
          }
        }

        // Actualizar contacto actual si coincide
        if (this.contactoActual && this.contactoActual.idContacto === id) {
          this.contactoActual = {
            ...this.contactoActual,
            ...contactoActualizado,
          }
        }

        return contactoActualizado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar contacto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Eliminar contacto (soft delete)
    async eliminarContacto(id: string) {
      this.loading = true
      this.error = null

      try {
        const contactoEliminado = await ContactoClienteService.eliminar(id)

        // Actualizar estado local - el contacto se marca como inactivo
        const index = this.contactos.findIndex((c) => c.idContacto === id)
        if (index !== -1) {
          this.contactos[index] = {
            ...this.contactos[index],
            activo: false,
          }
        }

        // Actualizar en la lista del cliente específico
        const idCliente = contactoEliminado.idCliente
        if (this.contactosPorCliente[idCliente]) {
          const clienteIndex = this.contactosPorCliente[idCliente].findIndex(
            (c) => c.idContacto === id,
          )
          if (clienteIndex !== -1) {
            this.contactosPorCliente[idCliente][clienteIndex] = {
              ...this.contactosPorCliente[idCliente][clienteIndex],
              activo: false,
            }
          }
        }

        return contactoEliminado
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar contacto'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Alternar estado activo/inactivo
    async toggleEstadoContacto(id: string) {
      const contacto = this.contactos.find((c) => c.idContacto === id)
      if (contacto) {
        await this.actualizarContacto(id, {
          nombre: contacto.nombre,
          cargo: contacto.cargo,
          email: contacto.email,
          telefono: contacto.telefono,
          idCliente: contacto.idCliente,
          activo: !contacto.activo,
        })
      }
    },

    // Buscar contactos
    async buscarContactos(termino: string, idCliente?: string) {
      this.loading = true
      this.error = null

      try {
        const contactos = await ContactoClienteService.buscar(termino, idCliente)
        if (idCliente && this.contactosPorCliente[idCliente]) {
          // Solo actualizar la lista del cliente específico
          this.contactosPorCliente[idCliente] = contactos
        } else {
          this.contactos = contactos
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al buscar contactos'
        console.error('Error buscando contactos:', error)
      } finally {
        this.loading = false
      }
    },

    // Limpiar estado
    limpiarEstado() {
      this.contactos = []
      this.contactoActual = null
      this.contactosPorCliente = {}
      this.error = null
      this.filtros = {}
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Limpiar contacto actual
    limpiarContactoActual() {
      this.contactoActual = null
    },
  },
})
