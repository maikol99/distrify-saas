import { defineStore } from "pinia";
import api from "@/config/axios.config";
import Cookies from "js-cookie";

export const useSuppliersStore = defineStore("suppliers", {
  state: () => {
    return {
      suppliers: [],
      supplier: {},
      loading: false,
      error: null,
      searchQuery: "",
      supplierData: {
        shopId: null,
        name: "",
        address: "",
        phone: "",
        email: "",
        cuit: "",
        buyId: "",
        debt: 0,
        company: "",
        userName: "",
      },
      pagination: {
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
      },
    };
  },

  getters: {
    // Información de elementos mostrados
    itemsInfo() {
      const start = (this.pagination.page - 1) * this.pagination.limit + 1;
      const end = Math.min(
        this.pagination.page * this.pagination.limit,
        this.pagination.total
      );
      return `Mostrando ${start} a ${end} de ${this.pagination.total} proveedores`;
    },

    // Páginas visibles en la paginación
    visiblePages() {
      const current = this.pagination.page;
      const total = this.pagination.totalPages;
      const pages = [];

      // Mostrar páginas alrededor de la actual
      const start = Math.max(1, current - 1);
      const end = Math.min(total, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  actions: {
    shopId() {
      const user_info = Cookies.get("user_info");
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null;
      return parsedUserInfo ? parsedUserInfo.shopId : null;
    },

    async editSupplier(id) {
      try {
        this.loading = true;
        const response = await api.patch(
          `/suppliers/patch/update-supplier/${id}`,
          this.supplierData
        );
        const data = response.data;
        if (data.success) {
          window.alert("Proveedor actualizado correctamente");
          this.getAllSuppliers();
        } else {
          window.alert("Error al actualizar el proveedor: " + data.message);
        }
      } catch (error) {
        console.error("Error al guardar el proveedor", error);
        window.alert(
          "Error al guardar el proveedor. Por favor intente nuevamente."
        );
      } finally {
        this.loading = false;
      }
    },
    async getSuppliersNames() {
      this.loading = true
      const response = await api.get(
        `/suppliers/get/all-suppliers-with-select/${this.shopId()}`
      );
      const data = response.data
      if (data.success) {
        this.suppliers = data.suppliers;
      } else {
        window.alert("Error al cargar los proveedores: " + data.message);
      }
    },
    async createSupplier() {
      try {
        this.loading = true;
        const response = await api.post(
          `/suppliers/post/create-supplier`,
          this.supplierData
        );
        const data = response.data;
        if (data.success) {
          window.alert("Proveedor creado correctamente");
          this.getAllSuppliers();
        } else {
          window.alert("Error al crear el proveedor: " + data.message);
        }
      } catch (error) {
        console.log("Error al crear el proveedor", error);
      } finally {
        this.loading = false;
      }
    },

    async getAllSuppliers() {
      try {
        this.loading = true;
        const response = await api.get(
          `/suppliers/get/all-suppliers/${this.shopId()}?page=${
            this.pagination.page
          }&limit=${this.pagination.limit}`
        );
        const data = response.data;
        if (data.success) {
          this.suppliers = data.suppliers;
          this.pagination.total = data.pagination.total;
          this.pagination.totalPages = data.pagination.totalPages;
          this.pagination.page = data.pagination.page;
          this.pagination.limit = data.pagination.limit;
        }
      } catch (error) {
        console.log(error);
        window.alert(
          "Error al cargar los proveedores. Por favor recargue la página."
        );
      } finally {
        this.loading = false;
      }
    },

    async deleteSupplier(id) {
      try {
        this.loading = true;
        const response = await api.delete(
          `/suppliers/delete/delete-supplier/${id}`
        );
        const data = response.data;
        if (data.success) {
          window.alert("Proveedor eliminado correctamente");
          // Si estamos en la última página y no quedan elementos, ir a la página anterior
          if (this.suppliers.length === 1 && this.pagination.page > 1) {
            this.pagination.page--;
          }
          this.getAllSuppliers();
        } else {
          window.alert("Error al eliminar el proveedor: " + data.message);
        }
      } catch (error) {
        console.log("Error al eliminar: ", error);
        window.alert(
          "Error al eliminar el proveedor. Por favor intente nuevamente."
        );
      } finally {
        this.loading = false;
      }
    },
    async searchByName() {
      try {
        this.loading = true;
        const response = await api.get(
          `/suppliers/get/search-supplier/by-name?name=${
            this.searchQuery
          }&shopId=${this.shopId()}`
        );
        const data = response.data;
        if (data.success) {
          this.suppliers = data.suppliers;
        } else {
          window.alert("No se encontraron proveedores con ese nombre.");
        }
      } catch (error) {
        console.log("Error al buscar proveedores por nombre", error);
      } finally {
        this.loading = false;
      }
    },
    async checkInput() {
      if (this.searchQuery === "") {
        await this.getAllSuppliers();
      }
    },

    // Métodos de paginación
    async previousPage() {
      if (this.pagination.page > 1) {
        this.pagination.page--;
        await this.getAllSuppliers();
      }
    },

    async nextPage() {
      if (this.pagination.page < this.pagination.totalPages) {
        this.pagination.page++;
        await this.getAllSuppliers();
      }
    },

    async goToPage(page) {
      if (
        page >= 1 &&
        page <= this.pagination.totalPages &&
        page !== this.pagination.page
      ) {
        this.pagination.page = page;
        await this.getAllSuppliers();
      }
    },

    async changeLimit(newLimit) {
      this.pagination.limit = newLimit;
      this.pagination.page = 1; // Resetear a la primera página
      await this.getAllSuppliers();
    },

    // Método para limpiar filtros (si se implementa filtrado)
    async clearFilters() {
      this.pagination.page = 1;
      await this.getAllSuppliers();
    },
  },
});
