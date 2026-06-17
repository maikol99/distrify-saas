<template>
  <div class="sales-container animate-fade-in">

    <!-- ===== GATE DE TURNO (cubre solo la sección de ventas) ===== -->
    <div v-if="showTurnGate" class="turn-gate-overlay">
      <div class="turn-gate-card">
        <div class="turn-gate-icon">
          <span class="material-symbols-outlined">schedule</span>
        </div>
        <h2 class="turn-gate-title">Turno no iniciado</h2>
        <p class="turn-gate-desc">
          Tu negocio usa el sistema de turnos. Debés abrir un turno antes de
          comenzar a vender.
        </p>
        <button class="btn-open-turn" @click="showingOpenTurnModal = true">
          <span class="material-symbols-outlined">play_circle</span>
          Abrir Turno
        </button>
      </div>
    </div>

    <!-- ===== MODAL: ABRIR TURNO ===== -->
    <Teleport to="body">
    <div v-if="showingOpenTurnModal" class="turn-modal-backdrop" @click.self="showingOpenTurnModal = false">
      <div class="turn-modal-card">
        <div class="turn-modal-header">
          <div class="turn-modal-header-icon">
            <span class="material-symbols-outlined">schedule</span>
          </div>
          <div>
            <h3>Abrir Turno</h3>
            <p>Ingresá el efectivo inicial y una nota opcional</p>
          </div>
          <button class="btn-modal-close" @click="showingOpenTurnModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="turn-modal-body">
          <div class="turn-form-group">
            <label>Efectivo inicial</label>
            <input
              type="number"
              v-model.number="openTurnForm.efectivoRecibido"
              min="0"
              placeholder="Ej: 5000"
              class="turn-input"
            />
          </div>
          <div class="turn-form-group">
            <label>Nota de apertura (opcional)</label>
            <textarea
              v-model="openTurnForm.descriptionApertura"
              rows="2"
              placeholder="Ej: Turno mañana"
              class="turn-input"
            ></textarea>
          </div>
          <p v-if="turnsStore.error" class="turn-error">{{ turnsStore.error }}</p>
        </div>
        <div class="turn-modal-footer">
          <button class="btn-turn-cancel" @click="showingOpenTurnModal = false">Cancelar</button>
          <button
            class="btn-turn-confirm"
            :disabled="turnsStore.loading"
            @click="handleOpenTurn"
          >
            <span class="material-symbols-outlined">play_circle</span>
            {{ turnsStore.loading ? "Abriendo..." : "Abrir Turno" }}
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- ===== MODAL: CERRAR TURNO ===== -->
    <Teleport to="body">
    <div v-if="showingCloseTurnModal" class="turn-modal-backdrop" @click.self="showingCloseTurnModal = false">
      <div class="turn-modal-card">
        <div class="turn-modal-header">
          <div class="turn-modal-header-icon close-icon">
            <span class="material-symbols-outlined">stop_circle</span>
          </div>
          <div>
            <h3>Cerrar Turno</h3>
            <p>Revisá los totales y confirmá el cierre</p>
          </div>
          <button class="btn-modal-close" @click="showingCloseTurnModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="turn-modal-body">
          <div v-if="turnsStore.closingLoading" class="turn-loading">
            <div class="turn-spinner"></div>
            <span>Calculando totales...</span>
          </div>
          <template v-else-if="turnsStore.closingPreview">
            <div class="turn-summary-grid">
              <div class="turn-summary-item">
                <span class="turn-summary-label">Total ventas</span>
                <span class="turn-summary-value highlight">${{ (turnsStore.closingPreview.totalVentas || 0).toLocaleString('es-AR') }}</span>
              </div>
              <div class="turn-summary-item">
                <span class="turn-summary-label">Efectivo</span>
                <span class="turn-summary-value">${{ (turnsStore.closingPreview.totalEfectivo || 0).toLocaleString('es-AR') }}</span>
              </div>
              <div class="turn-summary-item">
                <span class="turn-summary-label">Transferencia</span>
                <span class="turn-summary-value">${{ (turnsStore.closingPreview.totalTransferencia || 0).toLocaleString('es-AR') }}</span>
              </div>
              <div class="turn-summary-item">
                <span class="turn-summary-label">Tarjeta</span>
                <span class="turn-summary-value">${{ (turnsStore.closingPreview.totalTarjeta || 0).toLocaleString('es-AR') }}</span>
              </div>
              <div class="turn-summary-item">
                <span class="turn-summary-label">Cuenta corriente</span>
                <span class="turn-summary-value">${{ (turnsStore.closingPreview.totalCuentaCorriente || 0).toLocaleString('es-AR') }}</span>
              </div>
              <div class="turn-summary-item">
                <span class="turn-summary-label">Ventas realizadas</span>
                <span class="turn-summary-value">{{ turnsStore.closingPreview.cantidadVentas || 0 }}</span>
              </div>
            </div>
            <div class="turn-form-group">
              <label>Efectivo presentado</label>
              <input
                type="number"
                v-model.number="closeTurnForm.efectivoPresentado"
                min="0"
                placeholder="Ej: 4800"
                class="turn-input"
              />
            </div>
            <div class="turn-form-group">
              <label>Nota de cierre (opcional)</label>
              <textarea
                v-model="closeTurnForm.descriptionCierre"
                rows="2"
                placeholder="Ej: Todo en orden"
                class="turn-input"
              ></textarea>
            </div>
          </template>
          <p v-if="turnsStore.error" class="turn-error">{{ turnsStore.error }}</p>
        </div>
        <div class="turn-modal-footer">
          <button class="btn-turn-cancel" @click="showingCloseTurnModal = false">Cancelar</button>
          <button
            class="btn-turn-close-confirm"
            :disabled="turnsStore.loading || turnsStore.closingLoading"
            @click="handleCloseTurn"
          >
            <span class="material-symbols-outlined">stop_circle</span>
            {{ turnsStore.loading ? "Cerrando..." : "Cerrar Turno" }}
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Header con navegación y búsqueda -->
    <header class="header">
      <!-- Indicador de turno activo + botón cerrar -->
      <div v-if="turnsEnabled && turnsStore.hasOpenTurn" class="turn-active-bar">
        <div class="turn-active-info">
          <span class="material-symbols-outlined turn-active-icon">schedule</span>
          <span>Turno activo — {{ turnsStore.currentTurn?.userName }}</span>
        </div>
        <button class="btn-close-turn-header" @click="handleOpenCloseTurnModal">
          <span class="material-symbols-outlined">stop_circle</span>
          Cerrar Turno
        </button>
      </div>

      <div class="search-container">
        <div class="search-bar">
          <span class="material-symbols-outlined">barcode_scanner</span>
          <input
            v-model="salesStore.searchQuery"
            @input="checkInput"
            @keypress.enter="salesStore.searchProducts()"
            :placeholder="
              salesStore.searchType === 'name'
                ? 'Buscar producto por nombre'
                : salesStore.searchType === 'code'
                  ? 'Buscar producto por código de barras'
                  : 'Buscar producto por nombre o código de barras'
            "
          />
          <select v-model="salesStore.searchType" name="" id="">
            <option value="name">Buscar por nombre</option>
            <option value="code">Buscar por código</option>
          </select>
          <button
            @click="salesStore.searchProducts()"
            class="btn-search"
            :disabled="salesStore.searchQuery === ''"
          >
            <span class="material-symbols-outlined" style="color: white">search</span>
          </button>
        </div>
      </div>
      <div class="quick-action-buttons">
        <button @click="showQuickInput = true" class="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
          + Ingreso
        </button>
        <button @click="showQuickOutput = true" class="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 ml-2">
          - Egreso
        </button>
      </div>
      <!-- <button @click="showingModalCreate = true" class="btn-create">
        Crear producto
      </button> -->
    </header>

    <!-- Resultados de búsqueda de productos -->
    <div v-if="salesStore.searchResults.length > 0" class="search-results">
      <h3>Resultados de búsqueda de productos</h3>
      <ul class="results-list">
        <li
          v-for="product in salesStore.searchResults"
          :key="product._id"
          class="result-item"
          @click="salesStore.addToCart(product)"
        >
          <div class="result-icon-placeholder">
            <span class="material-symbols-outlined">{{ getCategoryIcon(product.category) }}</span>
          </div>
          <div v-if="product.sellPrice" class="result-details">
            <span class="result-category">{{
              product.category || "General"
            }}</span>
            <h4>{{ product.name }}</h4>
            <div class="result-info">
              <span class="price">{{ formatPrice(product.sellPrice) }}</span>
            </div>
            <span
              class="stock mobile-hidden"
              :class="{ 'low-stock': product.quantity <= 0 }"
            >
              Stock: {{ product.quantity.toFixed(2) }}
            </span>
          </div>
        </li>
      </ul>
    </div>

    <div
      class="main-content"
      :class="{ 'show-mobile-cart': showingMobileCart }"
    >
      <!-- Header del Carrito Movil -->
      <div class="mobile-cart-header" v-if="showingMobileCart">
        <h2>Carrito ({{ cartItemCount }})</h2>
        <button @click="showingMobileCart = false" class="btn-close-cart">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <!-- Lista de productos en carrito -->
      <div class="cart-section">
        <h2>Productos en Carrito</h2>
        <transition-group name="fade" tag="ul" class="cart-list">
          <li
            v-for="item in salesStore.cartItems"
            :key="item.cartItemId"
            class="cart-item"
          >
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <!-- Mostrar variantes si existen -->
              <p
                v-if="
                  item.variants && (item.variants.size || item.variants.color)
                "
                class="variant-info"
              >
                <span v-if="item.variants.size"
                  >Talla: {{ item.variants.size }}</span
                >
                <span v-if="item.variants.color && item.variants.size">
                  -
                </span>
                <span v-if="item.variants.color"
                  >Color: {{ item.variants.color }}</span
                >
              </p>
              <p>Precio unitario: {{ formatPrice(item.sellPrice) }}</p>
              <p class="total-price">
                Total: {{ formatPrice(item.sellPrice * item.quantity) }}
              </p>
            </div>
            <div class="item-actions">
              <button
                @click="salesStore.decreaseQuantity(item)"
                class="btn-quantity"
              >
                <span class="material-symbols-outlined">remove</span>
              </button>
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                class="quantity-input"
                @input="salesStore.updateQuantity(item)"
                :max="item.stock"
              />
              <button
                @click="salesStore.increaseQuantity(item)"
                :disabled="item.quantity >= item.stock"
                class="btn-quantity"
              >
                <span class="material-symbols-outlined">add</span>
              </button>
              <button @click="salesStore.removeItem(item)" class="btn-remove">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </li>
        </transition-group>
        <div v-if="salesStore.cartItems.length === 0" class="empty-cart">
          <span class="material-symbols-outlined">shopping_cart</span>
          <p>El carrito está vacío</p>
        </div>
      </div>

      <!-- Resumen de venta -->
      <div class="summary-section">
        <h2>Resumen de Venta</h2>
        <div class="summary-content">
          <!-- Buscador de clientes -->
          <div class="search-bar client-search-bar-container">
            <span class="material-symbols-outlined">person</span>
            <input
              v-model="salesStore.clientSearchQuery"
              @input="debouncedClientSearch"
              placeholder="Buscar cliente"
              :disabled="salesStore.selectedClient !== null"
            />
            <button
              v-if="salesStore.selectedClient"
              @click="salesStore.clearSelectedClient()"
              class="btn-clear-client"
              title="Limpiar cliente seleccionado"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
            <button
              @click="salesStore.searchClients(salesStore.clientSearchQuery)"
              class="btn-search"
              :disabled="
                salesStore.clientSearchQuery === '' ||
                salesStore.selectedClient !== null
              "
            >
              <span class="material-symbols-outlined" style="color: white">search</span>
            </button>
            <!-- Resultados de búsqueda de clientes -->
            <ul
              v-if="
                salesStore.clientSearchResults.length > 0 &&
                salesStore.clientSearchQuery.length > 0 &&
                !salesStore.selectedClient
              "
              class="client-results-list"
            >
              <li
                v-for="client in salesStore.clientSearchResults"
                :key="client._id"
                @click="salesStore.selectClient(client)"
                class="client-result-item"
              >
                {{ client.name }} ({{ client.address }})
              </li>
            </ul>
          </div>

          <!-- Boton para mostrar/ocultar -->
          <button
            @click="salesStore.extraActions = !salesStore.extraActions"
            class="btn-toggle"
          >
            {{ salesStore.extraActions ? "Ocultar" : "Mostrar más" }}
          </button>

          <div v-if="salesStore.extraActions">
            <div class="summary-row with-input">
              <span>Descuento:</span>
              <div class="input-group">
                <input
                  type="number"
                  v-model.number="salesStore.discountValue"
                  @input="salesStore.setDiscountValue(salesStore.discountValue)"
                  placeholder="0"
                  min="0"
                />
                <select v-model="salesStore.discountType" class="type-select">
                  <option value="amount">$</option>
                  <option value="percentage">%</option>
                </select>
              </div>
            </div>

            <div class="summary-row with-input">
              <span>Recargo:</span>
              <div class="input-group">
                <input
                  type="number"
                  v-model.number="salesStore.surchargeValue"
                  @input="
                    salesStore.setSurchargeValue(salesStore.surchargeValue)
                  "
                  placeholder="0"
                  min="0"
                />
                <select v-model="salesStore.surchargeType" class="type-select">
                  <option value="amount">$</option>
                  <option value="percentage">%</option>
                </select>
              </div>
            </div>

            <div class="summary-row iva-row">
              <span>IVA (21%):</span>
              <button @click="salesStore.toggleIva()" class="btn-toggle-iva">
                {{ salesStore.ivaEnabled ? "Desactivar" : "Activar" }}
              </button>
              <span>{{ formatPrice(salesStore.tax) }}</span>
            </div>
          </div>

          <div class="summary-row subtotal">
            <span>Subtotal:</span>
            <span>{{ formatPrice(salesStore.subtotal) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ formatPrice(salesStore.total) }}</span>
          </div>
        </div>

        <div class="payment-section">
          <div class="payment-method">
            <label for="paymentMethod">Método de Pago:</label>
            <select v-model="salesStore.paymentMethod" id="paymentMethod">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cuenta corriente">Cuenta corriente</option>
              <option value="Credito">Crédito</option>
              <option value="Debito">Débito</option>
            </select>
          </div>

          <div class="print-checkbox-container">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="salesStore.autoPrintTicket"
                class="print-checkbox"
              />
              <span class="checkbox-text">Imprimir ticket automáticamente</span>
            </label>
          </div>

          <!-- Calculadora de vueltos -->
          <div v-if="salesStore.paymentMethod === 'Efectivo'" class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto Recibido ($)</label>
            <input
              v-model="receivedAmount"
              type="number"
              min="0"
              step="0.01"
              class="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Ingrese el monto recibido"
              @input="calculateChange"
            />
            <div v-if="receivedAmount > 0" class="mt-2 p-3 rounded-lg" :class="change >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
              <p class="text-sm font-medium">Cambio: <span class="text-lg font-bold">{{ formatPrice(change) }}</span></p>
            </div>
          </div>

          <div class="payment-actions">
            <button
              @click="showingModalPaymentMethods = true"
              class="btn-multiple-payments"
              :disabled="salesStore.cartItems.length === 0"
            >
              <span class="material-symbols-outlined">credit_card</span> Múltiples medios de pago
            </button>
            <button
              @click="createSale"
              class="btn-complete-sale"
              :disabled="salesStore.cartItems.length === 0"
            >
              <span class="material-symbols-outlined">check_circle</span> F4 - VENTA
            </button>
            <button
              @click="salesStore.cancelSale()"
              class="btn-cancel"
              :disabled="salesStore.cartItems.length === 0"
            >
              <span class="material-symbols-outlined">cancel</span> ESC - CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Input Modal -->
    <Teleport to="body">
    <div v-if="showQuickInput" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showQuickInput = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Registrar Ingreso Rápido</h3>
        <input v-model="quickInput.description" placeholder="Descripción" class="w-full p-2 border rounded-lg mb-3" />
        <input v-model.number="quickInput.total" type="number" placeholder="Monto" class="w-full p-2 border rounded-lg mb-3" />
        <select v-model="quickInput.category" class="w-full p-2 border rounded-lg mb-3">
          <option value="Ventas">Ventas</option>
          <option value="CobroDeCuentaCorriente">Cobro de Cuenta Corriente</option>
          <option value="AporteDeSocios">Aporte de Socios</option>
          <option value="Otros">Otros</option>
        </select>
        <select v-model="quickInput.paymentMethod" class="w-full p-2 border rounded-lg mb-4">
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="TarjetaCredito">Tarjeta de Crédito</option>
          <option value="TarjetaDebito">Tarjeta de Débito</option>
        </select>
        <div class="flex justify-end gap-3">
          <button @click="showQuickInput = false" class="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
          <button @click="createQuickInput" class="px-4 py-2 bg-green-500 text-white rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Quick Output Modal -->
    <Teleport to="body">
    <div v-if="showQuickOutput" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showQuickOutput = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Registrar Egreso Rápido</h3>
        <input v-model="quickOutput.description" placeholder="Descripción" class="w-full p-2 border rounded-lg mb-3" />
        <input v-model.number="quickOutput.total" type="number" placeholder="Monto" class="w-full p-2 border rounded-lg mb-3" />
        <select v-model="quickOutput.category" class="w-full p-2 border rounded-lg mb-3">
          <option value="Alquiler">Alquiler</option>
          <option value="Servicios">Servicios</option>
          <option value="Sueldos">Sueldos</option>
          <option value="Impuestos">Impuestos</option>
          <option value="Otros">Otros</option>
        </select>
        <select v-model="quickOutput.paymentMethod" class="w-full p-2 border rounded-lg mb-4">
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="TarjetaCredito">Tarjeta de Crédito</option>
          <option value="TarjetaDebito">Tarjeta de Débito</option>
        </select>
        <div class="flex justify-end gap-3">
          <button @click="showQuickOutput = false" class="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
          <button @click="createQuickOutput" class="px-4 py-2 bg-red-500 text-white rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Modales -->

    <paymentMethods
      @purchase-registered="handlePurchase"
      :venta="salesStore.total"
      v-if="showingModalPaymentMethods"
      @close="showingModalPaymentMethods = false"
    ></paymentMethods>

    <!-- Modal de selección de variantes -->
    <variantsSelectorModal
      :show="salesStore.showingVariantModal"
      :product="salesStore.selectedProductForVariant"
      :selectedVariants="salesStore.selectedVariants"
      @close="salesStore.closeVariantModal()"
      @select-variant="
        (type, value) => salesStore.setSelectedVariant(type, value)
      "
      @add-to-cart="handleVariantAddToCart"
    />

    <!-- Modal de envío de ticket por email -->
    <!-- Modal de envío de ticket por email -->
    <sentTicketByEmail
      v-if="showingSendEmail"
      :ticketData="currentSaleData"
      :clientEmail="getClientEmail()"
      @ticketSent="handleTicketSent"
      @close="showingSendEmail = false"
    />

    <!-- Mobile Client Selector Modal -->
    <clientSelectorModal
      v-if="showingClientModal"
      @close="showingClientModal = false"
    />

    <spinnerComponent v-if="salesStore.loading"></spinnerComponent>

    <!-- Mobile Sticky Footer for POS (Step 0) -->
    <div class="mobile-pos-footer" v-if="mobileStep === 0">
      <div class="mobile-total" @click="mobileStep = 1">
        <span class="total-line"
          >{{ cartItemCount }} items • {{ formatPrice(salesStore.total) }}</span
        >
        <span class="last-added" v-if="salesStore.cartItems.length > 0">
          <span class="material-symbols-outlined">add_circle</span>
          {{ salesStore.cartItems[salesStore.cartItems.length - 1].name }}
        </span>
        <span class="view-details-text" v-else>Ver detalle ></span>
      </div>
      <button
        @click="mobileStep = 1"
        class="mobile-pay-btn"
        :disabled="salesStore.cartItems.length === 0"
      >
        <span class="material-symbols-outlined">arrow_forward</span> COBRAR
      </button>
    </div>

    <!-- Mobile Checkout Step (Step 1) -->
    <div class="mobile-checkout-step" v-if="mobileStep === 1">
      <div class="checkout-header">
        <button class="btn-back" @click="mobileStep = 0">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <h2>Finalizar Venta</h2>
        <div style="width: 24px"></div>
        <!-- Spacer -->
      </div>

      <div class="checkout-content">
        <div class="big-total-section">
          <!-- Mobile Financial Controls -->
          <div class="mobile-financial-controls">
            <div
              class="financial-header"
              @click="showingFinancialOptions = !showingFinancialOptions"
            >
              <span class="section-label"
                >Opciones de Precio (Desc/Recargo/IVA)</span
              >
              <span class="material-symbols-outlined">
                {{ showingFinancialOptions ? 'expand_less' : 'expand_more' }}
              </span>
            </div>

            <div v-if="showingFinancialOptions" class="financial-options-grid">
              <!-- Discount -->
              <div class="financial-control-group">
                <label>Descuento</label>
                <div class="input-with-select">
                  <input
                    type="number"
                    v-model.number="salesStore.discountValue"
                    placeholder="0"
                    min="0"
                    @input="
                      salesStore.setDiscountValue(salesStore.discountValue)
                    "
                  />
                  <select v-model="salesStore.discountType">
                    <option value="amount">$</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              <!-- Surcharge -->
              <div class="financial-control-group">
                <label>Recargo</label>
                <div class="input-with-select">
                  <input
                    type="number"
                    v-model.number="salesStore.surchargeValue"
                    placeholder="0"
                    min="0"
                    @input="
                      salesStore.setSurchargeValue(salesStore.surchargeValue)
                    "
                  />
                  <select v-model="salesStore.surchargeType">
                    <option value="amount">$</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              <!-- IVA -->
              <div class="financial-control-group toggle-group">
                <label>IVA (21%)</label>
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="salesStore.ivaEnabled"
                    @change="salesStore.toggleIva()"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Breakdown Details -->
          <div class="checkout-breakdown">
            <div class="breakdown-row">
              <span>Subtotal:</span>
              <span>{{ formatPrice(salesStore.subtotal) }}</span>
            </div>
            <div
              v-if="salesStore.discountValue > 0"
              class="breakdown-row discount"
            >
              <span>Descuento:</span>
              <span>-{{ formatPrice(salesStore.discountAmount) }}</span>
            </div>
            <div
              v-if="salesStore.surchargeValue > 0"
              class="breakdown-row surcharge"
            >
              <span>Recargo:</span>
              <span>+{{ formatPrice(salesStore.surchargeAmount) }}</span>
            </div>
            <div v-if="salesStore.ivaEnabled" class="breakdown-row tax">
              <span>IVA (21%):</span>
              <span>+{{ formatPrice(salesStore.tax) }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <span class="label">TOTAL A PAGAR</span>
          <span class="amount">{{ formatPrice(salesStore.total) }}</span>
          <span class="item-count-badge">{{ cartItemCount }} ARTÍCULOS</span>

          <!-- Toggle Item Details -->
          <button
            @click="showingCheckoutDetails = !showingCheckoutDetails"
            class="btn-toggle-details"
          >
            {{ showingCheckoutDetails ? "Ocultar Productos" : "Ver Productos" }}
            <span class="material-symbols-outlined">
              {{ showingCheckoutDetails ? 'expand_less' : 'expand_more' }}
            </span>
          </button>

          <!-- Expandable Details List -->
          <div v-if="showingCheckoutDetails" class="checkout-details-list">
            <div
              v-for="item in salesStore.cartItems"
              :key="item.cartItemId"
              class="checkout-detail-item"
            >
              <div class="detail-info-row">
                <div class="detail-name">
                  {{ item.name }}
                  <div
                    v-if="
                      item.variants &&
                      (item.variants.size || item.variants.color)
                    "
                    class="mobile-variant-info"
                  >
                    <span v-if="item.variants.size"
                      >Talla: {{ item.variants.size }}</span
                    >
                    <span v-if="item.variants.color && item.variants.size">
                      -
                    </span>
                    <span v-if="item.variants.color"
                      >Color: {{ item.variants.color }}</span
                    >
                  </div>
                </div>
                <div class="detail-price">
                  {{ formatPrice(item.sellPrice * item.quantity) }}
                </div>
              </div>

              <div class="detail-actions-row">
                <div class="qty-controls">
                  <button
                    class="btn-qty-mobile"
                    @click="salesStore.decreaseQuantity(item)"
                  >
                    <span class="material-symbols-outlined">remove</span>
                  </button>
                  <input
                    type="number"
                    v-model.number="item.quantity"
                    class="input-qty-mobile"
                    @input="salesStore.updateQuantity(item)"
                  />
                  <button
                    class="btn-qty-mobile"
                    @click="salesStore.increaseQuantity(item)"
                  >
                    <span class="material-symbols-outlined">add</span>
                  </button>
                </div>
                <button
                  class="btn-remove-mobile"
                  @click="salesStore.removeItem(item)"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mobile-payment-methods">
          <p class="section-label">MÉTODO DE PAGO</p>
          <div class="methods-grid">
            <div
              class="method-card"
              :class="{ active: salesStore.paymentMethod === 'Efectivo' }"
              @click="salesStore.paymentMethod = 'Efectivo'"
            >
              <span class="material-symbols-outlined">payments</span>
              <span>Efectivo</span>
              <div
                v-if="salesStore.paymentMethod === 'Efectivo'"
                class="check-icon"
              >
                <span class="material-symbols-outlined">check_circle</span>
              </div>
            </div>
            <div
              class="method-card"
              :class="{ active: salesStore.paymentMethod === 'Debito' }"
              @click="salesStore.paymentMethod = 'Debito'"
            >
              <span class="material-symbols-outlined">credit_card</span>
              <span>Débito</span>
            </div>
            <div
              class="method-card"
              :class="{ active: salesStore.paymentMethod === 'Transferencia' }"
              @click="salesStore.paymentMethod = 'Transferencia'"
            >
              <span class="material-symbols-outlined">account_balance</span>
              <span>Transf.</span>
            </div>
            <div
              class="method-card"
              :class="{ active: salesStore.paymentMethod === 'Multiple' }"
              @click="showingModalPaymentMethods = true"
            >
              <span class="material-symbols-outlined">account_balance_wallet</span>
              <span>Múltiple</span>
            </div>
          </div>
        </div>

        <div class="mobile-options">
          <div class="option-row">
            <div class="option-icon"><span class="material-symbols-outlined">print</span></div>
            <div class="option-text">
              <span>Imprimir ticket</span>
              <small>Automático al finalizar</small>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="salesStore.autoPrintTicket" />
              <span class="slider round"></span>
            </label>
          </div>
        </div>
        <!-- Client Selection Trigger -->
        <div class="option-row" @click="showingClientModal = true">
          <div class="option-icon"><span class="material-symbols-outlined">person_add</span></div>
          <div class="option-text">
            <span>{{
              salesStore.selectedClient
                ? salesStore.selectedClient.name
                : "Asignar Cliente"
            }}</span>
            <small>{{
              salesStore.selectedClient
                ? "Cliente asignado"
                : "Consumidor Final"
            }}</small>
          </div>
          <span class="material-symbols-outlined">chevron_right</span>
        </div>
      </div>
      <div class="checkout-actions">
        <button
          class="btn-cancel-mobile"
          @click="
            salesStore.cancelSale();
            mobileStep = 0;
          "
        >
          <span class="material-symbols-outlined">cancel</span> CANCELAR
        </button>
        <button class="btn-finalize-mobile" @click="createSale">
          <span class="material-symbols-outlined">check_circle</span> FINALIZAR VENTA
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useSalesStore } from "@/stores/salesStore";
import { mapActions } from "pinia";
import hotkeys from "hotkeys-js";
import useVuelidate from "@vuelidate/core";
import paymentMethods from "@/components/visuals/sales/paymentMethods.vue";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import variantsSelectorModal from "@/components/visuals/sales/variantsSelectorModal.vue";
import sentTicketByEmail from "@/components/visuals/sales/sentTicketByEmail.vue";
import numeral from "numeral";
import { useGlobalStore } from "@/stores/globalStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTurnsStore } from "@/stores/turnsStore";
import api from "@/config/axios.config";

import { defineAsyncComponent } from "vue";

export default {
  setup() {
    const salesStore = useSalesStore();
    return { v$: useVuelidate(), salesStore };
  },
  components: {
    paymentMethods,
    spinnerComponent,
    variantsSelectorModal,
    sentTicketByEmail,

    clientSelectorModal: defineAsyncComponent(
      () => import("@/components/visuals/sales/clientSelectorModal.vue"),
    ),
  },
  data() {
    return {
      showingClientModal: false, // For mobile client selection
      showingSendEmail: false,

      showingModalCreate: false,
      showingCloseTurnModal: false,
      showingOpenTurnModal: false,
      showingModalPaymentMethods: false,
      showingMobileCart: false,
      clientSearchTimeout: null,
      globalStore: useGlobalStore(),
      settingsStore: useSettingsStore(),
      turnsStore: useTurnsStore(),
      currentSaleData: null,
      mobileStep: 0, // 0: Selection, 1: Checkout
      showingCheckoutDetails: false, // New state for toggling details in checkout
      showingFinancialOptions: false, // Toggle for financial controls
      // Formulario apertura de turno
      openTurnForm: { efectivoRecibido: 0, descriptionApertura: "" },
      // Formulario cierre de turno
      closeTurnForm: { efectivoPresentado: 0, descriptionCierre: "" },
      // Cambio calculator
      receivedAmount: 0,
      change: 0,
      // Quick Ingreso/Egreso
      showQuickInput: false,
      showQuickOutput: false,
      quickInput: { description: '', total: 0, category: 'Ventas', paymentMethod: 'Efectivo' },
      quickOutput: { description: '', total: 0, category: 'Otros', paymentMethod: 'Efectivo' },
    };
  },
  computed: {
    cartItemCount() {
      return this.salesStore.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );
    },
    turnsEnabled() {
      return this.settingsStore.settings?.turnsEnabled === true;
    },
    showTurnGate() {
      // Solo mostrar cuando ya se cargó el estado del turno (initialized) y no hay turno abierto
      return this.turnsEnabled && this.turnsStore.initialized && !this.turnsStore.hasOpenTurn;
    },
  },
  methods: {
    // Métodos que interactúan con la store
    ...mapActions(useSalesStore, [
      "searchProducts",
      "addToCart",
      "increaseQuantity",
      "decreaseQuantity",
      "updateQuantity",
      "removeItem",
      "cancelSale",
      "searchClients",
      "fetchClientDetails",
      "createProductAndAddToCart",
      "fetchLastTurnData",
      "applyPriceListToCart",
      "fetchListNames",
      "setPaymentMethods",
      "checkUserRoutesAllowed",
      "resetSaleState",
      "selectClient",
      "clearSelectedClient",
    ]),

    // Método modificado para crear venta
    async createSale() {
      // Bloquear venta si el módulo de turnos está activo y no hay turno abierto
      if (this.turnsEnabled && !this.turnsStore.hasOpenTurn) {
        this.showingOpenTurnModal = true;
        return;
      }

      // Validar monto recibido para pago en efectivo
      if (this.salesStore.paymentMethod === 'Efectivo' && this.receivedAmount < this.salesStore.total) {
        alert('El monto recibido es menor al total de la venta');
        return;
      }

      try {
        // Crear la venta
        await this.salesStore.createSale();

        // Preparar datos de la venta para posible uso posterior
        this.currentSaleData = {
          id: Date.now().toString(),
          total: this.salesStore.total,
          items: this.salesStore.cartItems,
          client: this.salesStore.selectedClient,
          paymentMethod: this.salesStore.paymentMethod,
          date: new Date().toISOString(),
        };

        // LÓGICA DE LOS TRES ESCENARIOS

        // Escenario 1: NO imprimir ticket - venta normal sin mostrar nada
        if (!this.salesStore.autoPrintTicket) {
          // Solo completar la venta sin mostrar modales ni imprimir
          this.salesStore.completeSale();
          return;
        }

        // Escenario 2: Imprimir ticket SIN cliente - emitir ticket directamente
        if (
          this.salesStore.autoPrintTicket &&
          !this.salesStore.selectedClient
        ) {
          // Configurar para imprimir sin email
          this.salesStore.sendTicketByEmail = false;
          this.salesStore.clientEmail = "";

          // Emitir ticket directamente
          await this.salesStore.emitirTicket();
          return;
        }

        // Escenario 3: Imprimir ticket CON cliente - mostrar modal de email
        if (this.salesStore.autoPrintTicket && this.salesStore.selectedClient) {
          // Mostrar modal para consultar si enviar por email
          this.showingSendEmail = true;
          return;
        }
      } catch (error) {
        console.error("Error al crear venta:", error);
        alert("Error al crear la venta");
      }
    },

    // Método para manejar el envío del ticket
    async handleTicketSent(data) {
      try {
        if (data.sentByEmail) {
          // Configurar el store para envío por email
          this.salesStore.sendTicketByEmail = true;
          this.salesStore.clientEmail = data.email;
        } else {
          this.salesStore.sendTicketByEmail = false;
          this.salesStore.clientEmail = "";
        }

        // Generar e imprimir/enviar el ticket
        await this.salesStore.emitirTicket();

        if (data.sentByEmail) {
          alert(`Ticket enviado exitosamente a ${data.email}`);
        } else {
          alert("Venta completada exitosamente");
        }
      } catch (error) {
        console.error("Error al procesar ticket:", error);
        alert("Error al procesar el ticket");
      }
    },

    // Método para obtener el email del cliente
    getClientEmail() {
      return this.salesStore.selectedClient?.email || "";
    },

    // Métodos locales del componente
    checkInput() {
      if (this.salesStore.searchQuery === "") {
        this.salesStore.searchResults = [];
      }
    },

    debouncedClientSearch() {
      clearTimeout(this.clientSearchTimeout);
      this.clientSearchTimeout = setTimeout(() => {
        if (this.salesStore.clientSearchQuery.length > 2) {
          this.salesStore.searchClients(this.salesStore.clientSearchQuery);
        } else if (this.salesStore.clientSearchQuery.length === 0) {
          this.salesStore.clientSearchResults = [];
          this.salesStore.clearSelectedClient();
        }
      }, 300);
    },

    async createAndAdd(product) {
      await this.salesStore.createProductAndAddToCart(product);
      this.showingModalCreate = false;
    },

    handlePurchase(saleData) {
      this.salesStore.setPaymentMethods(saleData.paymentMethods);
      this.showingModalPaymentMethods = false;
    },

    // Nuevo método para manejar la adición de variantes al carrito
    handleVariantAddToCart(data) {
      this.salesStore.addToCart(
        this.salesStore.selectedProductForVariant,
        data.variants,
        data.quantity,
      );
    },

    formatPrice(value) {
      return numeral(value).format("$0.00");
    },

    toggleMobileCart() {
      // Now used to switch steps or view cart details in step 0
      if (this.mobileStep === 0) {
        this.mobileStep = 1; // Go to checkout
      } else {
        this.mobileStep = 0; // Back to selection
      }
    },

    async handleOpenTurn() {
      const ok = await this.turnsStore.openTurn(this.openTurnForm);
      if (ok) {
        this.showingOpenTurnModal = false;
        this.openTurnForm = { efectivoRecibido: 0, descriptionApertura: "" };
      }
    },

    async handleOpenCloseTurnModal() {
      this.showingCloseTurnModal = true;
      await this.turnsStore.fetchClosingPreview();
    },

    async handleCloseTurn() {
      const ok = await this.turnsStore.closeTurn(this.closeTurnForm);
      if (ok) {
        this.showingCloseTurnModal = false;
        this.closeTurnForm = { efectivoPresentado: 0, descriptionCierre: "" };
      }
    },

    getCategoryIcon(category) {
      // Simple mapping based on loose string matching or default
      if (!category) return "inventory_2";
      const lower = category.toLowerCase();
      if (lower.includes("pan") || lower.includes("food"))
        return "bakery_dining";
      if (lower.includes("bebi") || lower.includes("drink")) return "water_drop";
      if (lower.includes("snack")) return "fastfood";
      if (lower.includes("cafe")) return "coffee";
      return "inventory_2-open";
    },

    calculateChange() {
      if (this.receivedAmount >= this.salesStore.total) {
        this.change = this.receivedAmount - this.salesStore.total;
      } else {
        this.change = this.receivedAmount - this.salesStore.total;
      }
    },

    async createQuickInput() {
      try {
        const shopId = this.globalStore.shopId();
        const userId = this.globalStore.userId();
        const incomeData = {
          shopId,
          description: this.quickInput.description,
          category: this.quickInput.category,
          total: this.quickInput.total,
          userId,
          paymentMethod: this.quickInput.paymentMethod,
          date: new Date().toISOString().split('T')[0],
        };
        await api.post("/inputs/post/create-input", incomeData);
        this.showQuickInput = false;
        this.quickInput = { description: '', total: 0, category: 'Ventas', paymentMethod: 'Efectivo' };
        alert('Ingreso registrado correctamente');
      } catch (e) {
        alert('Error al registrar ingreso');
      }
    },

    async createQuickOutput() {
      try {
        const shopId = this.globalStore.shopId();
        const userId = this.globalStore.userId();
        const expenseData = {
          shopId,
          description: this.quickOutput.description,
          category: this.quickOutput.category,
          total: this.quickOutput.total,
          userId,
          paymentMethod: this.quickOutput.paymentMethod,
          date: new Date().toISOString().split('T')[0],
        };
        await api.post("/outputs/post/create-output", expenseData);
        this.showQuickOutput = false;
        this.quickOutput = { description: '', total: 0, category: 'Otros', paymentMethod: 'Efectivo' };
        alert('Egreso registrado correctamente');
      } catch (e) {
        alert('Error al registrar egreso');
      }
    },
  },

  async mounted() {
    // Configurar atajos de teclado
    hotkeys("f4", async (event) => {
      event.preventDefault();
      await this.createSale();
    });

    hotkeys("esc", (event) => {
      event.preventDefault();
      this.salesStore.cancelSale();
    });

    await this.globalStore.fetchShopData();

    // Verificar settings y turno activo
    if (!this.settingsStore.settings) {
      await this.settingsStore.fetchSettings();
    }
    if (this.turnsEnabled) {
      await this.turnsStore.fetchCurrentTurn();
    }

    const isRouteAllowed = await this.salesStore.checkUserRoutesAllowed(
      this.$route.path,
    );
    if (!isRouteAllowed) {
      this.$router.push("/ruta-prohibida");
    }

    // Load default products for Mobile POS
    if (!this.salesStore.searchResults.length) {
      await this.salesStore.searchProducts("");
    }
  },

  beforeUnmount() {
    // Limpiar atajos de teclado
    hotkeys.unbind("f4");
    hotkeys.unbind("esc");
    clearTimeout(this.clientSearchTimeout);
  },
};
</script>

<style scoped>
/* Mobile Sticky Footer Styles */
.mobile-pos-footer {
  display: none;
  /* Hidden on desktop */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
}

.mobile-total {
  display: flex;
  flex-direction: column;
}

.mobile-total span:first-child {
  font-size: 0.8rem;
  color: #666;
}

.mobile-total .amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
}

.mobile-pay-btn {
  background: #10b981;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
}

.mobile-pay-btn:disabled {
  background: #ccc;
  box-shadow: none;
}

/* Todos los estilos existentes se mantienen igual */
.print-checkbox-container {
  margin: 15px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.print-checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-text {
  font-weight: 500;
  user-select: none;
}

.print-checkbox:checked + .checkbox-text {
  color: #3399ff;
  font-weight: 600;
}

.btn-toggle {
  background-color: #f59e0b;
  color: #1f2937;
  padding: 0.5rem 1rem;
  border: none;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
}

.btn-toggle:hover {
  background-color: #e8821a;
  color: white;
}

.btn-search {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  padding: 0.75rem 1rem;
  border: none;
  font-size: 0.875rem;
  border-radius: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 48px;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.3);
}

.btn-search:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(249, 147, 30, 0.4);
}

.btn-search:disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Nuevo estilo para indicador de variantes */
.variants-indicator {
  color: #8b5cf6;
  font-size: 0.75rem;
  font-weight: 500;
}

.variants-indicator i {
  margin-right: 0.25rem;
}

/* Nuevo estilo para información de variantes en el carrito */
.variant-info {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
  margin: 0.25rem 0;
}

/* Estilos generales */
.sales-container {
  position: relative;
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding-bottom: 100px;
  /* Space for sticky footer */
}

h2,
h3,
h4 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
}

button {
  cursor: pointer;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Mobile specific variant info */
.mobile-variant-info {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

/* Mobile Breakdown Styles */
.checkout-breakdown {
  width: 100%;
  margin-bottom: 10px;
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 4px;
}

/* Mobile Financial Controls Styles */
.mobile-financial-controls {
  width: 100%;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 10px;
  overflow: hidden;
}

.financial-header {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f3f4f6;
  cursor: pointer;
}

.financial-header .section-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.financial-options-grid {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.financial-control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.financial-control-group label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.input-with-select {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.input-with-select input {
  flex: 1;
  border: none;
  padding: 8px;
  min-width: 0;
}

.input-with-select select {
  width: 50px;
  border: none;
  background-color: #f9fafb;
  border-left: 1px solid #d1d5db;
  text-align: center;
  padding: 0;
}

.financial-control-group.toggle-group {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.breakdown-row.discount {
  color: #10b981;
}

.breakdown-row.surcharge {
  color: #f59e0b;
}

.breakdown-row.tax {
  color: #6366f1;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: #e5e7eb;
  margin: 10px 0;
}

input,
select,
textarea {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  background-color: white;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

/* Header y navegación - MEJORADO */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-container {
  flex: 1;
  max-width: 600px;
  min-width: 300px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 1rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  gap: 0.75rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.search-bar:hover {
  border-color: rgba(249, 147, 30, 0.3);
  box-shadow:
    0 6px 12px -1px rgba(0, 0, 0, 0.15),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.search-bar:focus-within {
  border-color: #f9931e;
  box-shadow:
    0 0 0 3px rgba(249, 147, 30, 0.2),
    0 6px 12px -1px rgba(0, 0, 0, 0.15);
}

.search-bar i {
  color: #f9931e;
  font-size: 1.25rem;
  min-width: 20px;
}

.search-bar input {
  flex: 1;
  border: none;
  font-size: 1rem;
  background: transparent;
  color: #1f2937;
  font-weight: 500;
}

.search-bar input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.search-bar input:focus {
  outline: none;
  box-shadow: none;
}

.search-bar select {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-bar select:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.search-bar select:focus {
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

.btn-create {
  background-color: #f9931e;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.btn-create:hover {
  background-color: #e8821a;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-offline,
.btn-close-turn {
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  font-size: 0.875rem;
}

.btn-offline:hover,
.btn-close-turn:hover {
  opacity: 0.9;
}

/* Client Search Specific Styles */
.client-search-bar-container {
  position: relative;
  margin-bottom: 10px;
}

.btn-clear-client {
  background: none;
  border: none;
  color: #6b7280;
  position: absolute;
  right: 4.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  font-size: 1rem;
  width: auto;
  height: auto;
  border-radius: 50%;
}

.btn-clear-client:hover {
  color: #ef4444;
  background-color: #f3f4f6;
}

.client-results-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow:
    0 6px 12px -1px rgba(0, 0, 0, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.06);
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.client-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1f2937;
  border-bottom: 1px solid #f3f4f6;
}

.client-result-item:last-child {
  border-bottom: none;
}

.client-result-item:hover {
  background-color: #f3f4f6;
}

/* Resultados de búsqueda */
.search-results {
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.result-item:last-child {
  border-bottom: none;
}

.result-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.result-info {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.price {
  font-weight: 600;
  color: #1f2937;
}

.stock {
  color: #10b981;
}

.low-stock {
  color: #ef4444;
}

.btn-add {
  background-color: #f9931e;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  font-size: 0.875rem;
}

.btn-add:hover {
  background-color: #e8821a;
}

.btn-add.no-stock {
  background-color: #f59e0b;
}

/* Contenido principal */
.main-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
  }
}

/* Sección de carrito */
.cart-section {
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.cart-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.item-details p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.total-price {
  font-weight: 600;
  color: #1f2937 !important;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-quantity {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #1f2937;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-quantity:hover {
  background-color: #e5e7eb;
}

.quantity-input {
  width: 5rem;
  text-align: center;
  font-size: 0.875rem;
}

.btn-remove {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #ef4444;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background-color: #ef4444;
  color: white;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #6b7280;
  font-weight: 500;
}

.empty-cart i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

/* Sección de resumen */
.summary-section {
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.summary-content {
  flex-grow: 1;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.with-input {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-group input {
  flex-grow: 1;
  max-width: 100px;
}

.type-select {
  width: 3rem;
}

.iva-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem;
  align-items: center;
}

.btn-toggle-iva {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #1f2937;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-toggle-iva:hover {
  background-color: #e5e7eb;
}

.subtotal {
  font-weight: 500;
  font-size: 1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 2px solid #e5e7eb;
}

.total {
  font-weight: 600;
  font-size: 1.125rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

/* Sección de pagos */
.payment-section {
  margin-top: auto;
}

.payment-method {
  margin-bottom: 1rem;
}

.payment-method select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background-color: white;
}

.payment-method label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.payment-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.btn-multiple-payments {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 1rem;
  grid-column: span 2;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
}
.btn-multiple-payments:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 92, 246, 0.4);
}

.btn-multiple-payments:hover {
  background-color: #7d3c98;
}

.btn-complete-sale {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}
.btn-complete-sale:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
}

.btn-complete-sale:hover {
  background-color: #0e9f6e;
}

.btn-cancel {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
  transition: all 0.3s ease;
}
.btn-cancel:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4);
}

.btn-cancel:hover {
  background-color: #dc2626;
}

/* Street Vendor Mobile Optimizations */
@media (max-width: 768px) {
  .sales-container {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    /* Dynamic viewport height for mobile */
    padding: 0;
    padding-bottom: 0;
    background: #f9fafb;
    overflow: hidden;
  }

  /* Hide Desktop-only sections on mobile */
  .summary-section,
  .payment-section,
  .cart-section,
  .mobile-cart-header {
    /* Hide old mobile header if present */
    display: none !important;
  }

  /* Re-enable payment section elements if they are used inside mobile-checkout-step?
     No, mobile-checkout-step has its own markup structure.
     So hiding the main .payment-section is correct. */

  .header {
    flex-shrink: 0;
    /* Header stays fixed size */
    position: sticky;
    top: 0;
    z-index: 900;
    background: #f9fafb;
    padding: 1rem;
    margin-bottom: 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  /* Full Screen Results Grid */
  .search-results {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    padding-bottom: 180px;
    /* Extra space for the fixed footer + buffer */
    background: transparent;
    box-shadow: none;
    margin-bottom: 0;
    border-radius: 0;
    width: 100%;
  }

  .results-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    /* Strict 2 columns */
    gap: 1rem;
    /* More gap */
    width: 100%;
    padding: 0;
    list-style: none;
    /* Remove bullets */
  }

  .result-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: white;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: auto;
    /* Allow auto height */
    min-height: 180px;
    /* Min height for card feeling */
    justify-content: space-between;
    width: 100%;
    /* Fill grid cell */
  }

  .result-details {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .result-icon-placeholder {
    width: 48px;
    height: 48px;
    background-color: #e0f2fe;
    /* Light blue like 'water' example */
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: #0ea5e9;
    font-size: 1.25rem;
  }

  .result-category {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  .result-details h4 {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .result-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .result-info .price {
    font-size: 1.1rem;
    font-weight: 700;
    color: #4f46e5;
    /* Purple/Blue price color */
  }

  .btn-add {
    display: none;
    /* Hide standard add button, whole card click or specialized add */
  }

  /* Make the whole card clickable for adding */
  .result-item:active {
    transform: scale(0.98);
    border-color: #f9931e;
  }

  /* Hidden Cart / Summary by default on mobile - Moved to overlay */
  .main-content {
    display: none;
    /* Always hidden on mobile, using mobile-checkout-step instead */
  }

  /* Step-by-Step Mobile Styles */
  .mobile-pos-footer {
    /* Re-styled for Step 1 */
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
    padding: 1rem 1.5rem;
    background: white;
  }

  .mobile-total {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: transparent;
    padding: 0;
  }

  .mobile-total span:first-child {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
  }

  .last-added {
    font-size: 0.75rem;
    color: #f9931e;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }

  .view-details-text {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .mobile-pay-btn {
    background-color: #f9931e;
    /* Distrify Orange */
    box-shadow: 0 4px 12px rgba(249, 147, 30, 0.4);
    border-radius: 12px;
  }

  /* Step 2: Checkout Screen */
  .mobile-checkout-step {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f8f9fa;
    z-index: 2000;
    display: flex;
    flex-direction: column;
  }

  .checkout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: white;
  }

  .checkout-header h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #111827;
  }

  .btn-back {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #374151;
    padding: 0.5rem;
  }

  .checkout-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
  }

  .big-total-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }

  .big-total-section .label {
    font-size: 0.8rem;
    color: #6b7280;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }

  .big-total-section .amount {
    font-size: 3rem;
    font-weight: 800;
    color: #111827;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .item-count-badge {
    background: #e5e7eb;
    color: #374151;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .btn-toggle-details {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 0.9rem;
    margin-top: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .checkout-details-list {
    margin-top: 1rem;
    width: 100%;
    background: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .checkout-detail-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .checkout-detail-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .detail-info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    align-items: flex-start;
  }

  .detail-name {
    font-weight: 500;
    color: #374151;
    font-size: 0.95rem;
    padding-right: 0.5rem;
    flex: 1;
  }

  .detail-price {
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
  }

  .detail-actions-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .qty-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 0.25rem;
  }

  .btn-qty-mobile {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    background: white;
    color: #4b5563;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    font-size: 0.8rem;
  }

  .input-qty-mobile {
    width: 40px;
    border: none;
    background: transparent;
    text-align: center;
    font-weight: 600;
    color: #1f2937;
    font-size: 0.9rem;
    /* Remove arrows on mobile input */
    appearance: textfield;
    -moz-appearance: textfield;
  }

  .input-qty-mobile::-webkit-outer-spin-button,
  .input-qty-mobile::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .btn-remove-mobile {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: #fee2e2;
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .btn-remove-mobile:active {
    background: #fecaca;
  }

  .section-label {
    font-size: 0.8rem;
    color: #9ca3af;
    font-weight: 600;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .methods-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .method-card {
    background: white;
    border: 2px solid transparent;
    padding: 1.5rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
  }

  .method-card i {
    font-size: 1.75rem;
    color: #6b7280;
  }

  .method-card.active {
    border-color: #f9931e;
    background-color: #fff7ed;
  }

  .method-card.active i {
    color: #f9931e;
  }

  .check-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: #f9931e;
    font-size: 1rem;
  }

  .mobile-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .option-row {
    background: white;
    padding: 1rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .option-icon {
    width: 40px;
    height: 40px;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4b5563;
  }

  .option-text {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .option-text span {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .option-text small {
    color: #9ca3af;
    font-size: 0.8rem;
  }

  /* Custom Switch */
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #10b981;
  }

  input:checked + .slider:before {
    transform: translateX(22px);
  }

  .checkout-actions {
    padding: 1.5rem;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  }

  .btn-finalize-mobile {
    width: 100%;
    background-color: #10b981;
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-cancel-mobile {
    width: 100%;
    background-color: #fee2e2;
    color: #ef4444;
    padding: 1rem;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  /* Mobile Sticky Footer */
  .mobile-pos-footer {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-top: 1px solid #e5e7eb;
    position: fixed;
    /* Strictly fixed as requested */
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  }

  .mobile-total {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.5rem 0;
  }

  .mobile-pay-btn {
    width: 100%;
    /* Full width button */
    flex: none;
    padding: 1rem;
    font-size: 1.25rem;
  }

  .btn-close-cart {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6b7280;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  /* Mobile Enhancements */

  .mobile-pos-footer {
    display: flex;
  }

  /* Hide the normal payment section buttons on mobile as they are in sticky footer,
       BUT might need proper logic to hide/show
       Actually, let's keep them but maybe simplify.
       The user wants "ultra comfortable".
    */

  .payment-actions {
    /* Hide desktop actions on mobile if we want strict mode, or just keep them as backup */
    display: none;
  }

  .btn-quantity,
  .btn-remove {
    width: 3rem;
    /* Larger touch target */
    height: 3rem;
    font-size: 1.25rem;
  }

  .quantity-input {
    width: 4rem;
    height: 3rem;
    font-size: 1.1rem;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .item-actions {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.5rem;
  }

  .item-details h3 {
    font-size: 1.2rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .search-container {
    max-width: 100%;
    min-width: auto;
  }

  .search-bar {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .search-bar input {
    min-width: 200px;
    padding: 1rem;
    /* Larger touch area */
  }

  .search-bar select {
    min-width: 120px;
    padding: 1rem;
  }

  .btn-create {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }

  .search-bar input {
    min-width: auto;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .search-bar select {
    min-width: auto;
  }

  .btn-search {
    padding: 0.75rem;
    font-size: 1rem;
    display: flex;
    justify-content: center;
  }
}

/* ===== GATE DE TURNO (dentro del componente, position absolute) ===== */
.turn-gate-overlay {
  position: absolute;
  inset: 0;
  background: rgba(249, 250, 251, 0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 0.5rem;
  min-height: 300px;
}

.turn-gate-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
}

.turn-gate-icon {
  width: 72px;
  height: 72px;
  background: #fff7ed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}
.turn-gate-icon .material-symbols-outlined {
  font-size: 2.25rem;
  color: #f9931e;
}

.turn-gate-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.75rem;
}

.turn-gate-desc {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 1.75rem;
  line-height: 1.6;
}

.btn-open-turn {
  background: #f9931e;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}
.btn-open-turn:hover { background: #e8821a; }

/* Barra de turno activo en header */
.turn-active-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 0.75rem;
  padding: 0.6rem 1rem;
  margin-bottom: 0.75rem;
}
.turn-active-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #c2410c;
}
.turn-active-icon { font-size: 1.1rem; }

.btn-close-turn-header {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.45rem 0.875rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: background 0.2s;
}
.btn-close-turn-header:hover { background: #b91c1c; }
.btn-close-turn-header .material-symbols-outlined { font-size: 1rem; }
</style>

<style>
/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modales de turno (globales porque usan Teleport al body) */
.turn-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
  backdrop-filter: blur(3px);
  padding: 1rem;
}

.turn-modal-card {
  background: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.turn-modal-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}
.turn-modal-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.15rem;
}
.turn-modal-header p {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
}
.turn-modal-header-icon {
  width: 40px;
  height: 40px;
  background: #fff7ed;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.turn-modal-header-icon .material-symbols-outlined { color: #f9931e; font-size: 1.25rem; }
.turn-modal-header-icon.close-icon { background: #fee2e2; }
.turn-modal-header-icon.close-icon .material-symbols-outlined { color: #dc2626; }

.btn-modal-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.15s;
}
.btn-modal-close:hover { background: #f3f4f6; color: #374151; }

.turn-modal-body { padding: 1.25rem 1.5rem; }

.turn-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}
.turn-form-group label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.turn-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
  font-size: 0.9rem;
  color: #111827;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
  resize: none;
  box-sizing: border-box;
}
.turn-input:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.15);
}

.turn-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}
.turn-summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.turn-summary-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.turn-summary-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
}
.turn-summary-value.highlight { color: #f9931e; font-size: 1.1rem; }

.turn-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  justify-content: center;
}
.turn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #f9931e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.turn-error {
  font-size: 0.82rem;
  color: #dc2626;
  background: #fee2e2;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-top: 0.5rem;
}

.turn-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
  justify-content: flex-end;
}

.btn-turn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-turn-cancel:hover { background: #e5e7eb; }

.btn-turn-confirm {
  background: #f9931e;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.15s;
}
.btn-turn-confirm:hover:not(:disabled) { background: #e8821a; }
.btn-turn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-turn-close-confirm {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.15s;
}
.btn-turn-close-confirm:hover:not(:disabled) { background: #b91c1c; }
.btn-turn-close-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
