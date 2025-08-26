import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Permission } from '../modules/auth/interfaces/permission.interface'

interface CustomRouteMeta {
  requiredPermission?: Permission
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../modules/auth/pages/LoginPage.vue'),
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('../modules/auth/pages/ProfilePage.vue'),
  },

  // Ejemplo de ruta protegida por permiso:
  // {
  //   path: '/usuarios',
  //   name: 'Usuarios',
  //   component: () => import('../modules/usuarios/pages/UsuariosPage.vue'),
  //   meta: { requiredPermission: { modulo: 'usuarios', accion: 'ver' } }
  // },
  // ...otras rutas
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Protección de rutas
router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const token = localStorage.getItem('auth_token')
  const user = JSON.parse(localStorage.getItem('auth_user') || 'null')

  if (authRequired && !token) {
    return next('/login')
  }

  const meta = to.meta as CustomRouteMeta
  if (meta.requiredPermission) {
    const hasPermission = (user?.permisos as Permission[] | undefined)?.some(
      (p: Permission) =>
        p.modulo === meta.requiredPermission!.modulo &&
        p.accion === meta.requiredPermission!.accion,
    )
    if (!hasPermission) return next('/perfil')
  }

  next()
})

export default router
