<template>
  <div class="dashboard-container">
    <!-- Modal de primera vez -->
    <div v-if="showingFirstTimeModal" class="initial-dialog-overlay">
      <div class="initial-dialog">
        <h2>¡Bienvenido a Alevia Pay!</h2>
        <p>
          Para continuar usando todas las funcionalidades, necesitamos que
          completes algunos datos adicionales en tu perfil.
        </p>
        <button
          class="btn btn-primary"
          @click="navigateTo('/completar-perfil')"
        >
          Continuar
        </button>
      </div>
    </div>

    <!-- Sidebar component -->
    <navbarComponent></navbarComponent>

    <!-- Contenido principal -->
    <div
      class="main-content"
      :class="{
        'sidebar-expanded': !globalStore.isSidebarCollapsed && !isMobile,
        'sidebar-collapsed': globalStore.isSidebarCollapsed && !isMobile,
      }"
    >
      <div class="content-wrapper">
        <!-- Header del contenido (opcional) -->
        <div class="content-header">
          <h1 class="page-title">{{ getPageTitle() }}</h1>
        </div>

        <!-- Router view para las rutas hijas con transición -->
        <div class="router-content">
          <!-- Spinner de navegación -->
          <div v-if="navigationLoading" class="navigation-spinner-overlay">
            <div class="navigation-spinner">
              <div class="spinner-circle"></div>
              <p class="spinner-text">Cargando...</p>
            </div>
          </div>

          <!-- Contenido con transición -->
          <transition name="fade" mode="out-in">
            <RouterView v-if="!navigationLoading" />
          </transition>
        </div>

        <FooterCreditComponent />
      </div>
    </div>

    <!-- Icono flotante de consulta/información -->
    <!-- <div class="help-button-container">
      <button
        class="help-button"
        @click="toggleHelpModal"
        :class="{ pulsing: !hasSeenHelp }"
        title="Ayuda e Información"
      >
        <i class="fas fa-question-circle"></i>
      </button>
    </div> -->

    <!-- Modal de ayuda e información -->
    <infoModal v-if="showHelpModal" @close="closeHelpModal"></infoModal>

    <!-- AI Command Interface -->
    <!-- <AICommandInterface /> -->
  </div>

  <!-- Spinner global -->
  <spinnerComponent v-if="loading"></spinnerComponent>
</template>

<script>
import navbarComponent from "@/components/dashboard/navbar/navbarComponent.vue";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import infoModal from "@/components/visuals/dashboard/infoModal.vue";
import AICommandInterface from "@/components/dashboard/AICommandInterface.vue";
import FooterCreditComponent from "@/components/visuals/FooterCreditComponent.vue";

import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "DashboardLayout",
  components: {
    navbarComponent,
    spinnerComponent,
    infoModal,
    AICommandInterface,
    FooterCreditComponent,
  },
  setup() {
    const globalStore = useGlobalStore();
    return { globalStore };
  },
  data() {
    return {
      showingFirstTimeModal: false,
      showingLogoutModal: false,
      loading: false,
      navigationLoading: false,
      showHelpModal: false,
      hasSeenHelp: false,
      isMobile: window.innerWidth <= 768,
    };
  },
  methods: {
    navigateTo(route) {
      if (route === "Cerrar sesión") {
        this.showingLogoutModal = true;
        return;
      }

      // Activar spinner de navegación
      this.navigationLoading = true;

      // Navigate to the route using router
      this.$router.push(route).finally(() => {
        // Pequeño delay para mejor UX
        setTimeout(() => {
          this.navigationLoading = false;
        }, 300);
      });
    },
    getPageTitle() {
      const routeTitles = {
        "/inicio": "Inicio",
        "/ventas": "Ventas",
        "/compras": "Compras",
        "/proveedores": "Proveedores",
        "/categorias": "Categorías",
        "/inventario": "Inventario",
        "/clientes": "Clientes",
        "/egresos": " Egresos",
        "/reportes": "Reportes",
        "/historial/ventas": "Historial de Ventas",
        "/caja": "Caja",
        "/tienda": "Tienda",
        "/perfil": "Perfil",
        "/completar-perfil": "Completar Perfil",
        "/reportes/ventas": "Reportes de Ventas",
        "/ingresos": "Ingresos",
        "/configuracion": "Configuración",
        "/notificaciones": "Notificaciones",
        "/asistente": "Asistente IA",
      };

      return routeTitles[this.$route.path] || "Dashboard";
    },
    toggleHelpModal() {
      this.showHelpModal = !this.showHelpModal;
      if (!this.hasSeenHelp) {
        this.hasSeenHelp = true;
        // Guardar en localStorage que ya vio la ayuda
        localStorage.setItem("distrify_has_seen_help", "true");
      }
    },
    closeHelpModal() {
      this.showHelpModal = false;
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    },
  },
  watch: {
    // Observar cambios de ruta
    $route(to, from) {
      if (to.path !== from.path) {
        this.navigationLoading = true;

        // Simular tiempo de carga o esperar a que el componente esté listo
        this.$nextTick(() => {
          setTimeout(() => {
            this.navigationLoading = false;
          }, 400);
        });
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    // Verificar si ya vio la ayuda anteriormente
    const hasSeenHelp = localStorage.getItem("distrify_has_seen_help");
    this.hasSeenHelp = hasSeenHelp === "true";
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  overflow-x: hidden;
  max-width: 100vw;
}

.main-content {
  flex: 1;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  min-width: 0;
}

.main-content.sidebar-expanded {
  margin-left: 288px;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.content-wrapper {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-header {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 8px 15px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  font-family: "Poppins", sans-serif;
  margin: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6c757d;
}

.breadcrumb-item {
  color: #6c757d;
}

.breadcrumb-item.current {
  color: #2c3e50;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #dee2e6;
}

.router-content {
  flex: 1;
  padding: 0px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 120px);
  position: relative; /* Para el spinner overlay */
}

/* Spinner de navegación */
.navigation-spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(248, 249, 250, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  backdrop-filter: blur(2px);
}

.navigation-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.spinner-circle {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-text {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  font-family: "Poppins", sans-serif;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Transiciones suaves entre rutas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.initial-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Mayor que el sidebar */
}

.initial-dialog {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  text-align: center;
  font-family: "Poppins", sans-serif;
}

.initial-dialog h2 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 24px;
  font-weight: 600;
}

.initial-dialog p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 25px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

/* Botón flotante de ayuda */
.help-button-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.help-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f9931e 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(249, 147, 30, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  overflow: hidden;
}

.help-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.help-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(249, 147, 30, 0.5);
}

.help-button:hover::before {
  transform: translateX(100%);
}

.help-button:active {
  transform: translateY(-1px) scale(1.02);
}

/* Animación de pulsación para nuevos usuarios */
.help-button.pulsing {
  animation: pulse-help 2s infinite;
}

.help-button.pulsing::after {
  content: "";
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(249, 147, 30, 0.6);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-help {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0; /* Sin margen en móvil */
    padding-top: 64px;
  }

  .main-content,
  .content-wrapper,
  .router-content {
    height: 100%;
  }

  .content-header {
    top: 64px;
  }

  .page-title {
    font-size: 24px;
  }

  .initial-dialog {
    padding: 30px 20px;
    margin: 20px;
  }

  .initial-dialog h2 {
    font-size: 20px;
  }

  .spinner-circle {
    width: 35px;
    height: 35px;
    border-width: 2px;
  }

  .spinner-text {
    font-size: 13px;
  }

  /* Ajustar botón de ayuda en móvil */
  .help-button-container {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }

  .breadcrumb {
    font-size: 12px;
  }

  .spinner-circle {
    width: 30px;
    height: 30px;
  }

  /* Botón de ayuda más pequeño en pantallas muy pequeñas */
  .help-button-container {
    bottom: 15px;
    left: 15px;
  }

  .help-button {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}

/* Animaciones suaves */
@media (prefers-reduced-motion: no-preference) {
  .main-content {
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .content-header {
    transition: all 0.3s ease;
  }
}

/* Estilos para cuando el sidebar está colapsado (futuro) */
.dashboard-container.sidebar-collapsed .main-content {
  margin-left: 80px;
}

@media (max-width: 768px) {
  .dashboard-container.sidebar-collapsed .main-content {
    margin-left: 0;
  }
}

/* Asegurar que el botón de ayuda esté siempre visible */
.help-button-container {
  pointer-events: auto;
}

/* Prevenir que otros elementos interfieran con el botón */
.help-button {
  position: relative;
  z-index: 1001;
}
</style>
