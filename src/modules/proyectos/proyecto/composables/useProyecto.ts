// src/modules/proyectos/proyecto/composables/useProyecto.ts
import { computed } from 'vue'
import { useProyectoStore } from '../store/proyecto.store'
import { usePermissions } from '@/modules/usuarios-internos/composables/usePermissions'
import type { ProyectoListItem, ProyectoFilters } from '../interfaces/proyecto.interface'
import { EstadoProyecto } from '../interfaces/proyecto.interface'

export function useProyecto() {
  const store = useProyectoStore()
  const { hasPermission } = usePermissions()

  // Estado reactivo del store
  const proyectos = computed(() => store.proyectos)
  const proyectoActual = computed(() => store.proyectoActual)
  const estadisticas = computed(() => store.estadisticas)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // Estadísticas computadas
  const resumenProyectos = computed(() => ({
    total: store.totalProyectos,
    activos: store.proyectosActivos.length,
    finalizados: store.proyectosFinalizados.length,
    proximosAVencer: store.proyectosProximosAVencer.length,
    atrasados: store.proyectosAtrasados.length,
    clientes: store.clientesConProyectos.length,
  }))

  // Permisos específicos para proyectos
  const permisos = computed(() => ({
    ver: hasPermission('proyectos', 'ver'),
    crear: hasPermission('proyectos', 'crear'),
    editar: hasPermission('proyectos', 'editar'),
    eliminar: hasPermission('proyectos', 'eliminar'),
  }))

  // Acciones del store
  const acciones = {
    // Cargar datos
    cargar: (filtros?: ProyectoFilters) => store.cargarProyectos(filtros),
    cargarEstadisticas: (clienteId?: string) => store.cargarEstadisticas(clienteId),
    obtenerDetalle: (id: string) => store.obtenerProyectoDetalle(id),

    // CRUD operations
    crear: store.crearProyecto,
    actualizar: store.actualizarProyecto,
    eliminar: store.eliminarProyecto,

    // Utilidades
    buscar: store.buscarProyectos,
    cambiarEstado: store.cambiarEstadoProyecto,

    // Limpiar estado
    limpiar: store.limpiarEstado,
    limpiarError: store.limpiarError,
    limpiarProyectoActual: store.limpiarProyectoActual,
  }

  // Métodos de utilidad
  const utils = {
    // Formatear datos para mostrar
    formatearProyecto: (proyecto: ProyectoListItem) => ({
      ...proyecto,
      fechaInicioFormateada: new Date(proyecto.fechaInicio).toLocaleDateString(),
      fechaFinFormateada: proyecto.fechaFin
        ? new Date(proyecto.fechaFin).toLocaleDateString()
        : 'Sin fecha fin',
      duracionDias: proyecto.fechaFin
        ? Math.ceil(
            (new Date(proyecto.fechaFin).getTime() - new Date(proyecto.fechaInicio).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null,
      progreso: calcularProgreso(proyecto),
    }),

    // Filtrar proyectos por criterios
    filtrarPor: {
      estado: (estado: EstadoProyecto) => proyectos.value.filter((p) => p.estado === estado),
      cliente: (clienteId: string) => proyectos.value.filter((p) => p.idCliente === clienteId),
      proximosAVencer: () => store.proyectosProximosAVencer,
      atrasados: () => store.proyectosAtrasados,
      activos: () => store.proyectosActivos,
    },

    // Validaciones
    validar: {
      nombre: (nombre: string) => nombre.trim().length >= 3,
      fechas: (fechaInicio: string, fechaFin?: string) => {
        if (!fechaFin) return true
        return new Date(fechaInicio) <= new Date(fechaFin)
      },
      cliente: (clienteId: string) => clienteId.trim().length > 0,
    },

    // Obtener color según estado
    obtenerColorEstado: (estado: EstadoProyecto) => {
      const colores = {
        [EstadoProyecto.PLANEADO]: 'info',
        [EstadoProyecto.EN_PROGRESO]: 'warning',
        [EstadoProyecto.FINALIZADO]: 'success',
      }
      return colores[estado] || 'grey'
    },

    // Obtener icono según estado
    obtenerIconoEstado: (estado: EstadoProyecto) => {
      const iconos = {
        [EstadoProyecto.PLANEADO]: 'mdi-clock-outline',
        [EstadoProyecto.EN_PROGRESO]: 'mdi-play-circle',
        [EstadoProyecto.FINALIZADO]: 'mdi-check-circle',
      }
      return iconos[estado] || 'mdi-help-circle'
    },

    // Calcular días restantes
    calcularDiasRestantes: (fechaFin: string | null) => {
      if (!fechaFin) return null
      const hoy = new Date()
      const fin = new Date(fechaFin)
      const diferencia = fin.getTime() - hoy.getTime()
      return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
    },

    // Verificar si está atrasado
    estaAtrasado: (fechaFin: string | null, estado: EstadoProyecto) => {
      if (!fechaFin || estado === EstadoProyecto.FINALIZADO) return false
      return new Date(fechaFin) < new Date()
    },
  }

  // Función auxiliar para calcular progreso
  function calcularProgreso(proyecto: ProyectoListItem): number {
    switch (proyecto.estado) {
      case EstadoProyecto.PLANEADO:
        return 0
      case EstadoProyecto.EN_PROGRESO:
        // Calcular progreso basado en tiempo transcurrido
        if (proyecto.fechaFin) {
          const inicio = new Date(proyecto.fechaInicio).getTime()
          const fin = new Date(proyecto.fechaFin).getTime()
          const ahora = new Date().getTime()

          if (ahora <= inicio) return 0
          if (ahora >= fin) return 90 // No 100% hasta que esté FINALIZADO

          const progreso = ((ahora - inicio) / (fin - inicio)) * 90
          return Math.round(progreso)
        }
        return 50 // Progreso estimado si no hay fecha fin
      case EstadoProyecto.FINALIZADO:
        return 100
      default:
        return 0
    }
  }

  // Datos computados adicionales
  const analytics = computed(() => {
    const clienteStats = Object.values(store.proyectosPorCliente).map(({ cliente, proyectos }) => ({
      cliente: cliente.razonSocial,
      total: proyectos.length,
      activos: proyectos.filter((p) => p.estado !== EstadoProyecto.FINALIZADO).length,
      finalizados: proyectos.filter((p) => p.estado === EstadoProyecto.FINALIZADO).length,
      atrasados: proyectos.filter((p) => p.estaAtrasado).length,
    }))

    return {
      porCliente: clienteStats,
      tendencias: {
        totalProyectos: store.totalProyectos,
        tasaFinalizacion:
          store.totalProyectos > 0
            ? ((store.proyectosFinalizados.length / store.totalProyectos) * 100).toFixed(1)
            : '0',
        proyectosEnRiesgo: store.proyectosAtrasados.length + store.proyectosProximosAVencer.length,
      },
    }
  })

  return {
    // Estado
    proyectos,
    proyectoActual,
    estadisticas,
    loading,
    error,

    // Estadísticas
    resumenProyectos,
    analytics,

    // Permisos
    permisos,

    // Acciones
    ...acciones,

    // Utilidades
    utils,
  }
}
