import { defineStore } from "pinia";
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";

export const useTurnsStore = defineStore("turns", {
  state: () => ({
    currentTurn: null,
    initialized: false,  // true solo después de que fetchCurrentTurn resuelve
    loading: false,
    closingPreview: null,
    closingLoading: false,
    turns: [],
    stats: null,
    turnsLoading: false,
    filters: { dateFrom: "", dateTo: "", userId: "", status: "", minSales: null, maxSales: null },
    error: null,
  }),

  getters: {
    hasOpenTurn: (state) => !!state.currentTurn,
  },

  actions: {
    async fetchCurrentTurn() {
      const globalStore = useGlobalStore();
      const userId = globalStore.userId();
      if (!userId) return;

      this.loading = true;
      this.error = null;
      try {
        const response = await api.get(`/turns/${userId}`);
        // El backend devuelve el turno o false cuando no hay turno abierto
        const data = response.data;
        this.currentTurn = (data && data !== false && typeof data === "object") ? data : null;
      } catch {
        this.currentTurn = null;
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },

    async openTurn(payload) {
      const globalStore = useGlobalStore();
      this.loading = true;
      this.error = null;
      try {
        const body = {
          shopId: globalStore.shopId(),
          userId: globalStore.userId(),
          userName: globalStore.userName(),
          efectivoRecibido: payload.efectivoRecibido ?? 0,
          descriptionApertura: payload.descriptionApertura ?? "",
        };
        const response = await api.post("/turns", body);
        this.currentTurn = response.data;
        this.initialized = true;
        return true;
      } catch (err) {
        this.error = err?.response?.data?.message || "Error al abrir el turno";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchClosingPreview() {
      const globalStore = useGlobalStore();
      const userId = globalStore.userId();
      this.closingLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/turns/get/turn/sales/${userId}`);
        this.closingPreview = response.data;
      } catch (err) {
        this.error = err?.response?.data?.message || "Error al obtener datos del turno";
      } finally {
        this.closingLoading = false;
      }
    },

    async closeTurn(payload) {
      if (!this.currentTurn) return false;
      this.loading = true;
      this.error = null;
      const globalStore = useGlobalStore();
      try {
        const body = {
          id: this.currentTurn._id,
          userId: globalStore.userId(),
          userName: globalStore.userName(),
          efectivoPresentado: payload.efectivoPresentado ?? 0,
          descriptionCierre: payload.descriptionCierre ?? "",
        };
        await api.put("/turns/close", body);
        this.currentTurn = null;
        this.closingPreview = null;
        return true;
      } catch (err) {
        this.error = err?.response?.data?.message || "Error al cerrar el turno";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchShopTurns() {
      this.turnsLoading = true;
      this.error = null;
      try {
        const params = new URLSearchParams();
        if (this.filters.dateFrom) params.append("dateFrom", this.filters.dateFrom);
        if (this.filters.dateTo)   params.append("dateTo",   this.filters.dateTo);
        if (this.filters.userId)   params.append("userId",   this.filters.userId);
        if (this.filters.status)   params.append("status",   this.filters.status);
        if (this.filters.minSales !== null && this.filters.minSales !== "") params.append("minSales", this.filters.minSales);
        if (this.filters.maxSales !== null && this.filters.maxSales !== "") params.append("maxSales", this.filters.maxSales);

        const response = await api.get(`/turns/get/shop-turns?${params.toString()}`);
        this.turns = response.data.turns ?? [];
        this.stats  = response.data.stats  ?? null;
      } catch (err) {
        this.error = err?.response?.data?.message || "Error al cargar los turnos";
        this.turns = [];
        this.stats = null;
      } finally {
        this.turnsLoading = false;
      }
    },

    setFilter(key, value) {
      this.filters[key] = value;
    },

    clearFilters() {
      this.filters = { dateFrom: "", dateTo: "", userId: "", status: "", minSales: null, maxSales: null };
    },
  },
});
