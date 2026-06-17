<template>
  <div class="reset-container">
    <form
      @submit.prevent="updatePassword"
      class="reset-form"
      :class="{ 'form-success': formSubmitted }"
    >
      <div class="form-logo">
        <img style="width: 100px" src="/public/distrify-nav.png" alt="Logo" />
      </div>

      <div class="form-title">
        <h3>Nueva Contraseña</h3>
      </div>

      <!-- Mensajes de error/éxito personalizados -->
      <div v-if="errorMessage" class="alert" :class="getErrorClass()">
        <i :class="getErrorIcon()"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Paso 2: Nueva contraseña -->
      <div>
        <p class="instruction-text">
          Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres, incluir
          letras, números y un símbolo especial.
        </p>

        <div class="form-group" :class="{ 'input-filled': newPassword }">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
          </div>
          <input
            :type="showPassword ? 'text' : 'password'"
            id="newPassword"
            v-model="newPassword"
            required
            aria-label="Nueva contraseña"
          />
          <label for="newPassword">Nueva contraseña</label>
          <div class="input-underline"></div>
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>

        <div class="form-group" :class="{ 'input-filled': confirmPassword }">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
          </div>
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            aria-label="Confirmar contraseña"
          />
          <label for="confirmPassword">Confirmar contraseña</label>
          <div class="input-underline"></div>
          <button
            type="button"
            class="password-toggle"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i
              :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
            ></i>
          </button>
        </div>

        <!-- Indicadores de validación de contraseña -->
        <div class="password-requirements">
          <div
            class="requirement"
            :class="{ valid: passwordRequirements.length }"
          >
            <i class="fas fa-check"></i>
            <span>Mínimo 8 caracteres</span>
          </div>
          <div
            class="requirement"
            :class="{ valid: passwordRequirements.hasNumber }"
          >
            <i class="fas fa-check"></i>
            <span>Al menos un número</span>
          </div>
          <div
            class="requirement"
            :class="{ valid: passwordRequirements.hasLetter }"
          >
            <i class="fas fa-check"></i>
            <span>Al menos una letra</span>
          </div>
          <div
            class="requirement"
            :class="{ valid: passwordRequirements.hasSpecial }"
          >
            <i class="fas fa-check"></i>
            <span>Al menos un símbolo especial</span>
          </div>
          <div
            class="requirement"
            :class="{ valid: passwordRequirements.match }"
          >
            <i class="fas fa-check"></i>
            <span>Las contraseñas coinciden</span>
          </div>
        </div>
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="!loading">
          Actualizar contraseña
        </span>
        <i v-else class="fas fa-spinner fa-spin"></i>
      </button>

      <!-- Botón para volver al paso anterior -->
      <button
        v-if="step === 2"
        type="button"
        class="btn-secondary"
        @click="goBackToStep1"
      >
        <i class="fas fa-arrow-left"></i>
        Volver
      </button>

      <div class="login-link-container">
        <p>¿Recordaste tu contraseña?</p>
        <button type="button" class="login-button" @click="goToLogin">
          Iniciar Sesión
        </button>
      </div>
    </form>
  </div>
  <SpinnerComponent v-if="loading"></SpinnerComponent>
</template>

<script>
import SpinnerComponent from "@/components/visuals/spinnerComponent.vue";
import api from "@/config/axios.config";

export default {
  data() {
    return {
      step: 1, // 1: código de verificación, 2: nueva contraseña
      email: "",
      resetCode: "",
      newPassword: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
      formSubmitted: false,
      loading: false,
      errorMessage: "",
      errorType: "error",
    };
  },
  components: {
    SpinnerComponent,
  },
  computed: {
    passwordRequirements() {
      return {
        length: this.newPassword.length >= 8,
        hasNumber: /\d/.test(this.newPassword),
        hasLetter: /[a-zA-Z]/.test(this.newPassword),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
          this.newPassword
        ),
        match:
          this.newPassword === this.confirmPassword &&
          this.confirmPassword !== "",
      };
    },
  },
  methods: {
    getErrorClass() {
      switch (this.errorType) {
        case "warning":
          return "warning-alert";
        case "info":
          return "info-alert";
        case "success":
          return "success-alert";
        default:
          return "error-alert";
      }
    },
    getErrorIcon() {
      switch (this.errorType) {
        case "warning":
          return "fas fa-exclamation-triangle";
        case "info":
          return "fas fa-info-circle";
        case "success":
          return "fas fa-check-circle";
        default:
          return "fas fa-exclamation-circle";
      }
    },
   
    async validateToken() {
      this.loading = true;

      try {
        const rawToken = this.$route.params.token;
        const token = decodeURIComponent(rawToken);

        const response = await api.post(
          `/auth/post/verify-password-reset-code?resetCode=${encodeURIComponent(
            token
          )}`
        );

        const data = response.data;

        if (data.success) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error al validar el token:", error);
      } finally {
        this.loading = false;
      }
    },
    async updatePassword() {
      try {
        this.loading = true;
        this.errorMessage = "";
        this.errorType = "error";

        if (!this.newPassword || !this.confirmPassword) {
          this.errorMessage = "Por favor, completa todos los campos";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        if (this.newPassword !== this.confirmPassword) {
          this.errorMessage = "Las contraseñas no coinciden";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        if (
          !this.passwordRequirements.length ||
          !this.passwordRequirements.hasNumber ||
          !this.passwordRequirements.hasLetter ||
          !this.passwordRequirements.hasSpecial
        ) {
          this.errorMessage =
            "La contraseña no cumple con los requisitos de seguridad";
          this.errorType = "warning";
          this.loading = false;
          return;
        }

        const rawToken = this.$route.params.token;
        const token = decodeURIComponent(rawToken);

        const isValidToken = await this.validateToken()
        if (!isValidToken) {
          this.errorMessage = "Token inválido o expirado";
          this.errorType = "error";
          this.loading = false;
          return;
        }

        const response = await api.patch(
          `/auth/patch/update-password?newPassword=${this.newPassword}&resetCode=${encodeURIComponent(token)}`
        );
        const data = response.data;

        if (data.success) {
          this.formSubmitted = true;
          this.errorMessage = "Contraseña actualizada correctamente";
          this.errorType = "success";

          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.$router.push("/login");
          }, 500);
        } else {
          this.errorMessage =
            "Error al actualizar la contraseña. Inténtalo de nuevo.";
          this.errorType = "error";
        }
      } catch (error) {
        console.error(error);
        this.errorType = "error";

        if (error.response && error.response.data) {
          if (error.response.status === 400) {
            this.errorMessage = "Código de verificación inválido o expirado";
          } else if (error.response.status === 404) {
            this.errorMessage = "Usuario no encontrado";
          } else if (error.response.data.message) {
            this.errorMessage = error.response.data.message;
          } else {
            this.errorMessage = "Error al actualizar la contraseña";
          }
        } else if (error.request) {
          this.errorMessage =
            "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
          this.errorType = "info";
        } else {
          this.errorMessage = "Error al actualizar la contraseña";
        }
      } finally {
        this.loading = false;
      }
    },
    goBackToStep1() {
      this.step = 1;
      this.newPassword = "";
      this.confirmPassword = "";
      this.errorMessage = "";
    },
    goToLogin() {
      this.$router.push("/login");
    },
  },
  mounted() {
    // Si llegan parámetros en la URL (email), pre-llenar el campo
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      this.email = emailParam;
    }
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  background-color: #1a2234;
  padding: 1.5rem;
}

.reset-form {
  background-color: #1e2a45;
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  transition: all 0.3s ease;
}

.form-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-title {
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-title h3 {
  color: #e2e8f0;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.instruction-text {
  color: #94a3b8;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.form-group {
  position: relative;
  margin-bottom: 1.75rem;
}

.input-icon {
  position: absolute;
  left: 0;
  top: 8px;
  color: #94a3b8;
  transition: color 0.3s ease;
}

label {
  position: absolute;
  top: 8px;
  left: 24px;
  color: #94a3b8;
  pointer-events: none;
  transition: all 0.3s ease;
}

input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 24px;
  font-size: 1rem;
  color: #e2e8f0;
  border: none;
  border-bottom: 2px solid #334155;
  background-color: transparent;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
}

.input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #f9931e;
  transition: all 0.3s ease;
}

input:focus ~ .input-underline,
.input-filled .input-underline {
  width: 100%;
}

.input-filled label,
input:focus ~ label {
  top: -18px;
  left: 0;
  font-size: 0.75rem;
  color: white;
}

input:focus ~ .input-icon,
.input-filled .input-icon {
  color: #f9931e;
}

.password-toggle {
  position: absolute;
  right: 0;
  top: 8px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #f9931e;
}

.password-requirements {
  background-color: #0f172a;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #334155;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  transition: color 0.2s ease;
}

.requirement:last-child {
  margin-bottom: 0;
}

.requirement.valid {
  color: #10b981;
}

.requirement.valid i {
  color: #10b981;
}

.requirement i {
  font-size: 0.75rem;
  color: #64748b;
  transition: color 0.2s ease;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #f9931e;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.btn-primary:hover {
  background-color: #e88613;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(249, 147, 30, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background-color: #334155;
  color: #e2e8f0;
  transform: translateY(-1px);
}

.login-link-container {
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-link-container p {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

.login-button {
  background-color: transparent;
  color: #f9931e;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.login-button:hover {
  color: #e88613;
  text-decoration: underline;
}

/* Alertas personalizadas */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.error-alert {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.warning-alert {
  background-color: rgba(249, 147, 30, 0.15);
  border: 1px solid rgba(249, 147, 30, 0.3);
  color: #f9931e;
}

.info-alert {
  background-color: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.success-alert {
  background-color: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.alert i {
  font-size: 1rem;
}

@media (max-width: 640px) {
  .reset-form {
    padding: 1.5rem;
  }

  .reset-container {
    padding: 1rem;
  }
}
</style>
