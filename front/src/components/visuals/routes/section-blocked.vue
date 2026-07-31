<template>
  <div class="premium-section-container">
    <div class="premium-section-card">
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
          class="premium-icon"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h2 class="card-title">Sección Premium</h2>
      </div>
      <div class="card-content">
        <p class="card-text">
          Esta funcionalidad está disponible únicamente para usuarios con
          <span class="premium-text">Plan Premium</span>.
        </p>
        <p class="card-text">
          Para acceder a todas las características avanzadas y desbloquear
          el potencial completo de la plataforma, necesitas actualizar tu cuenta.
        </p>
        <p class="card-text">
          ¡Únete a <span class="highlight-text">Alevia Pay Premium</span> 
          y disfruta de todas las funcionalidades sin restricciones!
        </p>
      </div>
      <div class="card-actions">
        <button class="upgrade-button" @click="handleUpgrade">
          Actualizar a Premium
        </button>
        <button class="learn-more-button" @click="handleLearnMore">
          Volver
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PremiumSectionMessage',
  methods: {
    handleUpgrade() {
      window.open('https://wa.link/3cb615', '_blank');
    },
    handleLearnMore() {
     this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.premium-section-container {
  display: flex;
  min-height: calc(100vh - 60px);
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.premium-section-card {
  width: 100%;
  max-width: 480px;
  text-align: center;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
}

.premium-icon {
  height: 64px;
  width: 64px;
  color: #f59e0b; /* Amber color for premium feel */
  margin-bottom: 16px;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #111111;
  margin: 0;
}

.card-content {
  margin-bottom: 24px;
}

.card-text {
  font-size: 16px;
  color: #666666;
  line-height: 1.625;
  margin-bottom: 16px;
}

.card-text:last-child {
  margin-bottom: 0;
}

.highlight-text {
  font-weight: 700;
  color: #333333;
}

.premium-text {
  font-weight: 600;
  color: #f59e0b; /* Amber color matching the icon */
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.upgrade-button {
  width: 100%;
  max-width: 280px;
  padding: 12px 24px;
  background-color: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upgrade-button:hover {
  background-color: #d97706;
}

.learn-more-button {
  width: 100%;
  max-width: 280px;
  padding: 12px 24px;
  background-color: transparent;
  color: #666666;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.learn-more-button:hover {
  background-color: #f9f9f9;
  border-color: #d4d4d4;
  color: #333333;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .premium-section-container {
    padding: 16px;
  }

  .premium-section-card {
    padding: 20px;
  }

  .premium-icon {
    height: 56px;
    width: 56px;
  }

  .card-title {
    font-size: 22px;
  }

  .card-text {
    font-size: 15px;
  }

  .card-actions {
    gap: 10px;
  }

  .upgrade-button, .learn-more-button {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .premium-section-card {
    padding: 16px;
  }

  .premium-icon {
    height: 48px;
    width: 48px;
  }

  .card-title {
    font-size: 20px;
  }

  .card-text {
    font-size: 14px;
  }

  .upgrade-button {
    font-size: 14px;
    padding: 10px 20px;
  }

  .learn-more-button {
    font-size: 13px;
    padding: 10px 20px;
  }
}
</style>