<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
        <div class="welcome-section">
          <h1>Bienvenido a Distrify! 🎉</h1>
          <p class="welcome-subtitle">
            Comencemos a optimizar los procesos de tu negocio para que puedas
            <strong>recuperar tiempo y enfocarte en el crecimiento</strong>.
          </p>
        </div>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Quick Start Section -->
        <div class="section">
          <p class="section-intro">
            Para utilizar mejor tu
            <strong>plataforma de gestión empresarial</strong>, aquí tienes
            algunos recursos útiles para comenzar:
          </p>

          <h3 class="section-title">Aprende a usar</h3>
          <div class="cards-grid">
            <div class="resource-card">
              <div class="card-icon blue">
                <i class="fas fa-chart-pie"></i>
              </div>
              <div class="card-content">
                <h4>Visión General del Dashboard</h4>
                <span class="card-duration">⏱ 4 min</span>
              </div>
            </div>
            <div class="resource-card">
              <div class="card-icon purple">
                <i class="fas fa-box"></i>
              </div>
              <div class="card-content">
                <h4>Inventario</h4>
                <span class="card-duration">⏱ 6 min</span>
              </div>
            </div>
            <div class="resource-card">
              <div class="card-icon orange">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <div class="card-content">
                <h4>Gestión de Ventas</h4>
                <span class="card-duration">⏱ 5 min</span>
              </div>
            </div>
            <div class="resource-card">
              <div class="card-icon teal">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="card-content">
                <h4>Reportes</h4>
                <span class="card-duration">⏱ 3 min</span>
              </div>
            </div>

            <div class="resource-card">
              <div class="card-icon teal">
                <i class="fas fa-shop"></i>
              </div>
              <div class="card-content">
                <h4>Tienda</h4>
                <span class="card-duration">⏱ 5 min</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Get Help Section -->
        <div class="section">
          <h3 class="section-title">Obtener ayuda</h3>
          <div class="cards-grid">
            <!-- <div class="help-card">
              <div class="card-icon blue">
                <i class="fas fa-book"></i>
              </div>
              <div class="card-content">
                <div class="card-label">APRENDER EN DETALLE</div>
                <h4>Documentación</h4>
              </div>
            </div> -->
            <div class="help-card">
              <div class="card-icon orange">
                <i class="fas fa-rocket"></i>
              </div>
              <div class="card-content">
                <div class="card-label">APRENDER EN DETALLE</div>
                <h4>Onboarding</h4>
              </div>
            </div>
            <div class="help-card">
              <div class="card-icon purple">
                <i class="fas fa-users"></i>
              </div>
              <div class="card-content">
                <div class="card-label">APRENDER EN DETALLE</div>
                <h4>Contacta con Soporte</h4>
              </div>
            </div>
            <div class="help-card">
              <div class="card-icon teal">
                <i class="fas fa-play-circle"></i>
              </div>
              <div class="card-content">
                <div class="card-label">Domina Distrify</div>
                <h4>Tutoriales</h4>
              </div>
            </div>
          </div>
        </div>

        <!-- Ready to Go Section -->
        <div class="section ready-section">
          <div class="ready-content">
            <div>
              <h3>
                ¿Listo para empezar? Comienza a gestionar en segundos con herramientas comerciales
              </h3>
              <p class="ready-subtitle">
                Configura la información de tu negocio para desbloquear todo su potencial
              </p>
            </div>
            <button class="btn-configure" @click="configureNow">
              Iniciar configuración
            </button>
          </div>

          <div class="workflow-cards">
            <div class="workflow-card">
              <div class="workflow-icons">
                <i class="fas fa-store primary-icon"></i>
                <i class="fas fa-chart-bar secondary-icon"></i>
              </div>
              <h4>Configura el perfil de tu negocio y comienza a seguir tus ventas</h4>
            </div>
            <div class="workflow-card">
              <div class="workflow-icons">
                <i class="fas fa-box primary-icon"></i>
                <i class="fas fa-tag secondary-icon"></i>
              </div>
              <h4>Agrega productos a tu inventario y gestiona precios</h4>
            </div>
            <div class="workflow-card">
              <div class="workflow-icons">
                <i class="fas fa-users primary-icon"></i>
                <i class="fas fa-bell secondary-icon"></i>
              </div>
              <h4>Gestiona clientes y recibe notificaciones de eventos importantes</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="exploreSystem">
          Explorar primero
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WelcomeModal",
  methods: {
    exploreSystem() {
      this.$emit("close");
    },
    configureNow() {
      this.$router.push("configuracion");
    },
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

/* Header */
.modal-header {
  padding: 32px 40px 24px;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 16px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.welcome-subtitle strong {
  color: #f9931e;
  font-weight: 600;
}

/* Body */
.modal-body {
  padding: 24px 40px 32px;
}

.section {
  margin-bottom: 40px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-intro {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.section-intro strong {
  color: #111827;
  font-weight: 500;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

/* Resource Cards */
.resource-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-card:hover {
  border-color: #f9931e;
  box-shadow: 0 4px 12px rgba(249, 147, 30, 0.1);
  transform: translateY(-1px);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.card-icon.blue {
  background-color: #3b82f6;
}

.card-icon.purple {
  background-color: #8b5cf6;
}

.card-icon.orange {
  background-color: #f9931e;
}

.card-icon.teal {
  background-color: #14b8a6;
}

.card-content h4 {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
}

.card-duration {
  font-size: 12px;
  color: #6b7280;
}

/* Help Cards */
.help-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.help-card:hover {
  border-color: #f9931e;
  box-shadow: 0 4px 12px rgba(249, 147, 30, 0.1);
  transform: translateY(-1px);
}

.card-label {
  font-size: 10px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

/* Ready Section */
.ready-section {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.ready-content {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 24px;
}

.ready-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.ready-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.btn-configure {
  background-color: #f9931e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-configure:hover {
  background-color: #e88613;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 147, 30, 0.3);
}

.workflow-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.workflow-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  text-align: left;
}

.workflow-icons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.primary-icon {
  font-size: 20px;
  color: #f9931e;
}

.secondary-icon {
  font-size: 16px;
  color: #6b7280;
}

.workflow-card h4 {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  line-height: 1.4;
  margin: 0;
}

/* Footer */
.modal-footer {
  padding: 20px 40px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  color: #374151;
  border-color: #9ca3af;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    margin: 0.5rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 24px;
    padding-right: 24px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .ready-content {
    flex-direction: column;
    align-items: stretch;
  }

  .workflow-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .ready-section {
    padding: 16px;
  }
}

/* Scrollbar */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
