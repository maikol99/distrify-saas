<template>
  <div class="min-h-screen flex font-display items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-6 py-12">
    <!-- Background Decor Blurry Blobs -->
    <div class="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
    <div class="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-700"></div>

    <div class="w-full max-w-md relative z-10 transition-all">
      <!-- Back Button -->
      <button
        @click="$router.push('/registro')"
        class="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors font-bold text-sm group mb-6"
      >
        <span class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Volver al registro
      </button>

      <!-- Main Login Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <!-- Logo & Header -->
        <div class="flex flex-col items-center mb-6">
          <img
            src="/alevia-logo.png"
            alt="Alevia Pay"
            width="80px"
            class="cursor-pointer mb-2"
            @click="$router.push('/')"
          />
          <h2 class="text-2xl font-black tracking-tighter text-slate-800 dark:text-white">
            Crear Cuenta
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-xs mt-1 text-center">
            Regístrate de forma rápida y segura vinculando tu cuenta de Google
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-8 space-y-4">
          <div class="spinner-premium"></div>
          <p class="text-slate-600 dark:text-slate-300 text-sm font-semibold animate-pulse">Procesando registro con Google...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-2xl">error</span>
          </div>
          <p class="text-red-600 dark:text-red-400 text-sm font-semibold mb-6 px-2">{{ error }}</p>
          <button @click="clearError" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 active:scale-95 transition-all">
            Intentar de nuevo
          </button>
        </div>

        <!-- Success State -->
        <div v-if="success" class="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <span class="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <h3 class="text-lg font-black text-slate-800 dark:text-white mb-2">¡Registro exitoso!</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">Tu cuenta ha sido creada correctamente. Iniciando sesión...</p>
          <button @click="goToHome" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 active:scale-95 transition-all w-full">
            Entrar al Panel
          </button>
        </div>

        <!-- Signin Button wrapper -->
        <div v-if="!loading && !error && !success" class="flex flex-col items-center justify-center py-4">
          <div id="google-signin-button" class="w-full flex justify-center py-2"></div>
          
          <div class="relative w-full text-center my-6">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <span class="relative bg-white dark:bg-slate-900 px-4 text-xs text-slate-400 font-bold uppercase tracking-widest">o</span>
          </div>

          <p class="text-slate-500 dark:text-slate-400 text-sm">
            ¿Ya tienes cuenta?
            <router-link to="/iniciar-sesion" class="text-primary hover:underline font-bold transition-all ml-1">Inicia sesión aquí</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/config/axios.config';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default {
  data() {
    return {
      loading: false,
      error: null,
      success: false,
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
        });

        window.google.accounts.id.renderButton(buttonElement, {
          theme: this.isDarkTheme() ? "filled_black" : "outline",
          size: "large",
          width: 320,
          text: "signup_with",
          shape: "rectangular",
          logo_alignment: "left"
        });
      } catch (error) {
        console.error("Error al inicializar Google Sign-In:", error);
        this.error = "Error al inicializar la autenticación con Google";
      }
    },

    isDarkTheme() {
      return document.documentElement.classList.contains("dark") || 
             window.matchMedia("(prefers-color-scheme: dark)").matches;
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
      if (!response?.credential) {
        this.error = "No se pudo obtener las credenciales de Google";
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const credential = response.credential;

        // Endpoint unificado: crea el usuario si no existe y devuelve sesión
        const { data: loginData } = await api.post("/auth/post/login-google", {
          token: credential,
        });

        if (!loginData.user) throw new Error(loginData.message || "Error al crear la cuenta con Google");

        import("@/config/axios.config").then(({ scheduleAutoLogout }) => {
          const expiresInMs = (loginData.expires_in || 28800) * 1000;
          import("js-cookie").then((Cookies) => {
            Cookies.default.set("user_info", JSON.stringify(loginData.user), {
              expires: expiresInMs / (1000 * 60 * 60 * 24),
              path: "/",
              sameSite: "Lax",
            });
          });
          localStorage.setItem("token_expiration", Date.now() + expiresInMs);
          localStorage.removeItem("session_warning_shown");
          scheduleAutoLogout(expiresInMs);
        });

        this.success = true;
        setTimeout(() => {
          this.goToHome();
        }, 2000);

      } catch (error) {
        console.error("Error completo:", error);
        this.error = error?.response?.data?.message || error?.message || "Error desconocido en el proceso de registro";
      } finally {
        this.loading = false;
      }
    }
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
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.3; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>