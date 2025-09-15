<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="white">mdi-account-plus</v-icon>
        Crear Nuevo Usuario
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-form ref="formRef" @submit.prevent="onSubmit">
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
                required
              />
            </v-col>

            <!-- Correo -->
            <v-col cols="12">
              <v-text-field
                v-model="form.correo"
                label="Correo electrónico"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="#485696"
                :rules="rules.correo"
                required
              />
            </v-col>

            <!-- Contraseña -->
            <v-col cols="12">
              <v-text-field
                v-model="form.contraseña"
                :type="mostrarContraseña ? 'text' : 'password'"
                label="Contraseña"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="mostrarContraseña ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarContraseña = !mostrarContraseña"
                variant="outlined"
                color="#485696"
                :rules="rules.contraseña"
                required
              />
            </v-col>

            <!-- Confirmar Contraseña -->
            <v-col cols="12">
              <v-text-field
                v-model="confirmarContraseña"
                :type="mostrarConfirmarContraseña ? 'text' : 'password'"
                label="Confirmar contraseña"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="mostrarConfirmarContraseña ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarConfirmarContraseña = !mostrarConfirmarContraseña"
                variant="outlined"
                color="#485696"
                :rules="rules.confirmarContraseña"
                required
              />
            </v-col>

            <!-- Rol -->
            <v-col cols="12">
              <v-select
                v-model="form.idRol"
                label="Rol"
                :items="rolesOptions"
                item-title="nombre"
                item-value="idRol"
                prepend-inner-icon="mdi-shield-account"
                variant="outlined"
                color="#485696"
                :rules="rules.idRol"
                :loading="loadingRoles"
                required
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
          </v-row>
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
        <v-btn color="#485696" @click="onSubmit" :loading="loading" :disabled="!formValido">
          <v-icon>mdi-account-plus</v-icon>
          Crear Usuario
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUsuariosStore } from '../store/usuarios.store'
import { UsuariosService } from '../services/usuarios.service'
import type { CreateUsuarioDto } from '../interfaces/usuario.interface'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'usuario-creado': []
}>()

const usuariosStore = useUsuariosStore()
const formRef = ref()

// Estado del formulario
const form = ref<CreateUsuarioDto>({
  nombre: '',
  correo: '',
  contraseña: '',
  idRol: '',
})

const confirmarContraseña = ref('')
const mostrarContraseña = ref(false)
const mostrarConfirmarContraseña = ref(false)
const loading = ref(false)
const error = ref('')
const loadingRoles = ref(false)
const rolesOptions = ref<Array<{ idRol: string; nombre: string; descripcion: string }>>([])

// Validaciones
const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre es obligatorio',
    (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => v.length <= 100 || 'El nombre no puede exceder 100 caracteres',
  ],
  correo: [
    (v: string) => !!v || 'El correo es obligatorio',
    (v: string) => /^\S+@\S+\.\S+$/.test(v) || 'El formato del correo no es válido',
  ],
  contraseña: [
    (v: string) => !!v || 'La contraseña es obligatoria',
    (v: string) => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
    (v: string) => /(?=.*[a-z])/.test(v) || 'Debe contener al menos una letra minúscula',
    (v: string) => /(?=.*[A-Z])/.test(v) || 'Debe contener al menos una letra mayúscula',
    (v: string) => /(?=.*\d)/.test(v) || 'Debe contener al menos un número',
  ],
  confirmarContraseña: [
    (v: string) => !!v || 'Confirma tu contraseña',
    (v: string) => v === form.value.contraseña || 'Las contraseñas no coinciden',
  ],
  idRol: [(v: string) => !!v || 'Selecciona un rol'],
}

// Computed
const formValido = computed(() => {
  return (
    form.value.nombre &&
    form.value.correo &&
    form.value.contraseña &&
    form.value.idRol &&
    confirmarContraseña.value &&
    confirmarContraseña.value === form.value.contraseña
  )
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

async function onSubmit() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    await usuariosStore.crearUsuario(form.value)
    emit('usuario-creado')
    limpiarFormulario()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear el usuario'
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('update:modelValue', false)
  limpiarFormulario()
}

function limpiarFormulario() {
  form.value = {
    nombre: '',
    correo: '',
    contraseña: '',
    idRol: '',
  }
  confirmarContraseña.value = ''
  error.value = ''
  formRef.value?.resetValidation()
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      cargarRoles()
      limpiarFormulario()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    cargarRoles()
  }
})
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-card-title {
  padding: 1.5rem;
  background: linear-gradient(135deg, #485696 0%, #5c6bc0 100%);
  color: white;
  font-weight: 600;
}

.v-card-actions {
  background: #f8f9fa;
}
</style>
