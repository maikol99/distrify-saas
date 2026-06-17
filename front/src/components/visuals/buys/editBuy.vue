<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm">
    <div class="bg-white w-screen h-screen md:w-[900px] md:h-auto md:max-h-[90vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 md:rounded-t-3xl text-orange-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">edit</span>
          Editar Compra
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <!-- Información Actual -->
      <div class="current-info-section">
        <h3>Información Actual</h3>
        <div class="info-cards">
          <div class="info-card">
            <div class="info-label">
              <i class="fas fa-truck"></i>
              Proveedor Actual
            </div>
            <div class="info-value">
              {{ buy.supplierId.name || "No seleccionado" }}
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">
              <i class="fas fa-tag"></i>
              Categoría Actual
            </div>
            <div class="info-value">
              {{ currentPurchase.category || "No seleccionada" }}
            </div>
          </div>
          <!-- Información de Método de Pago Actual -->
          <div class="info-card payment-info-card">
            <div class="info-label">
              <i class="fas fa-credit-card"></i>
              Método de Pago Actual
            </div>
            <div class="info-value">
              <div
                v-if="
                  currentPurchase.paymentMethods &&
                  currentPurchase.paymentMethods.length > 1
                "
                class="multiple-payments-display"
              >
                <div class="payment-details-display">
                  <div
                    v-for="(payment, index) in currentPurchase.paymentMethods"
                    :key="index"
                    class="payment-item-display"
                  >
                    <span class="payment-badge multiple">
                      {{ payment.method }}
                    </span>
                    <span class="payment-amount-display">
                      {{ formatPrice(payment.amount) }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                v-else-if="
                  currentPurchase.paymentMethods &&
                  currentPurchase.paymentMethods.length === 1
                "
                class="single-payment-display"
              >
                <span class="payment-badge single">
                  {{ currentPurchase.paymentMethods[0].method }}
                </span>
              </div>
              <div v-else class="single-payment-display">
                <span class="payment-badge single">
                  {{ currentPurchase.paymentMethod || "No especificado" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <!-- Información básica de la compra -->
        <div class="form-group">
          <label for="supplier">Proveedor:</label>
          <select
            v-model="currentPurchase.supplierId"
            id="supplier"
            class="form-control"
          >
            <option value="" disabled>Seleccione un proveedor</option>
            <option
              v-for="supplier in supplierStore.suppliers"
              :key="supplier._id"
              :value="supplier._id"
            >
              {{ supplier.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="expenseCategory">Categoría:</label>
          <select
            v-model="currentPurchase.category"
            id="expenseCategory"
            class="form-control"
          >
            <option value="" disabled>Seleccione una categoría</option>
            <option value="Compra de insumos y materia prima">
              Compra de insumos y materia prima
            </option>
            <option value="Compra de mercadería para reventa">
              Compra de mercadería para reventa
            </option>
            <option value="Envases y empaques">Envases y empaques</option>
            <option value="Fletes y logística contratada">
              Fletes y logística contratada
            </option>
            <option value="Mantenimiento y reparaciones contratadas">
              Mantenimiento y reparaciones contratadas
            </option>
            <option value="Servicios tercerizados (limpieza, seguridad, etc.)">
              Servicios tercerizados (limpieza, seguridad, etc.)
            </option>
            <option value="Publicidad y diseño gráfico">
              Publicidad y diseño gráfico
            </option>
            <option value="Licencias, software y servicios digitales">
              Licencias, software y servicios digitales
            </option>
            <option value="Equipos, herramientas y mobiliario">
              Equipos, herramientas y mobiliario
            </option>
            <option value="Suministros de oficina">
              Suministros de oficina
            </option>
            <option value="Papelería y materiales gráficos">
              Papelería y materiales gráficos
            </option>
            <option
              value="Servicios profesionales (contables, legales, técnicos)"
            >
              Servicios profesionales (contables, legales, técnicos)
            </option>
            <option value="Viáticos y movilidad facturada">
              Viáticos y movilidad facturada
            </option>
            <option value="Seguros contratados">Seguros contratados</option>
            <option value="Otros gastos a proveedores">
              Otros gastos a proveedores
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="purchaseDate">Fecha:</label>
            <input
              id="purchaseDate"
              v-model="currentPurchase.date"
              type="date"
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="purchaseTotal">Total:</label>
            <input
              id="purchaseTotal"
              v-model.number="currentPurchase.total"
              type="number"
              step="0.01"
              class="form-control"
              required
            />
          </div>
        </div>

        <!-- Sección de Productos -->
        <div class="products-section">
          <div class="section-header">
            <h3>
              <i class="fas fa-boxes"></i>
              Productos de la Compra
            </h3>
            <!-- <button
              @click="showProductsModal = true"
              class="btn-secondary btn-sm"
              type="button"
            >
              <i class="fas fa-edit"></i>
              Editar Productos
            </button> -->
          </div>

          <div
            v-if="
              currentPurchase.products && currentPurchase.products.length > 0
            "
            class="products-list"
          >
            <div class="products-header">
              <span class="product-name-header">Producto</span>
              <span class="product-quantity-header">Cantidad</span>
              <span class="product-price-header">Precio Compra</span>
              <span class="product-total-header">Total</span>
            </div>

            <div
              v-for="(product, index) in currentPurchase.products"
              :key="product._id || index"
              class="product-item"
            >
              <div class="product-name">
                <i class="fas fa-box text-muted"></i>
                {{ product.productId?.name || "Producto sin nombre" }}
              </div>
              <div class="product-quantity">
                {{ product.quantity }}
              </div>
              <div class="product-price">
                {{ formatPrice(product.buyPrice) }}
              </div>
              <div class="product-total">
                {{ formatPrice(product.quantity * product.buyPrice) }}
              </div>
            </div>

            <div class="products-summary">
              <div class="summary-label">Total productos:</div>
              <div class="summary-value">{{ calculateProductsTotal() }}</div>
            </div>
          </div>

          <div v-else class="no-products">
            <i class="fas fa-inbox"></i>
            <p>No hay productos cargados en esta compra</p>
            <button
              @click="showProductsModal = true"
              class="btn-primary btn-sm"
              type="button"
            >
              <i class="fas fa-plus"></i>
              Agregar Productos
            </button>
          </div>
        </div>

        <!-- Sección de Métodos de Pago para Edición -->
        <div class="form-group">
          <label>Configuración de Pago:</label>
          <div class="payment-mode-toggle">
            <button
              @click="
                isMultiplePaymentMode = false;
                clearPaymentMethods();
              "
              :class="['btn-toggle', { active: !isMultiplePaymentMode }]"
              type="button"
            >
              <i class="fas fa-money-bill-wave"></i> Pago Único
            </button>
            <button
              @click="
                isMultiplePaymentMode = true;
                paymentMethod = '';
              "
              :class="['btn-toggle', { active: isMultiplePaymentMode }]"
              type="button"
            >
              <i class="fas fa-credit-card"></i> Pagos Múltiples
            </button>
          </div>

          <div v-if="!isMultiplePaymentMode" class="single-payment-input">
            <label for="paymentMethod" class="sr-only"
              >Método de Pago Único:</label
            >
            <select
              v-model="paymentMethod"
              id="paymentMethod"
              class="form-control"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cuenta corriente">Cuenta corriente</option>
              <option value="Credito">Crédito</option>
              <option value="Debito">Débito</option>
            </select>
          </div>

          <div v-else class="multiple-payments-input">
            <div class="current-multiple-payments">
              <div v-if="paymentMethods.length > 0">
                <div
                  v-for="(payment, index) in paymentMethods"
                  :key="index"
                  class="payment-input-item"
                >
                  <span class="payment-badge multiple">{{
                    payment.method
                  }}</span>
                  <span class="payment-amount">{{
                    formatPrice(payment.amount)
                  }}</span>
                  <button
                    @click="removePaymentMethod(index)"
                    class="btn-remove-payment"
                    type="button"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <p v-else class="text-muted">
                No hay métodos de pago múltiples registrados.
              </p>
            </div>
            <button
              class="btn-secondary"
              @click="showingModalPaymentMethods = true"
              type="button"
            >
              <i class="fas fa-plus"></i> Ingresar/Editar métodos
            </button>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 md:rounded-b-3xl mt-auto shadow-inner">
        <button @click="$emit('close')" class="py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto">
          Cancelar
        </button>        
        <button @click.prevent="updatePurchase()" class="py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading">
          <span class="material-symbols-outlined mr-2 animate-spin" v-if="loading">progress_activity</span>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Modal de métodos de pago -->
    <paymentMethods
      @purchase-registered="handlePaymentMethods"
      :venta="currentPurchase.total"
      v-if="showingModalPaymentMethods"
      @close="showingModalPaymentMethods = false"
    />

    <!-- Modal de productos (placeholder - necesitarás crearlo) -->
    <div v-if="showProductsModal" class="modal-overlay">
      <div class="modal-content products-modal">
        <div class="modal-header">
          <h2>Editar Productos de la Compra</h2>
          <button @click="showProductsModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-muted">
            <i class="fas fa-info-circle"></i>
            Aquí puedes implementar la funcionalidad para editar productos.
          </p>
          <!-- Aquí puedes agregar el componente para editar productos -->
        </div>
        <div class="modal-footer">
          <button @click="showProductsModal = false" class="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <spinnerComponent v-if="loading" />
</template>

<script>
import spinnerComponent from "../spinnerComponent.vue";
import paymentMethods from "@/components/visuals/sales/paymentMethods.vue";
import moment from "moment";
import { useSuppliersStore } from "@/stores/suppliersStore";
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";
import numeral from "numeral";

export default {
  name: "EditPurchaseModal",
  components: {
    paymentMethods,
    spinnerComponent,
  },
  props: {
    buy: {
      type: Object,
      required: true,
    },
  },
  emits: ["update", "close", "submit"],
  data() {
    return {
      currentPurchase: {
        _id: "",
        supplierId: "",
        category: "",
        date: "",
        total: 0,
        paymentMethod: "",
        paymentMethods: [],
        products: [], // Array de productos
      },
      paymentMethod: "Efectivo",
      paymentMethods: [],
      isMultiplePaymentMode: false,
      showingModalPaymentMethods: false,
      showProductsModal: false, // Controla el modal de productos
      loading: false,
      supplierStore: useSuppliersStore(),
      globalStore: useGlobalStore(),
    };
  },
  watch: {
    buy: {
      handler(newBuy) {
        if (newBuy) {
          this.loadPurchaseData(newBuy);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    formatPrice(value) {
      return numeral(value).format("$0.00");
    },

    loadPurchaseData(purchase) {
      this.currentPurchase = JSON.parse(JSON.stringify(purchase));

      if (this.currentPurchase.date) {
        this.currentPurchase.date = moment
          .utc(this.currentPurchase.date)
          .format("YYYY-MM-DD");
      }

      // Cargar productos si existen
      if (purchase.products) {
        this.currentPurchase.products = purchase.products;
      }

      // Determinar el modo de pago inicial
      if (
        this.currentPurchase.paymentMethods &&
        this.currentPurchase.paymentMethods.length > 0
      ) {
        this.isMultiplePaymentMode = true;
        this.paymentMethods = this.currentPurchase.paymentMethods;
        this.paymentMethod = "";
      } else {
        this.isMultiplePaymentMode = false;
        this.paymentMethods = [];
        this.paymentMethod = this.currentPurchase.paymentMethod || "Efectivo";
      }
    },

    calculateProductsTotal() {
      if (
        !this.currentPurchase.products ||
        this.currentPurchase.products.length === 0
      ) {
        return this.formatPrice(0);
      }

      const total = this.currentPurchase.products.reduce((sum, product) => {
        return sum + product.quantity * product.buyPrice;
      }, 0);

      return this.formatPrice(total);
    },

    clearPaymentMethods() {
      this.paymentMethods = [];
    },

    removePaymentMethod(index) {
      this.paymentMethods.splice(index, 1);
      if (this.paymentMethods.length === 0) {
        this.isMultiplePaymentMode = false;
        this.paymentMethod = "Efectivo";
      }
    },

    async updatePurchase() {
      try {
        this.loading = true;
        const userName = this.globalStore.userName();

        const updateData = {
          supplierId: this.currentPurchase.supplierId,
          category: this.currentPurchase.category,
          date: this.currentPurchase.date,
          total: this.currentPurchase.total,
          cashierName: userName,
          userName: userName,
          createdAt: this.currentPurchase.date,
        };

        if (this.isMultiplePaymentMode && this.paymentMethods.length > 0) {
          updateData.paymentMethods = this.paymentMethods;
          delete updateData.paymentMethod;
        } else {
          updateData.paymentMethod = this.paymentMethod || "Efectivo";
          delete updateData.paymentMethods;
        }

        const response = await api.patch(
          `/buys/patch/update-buy/${this.currentPurchase._id}`,
          updateData
        );

        const data = response.data;
        if (data.success) {
          this.$emit("submit");
          this.$emit("close");
        }
      } catch (error) {
        console.error("Error al actualizar la compra", error);
        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          window.alert(
            `Error: ${
              error.response.data.message || "No se pudo actualizar la compra"
            }`
          );
        } else {
          window.alert("No se pudo actualizar la compra. Intente nuevamente.");
        }
      } finally {
        this.loading = false;
      }
    },

    handlePaymentMethods(saleData) {
      this.paymentMethods = saleData.paymentMethods;
      this.isMultiplePaymentMode = true;
      this.paymentMethod = "";
      this.showingModalPaymentMethods = false;
    },
  },

  async mounted() {
    await this.supplierStore.getSuppliersNames();
  },
};
</script>

<style scoped>
/* Estilos base existentes */
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
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: white;
  border-radius: 0;
  box-shadow: none;
  width: 100vw;
  max-width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.products-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.current-info-section {
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

.current-info-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  word-wrap: break-word;
}

/* Estilos para productos */
.products-section {
  margin: 1.5rem 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.products-list {
  background-color: white;
}

.products-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background-color: #f1f5f9;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.product-name-header,
.product-quantity-header,
.product-price-header,
.product-total-header {
  text-align: left;
}

.product-quantity-header,
.product-price-header,
.product-total-header {
  text-align: center;
}

.product-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
}

.product-item:last-child {
  border-bottom: none;
}

.product-item:hover {
  background-color: #f8fafc;
}

.product-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #1f2937;
}

.product-quantity,
.product-price,
.product-total {
  text-align: center;
  color: #4b5563;
}

.product-price,
.product-total {
  font-weight: 600;
  color: #059669;
}

.products-summary {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background-color: #f8fafc;
  border-top: 2px solid #e5e7eb;
  font-weight: 600;
}

.summary-label {
  grid-column: span 3;
  text-align: right;
  color: #1f2937;
}

.summary-value {
  text-align: center;
  color: #059669;
  font-size: 1.1rem;
}

.no-products {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.no-products i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.no-products p {
  margin: 1rem 0;
  font-size: 1rem;
}

.text-muted {
  color: #6b7280;
}

/* Estilos de pago existentes */
.payment-info-card .info-value {
  font-weight: normal;
}

.single-payment-display {
  display: flex;
  justify-content: flex-start;
}

.multiple-payments-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-details-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-item-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.payment-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.payment-badge.single {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.payment-badge.multiple {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.payment-amount-display {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background-color: #d1fae5;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid #a7f3d0;
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
}

/* Formularios */
.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

/* Botones */
.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-toggle:hover {
  background-color: #f3f4f6;
}

.btn-toggle.active {
  background-color: #f9931e;
  color: white;
  box-shadow: inset 0 0 0 2px #f9931e;
}

.multiple-payments-input {
  margin-top: 1rem;
}

.current-multiple-payments {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  background-color: #f9fafb;
}

.payment-input-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.payment-input-item:last-child {
  border-bottom: none;
}

.payment-input-item .payment-badge {
  margin-right: 0.5rem;
}

.btn-remove-payment {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.btn-remove-payment:hover {
  background-color: #fee2e2;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .payment-item-display,
  .payment-input-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .payment-amount-display,
  .payment-input-item .payment-amount {
    margin-left: 0;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .products-header,
  .product-item,
  .products-summary {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .product-name-header,
  .product-quantity-header,
  .product-price-header,
  .product-total-header,
  .product-quantity,
  .product-price,
  .product-total {
    text-align: left;
  }

  .summary-label {
    grid-column: span 1;
    text-align: left;
  }

  .summary-value {
    text-align: left;
  }

  .product-item {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    margin-bottom: 0.5rem;
  }

  .product-name {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .product-quantity::before {
    content: "Cantidad: ";
    font-weight: 600;
    color: #6b7280;
  }

  .product-price::before {
    content: "Precio: ";
    font-weight: 600;
    color: #6b7280;
  }

  .product-total::before {
    content: "Total: ";
    font-weight: 600;
    color: #6b7280;
  }

  .products-header {
    display: none;
  }
}

.btn-primary:hover {
  background-color: #e8821a;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
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
  background-color: #e5e7eb;
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

/* Toggle de pagos */
.payment-mode-toggle {
  display: flex;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
}

.btn-toggle {
  flex: 1;
  padding: 0.625rem 0.75rem;
  background-color: white;
  color: #4b5563;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-toggle:hover {
  background-color: #f3f4f6;
}

.btn-toggle.active {
  background-color: #f9931e;
  color: white;
  box-shadow: inset 0 0 0 2px #f9931e;
}

/* Estilos para la entrada de múltiples pagos */
.multiple-payments-input {
  margin-top: 1rem;
}

.current-multiple-payments {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  background-color: #f9fafb;
}

.payment-input-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.payment-input-item:last-child {
  border-bottom: none;
}

.payment-input-item .payment-badge {
  margin-right: 0.5rem;
}

.btn-remove-payment {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.btn-remove-payment:hover {
  background-color: #fee2e2;
}

.text-muted {
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .payment-item-display,
  .payment-input-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .payment-amount-display,
  .payment-input-item .payment-amount {
    margin-left: 0;
  }
}
</style>
