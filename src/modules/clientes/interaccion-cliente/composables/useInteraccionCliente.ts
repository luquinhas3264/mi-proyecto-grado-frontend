// src/modules/clientes/interaccion-cliente/composables/useInteraccionCliente.ts
import { computed } from 'vue'
import { useInteraccionClienteStore } from '../store/interaccion-cliente.store'
import { usePermissions } from '@/modules/usuarios-internos/composables/usePermissions'
import type {
  InteraccionClienteConContacto,
  InteraccionClienteListItem,
  InteraccionClienteFilters,
  TipoInteraccion,
} from '../interfaces/interaccion-cliente.interface'
import { TIPOS_INTERACCION_OPTIONS } from '../interfaces/interaccion-cliente.interface'
import { InteraccionClienteService } from '../services/interaccion-cliente.service'

export function useInteraccionCliente() {
  const store = useInteraccionClienteStore()
  const { hasPermission } = usePermissions()

  // Estado reactivo del store
  const interacciones = computed(() => store.interacciones)
  const interaccionesPorContacto = computed(() => store.interaccionesPorContacto)
  const interaccionesPorCliente = computed(() => store.interaccionesPorCliente)
  const interaccionActual = computed(() => store.interaccionActual)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // Estadísticas computadas
  const estadisticas = computed(() => ({
    total: store.totalInteracciones,
    porTipo: store.interaccionesPorTipo,
    contactosConInteracciones: store.contactosConInteracciones.length,
    porMes: store.interaccionesPorMes,
    ultimasInteracciones: store.ultimasInteracciones,
  }))

  // Permisos específicos para interacciones
  const permisos = computed(() => ({
    ver: hasPermission('interacciones', 'ver'),
    crear: hasPermission('interacciones', 'crear'),
    // Nota: según el backend no hay editar/eliminar
  }))

  // Acciones del store
  const acciones = {
    // Cargar datos
    cargarPorContacto: (idContacto: string) => store.cargarInteraccionesPorContacto(idContacto),
    cargarPorCliente: (idCliente: string) => store.cargarInteraccionesPorCliente(idCliente),

    // CRUD operations
    crear: store.crearInteraccion,

    // Utilidades
    buscar: store.buscarInteracciones,
    obtenerEstadisticas: store.obtenerEstadisticas,

    // Limpiar estado
    limpiar: store.limpiarEstado,
    limpiarError: store.limpiarError,
    limpiarInteraccionActual: store.limpiarInteraccionActual,

    // Filtros
    establecerFiltros: store.establecerFiltros,
    limpiarFiltros: store.limpiarFiltros,
  }

  // Métodos de utilidad
  const utils = {
    // Formatear datos para mostrar
    formatearInteraccion: (interaccion: InteraccionClienteConContacto) => ({
      ...interaccion,
      fechaFormateada: InteraccionClienteService.formatearFecha(interaccion.fecha),
      tipoInfo: TIPOS_INTERACCION_OPTIONS.find((t) => t.value === interaccion.tipo),
      resumenDescripcion:
        interaccion.descripcion.length > 100
          ? interaccion.descripcion.substring(0, 100) + '...'
          : interaccion.descripcion,
    }),

    // Filtrar interacciones por criterios
    filtrarPor: {
      tipo: (tipo: TipoInteraccion) => interacciones.value.filter((i) => i.tipo === tipo),
      contacto: (idContacto: string) =>
        interacciones.value.filter((i) => i.idContacto === idContacto),
      fechaRango: (fechaDesde: string, fechaHasta?: string) => {
        const desde = new Date(fechaDesde)
        const hasta = fechaHasta ? new Date(fechaHasta) : new Date()
        return interacciones.value.filter((i) => {
          const fecha = new Date(i.fecha)
          return fecha >= desde && fecha <= hasta
        })
      },
      ultimaSemana: () => {
        const semanaAtras = new Date()
        semanaAtras.setDate(semanaAtras.getDate() - 7)
        return interacciones.value.filter((i) => new Date(i.fecha) >= semanaAtras)
      },
      ultimoMes: () => {
        const mesAtras = new Date()
        mesAtras.setMonth(mesAtras.getMonth() - 1)
        return interacciones.value.filter((i) => new Date(i.fecha) >= mesAtras)
      },
    },

    // Análisis y estadísticas
    analizar: {
      // Frecuencia de interacciones por contacto
      frecuenciaPorContacto: () => {
        const frecuencia = store.contactosConInteracciones
        return frecuencia.sort((a, b) => b.totalInteracciones - a.totalInteracciones)
      },

      // Tendencia de interacciones por mes
      tendenciaMensual: () => {
        const porMes = store.interaccionesPorMes
        const meses = Object.keys(porMes).sort()
        return meses.map((mes) => ({
          mes,
          total: porMes[mes],
          fecha: new Date(mes + '-01'),
        }))
      },

      // Distribución por tipo
      distribucionTipos: () => {
        const total = store.totalInteracciones
        return TIPOS_INTERACCION_OPTIONS.map((tipo) => {
          const cantidad = store.interaccionesPorTipo[tipo.value]?.length || 0
          return {
            ...tipo,
            cantidad,
            porcentaje: total > 0 ? ((cantidad / total) * 100).toFixed(1) : '0',
          }
        })
      },

      // Actividad reciente (últimos 7 días)
      actividadReciente: () => {
        const ultimaSemana = utils.filtrarPor.ultimaSemana()
        const porDia: Record<string, number> = {}

        ultimaSemana.forEach((interaccion) => {
          const fecha = new Date(interaccion.fecha).toISOString().split('T')[0]
          porDia[fecha] = (porDia[fecha] || 0) + 1
        })

        return Object.entries(porDia)
          .map(([fecha, cantidad]) => ({
            fecha,
            cantidad,
            fechaFormateada: new Date(fecha).toLocaleDateString('es-ES'),
          }))
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
      },
    },

    // Validaciones
    validar: {
      descripcion: (descripcion: string) => descripcion.length >= 10 && descripcion.length <= 500,
      fecha: (fecha: string) => {
        const fechaInteraccion = new Date(fecha)
        const ahora = new Date()
        return fechaInteraccion <= ahora // No puede ser futura
      },
      tipo: (tipo: string) => TIPOS_INTERACCION_OPTIONS.some((t) => t.value === tipo),
    },

    // Formateo de datos
    formato: {
      fecha: InteraccionClienteService.formatearFecha,
      fechaParaInput: InteraccionClienteService.formatearFechaParaInput,
      convertirFechaInput: InteraccionClienteService.convertirFechaInput,

      tiempoRelativo: (fecha: string) => {
        const ahora = new Date()
        const fechaInteraccion = new Date(fecha)
        const diferencia = ahora.getTime() - fechaInteraccion.getTime()

        const minutos = Math.floor(diferencia / (1000 * 60))
        const horas = Math.floor(diferencia / (1000 * 60 * 60))
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

        if (minutos < 1) return 'Hace un momento'
        if (minutos < 60) return `Hace ${minutos} minutos`
        if (horas < 24) return `Hace ${horas} horas`
        if (dias < 7) return `Hace ${dias} días`
        return fechaInteraccion.toLocaleDateString('es-ES')
      },

      truncarTexto: (texto: string, limite: number = 100) => {
        if (texto.length <= limite) return texto
        return texto.substring(0, limite) + '...'
      },
    },

    // Acciones rápidas
    acciones: {
      obtenerTipoInfo: (tipo: TipoInteraccion) =>
        TIPOS_INTERACCION_OPTIONS.find((t) => t.value === tipo),

      generarResumen: (interaccion: InteraccionClienteConContacto) => {
        const tipoInfo = utils.acciones.obtenerTipoInfo(interaccion.tipo)
        const fechaFormateada = utils.formato.tiempoRelativo(interaccion.fecha)
        return `${tipoInfo?.title} con ${interaccion.contacto.nombre} - ${fechaFormateada}`
      },

      // Crear plantilla de nueva interacción basada en una existente
      crearPlantillaDesdeExistente: (interaccion: InteraccionClienteConContacto) => ({
        tipo: interaccion.tipo,
        descripcion: `Seguimiento de: ${utils.formato.truncarTexto(interaccion.descripcion, 50)}`,
        fecha: new Date().toISOString().slice(0, 16), // Fecha actual
        idContacto: interaccion.idContacto,
      }),
    },
  }

  // Datos computados adicionales
  const resumen = computed(() => {
    const distribucion = utils.analizar.distribucionTipos()
    const actividad = utils.analizar.actividadReciente()
    const frecuencia = utils.analizar.frecuenciaPorContacto()

    return {
      distribucionTipos: distribucion,
      actividadReciente: actividad,
      contactosActivos: frecuencia.slice(0, 5), // Top 5 contactos más activos
      promedioInteraccionesPorContacto:
        frecuencia.length > 0 ? (store.totalInteracciones / frecuencia.length).toFixed(1) : '0',
    }
  })

  return {
    // Estado
    interacciones,
    interaccionesPorContacto,
    interaccionesPorCliente,
    interaccionActual,
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

    // Constantes útiles
    tiposInteraccion: TIPOS_INTERACCION_OPTIONS,
  }
}
