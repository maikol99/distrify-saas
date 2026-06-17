<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white w-screen h-screen md:w-[500px] md:h-auto md:max-h-[90vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 md:rounded-t-3xl text-orange-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">bolt</span>
          Actualización Rápida
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <div class="p-5 flex-1 overflow-y-auto">
        <!-- Target indicator -->
        <div class="mb-4 pb-4 border-b border-gray-100 flex justify-between items-end">
          <div>
            <h3 class="text-lg font-bold text-gray-800 m-0">{{ product.name }}</h3>
            <span class="text-sm text-gray-500">Código: {{ product.code }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label for="addQuantity" class="text-sm font-medium text-gray-600 mb-1">Agregar Cantidad</label>
              <div class="text-xs text-gray-500 font-medium bg-gray-50 p-1.5 rounded border border-gray-200 inline-block mb-2 w-max">
                Stock actual: {{ product.quantity }}
              </div>
              <input
                id="addQuantity"
                type="number"
                v-model.number="addQuantity"
                min="0"
                class="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 py-2 focus:border-orange-500 outline-none"
                placeholder="Cantidad a agregar"
                @input="updateQuantity"
              />
              <div class="mt-2 text-sm text-green-600 font-semibold bg-green-50 p-1.5 rounded border border-green-200 inline-block w-max">
                Nuevo total: {{ newTotalQuantity }}
              </div>
              <span class="text-xs text-gray-400 mt-1">
                Min: {{ product.minQuantity }} | Max: {{ product.maxQuantity }}
              </span>
            </div>

            <div class="flex flex-col">
              <label for="buyPrice" class="text-sm font-medium text-gray-600 mb-1">Precio Compra</label>
              <div class="relative flex items-center">
                <span class="absolute left-3 text-gray-500 font-medium">$</span>
                <input
                  id="buyPrice"
                  type="number"
                  v-model.number="localProduct.buyPrice"
                  min="0"
                  step="0.01"
                  class="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none"
                  @input="updateFromBuyPrice"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label for="utility" class="text-sm font-medium text-gray-600 mb-1">Utilidad (%)</label>
              <div class="relative flex items-center">
                <input
                  id="utility"
                  type="number"
                  v-model.number="localProduct.utilidad"
                  min="0"
                  step="0.1"
                  class="w-full pr-8 py-2.5 pl-3 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none"
                  @input="updateFromUtility"
                />
                <span class="absolute right-3 text-gray-500 font-medium">%</span>
              </div>
            </div>

            <div class="flex flex-col">
              <label for="sellPrice" class="text-sm font-medium text-gray-600 mb-1">Precio Venta</label>
              <div class="relative flex items-center">
                <span class="absolute left-3 text-gray-500 font-medium">$</span>
                <input
                  id="sellPrice"
                  type="number"
                  v-model.number="localProduct.sellPrice"
                  min="0"
                  step="0.01"
                  class="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none"
                  @input="updateFromSellPrice"
                />
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200 mt-2">
            <span class="text-sm text-gray-600 font-medium">Ganancia por unidad:</span>
            <span class="text-lg font-bold text-green-600">${{ profitPerUnit.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto md:rounded-b-3xl">
        <button type="button" class="py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 w-full md:w-auto text-center" @click="resetChanges">
          Cancelar
        </button>
        <button
          type="button"
          class="py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 flex items-center justify-center w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          @click="saveChanges"
          :disabled="!hasChanges"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/config/axios.config";

export default {
  name: "ProductQuickUpdate",
  props: {
    product: {
      type: Object,
      required: true,
      validator(value) {
        return (
          value &&
          typeof value.quantity === "number" &&
          typeof value.buyPrice === "number" &&
          typeof value.utilidad === "number" &&
          typeof value.sellPrice === "number"
        );
      },
    },
  },
  data() {
    return {
      addQuantity: 0,
      localProduct: {
        quantity: 0,
        buyPrice: 0,
        utilidad: 0,
        sellPrice: 0,
      },
      originalValues: {
        quantity: 0,
        buyPrice: 0,
        utilidad: 0,
        sellPrice: 0,
      },
      isUpdating: false,
    };
  },
  computed: {
    profitPerUnit() {
      return this.localProduct.sellPrice - this.localProduct.buyPrice;
    },
    newTotalQuantity() {
      return (this.product.quantity || 0) + (this.addQuantity || 0);
    },
    hasChanges() {
      return (
        this.addQuantity > 0 ||
        this.localProduct.buyPrice !== this.originalValues.buyPrice ||
        this.localProduct.utilidad !== this.originalValues.utilidad ||
        this.localProduct.sellPrice !== this.originalValues.sellPrice
      );
    },
  },
  watch: {
    product: {
      handler(newProduct) {
        this.initializeValues();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    initializeValues() {
      this.addQuantity = 0;
      this.localProduct = {
        quantity: this.product.quantity || 0,
        buyPrice: this.product.buyPrice || 0,
        utilidad: this.product.utilidad || 0,
        sellPrice: this.product.sellPrice || 0,
      };

      this.originalValues = { ...this.localProduct };
    },

    updateQuantity() {
      this.$emit("field-changed", {
        field: "addQuantity",
        value: this.addQuantity,
        newTotal: this.newTotalQuantity,
        product: { ...this.localProduct },
      });
    },

    updateFromBuyPrice() {
      if (this.isUpdating) return;
      this.isUpdating = true;

      // Calcular precio de venta basado en precio de compra y utilidad
      const utilityMultiplier = 1 + this.localProduct.utilidad / 100;
      this.localProduct.sellPrice = Number(
        (this.localProduct.buyPrice * utilityMultiplier).toFixed(2)
      );

      this.$nextTick(() => {
        this.isUpdating = false;
      });
    },

    updateFromUtility() {
      if (this.isUpdating) return;
      this.isUpdating = true;

      // Calcular precio de venta basado en precio de compra y nueva utilidad
      const utilityMultiplier = 1 + this.localProduct.utilidad / 100;
      this.localProduct.sellPrice = Number(
        (this.localProduct.buyPrice * utilityMultiplier).toFixed(2)
      );

      this.$nextTick(() => {
        this.isUpdating = false;
      });
    },

    updateFromSellPrice() {
      if (this.isUpdating) return;
      this.isUpdating = true;

      // Calcular utilidad basada en precio de venta y precio de compra
      if (this.localProduct.buyPrice > 0) {
        const profit = this.localProduct.sellPrice - this.localProduct.buyPrice;
        this.localProduct.utilidad = Number(
          ((profit / this.localProduct.buyPrice) * 100).toFixed(2)
        );
      }

      this.$nextTick(() => {
        this.isUpdating = false;
      });
    },

    resetChanges() {
      this.addQuantity = 0;
      this.localProduct = { ...this.originalValues };
      this.$emit("close");
    },

    async saveChanges() {
      const updatedProduct = {
        ...this.product,
        quantity: this.newTotalQuantity,
        buyPrice: this.localProduct.buyPrice,
        utilidad: this.localProduct.utilidad,
        sellPrice: this.localProduct.sellPrice,
      };

      const response = await api.patch(
        `/products/patch/update-product/${updatedProduct._id}`,
        updatedProduct
      );

      const data = response.data;

      if (data.success) {
        this.$emit("submit");
      } else {
        this.$emit("error", data.message || "Error al actualizar el producto");
      }

      // Actualizar valores originales
      this.originalValues = {
        ...this.localProduct,
        quantity: this.newTotalQuantity,
      };
      this.addQuantity = 0;
    },
  },
};
</script>

<style scoped>
.product-quick-update {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 1.25rem;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
  max-width: 500px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.product-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e5e9;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.product-code {
  font-size: 14px;
  color: #718096;
}

.update-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-input:hover {
  border-color: #a0aec0;
}

.input-group .form-input {
  padding-left: 32px;
}

.input-group .currency {
  position: absolute;
  left: 12px;
  color: #718096;
  font-weight: 500;
  z-index: 1;
}

.input-group .percentage {
  position: absolute;
  right: 12px;
  color: #718096;
  font-weight: 500;
}

.quantity-info {
  margin-bottom: 8px;
}

.current-stock {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
  background: #f7fafc;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  display: inline-block;
}

.quantity-result {
  margin-top: 8px;
  margin-bottom: 4px;
}

.new-total {
  font-size: 14px;
  color: #38a169;
  font-weight: 600;
  background: #f0fff4;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #c6f6d5;
  display: inline-block;
}

.min-max-info {
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
}

.profit-info {
  background: #f7fafc;
  padding: 16px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e2e8f0;
}

.profit-label {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.profit-amount {
  font-size: 16px;
  font-weight: 600;
  color: #38a169;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #edf2f7;
}

.btn-primary {
  background: #f9931e;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #f9931e;
}

.btn-primary:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .product-quick-update {
    padding: 16px;
    margin: 16px;
    width: calc(100vw - 32px);
    max-width: none;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
