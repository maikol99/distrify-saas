// stores/pedidosStore.js
import { defineStore } from "pinia"
import moment from "moment"
import numeral from "numeral"
import api from "@/config/axios.config" // Assuming this path is correct
import { useGlobalStore } from "./globalStore" // Assuming this path is correct

export const usePedidosStore = defineStore("ordersList", {
  state: () => ({
    pedidos: [],
    selectedPedido: null,
    loading: false,
    page: 1,
    limit: 10,
    totalPedidos: 0,
    totalPages: 0,
    clientSearchResults: [],
    selectedClient: null,
    filters: {
      startDate: null,
      endDate: null,
      deliveryType: null,
      status: null,
      paymentStatus: null,
      paymentType: null
    },
    filtersApplied: false,
    globalStore: useGlobalStore(),
  }),
  actions: {
    async fetchPedidos(shopId) {
      this.loading = true
      try {
        const response = await api.get(
          `/orders/get/business-orders?shopId=${shopId}&page=${this.page}&limit=${this.limit}`,
        )
        if (response.data.success) {
          this.pedidos = response.data.pedidos // Changed from response.data.data
          this.totalPedidos = response.data.pagination.total // Changed from totalSales
          this.totalPages = response.data.pagination.totalPages
          this.page = response.data.pagination.page
          this.limit = response.data.pagination.limit
        }
      } catch (error) {
        console.error("Error fetching pedidos:", error)
      } finally {
        this.loading = false
      }
    },
    async fetchPedidoDetails(pedidoId) {
      this.loading = true
      try {
        const response = await api.get(`/orders/get/get-by-id/${pedidoId}`)
        const data = response.data
        console.log('data', data);
        if (data.success) {
          this.selectedPedido = data.pedido // Changed from data.data
        } else {
          console.error("Error fetching pedido details:", data.message)
        }
      } catch (error) {
        console.error("Error fetching pedido details:", error)
      } finally {
        this.loading = false
      }
    },

    async updatePedido(pedidoId, updates) {
      this.loading = true
      try {
        // Fetch the full pedido details if not already selected or if it's a different pedido
        let pedidoToUpdate = this.selectedPedido;
        if (!pedidoToUpdate || pedidoToUpdate._id !== pedidoId) {
          await this.fetchPedidoDetails(pedidoId);
          pedidoToUpdate = this.selectedPedido;
        }

        if (!pedidoToUpdate) {
          console.error("Pedido no encontrado para actualizar:", pedidoId);
          alert("Error: Pedido no encontrado para actualizar.");
          return false;
        }

        // Check if status is being changed to "Finalizado"
        if (updates.status === "Finalizado" && pedidoToUpdate.status !== "Finalizado") {
          console.log("Estado cambiado a Finalizado. Intentando crear venta...");
          const saleCreated = await this.createSaleFromPedido(pedidoToUpdate);
          if (!saleCreated) {
            alert("Error al crear la venta. El estado del pedido no se actualizará a Finalizado.");
            return false; // Prevent updating order status if sale creation fails
          }
          alert("Venta creada exitosamente.");
        }

        const response = await api.put(`/orders/update/${pedidoId}`, updates)
        if (response.data.success) {
          // Update the specific pedido in the local state if it's in the current list
          const index = this.pedidos.findIndex(p => p._id === pedidoId)
          if (index !== -1) {
            // Use Object.assign to merge updates into the existing object for reactivity
            Object.assign(this.pedidos[index], updates)
          }
          // If the modal is open for this pedido, update it too
          if (this.selectedPedido && this.selectedPedido._id === pedidoId) {
            Object.assign(this.selectedPedido, updates)
          }
          return true
        }
        return false
      } catch (error) {
        console.error("Error updating pedido:", error)
        alert("Error al actualizar el pedido: " + (error.response?.data?.message || error.message))
        return false
      } finally {
        this.loading = false
      }
    },
    async createSaleFromPedido(pedido) {
      try {
        const globalStore = useGlobalStore();
        const saleData = {
          shopId: globalStore.shopId(),
          productDetails: pedido.productDetails.map(item => ({
            productId: item.productId._id, // Assuming productId is an object with _id
            quantity: item.quantity,
            variants: item.variants || [], // Ensure variants are included if they exist
          })),
          subtotal: pedido.subtotal,
          iva: pedido.iva,
          total: pedido.total,
          // Assuming globalStore has user info, otherwise use a placeholder
          cashier: globalStore.user?.name || globalStore.user?.username || "System",
          paymentMethod: pedido.paymentType === 'Presencial' ? 'Efectivo' : 'Transferencia',
          discount: pedido.discount,
          surcharge: pedido.surcharge,
          // Optionally link the sale to the original order
          orderId: pedido._id,
        };

        console.log("Enviando datos de venta:", saleData);
        const response = await api.post("/sales/post/create-sale", saleData);

        if (response.data.success) {
          console.log("Venta creada exitosamente:", response.data.sale);
          return true;
        } else {
          console.error("Fallo al crear la venta:", response.data.message);
          return false;
        }
      } catch (error) {
        console.error("Error al crear la venta:", error);
        alert("Error al crear la venta: " + (error.response?.data?.message || error.message));
        return false;
      }
    },
    async cancelPedido(pedidoId) {
      // Reuse the generic updatePedido action to set status to 'Cancelado'
      const success = await this.updatePedido(pedidoId, { status: "Cancelado" })
      if (success) {
        alert("Pedido anulado")
        this.clearSelectedPedido()
      }
      return success
    },
    async fetchUserProhibitedRoutes(userId) {
      try {
        const response = await api.get(`/auth/${userId}`)
        return response.data.routesProhibited || []
      } catch (error) {
        console.error("Error fetching user routes allowed:", error)
        return []
      }
    },

    async loadData() {
      if (!this.filtersApplied) {
        await this.fetchPedidos(this.globalStore.shopId())
      } else {
        await this.getFilteredPedidos()
      }
    },
    async getFilteredPedidos() {
      this.loading = true
      try {
        const shopId = this.globalStore.shopId()
        const params = new URLSearchParams({
          page: this.page,
          limit: this.limit,
        })

        if (this.filters.startDate && this.filters.endDate) {
          params.append('startDate', this.filters.startDate)
          params.append('endDate', this.filters.endDate)
        }

        if (this.filters.deliveryType) {
          params.append('deliveryType', this.filters.deliveryType)
        }

        if (this.filters.status) {
          params.append('status', this.filters.status)
        }

        if (this.filters.paymentStatus) {
          params.append('paymentStatus', this.filters.paymentStatus)
        }

        if (this.filters.paymentType) {
          params.append('paymentType', this.filters.paymentType)
        }

        const response = await api.get(
          `/orders/get/filter-pedidos?shopId=${shopId}&${params.toString()}`,
        )
        const data = response.data
        if (data.success) {
          this.pedidos = data.pedidos // Changed from data.data
          this.totalPedidos = data.pagination.total // Changed from totalSales
          this.totalPages = data.pagination.totalPages
          this.page = data.pagination.page
          this.limit = data.pagination.limit
          this.filtersApplied = true
        } else {
          alert("Error al obtener pedidos filtrados: " + data.message)
          this.pedidos = []
          this.totalPedidos = 0
          this.totalPages = 0
          this.page = 1
          this.limit = 10 // Reset to default limit
        }
      } catch (error) {
        console.error("Error fetching filtered pedidos:", error)
        alert("Error al obtener pedidos filtrados. Por favor, intente de nuevo.")
        this.pedidos = []
        this.totalPedidos = 0
        this.totalPages = 0
        this.page = 1
        this.limit = 10 // Reset to default limit
      } finally {
        this.loading = false
      }
    },
    selectClient(client) {
      this.selectedClient = client
      this.clientSearchResults = []
    },
    clearSelectedClient() {
      this.selectedClient = null
      this.clientSearchResults = []
    },
    async searchClients(shopId, query) {
      if (!query) {
        this.clientSearchResults = []
        return
      }
      try {
        const response = await api.get(`/clients/get/search-client?shopId=${shopId}&query=${query}`)
        if (response.data.success) {
          this.clientSearchResults = response.data.data
        } else {
          this.clientSearchResults = []
        }
      } catch (error) {
        console.error("Error searching clients:", error)
        this.clientSearchResults = []
      }
    },
    formatPrice(price) {
      return numeral(price).format("$0.00")
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY HH:mm")
    },
    clearSelectedPedido() {
      this.selectedPedido = null
    },
  },
})