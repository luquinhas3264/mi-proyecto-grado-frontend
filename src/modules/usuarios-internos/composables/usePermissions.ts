import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { Permission } from '@/modules/auth/interfaces/permission.interface'

export function usePermissions() {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const permissions = computed(() => user.value?.permisos || [])

  // Verificar si tiene un permiso específico
  const hasPermission = (modulo: string, accion: string): boolean => {
    return permissions.value.some((p: Permission) => p.modulo === modulo && p.accion === accion)
  }

  // Verificar si tiene alguno de los permisos especificados
  const hasAnyPermission = (permisos: Array<{ modulo: string; accion: string }>): boolean => {
    return permisos.some(({ modulo, accion }) => hasPermission(modulo, accion))
  }

  // Verificar si tiene todos los permisos especificados
  const hasAllPermissions = (permisos: Array<{ modulo: string; accion: string }>): boolean => {
    return permisos.every(({ modulo, accion }) => hasPermission(modulo, accion))
  }

  // Permisos específicos para usuarios
  const usuariosPermissions = computed(() => ({
    ver: hasPermission('usuarios', 'ver'),
    crear: hasPermission('usuarios', 'crear'),
    editar: hasPermission('usuarios', 'editar'),
    eliminar: hasPermission('usuarios', 'eliminar'),
  }))

  // Verificar si es administrador (tiene todos los permisos de usuarios)
  const isAdmin = computed(() => {
    return hasAllPermissions([
      { modulo: 'usuarios', accion: 'ver' },
      { modulo: 'usuarios', accion: 'crear' },
      { modulo: 'usuarios', accion: 'editar' },
    ])
  })

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    usuariosPermissions,
    isAdmin,
  }
}
