<template>
  <div class="min-h-screen flex font-display">

    <!-- LEFT: Marketing Panel -->
    <div class="hidden lg:flex w-1/2 relative overflow-hidden bg-white flex-col justify-between p-12">
      <!-- Orange blob decoration -->
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-orange-200/60 via-orange-100/40 to-transparent filter blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-orange-100/50 filter blur-3xl pointer-events-none"></div>

      <!-- Logo top-left -->
      <div class="relative z-10">
        <img src="/alevia-logo.png" alt="Alevia Pay" class="h-10 cursor-pointer" @click="$router.push('/')" />
      </div>

      <!-- Headline + dashboard mockup -->
      <div class="relative z-10 flex-1 flex flex-col justify-center max-w-md">
        <h1 class="text-5xl font-black tracking-tighter text-slate-900 leading-tight mb-4">
          Gestiona tu negocio<br/>
          de forma <span class="text-primary">simple,<br/>rápida y segura</span>
        </h1>
        <p class="text-slate-500 text-base leading-relaxed mb-10">
          Alevia Pay es el sistema de gestión todo en uno para tu negocio.
          Ventas, stock, clientes y más.
        </p>

        <!-- Dashboard mockup card -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <!-- Top bar -->
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <div class="w-6 h-6 bg-primary/90 rounded-md flex items-center justify-center">
              <span class="text-white text-[10px] font-black">A</span>
            </div>
            <span class="text-slate-600 text-xs font-bold">alevia pay</span>
            <span class="ml-auto text-slate-400 text-[10px]">Resumen general</span>
          </div>

          <div class="flex">
            <!-- Mini sidebar -->
            <div class="w-28 border-r border-slate-100 py-3 flex flex-col gap-0.5 bg-slate-50/50">
              <div class="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-r-lg mx-1 border-l-2 border-primary">
                <div class="w-3 h-3 bg-primary rounded-sm"></div>
                <span class="text-primary text-[10px] font-bold">Inicio</span>
              </div>
              <div v-for="item in ['Ventas','Productos','Clientes','Reportes','Configuración']" :key="item"
                   class="flex items-center gap-2 px-3 py-1.5 mx-1">
                <div class="w-3 h-3 bg-slate-300 rounded-sm"></div>
                <span class="text-slate-400 text-[10px]">{{item}}</span>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 p-3">
              <!-- KPI row -->
              <div class="grid grid-cols-4 gap-2 mb-3">
                <div v-for="kpi in kpis" :key="kpi.label" class="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <p class="text-slate-400 text-[8px] mb-0.5">{{kpi.label}}</p>
                  <p class="text-slate-800 text-xs font-black">{{kpi.value}}</p>
                  <p class="text-green-500 text-[8px] font-bold">{{kpi.delta}}</p>
                </div>
              </div>

              <!-- Charts row -->
              <div class="grid grid-cols-5 gap-2">
                <!-- Line chart -->
                <div class="col-span-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p class="text-slate-500 text-[9px] font-bold mb-1.5">Ventas de los últimos 7 días</p>
                  <svg viewBox="0 0 200 70" class="w-full h-16" preserveAspectRatio="none">
                    <line x1="0" y1="17" x2="200" y2="17" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="2,2"/>
                    <line x1="0" y1="35" x2="200" y2="35" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="2,2"/>
                    <line x1="0" y1="53" x2="200" y2="53" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="2,2"/>
                    <defs>
                      <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#f97316" stop-opacity="0.25"/>
                        <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <polygon points="0,65 33,55 66,50 100,36 133,42 166,24 200,14 200,70 0,70" fill="url(#gL)"/>
                    <polyline points="0,65 33,55 66,50 100,36 133,42 166,24 200,14" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="200" cy="14" r="2" fill="#f97316"/>
                  </svg>
                  <div class="flex justify-between mt-1">
                    <span v-for="d in ['L','M','X','J','V','S','D']" :key="d" class="text-slate-400 text-[7px]">{{d}}</span>
                  </div>
                </div>

                <!-- Donut chart -->
                <div class="col-span-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p class="text-slate-500 text-[9px] font-bold mb-1.5">Ventas por categoría</p>
                  <div class="flex items-center gap-1.5">
                    <svg viewBox="0 0 36 36" class="w-14 h-14 shrink-0">
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f97316" stroke-width="4" stroke-dasharray="40 60" stroke-dashoffset="25" transform="rotate(-90 18 18)"/>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-dasharray="30 70" stroke-dashoffset="-15" transform="rotate(-90 18 18)"/>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#22d3ee" stroke-width="4" stroke-dasharray="20 80" stroke-dashoffset="-45" transform="rotate(-90 18 18)"/>
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#a78bfa" stroke-width="4" stroke-dasharray="10 90" stroke-dashoffset="-65" transform="rotate(-90 18 18)"/>
                    </svg>
                    <div class="space-y-0.5">
                      <div v-for="cat in categories" :key="cat.name" class="flex items-center gap-1">
                        <div class="w-1.5 h-1.5 rounded-full shrink-0" :style="{background: cat.color}"></div>
                        <span class="text-slate-400 text-[7px]">{{cat.name}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom spacing -->
      <div class="relative z-10 h-6"></div>
    </div>

    <!-- RIGHT: Login Card Panel -->
    <div class="flex-1 lg:w-1/2 flex flex-col items-center justify-center bg-slate-50 relative px-6 py-12">
      <!-- Subtle blob -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-orange-100/40 rounded-full filter blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-sm relative z-10">
        <!-- Back button (mobile only shows logo) -->
        <button
          @click="$router.push('/iniciar-sesion')"
          class="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors font-bold text-sm group mb-8"
        >
          <span class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Volver al login
        </button>

        <!-- Login card -->
        <div class="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl">

          <!-- Logo -->
          <div class="flex flex-col items-center mb-6">
            <img src="/alevia-logo.png" alt="Alevia Pay" class="h-16 cursor-pointer mb-3" @click="$router.push('/')" />
            <h2 class="text-2xl font-black tracking-tighter text-slate-800">Iniciar sesión</h2>
            <p class="text-slate-400 text-xs mt-1 text-center">Ingresa para administrar tu negocio</p>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-8 space-y-4">
            <div class="spinner-premium"></div>
            <p class="text-slate-500 text-sm font-semibold animate-pulse">Iniciando sesión con Google...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="flex flex-col items-center py-4 text-center animate-fade-in">
            <div class="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
              <span class="material-symbols-outlined text-2xl">error</span>
            </div>
            <p class="text-red-500 text-sm font-semibold mb-5 px-2">{{ error }}</p>
            <button @click="clearError" class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all w-full">
              Intentar de nuevo
            </button>
          </div>

          <!-- Success State -->
          <div v-else-if="success" class="flex flex-col items-center py-4 text-center animate-fade-in">
            <div class="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-3 animate-bounce">
              <span class="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <h3 class="text-lg font-black text-slate-800 mb-1">¡Bienvenido de vuelta!</h3>
            <p class="text-slate-400 text-sm mb-5">Sesión iniciada correctamente. Redirigiendo...</p>
            <button @click="goToHome" class="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm w-full active:scale-95 transition-all">
              Ir al Inicio
            </button>
          </div>

          <!-- Google button + links -->
          <div v-else class="flex flex-col items-center">
            <!-- Google sign-in button rendered by Google SDK -->
            <div id="google-signin-button" class="w-full flex justify-center mb-4"></div>

            <!-- Security badge -->
            <div class="flex items-center gap-2 text-slate-400 text-xs mt-2 mb-6">
              <svg class="w-4 h-4 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Inicio de sesión seguro mediante Google
            </div>

            <!-- Register link -->
            <p class="text-slate-500 text-sm text-center">
              ¿No tienes cuenta?
              <router-link to="/registro" class="text-primary hover:underline font-black ml-1 transition-all">
                Crear cuenta
              </router-link>
            </p>
          </div>
        </div>

        <!-- Trust badges -->
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="flex flex-col items-center gap-1 text-center">
            <div class="w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-slate-400 text-[10px] leading-tight">Tus datos están protegidos</span>
          </div>
          <div class="flex flex-col items-center gap-1 text-center">
            <div class="w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-slate-400 text-[10px] leading-tight">Sincronización en la nube</span>
          </div>
          <div class="flex flex-col items-center gap-1 text-center">
            <div class="w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            </div>
            <span class="text-slate-400 text-[10px] leading-tight">Soporte siempre disponible</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/config/axios.config";
import Cookies from "js-cookie";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default {
  data() {
    return {
      loading: false,
      error: null,
      success: false,
      kpis: [
        { label: "Ventas hoy", value: "$ 128.450", delta: "↑ 12,5%" },
        { label: "Transacciones", value: "32", delta: "↑ 8,1%" },
        { label: "Productos", value: "1.245", delta: "↑ 4,3%" },
        { label: "Clientes", value: "856", delta: "↑ 6,7%" },
      ],
      categories: [
        { name: "Bebidas", color: "#f97316" },
        { name: "Almacén", color: "#3b82f6" },
        { name: "Limpieza", color: "#22d3ee" },
        { name: "Otros", color: "#a78bfa" },
      ],
    };
  },

  methods: {
    clearError() {
      this.error = null;
      this.$nextTick(() => {
        this.initGoogleSignIn();
      });
    },

    goToHome() {
      this.$router.push("/inicio");
    },

    async initGoogleSignIn() {
      if (!window.google?.accounts?.id) {
        console.error("La API de Google no está disponible");
        return;
      }

      const buttonElement = document.getElementById("google-signin-button");
      if (!buttonElement) {
        setTimeout(() => this.initGoogleSignIn(), 100);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: this.handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          context: "signin",
        });

        window.google.accounts.id.renderButton(buttonElement, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });

        window.google.accounts.id.prompt();
      } catch (error) {
        console.error("Error al inicializar Google Sign-In:", error);
        this.error = "Error al inicializar la autenticación con Google";
      }
    },

    loadGoogleAPI() {
      return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    async handleGoogleResponse(response) {
      if (!response || !response.credential) {
        this.error = "No se recibió una credencial válida de Google";
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const credential = response.credential;

        const { data: loginData } = await api.post("/auth/post/login-google", {
          token: credential,
        });

        if (!loginData.user) {
          throw new Error(loginData.message || "Error al iniciar sesión con Google");
        }

        const expiresInMs = (loginData.expires_in || 28800) * 1000;
        const expirationTime = Date.now() + expiresInMs;

        Cookies.set("user_info", JSON.stringify(loginData.user), {
          expires: expiresInMs / (1000 * 60 * 60 * 24),
          path: "/",
          sameSite: "Lax",
        });

        localStorage.setItem("token_expiration", expirationTime);
        localStorage.removeItem("session_warning_shown");

        this.success = true;
        setTimeout(() => {
          this.goToHome();
        }, 2000);
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Error desconocido en el proceso de inicio de sesión";
        this.error = msg;
        console.error("Error en login con Google:", error);
      } finally {
        this.loading = false;
      }
    },
  },

  async mounted() {
    try {
      await this.loadGoogleAPI();
      await this.$nextTick();
      await this.initGoogleSignIn();
    } catch (error) {
      console.error("Error en mounted:", error);
      this.error = "Error al cargar la autenticación con Google";
    }
  },
};
</script>

<style scoped>
.spinner-premium {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid #f97316;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>