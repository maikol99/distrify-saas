<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container" :class="{ 'animate-in': showAnimation }">
      <!-- Header del modal -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-info-circle"></i>
          </div>
          <div class="header-text">
            <h2>Ayuda e Información</h2>
            <p>Todo lo que necesitas saber sobre Alevia Pay</p>
          </div>
        </div>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Contenido del modal con pestañas -->
      <div class="modal-body">
        <!-- Navegación de pestañas -->
        <div class="tabs-navigation">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </button>
        </div>

        <!-- Contenido de las pestañas -->
        <div class="tab-content">
          <!-- Pestaña de Inicio Rápido -->
          <div v-if="activeTab === 'quick-start'" class="tab-panel">
            <div class="quick-start-content">
              <div class="welcome-message">
                <h3><i class="fas fa-rocket"></i> ¡Comienza con Alevia Pay!</h3>
                <p>
                  Sigue estos pasos para configurar tu sistema y comenzar a
                  gestionar tu negocio.
                </p>
              </div>

              <div class="steps-container">
                <div
                  v-for="(step, index) in quickStartSteps"
                  :key="index"
                  class="step-card"
                >
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <h4>{{ step.title }}</h4>
                    <p>{{ step.description }}</p>
                    <div v-if="step.actions" class="step-actions">
                      <button
                        v-for="action in step.actions"
                        :key="action.text"
                        class="action-button"
                        @click="handleAction(action.route)"
                      >
                        <i :class="action.icon"></i>
                        {{ action.text }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pestaña de Funcionalidades -->
          <div v-if="activeTab === 'features'" class="tab-panel">
            <div class="features-grid">
              <div
                v-for="feature in features"
                :key="feature.id"
                class="feature-card"
              >
                <div class="feature-icon">
                  <i :class="feature.icon"></i>
                </div>
                <div class="feature-content">
                  <h4>{{ feature.title }}</h4>
                  <p>{{ feature.description }}</p>
                  <ul class="feature-list">
                    <li v-for="item in feature.items" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Pestaña de Soporte -->
          <div v-if="activeTab === 'support'" class="tab-panel">
            <div class="support-content">
              <!-- Información de contacto -->
              <div class="contact-section">
                <h3><i class="fas fa-headset"></i> Contacto y Soporte</h3>
                <div class="contact-cards">
                  <div class="contact-card">
                    <div class="contact-icon phone">
                      <i class="fas fa-phone"></i>
                    </div>
                    <div class="contact-info">
                      <h4>Teléfono</h4>
                      <p>+54 9 3534 29-6008</p>
                      <span>Lunes a Viernes, 9:00 - 18:00</span>
                    </div>
                  </div>

                  <div class="contact-card">
                    <div class="contact-icon whatsapp">
                      <i class="fab fa-whatsapp"></i>
                    </div>
                    <div class="contact-info">
                      <h4>WhatsApp</h4>
                      <p>+54 9 3534 29-6008</p>

                      <span>Lunes a Viernes, 9:00 - 18:00</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preguntas frecuentes -->
              <div class="faq-section">
                <h3>
                  <i class="fas fa-question-circle"></i> Preguntas Frecuentes
                </h3>
                <div class="faq-list">
                  <div
                    v-for="(faq, index) in faqs"
                    :key="index"
                    class="faq-item"
                  >
                    <button
                      class="faq-question"
                      @click="toggleFaq(index)"
                      :class="{ active: activeFaq === index }"
                    >
                      <span>{{ faq.question }}</span>
                      <i class="fas fa-chevron-down"></i>
                    </button>
                    <div
                      class="faq-answer"
                      :class="{ show: activeFaq === index }"
                    >
                      <p>{{ faq.answer }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pestaña Acerca de -->
          <div v-if="activeTab === 'about'" class="tab-panel">
            <div class="about-content">
              <div class="about-header">
                <div class="logo-section">
                  <div class="logo-icon">
                    <i class="fas fa-store"></i>
                  </div>
                  <div class="logo-text">
                    <h3>Alevia Pay</h3>
                    <span>Versión 1.0.0 Beta</span>
                  </div>
                </div>
              </div>

              <div class="about-sections">
                <div class="about-section">
                  <h4><i class="fas fa-bullseye"></i> Nuestra Misión</h4>
                  <p>
                    Simplificar la gestión de pequeños y medianos comercios
                    mediante una plataforma intuitiva y completa que permita a
                    los emprendedores enfocarse en hacer crecer su negocio.
                  </p>
                </div>

                <div class="about-section">
                  <h4><i class="fas fa-heart"></i> ¿Por qué Alevia Pay?</h4>
                  <ul class="benefits-list">
                    <li>Interfaz intuitiva y fácil de usar</li>
                    <li>Gestión completa de inventario</li>
                    <li>Reportes detallados y análisis</li>
                    <li>Soporte técnico personalizado</li>
                    <li>Actualizaciones constantes</li>
                  </ul>
                </div>

                <div class="about-section">
                  <h4>
                    <i class="fas fa-code-branch"></i> Estado del Desarrollo
                  </h4>
                  <div class="development-status">
                    <div class="status-item">
                      <div class="status-icon beta">
                        <i class="fas fa-flask"></i>
                      </div>
                      <div class="status-text">
                        <strong>Versión Beta</strong>
                        <p>
                          Actualmente en desarrollo activo con nuevas
                          funcionalidades
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="about-section">
                  <h4>
                    <i class="fas fa-shield-alt"></i> Política de Privacidad
                  </h4>
                  <p>
                    Tus datos están seguros con nosotros. No compartimos
                    información personal con terceros y utilizamos encriptación
                    para proteger toda la información sensible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del modal -->
      <div class="modal-footer">
        <div class="footer-info">
          <span>¿Necesitas más ayuda? Contáctanos al +54 2657-201291 o al +54 351-7706985</span>
        </div>
        <button class="footer-button" @click="$emit('close')">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelpInfoModal",
  data() {
    return {
      showAnimation: false,
      activeTab: "quick-start",
      activeFaq: null,
      tabs: [
        { id: "quick-start", name: "Inicio Rápido", icon: "fas fa-rocket" },
        { id: "features", name: "Funcionalidades", icon: "fas fa-star" },
        { id: "support", name: "Soporte", icon: "fas fa-headset" },
        { id: "about", name: "Acerca de", icon: "fas fa-info-circle" },
      ],
      quickStartSteps: [
        {
          title: "Completa tu perfil",
          description:
            "Configura la información básica de tu negocio y personaliza tu experiencia.",
          actions: [
            { text: "Ir a Perfil", icon: "fas fa-user", route: "/perfil" },
          ],
        },
        {
          title: "Configura tu inventario",
          description:
            "Agrega tus productos, categorías y proveedores para comenzar a gestionar tu stock.",
          actions: [
            {
              text: "Gestionar Inventario",
              icon: "fas fa-boxes",
              route: "/inventario",
            },
            {
              text: "Agregar Categorías",
              icon: "fas fa-tags",
              route: "/categorias",
            },
          ],
        },
        {
          title: "Registra tus primeras ventas",
          description:
            "Comienza a registrar transacciones y ve cómo funciona el sistema de ventas.",
          actions: [
            {
              text: "Nueva Venta",
              icon: "fas fa-cash-register",
              route: "/ventas",
            },
          ],
        },
        {
          title: "Revisa tus reportes",
          description:
            "Analiza el rendimiento de tu negocio con nuestros reportes detallados.",
          actions: [
            {
              text: "Ver Reportes",
              icon: "fas fa-chart-line",
              route: "/reportes",
            },
          ],
        },
      ],
      features: [
        {
          id: "inventory",
          title: "Gestión de Inventario",
          description: "Control completo de tu stock",
          icon: "fas fa-boxes",
          items: [
            "Seguimiento de stock en tiempo real",
            "Alertas de stock bajo",
            "Gestión de categorías",
            "Control de proveedores",
          ],
        },
        {
          id: "sales",
          title: "Sistema de Ventas",
          description: "Procesa ventas de forma eficiente",
          icon: "fas fa-cash-register",
          items: [
            "Registro rápido de ventas",
            "Gestión de clientes",
            "Historial de transacciones",
            "Múltiples métodos de pago",
          ],
        },
        {
          id: "reports",
          title: "Reportes y Análisis",
          description: "Insights valiosos para tu negocio",
          icon: "fas fa-chart-line",
          items: [
            "Reportes de ventas detallados",
            "Análisis de productos más vendidos",
            "Gráficos de rendimiento",
            "Exportación de datos",
          ],
        },
        {
          id: "management",
          title: "Gestión Administrativa",
          description: "Herramientas para administrar tu negocio",
          icon: "fas fa-cog",
          items: [
            "Control de gastos y egresos",
            "Gestión de caja",
            "Administración de usuarios",
            "Configuración personalizable",
          ],
        },
      ],
      faqs: [
        {
          question: "¿Cómo puedo agregar productos a mi inventario?",
          answer:
            'Ve a la sección "Inventario" desde el menú lateral, haz clic en "Agregar Producto" y completa la información requerida como nombre, precio, stock y categoría.',
        },
        {
          question: "¿Puedo registrar ventas sin conexión a internet?",
          answer:
            "Actualmente Alevia Pay requiere conexión a internet para funcionar correctamente. Estamos trabajando en una funcionalidad offline para futuras versiones.",
        },
        {
          question: "¿Cómo genero reportes de mis ventas?",
          answer:
            'Dirígete a la sección "Reportes" donde podrás generar informes detallados por fechas, productos o categorías. Los reportes se pueden exportar en formato PDF o Excel.',
        },
        {
          question:
            "¿Hay límite en la cantidad de productos que puedo registrar?",
          answer:
            "No hay límite en la cantidad de productos que puedes registrar en tu inventario. El sistema está diseñado para crecer con tu negocio.",
        },
        {
          question: "¿Cómo puedo contactar soporte técnico?",
          answer:
            "Puedes contactarnos por teléfono o WhatsApp al +54 9 3534 29-6008, de lunes a viernes de 9:00 a 18:00.",
        },
        {
          question: "¿Mis datos están seguros en la plataforma?",
          answer:
            "Sí, utilizamos encriptación de datos y medidas de seguridad estándar de la industria para proteger toda tu información comercial y personal.",
        },
      ],
    };
  },
  methods: {
    toggleFaq(index) {
      this.activeFaq = this.activeFaq === index ? null : index;
    },
    handleAction(route) {
      this.$emit("close");
      this.$router.push(route);
    },
  },
  mounted() {
    // Activar animación después de montar
    setTimeout(() => {
      this.showAnimation = true;
    }, 50);
  },
};
</script>

<style scoped>
/* Estilos generales del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
  padding: 20px;
}

.modal-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-container.animate-in {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Header del modal */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9931e 0%, #ff8c42 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 20px;
}

.header-text h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
}

.header-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Contenido del modal */
.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Navegación de pestañas */
.tabs-navigation {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  flex: 1;
  justify-content: center;
}

.tab-button:hover {
  color: #f9931e;
  background-color: rgba(249, 147, 30, 0.05);
}

.tab-button.active {
  color: #f9931e;
  background-color: white;
  border-bottom-color: #f9931e;
  font-weight: 600;
}

.tab-button i {
  font-size: 16px;
}

/* Contenido de pestañas */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.tab-panel {
  padding: 32px;
  min-height: 400px;
}

/* Pestaña de Inicio Rápido */
.quick-start-content {
  max-width: 100%;
}

.welcome-message {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border-left: 4px solid #f9931e;
}

.welcome-message h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.welcome-message h3 i {
  color: #f9931e;
  margin-right: 8px;
}

.welcome-message p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.step-card:hover {
  border-color: #f9931e;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.1);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f9931e 0%, #ff8c42 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.step-content p {
  margin: 0 0 16px 0;
  color: #6b7280;
  line-height: 1.6;
}

.step-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f9931e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #e8841a;
  transform: translateY(-1px);
}

/* Pestaña de Funcionalidades */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  padding: 24px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.feature-card:hover {
  border-color: #f9931e;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.1);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #f9931e 0%, #ff8c42 100%);
  color: white;
  border-radius: 12px;
  font-size: 24px;
  margin-bottom: 16px;
}

.feature-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.feature-content p {
  margin: 0 0 16px 0;
  color: #6b7280;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  color: #4b5563;
  font-size: 14px;
}

.feature-list li::before {
  content: "✓";
  color: #10b981;
  font-weight: bold;
  font-size: 16px;
}

/* Pestaña de Soporte */
.support-content {
  max-width: 100%;
}

.contact-section {
  margin-bottom: 40px;
}

.contact-section h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.contact-section h3 i {
  color: #f9931e;
  margin-right: 8px;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.contact-card:hover {
  border-color: #f9931e;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.1);
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 20px;
  color: white;
}

.contact-icon.phone {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.contact-icon.email {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.contact-icon.whatsapp {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
}

.contact-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.contact-info p {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #f9931e;
}

.contact-info span {
  font-size: 12px;
  color: #6b7280;
}

/* FAQ Section */
.faq-section h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.faq-section h3 i {
  color: #f9931e;
  margin-right: 8px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.2s ease;
}

.faq-question:hover {
  background-color: #f9fafb;
}

.faq-question.active {
  background-color: #fef3e2;
  color: #f9931e;
}

.faq-question i {
  transition: transform 0.2s ease;
}

.faq-question.active i {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: #f9fafb;
}

.faq-answer.show {
  max-height: 200px;
}

.faq-answer p {
  padding: 16px 20px;
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 14px;
}

/* Pestaña Acerca de */
.about-content {
  max-width: 100%;
}

.about-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #f9931e 0%, #ff8c42 100%);
  color: white;
  border-radius: 16px;
  font-size: 28px;
}

.logo-text h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.logo-text span {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.about-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.about-section {
  padding: 24px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.about-section h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.about-section h4 i {
  color: #f9931e;
  margin-right: 8px;
}

.about-section p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
}

.benefits-list li::before {
  content: "✓";
  color: #10b981;
  font-weight: bold;
  font-size: 16px;
}

.development-status {
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 16px;
  color: white;
}

.status-icon.beta {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.status-text strong {
  display: block;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 4px;
}

.status-text p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
}

/* Footer del modal */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-radius: 0 0 16px 16px;
}

.footer-info span {
  font-size: 14px;
  color: #6b7280;
}

.footer-button {
  padding: 10px 24px;
  background-color: #f9931e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.footer-button:hover {
  background-color: #e8841a;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px 24px;
  }

  .header-content {
    gap: 12px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .header-text h2 {
    font-size: 20px;
  }

  .header-text p {
    font-size: 13px;
  }

  .tab-panel {
    padding: 20px;
  }

  .tabs-navigation {
    overflow-x: auto;
  }

  .tab-button {
    padding: 12px 16px;
    font-size: 13px;
    min-width: max-content;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .contact-cards {
    grid-template-columns: 1fr;
  }

  .step-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .step-actions {
    justify-content: center;
  }

  .logo-section {
    flex-direction: column;
    gap: 12px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 16px 24px;
  }

  .development-status {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 16px 20px;
  }

  .tab-panel {
    padding: 16px;
  }

  .welcome-message {
    padding: 20px;
    margin-bottom: 24px;
  }

  .welcome-message h3 {
    font-size: 18px;
  }

  .steps-container {
    gap: 16px;
  }

  .step-card {
    padding: 20px;
  }

  .feature-card,
  .about-section {
    padding: 20px;
  }

  .contact-card {
    padding: 16px;
  }

  .footer-info span {
    font-size: 13px;
  }
}

/* Animaciones suaves */
@media (prefers-reduced-motion: no-preference) {
  .tab-button,
  .action-button,
  .footer-button,
  .close-button,
  .faq-question {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .feature-card,
  .contact-card,
  .step-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>
