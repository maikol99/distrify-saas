<template>
  <div
    class="min-h-screen flex font-display"
  >
    <!-- Left: Form Panel -->
    <div class="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-6 py-3">
      <!-- Background Decor -->
      <div
        class="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"
      ></div>
      <div
        class="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-700"
      ></div>

    <div class="w-full max-w-md reveal-active relative z-10 transition-all">
      <div
        class="animate-fade-in-down relative"
      >
        <button
          @click="$router.push('/')"
          class="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors font-bold text-sm group mb-3"
        >
          <span
            class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform"
            >arrow_back</span
          >
          Volver
        </button>
        <div class="flex flex-col items-center mb-4">
          <img
            src="/distrify-orange.png"
            alt="Distrify"
            width="80px"
            class="cursor-pointer mb-1"
            @click="$router.push('/')"
          />
          <h2
            class="text-xl font-black tracking-tighter text-slate-800 dark:text-white"
          >
            Bienvenido
          </h2>
          <p class="text-slate-500 text-xs mt-0.5">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <!-- Panel: Email no verificado -->
        <div
          v-if="emailNotVerified"
          class="mb-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 animate-fade-in"
        >
          <div class="flex items-start gap-3 mb-4">
            <span class="material-symbols-outlined text-amber-500 text-2xl mt-0.5">mark_email_unread</span>
            <div>
              <p class="font-black text-amber-800 dark:text-amber-300 text-sm">Verificá tu correo electrónico</p>
              <p class="text-amber-700 dark:text-amber-400 text-sm mt-1">
                Enviamos un link de verificación a <strong>{{ email }}</strong>. Revisá tu bandeja de entrada y también la carpeta de spam.
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="resendVerificationEmail"
            :disabled="resendCooldown > 0 || resendLoading"
            class="w-full py-3 rounded-xl font-bold text-sm transition-all"
            :class="resendCooldown > 0
              ? 'bg-amber-100 text-amber-400 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'"
          >
            <span v-if="resendLoading">Enviando...</span>
            <span v-else-if="resendCooldown > 0">Reenviar en {{ resendCooldown }}s</span>
            <span v-else>
              <span class="material-symbols-outlined text-sm align-middle mr-1">send</span>
              Reenviar email de verificación
            </span>
          </button>
          <p v-if="resendSuccess" class="text-center text-xs text-green-600 dark:text-green-400 font-bold mt-2 animate-fade-in">
            ✓ Email reenviado correctamente
          </p>
        </div>

        <form @submit.prevent="login" class="space-y-3">
          <!-- Error Alerts -->
          <div
            v-if="errorMessage && !emailNotVerified"
            class="p-4 rounded-2xl flex items-center gap-3 text-sm animate-fade-in"
            :class="getErrorClass()"
          >
            <span class="material-symbols-outlined text-lg">{{
              getErrorIcon()
            }}</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Email Field -->
          <div
            class="space-y-1 group animate-slide-up"
            style="animation-delay: 100ms"
          >
            <label
              for="email"
              class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
              >Email</label
            >
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                >mail</span
              >
              <input
                type="email"
                id="email"
                v-model="email"
                required
                placeholder="ejemplo@email.com"
                class="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:text-white text-sm"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div
            class="space-y-1 group animate-slide-up"
            style="animation-delay: 200ms"
          >
            <label
              for="password"
              class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
              >Contraseña</label
            >
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                >lock</span
              >
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-9 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:text-white text-sm"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
              >
                <span class="material-symbols-outlined text-xl">{{
                  showPassword ? "visibility_off" : "visibility"
                }}</span>
              </button>
            </div>
          </div>

          <div class="flex justify-end">
            <a
              href="#"
              @click.prevent="forgotPassword"
              class="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
              >¿Olvidaste tu contraseña?</a
            >
          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-primary text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-sm"
            :disabled="loading || !isFormValid"
          >
            <span v-if="!loading">Ingresar</span>
            <span v-else class="material-symbols-outlined animate-spin"
              >progress_activity</span
            >
          </button>
        </form>

        <div class="mt-3">
          <div class="relative flex items-center justify-center py-2">
            <div
              class="w-full border-t border-slate-200 dark:border-slate-800"
            ></div>
            <span
              class="bg-slate-50 dark:bg-slate-950 px-3 text-xs font-bold text-slate-400 absolute"
              >O CONTINUAR CON</span
            >
          </div>

          <button
            @click="loginWithGoogle"
            class="w-full py-2 glass border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            <img src="/public/google.png" alt="Google" class="w-4 h-4" />
            <span class="font-bold text-sm">Google</span>
          </button>
        </div>

        <p class="mt-4 text-center text-sm text-slate-500">
          ¿No tenés cuenta?
          <a
            href="/registro"
            class="text-primary font-black hover:underline ml-1"
          >
            Registrate gratis
          </a>
        </p>
      </div>
    </div>
    </div>

    <!-- Right: Marketing Panel (desktop only) -->
    <div class="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 flex-col items-center justify-center p-16">
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full filter blur-3xl animate-pulse-slow delay-700"></div>

      <div class="relative z-10 text-center max-w-md">
        <img src="/distrify-orange.png" alt="Distrify" class="w-28 mx-auto mb-10 opacity-90" />
        <h2 class="text-4xl font-black tracking-tighter text-white leading-tight mb-4">
          Tomá decisiones con datos en tiempo real.
        </h2>
        <p class="text-slate-400 text-base leading-relaxed mb-12">
          Gestioná tu negocio, tus ventas y tu equipo desde un solo lugar.
        </p>

        <div class="grid grid-cols-3 gap-6">
          <div class="flex flex-col items-center">
            <span class="text-3xl font-black text-primary">+38%</span>
            <span class="text-slate-400 text-xs mt-1">Margen promedio</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-3xl font-black text-white">4.2x</span>
            <span class="text-slate-400 text-xs mt-1">ROAS medio</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-3xl font-black text-primary">$284k</span>
            <span class="text-slate-400 text-xs mt-1">En ventas hoy</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Recovery Modal -->
    <div
      v-if="showForgotPasswordModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="glass w-full max-w-sm p-8 rounded-[2.5rem] border border-white/20 shadow-2xl animate-slide-up"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-black tracking-tighter">Recuperar Acceso</h3>
          <button
            @click="closeForgotPasswordModal"
            class="text-slate-400 hover:text-primary transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <p class="text-slate-500 text-sm mb-6 leading-relaxed">
          Ingresa tu email para recibir instrucciones de recuperación.
        </p>

        <div class="space-y-4">
          <div class="space-y-2">
            <label
              class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
              >Tu Email</label
            >
            <input
              v-model="recoveryEmail"
              type="email"
              placeholder="email@ejemplo.com"
              class="w-full px-5 py-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>
          <button
            @click="sendPasswordRecovery"
            class="w-full py-4 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/25 disabled:opacity-50"
            :disabled="!recoveryEmail || recoverySending"
          >
            {{ recoverySending ? "Enviando..." : "Enviar enlace" }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <SpinnerComponent v-if="loading"></SpinnerComponent>
</template>

<script>
import SpinnerComponent from "@/components/visuals/spinnerComponent.vue";
import Cookies from "js-cookie";
import api from "@/config/axios.config";
export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      formSubmitted: false,
      loading: false,
      errorMessage: "",
      errorType: "error",
      emailNotVerified: false,
      resendLoading: false,
      resendCooldown: 0,
      resendSuccess: false,
      resendTimer: null,
      showForgotPasswordModal: false,
      recoveryEmail: "",
      recoverySending: false,
      showPassword: false,
    };
  },
  components: {
    SpinnerComponent,
  },
  computed: {
    isFormValid() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return this.email && emailPattern.test(this.email) && this.password;
    },
  },
  methods: {
    async loginWithGoogle() {
      window.open("https://distrify.com.ar/inicio-sesion-google", "_blank");
    },
    getErrorClass() {
      switch (this.errorType) {
        case "warning":
          return "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30";
        case "info":
          return "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30";
        default:
          return "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30";
      }
    },
    getErrorIcon() {
      switch (this.errorType) {
        case "warning":
          return "warning";
        case "info":
          return "info";
        default:
          return "error";
      }
    },
    clearCookies() {
      Cookies.remove("user_info");
      localStorage.removeItem("token_expiration");
    },
    async login() {
      try {
        this.clearCookies();
        this.loading = true;
        this.errorMessage = "";
        this.errorType = "error";

        if (!this.email) {
          this.errorMessage = "Por favor, ingresa tu correo electrónico";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        if (!this.password) {
          this.errorMessage = "Por favor, ingresa tu contraseña";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(this.email)) {
          this.errorMessage = "El formato del correo electrónico no es válido";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        const response = await api.post("/auth/post/login-user", {
          email: this.email,
          password: this.password,
        });

        const data = response.data;
        console.log(data);

        if (data.user) {
          const expiresInMs = (data.expires_in || 28800) * 1000;
          const expirationTime = Date.now() + expiresInMs;
          const cookieExpireDays = expiresInMs / (1000 * 60 * 60 * 24);

          Cookies.set("user_info", JSON.stringify(data.user), { expires: cookieExpireDays });

          localStorage.setItem("token_expiration", expirationTime);
          localStorage.removeItem("session_warning_shown");

          import("@/config/axios.config").then(({ scheduleAutoLogout }) => {
            scheduleAutoLogout(expiresInMs);
          });

          this.formSubmitted = true;
          this.$router.push("/inicio");
        } else {
          this.errorMessage =
            "Error en el inicio de sesión. Verifica tus credenciales.";
          this.errorType = "error";
        }
      } catch (error) {
        console.error(error);
        this.errorType = "error";

        if (error.response && error.response.data) {
          // Personalizar mensajes según el tipo de error
          if (error.response.status === 401) {
            const msg = error.response.data?.message || "";
            if (msg.includes("período de prueba") || msg.includes("prueba de 7 días")) {
              this.$router.push("/prueba-expirada");
              return;
            } else if (msg.includes("verificar tu correo") || msg.includes("correo electrónico")) {
              this.emailNotVerified = true;
              this.errorMessage = "";
            } else {
              this.errorMessage =
                "Credenciales incorrectas. Verifica tu email y contraseña.";
            }
          } else if (error.response.status === 403) {
            this.errorMessage =
              "Tu cuenta está desactivada o no tienes permisos para acceder.";
          } else if (error.response.status === 429) {
            this.errorMessage =
              "Demasiados intentos fallidos. Intenta de nuevo más tarde.";
            this.errorType = "warning";
          } else if (error.response.data.message) {
            this.errorMessage = error.response.data.message;
          } else {
            this.errorMessage =
              "Error en el inicio de sesión. Verifica tus credenciales.";
          }
        } else if (error.request) {
          this.errorMessage =
            "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
          this.errorType = "info";
        } else {
          this.errorMessage =
            "Error en el inicio de sesión. Verifica tus credenciales.";
        }

        this.loading = false;
      }
    },
    async resendVerificationEmail() {
      if (this.resendCooldown > 0 || this.resendLoading || !this.email) return;
      this.resendLoading = true;
      this.resendSuccess = false;
      try {
        await api.post(`/auth/post/resend-verification-token?email=${encodeURIComponent(this.email)}`);
        this.resendSuccess = true;
        this.resendCooldown = 60;
        this.resendTimer = setInterval(() => {
          this.resendCooldown--;
          if (this.resendCooldown <= 0) {
            clearInterval(this.resendTimer);
            this.resendTimer = null;
          }
        }, 1000);
      } catch (e) {
        // silenciar — el email puede no existir
      } finally {
        this.resendLoading = false;
      }
    },
    goToRegister() {
      this.$router.push("/registro");
    },
    forgotPassword() {
      this.showForgotPasswordModal = true;
    },
    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
      this.recoveryEmail = "";
    },
    async sendPasswordRecovery() {
      if (!this.recoveryEmail) return;
      this.loading = true;

      try {
        this.recoverySending = true;
        const responde = await api.post(
          "/auth/post/generate-password-reset-code?email=" + this.recoveryEmail,
        );
        const data = responde.data;

        if (data.success) {
          alert(
            "Se han enviado las instrucciones para restablecer tu contraseña a tu correo electrónico. Revisa tu carpeta de spam si no lo ves en tu bandeja de entrada.",
          );
          this.closeForgotPasswordModal();
        } else {
          alert(
            "Hubo un error al enviar las instrucciones. Verifica que el correo sea correcto.",
          );
        }
      } catch (error) {
        console.error(error);
        alert(
          "Hubo un error al enviar las instrucciones. Verifica que el correo sea correcto.",
        );
        this.recoverySending = false;
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // Verificar si ya hay una sesión activa
    const token = localStorage.getItem("userToken");
    if (token) {
      this.$router.push("/");
    }
  },
  beforeUnmount() {
    if (this.resendTimer) clearInterval(this.resendTimer);
  },
};
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .glass {
  background: rgba(35, 25, 15, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Keyframe Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseSlow {
  0%,
  100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.1);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}
.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out forwards;
}
.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-pulse-slow {
  animation: pulseSlow 5s ease-in-out infinite;
}

/* Scroll Reveal helper */
.reveal-active {
  opacity: 1;
  transform: translateY(0);
}
</style>
