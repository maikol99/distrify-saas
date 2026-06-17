import { createRouter, createWebHistory } from "vue-router";
import dashboardLayout from "@/views/dashboardLayout.vue";
import { authGuard } from "@/guards/auth.guard";
import { routesGuard } from "@/guards/routes.guard";
import { adminGuard } from "@/guards/admin.guard";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/landing-page",
    },

    {
      path: "/landing-page",
      component: () => import("../views/landingPage.vue"),
    },
    {
      path: "/iniciar-sesion",
      component: () => import("../components/dashboard/auth/login.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/registro",
      component: () => import("../components/dashboard/auth/register.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/registro-google",
      redirect: "/iniciar-sesion",
    },
    {
      path: "/inicio-sesion-google",
      component: () =>
        import("../components/dashboard/auth/google-auth/googleLogin.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/recuperar-contrasena/:token",
      component: () => import("../components/dashboard/auth/resetPassword.vue"),
    },
  
    {
      path: "/pedido-exitoso",
      component: () =>
        import(
          "../components/visuals/ecommerce/paymentStatus/pedido-pendiente.vue"
        ),
    },
    {
      path: "/carrito",
      component: () => import("../components/visuals/ecommerce/carrito.vue"),
    },

    {
      path: "/seccion-en-desarrollo",
      component: () => import("../components/visuals/routes/sectionInWork.vue"),
    },
    {
      path: "/autorizacion-denegada",
      component: () => import("../components/visuals/routes/notAuthorized.vue"),
    },
    {
      path: "/seccion-premium",
      component: () =>
        import("../components/visuals/routes/section-blocked.vue"),
    },
    {
      path: "/prueba-expirada",
      component: () =>
        import("../components/visuals/routes/trial-expired.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/email-pendiente",
      component: () =>
        import("../components/visuals/routes/email-pendiente.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/admin",
      component: () =>
        import("../components/dashboard/admin/adminDashboard.vue"),
      meta: { requiresAuth: true },
      beforeEnter: adminGuard,
    },

    {
      path: "/marketplace",
      component: () =>
        import("../components/dashboard/marketplace/marketplace.vue"),
    },
    {
      path: "/pago-exitoso",
      component: () =>
        import("../components/visuals/ecommerce/paymentStatus/pagoExitoso.vue"),
    },
    {
      path: "/pago-fallido",
      component: () =>
        import("../components/visuals/ecommerce/paymentStatus/pagoFallido.vue"),
    },
    {
      path: "/pago-pendiente",
      component: () =>
        import(
          "../components/visuals/ecommerce/paymentStatus/pagoPendiente.vue"
        ),
    },
    {
      path: "/validar-codigo/:token",
      component: () =>
        import("../components/visuals/auth/validate-password-email.vue"),
    },
    {
      path: "/validar-email/:token",
      component: () =>
        import("../components/visuals/auth/validate-register-email.vue"),
    },
    {
      path: "/prime-vue-test",
      component: () => import("../components/dashboard/primeVueTest.vue"),
    },
        {
          path:'/tienda/:shopName/:shopId',
          name: 'shop',
          component: () => import('../components/dashboard/ecommerce/storeComponent.vue')
        },
    {
      path: "/",
      component: dashboardLayout,
      children: [
        {
          path: "",
          redirect: "/inicio",
        },
        {
          path: "inicio",
          component: () =>
            import("../components/dashboard/home/homeComponent.vue"),
        },
        {
          path: "ventas",
          component: () =>
            import("../components/dashboard/sales/salesComponent.vue"),
        },
        {
          path: "proveedores",
          component: () =>
            import("../components/dashboard/suppliers/suppliersComponent.vue"),
        },
        {
          path: "inventario",
          component: () =>
            import("../components/dashboard/stock/stockComponent.vue"),
        },
        {
          path: "/inventario/crear-producto",
          component: () =>
            import("../components/visuals/stock/createProduct.vue"),
        },
        {
          path: "/inventario/editar-producto/:id",
          name: "editProduct",
          component: () =>
            import("../components/visuals/stock/editProduct.vue"),
        },
    
        {
          path: "categorias",
          name: "categories",
          component: () =>
            import("../components/dashboard/categories/categoryComponent.vue"),
        },
        {
          path: "compras",
          component: () =>
            import("../components/dashboard/buys/buyComponent.vue"),
        },
        {
          path: "clientes",
          component: () =>
            import("../components/dashboard/clients/clientsComponent.vue"),
        },
        {
          path: "historial/ventas",
          component: () =>
            import("../components/dashboard/sales/salesListComponent.vue"),
        },
        {
          path: "pedidos",
          component: () =>
            import("../components/dashboard/pedidos/pedidosComponent.vue"),
        },
        {
          path: "caja",
          component: () =>
            import("../components/dashboard/caja/cajaComponent.vue"),
        },
        {
          path: "/caja/detalles/:id",
          component: () => import("../components/visuals/caja/cajaDetails.vue"),
        },
        {
          path: "configuracion",
          component: () =>
            import("../components/dashboard/perfil/perfilComponent.vue"),
        },
        {
          path: "egresos",
          component: () =>
            import("../components/dashboard/outputs/outputsComponente.vue"),
        },
        {
          path: "ingresos",
          component: () =>
            import("../components/dashboard/inputs/inputscomponent.vue"),
        },
        {
          path: "/reportes",
          component: () =>
            import("../components/dashboard/reports/reportsHome.vue"),
        },
        {
          path: "/notificaciones",
          component: () =>
            import(
              "../components/dashboard/notifications/notificationsComponent.vue"
            ),
        },
        {
          path: "asistente",
          component: () =>
            import("../components/dashboard/assistant/assistantComponent.vue"),
        },
        {
          path: "/sucursales",
          component: () =>
            import(
              "../components/dashboard/sucursales/sucursalesComponent.vue"
            ),
        },
        {
          path: "turnos",
          component: () =>
            import("../components/dashboard/turns/turnsComponent.vue"),
        },
        {
          path: "movimientos-stock",
          name: "StockMovements",
          component: () =>
            import(
              "../components/dashboard/stock/stockMovements.vue"
            ),
          meta: { requiresAuth: true, routeName: "movimientos-stock" },
        },
        {
          path: "promociones",
          component: () =>
            import("../components/dashboard/promotions/promotionsComponent.vue"),
        },
        {
          path: "movimientos",
          name: "Movements",
          component: () =>
            import("../components/dashboard/movements/movementsComponent.vue"),
          meta: { requiresAuth: true, routeName: "movimientos" },
        },
      ],
    },

    // Fallback
    {
      path: "/:pathMatch(.*)*",
      redirect: "/iniciar-sesion",
    },
  ],
});

/**
 * Guard global que ejecuta authGuard y routesGuard en TODAS las rutas
 */
router.beforeEach((to, from, next) => {
  authGuard(to, from, (authResult) => {
    if (authResult === false) {
      return next(false);
    }
    routesGuard(to, from, next);
  });
});

export default router;
