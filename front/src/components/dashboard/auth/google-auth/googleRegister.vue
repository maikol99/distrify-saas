<template>
  <div class="google-register-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">Procesando registro con Google...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="retry-button">Intentar de nuevo</button>
    </div>

    <!-- Success State -->
    <div v-if="success" class="success-container">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="success-title">¡Registro exitoso!</h3>
      <p class="success-message">Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión con tu cuenta de Google.</p>
      <button @click="goToLogin" class="login-button">Ir a Iniciar Sesión</button>
    </div>

    <!-- Main Content -->
    <div v-if="!loading && !error && !success" class="signin-content">
      <div class="header">
        <h2 class="title">Regístrate con Google</h2>
        <p class="subtitle">Accede rápidamente con tu cuenta de Google</p>
      </div>

      <div class="button-container">
        <div id="google-signin-button" class="google-button-wrapper"></div>

        <div class="divider">
          <span>o</span>
        </div>

        <p class="terms-text">
          Al registrarte, aceptas nuestros 
          <a href="#" class="link">Términos de Servicio</a> y 
          <a href="#" class="link">Política de Privacidad</a>
        </p>
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

    goToLogin() {
      this.$router.push("/iniciar-sesion");
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
          theme: "outline",
          size: "large",
          width: 280,
          text: "signup_with",
          shape: "rectangular",
          logo_alignment: "left"
        });
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
      if (!response?.credential) {
        this.error = "No se pudo obtener las credenciales de Google";
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const credential = response.credential;

        // ✅ Usamos `api` en lugar de fetch
        const { data: tokenData } = await api.post("/auth/post/verify-google-user", {
          token: credential,
        });

        if (!tokenData.success) throw new Error(tokenData.message || "Error en la validación del token");

        const { data: userData } = await api.post("/auth/post/create-google-user", {
          email: tokenData.email,
          username: tokenData.name,
          id: tokenData.id,
        });

        if (!userData.success) throw new Error(userData.message || "Error al crear el usuario");

        this.success = true;

      } catch (error) {
        console.error("Error completo:", error);
        this.error = error?.message || "Error desconocido en el proceso de registro";
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
.google-register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  min-height: 400px;
}

/* Header Styles */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Main Content */
.signin-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  border: 1px solid #f3f4f6;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* Google Button Wrapper */
.google-button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0.5rem 0;
}

/* Custom styling for Google button (if needed) */
.google-button-wrapper :deep(.g-id-signin) {
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease !important;
}

.google-button-wrapper :deep(.g-id-signin:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-1px) !important;
}

/* Divider */
.divider {
  position: relative;
  width: 100%;
  text-align: center;
  margin: 0.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
  z-index: 1;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
  position: relative;
  z-index: 2;
}

/* Terms Text */
.terms-text {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1rem;
  color: #4b5563;
  margin: 0;
  font-weight: 500;
}

/* Error Container */
.error-container {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
  margin: 0 auto 1rem;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-message {
  color: #dc2626;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  font-weight: 500;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.retry-button:active {
  transform: translateY(0);
}

/* Success Container */
.success-container {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.success-icon {
  width: 56px;
  height: 56px;
  color: #22c55e;
  margin: 0 auto 1.5rem;
}

.success-icon svg {
  width: 100%;
  height: 100%;
}

.success-title {
  color: #15803d;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.success-message {
  color: #166534;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.5;
  font-weight: 400;
}

.login-button {
  background: #22c55e;
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 180px;
}

.login-button:hover {
  background: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
}

.login-button:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .google-register-container {
    padding: 1rem;
  }
  
  .signin-content,
  .success-container {
    padding: 1.5rem;
  }
  
  .title,
  .success-title {
    font-size: 1.5rem;
  }
  
  .subtitle,
  .success-message {
    font-size: 0.875rem;
  }
  
  .google-button-wrapper :deep(.g-id-signin) {
    width: 100% !important;
  }

  .login-button {
    min-width: 100%;
    padding: 1rem 1.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .signin-content {
    background: #1f2937;
    border-color: #374151;
  }

  .success-container {
    background: #064e3b;
    border-color: #065f46;
  }
  
  .title {
    color: #f9fafb;
  }
  
  .subtitle {
    color: #d1d5db;
  }

  .success-title {
    color: #34d399;
  }

  .success-message {
    color: #a7f3d0;
  }
  
  .divider::before {
    background: #4b5563;
  }
  
  .divider span {
    background: #1f2937;
    color: #9ca3af;
  }
  
  .terms-text {
    color: #d1d5db;
  }
}
</style>