import Cookies from "js-cookie";
export const routesGuard = (to, from, next) => {
  // Verificar si es una ruta de tienda (hacer públicas todas las rutas que empiecen con /tienda)
  if (to.path.startsWith('/tienda')) {
    return next();
  }

  // Rutas que no necesitan validación de permisos
  const publicRoutes = [
    "iniciar-sesion",
    "registro",
    "recuperar-contrasena",
    "landing-page",
    "tienda/:shopName/:shopId",
    "pedido-exitoso",
    "carrito",
    "pago-exitoso",
    "pago-fallido",
    "pago-pendiente",
    "inicio",
    "asistente",
    "autorizacion-denegada",
    "tienda",
    "validar-codigo",
    "validar-email",
    "seccion-premium",
    "prueba-expirada",
    "marketplace",
    "/admin/ignacio/configuracion",
    "/registro/google",
    "/inicio-sesion-google",
    "/prime-vue-test",
    "/seccion-en-desarrollo",
  ];
  // Si es una ruta pública, dejar pasar
  if (publicRoutes.some((r) => to.path.includes(r))) {
    return next();
  }
  const userInfo = Cookies.get("user_info");
  if (!userInfo) {
    return next("/iniciar-sesion");
  }
  try {
    const parsedUserInfo = JSON.parse(userInfo);
    const userRoutes = parsedUserInfo.routesAllowed || [];
    const userId = parsedUserInfo.id;
    const isAdmin = userId === "682e5e2ed26d295082735453";
    const normalizedPath = to.path.startsWith("/") ? to.path.slice(1) : to.path;
    if (isAdmin) {
      return next();
    }
    // Validación estricta
    const isRouteAllowed = userRoutes.some((route) => {
      return normalizedPath === route || normalizedPath.startsWith(`${route}/`);
    });
    if (isRouteAllowed) {
      return next();
    } else {
      return next("/autorizacion-denegada");
    }
  } catch (error) {
    console.error("Error parsing user info cookie:", error);
    Cookies.remove("user_info");
    return next("/iniciar-sesion");
  }
};