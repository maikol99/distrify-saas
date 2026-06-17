import api from "@/config/axios.config";
import { defineStore } from "pinia";
import Cookies from "js-cookie";

export const useBuysStore = defineStore("buys", {
  state: () => {
    return {
      buys: [],
      buy: {},
      loading: false,
      pagination: {
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
      },
      searchQuery: "",
      toast: {
        showing: false,
        message: "",
        state: "information",
      },

      filtersObject: {
        supplierSearchQuery: "",
        filtersApplied: false,
        showFilters: false,
        filters: {
          supplierId: "",
          category: "",
          startDate: "",
          endDate: "",
          paymentMethod: "",
          minAmount: null,
          maxAmount: null,
          isPaid: "",
        },
        selectedSupplier: false,
      },
    };
  },
  getters: {
    itemsInfo() {
      const start = (this.pagination.page - 1) * this.pagination.limit + 1;
      const end = Math.min(
        this.pagination.page * this.pagination.limit,
        this.pagination.total
      );
      return `Mostrando ${start} a ${end} de ${this.pagination.total} compras`;
    },
    visiblePages() {
      const current = this.pagination.page;
      const total = this.pagination.totalPages;
      const pages = [];

      // Mostrar páginas alrededor de la actual
      const start = Math.max(1, current - 2);
      const end = Math.min(total, current + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  actions: {
    async filterBuys() {
      this.loading = true;
      try {
        if (!this.filtersObject.filtersApplied) {
          this.pagination = {
            total: 0,
            totalPages: 0,
            page: 1,
            limit: 10,
          };
        }
        this.filtersObject.filtersApplied = true;
        const shopId = this.shopId();
        const urlParams = new URLSearchParams();

        if (this.filtersObject.filters.supplierId) {
          urlParams.append("supplierId", this.filtersObject.filters.supplierId);
        }

        if (this.filtersObject.filters.category) {
          urlParams.append("category", this.filtersObject.filters.category);
        }

        if (this.filtersObject.filters.startDate) {
          urlParams.append("startDate", this.filtersObject.filters.startDate);
        }

        if (this.filtersObject.filters.endDate) {
          urlParams.append("endDate", this.filtersObject.filters.endDate);
        }

        if (this.filtersObject.filters.paymentMethod) {
          urlParams.append(
            "paymentMethod",
            this.filtersObject.filters.paymentMethod
          );
        }

        if (this.filtersObject.filters.minAmount !== null && this.filtersObject.filters.minAmount !== "") {
          urlParams.append("minAmount", this.filtersObject.filters.minAmount);
        }

        if (this.filtersObject.filters.maxAmount !== null && this.filtersObject.filters.maxAmount !== "") {
          urlParams.append("maxAmount", this.filtersObject.filters.maxAmount);
        }

        if (this.filtersObject.filters.isPaid !== "" && this.filtersObject.filters.isPaid !== null) {
          urlParams.append("isPaid", this.filtersObject.filters.isPaid);
        }

        console.log("Filters: ", urlParams.toString());

        const response = await api.get(
          `/buys/get/filter-buys?shopId=${shopId}&page=${
            this.pagination.page
          }&limit=${this.pagination.limit}&${urlParams.toString()}`
        );
        const data = response.data;
        if (data.success) {
          this.buys = data.data;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.pages;
          this.pagination.limit = data.pagination.limit;
          this.pagination.page = data.pagination.page;
        } else {
          this.toast = {
            showing: true,
            message: data.message || "No se encontraron compras",
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
      if (this.filtersObject.filtersApplied) {
        await this.filterBuys();
      } else {
        await this.getAllBuys();
      }
    },
    async clearFilters() {
      this.searchQuery = "";
      this.typeOfQuery = "";
      this.filtersObject.supplierSearchQuery = "";
      this.filtersObject.filters = {
        supplierId: "",
        category: "",
        startDate: "",
        endDate: "",
        paymentMethod: "",
        minAmount: null,
        maxAmount: null,
        isPaid: "",
      };
      this.filtersObject.filtersApplied = false;
      this.pagination.page = 1;
      await this.getAllBuys();
    },
    clearSelections() {
      if (this.filtersObject.selectedSupplier) {
        this.filtersObject.filters.supplierId = null;
        this.filtersObject.supplierSearchQuery = "";
        this.suppliers = [];
        this.filtersObject.selectedSupplier = false;
      }
    },
    selectSupplier(supplier) {
      this.filtersObject.filters.supplierId = supplier._id;
      this.filtersObject.supplierSearchQuery = supplier.name;
      this.filtersObject.selectedSupplier = true;
    },
    async searchSuppliers() {
      this.loading = true;
      try {
        const shopId = this.shopId();

        const response = await api.get(
          `/suppliers/get/search-supplier/by-name?name=${this.filtersObject.supplierSearchQuery}&shopId=${shopId}`
        );
        const data = response.data;

        if (data.success) {
          this.suppliers = data.suppliers;
        } else {
          this.suppliers = [];
          this.toast = {
            showing: true,
            message: "No se encontraron proveedores",
            state: "information",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    shopId() {
      const user_info = Cookies.get("user_info");
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null;
      return parsedUserInfo ? parsedUserInfo.shopId : null;
    },
    async checkInput() {
      if (this.searchQuery === "") {
        await this.searchBySupplier();
      }
    },

    async searchBySupplier() {
      try {
        this.loading = true;
        const response = await api.get(
          `/buys/get/search-by-provider?supplierName=${
            this.searchQuery
          }&shopId=${this.shopId()}`
        );
        const data = response.data;
        if (data.success) {
          this.buys = data.data;
        } else {
          this.toast = {
            showing: true,
            message: data.message || "No se encontraron compras",
            state: "information",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async getAllBuys() {
      this.filtersObject.filtersApplied = false;
      this.loading = true;

      try {
        const response = await api.get(
          `/buys/get/get-buys/${this.shopId()}?page=${
            this.pagination.page
          }&limit=${this.pagination.limit}`
        );
        const data = response.data;
        if (data.success) {
          this.buys = data.data;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.totalPages;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
        } else {
          this.toast = {
            showing: true,
            message: data.message || "No se encontraron compras",
            state: "information",
          };
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
      this.pagination.page = 1; // Reset to first page when changing limit
      await this.loadData();
    },
  },
});
