import api from "@/config/axios.config";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

export const useStockStore = defineStore("stock", {
  state: () => {
    return {
      products: [],
      product: {},
      productId: null,
      loading: false,
      searchQuery: "",
      typeOfQuery: "",
      pagination: {
        total: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
      },
      toast: {
        showing: false,
        message: "",
        state: "",
      },
      actionSelected: "",
      searchNameApplied: false,
      // Estados para eliminación masiva
      bulkDeleteMode: false,
      selectedProductIds: [],
      showBulkDeleteModal: false,

      filtersObject: {
        supplierSearchQuery: "",
        categorySearchQuery: "",
        filtersApplied: false,
        showFilters: false,
        filters: {
          code: "",
          supplierId: "",
          categoryId: "",
          minPrice: "",
          maxPrice: "",
          minBuyPrice: "",
          maxBuyPrice: "",
          minStock: "",
          maxStock: "",
          expirationFrom: "",
          expirationTo: "",
          createdFrom: "",
          createdTo: "",
          location: "",
          stockLevel: "",
          sortBy: "",
          sortOrder: "",
        },
        selectedSupplier: false,
        selectedCategory: false,
      },
      suppliers: [],
      categories: [],
      stockValue: null,
    };
  },
  actions: {
    shopId() {
      const user_info = Cookies.get("user_info");
      const parsedUserInfo = user_info ? JSON.parse(user_info) : null;
      return parsedUserInfo ? parsedUserInfo.shopId : null;
    },

    async fetchProducts(page = 1, limit = 10) {
      try {
        this.loading = true;
        const shopId = this.shopId();
        this.filtersObject.filtersApplied = false;

        // Construir URL con parámetros de paginación
        const response = await api.get(
          `/products/get/get-products/${shopId}?page=${page}&limit=${limit}`
        );

        const data = response.data;
        console.log("data", data);

        if (data.success) {
          this.products = data.products;
          console.log("Products fetched successfully:", this.products);

          this.pagination.total = data.pagination.total;
          this.pagination.limit = data.pagination.limit;
          this.pagination.page = data.pagination.page;
          this.pagination.totalPages = data.pagination.totalPages;
        }
      } catch (error) {
        console.log("Error fetching products:", error);
      } finally {
        this.loading = false;
      }
    },

    async searchProduct() {
      try {
        this.loading = true;
        this.filtersObject.filtersApplied = false;
        if (!this.searchQuery || this.searchQuery.trim() === "") {
          this.toast = {
            showing: true,
            message: "Debes ingresar un valor para buscar.",
            state: "information",
          };
          return;
        }

        const shopId = this.shopId();
        const response = await api.get(
          `/products/get/get-products/${shopId}?search=${encodeURIComponent(this.searchQuery.trim())}&page=${this.pagination.page}&limit=${this.pagination.limit}`
        );
        this.searchNameApplied = true;
        const data = response.data;
        if (data.success) {
          this.products = data.products;
          this.pagination.total = data.pagination.total;
          this.pagination.limit = data.pagination.limit;
          this.pagination.page = data.pagination.page;
          this.pagination.totalPages = data.pagination.totalPages;
        } else {
          this.toast = {
            showing: true,
            message: data.message || "No se encontraron productos",
            state: "information",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async filterProducts() {
      this.loading = true;
      this.filtersObject.filtersApplied = true;
      try {
        const shopId = this.shopId();
        const urlParams = new URLSearchParams();

        if (this.filtersObject.filters.categoryId) {
          urlParams.append("categoryId", this.filtersObject.filters.categoryId);
        }

        if (this.filtersObject.filters.supplierId) {
          urlParams.append("supplierId", this.filtersObject.filters.supplierId);
        }
        if (this.filtersObject.filters.code) {
          urlParams.append("code", this.filtersObject.filters.code);
        }
        if (this.filtersObject.filters.minPrice) {
          urlParams.append("minAmount", this.filtersObject.filters.minPrice);
        }
        if (this.filtersObject.filters.maxPrice) {
          urlParams.append("maxAmount", this.filtersObject.filters.maxPrice);
        }
        if (this.filtersObject.filters.minStock) {
          urlParams.append("minStock", this.filtersObject.filters.minStock);
        }
        if (this.filtersObject.filters.maxStock) {
          urlParams.append("maxStock", this.filtersObject.filters.maxStock);
        }
        if (this.filtersObject.filters.expirationFrom) {
          urlParams.append("expirationFrom", this.filtersObject.filters.expirationFrom);
        }
        if (this.filtersObject.filters.expirationTo) {
          urlParams.append("expirationTo", this.filtersObject.filters.expirationTo);
        }
        if (this.filtersObject.filters.minBuyPrice) {
          urlParams.append("minBuyPrice", this.filtersObject.filters.minBuyPrice);
        }
        if (this.filtersObject.filters.maxBuyPrice) {
          urlParams.append("maxBuyPrice", this.filtersObject.filters.maxBuyPrice);
        }
        if (this.filtersObject.filters.createdFrom) {
          urlParams.append("createdFrom", this.filtersObject.filters.createdFrom);
        }
        if (this.filtersObject.filters.createdTo) {
          urlParams.append("createdTo", this.filtersObject.filters.createdTo);
        }
        if (this.filtersObject.filters.location) {
          urlParams.append("location", this.filtersObject.filters.location);
        }
        if (this.filtersObject.filters.stockLevel) {
          urlParams.append("stockLevel", this.filtersObject.filters.stockLevel);
        }
        if (this.filtersObject.filters.sortBy) {
          urlParams.append("sortBy", this.filtersObject.filters.sortBy);
        }
        if (this.filtersObject.filters.sortOrder) {
          urlParams.append("sortOrder", this.filtersObject.filters.sortOrder);
        }

        const response = await api.get(
          `/products/get/filter-products?page=${this.pagination.page}&limit=${
            this.pagination.limit
          }&shopId=${shopId}&${urlParams.toString()}`
        );
        const data = response.data;
        if (data.success) {
          this.products = data.data;
          this.pagination.total = data.pagination.total;
          this.pagination.limit = data.pagination.limit;
          this.pagination.page = data.pagination.page;
          this.pagination.totalPages = data.pagination.totalPages;
        } else {
          console.log("no se encontraron");

          this.toast = {
            showing: true,
            message: "No se encontraron productos con los filtros aplicados",
            state: "information",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
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
    async searchCategories() {
      this.loading = true;
      try {
        const shopId = this.shopId();

        const response = await api.get(
          `/categories/get/search-categories-by-name?page=${this.pagination.page}&limit=${this.pagination.limit}&name=${this.filtersObject.categorySearchQuery}&shopId=${shopId}`
        );
        const data = response.data;

        if (data.success) {
          this.categories = data.categories;
        } else {
          this.categories = [];
          this.toast = {
            showing: true,
            message: "No se encontraron categorias",
            state: "information",
          };
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    selectSupplier(supplier) {
      this.filtersObject.filters.supplierId = supplier._id;
      this.filtersObject.supplierSearchQuery = supplier.name;
      this.filtersObject.selectedSupplier = true;
    },
    selectCategory(category) {
      this.filtersObject.filters.categoryId = category._id;
      this.filtersObject.categorySearchQuery = category.name;
      this.filtersObject.selectedCategory = true;
    },
    async clearFilters() {
      this.searchQuery = "";
      this.typeOfQuery = "";
      this.filtersObject.supplierSearchQuery = "";
      this.filtersObject.categorySearchQuery = "";
      this.filtersObject.filtersApplied = false;
      this.searchNameApplied = false;
      this.filtersObject.filters = {
        code: "",
        supplierId: "",
        categoryId: "",
        minPrice: "",
        maxPrice: "",
        minBuyPrice: "",
        maxBuyPrice: "",
        minStock: "",
        maxStock: "",
        expirationFrom: "",
        expirationTo: "",
        createdFrom: "",
        createdTo: "",
        location: "",
        stockLevel: "",
        sortBy: "",
        sortOrder: "",
      };
      await this.loadData();
    },

    selectAction() {
      console.log("Action selected:", this.actionSelected);
    },

    toggleBulkDeleteMode() {
      this.bulkDeleteMode = !this.bulkDeleteMode;
      if (!this.bulkDeleteMode) {
        this.selectedProductIds = [];
        this.showBulkDeleteModal = false;
      }
    },

    // Seleccionar todos los productos
    selectAllProducts() {
      if (this.allProductsSelected) {
        this.selectedProductIds = [];
      } else {
        this.selectedProductIds = this.products.map((product) => product._id);
      }
    },

    // Seleccionar/deseleccionar un producto individual
    toggleProductSelection(productId) {
      const index = this.selectedProductIds.indexOf(productId);
      if (index > -1) {
        this.selectedProductIds.splice(index, 1);
      } else {
        this.selectedProductIds.push(productId);
      }
    },

    // Cancelar eliminación masiva
    cancelBulkDelete() {
      this.bulkDeleteMode = false;
      this.selectedProductIds = [];
      this.showBulkDeleteModal = false;
    },

    // Mostrar modal de confirmación
    showBulkDeleteConfirmation() {
      if (this.selectedProductIds.length === 0) {
        this.toast = {
          showing: true,
          message: "Por favor selecciona al menos un producto para eliminar.",
          state: "danger",
        };
        return;
      }
      this.showBulkDeleteModal = true;
    },

    // Ocultar modal de confirmación
    hideBulkDeleteModal() {
      this.showBulkDeleteModal = false;
    },

    // Ejecutar eliminación masiva
    async executeBulkDelete() {
      try {
        const result = await this.deleteBulkProducts([
          ...this.selectedProductIds,
        ]);

        if (result.success) {
          // Resetear estado
          this.showBulkDeleteModal = false;
          this.bulkDeleteMode = false;
          this.selectedProductIds = [];

          // Recargar productos
          await this.loadData();

          return result;
        }
      } catch (error) {
        console.error("Error al ejecutar eliminación masiva:", error);
        throw error;
      }
    },

    clearSelections() {
      if (this.bulkDeleteMode) {
        this.selectedProductIds = [];
      }
      if (this.filtersObject.selectedSupplier) {
        this.filtersObject.filters.supplierId = null;
        this.filtersObject.supplierSearchQuery = "";
        this.suppliers = [];
        this.filtersObject.selectedSupplier = false;
      }

      if (this.filtersObject.selectedCategory) {
        this.filtersObject.filters.categoryId = null;
        this.filtersObject.categorySearchQuery = "";
        this.categories = [];
        this.filtersObject.selectedCategory = false;
      }
    },

    async deleteBulkProducts(productIds) {
      try {
        this.loading = true;

        // Realizar la petición al backend
        const response = await api.delete(
          `/products/delete/delete-multiple-products`,
          {
            data: {
              productIds: productIds,
            },
          }
        );

        const data = response.data;

        if (data.success) {
          this.toast = {
            showing: true,
            message:
              data.message ||
              `${productIds.length} producto(s) eliminado(s) exitosamente`,
            state: "success",
          };
          return {
            success: true,
            deletedCount: productIds.length,
            message:
              data.message ||
              `${productIds.length} producto(s) eliminado(s) exitosamente`,
          };
        } else {
          this.toast = {
            showing: true,
            message: data.message || "Error al eliminar productos",
            state: "danger",
          };
          throw new Error(data.message || "Error al eliminar productos");
        }
      } catch (error) {
        // Manejar diferentes tipos de errores
        let errorMessage = "Error al eliminar los productos";

        if (error.response) {
          // Error de respuesta del servidor
          errorMessage = error.response.data?.message || errorMessage;
        } else if (error.request) {
          // Error de red
          errorMessage = "Error de conexión. Verifica tu conexión a internet.";
        }

        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    // Métodos de navegación de paginación
    async goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        await this.fetchProducts(page, this.pagination.limit);
      }
    },

    async loadData() {
      if (this.searchNameApplied) {
        await this.searchProduct();
      } else if (this.filtersObject.filtersApplied) {
        await this.filterProducts();
      } else {
        await this.fetchProducts(this.pagination.page, this.pagination.limit);
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
      this.pagination.page = 1; // Reiniciar a la primera página al cambiar el límite
      await this.loadData();
    },

    async fetchStockValue() {
      try {
        const shopId = this.shopId();
        const response = await api.get(`/products/get/stock-value/${shopId}`);
        const data = response.data;
        if (data.success) {
          this.stockValue = data.data || data;
        }
      } catch (error) {
        console.log("Error fetching stock value:", error);
      }
    },
  },

  getters: {
    // Páginas visibles para la paginación
    visiblePages() {
      const current = this.pagination.page;
      const total = this.pagination.totalPages;
      const pages = [];

      // Mostrar páginas alrededor de la página actual
      const start = Math.max(1, current - 1);
      const end = Math.min(total, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },

    // Información de elementos mostrados
    itemsInfo() {
      const start = (this.pagination.page - 1) * this.pagination.limit + 1;
      const end = Math.min(
        this.pagination.page * this.pagination.limit,
        this.pagination.total
      );
      return `${start}-${end} de ${this.pagination.total}`;
    },

    // === GETTERS PARA ELIMINACIÓN MASIVA ===

    // Verificar si todos los productos están seleccionados
    allProductsSelected() {
      return (
        this.products.length > 0 &&
        this.selectedProductIds.length === this.products.length
      );
    },

    // Obtener productos seleccionados
    selectedProducts() {
      return this.products.filter((product) =>
        this.selectedProductIds.includes(product._id)
      );
    },

    // Obtener nombres de productos seleccionados
    selectedProductNames() {
      return this.selectedProducts.map((product) => product.name);
    },

    // Verificar si un producto está seleccionado
    isProductSelected() {
      return (productId) => this.selectedProductIds.includes(productId);
    },

    // Contar productos seleccionados
    selectedProductsCount() {
      return this.selectedProductIds.length;
    },

    // Verificar si hay productos seleccionados
    hasSelectedProducts() {
      return this.selectedProductIds.length > 0;
    },
  },
});
