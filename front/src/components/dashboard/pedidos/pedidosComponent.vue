<template>
  <div class="orders-container">
    <div class="data-table-container">
      <!-- Botón para mostrar/ocultar filtros -->
      <div class="filter-toggle-container">
        <button @click="toggleFilters" class="btn-toggle-filters">
          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          {{ showFilters ? "Ocultar Filtros" : "Mostrar Filtros" }}
        </button>
      </div>
      <!-- Contenedor de Filtros -->
      <div v-if="showFilters" class="filters-container">
        <!-- <div class="filter-group search-autocomplete-container">
          <label for="filter-client">Cliente:</label>
          <input
            type="text"
            id="filter-client"
            v-model="clientSearchQuery"
            @input="debouncedClientSearch"
            placeholder="Nombre del cliente"
            class="filter-input"
            :disabled="ordersListStore?.selectedClient !== null"
          />
          <button
            v-if="ordersListStore?.selectedClient"
            @click="clearSelectedClient"
            class="btn-clear-autocomplete"
            title="Limpiar cliente seleccionado"
          >
            <i class="fas fa-times"></i>
          </button>
          <ul
            v-if="
              ordersListStore?.clientSearchResults?.length > 0 &&
              clientSearchQuery?.length > 0 &&
              !ordersListStore?.selectedClient
            "
            class="autocomplete-results-list"
          >
            <li
              v-for="client in ordersListStore.clientSearchResults"
              :key="client?._id || 'unknown'"
              @click="selectClient(client)"
              class="autocomplete-result-item"
            >
              {{ client?.name || "Cliente sin nombre" }} ({{
                client?.address || "Sin dirección"
              }})
            </li>
          </ul>
        </div> -->
        <div class="filter-group">
          <label for="filter-start-date">Fecha inicio:</label>
          <input type="date" id="filter-start-date" v-model="ordersListStore.filters.startDate" class="filter-input" />
        </div>
        <div class="filter-group">
          <label for="filter-end-date">Fecha fin:</label>
          <input type="date" id="filter-end-date" v-model="ordersListStore.filters.endDate" class="filter-input" />
        </div>
        <div class="filter-group">
          <label for="filter-payment-type">Tipo de Pago:</label>
          <select id="filter-payment-type" v-model="ordersListStore.filters.paymentType" class="filter-select">
            <option value="">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Cuenta corriente">Cuenta corriente</option>
            <option value="Mercado Pago">Mercado Pago</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-pedido-state">Estado del Pedido:</label>
          <select id="filter-pedido-state" v-model="ordersListStore.filters.status" class="filter-select">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>


        <div class="filter-group">
          <label for="filter-pedido-state">Estado del pago:</label>
          <select id="filter-pedido-state" v-model="ordersListStore.filters.paymentStatus" class="filter-select">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-pedido-state">Retiro/Delivery:</label>
          <select id="filter-pedido-state" v-model="ordersListStore.filters.deliveryType" class="filter-select">
            <option value="">Todos</option>
            <option value="Retiro">Retiro</option>
            <option value="Delivery">Delivery</option>
          </select>
        </div>


        <div class="filter-actions">
          <button @click="applyFilters" class="btn-primary">
            <i class="fas fa-filter"></i> Filtrar
          </button>
          <button @click="clearFilters" class="btn-secondary">
            <i class="fas fa-times"></i> Limpiar Filtros
          </button>
        </div>
      </div>
      <div class="table-header">
        <h2>Pedidos Realizados</h2>
      </div>
      <div class="table-responsive">
        <table v-if="pedidos?.length > 0" class="orders-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total</th>
              <th>Cliente</th>
              <th>Tipo de Pago</th>
              <th>Tipo de Envio</th>
              <th>Estado</th>
              <th>Estado Pago</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pedido, id) in pedidos" :key="pedido?._id || id" :class="{
              'pedido-canceled': pedido?.status === 'Cancelado',
            }">
              <td>
                {{
                  pedido?.createdAt
                    ? ordersListStore.formatDate(pedido.createdAt)
                    : "Fecha no disponible"
                }}
              </td>
              <td class="text-right">
                {{
                  pedido?.total
                    ? ordersListStore.formatPrice(pedido.total)
                    : "$0.00"
                }}
              </td>
              <td>
                <span v-if="pedido?.client?.name">
                  {{ pedido.client.name }}
                </span>
                <span v-else>Cliente general</span>
              </td>
              <td class="payment-methods-cell">
                <div class="single-payment">
                  <span class="payment-badge single">
                    {{ pedido.paymentType || "No especificado" }}
                  </span>
                </div>
              </td>
              <td>
                {{ pedido.deliveryType || "No especificado" }}
              </td>
              <td>
                {{ pedido.status || "No especificado" }}
              </td>
              <td>
                {{ pedido.paymentStatus || "No especificado" }}
              </td>
              <td class="products-summary">
                <div class="products-count">
                  {{
                    pedido?.productDetails
                      ? getTotalProductsCount(pedido.productDetails)
                      : 0
                  }}
                  productos
                </div>
                <div v-if="
                  pedido?.productDetails && hasVariants(pedido.productDetails)
                " class="variants-indicator">
                  <i class="fas fa-palette"></i> Con variantes
                </div>
              </td>
              <td class="actions-cell">
                <select class="form-control" @change="handleActionChange(pedido, $event)">
                  <option value="">Acciones</option>
                  <option value="detalles">Ver pedido</option>
                  <option value="anular" :disabled="pedido?.status === 'Cancelado'">
                    {{
                      pedido?.status === "Cancelado"
                        ? "Ya anulado"
                        : "Anular"
                    }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>No hay pedidos registrados</p>
        </div>
      </div>
    </div>
    <!-- Controles de Paginación -->
    <div class="pagination-controls" v-if="ordersListStore?.totalPages > 1">
      <button @click="prevPage" :disabled="ordersListStore?.page === 1" class="btn-pagination">
        Anterior
      </button>
      <span>
        Página {{ ordersListStore?.page || 1 }} de
        {{ ordersListStore?.totalPages || 1 }}
      </span>
      <button @click="nextPage" :disabled="ordersListStore?.page === ordersListStore?.totalPages"
        class="btn-pagination">
        Siguiente
      </button>
    </div>
    <!-- Modal de detalles de pedido -->
    <div v-if="ordersListStore?.selectedPedido" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalles del Pedido</h2>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="ordersListStore.selectedPedido?.status === 'Cancelado'" class="canceled-banner">
            <i class="fas fa-ban"></i> PEDIDO ANULADO
          </div>
          <div class="sale-details">
            <div class="detail-section">
              <h3>Información General</h3>
              <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.createdAt
                      ? ordersListStore.formatDate(
                        ordersListStore.selectedPedido.createdAt
                      )
                      : "Fecha no disponible"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Cliente:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.client?.name ||
                    "Cliente general"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Teléfono:</span>
                <span class="detail-value">
                  {{ ordersListStore.selectedPedido?.client?.phone }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">
                  {{ ordersListStore.selectedPedido?.client?.email }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado:</span>

                <select v-model="ordersListStore.selectedPedido.status"
                  @change="updatePedidoField(ordersListStore.selectedPedido._id, 'status', $event.target.value)"
                  class="form-control"
                  :disabled="['Cancelado', 'Finalizado'].includes(ordersListStore.selectedPedido?.status)">
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado Pago:</span>
                <select v-model="ordersListStore.selectedPedido.paymentStatus"
                  @change="updatePedidoField(ordersListStore.selectedPedido._id, 'paymentStatus', $event.target.value)"
                  class="form-control"
                  :disabled="['Cancelado', 'Finalizado'].includes(ordersListStore.selectedPedido?.status)">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Reembolsado">Reembolsado</option>
                </select>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tipo de Entrega:</span>
                <select v-model="ordersListStore.selectedPedido.deliveryType"
                  @change="updatePedidoField(ordersListStore.selectedPedido._id, 'deliveryType', $event.target.value)"
                  class="form-control"
                  :disabled="['Cancelado', 'Finalizado'].includes(ordersListStore.selectedPedido?.status)">
                  <option value="Retiro">Retiro en Tienda</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
              <div v-if="
                ordersListStore.selectedPedido.deliveryType === 'DELIVERY'
              " class="detail-row">
                <span class="detail-label">Dirección:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.client.address ||
                    "No especificado"
                  }}
                </span>
              </div>
              <div v-if="
                ordersListStore.selectedPedido.deliveryType === 'DELIVERY'
              " class="detail-row">
                <span class="detail-label">Ciudad:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.client.city ||
                    "No especificado"
                  }}
                </span>
              </div>
              <div v-if="
                ordersListStore.selectedPedido.deliveryType === 'DELIVERY'
              " class="detail-row">
                <span class="detail-label">Código Postal:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.client.postalCode ||
                    "No especificado"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Lista de precios:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.clientList ||
                    "Precio general"
                  }}
                </span>
              </div>
            </div>
            <div class="detail-section">
              <h3>Resumen Financiero</h3>
              <div class="detail-row">
                <span class="detail-label">Subtotal:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.subtotal
                      ? ordersListStore.formatPrice(
                        ordersListStore.selectedPedido.subtotal
                      )
                      : "$0.00"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">IVA 21%:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.iva
                      ? ordersListStore.formatPrice(
                        ordersListStore.selectedPedido.iva
                      )
                      : "$0.00"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Descuento:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.discount
                      ? ordersListStore.formatPrice(
                        ordersListStore.selectedPedido.discount
                      )
                      : "$0.00"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recargo:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.surcharge
                      ? ordersListStore.formatPrice(
                        ordersListStore.selectedPedido.surcharge
                      )
                      : "$0.00"
                  }}
                </span>
              </div>
              <div class="detail-row total-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.total
                      ? ordersListStore.formatPrice(
                        ordersListStore.selectedPedido.total
                      )
                      : "$0.00"
                  }}
                </span>
              </div>
            </div>
            <div class="detail-section">
              <h3>Tipo de Pago</h3>
              <div class="detail-row">
                <span class="detail-label">Tipo:</span>
                <span class="detail-value">
                  {{
                    ordersListStore.selectedPedido?.paymentType ||
                    "Sin especificar"
                  }}
                </span>
              </div>
            </div>
            <div class="detail-section products-section">
              <h3>Productos del Pedido</h3>
              <div v-if="
                ordersListStore.selectedPedido?.productDetails?.length > 0
              " class="products-list">
                <div v-for="(item, index) in ordersListStore.selectedPedido
                  .productDetails" :key="item?._id || index" class="product-item">
                  <div class="product-name">
                    {{ item?.productId?.name || "Producto sin nombre" }}
                  </div>
                  <!-- Mostrar variantes si existen -->
                  <div v-if="item?.variants?.length > 0" class="product-variants">
                    <h4 class="variants-title">
                      <i class="fas fa-palette"></i> Variantes:
                    </h4>
                    <div class="variants-list">
                      <div v-for="(variant, variantIndex) in item.variants" :key="variantIndex" class="variant-item">
                        <div class="variant-details">
                          <span v-if="variant?.size" class="variant-attribute">
                            <i class="fas fa-ruler"></i> Talle:
                            {{ variant.size }}
                          </span>
                          <span v-if="variant?.color" class="variant-attribute">
                            <i class="fas fa-palette"></i> Color:
                            {{ variant.color }}
                          </span>
                          <span class="variant-quantity">
                            <i class="fas fa-cubes"></i> Cantidad:
                            {{ variant?.quantity || 0 }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="product-details">
                    <div class="product-detail">
                      <span class="detail-label">Cantidad total:</span>
                      <span class="detail-value">{{
                        item?.quantity || 0
                      }}</span>
                    </div>
                    <div class="product-detail">
                      <span class="detail-label">Precio unitario:</span>
                      <span class="detail-value">
                        {{
                          item?.productId?.sellPrice
                            ? ordersListStore.formatPrice(
                              item.productId.sellPrice
                            )
                            : "$0.00"
                        }}
                      </span>
                    </div>
                    <div class="product-detail">
                      <span class="detail-label">Precio total:</span>
                      <span class="detail-value">
                        {{
                          item?.productId?.sellPrice && item?.quantity
                            ? ordersListStore.formatPrice(
                              item.productId.sellPrice * item.quantity
                            )
                            : "$0.00"
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-products">
                <p>No hay productos registrados en este pedido</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="emitirTicket" class="btn-primary">
            <i class="fas fa-print"></i> Imprimir Ticket
          </button>
          <button @click="closeModal" class="btn-secondary">
            <i class="fas fa-times"></i> Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
  <spinnerComponent v-if="ordersListStore?.loading" />
</template>

<script>
import { mapState, mapActions } from "pinia";
import { usePedidosStore } from "@/stores/pedidosStore";
import { useGlobalStore } from "@/stores/globalStore";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue"; // Assuming this path is correct
import jsPDF from "jspdf";

export default {
  components: { spinnerComponent },
  data() {
    return {
      globalStore: useGlobalStore(),
      clientSearchQuery: "",
      showFilters: true,
      clientSearchTimeout: null,
    };
  },
  computed: {
    ...mapState(usePedidosStore, [
      "pedidos",
      "loading",
      "page",
      "limit",
      "totalPedidos",
      "totalPages",
      "clientSearchResults",
      "selectedClient",
    ]),
    ordersListStore() {
      return usePedidosStore();
    },
  },
  methods: {
    ...mapActions(usePedidosStore, [
      "fetchPedidos",
      "fetchPedidoDetails",
      "cancelPedido",
      "updatePedido", // Map the new updatePedido action
      "fetchUserProhibitedRoutes", // Assuming this is still relevant for user permissions
      "clearSelectedPedido",
      "searchClients",
      "selectClient",
      "clearSelectedClient",
    ]),
    getTotalProductsCount(productDetails) {
      return productDetails.reduce((total, item) => total + item.quantity, 0);
    },
    hasVariants(productDetails) {
      return productDetails.some(
        (item) => item.variants && item.variants.length > 0
      );
    },
    async selectPedido(pedidoId) {
      await this.fetchPedidoDetails(pedidoId);
    },
    async handleActionChange(pedido, event) {
      const action = event.target.value;
      const pedidoId = pedido._id;
      switch (action) {
        case "detalles":
          this.selectPedido(pedidoId);
          break;
        case "anular":
          this.handleCancelPedido(pedidoId);
          break;
      }
      event.target.value = "";
    },
    async handleCancelPedido(id) {
      if (window.confirm("¿Estás seguro que deseas anular el pedido?")) {
        const success = await this.cancelPedido(id);
        if (success) {
          // No need to reload all data, the store action updates local state
          // alert("Pedido anulado"); // Alert is now handled in the store action
          // this.clearSelectedPedido(); // Cleared in the store action
        }
      }
    },
    // New method to update a specific field of a pedido
    async updatePedidoField(pedidoId, field, value) {
      // Find the original pedido object in the main list to get its current status
      const currentPedidoInList = this.ordersListStore.pedidos.find(p => p._id === pedidoId);
      const originalStatus = currentPedidoInList ? currentPedidoInList.status : null;

      // Check if the status is being changed to "Finalizado"
      if (field === 'status' && value === 'Finalizado') {
        const confirmSale = window.confirm("El estado del pedido cambiará a 'Finalizado'. ¿Desea concretar la venta asociada a este pedido?");
        if (!confirmSale) {
          if (this.ordersListStore.selectedPedido && this.ordersListStore.selectedPedido._id === pedidoId) {
            this.ordersListStore.selectedPedido.status = originalStatus;
          }
          console.log("Creación de venta cancelada por el usuario.");
          return; // Stop further execution
        } else {

          await this.ordersListStore.createSaleFromPedido(this.ordersListStore.selectedPedido);
        }
      }

      // Proceed with the update if confirmed or if it's not a "Finalizado" status change
      const updates = { [field]: value };
      const success = await this.ordersListStore.updatePedido(pedidoId, updates);

      if (!success) {
        console.error(`Fallo al actualizar pedido ${pedidoId}: ${field}`);
        // If the update failed (e.g., sale creation failed in store), revert UI
        if (this.ordersListStore.selectedPedido && this.ordersListStore.selectedPedido._id === pedidoId) {
          this.ordersListStore.selectedPedido.status = originalStatus;
        }
        alert("No se pudo actualizar el pedido. Por favor, intente de nuevo.");
      }
      // If success, the store's updatePedido action already handles updating the state,
      // so no explicit UI update is needed here.
    },
    closeModal() {
      this.clearSelectedPedido();
    },
    async checkUserRoutesAllowed() {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.warn("No se encontró userId en localStorage.");
          return;
        }
        const routesAllowed = await this.fetchUserProhibitedRoutes(userId);
        const actualRoute = this.$route.path;
        const routeWithoutSlash = actualRoute.replace(/^\/+/, "");
        for (const route of routesAllowed) {
          if (route === routeWithoutSlash) {
            if (this.$router) {
              this.$router.push("/ruta-prohibida");
            } else {
              console.warn(
                "Vue Router no está disponible. No se pudo redirigir."
              );
            }
            break;
          }
        }
      } catch (error) {
        console.error("Error al verificar las rutas permitidas:", error);
      }
    },
    async goToPage(page) {
      if (page >= 1 && page <= this.ordersListStore.totalPages) {
        this.ordersListStore.page = page;
        await this.ordersListStore.loadData();
      }
    },
    prevPage() {
      this.goToPage(this.ordersListStore.page - 1);
    },
    nextPage() {
      this.goToPage(this.ordersListStore.page + 1);
    },
    async emitirTicket() {
      if (!this.ordersListStore?.selectedPedido) {
        console.warn("No hay pedido seleccionado para generar ticket");
        alert("No se puede generar el ticket: no hay pedido seleccionado.");
        return false;
      }
      const selectedPedido = this.ordersListStore.selectedPedido;
      if (!selectedPedido._id && !selectedPedido.createdAt) {
        console.warn("Pedido sin datos mínimos requeridos");
        alert(
          "No se puede generar el ticket: faltan datos esenciales del pedido."
        );
        return false;
      }
      try {
        const doc = new jsPDF({
          unit: "mm",
          format: [80, 297],
          orientation: "portrait",
        });
        const now = new Date();
        const formattedDate = now.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedTime = now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const isCancelled = selectedPedido.status === "Cancelado"; // Use .status
        doc.setFont("helvetica");
        let yPos = 8;
        const pageWidth = 80;
        const margin = 4;
        const contentWidth = pageWidth - margin * 2;
        // === ENCABEZADO PROFESIONAL ===
        doc.setLineWidth(0.8);
        doc.rect(margin, yPos, contentWidth, 22);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const shopName =
          this.globalStore?.shopData?.name || "Distribuidora SuperArte";
        doc.text(shopName, pageWidth / 2, yPos + 5, { align: "center" });
        yPos += 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const empresaInfo = [
          this.globalStore?.shopData?.address ||
          "Pasaje Vivero, B. San Cayetano, Nueva Esperanza",
          this.globalStore?.shopData?.city || "Nueva Esperanza",
          `Tel: ${this.globalStore?.shopData?.phone || "(11) 685-91078"}`,
        ];
        empresaInfo.forEach((line) => {
          doc.text(line, pageWidth / 2, yPos, { align: "center" });
          yPos += 3;
        });
        yPos += 5;
        // === AVISO FISCAL DESTACADO ===
        doc.setLineWidth(1.2);
        doc.rect(margin, yPos, contentWidth, 18);
        doc.setLineWidth(0.4);
        doc.rect(margin + 1, yPos + 1, contentWidth - 2, 16);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("IMPORTANTE", pageWidth / 2, yPos + 5, { align: "center" });
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(
          "ESTE NO ES UN DOCUMENTO FISCAL VALIDO",
          pageWidth / 2,
          yPos + 9,
          {
            align: "center"
          }
        );
        doc.text(
          "SOLO COMPROBANTE DE PEDIDO INTERNO",
          pageWidth / 2,
          yPos + 12,
          {
            align: "center"
          }
        );
        doc.text("NO VALIDO COMO FACTURA", pageWidth / 2, yPos + 15, {
          align: "center",
        });
        yPos += 23;
        // === BANNER DE CANCELACIÓN SI APLICA ===
        if (isCancelled) {
          doc.setLineWidth(1.5);
          doc.setDrawColor(255, 0, 0);
          doc.rect(margin, yPos, contentWidth, 8);
          doc.setFillColor(255, 0, 0);
          doc.rect(margin, yPos, contentWidth, 8, "F");
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text("PEDIDO CANCELADO", pageWidth / 2, yPos + 5, {
            align: "center",
          });
          doc.setTextColor(0, 0, 0);
          doc.setDrawColor(0, 0, 0);
          yPos += 12;
        }
        // === INFORMACIÓN DEL TICKET DETALLADA ===
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("COMPROBANTE DE PEDIDO", pageWidth / 2, yPos, {
          align: "center",
        });
        yPos += 6;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const ticketNumber = `PD-${selectedPedido._id?.slice(-8) || Date.now().toString().slice(-8)
          }`;
        let pedidoDate;
        try {
          pedidoDate = selectedPedido.createdAt
            ? new Date(selectedPedido.createdAt)
            : new Date();
          if (isNaN(pedidoDate.getTime())) {
            pedidoDate = new Date();
          }
        } catch (error) {
          console.warn("Error al parsear fecha de pedido, usando fecha actual");
          pedidoDate = new Date();
        }
        const ticketInfo = [
          `Pedido No: ${ticketNumber}`,
          `Fecha pedido: ${pedidoDate.toLocaleDateString("es-ES")}`,
          `Hora pedido: ${pedidoDate.toLocaleTimeString("es-ES")}`,
          `Cliente: ${selectedPedido.client?.name || "CONSUMIDOR FINAL"}`,
          `Tipo de Pago: ${selectedPedido.paymentType || "NO ESPECIFICADO"}`,
          `Tipo de Entrega: ${selectedPedido.deliveryType || "NO ESPECIFICADO"
          }`,
          `Terminal: DISTRIFY GESTIÓN`,
        ];
        if (selectedPedido.clientList) {
          ticketInfo.push(`Lista de precios: ${selectedPedido.clientList}`);
        }
        ticketInfo.push(`Reimpreso: ${formattedDate} ${formattedTime}`);
        ticketInfo.forEach((line) => {
          doc.text(line, margin, yPos);
          yPos += 3.5;
        });
        yPos += 3;
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
        yPos += 5;
        // === DETALLE DE PRODUCTOS MEJORADO CON VALIDACIONES ===
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("DETALLE DEL PEDIDO", pageWidth / 2, yPos, {
          align: "center",
        });
        yPos += 6;
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("CANT", margin, yPos);
        doc.text("DESCRIPCION", margin + 12, yPos);
        doc.text("P.UNIT", margin + 45, yPos);
        doc.text("SUBTOTAL", margin + 60, yPos);
        yPos += 2;
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 3;
        doc.setFont("helvetica", "normal");
        let itemCounter = 1;
        const productDetails = selectedPedido.productDetails || [];
        if (productDetails.length === 0) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.text("No hay productos registrados", pageWidth / 2, yPos, {
            align: "center",
          });
          yPos += 8;
        } else {
          productDetails.forEach((item, index) => {
            if (!item) {
              console.warn(`Producto ${index} es null o undefined`);
              return;
            }
            const quantity = item.quantity || 0;
            const productName =
              item.productId?.name || `Producto ID: ${item.productId || "N/A"}`;
            const sellPrice = item.productId?.sellPrice || 0;
            doc.setFontSize(6);
            doc.text(`${itemCounter}.`, margin, yPos);
            doc.setFontSize(7);
            doc.text(`${quantity}`, margin + 4, yPos);
            doc.setFont("helvetica", "bold");
            const truncatedName =
              productName.length > 20
                ? productName.substring(0, 20) + "..."
                : productName;
            doc.text(truncatedName, margin + 12, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(`$${sellPrice.toFixed(2)}`, margin + 45, yPos);
            const subtotalProduct = (sellPrice * quantity).toFixed(2);
            doc.text(`$${subtotalProduct}`, pageWidth - margin, yPos, {
              align: "right",
            });
            yPos += 4;
            if (
              item.variants &&
              Array.isArray(item.variants) &&
              item.variants.length > 0
            ) {
              doc.setFontSize(6);
              doc.setFont("helvetica", "italic");
              item.variants.forEach((variant) => {
                if (!variant) return;
                let variantText = "";
                if (variant.size) variantText += `Talle: ${variant.size}`;
                if (variant.color) {
                  if (variantText) variantText += " - ";
                  variantText += `Color: ${variant.color}`;
                }
                if (variant.quantity) {
                  variantText += ` (Cant: ${variant.quantity})`;
                }
                if (variantText) {
                  doc.text(`• ${variantText}`, margin + 12, yPos);
                  yPos += 3;
                }
              });
              doc.setFont("helvetica", "normal");
            }
            if (productName.length > 20) {
              doc.setFontSize(6);
              doc.setFont("helvetica", "italic");
              try {
                const fullName = doc.splitTextToSize(
                  productName,
                  contentWidth - 15
                );
                fullName.forEach((line) => {
                  doc.text(line, margin + 4, yPos);
                  yPos += 2.5;
                });
              } catch (error) {
                console.warn("Error al dividir texto del producto:", error);
              }
              doc.setFont("helvetica", "normal");
              yPos += 1;
            }
            if (index < productDetails.length - 1) {
              doc.setLineWidth(0.1);
              doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);
              yPos += 3;
            }
            itemCounter++;
          });
        }
        yPos += 4;
        // === RESUMEN FINANCIERO DETALLADO CON VALIDACIONES ===
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const totalItems = productDetails.reduce((sum, item) => {
          return sum + (item?.quantity || 0);
        }, 0);
        doc.text(`Total de items: ${totalItems}`, margin, yPos);
        yPos += 4;
        const subtotal = selectedPedido.subtotal || 0;
        doc.text("Subtotal:", margin, yPos);
        doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, yPos, {
          align: "right",
        });
        yPos += 4;
        const discount = selectedPedido.discount || 0;
        if (discount > 0) {
          doc.text("Descuento aplicado:", margin, yPos);
          doc.text(`-$${discount.toFixed(2)}`, pageWidth - margin, yPos, {
            align: "right",
          });
          yPos += 4;
        }
        const surcharge = selectedPedido.surcharge || 0;
        if (surcharge > 0) {
          doc.text("Recargo aplicado:", margin, yPos);
          doc.text(`+$${surcharge.toFixed(2)}`, pageWidth - margin, yPos, {
            align: "right",
          });
          yPos += 4;
        }
        const iva = selectedPedido.iva || 0;
        if (iva > 0) {
          doc.text("IVA incluido (21%):", margin, yPos);
          doc.text(`$${iva.toFixed(2)}`, pageWidth - margin, yPos, {
            align: "right",
          });
          yPos += 4;
        }
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;
        const total = selectedPedido.total || 0;
        doc.setLineWidth(0.5);
        doc.rect(margin, yPos - 1, contentWidth, 8);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL FINAL:", margin + 2, yPos + 3);
        doc.text(`$${total.toFixed(2)}`, pageWidth - margin - 2, yPos + 3, {
          align: "right",
        });
        yPos += 10;
        // === INFORMACIÓN DE PAGO DETALLADA ===
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("FORMA DE PAGO:", margin, yPos);
        yPos += 4;
        doc.setFont("helvetica", "normal");
        doc.text(selectedPedido.paymentType || "Efectivo", margin + 2, yPos);
        yPos += 4;
        yPos += 2;
        // === INFORMACIÓN LEGAL Y TÉCNICA ===
        yPos += 3;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        const legalInfo = [
          "ESTE COMPROBANTE NO ES DOCUMENTO FISCAL",
          "NO REEMPLAZA FACTURA LEGAL",
          "VALIDO SOLO COMO COMPROBANTE INTERNO",
          "CONSERVE ESTE TICKET",
          "",
          `Procesado: ${now.toISOString()}`,
          `Version: Sistema POS - Historial`,
        ];
        legalInfo.forEach((line) => {
          if (line === "") {
            yPos += 2;
            return;
          }
          doc.text(line, pageWidth / 2, yPos, { align: "center" });
          yPos += 3;
        });
        yPos += 4;
        // === PIE DE PÁGINA PROFESIONAL ===
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        if (isCancelled) {
          doc.setTextColor(255, 0, 0);
          doc.text("PEDIDO CANCELADO", pageWidth / 2, yPos, {
            align: "center",
          });
          doc.setTextColor(0, 0, 0);
        } else {
          doc.text("GRACIAS POR SU PEDIDO", pageWidth / 2, yPos, {
            align: "center",
          });
        }
        yPos += 5;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Distrify - Gestión & E-Commerce", pageWidth / 2, yPos, {
          align: "center",
        });
        yPos += 3;
        doc.text(`Codigo: ${ticketNumber}`, pageWidth / 2, yPos, {
          align: "center",
        });
        doc.autoPrint();
        try {
          const pdfBlob = doc.output("blob");
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, "_blank");
          if (printWindow) {
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
                setTimeout(() => {
                  URL.revokeObjectURL(pdfUrl);
                  printWindow.close();
                }, 1000);
              }, 500);
            };
          } else {
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `pedido-${ticketNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
          }
          return true;
        } catch (pdfError) {
          console.error("Error al generar PDF:", pdfError);
          throw new Error("Error al generar el archivo PDF");
        }
      } catch (error) {
        console.error("Error al generar el ticket:", error);
        let errorMessage = "Error al generar el ticket. ";
        if (error.message.includes("PDF")) {
          errorMessage += "Problema al crear el archivo PDF.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage += "Error de conexión.";
        } else {
          errorMessage += "Error interno del sistema.";
        }
        errorMessage += " Por favor, intente nuevamente.";
        alert(errorMessage);
        return false;
      }
    },
    applyFilters() {
      console.log("Aplicando filtros:", this.ordersListStore.filters);
      this.ordersListStore.filtersApplied = true;
      this.ordersListStore.page = 1;
      this.ordersListStore.loadData();
    },
    clearFilters() {
      this.clientSearchQuery = "";
      this.ordersListStore.filters.startDate = null;
      this.ordersListStore.filters.endDate = null;
      this.ordersListStore.filters.deliveryType = null;
      this.ordersListStore.filters.status = null;

      this.ordersListStore.filters.paymentStatus = null;
      this.ordersListStore.filters.paymentType = null;
      this.ordersListStore.clearSelectedClient();
      this.ordersListStore.filtersApplied = false;
      this.ordersListStore.page = 1;
      this.ordersListStore.loadData();
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    debouncedClientSearch() {
      clearTimeout(this.clientSearchTimeout);
      this.clientSearchTimeout = setTimeout(() => {
        if (this.clientSearchQuery.length > 2) {
          const shopId = this.globalStore.shopId();
          this.ordersListStore.searchClients(shopId, this.clientSearchQuery);
        } else if (this.clientSearchQuery.length === 0) {
          this.ordersListStore.clientSearchResults = [];
          this.ordersListStore.clearSelectedClient();
          this.ordersListStore.filters.clientId = null;
        }
      }, 300);
    },
    selectClient(client) {
      console.log("Seleccionando cliente:", client);
      this.clientSearchQuery = client.name;
      this.ordersListStore.selectClient(client);
      this.ordersListStore.filters.clientId = client._id;
    },
    clearSelectedClient() {
      this.clientSearchQuery = "";
      this.ordersListStore.clearSelectedClient();
      this.ordersListStore.filters.clientId = null;
    },
  },
  async mounted() {
    await this.globalStore.fetchShopData();
    await this.ordersListStore.loadData();
    this.checkUserRoutesAllowed();
  },
  beforeUnmount() {
    clearTimeout(this.clientSearchTimeout);
  },
};
</script>

<style scoped>
/* Estilos generales */
.orders-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
}

/* Contenedor de datos y tabla */
.data-table-container {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
}

.table-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.table-responsive {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  overflow: hidden;
}

.orders-table th,
.orders-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.orders-table th {
  background-color: #f3f4f6;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
}

.orders-table tbody tr:last-child td {
  border-bottom: none;
}

.orders-table tbody tr:hover {
  background-color: #fcfcfc;
}

.orders-table .pedido-canceled {
  background-color: #fef2f2;
  color: #ef4444;
  border-left: 4px solid #ef4444;
}

.text-right {
  text-align: right;
}

/* Botones */
.btn-primary {
  background-color: #f9931e;
  color: #ffffff;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #e0801c;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-close {
  background-color: transparent;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-close:hover {
  color: #ef4444;
}

/* Estado vacío */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f3f4f6;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}

.modal-body {
  padding: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f3f4f6;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}

/* Detalles de venta */
.canceled-banner {
  background-color: #ef4444;
  color: #ffffff;
  text-align: center;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.sale-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #ffffff;
}

.detail-section h3 {
  background-color: #f3f4f6;
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  color: #1f2937;
}

.total-row {
  font-weight: 600;
  background-color: #f3f4f6;
}

/* Campos de formulario en el modal */
.form-control {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #ffffff;
  min-width: 8rem;
  font-size: 0.875rem;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-6.5%200-12.1%204.6-13%2011.1-1%206.5%202%2012.1%207.4%2013l133%20133c4.9%204.9%2012.8%204.9%2017.6%200l133-133c5.4-5.4%205.4-14.2%200-19.6z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%, 0 0;
  background-size: 0.65em auto, 100%;
}

.form-control:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f0f0f0;
}

/* Sección de productos */
.products-section {
  max-height: 400px;
  overflow-y: auto;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.product-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.product-name {
  background-color: #f3f4f6;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
}

.product-details {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-detail {
  display: flex;
  justify-content: space-between;
}

/* Nuevos estilos para variantes */
.products-summary {
  font-size: 0.875rem;
}

.products-count {
  font-weight: 500;
  color: #1f2937;
}

.variants-indicator {
  color: #8b5cf6;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.variants-indicator i {
  font-size: 0.75rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.product-quantity-badge {
  background-color: #f9931e;
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-variants {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.variants-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.variants-title i {
  color: #8b5cf6;
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.variant-item {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.5rem;
}

.variant-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.variant-attribute {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #4a5568;
  background-color: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.variant-attribute i {
  font-size: 0.625rem;
  color: #8b5cf6;
}

.variant-quantity {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2d3748;
  background-color: #f0fff4;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #9ae6b4;
}

.variant-quantity i {
  font-size: 0.625rem;
  color: #059669;
}

/* Estilos de Paginación */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-pagination {
  background-color: #f9931e;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #e0801c;
}

.btn-pagination:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Nuevos estilos para los filtros */
.filter-toggle-container {
  text-align: right;
  margin-bottom: 1rem;
}

.btn-toggle-filters {
  background-color: #f9931e;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-toggle-filters:hover {
  background-color: #e0801c;
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.filter-input,
.filter-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

/* Estilos para el autocompletado */
.search-autocomplete-container {
  position: relative;
}

.autocomplete-results-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 6px 12px -1px rgba(0, 0, 0, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.06);
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.autocomplete-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1f2937;
  border-bottom: 1px solid #f3f4f6;
}

.autocomplete-result-item:last-child {
  border-bottom: none;
}

.autocomplete-result-item:hover {
  background-color: #f3f4f6;
}

.btn-clear-autocomplete {
  background: none;
  border: none;
  color: #6b7280;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(calc(-50% + 0.5rem));
  padding: 0.25rem;
  font-size: 1rem;
  width: auto;
  height: auto;
  border-radius: 50%;
  z-index: 11;
}

.btn-clear-autocomplete:hover {
  color: #ef4444;
  background-color: #f3f4f6;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: none;
  }

  .filters-container {
    grid-template-columns: 1fr;
  }

  .data-table-container {
    display: grid;
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .orders-table {
    font-size: 0.875rem;
  }

  .orders-table th,
  .orders-table td {
    padding: 0.5rem 0.75rem;
  }

  .variant-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media print {
  body * {
    visibility: hidden;
  }

  .ticket,
  .ticket * {
    visibility: visible;
  }
}
</style>