<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card v-if="usuario">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-account-edit</v-icon>
        Editar Usuario
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Información Básica -->
          <div class="mb-4">
            <h3 class="text-h6 mb-3">Información Básica</h3>
            <v-row>
              <!-- Nombre -->
              <v-col cols="12">
                <v-text-field
                  v-model="form.nombre"
                  label="Nombre completo"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  color="#485696"
                  :rules="rules.nombre"
                />
              </v-col>

              <!-- Correo (solo lectura) -->
              <v-col cols="12">
                <v-text-field
                  :model-value="usuario.correo"
                  label="Correo electrónico"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  readonly
                  bg-color="grey-lighten-4"
                >
                  <template v-slot:append>
                    <v-tooltip text="El correo no se puede modificar">
                      <template v-slot:activator="{ props }">
                        <v-icon v-bind="props" color="grey">mdi-information-outline</v-icon>
                      </template>
                    </v-tooltip>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Rol y Estado -->
          <div class="mb-4">
            <h3 class="text-h6 mb-3">Rol y Estado</h3>
            <v-row>
              <!-- Rol -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.idRol"
                  label="Rol"
                  :items="rolesOptions"
                  item-title="nombre"
                  item-value="idRol"
                  prepend-inner-icon="mdi-shield-account"
                  variant="outlined"
                  color="#485696"
                  :loading="loadingRoles"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:title>
                        <div class="font-weight-medium">{{ item.raw.nombre }}</div>
                      </template>
                      <template v-slot:subtitle>
                        <div class="text-caption">{{ item.raw.descripcion }}</div>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <!-- Estado -->
              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.activo"
                  :label="form.activo ? 'Usuario Activo' : 'Usuario Inactivo'"
                  :color="form.activo ? 'success' : 'error'"
                  hide-details
                >
                  <template v-slot:prepend>
                    <v-icon
                      :color="form.activo ? 'success' : 'error'"
                      :icon="form.activo ? 'mdi-account-check' : 'mdi-account-off'"
                    />
                  </template>
                </v-switch>
              </v-col>
            </v-row>
          </div>

          <!-- Información Adicional -->
          <v-card variant="tonal" color="info" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                <span class="font-weight-medium">Información del Usuario</span>
              </div>
              <div class="text-body-2">
                <strong>ID:</strong> {{ usuario.idUsuario }}<br />
                <strong>Fecha de registro:</strong> {{ formatearFecha(usuario.fechaCreacion)
                }}<br />
                <strong>Último acceso:</strong> {{ formatearFecha(usuario.ultimoAcceso) }}
              </div>
            </v-card-text>
          </v-card>
        </v-form>

        <!-- Error -->
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4" border="start" prominent>
          {{ error }}
        </v-alert>

        <!-- Confirmación de cambio de estado -->
        <v-alert
          v-if="mostrarAdvertenciaEstado"
          type="warning"
          variant="tonal"
          class="mt-4"
          border="start"
          prominent
        >
          <template v-slot:title> ⚠️ Cambio de Estado </template>
          {{
            form.activo
              ? 'Al activar este usuario podrá acceder nuevamente al sistema.'
              : 'Al desactivar este usuario ya no podrá acceder al sistema.'
          }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="outlined" @click="cancelar" :disabled="loading"> Cancelar </v-btn>
        <v-btn color="#485696" @click="onSubmit" :loading="loading" :disabled="!hayCambios">
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUsuariosStore } from '../store/usuarios.store'
import { UsuariosService } from '../services/usuarios.service'
import type { UsuarioListItem, UpdateUsuarioDto } from '../interfaces/usuario.interface'

interface Props {
  modelValue: boolean
  usuario: UsuarioListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'usuario-actualizado': []
}>()

const usuariosStore = useUsuariosStore()
const formRef = ref()

// Estado del formulario
const form = ref<UpdateUsuarioDto & { activo: boolean }>({
  nombre: '',
  activo: true,
  idRol: '',
})

const valoresOriginales = ref<UpdateUsuarioDto & { activo: boolean }>({
  nombre: '',
  activo: true,
  idRol: '',
})

const loading = ref(false)
const error = ref('')
const loadingRoles = ref(false)
const rolesOptions = ref<Array<{ idRol: string; nombre: string; descripcion: string }>>([])

// Validaciones
const rules = {
  nombre: [
    (v: string) => !v || v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => !v || v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
}

// Computed
const hayCambios = computed(() => {
  return (
    form.value.nombre !== valoresOriginales.value.nombre ||
    form.value.activo !== valoresOriginales.value.activo ||
    form.value.idRol !== valoresOriginales.value.idRol
  )
})

const mostrarAdvertenciaEstado = computed(() => {
  return form.value.activo !== valoresOriginales.value.activo
})

// Métodos
async function cargarRoles() {
  loadingRoles.value = true
  try {
    rolesOptions.value = await UsuariosService.getRoles()
  } catch (error) {
    console.error('Error al cargar roles:', error)
  } finally {
    loadingRoles.value = false
  }
}

function cargarDatosUsuario() {
  if (props.usuario) {
    form.value = {
      nombre: props.usuario.nombre,
      activo: props.usuario.activo,
      idRol: props.usuario.rol.idRol,
    }

    valoresOriginales.value = { ...form.value }
  }
}

async function onSubmit() {
  if (!props.usuario) return

  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Solo enviar los campos que han cambiado
    const cambios: UpdateUsuarioDto = {}

    if (form.value.nombre !== valoresOriginales.value.nombre) {
      cambios.nombre = form.value.nombre || undefined
    }

    if (form.value.activo !== valoresOriginales.value.activo) {
      cambios.activo = form.value.activo
    }

    if (form.value.idRol !== valoresOriginales.value.idRol) {
      cambios.idRol = form.value.idRol || undefined
    }

    await usuariosStore.actualizarUsuario(props.usuario.idUsuario, cambios)
    emit('usuario-actualizado')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar el usuario'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  error.value = ''
}

function formatearFecha(fecha: string | undefined): string {
  if (!fecha) return 'No disponible'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.usuario) {
      cargarRoles()
      cargarDatosUsuario()
    }
  },
)

watch(
  () => props.usuario,
  () => {
    if (props.modelValue && props.usuario) {
      cargarDatosUsuario()
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
</style>
