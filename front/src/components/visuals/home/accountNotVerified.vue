<template>
  <div class="validation-banner">
    <div class="banner-card">
      <div class="banner-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="banner-content">
        <h3>¡Valida tu cuenta de email!</h3>
        <p>
          Para acceder a todas las funcionalidades de Distrify, necesitas
          validar tu dirección de correo electrónico.
          <strong>Revisa tu bandeja de entrada</strong> y busca el email de
          confirmación.
        </p>
        <div class="banner-actions">
          <div class="help-text">
            <i class="fas fa-info-circle"></i>
            <span>
              ¿No encuentras el email? Revisa tu carpeta de
              <strong>spam o correo no deseado</strong>
            </span>
          </div>
          <div class="action-buttons">
            <button class="resend-btn" @click="resendValidationCode">
              <i class="fas fa-paper-plane"></i>
              <span>Reenviar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSuccessMessage" class="success-message">
      <i class="fas fa-check-circle"></i>
      <span>¡Código de validación reenviado exitosamente!</span>
    </div>
  </div>
  <toastComponent
    v-if="toast.showing"
    :message="toast.message"
    :state="toast.state"
  ></toastComponent>

</template>

<script>
import toastComponent from "../toast/toastComponent.vue";
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";


export default {
  name: "EmailValidationBanner",
  components: {
    toastComponent,
  },
  data() {
    return {
      showSuccessMessage: false,
      isResending: false,
      cooldownActive: false,
      globalStore: useGlobalStore(),
      toast: {
        showing: false,
        message: "",
        state: "info", // 'success', 'error', 'info'
      },
    };
  },
  methods: {
    async resendValidationCode() {
      if (this.cooldownActive || this.isResending) return;

      this.isResending = true;
      try {
        console.log(this.globalStore.userData.email);
        const email = this.globalStore.userData.email;

        const response = await api.post(
          `/auth/post/resend-verification-token?email=${email}`
        );
        const data = response.data;

        if (data.success) {
          this.toast = {
            showing: true,
            message: "Código de validación reenviado exitosamente!",
            state: "success",
          };
        } else {
          this.toast = {
            showing: true,
            message: data.message || "Error al reenviar el código.",
            state: "danger",
          };
        }

        setTimeout(() => (this.showSuccessMessage = false), 3000);
      } catch (error) {
        console.error("Error al reenviar código:", error);
      } finally {
        this.isResending = false;
      }
    },
  },
  async mounted() {
    await this.globalStore.getUserData("email");
  },
};
</script>

<style scoped>
.banner-card {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: white;
  color: grey;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 1.125rem;
}

.banner-content h3 {
  margin: 0 0 0.5rem 0;
}

.banner-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.resend-btn,
.dismiss-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: none;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #10b981;
  color: black;
}
</style>
