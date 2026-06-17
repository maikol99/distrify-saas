import { defineStore } from "pinia";
import api from "@/config/axios.config";
import Cookies from "js-cookie";

export const useMovementsStore = defineStore("movements", {
  state: () => ({
    movements: [],
    loading: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    filters: {
      type: "",
      userId: "",
      paymentMethod: "",
      startDate: "",
      endDate: "",
    },
    toast: {
      showing: false,
      message: "",
      state: "",
    },
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
        const baseParams = {
          shopId,
          page,
          limit,
        };

        if (this.filters.userId) baseParams.userId = this.filters.userId;
        if (this.filters.paymentMethod) baseParams.paymentMethod = this.filters.paymentMethod;
        if (this.filters.startDate) baseParams.startDate = this.filters.startDate;
        if (this.filters.endDate) baseParams.endDate = this.filters.endDate;

        let results = [];

        if (!this.filters.type || this.filters.type === "ingreso") {
          const inputsRes = await api.get("/inputs/get/inputs-filtered", { params: baseParams });
          if (inputsRes.data.success) {
            results.push(...(inputsRes.data.data || inputsRes.data.inputs || []).map(i => ({
              ...i,
              movementType: "ingreso",
            })));
          }
        }

        if (!this.filters.type || this.filters.type === "egreso") {
          const outputsRes = await api.get("/outputs/get/outputs-filtered", { params: baseParams });
          if (outputsRes.data.success) {
            results.push(...(outputsRes.data.data || outputsRes.data.outputs || []).map(o => ({
              ...o,
              movementType: "egreso",
            })));
          }
        }

        results.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

        this.movements = results;
        this.pagination.total = results.length;
        this.pagination.page = page;
        this.pagination.limit = limit;
        this.pagination.totalPages = Math.ceil(results.length / limit);
      } catch (error) {
        console.error("Error fetching movements:", error);
      } finally {
        this.loading = false;
      }
    },

    clearFilters() {
      this.filters = {
        type: "",
        userId: "",
        paymentMethod: "",
        startDate: "",
        endDate: "",
      };
    },
  },
});
