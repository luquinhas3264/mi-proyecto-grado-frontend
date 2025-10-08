<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card v-if="actividad">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-pencil</v-icon>
        Editar Actividad
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-row>
            <!-- Tipo de Actividad -->
            <!--
            <v-col cols="12">
              <v-select
                v-model="form.tipo"
                label="Tipo de actividad"
                :items="tiposActividad"
                item-title="label"
                item-value="value"
                prepend-inner-icon="mdi-tag"
                variant="outlined"
                color="#485696"
                :rules="rules.tipo"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            -->

            <!-- Descripción -->
            <v-col cols="12">
              <v-textarea
                v-model="form.descripcion"
                label="Descripción"
                prepend-inner-icon="mdi-text"
                variant="outlined"
                color="#485696"
                :rules="rules.descripcion"
                rows="4"
                auto-grow
                counter="500"
                placeholder="Describe los detalles de la actividad..."
              />
            </v-col>

            <v-col cols="12">
              <v-card variant="tonal" color="info" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="info">mdi-information</v-icon>
                    <span class="font-weight-medium">Información de la Actividad</span>
                  </div>
                  <div class="text-body-2">
                    <strong>Tipo:</strong>
                    <v-chip
                      :color="TipoActividadColors[actividad.tipo]"
                      :prepend-icon="TipoActividadIcons[actividad.tipo]"
                      size="small"
                      variant="tonal"
                      class="ml-2"
                    >
                      {{ TipoActividadLabels[actividad.tipo] }}
                    </v-chip>
                    <br />
                    <strong>Fecha:</strong> {{ formatearFecha(actividad.fecha) }}<br />
                    <strong>Usuario:</strong> {{ actividad.usuario?.nombre || 'Desconocido' }}<br />
                    <strong>Cliente:</strong> {{ nombreCliente || '-' }}<br />
                    <strong>Proyecto:</strong> {{ nombreProyecto || '-' }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Fecha -->
            <!--
            <v-col cols="12">
              <v-text-field
                v-model="form.fecha"
                label="Fecha y hora"
                type="datetime-local"
                prepend-inner-icon="mdi-calendar-clock"
                variant="outlined"
                color="#485696"
                :rules="rules.fecha"
              />
            </v-col>
            -->
          </v-row>

          <!-- Vista previa de cambios -->
          <v-card variant="tonal" color="warning" class="mb-4" v-if="hayCambios">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="warning">mdi-pencil-outline</v-icon>
                <span class="font-weight-medium">Vista Previa de Cambios</span>
              </div>

              <div class="mt-2 d-flex flex-wrap gap-1">
                <v-chip
                  v-if="form.tipo !== valoresOriginales.tipo"
                  color="warning"
                  variant="tonal"
                  size="small"
                >
                  <v-icon start>mdi-tag</v-icon>
                  Tipo modificado
                </v-chip>
                <v-chip
                  v-if="form.descripcion !== valoresOriginales.descripcion"
                  color="info"
                  variant="tonal"
                  size="small"
                >
                  <v-icon start>mdi-text</v-icon>
                  Descripción modificada
                </v-chip>
                <v-chip
                  v-if="form.fecha !== valoresOriginales.fecha"
                  color="primary"
                  variant="tonal"
                  size="small"
                >
                  <v-icon start>mdi-calendar</v-icon>
                  Fecha modificada
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-form>

        <!-- Error -->
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4" border="start" prominent>
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="outlined" @click="cancelar" :disabled="loading"> Cancelar </v-btn>
        <v-btn color="#485696" @click="onSubmit" :loading="loading" :disabled="!hayCambios">
          <v-icon start>mdi-content-save</v-icon>
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useActividadesStore } from '../store/actividades.store'
import type {
  Actividad,
  UpdateActividadDto,
  TipoActividad,
} from '../interfaces/actividad.interface'
import {
  TipoActividadLabels,
  TipoActividadIcons,
  TipoActividadColors,
} from '../interfaces/actividad.interface'

import { useClienteEmpresaStore } from '@/modules/clientes/cliente-empresa/store/cliente-empresa.store'
import { useProyectoStore } from '@/modules/proyectos/proyecto/store/proyecto.store'

interface Props {
  modelValue: boolean
  actividad: Actividad | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'actividad-actualizada': []
}>()

const actividadesStore = useActividadesStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateActividadDto>({
  tipo: undefined,
  descripcion: '',
  fecha: '',
})

const valoresOriginales = ref<UpdateActividadDto>({
  tipo: undefined,
  descripcion: '',
  fecha: '',
})

const loading = ref(false)
const error = ref('')

const clientesStore = useClienteEmpresaStore()
const proyectosStore = useProyectoStore()

// Tipos de actividad para el select
const tiposActividad = computed(() => {
  return Object.entries(TipoActividadLabels).map(([value, label]) => ({
    value: value as TipoActividad,
    label,
    icon: TipoActividadIcons[value as TipoActividad],
    color: TipoActividadColors[value as TipoActividad],
  }))
})

// Validaciones
const rules = {
  tipo: [(v: any) => !!v || 'El tipo de actividad es obligatorio'],
  descripcion: [
    (v: string) => !!v || 'La descripción es obligatoria',
    (v: string) => v.length >= 5 || 'La descripción debe tener al menos 5 caracteres',
    (v: string) => v.length <= 500 || 'La descripción no puede exceder 500 caracteres',
  ],
  fecha: [(v: string) => !!v || 'La fecha es obligatoria'],
}

// Computed
const hayCambios = computed(() => {
  return (
    form.value.tipo !== valoresOriginales.value.tipo ||
    form.value.descripcion !== valoresOriginales.value.descripcion ||
    form.value.fecha !== valoresOriginales.value.fecha
  )
})

const nombreCliente = computed(() => {
  if (!props.actividad?.idCliente) return '-'
  const cliente = clientesStore.obtenerClientePorId(props.actividad.idCliente)
  return cliente?.razonSocial || '-'
})

const nombreProyecto = computed(() => {
  if (!props.actividad?.idProyecto) return '-'
  const proyecto = proyectosStore.obtenerProyectoPorId(props.actividad.idProyecto)
  return proyecto?.nombre || '-'
})

// Métodos
function cargarDatosActividad() {
  if (props.actividad) {
    // Convertir fecha de "yyyy-MM-dd HH:mm:ss" a formato datetime-local
    const fechaFormateada = props.actividad.fecha.replace(' ', 'T').substring(0, 16)

    form.value = {
      tipo: props.actividad.tipo,
      descripcion: props.actividad.descripcion,
      fecha: fechaFormateada,
    }

    valoresOriginales.value = { ...form.value }
  }
}

async function onSubmit() {
  if (!props.actividad) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateActividadDto = {}

    if (form.value.tipo !== valoresOriginales.value.tipo) {
      cambios.tipo = form.value.tipo
    }

    if (form.value.descripcion !== valoresOriginales.value.descripcion) {
      cambios.descripcion = form.value.descripcion?.trim()
    }

    if (form.value.fecha !== valoresOriginales.value.fecha) {
      // Convertir de datetime-local a ISO string
      cambios.fecha = new Date(form.value.fecha!).toISOString()
    }

    await actividadesStore.actualizarActividad(props.actividad.idActividad, cambios)
    emit('actividad-actualizada')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar la actividad'
  } finally {
    loading.value = false
  }
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function cancelar() {
  emit('update:modelValue', false)
  error.value = ''
}

function limpiarFormulario() {
  form.value = {
    tipo: undefined,
    descripcion: '',
    fecha: '',
  }
  error.value = ''
  formRef.value?.resetValidation()
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.actividad) {
      cargarDatosActividad()
    }
  },
)

watch(
  () => props.actividad,
  () => {
    if (props.modelValue && props.actividad) {
      cargarDatosActividad()
    }
  },
)
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-card-title {
  padding: 1.5rem;
  background: linear-gradient(135deg, #ff8c00 0%, #ffb74d 100%);
  color: white;
  font-weight: 600;
}

.v-card-actions {
  background: #f8f9fa;
}

.gap-1 {
  gap: 0.25rem;
}
</style>
