// src/modules/clientes/cliente-empresa/composables/useClienteEmpresa.ts
import { computed } from 'vue'
import { useClienteEmpresaStore } from '../store/cliente-empresa.store'
import { usePermissions } from '@/modules/usuarios-internos/composables/usePermissions'
import type {
  ClienteEmpresaListItem,
  ClienteEmpresaFilters,
} from '../interfaces/cliente-empresa.interface'

export function useClienteEmpresa() {
  const store = useClienteEmpresaStore()
  const { hasPermission } = usePermissions()

  // Estado reactivo del store
  const clientes = computed(() => store.clientes)
  const clienteActual = computed(() => store.clienteActual)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // Estadísticas computadas
  const estadisticas = computed(() => ({
    total: store.totalClientes,
    activos: store.clientesActivos.length,
    inactivos: store.clientesInactivos.length,
    rubros: Object.keys(store.clientesPorRubro).length,
    conContactos: store.clientes.filter((c) => c.contactos.length > 0).length,
    sinContactos: store.clientesSinContactos.length,
  }))

  // Permisos específicos para clientes
  const permisos = computed(() => ({
    ver: hasPermission('clientes', 'ver'),
    crear: hasPermission('clientes', 'crear'),
    editar: hasPermission('clientes', 'editar'),
    eliminar: hasPermission('clientes', 'eliminar'),
  }))

  // Acciones del store
  const acciones = {
    // Cargar datos
    cargar: (filtros?: ClienteEmpresaFilters) => store.cargarClientes(filtros),
    obtenerDetalle: (id: string) => store.obtenerClienteDetalle(id),

    // CRUD operations
    crear: store.crearCliente,
    actualizar: store.actualizarCliente,
    eliminar: store.eliminarCliente,

    // Utilidades
    buscar: store.buscarClientes,
    toggleEstado: store.toggleEstadoCliente,

    // Limpiar estado
    limpiar: store.limpiarEstado,
    limpiarError: store.limpiarError,
    limpiarClienteActual: store.limpiarClienteActual,
  }

  // Métodos de utilidad
  const utils = {
    // Formatear datos para mostrar
    formatearCliente: (cliente: ClienteEmpresaListItem) => ({
      ...cliente,
      iniciales: cliente.razonSocial
        .split(' ')
        .map((palabra) => palabra.charAt(0).toUpperCase())
        .slice(0, 2)
        .join(''),
      etiquetasTexto: cliente.etiquetas.map((e) => e.etiqueta.nombre).join(', '),
      contactosCount: cliente.contactos.length,
      contactosActivos: cliente.contactos.filter((c) => c.activo).length,
    }),

    // Filtrar clientes por criterios
    filtrarPor: {
      estado: (activo: boolean) => clientes.value.filter((c) => c.activo === activo),
      rubro: (rubro: string) => clientes.value.filter((c) => c.rubro === rubro),
      conEtiqueta: (etiquetaId: string) =>
        clientes.value.filter((c) => c.etiquetas.some((e) => e.idEtiqueta === etiquetaId)),
      sinContactos: () => clientes.value.filter((c) => c.contactos.length === 0),
    },

    // Validaciones
    validar: {
      email: (email: string) => /^\S+@\S+\.\S+$/.test(email),
      telefono: (telefono: string) => telefono.length >= 7,
      razonSocial: (razonSocial: string) => razonSocial.length >= 2,
    },

    // Acciones rápidas
    acciones: {
      enviarCorreo: (cliente: ClienteEmpresaListItem) => {
        window.open(`mailto:${cliente.correo}`)
      },
      llamar: (cliente: ClienteEmpresaListItem) => {
        window.open(`tel:${cliente.telefono}`)
      },
      copiarInfo: (cliente: ClienteEmpresaListItem) => {
        const info = `${cliente.razonSocial}\n${cliente.correo}\n${cliente.telefono}\n${cliente.direccion}`
        navigator.clipboard.writeText(info)
      },
    },
  }

  // Datos computados adicionales
  const resumen = computed(() => {
    const rubrosStats = Object.entries(store.clientesPorRubro).map(([rubro, clientes]) => ({
      rubro,
      total: clientes.length,
      activos: clientes.filter((c) => c.activo).length,
      porcentaje: ((clientes.length / store.totalClientes) * 100).toFixed(1),
    }))

    return {
      rubros: rubrosStats,
      clientesSinContactos: store.clientesSinContactos.length,
      porcentajeActivos:
        store.totalClientes > 0
          ? ((store.clientesActivos.length / store.totalClientes) * 100).toFixed(1)
          : '0',
    }
  })

  return {
    // Estado
    clientes,
    clienteActual,
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
