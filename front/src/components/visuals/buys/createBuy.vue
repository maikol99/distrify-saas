<template>
  <Teleport to="body">
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm">
    <div class="bg-white w-screen h-screen md:w-[900px] md:h-auto md:max-h-[90vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 md:rounded-t-3xl text-orange-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">add_circle</span>
          Registrar Compra
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      
      <div class="modal-body p-5 flex-1 overflow-y-auto">
        <!-- Sección de datos básicos de la compra -->
        <div class="section">
          <h3 class="section-title">
            <i class="fas fa-file-invoice"></i>
            Datos de la Compra
          </h3>
          
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
            <label for="isDebt">Pagado:</label>
            <select
              v-model="currentPurchase.isPaid"
              id="isDebt"
              class="form-control"
            >
              <option value="" disabled>Seleccionar...</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
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
                :readonly="productsToAdd.length > 0"
                required
              />
              <small v-if="productsToAdd.length > 0" class="form-text text-success">
                Total calculado automáticamente desde los productos: ${{ totalProductsAmount.toFixed(2) }}
              </small>
              <small v-else class="form-text text-muted">
                Ingrese el total manualmente o agregue productos para calcular automáticamente
              </small>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="paymentMethod">Método de Pago:</label>
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
            <div class="form-group">
              <label>Métodos de pago múltiples:</label>
              <button
                class="btn-secondary"
                @click="showingModalPaymentMethods = true"
              >
                <i class="fas fa-credit-card"></i> Ingresar métodos
              </button>
            </div>
          </div>
        </div>

        <!-- Sección de productos -->
        <div class="section">
          <h3 class="section-title">
            <i class="fas fa-boxes"></i>
            Productos de la Compra
            <button 
              v-if="!showProductsSection" 
              @click="showProductsSection = true" 
              class="btn-toggle"
            >
              <i class="fas fa-plus"></i> Agregar productos
            </button>
            <button 
              v-else 
              @click="toggleProductsSection" 
              class="btn-toggle"
            >
              <i class="fas fa-minus"></i> Ocultar productos
            </button>
          </h3>
          
          <!-- Sección de productos expandible -->
          <div v-if="showProductsSection" class="products-section">
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
                <div class="form-group">
                  <label class="subtotal-preview">
                    Subtotal: ${{ (selectedProductData.quantity * selectedProductData.buyPrice).toFixed(2) }}
                  </label>
                </div>
                <button @click="addProductToList" class="btn-primary">
                  <i class="fas fa-plus"></i> 
                  {{ editingIndex >= 0 ? 'Actualizar Producto' : 'Agregar Producto' }}
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
                  <span class="price">${{ item.buyPrice.toFixed(2) }}</span>
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
        </div>

        <!-- Sección de gastos adicionales -->
        <div class="section">
          <h3 class="section-title">
            <i class="fas fa-receipt"></i>
            Gastos Adicionales
            <button v-if="!showCostsSection" @click="showCostsSection = true" class="btn-toggle">
              <i class="fas fa-plus"></i> Agregar gastos
            </button>
            <button v-else @click="showCostsSection = false" class="btn-toggle">
              <i class="fas fa-minus"></i> Ocultar
            </button>
          </h3>

          <div v-if="showCostsSection" class="products-section">
            <p class="costs-description">
              Agregá gastos como fletes, impuestos, aduanas u otros costos asociados a esta compra para obtener métricas de margen más precisas.
            </p>

            <!-- Formulario de nuevo gasto -->
            <div class="cost-form form-row">
              <div class="form-group">
                <label>Descripción:</label>
                <input
                  v-model="newCost.description"
                  type="text"
                  class="form-control"
                  placeholder="Ej: Flete, Impuesto, Aduana..."
                />
              </div>
              <div class="form-group">
                <label>Categoría:</label>
                <select v-model="newCost.category" class="form-control">
                  <optgroup label="Logística">
                    <option value="Flete">Flete / Transporte</option>
                    <option value="Envío express">Envío express</option>
                    <option value="Logística inversa">Logística inversa / Devolución</option>
                    <option value="Almacenamiento">Almacenamiento / Depósito</option>
                  </optgroup>
                  <optgroup label="Impuestos y aduanas">
                    <option value="Impuesto">Impuesto / Aduana</option>
                    <option value="IVA">IVA</option>
                    <option value="Percepción">Percepción impositiva</option>
                    <option value="Arancel de importación">Arancel de importación</option>
                    <option value="Tasa municipal">Tasa municipal / provincial</option>
                  </optgroup>
                  <optgroup label="Financiero">
                    <option value="Comisión">Comisión / Intermediario</option>
                    <option value="Interés financiero">Interés financiero</option>
                    <option value="Recargo tarjeta">Recargo tarjeta / cuotas</option>
                    <option value="Diferencia de cambio">Diferencia de cambio</option>
                  </optgroup>
                  <optgroup label="Seguros y servicios">
                    <option value="Seguro">Seguro de mercadería</option>
                    <option value="Certificación">Certificación / Habilitación</option>
                    <option value="Inspección">Inspección / Control de calidad</option>
                    <option value="Embalaje especial">Embalaje especial</option>
                  </optgroup>
                  <optgroup label="Otros">
                    <option value="Descuento recibido">Descuento recibido (negativo)</option>
                    <option value="Otro">Otro</option>
                  </optgroup>
                </select>
              </div>
              <div class="form-group">
                <label>Monto:</label>
                <input
                  v-model.number="newCost.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  placeholder="0.00"
                />
              </div>
              <div class="form-group form-group--btn">
                <button @click="addCost" class="btn-primary" :disabled="!newCost.description || newCost.amount <= 0">
                  <i class="fas fa-plus"></i> Agregar
                </button>
              </div>
            </div>

            <!-- Lista de gastos agregados -->
            <div v-if="additionalCosts.length > 0" class="costs-list">
              <div class="products-table">
                <div class="table-header costs-header">
                  <span>Descripción</span>
                  <span>Categoría</span>
                  <span>Monto</span>
                  <span>Acción</span>
                </div>
                <div v-for="(cost, idx) in additionalCosts" :key="idx" class="table-row costs-row">
                  <span>{{ cost.description }}</span>
                  <span class="cost-badge">{{ cost.category }}</span>
                  <span class="cost-amount">${{ cost.amount.toFixed(2) }}</span>
                  <button @click="removeCost(idx)" class="btn-remove">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="total-section">
                Total gastos adicionales: <strong>${{ totalAdditionalCostsAmount.toFixed(2) }}</strong>
                <span class="real-cost-label">
                  · Costo real total: <strong class="text-orange">${{ (currentTotal + totalAdditionalCostsAmount).toFixed(2) }}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div><!-- end modal-body -->

      <!-- FOOTER -->
      <div class="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 md:rounded-b-3xl mt-auto shadow-inner">
        <button @click="$emit('close')" class="py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto">
          Cancelar
        </button>        
        <button @click.prevent="savePurchase()" class="py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading">
          <span class="material-symbols-outlined mr-2 animate-spin" v-if="loading">progress_activity</span>
          Guardar Compra
          <span v-if="productsToAdd.length > 0">(con {{ productsToAdd.length }} productos)</span>
        </button>
      </div>
    </div>
  </div>

    <!-- Modal de métodos de pago -->
    <paymentMethods
      @purchase-registered="handlePaymentMethods"
      :venta="currentTotal"
      v-if="showingModalPaymentMethods"
      @close="showingModalPaymentMethods = false"
    />

  <spinnerComponent v-if="loading" />
  </Teleport>
</template>

<script>
import paymentMethods from "@/components/visuals/sales/paymentMethods.vue";
import moment from "moment";
import { useSuppliersStore } from "@/stores/suppliersStore";
import api from "@/config/axios.config";
import spinnerComponent from "../spinnerComponent.vue";
import { useGlobalStore } from "@/stores/globalStore";
import { useBuysStore } from "@/stores/buysStore";

export default {
  name: "CreatePurchaseModal",
  components: {
    spinnerComponent,
    paymentMethods,
  },

  emits: ["save", "close"],
  data() {
    return {
      currentPurchase: {
        supplierId: "",
        category: "",
        date: moment().format("YYYY-MM-DD"),
        total: 0,
        shopId: "",
        isPaid: true,
      },
      paymentMethod: "Efectivo",
      paymentMethods: [],
      showingModalPaymentMethods: false,
      loading: false,
      supplierStore: useSuppliersStore(),
      globalStore: useGlobalStore(),
      
      // Variables para productos
      showProductsSection: false,
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
      searchTimeout: null,
      editingIndex: -1,
      buysStore: useBuysStore(),

      // Variables para gastos adicionales
      showCostsSection: false,
      additionalCosts: [],
      newCost: {
        description: "",
        category: "Flete",
        amount: 0,
      },
    };
  },

  computed: {
    totalProductsAmount() {
      return this.productsToAdd.reduce((total, item) => {
        return total + (item.quantity * item.buyPrice);
      }, 0);
    },
    currentTotal() {
      return this.productsToAdd.length > 0 ? this.totalProductsAmount : this.currentPurchase.total;
    },
    totalAdditionalCostsAmount() {
      return this.additionalCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
    },
  },

  watch: {
    // Actualizar automáticamente el total cuando cambian los productos
    totalProductsAmount: {
      handler(newVal) {
        if (this.productsToAdd.length > 0) {
          this.currentPurchase.total = newVal;
        }
      },
      immediate: true
    },
    // Resetear el total manual cuando se agregan productos
    'productsToAdd.length'(newLength, oldLength) {
      if (newLength > 0 && oldLength === 0) {
        // Cuando se agrega el primer producto, usar el total calculado
        this.currentPurchase.total = this.totalProductsAmount;
      } else if (newLength === 0 && oldLength > 0) {
        // Cuando se eliminan todos los productos, resetear a 0
        this.currentPurchase.total = 0;
      }
    }
  },

  methods: {
    addCost() {
      if (!this.newCost.description || this.newCost.amount <= 0) return;
      this.additionalCosts.push({ ...this.newCost });
      this.newCost = { description: "", category: "Flete", amount: 0 };
    },
    removeCost(idx) {
      this.additionalCosts.splice(idx, 1);
    },

    resetForm() {
      this.currentPurchase = {
        supplierId: "",
        category: "",
        date: moment().format("YYYY-MM-DD"),
        total: 0,
        isPaid: true,
      };
      this.paymentMethod = "Efectivo";
      this.paymentMethods = [];
      this.productsToAdd = [];
      this.showProductsSection = false;
      this.additionalCosts = [];
      this.showCostsSection = false;
      this.newCost = { description: "", category: "Flete", amount: 0 };
      this.clearSelectedProduct();
    },

    toggleProductsSection() {
      this.showProductsSection = !this.showProductsSection;
      if (!this.showProductsSection) {
        this.clearSelectedProduct();
      }
    },

    // Métodos de búsqueda de productos
    searchProducts() {
      if (this.searchQuery.length < 2) {
        this.searchResults = [];
        this.showSearchResults = false;
        return;
      }

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

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
      if (!this.selectedProduct || !this.selectedProductData.quantity || this.selectedProductData.buyPrice <= 0) {
        this.showToast("Por favor complete todos los campos correctamente", "danger");
        return;
      }

      const productData = {
        productId: this.selectedProduct._id,
        product: this.selectedProduct,
        quantity: this.selectedProductData.quantity,
        buyPrice: this.selectedProductData.buyPrice,
      };

      if (this.editingIndex >= 0) {
        // Editando producto existente
        this.productsToAdd[this.editingIndex] = productData;
        this.editingIndex = -1;
        this.showToast("Producto actualizado correctamente", "success");
      } else {
        // Verificar si el producto ya existe
        const existingIndex = this.productsToAdd.findIndex(
          item => item.productId === this.selectedProduct._id
        );

        if (existingIndex >= 0) {
          // Si existe, sumar la cantidad
          this.productsToAdd[existingIndex].quantity += this.selectedProductData.quantity;
          this.showToast("Cantidad actualizada para el producto existente", "info");
        } else {
          // Si no existe, agregarlo
          this.productsToAdd.push(productData);
          this.showToast("Producto agregado correctamente", "success");
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
      
      // Hacer scroll hacia el formulario de productos
      this.$nextTick(() => {
        const productForm = this.$el.querySelector('.selected-product-form');
        if (productForm) {
          productForm.scrollIntoView({ behavior: 'smooth' });
        }
      });
    },

    removeProduct(index) {
      if (confirm("¿Está seguro de eliminar este producto de la compra?")) {
        this.productsToAdd.splice(index, 1);
        this.showToast("Producto eliminado", "info");
        
        // Si estamos editando este producto, limpiar la selección
        if (this.editingIndex === index) {
          this.clearSelectedProduct();
        } else if (this.editingIndex > index) {
          this.editingIndex--;
        }
      }
    },

    // Validaciones antes de guardar
    validatePurchaseData() {
      const errors = [];

      if (!this.currentPurchase.supplierId) {
        errors.push("Debe seleccionar un proveedor");
      }
      
      if (!this.currentPurchase.category) {
        errors.push("Debe seleccionar una categoría");
      }
      
      if (!this.currentPurchase.date) {
        errors.push("Debe ingresar la fecha de compra");
      }
      
      if (this.currentTotal <= 0) {
        errors.push("El total debe ser mayor a 0");
      }
      
      if (this.currentPurchase.isPaid === "") {
        errors.push("Debe especificar si la compra está pagada");
      }

      return errors;
    },

    async savePurchase() {
      try {
        // Validar datos básicos
        const validationErrors = this.validatePurchaseData();
        if (validationErrors.length > 0) {
          this.showToast(validationErrors[0], "danger");
          return;
        }

        // Validar si hay productos seleccionados pero no agregados
        if (this.selectedProduct && !this.productsToAdd.some(p => p.productId === this.selectedProduct._id)) {
          const confirmMessage = `Tiene un producto seleccionado "${this.selectedProduct.name}" pero no lo ha agregado a la lista. ¿Desea continuar sin agregarlo?`;
          if (!confirm(confirmMessage)) {
            return;
          }
        }

        // Validar si no hay productos en una compra de mercadería
        if (this.productsToAdd.length === 0 && this.currentPurchase.category.includes("mercadería")) {
          const confirmMessage = "No ha agregado productos a esta compra de mercadería. ¿Está seguro de continuar?";
          if (!confirm(confirmMessage)) {
            return;
          }
        }

        this.loading = true;
        const shopId = this.globalStore.shopId();
        const userName = this.globalStore.userName();

        const purchaseData = {
          supplierId: this.currentPurchase.supplierId,
          category: this.currentPurchase.category,
          date: this.currentPurchase.date,
          total: this.currentTotal,
          cashierName: userName,
          userName: userName,
          shopId: shopId,
          isPaid: this.currentPurchase.isPaid === "true",
          productsAdded: this.productsToAdd.length > 0,
          additionalCosts: this.additionalCosts,
          totalAdditionalCosts: this.totalAdditionalCostsAmount,
          realCost: this.currentTotal + this.totalAdditionalCostsAmount,
        };

        // Agregar métodos de pago
        if (this.paymentMethods.length > 0) {
          purchaseData.paymentMethods = this.paymentMethods;
        } else {
          purchaseData.paymentMethod = this.paymentMethod || "Efectivo";
        }

        // Agregar productos si existen
        if (this.productsToAdd.length > 0) {
          purchaseData.products = this.productsToAdd.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            buyPrice: item.buyPrice,
          }));
        }

        console.log('Enviando datos de compra:', purchaseData);

        const response = await api.post("/buys/post/create-buy", purchaseData);
        const data = response.data;

        if (data.success) {
          this.showToast("Compra registrada exitosamente", "success");
          this.$emit("submit");
          this.resetForm();
          this.$emit("close");
        } else {
          this.showToast(data.message || "Error al registrar la compra", "danger");
        }
      } catch (error) {
        console.error("Error al registrar la compra:", error);
        let errorMessage = "No se pudo registrar la compra. Intente nuevamente.";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showToast(errorMessage, "danger");
      } finally {
        this.loading = false;
      }
    },

    handlePaymentMethods(saleData) {
      this.paymentMethods = saleData.paymentMethods;
      this.showingModalPaymentMethods = false;
    },

    showToast(message, type = "info") {
      this.buysStore.toast = {
        showing: true,
        message: message,
        type: type,
      };
    },

    // Click fuera del dropdown para cerrarlo
    handleClickOutside(event) {
      const searchContainer = this.$el?.querySelector('.search-section');
      if (searchContainer && !searchContainer.contains(event.target)) {
        this.showSearchResults = false;
      }
    },
  },

  async mounted() {
    await this.supplierStore.getSuppliersNames();
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
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
}

.modal-content {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  width: 100%;
  max-width: 860px;
  height: 90vh;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
  border-radius: 1rem 1rem 0 0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.modal-header h2::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.25rem;
  background: #f9931e;
  border-radius: 2px;
}

.modal-body {
  padding: 1.5rem 1.75rem;
  flex-grow: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
  border-radius: 0 0 1rem 1rem;
}

/* Secciones */
.section {
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  padding: 0.875rem 1.25rem;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.section-title i {
  margin-right: 0.5rem;
  color: #f9931e;
}

.section > .form-group,
.section > .form-row {
  margin: 1.25rem;
}

.products-section {
  padding: 1.25rem;
}

.btn-toggle {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-toggle:hover {
  background-color: #e8821a;
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
  max-height: 300px;
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

.form-control:readonly {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-text {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
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

/* Additional costs */
.costs-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
}
.cost-form {
  grid-template-columns: 2fr 1.5fr 1fr auto;
  align-items: flex-end;
}
.form-group--btn {
  margin-bottom: 1.25rem;
}
.costs-header {
  grid-template-columns: 2fr 1.5fr 1fr 60px;
}
.costs-row {
  grid-template-columns: 2fr 1.5fr 1fr 60px;
}
.cost-badge {
  display: inline-block;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
}
.cost-amount {
  font-weight: 600;
  color: #dc2626;
}
.real-cost-label {
  margin-left: 1.5rem;
  color: #6b7280;
}
.text-orange {
  color: #f9931e;
}
.costs-list {
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .modal-content {
    width: 100%;
    max-width: 100%;
    height: 95vh;
    max-height: 95vh;
    border-radius: 1rem 1rem 0 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: left;
  }

  .table-header span,
  .table-row > * {
    padding: 0.25rem 0;
  }

  .table-header span:before,
  .table-row > *:before {
    content: attr(data-label) ': ';
    font-weight: 600;
    display: inline-block;
    width: 100px;
  }

  .actions {
    justify-content: center;
    margin-top: 0.5rem;
  }

  .product-details {
    align-items: flex-start;
  }

  .search-result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .section-title {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  .btn-toggle {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-content {
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .section-title {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .products-section {
    padding: 1rem;
  }
}
</style>
