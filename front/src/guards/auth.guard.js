import Cookies from "js-cookie";

const AUTH_FREE_ROUTES = [
  "/iniciar-sesion",
  "/registro",

  "/landing-page",
  "/prueba-expirada",
  "/email-pendiente",
  "/autorizacion-denegada",
  "/seccion-premium",
  "/seccion-en-desarrollo",
  "/pago-exitoso",
  "/pago-fallido",
  "/pago-pendiente",
  "/pedido-exitoso",
  "/carrito",
  "/marketplace",
  "/prime-vue-test",
  "/inicio-sesion-google",
  "/registro-google",
];

export const authGuard = (to, from, next) => {
  const isAuthFree =
    AUTH_FREE_ROUTES.some((r) => to.path.startsWith(r)) ||
    to.path.startsWith("/tienda") ||
    to.path.startsWith("/validar-") ||
    to.path.startsWith("/recuperar-contrasena");

  if (isAuthFree) {
    return next();
  }

  const userInfo = Cookies.get("user_info");
  if (!userInfo) {
    next("/iniciar-sesion");
  } else {
    next();
  }
};
