import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";
import api from "@/config/axios.config";

export const useClientsStore = defineStore("clients", {
  state: () => {
    return {
      clients: [],
      loading: false,
      error: null,
      globalStore: useGlobalStore(),
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      filtersApplied: false,
      searchQuery: "",
      minDebt: null,
      maxDebt: null,
      hasDebt: "",
      typeOfClient: "",
      isAuthorized: "",
      clientSales: [],
      clientSalesLoading: false,
    };
  },
  actions: {
    async fetchClients() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        const response = await api.get(
          `/clients/get/get-clients/${shopId}?page=${this.pagination.page}&limit=${this.pagination.limit}`
        );
        const data = response.data;
        if (data.success) {
          this.clients = data.data;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.totalPages;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
        } else {
          alert("Hubo un error al obtener los clientes");
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async searchByName() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        const response = await api.get(
          `/clients/get/search-client?shopId=${shopId}&query=${this.searchQuery}`
        );
        const data = response.data;
        if (data.success) {
          this.clients = response.data.data;
        } else {
          alert("Hubo un error al buscar los clientes");
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async goToPage(page) {
      if (
        page >= 1 &&
        page <= this.pagination.totalPages &&
        page !== this.pagination.page
      ) {
        this.pagination.page = page;
        await this.loadData();
      }
    },
    async checkInput() {
      if (this.searchQuery === "") {
        this.clients = [];
        this.filtersApplied = false;
        await this.fetchClients();
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
        await this.fetchClients();
      }
    },

    async changeLimit(newLimit) {
      console.log("Changing limit to:", newLimit);

      this.pagination.limit = newLimit;
      this.pagination.page = 1; // Reset to first page when changing limit
      await this.loadData();
    },
    async loadData() {
      if (!this.filtersApplied) {
        await this.fetchClients();
      } else {
        await this.getFilteredClients();
      }
    },
    async getFilteredClients() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        const params = new URLSearchParams({
          page: this.pagination.page,
          limit: this.pagination.limit,
        });
        if (this.searchQuery) params.append("query", this.searchQuery);
        if (this.minDebt) params.append("minDebt", this.minDebt);
        if (this.maxDebt) params.append("maxDebt", this.maxDebt);
        if (this.hasDebt) params.append("hasDebt", this.hasDebt);
        if (this.typeOfClient) params.append("typeOfClient", this.typeOfClient);
        if (this.isAuthorized) params.append("isAuthorized", this.isAuthorized);
        const response = await api.get(
          `/clients/get/search-client?shopId=${shopId}&${params.toString()}`
        );
        const data = response.data;
        if (data.success) {
          this.clients = Array.isArray(data.data) ? data.data : [data.data];
          if (data.pagination) {
            this.pagination.total = data.pagination.total;
            this.pagination.totalPages = data.pagination.totalPages;
            this.pagination.page = data.pagination.page;
            this.pagination.limit = data.pagination.limit;
          }
          this.filtersApplied = true;
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchSalesByClient(clientId) {
      this.clientSalesLoading = true;
      try {
        const response = await api.get(`/sales/get/sales-by-client/${clientId}`);
        if (response.data.success) {
          this.clientSales = response.data.data;
        } else {
          this.clientSales = [];
        }
      } catch (error) {
        console.error("Error fetching client sales:", error);
        this.clientSales = [];
      } finally {
        this.clientSalesLoading = false;
      }
    },
  },
});
