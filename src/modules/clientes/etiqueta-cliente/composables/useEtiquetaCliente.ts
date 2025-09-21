// src/modules/clientes/etiqueta-cliente/composables/useEtiquetaCliente.ts
import { computed } from 'vue'
import { useEtiquetaClienteStore } from '../store/etiqueta-cliente.store'
import { usePermissions } from '@/modules/usuarios-internos/composables/usePermissions'
import type {
  EtiquetaClienteListItem,
  EtiquetaClienteFilters,
} from '../interfaces/etiqueta-cliente.interface'

export function useEtiquetaCliente() {
  const store = useEtiquetaClienteStore()
  const { hasPermission } = usePermissions()

  // Estado reactivo del store
  const etiquetas = computed(() => store.etiquetas)
  const etiquetaActual = computed(() => store.etiquetaActual)
  const etiquetasOrdenadas = computed(() => store.etiquetasOrdenadas)
  const asignaciones = computed(() => store.asignaciones)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // Estadísticas computadas
  const estadisticas = computed(() => ({
    total: store.totalEtiquetas,
    masUsadas: store.etiquetasMasUsadas.length,
    clientesConEtiquetas: Object.keys(store.asignaciones).length,
  }))

  // Permisos específicos para etiquetas
  const permisos = computed(() => ({
    ver: hasPermission('etiquetas', 'ver'),
    crear: hasPermission('etiquetas', 'crear'),
    editar: hasPermission('etiquetas', 'editar'),
    eliminar: hasPermission('etiquetas', 'eliminar'),
    asignar: hasPermission('etiquetas', 'asignar'),
  }))

  // Acciones del store
  const acciones = {
    // Cargar datos
    cargar: store.cargarEtiquetas,
    obtenerDetalle: (id: string) => store.obtenerEtiquetaDetalle(id),

    // CRUD operations
    crear: store.crearEtiqueta,
    actualizar: store.actualizarEtiqueta,
    eliminar: store.eliminarEtiqueta,

    // Gestión de asignaciones
    asignar: store.asignarEtiqueta,
    remover: store.removerEtiqueta,

    // Utilidades
    buscar: store.buscarEtiquetas,

    // Limpiar estado
    limpiar: store.limpiarEstado,
    limpiarError: store.limpiarError,
    limpiarEtiquetaActual: store.limpiarEtiquetaActual,
  }

  // Métodos de utilidad
  const utils = {
    // Verificaciones
    clienteTieneEtiqueta: (idCliente: string, idEtiqueta: string) =>
      store.clienteTieneEtiqueta(idCliente, idEtiqueta),

    // Obtener datos relacionados
    obtenerEtiquetasDeCliente: (idCliente: string) => store.obtenerEtiquetasDeCliente(idCliente),

    obtenerClientesConEtiqueta: (idEtiqueta: string) =>
      store.obtenerClientesConEtiqueta(idEtiqueta),

    // Formatear datos para mostrar
    formatearEtiqueta: (etiqueta: EtiquetaClienteListItem) => ({
      ...etiqueta,
      inicial: etiqueta.nombre.charAt(0).toUpperCase(),
      totalClientesTexto: `${etiqueta.totalClientes || 0} cliente${(etiqueta.totalClientes || 0) !== 1 ? 's' : ''}`,
    }),

    // Filtros
    filtrarPor: {
      nombre: (termino: string) =>
        etiquetas.value.filter((e) => e.nombre.toLowerCase().includes(termino.toLowerCase())),
    },

    // Validaciones
    validar: {
      nombre: (nombre: string) => {
        if (!nombre || nombre.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres'
        }
        if (nombre.trim().length > 50) {
          return 'El nombre no puede exceder 50 caracteres'
        }
        return true
      },
      nombreUnico: async (nombre: string, idExcluir?: string) => {
        const existe = etiquetas.value.some(
          (e) => e.nombre.toLowerCase() === nombre.toLowerCase() && e.idEtiqueta !== idExcluir,
        )
        return !existe || 'Ya existe una etiqueta con ese nombre'
      },
    },

    // Acciones rápidas
    acciones: {
      // Toggle asignación de etiqueta a cliente
      toggleAsignacion: async (idCliente: string, idEtiqueta: string) => {
        const tieneEtiqueta = store.clienteTieneEtiqueta(idCliente, idEtiqueta)
        if (tieneEtiqueta) {
          await store.removerEtiqueta(idCliente, idEtiqueta)
          return 'removida'
        } else {
          await store.asignarEtiqueta(idCliente, idEtiqueta)
          return 'asignada'
        }
      },

      // Asignar múltiples etiquetas a un cliente
      asignarMultiples: async (idCliente: string, etiquetasIds: string[]) => {
        const resultados = []
        for (const idEtiqueta of etiquetasIds) {
          try {
            await store.asignarEtiqueta(idCliente, idEtiqueta)
            resultados.push({ idEtiqueta, resultado: 'asignada' })
          } catch (error) {
            resultados.push({ idEtiqueta, resultado: 'error', error })
          }
        }
        return resultados
      },

      // Remover múltiples etiquetas de un cliente
      removerMultiples: async (idCliente: string, etiquetasIds: string[]) => {
        const resultados = []
        for (const idEtiqueta of etiquetasIds) {
          try {
            await store.removerEtiqueta(idCliente, idEtiqueta)
            resultados.push({ idEtiqueta, resultado: 'removida' })
          } catch (error) {
            resultados.push({ idEtiqueta, resultado: 'error', error })
          }
        }
        return resultados
      },
    },
  }

  // Colores predefinidos para etiquetas (simulado, ya que el backend no maneja colores)
  const coloresPredefinidos = [
    '#1976D2',
    '#388E3C',
    '#F57C00',
    '#D32F2F',
    '#7B1FA2',
    '#0288D1',
    '#00796B',
    '#F9A825',
    '#C2185B',
    '#5D4037',
    '#455A64',
    '#E64A19',
    '#00BCD4',
    '#8BC34A',
    '#FF9800',
  ]

  const generarColorEtiqueta = (nombre: string) => {
    // Generar color basado en el hash del nombre
    let hash = 0
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
    }
    return coloresPredefinidos[Math.abs(hash) % coloresPredefinidos.length]
  }

  // Datos computados adicionales
  const resumen = computed(() => {
    const etiquetasStats = store.etiquetasMasUsadas.map((etiqueta) => ({
      ...etiqueta,
      color: generarColorEtiqueta(etiqueta.nombre),
      porcentaje:
        store.totalEtiquetas > 0
          ? (((etiqueta.totalClientes || 0) / store.totalEtiquetas) * 100).toFixed(1)
          : '0',
    }))

    return {
      etiquetasPopulares: etiquetasStats,
      totalAsignaciones: Object.values(store.asignaciones).reduce(
        (total, etiquetas) => total + etiquetas.length,
        0,
      ),
    }
  })

  return {
    // Estado
    etiquetas,
    etiquetaActual,
    etiquetasOrdenadas,
    asignaciones,
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

    // Extras
    generarColorEtiqueta,
    coloresPredefinidos,
  }
}
