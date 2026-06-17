<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content returns-history-modal" @click.stop>
      <div class="modal-header">
        <h2>
          <span class="material-symbols-outlined">history</span>
          Historial de Devoluciones
        </h2>
        <button @click="closeModal" class="btn-close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <span class="material-symbols-outlined fa-spin"
            >progress_activity</span
          >
          <p>Cargando historial...</p>
        </div>

        <div v-else-if="returns.length === 0" class="empty-state">
          <span class="material-symbols-outlined">inbox</span>
          <h3>Sin devoluciones</h3>
          <p>Esta venta no tiene devoluciones registradas.</p>
        </div>

        <div v-else class="returns-list">
          <div
            v-for="(returnItem, index) in returns"
            :key="index"
            class="return-item"
          >
            <div class="return-header">
              <div class="return-type">
                <span
                  class="type-badge"
                  :class="getReturnTypeClass(returnItem.returnType)"
                >
                  <span class="material-symbols-outlined">{{
                    getReturnTypeIcon(returnItem.returnType)
                  }}</span>
                  {{ getReturnTypeLabel(returnItem.returnType) }}
                </span>
              </div>
              <div class="return-date">
                {{ formatDate(returnItem.createdAt) }}
              </div>
            </div>

            <div class="return-details">
              <div class="detail-section">
                <h4>
                  <span class="material-symbols-outlined">info</span>
                  Información General
                </h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Procesado por:</span>
                    <span class="value">{{ returnItem.processedBy }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Motivo:</span>
                    <span class="value">{{ returnItem.reason }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Monto devuelto:</span>
                    <span class="value amount">{{
                      formatPrice(returnItem.returnedAmount)
                    }}</span>
                  </div>
                  <div v-if="returnItem.newAmount > 0" class="detail-item">
                    <span class="label">Monto nuevo:</span>
                    <span class="value amount">{{
                      formatPrice(returnItem.newAmount)
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Diferencia:</span>
                    <span
                      class="value amount"
                      :class="{
                        positive: returnItem.balanceDifference > 0,
                        negative: returnItem.balanceDifference < 0,
                        neutral: returnItem.balanceDifference === 0,
                      }"
                    >
                      {{ formatPrice(Math.abs(returnItem.balanceDifference)) }}
                      <small v-if="returnItem.balanceDifference > 0"
                        >(A favor del cliente)</small
                      >
                      <small v-else-if="returnItem.balanceDifference < 0"
                        >(Cliente debe)</small
                      >
                      <small v-else>(Sin diferencia)</small>
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="returnItem.refundType" class="detail-section">
                <h4>
                  <span class="material-symbols-outlined">payments</span>
                  Reembolso
                </h4>
                <div class="refund-info">
                  <span class="refund-type">{{
                    getRefundTypeLabel(returnItem.refundType)
                  }}</span>
                  <div class="refund-amounts">
                    <div
                      v-if="returnItem.cashRefunded > 0"
                      class="refund-amount"
                    >
                      <span class="material-symbols-outlined">payments</span>
                      Efectivo: {{ formatPrice(returnItem.cashRefunded) }}
                    </div>
                    <div
                      v-if="returnItem.creditGenerated > 0"
                      class="refund-amount"
                    >
                      <span class="material-symbols-outlined">credit_card</span>
                      Crédito: {{ formatPrice(returnItem.creditGenerated) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>
                  <span class="material-symbols-outlined">inventory_2</span>
                  Productos Devueltos
                </h4>
                <div class="products-list">
                  <div
                    v-for="(product, pIndex) in returnItem.returnedProducts"
                    :key="pIndex"
                    class="product-item"
                  >
                    <div class="product-info">
                      <h5>{{ getProductName(product) }}</h5>
                      <div class="product-details">
                        <span class="quantity"
                          >Cantidad: {{ product.quantity }}</span
                        >
                        <span class="price"
                          >Precio:
                          {{
                            formatPrice(
                              product.unitPrice ||
                                product.productId?.sellPrice ||
                                0,
                            )
                          }}</span
                        >
                        <span class="total"
                          >Total:
                          {{
                            formatPrice(
                              product.quantity *
                                (product.unitPrice ||
                                  product.productId?.sellPrice ||
                                  0),
                            )
                          }}</span
                        >
                      </div>
                      <div
                        v-if="product.variants && product.variants.length > 0"
                        class="variants"
                      >
                        <div
                          v-for="(variant, vIndex) in product.variants"
                          :key="vIndex"
                          class="variant"
                        >
                          {{ variant.size }} - {{ variant.color }} ({{
                            variant.quantity
                          }})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="
                  returnItem.newProducts && returnItem.newProducts.length > 0
                "
                class="detail-section"
              >
                <h4>
                  <span class="material-symbols-outlined">shopping_cart</span>
                  Productos Nuevos
                </h4>
                <div class="products-list">
                  <div
                    v-for="(product, pIndex) in returnItem.newProducts"
                    :key="pIndex"
                    class="product-item new-product"
                  >
                    <div class="product-info">
                      <h5>{{ getProductName(product) }}</h5>
                      <div class="product-details">
                        <span class="quantity"
                          >Cantidad: {{ product.quantity }}</span
                        >
                        <span class="price"
                          >Precio: {{ formatPrice(product.sellPrice) }}</span
                        >
                        <span class="total"
                          >Total:
                          {{
                            formatPrice(product.quantity * product.sellPrice)
                          }}</span
                        >
                      </div>
                      <div
                        v-if="product.variants && product.variants.length > 0"
                        class="variants"
                      >
                        <div
                          v-for="(variant, vIndex) in product.variants"
                          :key="vIndex"
                          class="variant"
                        >
                          {{ variant.size }} - {{ variant.color }} ({{
                            variant.quantity
                          }})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="returnItem.notes" class="detail-section">
                <h4>
                  <span class="material-symbols-outlined">sticky_note_2</span>
                  Notas
                </h4>
                <p class="notes">{{ returnItem.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn-secondary">
          <span class="material-symbols-outlined">close</span>
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useReturnsStore } from "@/stores/returnsStore";

export default {
  name: "ReturnsHistoryComponent",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    saleId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      returnsStore: useReturnsStore(),
      returns: [],
      loading: false,
    };
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },

    handleOverlayClick() {
      this.closeModal();
    },

    formatPrice(value) {
      return this.returnsStore.formatPrice(value);
    },

    formatDate(date) {
      return this.returnsStore.formatDate(date);
    },

    getReturnTypeLabel(type) {
      const labels = {
        FULL_RETURN: "Devolución Completa",
        PARTIAL_RETURN: "Devolución Parcial",
        EXCHANGE: "Cambio",
      };
      return labels[type] || type;
    },

    getReturnTypeIcon(type) {
      const icons = {
        FULL_RETURN: "undo",
        PARTIAL_RETURN: "remove_circle",
        EXCHANGE: "swap_horiz",
      };
      return icons[type] || "help";
    },

    getReturnTypeClass(type) {
      const classes = {
        FULL_RETURN: "full-return",
        PARTIAL_RETURN: "partial-return",
        EXCHANGE: "exchange",
      };
      return classes[type] || "";
    },

    getRefundTypeLabel(type) {
      const labels = {
        CASH: "Efectivo",
        CREDIT: "Crédito a favor",
        ACCOUNT_ADJUSTMENT: "Ajuste de cuenta",
      };
      return labels[type] || type;
    },

    getProductName(product) {
      if (product.productName) return product.productName;
      if (product.productId?.name) return product.productId.name;
      if (product.name) return product.name;
      return "Producto sin nombre";
    },

    async loadReturnsHistory() {
      if (!this.saleId) return;

      this.loading = true;
      try {
        this.returns = await this.returnsStore.getReturnsBySale(this.saleId);
      } catch (error) {
        console.error("Error loading returns history:", error);
        this.returns = [];
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    visible(newValue) {
      if (newValue && this.saleId) {
        this.loadReturnsHistory();
      }
    },
  },
};
</script>

<style scoped>
/* Modal base styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.returns-history-modal {
  background-color: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-close:hover {
  color: #ef4444;
  background-color: #fef2f2;
}

.modal-body {
  padding: 1.25rem;
  flex-grow: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

/* Loading and empty states */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-state i {
  font-size: 2rem;
  color: #f9931e;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
}

/* Returns list */
.returns-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.return-item {
  border: 1px solid #e5e7eb;
  border-radius: 1.5rem;
  overflow: hidden;
  background-color: white;
}

.return-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.type-badge.full-return {
  background-color: #fecaca;
  color: #dc2626;
}

.type-badge.partial-return {
  background-color: #fed7aa;
  color: #ea580c;
}

.type-badge.exchange {
  background-color: #bfdbfe;
  color: #2563eb;
}

.return-date {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Return details */
.return-details {
  padding: 1rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.detail-section h4 i {
  color: #f9931e;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-item .value {
  font-weight: 600;
  color: #1f2937;
}

.detail-item .value.amount {
  font-size: 1.05rem;
}

.detail-item .value.positive {
  color: #059669;
}

.detail-item .value.negative {
  color: #dc2626;
}

.detail-item .value.neutral {
  color: #6b7280;
}

.detail-item .value small {
  font-size: 0.75rem;
  font-weight: 400;
  margin-left: 0.25rem;
}

/* Refund info */
.refund-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.refund-type {
  display: inline-flex;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 1rem;
  font-weight: 600;
  color: #374151;
  align-self: flex-start;
}

.refund-amounts {
  display: flex;
  gap: 1rem;
}

.refund-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #ecfdf5;
  color: #059669;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.refund-amount i {
  color: #10b981;
}

/* Products list */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.product-item.new-product {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
}

.product-info h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
}

.product-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.product-details span {
  font-size: 0.85rem;
  color: #6b7280;
}

.product-details .quantity {
  font-weight: 600;
  color: #374151;
}

.product-details .price {
  color: #059669;
  font-weight: 600;
}

.product-details .total {
  color: #1f2937;
  font-weight: 700;
}

.variants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant {
  padding: 0.25rem 0.5rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

/* Notes */
.notes {
  font-style: italic;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 1rem;
  border-left: 3px solid #f9931e;
  margin: 0;
}

/* Button styles */
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .returns-history-modal {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }

  .return-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .refund-amounts {
    flex-direction: column;
  }

  .product-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .variants {
    flex-direction: column;
  }
}
</style>
