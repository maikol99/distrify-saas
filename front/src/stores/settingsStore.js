import { defineStore } from "pinia";
import api from "@/config/axios.config";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    settings: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchSettings() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/settings/get/my-settings");
        this.settings = response.data;
      } catch (err) {
        this.error = err?.response?.data?.message || "Error al cargar configuraciones";
      } finally {
        this.loading = false;
      }
    },

    async updateSetting(key, value) {
      this.error = null;
      try {
        const response = await api.patch("/settings/patch/update-settings", {
          [key]: value,
        });
        this.settings = response.data;
        return true;
      } catch (err) {
        this.error = err?.response?.data?.message || "Error al guardar configuración";
        return false;
      }
    },
  },
});
