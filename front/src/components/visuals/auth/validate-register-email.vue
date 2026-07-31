<template>
  <div class="validate-container">
    <div class="validate-card">
      <div class="brand">
        <div class="brand-logo">Alevia Pay</div>
        <div class="brand-sub">Sistema de Gestión de Negocios</div>
      </div>

      <div class="header-section">
        <div class="icon-wrapper" :class="{ success: validationSuccess, error: !loading && !validationSuccess && errorMessage }">
          <span class="material-symbols-outlined" v-if="loading">hourglass_empty</span>
          <span class="material-symbols-outlined" v-else-if="validationSuccess">mark_email_read</span>
          <span class="material-symbols-outlined" v-else>error_outline</span>
        </div>
        <h1 class="title">
          <template v-if="loading">Verificando tu correo...</template>
          <template v-else-if="validationSuccess">¡Email verificado!</template>
          <template v-else>Error de verificación</template>
        </h1>
        <p class="subtitle">
          <template v-if="loading">Estamos confirmando tu dirección de correo electrónico</template>
          <template v-else-if="validationSuccess">Tu cuenta ha sido activada correctamente</template>
          <template v-else>{{ errorMessage }}</template>
        </p>
      </div>

      <div class="content-section">
        <spinner-component v-if="loading" class="spinner" />

        <div v-if="!loading && validationSuccess" class="result-box result-success">
          <span class="material-symbols-outlined result-icon">check_circle</span>
          <p>Ya podés iniciar sesión y comenzar a gestionar tu negocio.</p>
        </div>

        <div v-if="!loading && !validationSuccess && errorMessage" class="result-box result-error">
          <span class="material-symbols-outlined result-icon">cancel</span>
          <p>El enlace puede haber expirado. Intentá solicitar uno nuevo desde la página de login.</p>
        </div>
      </div>

      <div class="actions-section" v-if="!loading">
        <button v-if="validationSuccess" @click="redirectToLogin" class="btn-primary">
          Iniciar sesión
        </button>
        <button v-else @click="retryValidation" class="btn-secondary">
          Intentar nuevamente
        </button>
        <a href="/iniciar-sesion" class="link-back">Volver al login</a>
      </div>
    </div>

    <transition name="toast" appear>
      <toastComponent
        v-if="toast.showing"
        :message="toast.message"
        :state="toast.state"
        class="toast-overlay"
      />
    </transition>
  </div>
</template>

<script>
import api from "@/config/axios.config";
import spinnerComponent from "../spinnerComponent.vue";
import toastComponent from "../toast/toastComponent.vue";

export default {
  components: {
    spinnerComponent,
    toastComponent,
  },
  data() {
    return {
      loading: false,
      validationSuccess: false,
      errorMessage: "",
      toast: {
        showing: false,
        message: "",
        state: "",
      },
    };
  },
  methods: {
    async validateEmail() {
      this.loading = true;
      this.validationSuccess = false;
      this.errorMessage = "";

      try {
        const rawToken = this.$route.params.token;
        const token = decodeURIComponent(rawToken);

        const response = await api.post(
          `/auth/post/verify-email?code=${encodeURIComponent(token)}`
        );

        const data = response.data;

        if (data.success) {
          this.validationSuccess = true;
          this.showToast("Email verificado con éxito.", "success");
        } else {
          this.validationSuccess = false;
          this.errorMessage = data.message || "Error desconocido";
          this.showToast(data.message, "danger");
        }
      } catch (error) {
        console.error("Error al verificar el email:", error);
        this.validationSuccess = false;
        this.errorMessage = "Error de conexión. Intenta nuevamente.";
        this.showToast("Error de conexión", "danger");
      } finally {
        this.loading = false;
      }
    },

    showToast(message, state) {
      this.toast = { showing: true, message, state };
      setTimeout(() => { this.toast.showing = false; }, 4000);
    },

    async retryValidation() {
      await this.validateEmail();
    },

    redirectToLogin() {
      this.$router.push("/iniciar-sesion");
    },
  },

  async mounted() {
    await this.validateEmail();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');

.validate-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #f8f7f5;
  font-family: 'Inter', -apple-system, sans-serif;
}

.validate-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 36px;
  width: 100%;
  max-width: 460px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.brand {
  text-align: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.brand-logo {
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #f9931e;
  letter-spacing: -0.5px;
}

.brand-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.header-section {
  text-align: center;
  margin-bottom: 28px;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: #f1f5f9;
  color: #94a3b8;
}

.icon-wrapper.success {
  background: #fff7ed;
  color: #f9931e;
}

.icon-wrapper.error {
  background: #fef2f2;
  color: #ef4444;
}

.icon-wrapper .material-symbols-outlined {
  font-size: 32px;
}

.title {
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.content-section {
  margin-bottom: 24px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  transform: scale(1.1);
}

.result-box {
  width: 100%;
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.result-success {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #92400e;
}

.result-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.result-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.result-success .result-icon { color: #f9931e; }
.result-error .result-icon { color: #ef4444; }

.result-box p { margin: 0; }

.actions-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.btn-primary {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f9931e, #e8821a);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(249, 147, 30, 0.35);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249, 147, 30, 0.4);
}

.btn-secondary {
  width: 100%;
  padding: 12px 20px;
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.link-back {
  font-size: 13px;
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
}

.link-back:hover {
  color: #64748b;
}

.toast-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 480px) {
  .validate-card {
    padding: 28px 20px;
    border-radius: 16px;
  }
}
</style>
