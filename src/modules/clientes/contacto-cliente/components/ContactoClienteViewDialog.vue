<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
  >
    <v-card v-if="contacto">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-account</v-icon>
        Detalles del Contacto
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <!-- Header con información principal -->
        <div class="text-center mb-6">
          <v-avatar size="80" color="#485696" class="mb-4">
            <span class="text-h4">{{ iniciales }}</span>
          </v-avatar>
          <h2 class="text-h5 mb-2">{{ contacto.nombre }}</h2>
          <v-chip color="info" size="large" variant="tonal" class="mb-2">
            {{ contacto.cargo }}
          </v-chip>
          <br />
          <v-chip :color="contacto.activo ? 'success' : 'error'" size="large" variant="tonal">
            <v-icon start :icon="contacto.activo ? 'mdi-check-circle' : 'mdi-close-circle'" />
            {{ contacto.activo ? 'Contacto Activo' : 'Contacto Inactivo' }}
          </v-chip>
        </div>

        <!-- Información del Cliente -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-domain</v-icon>
            Cliente Asociado
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex align-center">
              <v-avatar size="48" color="orange" class="mr-3">
                <span class="text-h6">{{ clienteInfo?.razonSocial?.charAt(0) || 'C' }}</span>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-medium">
                  {{ clienteInfo?.razonSocial || 'Cliente no encontrado' }}
                </div>
                <div class="text-body-2 text-grey-darken-1">{{ clienteInfo?.rubro || '' }}</div>
                <v-chip
                  v-if="clienteInfo"
                  :color="clienteInfo.activo ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                  class="mt-1"
                >
                  {{ clienteInfo.activo ? 'Cliente Activo' : 'Cliente Inactivo' }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Información de Contacto -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-contacts</v-icon>
            Información de Contacto
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="success" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-email</v-icon>
                    Correo
                  </v-chip>
                  <div class="text-body-1">
                    {{ contacto.email }}
                    <v-btn
                      icon="mdi-content-copy"
                      size="x-small"
                      variant="text"
                      @click="copiarTexto(contacto.email)"
                      class="ml-2"
                    />
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-3">
                  <v-chip color="warning" variant="tonal" size="small" class="mb-1">
                    <v-icon start>mdi-phone</v-icon>
                    Teléfono
                  </v-chip>
                  <div class="text-body-1">
                    {{ contacto.telefono }}
                    <v-btn
                      icon="mdi-content-copy"
                      size="x-small"
                      variant="text"
                      @click="copiarTexto(contacto.telefono)"
                      class="ml-2"
                    />
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Información del Sistema -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-information</v-icon>
            Información del Sistema
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="text-body-2">
              <div class="mb-2">
                <v-chip color="purple" variant="tonal" size="small" class="mb-1">
                  <v-icon start>mdi-identifier</v-icon>
                  ID de Contacto
                </v-chip>
                <div class="text-body-2 text-grey-darken-1 font-mono">
                  {{ contacto.idContacto }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Historial de Interacciones -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-calendar-account</v-icon>
            Historial de Interacciones
            <v-spacer />
            <v-chip color="white" size="small" variant="tonal">
              {{ interaccionesContacto.length }} interacciones
            </v-chip>
          </v-card-title>
          <v-card-text class="pt-4">
            <div v-if="loadingInteracciones" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" />
              <div class="text-body-2 mt-2">Cargando interacciones...</div>
            </div>

            <div v-else-if="interaccionesContacto.length === 0" class="text-center py-4">
              <v-icon size="48" color="grey-lighten-1">mdi-calendar-remove</v-icon>
              <div class="text-body-2 text-grey-darken-1 mt-2">
                No hay interacciones registradas con este contacto
              </div>
            </div>

            <div v-else>
              <!-- Lista de interacciones recientes (últimas 5) -->
              <v-timeline density="compact" class="ml-2">
                <v-timeline-item
                  v-for="interaccion in interaccionesRecientes"
                  :key="interaccion.idInteraccion"
                  :dot-color="getTipoColor(interaccion.tipo)"
                  size="small"
                >
                  <template v-slot:icon>
                    <v-icon size="16">{{ getTipoIcon(interaccion.tipo) }}</v-icon>
                  </template>

                  <div class="d-flex justify-space-between align-start">
                    <div style="flex: 1">
                      <div class="d-flex align-center mb-1">
                        <v-chip
                          :color="getTipoColor(interaccion.tipo)"
                          size="x-small"
                          variant="tonal"
                          class="mr-2"
                        >
                          {{ getTipoTitulo(interaccion.tipo) }}
                        </v-chip>
                        <span class="text-caption text-grey-darken-1">
                          {{ formatearFechaRelativa(interaccion.fecha) }}
                        </span>
                      </div>
                      <div class="text-body-2 mb-1">
                        {{ truncarTexto(interaccion.descripcion, 120) }}
                      </div>
                    </div>
                    <v-btn
                      icon="mdi-eye"
                      size="x-small"
                      variant="text"
                      @click="verInteraccionDetalle(interaccion)"
                    />
                  </div>
                </v-timeline-item>
              </v-timeline>

              <!-- Botón para ver todas si hay más de 5 -->
              <div v-if="interaccionesContacto.length > 5" class="text-center mt-3">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="verTodasInteracciones"
                >
                  Ver todas las {{ interaccionesContacto.length }} interacciones
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Acciones Rápidas -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Acciones Rápidas
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-if="hasPermission('contactos', 'editar')"
                color="warning"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="editarContacto"
              >
                Editar Contacto
              </v-btn>

              <v-btn
                v-if="hasPermission('contactos', 'editar')"
                :color="contacto.activo ? 'error' : 'success'"
                variant="outlined"
                size="small"
                :prepend-icon="contacto.activo ? 'mdi-account-off' : 'mdi-account-check'"
                @click="toggleEstado"
              >
                {{ contacto.activo ? 'Desactivar' : 'Activar' }}
              </v-btn>

              <v-btn
                color="info"
                variant="outlined"
                size="small"
                prepend-icon="mdi-email-send"
                @click="enviarCorreo"
              >
                Enviar Correo
              </v-btn>

              <v-btn
                color="success"
                variant="outlined"
                size="small"
                prepend-icon="mdi-phone"
                @click="llamar"
              >
                Llamar
              </v-btn>

              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-domain"
                @click="verCliente"
              >
                Ver Cliente
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          prepend-icon="mdi-close"
          @click="$emit('update:modelValue', false)"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar para confirmación de copiado -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="2000"
      location="top right"
    >
      {{ snackbar.message }}
    </v-snackbar>

    <InteraccionClienteViewDialog
      v-if="interaccionSeleccionada"
      v-model="showInteraccionDialog"
      :interaccion="interaccionSeleccionada"
      @update:model-value="showInteraccionDialog = $event"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useClienteEmpresaStore } from '../../cliente-empresa/store/cliente-empresa.store'
import type { ContactoClienteListItem } from '../interfaces/contacto-cliente.interface'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

import { useInteraccionClienteStore } from '../../interaccion-cliente/store/interaccion-cliente.store'
import { TIPOS_INTERACCION_OPTIONS } from '../../interaccion-cliente/interfaces/interaccion-cliente.interface'

import InteraccionClienteViewDialog from '../../interaccion-cliente/components/InteraccionClienteViewDialog.vue'

interface Props {
  modelValue: boolean
  contacto: ContactoClienteListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'editar-contacto': [contacto: ContactoClienteListItem]
  'toggle-estado': [contacto: ContactoClienteListItem]
  'ver-cliente': [idCliente: string]
  'ver-interaccion': [idInteraccion: string]
  'nueva-interaccion': [idContacto: string]
  'ver-todas-interacciones': [idContacto: string]
}>()

const authStore = useAuthStore()
const clienteEmpresaStore = useClienteEmpresaStore()
const interaccionClienteStore = useInteraccionClienteStore()

// Estado para interacciones
const loadingInteracciones = ref(false)
const interaccionesContacto = computed(() =>
  props.contacto
    ? interaccionClienteStore.obtenerInteraccionesDeContacto(props.contacto.idContacto)
    : [],
)

// Últimas 5 interacciones para el timeline
const interaccionesRecientes = computed(() => interaccionesContacto.value.slice(0, 5))
const showInteraccionDialog = ref(false)
const interaccionSeleccionada = ref(null)

// Estado local
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const iniciales = computed(() => {
  if (!props.contacto) return ''
  return props.contacto.nombre
    .split(' ')
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

const clienteInfo = computed(() => {
  if (!props.contacto?.idCliente) return null
  return clienteEmpresaStore.clientes.find((c) => c.idCliente === props.contacto?.idCliente)
})

// Métodos
function hasPermission(modulo: string, accion: string): boolean {
  if (!authStore.user?.permisos) return false
  return authStore.user.permisos.some((p: Permission) => p.modulo === modulo && p.accion === accion)
}

function editarContacto() {
  if (props.contacto) {
    emit('editar-contacto', props.contacto)
  }
}

function toggleEstado() {
  if (props.contacto) {
    emit('toggle-estado', props.contacto)
  }
}

function enviarCorreo() {
  if (props.contacto) {
    window.open(`mailto:${props.contacto.email}`)
  }
}

function llamar() {
  if (props.contacto) {
    window.open(`tel:${props.contacto.telefono}`)
  }
}

function verCliente() {
  if (props.contacto?.idCliente) {
    emit('ver-cliente', props.contacto.idCliente)
  }
}

async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    snackbar.value = {
      show: true,
      message: 'Copiado al portapapeles',
      color: 'success',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: 'Error al copiar',
      color: 'error',
    }
  }
}

// Métodos para interacciones
function getTipoColor(tipo: string) {
  const tipoInfo = TIPOS_INTERACCION_OPTIONS.find((t) => t.value === tipo)
  return tipoInfo?.color || 'grey'
}

function getTipoIcon(tipo: string) {
  const tipoInfo = TIPOS_INTERACCION_OPTIONS.find((t) => t.value === tipo)
  return tipoInfo?.icon || 'mdi-circle'
}

function getTipoTitulo(tipo: string) {
  const tipoInfo = TIPOS_INTERACCION_OPTIONS.find((t) => t.value === tipo)
  return tipoInfo?.title || tipo
}

function formatearFechaRelativa(fecha: string) {
  // Similar a tu implementación existente
  const ahora = new Date()
  const fechaInteraccion = new Date(fecha)
  const diferencia = ahora.getTime() - fechaInteraccion.getTime()

  const minutos = Math.floor(diferencia / (1000 * 60))
  const horas = Math.floor(diferencia / (1000 * 60 * 60))
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

  if (minutos < 60) return `hace ${minutos} min`
  if (horas < 24) return `hace ${horas}h`
  if (dias < 7) return `hace ${dias}d`
  return fechaInteraccion.toLocaleDateString('es-ES')
}

function truncarTexto(texto: string, limite: number) {
  return texto.length > limite ? texto.substring(0, limite) + '...' : texto
}

function verInteraccionDetalle(interaccion: any) {
  interaccionSeleccionada.value = interaccion
  showInteraccionDialog.value = true
}

function nuevaInteraccionContacto() {
  if (props.contacto) {
    emit('nueva-interaccion', props.contacto.idContacto)
  }
}

function verTodasInteracciones() {
  if (props.contacto) {
    emit('ver-todas-interacciones', props.contacto.idContacto)
  }
}

// Cargar interacciones cuando se abre el dialog
async function cargarInteraccionesContacto() {
  if (!props.contacto) return

  loadingInteracciones.value = true
  try {
    await interaccionClienteStore.cargarInteraccionesPorContacto(props.contacto.idContacto)
  } catch (error) {
    console.error('Error al cargar interacciones del contacto:', error)
  } finally {
    loadingInteracciones.value = false
  }
}

// Watcher para cargar cuando cambia el contacto
watch(
  () => props.contacto,
  (nuevoContacto) => {
    if (nuevoContacto && props.modelValue) {
      cargarInteraccionesContacto()
    }
  },
)

watch(
  () => props.modelValue,
  (modelValue) => {
    if (modelValue && props.contacto) {
      cargarInteraccionesContacto()
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

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.gap-2 {
  gap: 0.5rem;
}

.v-chip {
  margin-bottom: 0.25rem;
}
</style>
