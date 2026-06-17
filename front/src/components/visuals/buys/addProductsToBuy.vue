<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Asignar Productos a la Compra</h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Información de la compra -->
        <div v-if="purchase" class="purchase-info">
          <h3>Información de la Compra</h3>
          <p><strong>Fecha:</strong> {{ formatDate(purchase.date) }}</p>
          <p><strong>Proveedor:</strong> {{ purchase.supplierName }}</p>
          <p><strong>Total:</strong> ${{ purchase.total }}</p>
        </div>

        <!-- Buscador de productos -->
        <div class="search-section">
          <div class="form-group">
            <label for="productSearch">Buscar Producto:</label>
            <div class="search-container">
              <input
                id="productSearch"
                v-model="searchQuery"
                @input="searchProducts"
                type="text"
                class="form-control"
                placeholder="Escriba el nombre del producto..."
              />
              <i class="fas fa-search search-icon"></i>
            </div>
          </div>

          <!-- Resultados de búsqueda -->
          <div v-if="searchResults.length > 0 && showSearchResults" class="search-results">
            <div
              v-for="product in searchResults"
              :key="product._id"
              @click="selectProduct(product)"
              class="search-result-item"
            >
              <div class="product-info">
                <span class="product-name">{{ product.name }}</span>
                <span class="product-code">{{ product.code }}</span>
              </div>
              <div class="product-details">
                <span class="product-price">${{ product.sellPrice }}</span>
                <span class="product-stock">Stock: {{ product.quantity }}</span>
              </div>
            </div>
          </div>

          <!-- Mensaje cuando no hay resultados -->
          <div v-if="searchQuery && searchResults.length === 0 && !searchLoading" class="no-results">
            No se encontraron productos
          </div>

          <!-- Loading de búsqueda -->
          <div v-if="searchLoading" class="search-loading">
            <i class="fas fa-spinner fa-spin"></i> Buscando...
          </div>
        </div>

        <!-- Formulario para agregar producto seleccionado -->
        <div v-if="selectedProduct" class="selected-product-form">
          <h4>Producto Seleccionado</h4>
          <div class="product-card">
            <div class="product-header">
              <span class="product-name">{{ selectedProduct.name }}</span>
              <button @click="clearSelectedProduct" class="btn-clear">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="quantity">Cantidad:</label>
                <input
                  id="quantity"
                  v-model.number="selectedProductData.quantity"
                  type="number"
                  min="1"
                  class="form-control"
                  required
                />
              </div>
              <div class="form-group">
                <label for="buyPrice">Precio de Compra:</label>
                <input
                  id="buyPrice"
                  v-model.number="selectedProductData.buyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <button @click="addProductToList" class="btn-primary">
              <i class="fas fa-plus"></i> Agregar Producto
            </button>
          </div>
        </div>

        <!-- Lista de productos agregados -->
        <div v-if="productsToAdd.length > 0" class="products-list">
          <h4>Productos Agregados ({{ productsToAdd.length }})</h4>
          <div class="products-table">
            <div class="table-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span>Subtotal</span>
              <span>Acciones</span>
            </div>
            <div
              v-for="(item, index) in productsToAdd"
              :key="index"
              class="table-row"
            >
              <span class="product-name">{{ item.product.name }}</span>
              <span class="quantity">{{ item.quantity }}</span>
              <span class="price">${{ item.buyPrice }}</span>
              <span class="subtotal">${{ (item.quantity * item.buyPrice).toFixed(2) }}</span>
              <div class="actions">
                <button @click="editProduct(index)" class="btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="removeProduct(index)" class="btn-remove">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="total-section">
            <strong>Total de Productos: ${{ totalProductsAmount.toFixed(2) }}</strong>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          @click="saveProducts"
          class="btn-primary"
          :disabled="loading || productsToAdd.length === 0"
        >
          <i class="fas fa-spinner fa-spin" v-if="loading"></i>
          <i class="fas fa-save" v-else></i>
          Guardar Productos ({{ productsToAdd.length }})
        </button>
        <button @click="$emit('close')" class="btn-secondary">Cancelar</button>
      </div>
    </div>
  </div>

  <spinnerComponent v-if="loading" />
</template>

<script>
import api from "@/config/axios.config";
import moment from "moment";
import spinnerComponent from "../spinnerComponent.vue";
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "AssignProductsModal",
  components: {
    spinnerComponent,
  },
  props: {
    purchase: {
      type: Object,
      required: true,
    },
  },
  emits: ["save", "close"],
  
  data() {
    return {
      searchQuery: "",
      searchResults: [],
      searchLoading: false,
      showSearchResults: false,
      selectedProduct: null,
      selectedProductData: {
        quantity: 1,
        buyPrice: 0,
      },
      productsToAdd: [],
      loading: false,
      searchTimeout: null,
      editingIndex: -1,
      globalStore: useGlobalStore(),
    };
  },

  computed: {
    totalProductsAmount() {
      return this.productsToAdd.reduce((total, item) => {
        return total + (item.quantity * item.buyPrice);
      }, 0);
    },
  },

  methods: {
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },

    searchProducts() {
      if (this.searchQuery.length < 2) {
        this.searchResults = [];
        this.showSearchResults = false;
        return;
      }

      // Limpiar timeout anterior
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Crear nuevo timeout
      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    },

    async performSearch() {
      try {
        this.searchLoading = true;
        const shopId = this.globalStore.shopId();
        
        const response = await api.get(
          `/products/get/search-product/${shopId}?name=${encodeURIComponent(this.searchQuery)}&page=1&limit=10`
        );
        
        if (response.data.success) {
          this.searchResults = response.data.data;
          this.showSearchResults = true;
        }
      } catch (error) {
        console.error("Error al buscar productos:", error);
        this.searchResults = [];
      } finally {
        this.searchLoading = false;
      }
    },

    selectProduct(product) {
      this.selectedProduct = product;
      this.selectedProductData = {
        quantity: 1,
        buyPrice: product.buyPrice || 0,
      };
      this.showSearchResults = false;
      this.searchQuery = product.name;
    },

    clearSelectedProduct() {
      this.selectedProduct = null;
      this.selectedProductData = {
        quantity: 1,
        buyPrice: 0,
      };
      this.searchQuery = "";
      this.editingIndex = -1;
    },

    addProductToList() {
      if (!this.selectedProduct || !this.selectedProductData.quantity || !this.selectedProductData.buyPrice) {
        alert("Por favor complete todos los campos");
        return;
      }

      const productData = {
        productId: this.selectedProduct._id,
        product: this.selectedProduct,
        quantity: this.selectedProductData.quantity,
        buyPrice: this.selectedProductData.buyPrice,
      };

      if (this.editingIndex >= 0) {
        // Modo edición
        this.productsToAdd[this.editingIndex] = productData;
        this.editingIndex = -1;
      } else {
        // Verificar si el producto ya existe
        const existingIndex = this.productsToAdd.findIndex(
          item => item.productId === this.selectedProduct._id
        );

        if (existingIndex >= 0) {
          // Actualizar cantidad existente
          this.productsToAdd[existingIndex].quantity += this.selectedProductData.quantity;
        } else {
          // Agregar nuevo producto
          this.productsToAdd.push(productData);
        }
      }

      this.clearSelectedProduct();
    },

    editProduct(index) {
      const item = this.productsToAdd[index];
      this.selectedProduct = item.product;
      this.selectedProductData = {
        quantity: item.quantity,
        buyPrice: item.buyPrice,
      };
      this.searchQuery = item.product.name;
      this.editingIndex = index;
    },

    removeProduct(index) {
      if (confirm("¿Está seguro de eliminar este producto?")) {
        this.productsToAdd.splice(index, 1);
      }
    },

    async saveProducts() {
      try {
        this.loading = true;

        const productsData = this.productsToAdd.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          buyPrice: item.buyPrice,
        }));

        const updateData = {
          products: productsData,
          productsAdded: true,
        };

        const response = await api.patch(`/buys/patch/update-buy/${this.purchase._id}`, updateData);
        
        if (response.data.success) {
          this.$emit("save", {
            products: productsData,
            total: this.totalProductsAmount,
          });
          this.$emit("close");
        }
      } catch (error) {
        console.error("Error al guardar productos:", error);
        if (error.response) {
          alert(`Error: ${error.response.data.message || "No se pudieron guardar los productos"}`);
        } else {
          alert("No se pudieron guardar los productos. Intente nuevamente.");
        }
      } finally {
        this.loading = false;
      }
    },

    // Click fuera del dropdown para cerrarlo
    handleClickOutside(event) {
      const searchContainer = this.$el.querySelector('.search-section');
      if (searchContainer && !searchContainer.contains(event.target)) {
        this.showSearchResults = false;
      }
    },
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
/* Modales */
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

/* Información de la compra */
.purchase-info {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
}

.purchase-info h3 {
  margin: 0 0 0.75rem 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.purchase-info p {
  margin: 0.25rem 0;
  color: #4a5568;
}

/* Sección de búsqueda */
.search-section {
  margin-bottom: 1.5rem;
  position: relative;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 500px;
  overflow-y: auto;
}

.search-result-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f8fafc;
}

.search-result-item:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
}

.product-code {
  font-size: 0.875rem;
  color: #6b7280;
}

.product-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.product-price {
  font-weight: 600;
  color: #059669;
}

.product-stock {
  font-size: 0.875rem;
  color: #6b7280;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.search-loading {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
}

/* Producto seleccionado */
.selected-product-form {
  margin-bottom: 1.5rem;
}

.selected-product-form h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.product-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-header .product-name {
  font-weight: 600;
  color: #2d3748;
}

.btn-clear {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

.btn-clear:hover {
  background-color: #fee2e2;
}

/* Lista de productos */
.products-list {
  margin-bottom: 1.5rem;
}

.products-list h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.products-table {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 120px;
  gap: 1rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 120px;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #f8fafc;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-remove {
  background: transparent;
  border: none;
  padding: 0.375rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-edit {
  color: #3b82f6;
}

.btn-edit:hover {
  background-color: #dbeafe;
}

.btn-remove {
  color: #ef4444;
}

.btn-remove:hover {
  background-color: #fee2e2;
}

.total-section {
  padding: 1rem;
  text-align: right;
  background-color: #f8fafc;
  border-top: 1px solid #e5e7eb;
  font-size: 1.1rem;
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
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
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
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: none;
    max-height: 95vh;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header span,
  .table-row > * {
    padding: 0.25rem 0;
  }

  .actions {
    justify-content: center;
  }

  .product-details {
    align-items: flex-start;
  }

  .search-result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>