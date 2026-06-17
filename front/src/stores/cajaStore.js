import { defineStore } from "pinia";
import { useGlobalStore } from "./globalStore";
import api from "@/config/axios.config";
import { toRaw } from "vue";

export const useCajaStore = defineStore("caja", {
  state: () => {
    return {
      cajas: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      filtersApplied: false,
      cajaSummary: {},
      filters: {
        title: "",
        estado: "",
        startDate: null,
        endDate: null,
        createdBy: "",
        minAmount: null,
        maxAmount: null,
        isAutomatic: "",
      },
      entregaEfectivoFinal: 0,
      entregaEfectivoInicial: 0,
      observaciones: "",
      title: "",
    };
  },
  getters: {
    shopId: (state) => {
      const globalStore = useGlobalStore();
      return globalStore.shopId();
    },
    userId: (state) => {
      const globalStore = useGlobalStore();
      return globalStore.userId();
    },
  },
  actions: {
    async fetchCajas() {
      this.loading = true;
      try {
        const response = await api.get(
          `/caja/get/get-cajas/${this.shopId}?page=${this.pagination.page}&limit=${this.pagination.limit}`
        );
        const data = response.data;
        if (data.success) {
          this.cajas = data.data;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.totalPages;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async getCajaSummary(cajaId) {
      this.loading = true;
      try {
        const response = await api.get(`/caja/get/get-caja-summary/${cajaId}`);
        const data = response.data;
        if (data.success) {
          const rawData = toRaw(data.data);
          this.cajaSummary = rawData;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
      try {
      } catch (error) {
        console.log(error);
      }
    },
    async createMovement(cajaData, cajaId) {
      this.loading = true;
      try {
        const response = await api.patch(
          `/caja/patch/register-movement`,
          cajaData
        );
        const data = response.data;
        if (data.success) {
          console.log("cajaId", cajaId);

          await this.getCajaSummary(cajaId);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async filterCajas() {
      this.loading = true;
      this.filtersApplied = true;
      try {
        const params = new URLSearchParams();
        params.append("page", this.pagination.page);
        params.append("limit", this.pagination.limit);
        if (this.filters.title) {
          params.append("title", this.filters.title);
        }
        if (this.filters.estado) {
          params.append("estado", this.filters.estado);
        }
        if (this.filters.startDate) {
          params.append("startDate", this.filters.startDate.toISOString());
        }
        if (this.filters.endDate) {
          params.append("endDate", this.filters.endDate.toISOString());
        }
        if (this.filters.createdBy) {
          params.append("createdBy", this.filters.createdBy);
        }
        if (this.filters.minAmount !== null && this.filters.minAmount !== "") {
          params.append("minAmount", this.filters.minAmount);
        }
        if (this.filters.maxAmount !== null && this.filters.maxAmount !== "") {
          params.append("maxAmount", this.filters.maxAmount);
        }
        if (this.filters.isAutomatic) {
          params.append("isAutomatic", this.filters.isAutomatic);
        }
        const response = await api.get(
          `/caja/get/filter-cajas/${this.shopId}?${params.toString()}`
        );
        const data = response.data;
        if (data.success) {
          this.cajas = data.data;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.totalPages;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async closeCaja() {
      this.loading = true;
      try {
        let caja = {
          shopId: this.shopId,
          userIdCierre: this.cajaSummary.userIdCierre,
          entregaEfectivoFinal: this.entregaEfectivoFinal,
          observaciones: this.observaciones,
        };
        const response = await api.patch(`/caja/patch/close-caja`, caja);
        const data = response.data;

        if (data.success) {
          this.cajaSummary = data.data;
          this.entregaEfectivoFinal = 0;
          await this.getCajaSummary(this.cajaSummary._id);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async openCaja() {
      this.loading = true;
      try {
        let caja = {
          shopId: this.shopId,
          userIdApertura: this.userId,
          entregasEfectivo: {
            inicial: this.entregaEfectivoInicial,
          },
          title: this.title,
        };
        const response = await api.post(`/caja/post/open-caja`, caja);
        const data = response.data;

        if (data.success) {
          this.cajaSummary = data.data;
          await this.fetchCajas();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async deleteCaja(cajaId) {
      this.loading = true;
      try {
        if (!confirm("¿Estás seguro de que quieres eliminar esta caja?")) {
          this.loading = false;
          return;
        }

        const response = await api.delete(`/caja/delete/delete-caja/${cajaId}`);
        const data = response.data;
        if (data.success) {
          await this.loadData();
          alert("Caja eliminada correctamente.");
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async loadData() {
      if (!this.filtersApplied) {
        await this.fetchCajas();
      } else if (this.filtersApplied) {
        await this.filterCajas();
      }
    },
    clearFilters() {
      this.filtersApplied = false;
      this.filters = {
        title: "",
        estado: "",
        startDate: null,
        endDate: null,
        createdBy: "",
        minAmount: null,
        maxAmount: null,
        isAutomatic: "",
      };
      this.loadData();
    },
    nextPage() {
      if (this.pagination.page < this.pagination.totalPages) {
        this.pagination.page++;
        this.loadData();
      }
    },
    previousPage() {
      if (this.pagination.page > 1) {
        this.pagination.page--;
        this.loadData();
      }
    },
    changeLimit(newLimit) {
      this.pagination.limit = newLimit;
      this.pagination.page = 1;
      this.loadData();
    },
  },
});
