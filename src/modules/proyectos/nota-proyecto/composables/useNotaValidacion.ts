// src/modules/proyectos/nota-proyecto/composables/useNotaValidacion.ts
import { computed, type Ref } from 'vue'

export function useNotaValidacion(contenido: Ref<string>) {
  // Constantes de validación
  const MIN_CARACTERES = 3
  const MAX_CARACTERES = 2000
  const UMBRAL_WARNING = 1500
  const UMBRAL_ERROR = 1800

  // Reglas de validación para v-text-field/v-textarea
  const rules = {
    contenido: [
      (v: string) => !!v || 'El contenido de la nota es obligatorio',
      (v: string) =>
        v.trim().length >= MIN_CARACTERES ||
        `El contenido debe tener al menos ${MIN_CARACTERES} caracteres`,
      (v: string) =>
        v.length <= MAX_CARACTERES || `El contenido no puede exceder ${MAX_CARACTERES} caracteres`,
    ],
  }

  // Computed - Estado de validación
  const esValido = computed(() => {
    const valor = contenido.value?.trim() || ''
    return valor.length >= MIN_CARACTERES && valor.length <= MAX_CARACTERES
  })

  const longitudActual = computed(() => contenido.value?.length || 0)

  const porcentajeUsado = computed(() => {
    return Math.round((longitudActual.value / MAX_CARACTERES) * 100)
  })

  const caracteresRestantes = computed(() => {
    return MAX_CARACTERES - longitudActual.value
  })

  // Computed - Colores y estados visuales
  const colorContador = computed(() => {
    if (longitudActual.value > UMBRAL_ERROR) return 'error'
    if (longitudActual.value > UMBRAL_WARNING) return 'warning'
    return 'success'
  })

  const nivelAlerta = computed(() => {
    if (longitudActual.value > UMBRAL_ERROR) return 'critico'
    if (longitudActual.value > UMBRAL_WARNING) return 'advertencia'
    return 'normal'
  })

  const mensajeEstado = computed(() => {
    if (!contenido.value) return 'Escribe el contenido de tu nota'

    if (longitudActual.value < MIN_CARACTERES) {
      return `Necesitas al menos ${MIN_CARACTERES - longitudActual.value} caracteres más`
    }

    if (longitudActual.value > UMBRAL_ERROR) {
      return `¡Cuidado! Solo quedan ${caracteresRestantes.value} caracteres`
    }

    if (longitudActual.value > UMBRAL_WARNING) {
      return `Acercándose al límite: ${caracteresRestantes.value} caracteres restantes`
    }

    return `${caracteresRestantes.value} caracteres disponibles`
  })

  // Métodos de utilidad
  const limpiarContenido = () => {
    return contenido.value?.trim() || ''
  }

  const truncarContenido = (maxLength = MAX_CARACTERES) => {
    if (contenido.value.length > maxLength) {
      return contenido.value.substring(0, maxLength)
    }
    return contenido.value
  }

  const contarPalabras = computed(() => {
    return contenido.value?.trim().split(/\s+/).filter(Boolean).length || 0
  })

  const contarLineas = computed(() => {
    return contenido.value?.split('\n').length || 0
  })

  return {
    // Validaciones
    rules,
    esValido,

    // Métricas
    longitudActual,
    porcentajeUsado,
    caracteresRestantes,
    contarPalabras,
    contarLineas,

    // Estados visuales
    colorContador,
    nivelAlerta,
    mensajeEstado,

    // Métodos
    limpiarContenido,
    truncarContenido,

    // Constantes
    MIN_CARACTERES,
    MAX_CARACTERES,
  }
}
