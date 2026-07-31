<template>
  <div class="min-h-screen flex font-display">
    <!-- Left: Form Panel -->
    <div
      class="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-6 py-2"
    >
      <!-- Background Decor -->
      <div
        class="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"
      ></div>
      <div
        class="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-700"
      ></div>

      <div class="w-full max-w-lg reveal-active relative z-10 transition-all">
        <div class="animate-fade-in-down relative">
          <!-- Back Button -->
          <button
            @click="$router.push('/')"
            class="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors font-bold text-sm group mb-2"
          >
            <span
              class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform"
              >arrow_back</span
            >
            Volver
          </button>

          <div class="flex flex-col items-center mb-3">
            <img
              src="/alevia-logo.png"
              alt="Alevia Pay"
              width="70px"
              class="cursor-pointer mb-1"
              @click="$router.push('/')"
            />
            <h2
              class="text-xl font-black tracking-tighter text-slate-800 dark:text-white"
            >
              Crear Cuenta
            </h2>
            <p class="text-slate-500 text-xs mt-0.5">
              Únete al futuro de la gestión empresarial
            </p>
          </div>

          <form @submit.prevent="register" class="space-y-2.5">
            <!-- Alerts -->
            <div
              v-if="successMessage"
              class="p-3 rounded-xl bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 flex items-center gap-2 text-sm animate-fade-in"
            >
              <span class="material-symbols-outlined text-base"
                >check_circle</span
              >
              <span>{{ successMessage }}</span>
            </div>
            <div
              v-if="errorMessage"
              class="p-3 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 flex items-center gap-2 text-sm animate-fade-in"
            >
              <span class="material-symbols-outlined text-base">error</span>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- User & Phone Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Username -->
              <div
                class="space-y-1 group animate-slide-up"
                style="animation-delay: 100ms"
              >
                <label
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                  >Usuario</label
                >
                <div class="relative">
                  <span
                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                    >person</span
                  >
                  <input
                    v-model="username"
                    type="text"
                    required
                    placeholder="Carlos92"
                    class="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                  />
                </div>
              </div>
              <!-- Phone -->
              <div
                class="space-y-1 group animate-slide-up"
                style="animation-delay: 150ms"
              >
                <label
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                  >Teléfono</label
                >
                <div class="relative">
                  <span
                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                    >call</span
                  >
                  <input
                    v-model="phone"
                    type="text"
                    required
                    placeholder="+54 11..."
                    class="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Email -->
            <div
              class="space-y-1 group animate-slide-up"
              style="animation-delay: 200ms"
            >
              <label
                class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                >Email</label
              >
              <div class="relative">
                <span
                  class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                  >mail</span
                >
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="hola@aleviapay.com"
                  class="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                />
              </div>
            </div>

            <!-- Passwords Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Password -->
              <div
                class="space-y-1 group animate-slide-up"
                style="animation-delay: 250ms"
              >
                <label
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
                    v-model="password"
                    required
                    placeholder="••••••••"
                    @input="checkPasswordStrength"
                    class="w-full pl-10 pr-9 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span class="material-symbols-outlined text-base">{{
                      showPassword ? "visibility_off" : "visibility"
                    }}</span>
                  </button>
                </div>
                <div v-if="password" class="px-1">
                  <div
                    class="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full transition-all duration-500"
                      :class="{
                        'bg-red-500': passwordStrength === 'weak',
                        'bg-orange-500': passwordStrength === 'medium',
                        'bg-green-500': passwordStrength === 'strong',
                      }"
                      :style="{ width: getStrengthWidth() }"
                    ></div>
                  </div>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider mt-0.5 block"
                    :class="{
                      'text-red-500': passwordStrength === 'weak',
                      'text-orange-500': passwordStrength === 'medium',
                      'text-green-500': passwordStrength === 'strong',
                    }"
                    >{{ getStrengthText() }}</span
                  >
                </div>
              </div>
              <!-- Confirm Password -->
              <div
                class="space-y-1 group animate-slide-up"
                style="animation-delay: 300ms"
              >
                <label
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                  >Confirmar</label
                >
                <div class="relative">
                  <span
                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[18px]"
                    >verified_user</span
                  >
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="confirmPassword"
                    required
                    placeholder="••••••••"
                    class="w-full pl-10 pr-9 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span class="material-symbols-outlined text-base">{{
                      showConfirmPassword ? "visibility_off" : "visibility"
                    }}</span>
                  </button>
                </div>
                <div
                  v-if="confirmPassword"
                  class="flex items-center gap-1 mt-0.5 ml-1"
                >
                  <span
                    class="material-symbols-outlined text-[13px]"
                    :class="passwordsMatch ? 'text-green-500' : 'text-red-500'"
                    >{{ passwordsMatch ? "check_circle" : "cancel" }}</span
                  >
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider"
                    :class="passwordsMatch ? 'text-green-500' : 'text-red-500'"
                    >{{ passwordsMatch ? "Coinciden" : "No coinciden" }}</span
                  >
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 bg-primary text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              :disabled="loading || !isFormValid"
            >
              <span v-if="!loading">Registrarme</span>
              <span v-else class="material-symbols-outlined animate-spin"
                >progress_activity</span
              >
            </button>
          </form>

          <div class="mt-3">
            <div class="relative flex items-center justify-center py-2.5">
              <div
                class="w-full border-t border-slate-200 dark:border-slate-800"
              ></div>
              <span
                class="bg-slate-50 dark:bg-slate-950 px-3 text-xs font-bold text-slate-400 absolute"
                >O CON GOOGLE</span
              >
            </div>

            <button
              @click="registerWithGoogle"
              class="w-full py-2.5 glass border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              <img src="/public/google.png" alt="Google" class="w-4 h-4" />
              <span class="font-bold text-sm">Crear con Google</span>
            </button>
          </div>

          <p class="mt-4 text-center text-sm text-slate-500">
            ¿Ya tienes una cuenta?
            <button
              @click="goToLogin"
              class="text-primary font-black hover:underline ml-1"
            >
              Inicia Sesión
            </button>
          </p>
        </div>
      </div>
    </div>

    <!-- Right: Marketing Panel (desktop only) -->
    <div
      class="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 flex-col items-center justify-center p-16"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      ></div>
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-pulse-slow"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full filter blur-3xl animate-pulse-slow delay-700"
      ></div>

      <div class="relative z-10 text-center max-w-md">
        <img
          src="/alevia-logo.png"
          alt="Alevia Pay"
          class="w-28 mx-auto mb-10 opacity-90"
        />
        <h2
          class="text-4xl font-black tracking-tighter text-white leading-tight mb-4"
        >
          Tu negocio, bajo control desde el día uno.
        </h2>
        <p class="text-slate-400 text-base leading-relaxed mb-12">
          Registrate gratis y empezá a gestionar ventas, caja y productos en
          minutos.
        </p>

        <div class="flex flex-col gap-4 text-left">
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0"
            >
              <span class="material-symbols-outlined text-primary text-lg"
                >storefront</span
              >
            </div>
            <div>
              <p class="text-white font-bold text-sm">
                Gestión de tienda completa
              </p>
              <p class="text-slate-400 text-xs">
                Productos, stock, precios y más.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0"
            >
              <span class="material-symbols-outlined text-primary text-lg"
                >point_of_sale</span
              >
            </div>
            <div>
              <p class="text-white font-bold text-sm">
                Punto de venta integrado
              </p>
              <p class="text-slate-400 text-xs">
                Vendé rápido con caja y turnos.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0"
            >
              <span class="material-symbols-outlined text-primary text-lg"
                >bar_chart</span
              >
            </div>
            <div>
              <p class="text-white font-bold text-sm">
                Reportes en tiempo real
              </p>
              <p class="text-slate-400 text-xs">
                Tomá decisiones basadas en datos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p class="absolute bottom-6 text-slate-600 text-xs z-10">
        Alevia Pay Analytics
      </p>
    </div>
  </div>
  <SpinnerComponent v-if="loading"></SpinnerComponent>
</template>

<script>
import axios from "axios";
import SpinnerComponent from "@/components/visuals/spinnerComponent.vue";
import api from "@/config/axios.config";

export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      phone: "",
      confirmPassword: "",
      loading: false,
      formSubmitted: false,
      errorMessage: "",
      successMessage: "",
      showPassword: false,
      showConfirmPassword: false,
      passwordStrength: "weak",
    };
  },
  components: {
    SpinnerComponent,
  },
  computed: {
    isFormValid() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        this.username &&
        this.email &&
        emailPattern.test(this.email) &&
        this.password &&
        this.confirmPassword &&
        this.password === this.confirmPassword
      );
    },
    passwordsMatch() {
      return this.password === this.confirmPassword;
    },
  },
  methods: {
    async registerWithGoogle() {
      this.$router.push("/inicio-sesion-google");
    },
    async register() {
      try {
        this.loading = true;
        this.errorMessage = "";
        this.successMessage = "";
        if (!this.isFormValid) {
          this.errorMessage =
            "Por favor, completa todos los campos correctamente";
          this.loading = false;
          return;
        }
        if (this.password !== this.confirmPassword) {
          this.errorMessage = "Las contraseñas no coinciden";
          this.loading = false;
          return;
        }
        const emailToLowerCase = this.email.toLowerCase();
        const response = await api.post("/auth/post/register-user", {
          username: this.username,
          email: emailToLowerCase,
          password: this.password,
          phone: this.phone,
          createShop: true,
        });
        const data = response.data;
        if (data.success) {
          this.formSubmitted = true;
          this.successMessage = "¡Registro exitoso! Redirigiendo al login...";

          alert(
            "¡Registro exitoso! En tu correo electrónico se han enviado las instrucciones para continuar, si no las ves, revisa tu carpeta de SPAM.",
          );

          // Limpiar el formulario
          this.username = "";
          this.email = "";
          this.password = "";
          this.phone = "";
          this.confirmPassword = "";
          this.showPassword = false;
          this.showConfirmPassword = false;
          this.passwordStrength = "weak";

          setTimeout(() => {
            this.$router.push("/iniciar-sesion");
          }, 2000);
        }
      } catch (error) {
        console.error(error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage =
            "Error en el registro. Por favor intenta nuevamente.";
        }
      } finally {
        this.loading = false;
      }
    },
    goToLogin() {
      this.$router.push("/iniciar-sesion");
    },
    checkPasswordStrength() {
      const password = this.password;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasNonalphas = /\W/.test(password);
      const hasMinLength = password.length >= 8;
      let score = 0;
      if (hasUpperCase) score++;
      if (hasLowerCase) score++;
      if (hasNumbers) score++;
      if (hasNonalphas) score++;
      if (hasMinLength) score++;
      if (score < 3) {
        this.passwordStrength = "weak";
      } else if (score < 5) {
        this.passwordStrength = "medium";
      } else {
        this.passwordStrength = "strong";
      }
    },
    getStrengthWidth() {
      switch (this.passwordStrength) {
        case "weak":
          return "33%";
        case "medium":
          return "66%";
        case "strong":
          return "100%";
        default:
          return "0%";
      }
    },
    getStrengthText() {
      switch (this.passwordStrength) {
        case "weak":
          return "Débil";
        case "medium":
          return "Media";
        case "strong":
          return "Fuerte";
        default:
          return "";
      }
    },
  },
  mounted() {},
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
