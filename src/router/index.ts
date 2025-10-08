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

      // Rutas de Usuarios
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
        component: () => import('../modules/usuarios-internos/pages/UsuariosListPage.vue'),
        meta: {
          requiredPermission: { modulo: 'usuarios', accion: 'crear' },
        },
      },
      {
        path: 'usuarios/:id',
        name: 'DetalleUsuario',
        component: () => import('../modules/usuarios-internos/pages/UsuariosListPage.vue'),
        meta: {
          requiredPermission: { modulo: 'usuarios', accion: 'ver' },
        },
      },

      // Rutas de Roles
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('../modules/roles/pages/RolesListPage.vue'),
        meta: {
          requiredPermission: { modulo: 'roles', accion: 'ver' },
        },
      },
      {
        path: 'roles/nuevo',
        name: 'CrearRol',
        component: () => import('../modules/roles/pages/RolesListPage.vue'),
        meta: {
          requiredPermission: { modulo: 'roles', accion: 'crear' },
        },
      },
      {
        path: 'roles/:id',
        name: 'DetalleRol',
        component: () => import('../modules/roles/pages/RolesListPage.vue'),
        meta: {
          requiredPermission: { modulo: 'roles', accion: 'ver' },
        },
      },
      {
        path: 'roles/:id/permisos',
        name: 'GestionarPermisosRol',
        component: () => import('../modules/roles/pages/RolesListPage.vue'), // Usa el mismo componente con dialog de permisos
        meta: {
          requiredPermission: { modulo: 'roles', accion: 'editar' },
        },
      },

      // Rutas de Clientes
      {
        path: 'clientes',
        name: 'Clientes',
        component: () => import('../modules/clientes/pages/ClientesMainPage.vue'),
        meta: {
          requiredPermission: { modulo: 'clientes', accion: 'ver' },
        },
      },
      {
        path: 'clientes/contactos',
        name: 'ClientesContactos',
        component: () => import('../modules/clientes/pages/ClientesMainPage.vue'),
        meta: {
          requiredPermission: { modulo: 'contactos', accion: 'ver' },
        },
      },
      {
        path: 'clientes/etiquetas',
        name: 'ClientesEtiquetas',
        component: () => import('../modules/clientes/pages/ClientesMainPage.vue'),
        meta: {
          requiredPermission: { modulo: 'etiquetas', accion: 'ver' },
        },
      },
      {
        path: 'clientes/interacciones',
        name: 'ClientesInteracciones',
        component: () => import('../modules/clientes/pages/ClientesMainPage.vue'),
        meta: {
          requiredPermission: { modulo: 'interacciones', accion: 'ver' },
        },
      },

      // Rutas de Proyectos
      {
        path: 'proyectos',
        name: 'Proyectos',
        component: () => import('../modules/proyectos/pages/ProyectosMainPage.vue'),
        meta: {
          requiredPermission: { modulo: 'proyectos', accion: 'ver' },
        },
      },

      // Ruta para el detalle específico de un proyecto
      {
        path: 'proyectos/:id',
        name: 'ProyectoDetalle',
        component: () => import('../modules/proyectos/pages/ProyectosDetallePage.vue'),
        meta: {
          requiredPermission: { modulo: 'proyectos', accion: 'ver' },
        },
        // Validación de parámetro ID
        beforeEnter: (to, from, next) => {
          const id = to.params.id as string
          // Validar que el ID tenga un formato válido (UUID, número, etc.)
          if (id && id.length > 0) {
            next()
          } else {
            // Redirigir a la lista si el ID no es válido
            next('/proyectos')
          }
        },
      },
      // Rutas adicionales para el detalle con tabs específicos (opcional)
      {
        path: 'proyectos/:id/informacion',
        name: 'ProyectoDetalleInformacion',
        component: () => import('../modules/proyectos/pages/ProyectosDetallePage.vue'),
        meta: {
          requiredPermission: { modulo: 'proyectos', accion: 'ver' },
          defaultTab: 'informacion',
        },
      },
      {
        path: 'proyectos/:id/notas',
        name: 'ProyectoDetalleNotas',
        component: () => import('../modules/proyectos/pages/ProyectosDetallePage.vue'),
        meta: {
          requiredPermission: { modulo: 'notas-proyecto', accion: 'ver' },
          defaultTab: 'notas',
        },
      },
      {
        path: 'proyectos/:id/tareas',
        name: 'ProyectoDetalleTareas',
        component: () => import('../modules/proyectos/pages/ProyectosDetallePage.vue'),
        meta: {
          requiredPermission: { modulo: 'tareas', accion: 'ver' },
          defaultTab: 'tareas',
        },
      },
      {
        path: 'proyectos/:id/archivos',
        name: 'ProyectoDetalleArchivos',
        component: () => import('../modules/proyectos/pages/ProyectosDetallePage.vue'),
        meta: {
          requiredPermission: { modulo: 'archivos', accion: 'ver' },
          defaultTab: 'archivos',
        },
      },
      {
        path: 'proyectos/:id/actividades',
        name: 'ProyectoDetalleActividades',
        component: () => import('../modules/proyectos/pages/ProyectosDetallePage.vue'),
        meta: {
          requiredPermission: { modulo: 'proyectos', accion: 'ver' },
          defaultTab: 'actividades',
        },
      },

      // Rutas de Actividades
      {
        path: 'actividades',
        name: 'Actividades',
        component: () => import('../modules/actividades/pages/ActividadesListPage.vue'),
        meta: {
          requiredPermission: { modulo: 'historial_actividades', accion: 'ver' },
        },
      },

      // Perfil de Usuario
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
