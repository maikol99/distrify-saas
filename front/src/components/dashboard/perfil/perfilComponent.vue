<template>
  <div class="config-container">

    <!-- Sidebar de navegación -->
    <aside class="config-sidebar">
      <div class="sidebar-brand">
        <span class="material-symbols-outlined brand-icon">settings</span>
        <div>
          <h2 class="sidebar-title">Configuración</h2>
          <p class="sidebar-subtitle">Gestioná tu cuenta y tienda</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in generalItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeSection === item.key }"
          @click="setActiveSection(item.key)"
        >
          <div class="nav-item-left">
            <span class="nav-icon-wrap">
              <i :class="item.icon"></i>
            </span>
            <span class="nav-label">{{ item.label }}</span>
          </div>
          <div class="nav-item-right">
            <span v-if="globalStore.shopData && globalStore.shopData.plan === 'FREE' && item.plan !== 'FREE'" class="premium-badge">
              <i class="fas fa-crown"></i>
            </span>
            <span v-else-if="activeSection === item.key" class="active-arrow">
              <i class="fas fa-chevron-right"></i>
            </span>
          </div>
        </button>
      </nav>

      <!-- Plan info -->
      <div class="sidebar-plan-info" v-if="globalStore.shopData">
        <div class="plan-badge" :class="globalStore.shopData.plan === 'FREE' ? 'plan-free' : 'plan-premium'">
          <i class="fas fa-layer-group"></i>
          Plan {{ globalStore.shopData.plan || 'FREE' }}
        </div>
        <p v-if="globalStore.shopData.plan === 'FREE'" class="plan-upgrade-hint">
          Actualizá para desbloquear todas las funciones
        </p>
      </div>
    </aside>

    <!-- Contenido principal -->
    <main class="config-main">
      <div class="config-header">
        <div class="header-info">
          <h1 class="header-title">{{ currentSectionTitle }}</h1>
          <p class="header-description">{{ currentSectionDescription }}</p>
        </div>
        <div class="header-breadcrumb">
          <span>Configuración</span>
          <i class="fas fa-chevron-right"></i>
          <span class="breadcrumb-active">{{ currentSectionTitle }}</span>
        </div>
      </div>

      <div class="config-content">
        <component :is="currentComponent" :key="activeSection" @update="handleUpdate" />
      </div>
    </main>

    <!-- Spinner -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
import userComponent from "./components/userComponent.vue";
import configStore from "./components/configStore.vue";
import shopConfig from "./components/shopConfig.vue";
import usersManagement from "./components/usersManagement.vue";
import modulesConfig from "./components/modulesConfig.vue";
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "StoreConfiguration",
  components: { userComponent, configStore, shopConfig, usersManagement, modulesConfig },

  data() {
    return {
      activeSection: "user-config",
      loading: false,
      globalStore: useGlobalStore(),

      generalItems: [
        { key: "user-config",     label: "Mi Perfil",             icon: "fas fa-user-circle", plan: "FREE"   },
        { key: "business-config", label: "Datos del Negocio",     icon: "fas fa-store",       plan: "FREE"   },
        { key: "shop-config",     label: "Config. de la Tienda",  icon: "fas fa-cog",         plan: "MEDIUM" },
        { key: "users-management",label: "Equipo y Usuarios",     icon: "fas fa-users",       plan: "MEDIUM" },
        { key: "modules-config",  label: "Módulos",               icon: "fas fa-puzzle-piece", plan: "FREE"  },
      ],

      sectionConfig: {
        "user-config":     { title: "Mi Perfil",            description: "Información de tu cuenta y datos personales", component: "userComponent"    },
        "business-config": { title: "Datos del Negocio",    description: "Configurá la información básica de tu negocio", component: "shopConfig"      },
        "shop-config":     { title: "Config. de la Tienda", description: "Personalizá tu tienda, envíos y opciones avanzadas", component: "configStore" },
        "users-management":{ title: "Equipo y Usuarios",    description: "Administrá los usuarios y sus permisos de acceso", component: "usersManagement" },
        "modules-config":  { title: "Módulos",              description: "Activá o desactivá funcionalidades para tu negocio", component: "modulesConfig" },
      },
    };
  },

  computed: {
    currentSectionTitle()       { return this.sectionConfig[this.activeSection]?.title || "Configuración"; },
    currentSectionDescription() { return this.sectionConfig[this.activeSection]?.description || ""; },
    currentComponent()          { return this.sectionConfig[this.activeSection]?.component || "div"; },
  },

  methods: {
    planLevel(plan) {
      return { FREE: 0, BASIC: 1, MEDIUM: 2, PREMIUM: 3 }[plan] ?? 0;
    },
    isPlanBlocked(requiredPlan) {
      const shopPlan = this.globalStore.shopData?.plan ?? "FREE";
      return this.planLevel(shopPlan) < this.planLevel(requiredPlan);
    },
    setActiveSection(key) {
      if (this.activeSection === key) return;

      const item = this.generalItems.find((i) => i.key === key);
      if (item && this.isPlanBlocked(item.plan)) {
        this.$router.push("seccion-premium");
        return;
      }
      this.activeSection = key;
      this.$emit("section-changed", key);
    },

    handleUpdate(data) {
      this.$emit("config-updated", { section: this.activeSection, data });
    },
  },

  async mounted() {
    await this.globalStore.fetchShopData();
  },
};
</script>

<style scoped>
/* ===== Layout ===== */
.config-container {
  display: flex;
  min-height: calc(100vh - 64px);
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  background: #f9fafb;
  position: relative;
}

/* ===== Sidebar ===== */
.config-sidebar {
  width: 272px;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 0.75rem;
}

.brand-icon {
  font-size: 1.75rem;
  color: #f9931e;
  background: #fff7ed;
  padding: 0.5rem;
  border-radius: 0.75rem;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.3;
}

.sidebar-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.875rem;
  border-radius: 0.75rem;
  cursor: pointer;
  border: none;
  background: transparent;
  color: #4b5563;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.15s ease;
  text-align: left;
}

.nav-item:hover {
  background: #f9fafb;
  color: #111827;
}

.nav-item.active {
  background: #fff7ed;
  color: #c2410c;
  font-weight: 600;
}

.nav-item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: all 0.15s;
}

.nav-item.active .nav-icon-wrap {
  background: #fed7aa;
  color: #c2410c;
}

.nav-label {
  font-size: 0.875rem;
  white-space: nowrap;
}

.nav-item-right { display: flex; align-items: center; }

.premium-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 0.2rem 0.45rem;
  border-radius: 0.375rem;
  font-size: 0.7rem;
}

.active-arrow {
  font-size: 0.7rem;
  color: #f9931e;
}

.sidebar-plan-info {
  padding: 1rem 1.25rem 0;
  margin-top: auto;
  border-top: 1px solid #f3f4f6;
  padding-top: 1.25rem;
}

.plan-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.plan-free    { background: #f3f4f6; color: #6b7280; }
.plan-premium { background: #fef3c7; color: #92400e; }

.plan-upgrade-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  margin: 0.5rem 0 0;
  line-height: 1.4;
}

/* ===== Main content ===== */
.config-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.config-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.header-info {}
.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem;
}
.header-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.header-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #9ca3af;
  flex-shrink: 0;
  padding-top: 0.25rem;
}
.header-breadcrumb i { font-size: 0.65rem; }
.breadcrumb-active { color: #f9931e; font-weight: 500; }

.config-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* ===== Loading overlay ===== */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(2px);
}

.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #f9931e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .config-sidebar { width: 240px; }
}

@media (max-width: 768px) {
  .config-container { flex-direction: column; }

  .config-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem 0 0;
  }

  .sidebar-brand { padding-bottom: 1rem; }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0.5rem 0.75rem 0.75rem;
    gap: 0.5rem;
  }

  .nav-item {
    flex: 0 0 auto;
    min-width: 140px;
    border-radius: 0.625rem;
    padding: 0.6rem 0.875rem;
  }

  .sidebar-plan-info { display: none; }

  .config-header {
    padding: 1.25rem 1.25rem;
    flex-direction: column;
    gap: 0.25rem;
  }

  .header-breadcrumb { display: none; }

  .config-content { padding: 1.25rem; }
}

@media (max-width: 480px) {
  .header-title { font-size: 1.25rem; }
  .nav-item { min-width: 120px; }
  .config-content { padding: 1rem; }
}
</style>
