<template>
  <div class="modules-container">
    <div v-if="settingsStore.loading" class="modules-loading">
      <div class="spinner"></div>
      <span>Cargando módulos...</span>
    </div>

    <template v-else>
      <div class="modules-intro">
        <p class="intro-text">
          Activá o desactivá los módulos que querés usar en tu negocio.
          Podés cambiarlos en cualquier momento.
        </p>
      </div>

      <div class="data-table-container">
        <div class="table-header">
          <h3>Módulos disponibles</h3>
        </div>

        <div class="info-content">
          <div
            v-for="mod in modules"
            :key="mod.key"
            class="info-item"
            :class="{ 'item-disabled': mod.disabled }"
          >
            <div class="icon-wrapper" :style="{ background: mod.iconBg, color: mod.iconColor }">
              <i :class="mod.icon"></i>
            </div>

            <div class="info-text">
              <span class="info-label">{{ mod.label }}</span>
              <span class="info-description">{{ mod.description }}</span>
            </div>

            <div class="toggle-area">
              <span v-if="mod.disabled" class="coming-soon-badge">Próximamente</span>
              <label v-else class="switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.settings?.[mod.key]"
                  :disabled="savingKey === mod.key"
                  @change="toggleModule(mod.key, $event.target.checked)"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div v-if="settingsStore.error" class="error-banner">
        <i class="fas fa-exclamation-circle"></i>
        {{ settingsStore.error }}
      </div>

      <div v-if="successMessage" class="success-banner">
        <i class="fas fa-check-circle"></i>
        {{ successMessage }}
      </div>
    </template>
  </div>
</template>

<script>
import { useSettingsStore } from "@/stores/settingsStore";

export default {
  name: "ModulesConfig",

  data() {
    return {
      settingsStore: useSettingsStore(),
      savingKey: null,
      successMessage: "",
      successTimeout: null,

      modules: [
        {
          key: "turnsEnabled",
          label: "Sistema de Turnos",
          description: "Habilitar apertura y cierre de turnos en el sistema.",
          icon: "fas fa-calendar-alt",
          iconBg: "#eff6ff",
          iconColor: "#3b82f6",
          disabled: false,
        },
      ],
    };
  },

  methods: {
    async toggleModule(key, value) {
      this.savingKey = key;
      this.successMessage = "";
      clearTimeout(this.successTimeout);

      const ok = await this.settingsStore.updateSetting(key, value);
      this.savingKey = null;

      if (ok) {
        this.successMessage = "Configuración guardada correctamente.";
        this.successTimeout = setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      }
    },
  },

  async mounted() {
    await this.settingsStore.fetchSettings();
  },

  beforeUnmount() {
    clearTimeout(this.successTimeout);
  },
};
</script>

<style scoped>
.modules-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  color: #1f2937;
}

.modules-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #f9931e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.modules-intro {
  margin-bottom: 1.25rem;
}
.intro-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Card */
.data-table-container {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}
.table-header h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.info-content { padding: 0.25rem 0; }

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s;
}
.info-item:last-child { border-bottom: none; }
.info-item:hover { background: #fafafa; }
.info-item.item-disabled { opacity: 0.55; }

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
}

.info-text {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 0.15rem;
}
.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}
.info-description {
  font-size: 0.78rem;
  color: #9ca3af;
  line-height: 1.4;
}

.toggle-area {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Toggle switch — mismo estilo que configStore.vue */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #d1d5db;
  transition: 0.3s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
input:checked + .slider { background: #f9931e; }
input:focus + .slider { box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.25); }
input:checked + .slider:before { transform: translateX(20px); }
input:disabled + .slider { opacity: 0.6; cursor: not-allowed; }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }

.coming-soon-badge {
  background: #f3f4f6;
  color: #9ca3af;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Banners */
.error-banner,
.success-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  font-size: 0.85rem;
  font-weight: 500;
}
.error-banner {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.success-banner {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

@media (max-width: 480px) {
  .info-item { gap: 0.75rem; padding: 0.875rem 1rem; }
}
</style>
