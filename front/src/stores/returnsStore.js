import { defineStore } from "pinia";
import numeral from "numeral";
import api from "@/config/axios.config";
import { useGlobalStore } from "./globalStore";

export const useReturnsStore = defineStore("returns", {
  state: () => ({
    loading: false,
    selectedSale: null,
    returnType: "FULL_RETURN", // FULL_RETURN, PARTIAL_RETURN, EXCHANGE
    refundType: "CASH", // CASH, CREDIT, ACCOUNT_ADJUSTMENT
    reason: "",
    notes: "",
    processedBy: "",

    // Para devoluciones parciales y cambios
    selectedProductsToReturn: [],
    newProductsForExchange: [],

    // Productos disponibles para búsqueda en cambios
    searchQuery: "",
    searchResults: [],

    // Cálculos
    returnedAmount: 0,
    newAmount: 0,
    balanceDifference: 0,

    // Toast notifications
    showToast: false,
    toastMessage: "",
    toastState: "success",

    globalStore: useGlobalStore(),
  }),

  getters: {
    canProcessReturn: (state) => {
      if (!state.selectedSale || !state.reason || !state.processedBy)
        return false;

      if (
        state.returnType === "PARTIAL_RETURN" &&
        state.selectedProductsToReturn.length === 0
      ) {
        return false;
      }

      if (state.returnType === "EXCHANGE") {
        return (
          state.selectedProductsToReturn.length > 0 &&
          state.newProductsForExchange.length > 0
        );
      }

      return true;
    },

    totalReturnAmount: (state) => {
      return state.selectedProductsToReturn.reduce((total, product) => {
        return total + product.unitPrice * product.quantity;
      }, 0);
    },

    totalNewAmount: (state) => {
      return state.newProductsForExchange.reduce((total, product) => {
        return total + product.unitPrice * product.quantity;
      }, 0);
    },

    calculatedBalanceDifference: (state) => {
      let returnAmount = 0;
      
      if (state.returnType === 'FULL_RETURN' && state.selectedSale) {
        returnAmount = state.selectedSale.total || 0;
      } else {
        returnAmount = state.totalReturnAmount;
      }
      
      if (state.returnType === 'EXCHANGE') {
        return returnAmount - state.totalNewAmount;
      }
      
      return returnAmount;
    },
    
    // Total para devolución completa (usar el total de la venta)
    fullReturnAmount: (state) => {
      if (state.returnType === 'FULL_RETURN' && state.selectedSale) {
        return state.selectedSale.total || 0;
      }
      return 0;
    }
  },

  actions: {
    // Establecer venta seleccionada para devolución
    setSaleForReturn(sale) {
      this.selectedSale = sale;
      this.resetReturnState();
    },

    // Resetear estado de devolución
    resetReturnState() {
      this.returnType = "FULL_RETURN";
      this.refundType = "CASH";
      this.reason = "";
      this.notes = "";
      this.selectedProductsToReturn = [];
      this.newProductsForExchange = [];
      this.searchQuery = "";
      this.searchResults = [];
      this.returnedAmount = 0;
      this.newAmount = 0;
      this.balanceDifference = 0;
      this.hideToast();
    },

    // Toast actions
    showSuccessToast(message) {
      this.toastMessage = message;
      this.toastState = "success";
      this.showToast = true;
    },

    hideToast() {
      this.showToast = false;
      this.toastMessage = "";
    },

    // Resetear solo los productos seleccionados (para cambio de tipo)
    resetSelectedProducts() {
      this.selectedProductsToReturn = [];
      this.newProductsForExchange = [];
      this.searchQuery = "";
      this.searchResults = [];
      this.returnedAmount = 0;
      this.newAmount = 0;
      this.balanceDifference = 0;
    },

    // Procesar devolución completa
    async processFullReturn() {
      this.loading = true;
      try {
        const response = await api.post("/returns/process/full-return", {
          saleId: this.selectedSale._id,
          refundType: this.refundType,
          reason: this.reason,
          processedBy: this.processedBy,
          notes: this.notes,
        });

        if (response.data.success) {
          this.showSuccessToast("Devolución completa procesada correctamente");
          return response.data;
        }
      } catch (error) {
        console.error("Error processing full return:", error);
        this.globalStore.showToast(
          error.response?.data?.message || "Error al procesar la devolución",
          "error"
        );
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Procesar devolución parcial
    async processPartialReturn() {
      this.loading = true;
      try {
        const response = await api.post("/returns/process/partial-return", {
          saleId: this.selectedSale._id,
          productsToReturn: this.selectedProductsToReturn,
          refundType: this.refundType,
          reason: this.reason,
          processedBy: this.processedBy,
          notes: this.notes,
        });

        if (response.data.success) {
          this.showSuccessToast("Devolución parcial procesada correctamente");
          return response.data;
        }
      } catch (error) {
        console.error("Error processing partial return:", error);
        this.globalStore.showToast(
          error.response?.data?.message ||
            "Error al procesar la devolución parcial",
          "error"
        );
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Procesar cambio de productos
    async processExchange() {
      this.loading = true;
      try {
        const response = await api.post("/returns/process/exchange", {
          saleId: this.selectedSale._id,
          productsToReturn: this.selectedProductsToReturn,
          newProducts: this.newProductsForExchange,
          reason: this.reason,
          processedBy: this.processedBy,
          cashier: localStorage.getItem("userName") || this.processedBy,
          notes: this.notes,
        });

        if (response.data.success) {
          this.showSuccessToast("Cambio procesado correctamente");
          return response.data;
        }
      } catch (error) {
        console.error("Error processing exchange:", error);
        this.globalStore.showToast(
          error.response?.data?.message || "Error al procesar el cambio",
          "error"
        );
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Buscar productos para cambio
    async searchProducts() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }

      console.log('Searching products with query:', this.searchQuery);
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId()
        if (!shopId) {
          console.error('No shopId found in localStorage');
          this.searchResults = [];
          return;
        }

        const url = `/products/get/get-products/${shopId}?search=${encodeURIComponent(this.searchQuery)}`;
        console.log('Making request to:', url);
        
        const response = await api.get(url);

        console.log('Search response:', response.data);
        
        if (response.data.success) {
          // El backend devuelve 'products' o 'data' dependiendo del endpoint
          const products = response.data.products || response.data.data || [];
          console.log('Found products:', products.length);
          
          // Filtrar productos que tengan stock disponible
          this.searchResults = products.filter(
            (product) => product.quantity > 0 && product.sellPrice > 0
          );
          
          console.log('Filtered products with stock:', this.searchResults.length);
        } else {
          console.log('Search was not successful:', response.data);
        }
      } catch (error) {
        console.error("Error searching products:", error);
        this.searchResults = [];
      } finally {
        this.loading = false;
      }
    },

    // Agregar producto a devolver (devolución parcial)
    addProductToReturn(product) {
      const existingIndex = this.selectedProductsToReturn.findIndex(
        (p) => p.productId.toString() === product.productId.toString()
      );

      if (existingIndex === -1) {
        this.selectedProductsToReturn.push({
          ...product,
          quantity: 1,
          maxQuantity: product.quantity,
        });
      }
    },

    // Remover producto de devolución
    removeProductFromReturn(index) {
      this.selectedProductsToReturn.splice(index, 1);
    },

    // Agregar producto nuevo para cambio
    addNewProductForExchange(product) {
      const existingIndex = this.newProductsForExchange.findIndex(
        (p) => p.productId.toString() === product._id.toString()
      );

      if (existingIndex === -1) {
        this.newProductsForExchange.push({
          productId: product._id,
          quantity: 1,
          unitPrice: product.sellPrice,
          maxQuantity: product.quantity,
          name: product.name,
          variants: [],
        });
      } else {
        // Incrementar cantidad si ya existe
        const item = this.newProductsForExchange[existingIndex];
        if (item.quantity < item.maxQuantity) {
          item.quantity++;
        }
      }
    },

    // Remover producto nuevo de cambio
    removeNewProductFromExchange(index) {
      this.newProductsForExchange.splice(index, 1);
    },

    // Actualizar cantidad de producto a devolver
    updateReturnProductQuantity(index, quantity) {
      if (this.selectedProductsToReturn[index]) {
        const maxQuantity = this.selectedProductsToReturn[index].maxQuantity;
        this.selectedProductsToReturn[index].quantity = Math.min(
          Math.max(1, quantity),
          maxQuantity
        );
      }
    },

    // Actualizar cantidad de producto nuevo
    updateNewProductQuantity(index, quantity) {
      if (this.newProductsForExchange[index]) {
        const maxQuantity = this.newProductsForExchange[index].maxQuantity;
        this.newProductsForExchange[index].quantity = Math.min(
          Math.max(1, quantity),
          maxQuantity
        );
      }
    },

    // Obtener historial de devoluciones por venta
    async getReturnsBySale(saleId) {
      this.loading = true;
      try {
        const response = await api.get(`/returns/get/by-sale/${saleId}`);

        if (response.data.success) {
          return response.data.data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching returns by sale:", error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    // Obtener historial de devoluciones por tienda
    async getReturnsByShop(shopId, page = 1, limit = 10) {
      this.loading = true;
      try {
        const response = await api.get(
          `/returns/get/by-shop/${shopId}?page=${page}&limit=${limit}`
        );

        if (response.data.success) {
          return response.data;
        }
        return { data: [], pagination: {} };
      } catch (error) {
        console.error("Error fetching returns by shop:", error);
        return { data: [], pagination: {} };
      } finally {
        this.loading = false;
      }
    },

    // Formatear precio
    formatPrice(value) {
      return numeral(value).format("$0,0.00");
    },

    // Formatear fecha
    formatDate(date) {
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
});
