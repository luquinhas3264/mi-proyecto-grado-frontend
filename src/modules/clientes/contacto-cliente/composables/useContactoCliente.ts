// src/modules/clientes/contacto-cliente/composables/useContactoCliente.ts
import { computed } from 'vue'
import { useContactoClienteStore } from '../store/contacto-cliente.store'
import { usePermissions } from '@/modules/usuarios-internos/composables/usePermissions'
import type {
  ContactoClienteListItem,
  ContactoClienteFilters,
} from '../interfaces/contacto-cliente.interface'

export function useContactoCliente() {
  const store = useContactoClienteStore()
  const { hasPermission } = usePermissions()

  // Estado reactivo del store
  const contactos = computed(() => store.contactos)
  const contactoActual = computed(() => store.contactoActual)
  const contactosPorCliente = computed(() => store.contactosPorCliente)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // Estadísticas computadas
  const estadisticas = computed(() => ({
    total: store.totalContactos,
    activos: store.contactosActivos.length,
    inactivos: store.contactosInactivos.length,
    cargos: Object.keys(store.contactosPorCargo).length,
    porCliente: Object.keys(store.contactosPorCliente).length,
  }))

  // Permisos específicos para contactos
  const permisos = computed(() => ({
    ver: hasPermission('contactos', 'ver'),
    crear: hasPermission('contactos', 'crear'),
    editar: hasPermission('contactos', 'editar'),
    eliminar: hasPermission('contactos', 'eliminar'),
  }))

  // Acciones del store
  const acciones = {
    // Cargar datos
    cargarPorCliente: (idCliente: string) => store.cargarContactosPorCliente(idCliente),
    obtenerDetalle: (id: string) => store.obtenerContactoDetalle(id),

    // CRUD operations
    crear: store.crearContacto,
    actualizar: store.actualizarContacto,
    eliminar: store.eliminarContacto,

    // Utilidades
    buscar: store.buscarContactos,
    toggleEstado: store.toggleEstadoContacto,

    // Limpiar estado
    limpiar: store.limpiarEstado,
    limpiarError: store.limpiarError,
    limpiarContactoActual: store.limpiarContactoActual,
  }

  // Métodos de utilidad
  const utils = {
    // Formatear datos para mostrar
    formatearContacto: (contacto: ContactoClienteListItem) => ({
      ...contacto,
      iniciales: contacto.nombre
        .split(' ')
        .map((palabra) => palabra.charAt(0).toUpperCase())
        .slice(0, 2)
        .join(''),
      nombreCompleto: contacto.nombre,
      infoContacto: `${contacto.email} | ${contacto.telefono}`,
    }),

    // Filtrar contactos por criterios
    filtrarPor: {
      estado: (activo: boolean) => contactos.value.filter((c) => c.activo === activo),
      cargo: (cargo: string) => contactos.value.filter((c) => c.cargo === cargo),
      cliente: (idCliente: string) => contactos.value.filter((c) => c.idCliente === idCliente),
    },

    // Validaciones
    validar: {
      email: (email: string) => /^\S+@\S+\.\S+$/.test(email),
      telefono: (telefono: string) => telefono.length >= 7,
      nombre: (nombre: string) => nombre.length >= 2,
      cargo: (cargo: string) => cargo.length >= 2,
    },

    // Acciones rápidas
    acciones: {
      enviarCorreo: (contacto: ContactoClienteListItem) => {
        window.open(`mailto:${contacto.email}`)
      },
      llamar: (contacto: ContactoClienteListItem) => {
        window.open(`tel:${contacto.telefono}`)
      },
      copiarInfo: (contacto: ContactoClienteListItem) => {
        const info = `${contacto.nombre}\n${contacto.cargo}\n${contacto.email}\n${contacto.telefono}`
        navigator.clipboard.writeText(info)
      },
    },
  }

  // Datos computados adicionales
  const resumen = computed(() => {
    const cargosStats = Object.entries(store.contactosPorCargo).map(([cargo, contactos]) => ({
      cargo,
      total: contactos.length,
      activos: contactos.filter((c) => c.activo).length,
      porcentaje: ((contactos.length / store.totalContactos) * 100).toFixed(1),
    }))

    return {
      cargos: cargosStats,
      porcentajeActivos:
        store.totalContactos > 0
          ? ((store.contactosActivos.length / store.totalContactos) * 100).toFixed(1)
          : '0',
    }
  })

  return {
    // Estado
    contactos,
    contactoActual,
    contactosPorCliente,
    loading,
    error,

    // Estadísticas
    estadisticas,
    resumen,

    // Permisos
    permisos,

    // Acciones
    ...acciones,

    // Utilidades
    utils,
  }
}
