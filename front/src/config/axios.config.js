import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true, // envía la cookie httpOnly access_token automáticamente
});
// ─── Helpers de sesión ──────────────────────────────────────────────────────

export function clearSession() {
  Cookies.remove("user_info");
  localStorage.removeItem("token_expiration");
  localStorage.removeItem("session_warning_shown");
  if (_logoutTimer) clearTimeout(_logoutTimer);
  if (_warningTimer) clearTimeout(_warningTimer);
}

export async function logout(reason = "expired") {
  // Pedir al servidor que limpie la cookie httpOnly access_token
  try {
    await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
  } catch (_) {}
  clearSession();
  let url = "/iniciar-sesion";
  if (reason === "trial") url = "/prueba-expirada";
  else if (reason === "email") url = "/email-pendiente";
  window.location.href = url;
}

// ─── Auto-logout timer ───────────────────────────────────────────────────────

let _logoutTimer = null;
let _warningTimer = null;

export function scheduleAutoLogout(expiresInMs) {
  if (_logoutTimer) clearTimeout(_logoutTimer);
  if (_warningTimer) clearTimeout(_warningTimer);

  const warningMs = expiresInMs - 2 * 60 * 1000; // aviso 2 minutos antes

  if (warningMs > 0) {
    _warningTimer = setTimeout(() => {
      // Mostrar aviso si no se mostró ya en esta sesión
      if (!localStorage.getItem("session_warning_shown")) {
        localStorage.setItem("session_warning_shown", "1");
        const stay = window.confirm(
          "Tu sesión expira en 2 minutos. ¿Querés mantenerla activa?"
        );
        if (stay) {
          // No hacemos nada — el usuario tendrá que re-autenticarse cuando expire
          // En el futuro se puede implementar refresh token aquí
        }
      }
    }, warningMs);
  }

  _logoutTimer = setTimeout(() => {
    logout("expired");
  }, expiresInMs);
}

export function initSessionFromStorage() {
  const expiration = localStorage.getItem("token_expiration");
  const userInfo = Cookies.get("user_info");

  if (!userInfo || !expiration) {
    clearSession();
    return false;
  }

  const remaining = parseInt(expiration) - Date.now();
  if (remaining <= 0) {
    clearSession();
    return false;
  }

  scheduleAutoLogout(remaining);
  return true;
}

// ─── Interceptor de request ──────────────────────────────────────────────────
// El token viaja automáticamente via cookie httpOnly — no se inyecta en headers

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Interceptor de respuesta ────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isLoginRequest = originalRequest.url?.includes("/auth/post/login-user");
      const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");

      if (!isLoginRequest && !isRefreshRequest) {
        originalRequest._retry = true;
        try {
          // Intentar refresh silencioso
          const response = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          if (response.data?.expires_in) {
            const expiresInMs = response.data.expires_in * 1000;
            localStorage.setItem("token_expiration", Date.now() + expiresInMs);
            localStorage.removeItem("session_warning_shown");
            scheduleAutoLogout(expiresInMs);

            // Reintentar la petición original
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Silent refresh failed:", refreshError);
        }

        // Si falla el refresh, hacer logout normal
        const msg = error.response.data?.message || "";
        let reason = "expired";
        if (msg.includes("período de prueba") || msg.includes("prueba de 7 días")) {
          reason = "trial";
        } else if (msg.includes("verificar tu correo") || msg.includes("correo electrónico")) {
          reason = "email";
        }

        if (reason === "email") {
          if (!window.location.pathname.startsWith("/email-pendiente")) {
            window.location.href = "/email-pendiente";
          }
        } else {
          await logout(reason);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
