import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Permission } from '../modules/auth/interfaces/permission.interface'

interface CustomRouteMeta {
  requiredPermission?: Permission
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../modules/auth/pages/LoginPage.vue'),
  },

  // Rutas protegidas con layout
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../modules/dashboard/pages/DashboardPage.vue'),
      },
      {
        path: 'usuarios',
        name: 'Usuarios',
        component: () => import('../modules/usuarios-internos/pages/UsuariosListPage.vue'),
        meta: {
          requiredPermission: { modulo: 'usuarios', accion: 'ver' },
        },
      },
      {
        path: 'usuarios/nuevo',
        name: 'CrearUsuario',
        component: () => import('../modules/usuarios-internos/pages/UsuariosListPage.vue'), // Usa el mismo componente con dialog
        meta: {
          requiredPermission: { modulo: 'usuarios', accion: 'crear' },
        },
      },
      {
        path: 'usuarios/:id',
        name: 'DetalleUsuario',
        component: () => import('../modules/usuarios-internos/pages/UsuariosListPage.vue'), // Usa el mismo componente con dialog
        meta: {
          requiredPermission: { modulo: 'usuarios', accion: 'ver' },
        },
      },
      {
        path: 'mi-perfil',
        name: 'MiPerfil',
        component: () => import('../modules/usuarios-internos/pages/MiPerfilPage.vue'),
        // No requiere permisos especiales, solo estar autenticado
      },
    ],
  },

  // Página 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/NotFoundPage.vue'),
  },
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

  // Redirect to dashboard if logged in and trying to access login
  if (to.path === '/login' && token) {
    return next('/dashboard')
  }

  // Require auth for protected routes
  if (authRequired && !token) {
    return next('/login')
  }

  // Check permissions for routes that require them
  const meta = to.meta as CustomRouteMeta
  if (meta.requiredPermission && user) {
    const hasPermission = (user?.permisos as Permission[] | undefined)?.some(
      (p: Permission) =>
        p.modulo === meta.requiredPermission!.modulo &&
        p.accion === meta.requiredPermission!.accion,
    )
    if (!hasPermission) {
      // Redirect to dashboard instead of profile for better UX
      return next('/dashboard')
    }
  }

  next()
})

export default router
