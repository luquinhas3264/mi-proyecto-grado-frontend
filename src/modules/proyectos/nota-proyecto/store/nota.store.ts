// src/modules/proyectos/nota-proyecto/store/nota.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { NotaProyectoService } from '../services/nota.service'
import type {
  NotaProyecto,
  CreateNotaProyectoDto,
  UpdateNotaProyectoDto,
} from '../interfaces/nota.interface'

export const useNotaProyectoStore = defineStore('notaProyecto', () => {
  // State
  const notas = ref<NotaProyecto[]>([])
  const notaActual = ref<NotaProyecto | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const proyectoActualId = ref<string | null>(null)

  // Getters
  const totalNotas = computed(() => notas.value.length)

  const notasOrdenadas = computed(() => {
    return [...notas.value].sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })
  })

  const notasRecientes = computed(() => {
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)

    return notasOrdenadas.value.filter((nota) => new Date(nota.fecha) >= hace7Dias)
  })

  const notasPorMes = computed(() => {
    const mesesMap = new Map<string, NotaProyecto[]>()

    notasOrdenadas.value.forEach((nota) => {
      const fecha = new Date(nota.fecha)
      const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`

      if (!mesesMap.has(mesAno)) {
        mesesMap.set(mesAno, [])
      }
      mesesMap.get(mesAno)!.push(nota)
    })

    return Array.from(mesesMap.entries()).map(([mesAno, notas]) => ({
      mesAno,
      notas,
      cantidad: notas.length,
    }))
  })

  // Actions
  async function cargarNotasProyecto(idProyecto: string) {
    loading.value = true
    error.value = null
    proyectoActualId.value = idProyecto

    try {
      const data = await NotaProyectoService.listarPorProyecto(idProyecto)
      notas.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar notas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function crearNota(idProyecto: string, dto: CreateNotaProyectoDto): Promise<NotaProyecto> {
    loading.value = true
    error.value = null

    try {
      const nuevaNota = await NotaProyectoService.crear(idProyecto, dto)
      notas.value.unshift(nuevaNota) // Agregar al inicio
      return nuevaNota
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear nota'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function actualizarNota(idNota: string, dto: UpdateNotaProyectoDto): Promise<NotaProyecto> {
    loading.value = true
    error.value = null

    try {
      const notaActualizada = await NotaProyectoService.actualizar(idNota, dto)

      // Actualizar en el array local
      const index = notas.value.findIndex((n) => n.idNota === idNota)
      if (index !== -1) {
        notas.value[index] = notaActualizada
      }

      return notaActualizada
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar nota'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function eliminarNota(idNota: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await NotaProyectoService.eliminar(idNota)

      // Eliminar del array local
      notas.value = notas.value.filter((n) => n.idNota !== idNota)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar nota'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function buscarNotas(termino: string) {
    if (!proyectoActualId.value) return

    loading.value = true
    error.value = null

    try {
      const resultados = await NotaProyectoService.buscar(proyectoActualId.value, termino)
      notas.value = resultados
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al buscar notas'
      throw err
    } finally {
      loading.value = false
    }
  }

  function limpiarNotas() {
    notas.value = []
    notaActual.value = null
    proyectoActualId.value = null
    error.value = null
  }

  function setNotaActual(nota: NotaProyecto | null) {
    notaActual.value = nota
  }

  return {
    // State
    notas,
    notaActual,
    loading,
    error,
    proyectoActualId,

    // Getters
    totalNotas,
    notasOrdenadas,
    notasRecientes,
    notasPorMes,

    // Actions
    cargarNotasProyecto,
    crearNota,
    actualizarNota,
    eliminarNota,
    buscarNotas,
    limpiarNotas,
    setNotaActual,
  }
})
