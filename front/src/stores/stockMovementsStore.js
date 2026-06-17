import { defineStore } from "pinia";
import api from "@/config/axios.config";
import Cookies from "js-cookie";

export const useStockMovementsStore = defineStore("stockMovements", {
  state: () => ({
    movements: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    filters: {
      productId: "",
      search: "",
      type: "",
      fromLocation: "",
      toLocation: "",
      startDate: "",
      endDate: "",
      userId: "",
    },
    toast: { showing: false, message: "", state: "success" },
  }),

  actions: {
    shopId() {
      const user_info = Cookies.get("user_info");
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null;
      return parsedUserInfo ? parsedUserInfo.shopId : null;
    },

    async fetchMovements(page = 1, limit = 20) {
      this.loading = true;
      try {
        const shopId = this.shopId();
        const params = { page, limit, ...this.filters };
        Object.keys(params).forEach((key) => {
          if (!params[key]) delete params[key];
        });
        const response = await api.get(`/stock-movements/get/${shopId}`, { params });
        if (response.data.success) {
          this.movements = response.data.data;
          this.pagination = response.data.pagination;
        }
      } catch (error) {
        console.error("Error fetching stock movements:", error);
      } finally {
        this.loading = false;
      }
    },

    clearFilters() {
      this.filters = {
        productId: "",
        search: "",
        type: "",
        fromLocation: "",
        toLocation: "",
        startDate: "",
        endDate: "",
        userId: "",
      };
    },
  },
});
