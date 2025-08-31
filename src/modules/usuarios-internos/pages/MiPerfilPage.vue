<template>
  <div class="perfil-container">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center">
        <v-avatar size="80" color="#485696" class="mr-4">
          <span class="text-h4">{{ iniciales }}</span>
        </v-avatar>
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Mi Perfil</h1>
          <p class="text-subtitle-1">Gestiona tu información personal y configuración de cuenta</p>
        </div>
      </div>
    </div>

    <v-row>
      <!-- Información Personal -->
      <v-col cols="12" lg="8">
        <v-card elevation="3" class="mb-4">
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="actualizarPerfil">
              <v-row>
                <!-- Nombre -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.nombre"
                    label="Nombre completo"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    color="#485696"
                    :rules="rules.nombre"
                    :disabled="!editandoPerfil"
                  />
                </v-col>

                <!-- Correo (Solo lectura) -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="perfil?.correo || ''"
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

                <!-- Nueva Contraseña -->
                <v-col cols="12" v-if="editandoPerfil">
                  <v-text-field
                    v-model="form.nuevaContraseña"
                    :type="mostrarContraseña ? 'text' : 'password'"
                    label="Nueva contraseña (opcional)"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="mostrarContraseña ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarContraseña = !mostrarContraseña"
                    variant="outlined"
                    color="#485696"
                    :rules="rules.contraseña"
                    hint="Deja vacío si no deseas cambiar la contraseña"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-form>

            <!-- Error -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mt-4"
              border="start"
              prominent
            >
              {{ error }}
            </v-alert>

            <!-- Éxito -->
            <v-alert
              v-if="mensajeExito"
              type="success"
              variant="tonal"
              class="mt-4"
              border="start"
              prominent
            >
              {{ mensajeExito }}
            </v-alert>
          </v-card-text>

          <v-divider />

          <v-card-actions class="px-6 py-4">
            <v-spacer />
            <template v-if="!editandoPerfil">
              <v-btn color="#485696" prepend-icon="mdi-pencil" @click="iniciarEdicion">
                Editar Perfil
              </v-btn>
            </template>
            <template v-else>
              <v-btn variant="outlined" @click="cancelarEdicion" :disabled="loading">
                Cancelar
              </v-btn>
              <v-btn
                color="#485696"
                prepend-icon="mdi-content-save"
                @click="actualizarPerfil"
                :loading="loading"
                :disabled="!hayCambios"
              >
                Guardar Cambios
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Panel Lateral -->
      <v-col cols="12" lg="4">
        <!-- Información del Rol -->
        <v-card elevation="3" class="mb-4" v-if="perfil?.rol">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#485696">mdi-shield-account</v-icon>
            Mi Rol
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar size="48" color="#FF7043" class="mr-3">
                <v-icon color="white">mdi-shield-account</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ perfil.rol.nombre }}</div>
                <div class="text-body-2 text-grey-darken-1">{{ perfil.rol.descripcion }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Estadísticas de Cuenta -->
        <v-card elevation="3" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#485696">mdi-account-details</v-icon>
            Información de Cuenta
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <v-chip color="primary" variant="tonal" size="small" class="mb-1">
                <v-icon start>mdi-identifier</v-icon>
                ID de Usuario
              </v-chip>
              <div class="text-body-2 text-grey-darken-1 font-mono">
                {{ perfil?.idUsuario }}
              </div>
            </div>

            <div class="mb-4">
              <v-chip color="success" variant="tonal" size="small" class="mb-1">
                <v-icon start>mdi-calendar-check</v-icon>
                Miembro desde
              </v-chip>
              <div class="text-body-2">
                {{ formatearFecha(perfil?.fechaCreacion) }}
              </div>
            </div>

            <div class="mb-4">
              <v-chip color="info" variant="tonal" size="small" class="mb-1">
                <v-icon start>mdi-clock-outline</v-icon>
                Último acceso
              </v-chip>
              <div class="text-body-2">
                {{ formatearFecha(perfil?.ultimoAcceso) }}
              </div>
            </div>

            <div>
              <v-chip color="success" variant="tonal" size="small" class="mb-1">
                <v-icon start>mdi-check-circle</v-icon>
                Estado
              </v-chip>
              <div
                class="text-body-2 font-weight-medium"
                :class="perfil?.activo ? 'text-success' : 'text-error'"
              >
                {{ perfil?.activo ? 'Cuenta Activa' : 'Cuenta Inactiva' }}
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Configuración de Seguridad -->
        <v-card elevation="3" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#485696">mdi-security</v-icon>
            Seguridad
          </v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-2">
              <v-btn
                variant="outlined"
                color="warning"
                size="small"
                prepend-icon="mdi-key-change"
                @click="mostrarCambioContraseña"
                block
              >
                Cambiar Contraseña
              </v-btn>

              <v-btn
                variant="outlined"
                color="error"
                size="small"
                prepend-icon="mdi-logout"
                @click="cerrarSesion"
                block
              >
                Cerrar Sesión
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Ayuda y Soporte -->
        <v-card elevation="3" color="blue-grey-lighten-5">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#485696">mdi-help-circle</v-icon>
            Ayuda y Soporte
          </v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-2">
              <v-btn
                variant="text"
                color="primary"
                size="small"
                prepend-icon="mdi-book-open-variant"
                href="#"
                target="_blank"
              >
                Documentación
              </v-btn>

              <v-btn
                variant="text"
                color="primary"
                size="small"
                prepend-icon="mdi-email-send"
                @click="contactarSoporte"
              >
                Contactar Soporte
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading Overlay -->
    <v-overlay v-model="loadingPerfil" persistent class="align-center justify-center">
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { UsuariosService } from '../services/usuarios.service'
import type { Usuario, UpdatePerfilDto } from '../interfaces/usuario.interface'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()

// Estado
const perfil = ref<Usuario | null>(null)
const loadingPerfil = ref(false)
const loading = ref(false)
const editandoPerfil = ref(false)
const error = ref('')
const mensajeExito = ref('')
const mostrarContraseña = ref(false)

// Formulario
const form = ref<UpdatePerfilDto>({
  nombre: '',
  nuevaContraseña: '',
})

const valoresOriginales = ref<UpdatePerfilDto>({
  nombre: '',
  nuevaContraseña: '',
})

// Validaciones
const rules = {
  nombre: [
    (v: string) => !v || v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => !v || v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  contraseña: [
    (v: string) => !v || v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
    (v: string) => !v || /(?=.*[a-z])/.test(v) || 'Debe contener al menos una letra minúscula',
    (v: string) => !v || /(?=.*[A-Z])/.test(v) || 'Debe contener al menos una letra mayúscula',
    (v: string) => !v || /(?=.*\d)/.test(v) || 'Debe contener al menos un número',
  ],
}

// Computed
const iniciales = computed(() => {
  if (!perfil.value) return ''
  return perfil.value.nombre
    .split(' ')
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

const hayCambios = computed(() => {
  return (
    form.value.nombre !== valoresOriginales.value.nombre ||
    (form.value.nuevaContraseña && form.value.nuevaContraseña.length > 0)
  )
})

// Métodos
async function cargarPerfil() {
  loadingPerfil.value = true
  error.value = ''

  try {
    perfil.value = await UsuariosService.getMiPerfil()
    form.value.nombre = perfil.value.nombre
    valoresOriginales.value.nombre = perfil.value.nombre
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar el perfil'
  } finally {
    loadingPerfil.value = false
  }
}

function iniciarEdicion() {
  editandoPerfil.value = true
  form.value.nombre = perfil.value?.nombre || ''
  form.value.nuevaContraseña = ''
  error.value = ''
  mensajeExito.value = ''
}

function cancelarEdicion() {
  editandoPerfil.value = false
  form.value.nombre = valoresOriginales.value.nombre || ''
  form.value.nuevaContraseña = ''
  error.value = ''
  mensajeExito.value = ''
  formRef.value?.resetValidation()
}

async function actualizarPerfil() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''
  mensajeExito.value = ''

  try {
    const cambios: UpdatePerfilDto = {}

    if (form.value.nombre !== valoresOriginales.value.nombre) {
      cambios.nombre = form.value.nombre
    }

    if (form.value.nuevaContraseña) {
      cambios.nuevaContraseña = form.value.nuevaContraseña
    }

    const perfilActualizado = await UsuariosService.updateMiPerfil(cambios)

    // Actualizar datos locales
    perfil.value = perfilActualizado
    valoresOriginales.value.nombre = perfilActualizado.nombre

    // Actualizar usuario en el store de auth
    if (authStore.user) {
      authStore.setUser({
        ...authStore.user,
        nombre: perfilActualizado.nombre,
      })
    }

    editandoPerfil.value = false
    mensajeExito.value = 'Perfil actualizado correctamente'

    // Limpiar mensaje después de unos segundos
    setTimeout(() => {
      mensajeExito.value = ''
    }, 5000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar el perfil'
  } finally {
    loading.value = false
  }
}

function mostrarCambioContraseña() {
  if (!editandoPerfil.value) {
    iniciarEdicion()
  }
}

function cerrarSesion() {
  authStore.logout()
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  router.push('/login')
}

function contactarSoporte() {
  window.open('mailto:soporte@sistema.com?subject=Solicitud de Soporte')
}

function formatearFecha(fecha: string | undefined): string {
  if (!fecha) return 'No disponible'
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha))
  } catch (error) {
    return 'Fecha inválida'
  }
}

// Lifecycle
onMounted(() => {
  cargarPerfil()
})
</script>

<style scoped>
.perfil-container {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  padding: 2rem;
  background: linear-gradient(135deg, #ffb74d 0%, #ebb768 100%);
  color: #212121;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.v-card {
  border-radius: 12px;
}

.v-card-title {
  font-weight: 600;
  padding-bottom: 8px;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.gap-2 > * + * {
  margin-top: 8px;
}

@media (max-width: 960px) {
  .perfil-container {
    padding: 1rem;
  }

  .page-header {
    text-align: center;
  }

  .page-header .d-flex {
    flex-direction: column;
    align-items: center;
  }
}
</style>
