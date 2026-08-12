import { defineStore } from "pinia";
import moment from "moment";
import numeral from "numeral";
import api from "@/config/axios.config";
import { useGlobalStore } from "./globalStore";
import { useTicket } from "@/composables/useTicket";
import jsPDF from "jspdf";

export const useSalesListStore = defineStore("salesList", {
  state: () => ({
    sales: [],
    selectedSale: null,
    loading: false,
    page: 1,
    limit: 10, // Considera aumentar este límite para producción
    totalSales: 0,
    totalPages: 0,
    cashierSearchResults: [],
    clientSearchResults: [],
    selectedCashier: null,
    selectedClient: null,
    filters: {
      startDate: null,
      endDate: null,
      paymentMethod: "",
      cashier: null, // Se usará para el filtro de cajero por nombre
      clientId: null, // Se usará para el filtro de cliente por ID
      status: "",
      minAmount: null,
      maxAmount: null,
      productId: "",
      hasDiscount: "",
      saleId: "",
    },
    filtersApplied: false,
    globalStore: useGlobalStore(),
  }),
  actions: {
    async fetchSales(shopId) {
      this.loading = true;
      try {
        const response = await api.get(
          `/sales/get/get-sales/${shopId}?page=${this.page}&limit=${this.limit}`
        );
        if (response.data.success) {
          this.sales = response.data.data;
          this.totalSales = response.data.pagination.total;
          this.totalPages = response.data.pagination.totalPages;
          this.page = response.data.pagination.page;
          this.limit = response.data.pagination.limit;
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchSaleDetails(saleId) {
      this.loading = true;
      try {
        const response = await api.get(`/sales/get/get-sale/by-id/${saleId}`);
        const data = response.data;
        if (data.success) {
          this.selectedSale = data.data;
        } else {
          console.error("Error fetching sale details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching sale details:", error);
      } finally {
        this.loading = false;
      }
    },
    async cancelSale(saleId) {
      this.loading = true;
      try {
        const response = await api.patch(
          `/sales/patch/cancel-sale?saleId=${saleId}`
        );
        if (response.data.success) {
          return true; // Indicar éxito
        }
        return false;
      } catch (error) {
        console.error("Error canceling sale:", error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    async fetchUserProhibitedRoutes(userId) {
      try {
        const response = await api.get(`/auth/${userId}`);
        return response.data.routesProhibited || [];
      } catch (error) {
        console.error("Error fetching user routes allowed:", error);
        return [];
      }
    },
    // Nuevas acciones para la búsqueda de cajeros
    async searchCashiers(shopId, query) {
      if (!query) {
        this.cashierSearchResults = [];
        return;
      }
      try {
        const response = await api.get(
          `/users/get/search-users?shopId=${shopId}&name=${query}`
        );
        if (response.data.success) {
          this.cashierSearchResults = response.data.users;
        } else {
          this.cashierSearchResults = [];
        }
      } catch (error) {
        console.error("Error searching cashiers:", error);
        this.cashierSearchResults = [];
      }
    },
    async loadData() {
      // Este método ahora usa el estado actual de `this.page` y `this.filters`
      if (!this.filtersApplied) {
        await this.fetchSales(this.globalStore.shopId());
      } else {
        await this.getFilteredSales();
      }
    },
    async getFilteredSales() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        // Construir los parámetros de consulta dinámicamente
        const params = new URLSearchParams({
          page: this.page,
          limit: this.limit,
        });

        if (this.filters.startDate)
          params.append("startDate", this.filters.startDate);
        if (this.filters.endDate)
          params.append("endDate", this.filters.endDate);
        if (this.filters.paymentMethod)
          params.append("paymentMethod", this.filters.paymentMethod);
        if (this.filters.cashier)
          params.append("cashier", this.filters.cashier);
        if (this.filters.clientId)
          params.append("clientId", this.filters.clientId);
        if (this.filters.status) params.append("status", this.filters.status);
        if (this.filters.minAmount) params.append("minAmount", this.filters.minAmount);
        if (this.filters.maxAmount) params.append("maxAmount", this.filters.maxAmount);
        if (this.filters.productId) params.append("productId", this.filters.productId);
        if (this.filters.hasDiscount) params.append("hasDiscount", this.filters.hasDiscount);
        if (this.filters.saleId) params.append("saleId", this.filters.saleId);
        console.log("Fetching filtered sales with params:", params.toString());

        // Usar ruta relativa y objeto de parámetros
        const response = await api.get(
          `/sales/get/sales-with-filter/${shopId}?${params.toString()}`
        );
        const data = response.data;
        if (data.success) {
          this.sales = data.data;
          this.totalSales = data.pagination.total;
          this.totalPages = data.pagination.totalPages;
          this.page = data.pagination.page;
          this.limit = data.pagination.limit;
          this.filtersApplied = true;
        } else {
          alert("Error al obtener ventas filtradas: " + data.message); // Mensaje de alerta para el usuario
          this.sales = [];
          this.totalSales = 0;
          this.totalPages = 0;
          this.page = 1;
          this.limit = 2;
        }
      } catch (error) {
        console.error("Error fetching filtered sales:", error); // Log de error para depuración
        alert(
          "Error al obtener ventas filtradas. Por favor, intente de nuevo."
        ); // Mensaje amigable para el usuario
        this.sales = [];
        this.totalSales = 0;
        this.totalPages = 0;
        this.page = 1;
        this.limit = 2;
      } finally {
        this.loading = false;
      }
    },
    selectCashier(cashier) {
      this.selectedCashier = cashier;
      this.cashierSearchResults = []; // Limpiar resultados después de la selección
    },
    clearSelectedCashier() {
      this.selectedCashier = null;
      this.cashierSearchResults = [];
    },
    // Nuevas acciones para la búsqueda de clientes
    async searchClients(shopId, query) {
      if (!query) {
        this.clientSearchResults = [];
        return;
      }
      try {
        const response = await api.get(
          `/clients/get/search-client?shopId=${shopId}&query=${query}`
        );
        if (response.data.success) {
          this.clientSearchResults = response.data.data;
        } else {
          this.clientSearchResults = [];
        }
      } catch (error) {
        console.error("Error searching clients:", error);
        this.clientSearchResults = [];
      }
    },
    selectClient(client) {
      this.selectedClient = client;
      this.clientSearchResults = []; // Limpiar resultados después de la selección
    },
    clearSelectedClient() {
      this.selectedClient = null;
      this.clientSearchResults = [];
    },
    // Métodos de utilidad
    formatPrice(price) {
      return numeral(price).format("$0.00");
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY HH:mm");
    },
    clearSelectedSale() {
      this.selectedSale = null;
    },
    // Agregar este método al useSalesListStore después del método clearSelectedSale()

    async emitirTicketVenta() {
      if (!this.selectedSale) {
        console.error("No hay venta seleccionada para imprimir");
        return false;
      }

      try {
        const { emitirTicket } = useTicket();
        const sale = this.selectedSale;

        const itemsMapped = (sale.productDetails || []).map((detail) => {
          let name = detail.productName || "Producto";
          if (detail.productId && typeof detail.productId === "object" && detail.productId.name) {
            name = detail.productId.name;
          } else if (typeof detail.productId === "string") {
            name = detail.productId;
          }
          return {
            name,
            quantity: detail.quantity || 1,
            sellPrice: detail.unitPrice || detail.salePrice || 0,
            variants: detail.variants && detail.variants.length > 0 ? detail.variants[0] : null,
          };
        });

        let clientNameStr = "CONSUMIDOR FINAL";
        if (sale.clientId && typeof sale.clientId === "object") {
          clientNameStr = `${sale.clientId.name || ""} ${sale.clientId.lastName || ""}`.trim() || "CONSUMIDOR FINAL";
        } else if (sale.clientName) {
          clientNameStr = sale.clientName;
        }

        return await emitirTicket({
          items: itemsMapped,
          shopData: this.globalStore.shopData,
          ticketType: "Ticket",
          clientName: clientNameStr,
          userName: sale.cashier || this.globalStore.userName(),
          subtotal: sale.subtotal || sale.total || 0,
          total: sale.total || 0,
          tax: sale.iva || 0,
          ivaEnabled: (sale.iva || 0) > 0,
          discountValue: sale.discount || 0,
          surchargeValue: sale.surcharge || 0,
          paymentMethod: sale.paymentMethod || "Efectivo",
          paymentMethods: sale.paymentMethods || [],
          saleNumber: sale._id ? `TK-${sale._id.slice(-8)}` : "",
        });
      } catch (error) {
        console.error("Error al generar el ticket de venta:", error);
        alert("Error al generar el ticket. Por favor, intente nuevamente.");
        return false;
      }
    },
  },
});
