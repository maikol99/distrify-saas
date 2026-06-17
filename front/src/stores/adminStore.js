import { defineStore } from "pinia";
import api from "@/config/axios.config";

export const useAdminStore = defineStore("adminStore", {
  state: () => ({
    // Tab activo
    activeTab: "metrics",

    // Métricas
    metrics: null,
    metricsLoading: false,

    // Shops
    shops: [],
    shopsLoading: false,
    shopsPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    shopsSearch: "",
    shopsPlanFilter: "",
    shopsStatusFilter: "",
    selectedShop: null,
    shopDetailLoading: false,

    // Usuarios
    users: [],
    usersLoading: false,
    usersPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    usersSearch: "",
    usersShopFilter: "",

    // UI
    error: null,
    successMessage: null,
  }),

  getters: {
    shopsVisiblePages: (state) => {
      const { page, totalPages } = state.shopsPagination;
      const range = 3;
      let start = Math.max(1, page - Math.floor(range / 2));
      let end = Math.min(totalPages, start + range - 1);
      if (end - start + 1 < range) start = Math.max(1, end - range + 1);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    },
    usersVisiblePages: (state) => {
      const { page, totalPages } = state.usersPagination;
      const range = 3;
      let start = Math.max(1, page - Math.floor(range / 2));
      let end = Math.min(totalPages, start + range - 1);
      if (end - start + 1 < range) start = Math.max(1, end - range + 1);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    },
  },

  actions: {
    // ─── MÉTRICAS ────────────────────────────────────────────────────────────

    async fetchMetrics() {
      this.metricsLoading = true;
      this.error = null;
      try {
        const { data } = await api.get("/admin/metrics");
        if (data.success) this.metrics = data.data;
        else this.error = data.message;
      } catch (e) {
        this.error = "Error al cargar métricas";
        console.error(e);
      } finally {
        this.metricsLoading = false;
      }
    },

    // ─── SHOPS ───────────────────────────────────────────────────────────────

    async fetchShops(resetPage = false) {
      if (resetPage) this.shopsPagination.page = 1;
      this.shopsLoading = true;
      this.error = null;
      try {
        const params = new URLSearchParams({
          page: this.shopsPagination.page,
          limit: this.shopsPagination.limit,
        });
        if (this.shopsSearch) params.set("search", this.shopsSearch);
        if (this.shopsPlanFilter) params.set("plan", this.shopsPlanFilter);
        if (this.shopsStatusFilter) params.set("status", this.shopsStatusFilter);

        const { data } = await api.get(`/admin/shops?${params}`);
        if (data.success) {
          this.shops = data.data;
          this.shopsPagination = data.pagination;
        } else {
          this.error = data.message;
        }
      } catch (e) {
        this.error = "Error al cargar negocios";
        console.error(e);
      } finally {
        this.shopsLoading = false;
      }
    },

    async fetchShopDetail(shopId) {
      this.shopDetailLoading = true;
      this.selectedShop = null;
      try {
        const { data } = await api.get(`/admin/shops/${shopId}`);
        if (data.success) this.selectedShop = data.data;
      } catch (e) {
        this.error = "Error al cargar detalle del negocio";
      } finally {
        this.shopDetailLoading = false;
      }
    },

    async updateShopPlan(shopId, plan) {
      try {
        const { data } = await api.patch(`/admin/shops/${shopId}/plan`, { plan });
        if (data.success) {
          this.successMessage = data.message;
          const idx = this.shops.findIndex((s) => s._id === shopId);
          if (idx !== -1) this.shops[idx].plan = plan;
          if (this.selectedShop?.shop?._id === shopId) this.selectedShop.shop.plan = plan;
        } else {
          this.error = data.message;
        }
        return data.success;
      } catch (e) {
        this.error = "Error al actualizar plan";
        return false;
      }
    },

    async updateShopStatus(shopId, status) {
      try {
        const { data } = await api.patch(`/admin/shops/${shopId}/status`, { status });
        if (data.success) {
          this.successMessage = data.message;
          const idx = this.shops.findIndex((s) => s._id === shopId);
          if (idx !== -1) this.shops[idx].status = status;
        } else {
          this.error = data.message;
        }
        return data.success;
      } catch (e) {
        this.error = "Error al actualizar estado";
        return false;
      }
    },

    async deleteShop(shopId) {
      try {
        const { data } = await api.delete(`/admin/shops/${shopId}`);
        if (data.success) {
          this.successMessage = data.message;
          this.shops = this.shops.filter((s) => s._id !== shopId);
          if (this.selectedShop?.shop?._id === shopId) this.selectedShop = null;
        } else {
          this.error = data.message;
        }
        return data.success;
      } catch (e) {
        this.error = "Error al eliminar negocio";
        return false;
      }
    },

    // ─── USUARIOS ────────────────────────────────────────────────────────────

    async fetchUsers(resetPage = false) {
      if (resetPage) this.usersPagination.page = 1;
      this.usersLoading = true;
      this.error = null;
      try {
        const params = new URLSearchParams({
          page: this.usersPagination.page,
          limit: this.usersPagination.limit,
        });
        if (this.usersSearch) params.set("search", this.usersSearch);
        if (this.usersShopFilter) params.set("shopId", this.usersShopFilter);

        const { data } = await api.get(`/admin/users?${params}`);
        if (data.success) {
          this.users = data.data;
          this.usersPagination = data.pagination;
        } else {
          this.error = data.message;
        }
      } catch (e) {
        this.error = "Error al cargar usuarios";
        console.error(e);
      } finally {
        this.usersLoading = false;
      }
    },

    async deleteUser(userId) {
      try {
        const { data } = await api.delete(`/admin/users/${userId}`);
        if (data.success) {
          this.successMessage = data.message;
          this.users = this.users.filter((u) => u._id !== userId);
        } else {
          this.error = data.message;
        }
        return data.success;
      } catch (e) {
        this.error = "Error al eliminar usuario";
        return false;
      }
    },

    // ─── ACCIONES MASIVAS ────────────────────────────────────────────────────

    async updateAllShopsPlan(plan) {
      try {
        const { data } = await api.patch("/admin/bulk/update-all-plans", { plan });
        if (data.success) {
          this.successMessage = data.message;
          await this.fetchShops(true);
        } else {
          this.error = data.message;
        }
        return data.success;
      } catch (e) {
        this.error = "Error al actualizar planes masivamente";
        return false;
      }
    },

    async previewInactiveShops() {
      try {
        const { data } = await api.get("/admin/bulk/preview-inactive");
        return data.success ? data.data : null;
      } catch (e) {
        this.error = "Error al cargar la previsualización";
        return null;
      }
    },

    async deleteInactiveShops() {
      try {
        const { data } = await api.delete("/admin/bulk/delete-inactive");
        if (data.success) {
          this.successMessage = data.message;
          await this.fetchShops(true);
          await this.fetchMetrics();
        } else {
          this.error = data.message;
        }
        return data;
      } catch (e) {
        this.error = "Error al eliminar inactivos";
        return null;
      }
    },

    // ─── PAGINACIÓN ──────────────────────────────────────────────────────────

    shopsNextPage() {
      if (this.shopsPagination.page < this.shopsPagination.totalPages) {
        this.shopsPagination.page++;
        this.fetchShops();
      }
    },
    shopsPrevPage() {
      if (this.shopsPagination.page > 1) {
        this.shopsPagination.page--;
        this.fetchShops();
      }
    },
    shopsGoToPage(page) {
      if (page >= 1 && page <= this.shopsPagination.totalPages) {
        this.shopsPagination.page = page;
        this.fetchShops();
      }
    },

    usersNextPage() {
      if (this.usersPagination.page < this.usersPagination.totalPages) {
        this.usersPagination.page++;
        this.fetchUsers();
      }
    },
    usersPrevPage() {
      if (this.usersPagination.page > 1) {
        this.usersPagination.page--;
        this.fetchUsers();
      }
    },
    usersGoToPage(page) {
      if (page >= 1 && page <= this.usersPagination.totalPages) {
        this.usersPagination.page = page;
        this.fetchUsers();
      }
    },

    clearMessages() {
      this.error = null;
      this.successMessage = null;
    },
  },
});
