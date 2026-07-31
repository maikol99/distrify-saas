<template>
  <div class="page-container">
    <div class="card">
      <!-- Icono -->
      <div class="icon-wrap">
        <span class="material-symbols-outlined icon">mark_email_unread</span>
      </div>

      <h1 class="title">Verificá tu correo electrónico</h1>
      <p class="subtitle">
        Para usar Alevia Pay necesitás confirmar tu dirección de email.
        Buscá el correo que te enviamos a <strong>{{ email }}</strong> y hacé clic en el botón de verificación.
      </p>

      <div class="hint-box">
        <span class="material-symbols-outlined hint-icon">info</span>
        <p>¿No lo encontrás? Revisá la carpeta de <strong>spam</strong> o <strong>correo no deseado</strong>.</p>
      </div>

      <!-- Botón reenviar -->
      <button
        class="resend-btn"
        @click="resend"
        :disabled="cooldown > 0 || sending"
      >
        <span class="material-symbols-outlined btn-icon">send</span>
        <span v-if="sending">Enviando...</span>
        <span v-else-if="cooldown > 0">Reenviar en {{ cooldown }}s</span>
        <span v-else>Reenviar email de verificación</span>
      </button>

      <p v-if="sent" class="sent-msg">
        <span class="material-symbols-outlined">check_circle</span>
        Email reenviado correctamente
      </p>

      <p v-if="resendError" class="error-msg">
        <span class="material-symbols-outlined">error</span>
        {{ resendError }}
      </p>

      <!-- Separador -->
      <div class="divider"></div>

      <p class="back-hint">
        ¿Ya verificaste tu cuenta?
        <a href="/iniciar-sesion" class="link">Iniciá sesión</a>
      </p>
      <p class="back-hint">
        ¿Querés usar otro email?
        <a href="#" @click.prevent="logout" class="link">Cerrar sesión</a>
      </p>
    </div>
  </div>
</template>

<script>
import api from "@/config/axios.config";
import Cookies from "js-cookie";

export default {
  name: "EmailPendiente",

  data() {
    return {
      email: "",
      sending: false,
      sent: false,
      resendError: "",
      cooldown: 0,
      timer: null,
    };
  },

  methods: {
    async resend() {
      if (this.cooldown > 0 || this.sending || !this.email) return;
      this.sending = true;
      this.sent = false;
      this.resendError = "";
      try {
        await api.post(`/auth/post/resend-verification-token?email=${encodeURIComponent(this.email)}`);
        this.sent = true;
        this.startCooldown(60);
      } catch (e) {
        const msg = e.response?.data?.message;
        this.resendError = msg || "No se pudo reenviar el email. Intentá de nuevo.";
      } finally {
        this.sending = false;
      }
    },

    startCooldown(seconds) {
      this.cooldown = seconds;
      this.timer = setInterval(() => {
        this.cooldown--;
        if (this.cooldown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 1000);
    },

    logout() {
      Cookies.remove("user_info");
      localStorage.removeItem("token_expiration");
      this.$router.push("/iniciar-sesion");
    },
  },

  mounted() {
    // Intentar leer el email del cookie de user_info
    try {
      const raw = Cookies.get("user_info");
      if (raw) {
        const info = JSON.parse(raw);
        this.email = info.email || "";
      }
    } catch (_) {}
  },

  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: "Inter", "Segoe UI", sans-serif;
}

.card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.icon-wrap {
  width: 72px;
  height: 72px;
  background: #fff7ed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: .25rem;
}

.icon {
  font-size: 36px;
  color: #f9931e;
}

.title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  font-size: .9rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.hint-box {
  display: flex;
  align-items: flex-start;
  gap: .5rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: .75rem;
  padding: .75rem 1rem;
  text-align: left;
  width: 100%;
}

.hint-icon {
  font-size: 18px;
  color: #0369a1;
  flex-shrink: 0;
  margin-top: 1px;
}

.hint-box p {
  font-size: .82rem;
  color: #0369a1;
  margin: 0;
  line-height: 1.5;
}

.resend-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  padding: .875rem 1.25rem;
  background: linear-gradient(135deg, #f9931e, #e8821a);
  color: white;
  border: none;
  border-radius: .75rem;
  font-size: .9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 4px 12px rgba(249, 147, 30, 0.35);
}

.resend-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249, 147, 30, 0.4);
}

.resend-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-icon {
  font-size: 18px;
}

.sent-msg {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .82rem;
  font-weight: 600;
  color: #059669;
  margin: 0;
}

.sent-msg .material-symbols-outlined {
  font-size: 18px;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .82rem;
  font-weight: 600;
  color: #dc2626;
  margin: 0;
}

.error-msg .material-symbols-outlined {
  font-size: 18px;
}

.divider {
  width: 100%;
  border-top: 1px solid #f3f4f6;
  margin: .25rem 0;
}

.back-hint {
  font-size: .82rem;
  color: #9ca3af;
  margin: 0;
}

.link {
  color: #f9931e;
  font-weight: 700;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .card {
    padding: 2rem 1.25rem;
    border-radius: 1.25rem;
  }
  .title { font-size: 1.2rem; }
}
</style>
