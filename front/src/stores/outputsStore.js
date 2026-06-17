import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";
import api from "@/config/axios.config";

export const useOutputsStore = defineStore("outputs", {
  state: () => {
    return {
      outputs: [],
      loading: false,
      error: null,
      globalStore: useGlobalStore(),
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      filterApplied: false,
      searchQuery: "",
      cashierSearchResults: [],
      filters: {
        userId: null,
        startDate: null,
        endDate: null,
        category: "",
        paymentMethod: "",
        minAmount: null,
        maxAmount: null,
      },
      toast: {
        showing: false,
        message: "",
        state: "",
      },
    };
  },
  actions: {
    async fetchOutputs() {
      this.loading = true;
      const shopId = this.globalStore.shopId();
      try {
        const response = await api.get(
          `/outputs/get/all-outputs?shopId=${shopId}&page=${this.pagination.page}&limit=${this.pagination.limit}`
        );
        const data = response.data;

        if (data.success) {
          this.outputs = data.data;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.totalPages;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
        } else {
          this.toast = {
            showing: true,
            message: data.message || "No se encontraron egresos",
            state: "information",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async searchCashiers() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        const response = await api.get(
          `/users/get/search-users?shopId=${shopId}&name=${this.searchQuery}`
        );
        if (response.data.success) {
          this.cashierSearchResults = response.data.users;
        } else {
          this.cashierSearchResults = [];
          this.toast = {
            showing: true,
            message: response.data.message || "No se encontraron cajeros",
            state: "information",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async loadData() {
      if (this.filterApplied === false) {
        await this.fetchOutputs();
      } else if (this.filterApplied === true) {
        await this.filterOutputs();
      }
    },
    async filterOutputs() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        this.filterApplied = true;

        const params = new URLSearchParams({
          shopId,
          page: this.pagination.page,
          limit: this.pagination.limit,
        });

        if (this.filters.userId) {
          params.append("userId", this.filters.userId);
        }

        if (this.filters.startDate) {
          params.append("startDate", this.filters.startDate);
        }

        if (this.filters.endDate) {
          params.append("endDate", this.filters.endDate);
        }

        if (this.filters.category) {
          params.append("category", this.filters.category);
        }
        if (this.filters.paymentMethod) {
          params.append("paymentMethod", this.filters.paymentMethod);
        }

        if (this.filters.minAmount !== null && this.filters.minAmount !== "") {
          params.append("minAmount", this.filters.minAmount);
        }

        if (this.filters.maxAmount !== null && this.filters.maxAmount !== "") {
          params.append("maxAmount", this.filters.maxAmount);
        }

        const response = await api.get(
          `/outputs/get/outputs-filtered?${params.toString()}`
        );
        const data = response.data;
        if (data.success) {
          this.outputs = data.data;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.totalPages;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
        } else {
          this.toast = {
            showing: true,
            message: data.message || "No se encontraron egresos",
            state: "information",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    selectCashier(cashier) {
      this.filters.userId = cashier._id;
      this.searchQuery = cashier.username;
      this.cashierSearchResults = [];
      this.filterApplied = true;
      this.loadData();
    },
    clearCashierSearch() {
      this.searchQuery = "";
      this.cashierSearchResults = [];
      this.filters.userId = null;
      this.filterApplied = false;
    },
    clearFilters() {
      this.filters = {
        userId: null,
        startDate: null,
        endDate: null,
        category: "",
        paymentMethod: "",
        minAmount: null,
        maxAmount: null,
      };
      this.filterApplied = false;
      this.loadData();
    },
  },
});
