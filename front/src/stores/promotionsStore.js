import { defineStore } from "pinia";
import api from "@/config/axios.config";
import Cookies from "js-cookie";

export const usePromotionsStore = defineStore("promotions", {
  state: () => ({
    promotions: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    filters: {
      isActive: "",
      type: "",
      startDate: "",
      endDate: "",
      search: "",
    },
    toast: { showing: false, message: "", state: "success" },
  }),

  actions: {
    shopId() {
      const user_info = Cookies.get("user_info");
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null;
      return parsedUserInfo ? parsedUserInfo.shopId : null;
    },

    async fetchPromotions(page = 1, limit = 10) {
      this.loading = true;
      try {
        const shopId = this.shopId();
        const params = { page, limit, ...this.filters };
        Object.keys(params).forEach((key) => {
          if (!params[key] && params[key] !== false) delete params[key];
        });
        const response = await api.get(`/promotions/get/${shopId}`, { params });
        if (response.data.success) {
          this.promotions = response.data.data;
          this.pagination = response.data.pagination;
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        this.loading = false;
      }
    },

    async createPromotion(data) {
      const response = await api.post("/promotions/create", data);
      return response.data;
    },

    async updatePromotion(id, data) {
      const response = await api.patch(`/promotions/update/${id}`, data);
      return response.data;
    },

    async deletePromotion(id) {
      const response = await api.delete(`/promotions/delete/${id}`);
      return response.data;
    },

    async fetchActivePromotions() {
      const shopId = this.shopId();
      const response = await api.get(`/promotions/active/${shopId}`);
      return response.data;
    },

    clearFilters() {
      this.filters = { isActive: "", type: "", startDate: "", endDate: "", search: "" };
    },

    async loadData() {
      await this.fetchPromotions(this.pagination.page, this.pagination.limit);
    },

    async goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        await this.fetchPromotions(page, this.pagination.limit);
      }
    },

    async nextPage() {
      if (this.pagination.page < this.pagination.totalPages) {
        this.pagination.page++;
        await this.loadData();
      }
    },

    async previousPage() {
      if (this.pagination.page > 1) {
        this.pagination.page--;
        await this.loadData();
      }
    },

    async changeLimit(newLimit) {
      this.pagination.limit = newLimit;
      this.pagination.page = 1;
      await this.loadData();
    },
  },

  getters: {
    visiblePages() {
      const current = this.pagination.page;
      const total = this.pagination.totalPages;
      const pages = [];
      const start = Math.max(1, current - 1);
      const end = Math.min(total, current + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },

    itemsInfo() {
      const start = (this.pagination.page - 1) * this.pagination.limit + 1;
      const end = Math.min(
        this.pagination.page * this.pagination.limit,
        this.pagination.total
      );
      return `${start}-${end} de ${this.pagination.total}`;
    },
  },
});
