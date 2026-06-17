<template>
  <div class="trial-container">
    <div class="trial-card">
      <div class="card-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="trial-icon"
        >
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <h2 class="card-title">Período de prueba finalizado</h2>
      </div>

      <div class="card-content">
        <p class="card-text">
          Tu prueba gratuita de <span class="highlight-text">7 días</span> ha terminado.
          Esperamos que hayas podido conocer todo lo que Distrify tiene para ofrecerte.
        </p>
        <p class="card-text">
          Para continuar gestionando tu negocio — ventas, inventario, caja, reportes y mucho más —
          necesitás activar un plan premium.
        </p>

        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span class="feature-label">Ventas & Caja</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📦</span>
            <span class="feature-label">Inventario</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📈</span>
            <span class="feature-label">Reportes</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🛒</span>
            <span class="feature-label">Pedidos</span>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="upgrade-button" @click="handleUpgrade">
          Activar plan premium
        </button>
        <button class="login-button" @click="goToLogin">
          Volver al inicio de sesión
        </button>
      </div>

      <p class="contact-text">
        ¿Tenés dudas? Escribinos a
        <a href="mailto:info@cuyocode.com.ar" class="contact-link">info@cuyocode.com.ar</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrialExpired',
  methods: {
    handleUpgrade() {
      window.open('https://wa.link/3cb615', '_blank');
    },
    goToLogin() {
      this.$router.push('/iniciar-sesion');
    },
  },
};
</script>

<style scoped>
.trial-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.trial-card {
  width: 100%;
  max-width: 500px;
  text-align: center;
  padding: 40px 32px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
}

.trial-icon {
  color: #f59e0b;
  margin-bottom: 16px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #111111;
  margin: 0;
}

.card-content {
  margin-bottom: 28px;
}

.card-text {
  font-size: 15px;
  color: #555555;
  line-height: 1.7;
  margin-bottom: 14px;
}

.highlight-text {
  font-weight: 700;
  color: #f59e0b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f8f8;
  border: 1px solid #ebebeb;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #444;
  font-weight: 500;
}

.feature-icon {
  font-size: 18px;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.upgrade-button {
  width: 100%;
  max-width: 320px;
  padding: 14px 24px;
  background-color: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upgrade-button:hover {
  background-color: #d97706;
}

.login-button {
  width: 100%;
  max-width: 320px;
  padding: 12px 24px;
  background-color: transparent;
  color: #666666;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-button:hover {
  background-color: #f9f9f9;
  border-color: #d4d4d4;
  color: #333333;
}

.contact-text {
  font-size: 13px;
  color: #999999;
  margin: 0;
}

.contact-link {
  color: #f59e0b;
  text-decoration: none;
  font-weight: 500;
}

.contact-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .trial-card {
    padding: 28px 20px;
  }

  .card-title {
    font-size: 20px;
  }

  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
