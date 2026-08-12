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
          <span class="material-symbols-outlined" style="color: #9ca3af; font-size: 1.3rem;">barcode_scanner</span>
          <input
            ref="productSearch"
            v-model="salesStore.searchQuery"
            @input="checkInput"
            @keypress.enter="salesStore.searchProducts()"
            class="flex-1 py-3 px-1 bg-transparent border-0 outline-none font-bold text-sm text-slate-800 dark:text-white"
            style="border: none !important; box-shadow: none !important; outline: none !important; background: transparent !important;"
            :placeholder="
              salesStore.searchType === 'name'
                ? 'Buscar producto por nombre'
                : salesStore.searchType === 'code'
                  ? 'Buscar producto por código de barras'
                  : 'Buscar producto por nombre o código de barras'
            "
          />
          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <select 
            v-model="salesStore.searchType" 
            class="bg-transparent border-none outline-none font-bold text-xs text-slate-600 dark:text-slate-300 cursor-pointer pr-6 py-2"
            style="border: none !important; box-shadow: none !important; outline: none !important;"
          >
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
      <div class="quick-action-buttons flex items-center gap-2">
        <button
          @click="openQuickSaleModal"
          class="btn-action-sale inline-flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          title="Venta Rápida de producto o monto sin código (F6)"
        >
          <span class="material-symbols-outlined text-base">bolt</span>
          <span>Venta Rápida (F6)</span>
        </button>
        <button
          @click="showQuickInput = true"
          class="btn-action-input inline-flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">add_circle</span>
          <span>Ingreso</span>
        </button>
        <button
          @click="showQuickOutput = true"
          class="btn-action-output inline-flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">remove_circle</span>
          <span>Egreso</span>
        </button>
      </div>
      <!-- <button @click="showingModalCreate = true" class="btn-create">
        Crear producto
      </button> -->
    </header>

    <!-- Resultados de búsqueda de productos -->
    <div v-if="salesStore.searchResults.length > 0" class="search-results">
      <div class="flex items-center gap-2 mb-4">
        <span class="material-symbols-outlined text-primary" style="font-size:1.2rem;">inventory_2</span>
        <h3 class="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Resultados <span class="text-primary">{{ salesStore.searchResults.length }}</span> productos
        </h3>
      </div>
      <ul class="results-list">
        <li
          v-for="product in salesStore.searchResults"
          :key="product._id"
          class="result-item group"
          @click="salesStore.addToCart(product)"
        >
          <!-- Ícono con fondo coloreado -->
          <div class="result-icon-placeholder">
            <span class="material-symbols-outlined">{{ getCategoryIcon(product.category) }}</span>
          </div>

          <!-- Info del producto -->
          <div v-if="product.sellPrice" class="result-details flex-1">
            <span class="result-category">{{ product.category || 'General' }}</span>
            <h4 class="result-name">{{ product.name }}</h4>
          </div>

          <!-- Precio + Stock + botón -->
          <div class="result-right">
            <span class="result-price">{{ formatPrice(product.sellPrice) }}</span>
            <span
              class="result-stock-badge"
              :class="product.quantity <= 0 ? 'out-of-stock' : product.quantity <= 5 ? 'low-stock-badge' : 'in-stock'"
            >
              <span class="material-symbols-outlined" style="font-size:0.85rem;">{{ product.quantity <= 0 ? 'block' : 'package_2' }}</span>
              {{ product.quantity <= 0 ? 'Sin stock' : `Stock: ${product.quantity.toFixed(0)}` }}
            </span>
          </div>

          <!-- Botón agregar (aparece en hover) -->
          <button class="result-add-btn" @click.stop="salesStore.addToCart(product)">
            <span class="material-symbols-outlined">add_shopping_cart</span>
          </button>
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
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-800 dark:text-white">
            Carrito de productos
          </h2>
          <div class="cart-header-actions">
            <button class="cart-header-action" title="Escanear producto" @click="$refs.productSearch?.focus()">
              <span class="material-symbols-outlined">barcode_scanner</span>
            </button>
            <button class="cart-header-action danger" title="Vaciar carrito" :disabled="salesStore.cartItems.length === 0" @click="salesStore.cancelSale()">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <transition-group name="fade" tag="ul" class="cart-list space-y-2.5">
          <li
            v-for="item in salesStore.cartItems"
            :key="item.cartItemId"
            class="cart-item-card group"
          >
            <!-- Left: Avatar Icon + Details -->
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="cart-item-icon">
                <span class="material-symbols-outlined" style="font-size:1.25rem;">{{ getCategoryIcon(item.category) }}</span>
              </div>
              <div class="item-details min-w-0 flex-1">
                <h3 class="cart-item-name">{{ item.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <!-- Precio editable inline -->
                  <div class="price-edit-wrapper" :class="{ 'price-edited': item.sellPrice !== item.originalPrice }">
                    <span class="price-edit-prefix">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      class="price-edit-input"
                      :value="item.sellPrice"
                      @change="salesStore.updateItemPrice(item, $event.target.value)"
                      @keydown.enter="$event.target.blur()"
                      title="Click para editar el precio"
                    />
                    <span class="price-edit-label">c/u</span>
                    <span
                      v-if="item.originalPrice && item.sellPrice !== item.originalPrice"
                      class="price-original-badge"
                      :title="`Precio original: $${item.originalPrice}`"
                    >orig. {{ formatPrice(item.originalPrice) }}</span>
                    <span class="material-symbols-outlined price-edit-icon">edit</span>
                  </div>
                  <span
                    v-if="item.variants && (item.variants.size || item.variants.color)"
                    class="variant-info truncate"
                  >
                    <span v-if="item.variants.size">Talla: {{ item.variants.size }}</span>
                    <span v-if="item.variants.color && item.variants.size"> · </span>
                    <span v-if="item.variants.color">Color: {{ item.variants.color }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Item Total + Stepper + Remove -->
            <div class="cart-item-right">
              <!-- Total -->
              <div class="cart-item-total">
                <span class="cart-item-total-label">Total</span>
                <span class="cart-item-total-value">{{ formatPrice(item.sellPrice * item.quantity) }}</span>
              </div>

              <!-- Quantity Stepper -->
              <div class="cart-stepper">
                <button @click="salesStore.decreaseQuantity(item)" class="stepper-btn">
                  <span class="material-symbols-outlined" style="font-size:1rem;">remove</span>
                </button>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="stepper-input"
                  @input="salesStore.updateQuantity(item)"
                  :max="item.stock"
                />
                <button
                  @click="salesStore.increaseQuantity(item)"
                  :disabled="item.quantity >= item.stock"
                  class="stepper-btn stepper-btn-add"
                >
                  <span class="material-symbols-outlined" style="font-size:1rem;">add</span>
                </button>
              </div>

              <!-- Remove button -->
              <button @click="salesStore.removeItem(item)" class="cart-remove-btn" title="Eliminar">
                <span class="material-symbols-outlined" style="font-size:1.1rem;">delete</span>
              </button>
            </div>
          </li>
        </transition-group>

        <div v-if="salesStore.cartItems.length === 0" class="empty-cart py-12 text-center w-full">
          <div class="w-36 h-36 rounded-full bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 100 100" class="w-28 h-28 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Orange Sparks -->
              <line x1="50" y1="12" x2="50" y2="20" stroke="#f97316" stroke-width="3.5" stroke-linecap="round" />
              <line x1="58" y1="17" x2="66" y2="24" stroke="#f97316" stroke-width="3.5" stroke-linecap="round" />

              <!-- Box inside cart -->
              <rect x="40" y="27" width="14" height="12" rx="2" fill="#1e293b" class="dark:fill-slate-200" />

              <!-- Cart Basket -->
              <path d="M40 33H74L71 55H46L40 33Z" fill="#cbd5e1" class="dark:fill-slate-600" opacity="0.8" />

              <!-- Cart Frame / Chassis -->
              <path d="M28 23H32L39 63H72" stroke="#475569" class="dark:stroke-slate-300" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Wheels -->
              <circle cx="47" cy="71" r="5" fill="#475569" class="dark:fill-slate-300" />
              <circle cx="67" cy="71" r="5" fill="#475569" class="dark:fill-slate-300" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Tu carrito está vacío</h3>
          <p class="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-xs mx-auto">
            Escaneá un código de barras o buscá un producto para comenzar
          </p>
        </div>

        <div class="cart-footer-stats">
          <div class="cart-footer-stat">
            <span class="material-symbols-outlined stat-icon products">shopping_bag</span>
            <div><small>Productos</small><b>{{ salesStore.cartItems.length }}</b></div>
          </div>
          <div class="cart-footer-stat">
            <span class="material-symbols-outlined stat-icon items">apps</span>
            <div><small>Ítems</small><b>{{ cartItemCount }}</b></div>
          </div>
          <div class="cart-footer-stat">
            <span class="material-symbols-outlined stat-icon discount">percent</span>
            <div><small>Descuento</small><b>{{ formatPrice(salesStore.discountAmount) }}</b></div>
          </div>
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

          <div class="flex justify-between items-center text-sm text-slate-500 font-medium py-1 px-1">
            <span>Subtotal:</span>
            <span class="font-bold text-slate-700 dark:text-slate-200">{{ formatPrice(salesStore.subtotal) }}</span>
          </div>

          <!-- Total Card Banner -->
          <div class="total-banner-card bg-gradient-to-r from-[#23190f] via-[#2f1f12] to-[#3d2715] dark:from-slate-900 dark:to-slate-800 text-white rounded-2xl p-4 my-3 shadow-lg shadow-black/15 border border-primary/30 flex items-center justify-between">
            <div>
              <span class="text-[11px] uppercase tracking-widest text-primary font-bold block mb-0.5">Total a Cobrar</span>
              <span class="text-3xl font-black text-white tracking-tight leading-none">{{ formatPrice(salesStore.total) }}</span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-inner">
              <span class="material-symbols-outlined text-2xl">payments</span>
            </div>
          </div>
        </div>

        <div class="payment-section mt-4">
          <div class="payment-method mb-3">
            <label for="paymentMethod" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Método de Pago:
            </label>
            <div class="relative">
              <select
                v-model="salesStore.paymentMethod"
                id="paymentMethod"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer appearance-none"
              >
                <option value="Efectivo">💵 Efectivo</option>
                <option value="Transferencia">🏦 Transferencia</option>
                <option value="Cuenta corriente">📋 Cuenta corriente</option>
                <option value="Credito">💳 Crédito</option>
                <option value="Debito">💳 Débito</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">expand_more</span>
            </div>
          </div>

          <div class="print-checkbox-container mb-3">
            <label class="checkbox-label flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                v-model="salesStore.autoPrintTicket"
                class="print-checkbox w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
              />
              <span class="checkbox-text">Imprimir ticket automáticamente</span>
            </label>
          </div>

          <!-- Calculadora de vueltos con botones rápidos -->
          <div v-if="salesStore.paymentMethod === 'Efectivo'" class="mt-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Monto Recibido ($)
            </label>
            <div class="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-primary transition-all shadow-inner overflow-hidden mb-2.5">
              <span class="pl-3.5 pr-1 text-slate-500 dark:text-slate-400 font-medium text-base select-none">$</span>
              <input
                v-model.number="receivedAmount"
                type="number"
                min="0"
                step="0.01"
                class="w-full py-2 pr-4 bg-transparent font-black text-lg text-slate-900 dark:text-white"
                style="border: none !important; box-shadow: none !important; outline: none !important; background: transparent !important;"
                placeholder="0"
                @input="calculateChange"
              />
            </div>

            <!-- Fast Cash Preset Buttons -->
            <div class="flex flex-wrap gap-1.5 mb-3">
              <button
                type="button"
                @click="receivedAmount = salesStore.total; calculateChange()"
                class="px-3 py-1.5 text-xs font-black bg-primary text-white hover:brightness-110 active:scale-95 rounded-lg shadow-sm transition-all"
              >
                Exacto
              </button>
              <button
                v-for="preset in getCashPresets()"
                :key="preset"
                type="button"
                @click="receivedAmount = preset; calculateChange()"
                class="px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 active:scale-95 rounded-lg shadow-sm transition-all"
              >
                ${{ formatNumberWithThousandSeparator(preset) }}
              </button>
            </div>

            <!-- Cambio / Vuelto Dynamic Card -->
            <div
              v-if="receivedAmount > 0"
              class="p-3 rounded-xl transition-all flex items-center justify-between border"
              :class="change >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'"
            >
              <span class="text-xs font-bold uppercase tracking-wider">
                {{ change >= 0 ? 'Vuelto a entregar:' : 'Falta dinero:' }}
              </span>
              <span class="text-xl font-black tracking-tight">
                {{ formatPrice(Math.abs(change)) }}
              </span>
            </div>
          </div>

          <div class="payment-actions">
            <button
              @click="showingModalPaymentMethods = true"
              class="btn-multiple-payments"
              :disabled="salesStore.cartItems.length === 0"
            >
              <span class="material-symbols-outlined text-xl">credit_card</span>
              <span>Múltiples medios de pago</span>
            </button>
            <button
              @click="createSale"
              class="btn-complete-sale"
              :disabled="salesStore.cartItems.length === 0"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xl">task_alt</span>
                <span>VENTA</span>
              </div>
              <kbd class="shortcut-tag">F4</kbd>
            </button>
            <button
              @click="salesStore.cancelSale()"
              class="btn-cancel"
              :disabled="salesStore.cartItems.length === 0"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xl">cancel</span>
                <span>CANCELAR</span>
              </div>
              <kbd class="shortcut-tag shortcut-tag-cancel">ESC</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Venta Rápida / Venta Libre sin Código -->
    <Teleport to="body">
    <div v-if="showQuickSale" class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" @click.self="showQuickSale = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-xl">bolt</span>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-800 dark:text-white">Venta Rápida</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Para productos sin código de barras</p>
            </div>
          </div>
          <button @click="showQuickSale = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Chips de conceptos rápidos -->
        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Conceptos Rápidos</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="chip in ['Pan', 'Caramelos', 'Cigarrillos', 'Hielo', 'Fotocopias', 'Bolsa', 'Varios']"
              :key="chip"
              type="button"
              @click="setQuickSaleConcept(chip)"
              class="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all cursor-pointer"
            >
              {{ chip }}
            </button>
          </div>
        </div>

        <form @submit.prevent="submitQuickSale">
          <div class="mb-3">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Producto / Concepto</label>
            <input
              ref="quickSaleNameInput"
              v-model="quickSale.name"
              type="text"
              placeholder="Ej: Pan, Caramelos sueltos, Fotocopias"
              class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-800 dark:text-white outline-none focus:border-amber-500"
              @keypress.enter.prevent="$refs.quickSalePriceInput ? $refs.quickSalePriceInput.focus() : null"
            />
          </div>

          <div class="grid grid-cols-3 gap-3 mb-5">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Precio / Monto ($)</label>
              <div class="flex items-center rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-900 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
                <span class="px-3.5 py-2.5 font-black text-sm text-slate-500 bg-slate-200/70 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700">$</span>
                <input
                  ref="quickSalePriceInput"
                  v-model.number="quickSale.price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                  class="w-full py-2.5 px-3 font-black text-lg text-slate-900 dark:text-white bg-transparent outline-none border-none shadow-none"
                  style="border: none !important; box-shadow: none !important; outline: none !important;"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cantidad</label>
              <input
                v-model.number="quickSale.quantity"
                type="number"
                min="1"
                required
                class="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-sm text-slate-800 dark:text-white text-center outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5">
            <button
              type="button"
              @click="showQuickSale = false"
              class="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancelar (ESC)
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-base">bolt</span>
              <span>Agregar al Carrito</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>

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
  <toastComponent
    v-if="salesStore.toast.showing"
    :message="salesStore.toast.message"
    :state="salesStore.toast.state"
    @close="salesStore.toast.showing = false"
  ></toastComponent>
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
import toastComponent from "@/components/visuals/toast/toastComponent.vue";
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
    toastComponent,

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
      // Quick Ingreso/Egreso/Venta Rápida
      showQuickSale: false,
      quickSale: { name: '', price: null, quantity: 1 },
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

    getCashPresets() {
      const total = this.salesStore.total || 0;
      const presets = [1000, 2000, 5000, 10000, 20000];
      return presets.filter(p => p >= total).slice(0, 4);
    },
    formatNumberWithThousandSeparator(val) {
      if (!val) return '0';
      return numeral(val).format('0,0').replace(/,/g, '.');
    },
    showToast(message, state = 'success') {
      this.salesStore.toast.message = message;
      this.salesStore.toast.state = state;
      this.salesStore.toast.showing = true;
    },

    // Método modificado para crear venta
    async createSale() {
      // Bloquear venta si el módulo de turnos está activo y no hay turno abierto
      if (this.turnsEnabled && !this.turnsStore.hasOpenTurn) {
        this.showingOpenTurnModal = true;
        return;
      }

      // Validar monto recibido para pago en efectivo
      if (this.salesStore.paymentMethod === 'Efectivo' && this.receivedAmount < this.salesStore.total) {
        this.showToast('El monto recibido es menor al total de la venta', 'danger');
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
          this.showToast("Venta completada exitosamente", "success");
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
          this.showToast("Venta completada exitosamente", "success");
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
        this.showToast("Error al crear la venta", "danger");
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
          this.showToast(`Ticket enviado exitosamente a ${data.email}`, 'success');
        } else {
          this.showToast("Venta completada exitosamente", 'success');
        }
      } catch (error) {
        console.error("Error al procesar ticket:", error);
        this.showToast("Error al procesar el ticket", 'danger');
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
        this.showToast('Ingreso registrado correctamente', 'success');
      } catch (e) {
        this.showToast('Error al registrar ingreso', 'danger');
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
        this.showToast('Egreso registrado correctamente', 'success');
      } catch (e) {
        this.showToast('Error al registrar egreso', 'danger');
      }
    },

    openQuickSaleModal() {
      this.quickSale = { name: '', price: null, quantity: 1 };
      this.showQuickSale = true;
      this.$nextTick(() => {
        if (this.$refs.quickSaleNameInput) {
          this.$refs.quickSaleNameInput.focus();
        }
      });
    },

    setQuickSaleConcept(conceptName) {
      this.quickSale.name = conceptName;
      this.$nextTick(() => {
        if (this.$refs.quickSalePriceInput) {
          this.$refs.quickSalePriceInput.focus();
        }
      });
    },

    submitQuickSale() {
      if (!this.quickSale.price || this.quickSale.price <= 0) {
        this.showToast('Ingresá un monto válido mayor a 0', 'danger');
        return;
      }
      const name = (this.quickSale.name && this.quickSale.name.trim()) ? this.quickSale.name.trim() : 'Venta Rápida';
      this.salesStore.addCustomItemToCart(name, this.quickSale.price, this.quickSale.quantity);
      this.showQuickSale = false;
      this.showToast(`"${name}" agregado al carrito ($${this.quickSale.price})`, 'success');
      this.$nextTick(() => {
        if (this.$refs.productSearch) {
          this.$refs.productSearch.focus();
        }
      });
    },
  },

  async mounted() {
    // Configurar atajos de teclado
    hotkeys("f4", async (event) => {
      event.preventDefault();
      await this.createSale();
    });

    hotkeys("f6", (event) => {
      event.preventDefault();
      this.openQuickSaleModal();
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
    hotkeys.unbind("f6");
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
  padding: 0.65rem 1rem;
  border: none;
  font-size: 0.875rem;
  border-radius: 9999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 44px;
  margin: 3px;
  box-shadow: 0 4px 10px rgba(249, 147, 30, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-search:hover:not(:disabled) {
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(249, 147, 30, 0.45);
  filter: brightness(1.08);
}

.btn-search:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-search:disabled {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.45;
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
  gap: 0.5rem;
  padding: 0 0.25rem 0 1rem;
  background: white;
  border-radius: 9999px;
  border: 1.5px solid #e5e7eb;
  box-shadow: 0 2px 8px -2px rgba(0,0,0,0.08);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.dark .search-bar {
  background: #1e293b;
  border-color: #334155;
}

.search-bar:hover {
  border-color: rgba(249, 147, 30, 0.4);
  box-shadow: 0 4px 16px -4px rgba(249, 147, 30, 0.18);
}

.search-bar:focus-within {
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.15), 0 4px 12px -2px rgba(0,0,0,0.1);
}

.search-bar i {
  color: #f9931e;
  font-size: 1.25rem;
  min-width: 20px;
}

.search-bar input {
  flex: 1;
  border: none;
  font-size: 0.9rem;
  background: transparent;
  color: #1f2937;
  font-weight: 500;
  padding: 0.8rem 0;
}

.dark .search-bar input {
  color: white;
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
  background: transparent;
  border: none;
  outline: none;
  padding: 0.5rem 1.5rem 0.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  cursor: pointer;
  appearance: auto;
  min-width: 120px;
  transition: color 0.2s;
}

.dark .search-bar select {
  color: #94a3b8;
}

.search-bar select:hover {
  color: #f9931e;
}

.search-bar select:focus {
  outline: none;
  box-shadow: none;
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
  background: white;
  border-radius: 1.5rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.dark .search-results {
  background: #1e293b;
  border-color: #334155;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  border: 1.5px solid #f1f5f9;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.dark .result-item {
  background: #0f172a;
  border-color: #1e293b;
}

.result-item:hover {
  background: white;
  border-color: rgba(249, 147, 30, 0.35);
  box-shadow: 0 4px 16px -4px rgba(249, 147, 30, 0.2);
  transform: translateY(-1px);
}

.dark .result-item:hover {
  background: #1e293b;
}

/* Ícono del producto */
.result-icon-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 0.875rem;
  background: linear-gradient(135deg, rgba(249, 147, 30, 0.12), rgba(247, 103, 7, 0.08));
  border: 1.5px solid rgba(249, 147, 30, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #f9931e;
  transition: all 0.2s ease;
}

.result-item:hover .result-icon-placeholder {
  background: linear-gradient(135deg, rgba(249, 147, 30, 0.2), rgba(247, 103, 7, 0.15));
  transform: scale(1.05);
}

/* Detalles del producto */
.result-details {
  flex: 1;
  min-width: 0;
}

.result-category {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #f9931e;
  display: block;
  margin-bottom: 0.15rem;
}

.result-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .result-name {
  color: white;
}

/* Columna derecha: precio + stock */
.result-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
  flex-shrink: 0;
}

.result-price {
  font-size: 1rem;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.dark .result-price {
  color: white;
}

/* Stock badges */
.result-stock-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.in-stock {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.low-stock-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.out-of-stock {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Botón agregar en hover */
.result-add-btn {
  width: 36px;
  height: 36px;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8) translateX(8px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(249, 147, 30, 0.4);
  flex-shrink: 0;
  cursor: pointer;
}

.result-item:hover .result-add-btn {
  opacity: 1;
  transform: scale(1) translateX(0);
}

.result-add-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.08) !important;
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

/* ── Cart Item Card ───────────────────────────── */
.cart-item-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-radius: 1.25rem;
  background: white;
  border: 1.5px solid #f1f5f9;
  box-shadow: 0 2px 8px -2px rgba(0,0,0,0.07);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 0.5rem;
}

.dark .cart-item-card {
  background: #0f172a;
  border-color: #1e293b;
}

.cart-item-card:hover {
  border-color: rgba(249, 147, 30, 0.3);
  box-shadow: 0 6px 20px -4px rgba(249, 147, 30, 0.15);
  transform: translateY(-1px);
}

.dark .cart-item-card:hover {
  background: #1e293b;
}

/* Ícono del item */
.cart-item-icon {
  width: 44px;
  height: 44px;
  border-radius: 0.875rem;
  background: linear-gradient(135deg, rgba(249,147,30,0.14), rgba(247,103,7,0.08));
  border: 1.5px solid rgba(249,147,30,0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f9931e;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.cart-item-card:hover .cart-item-icon {
  transform: scale(1.07);
}

/* Nombre */
.cart-item-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.dark .cart-item-name {
  color: white;
}

/* Precio por unidad */
/* ── Precio editable inline ─────────────────────────────────── */
.price-edit-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: rgba(249,147,30,0.08);
  border: 1px solid rgba(249,147,30,0.22);
  border-radius: 9999px;
  padding: 0.12rem 0.45rem 0.12rem 0.35rem;
  cursor: text;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
  position: relative;
}
.price-edit-wrapper:hover,
.price-edit-wrapper:focus-within {
  border-color: #f9931e;
  background: rgba(249,147,30,0.14);
  box-shadow: 0 0 0 2px rgba(249,147,30,0.15);
}
.price-edit-wrapper.price-edited {
  border-color: #f9931e;
  background: rgba(249,147,30,0.18);
}
.price-edit-prefix {
  font-size: 0.68rem;
  font-weight: 700;
  color: #f9931e;
  line-height: 1;
}
.price-edit-input {
  width: 5ch;
  min-width: 4ch;
  max-width: 8ch;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 700;
  color: #f9931e;
  text-align: right;
  -moz-appearance: textfield;
  padding: 0;
}
.price-edit-input::-webkit-outer-spin-button,
.price-edit-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.price-edit-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #f9931e;
  opacity: 0.75;
  margin-left: 2px;
}
.price-edit-icon {
  font-size: 0.65rem !important;
  color: #f9931e;
  opacity: 0;
  margin-left: 2px;
  transition: opacity 0.15s;
  pointer-events: none;
}
.price-edit-wrapper:hover .price-edit-icon,
.price-edit-wrapper:focus-within .price-edit-icon {
  opacity: 0.6;
}
.price-original-badge {
  font-size: 0.6rem;
  font-weight: 500;
  color: #999;
  text-decoration: line-through;
  white-space: nowrap;
  margin-left: 4px;
}
.dark .price-edit-wrapper {
  background: rgba(249,147,30,0.12);
  border-color: rgba(249,147,30,0.3);
}
.dark .price-edit-input,
.dark .price-edit-prefix,
.dark .price-edit-label,
.dark .price-edit-icon {
  color: #fbbf77;
}


/* Columna derecha */
.cart-item-right {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-shrink: 0;
}

/* Total del item */
.cart-item-total {
  text-align: right;
}

.cart-item-total-label {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cart-item-total-value {
  font-size: 1.05rem;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.dark .cart-item-total-value {
  color: white;
}

/* Stepper */
.cart-stepper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.875rem;
  padding: 0.25rem;
  gap: 0.1rem;
}

.dark .cart-stepper {
  background: #0f172a;
  border-color: #334155;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  border-radius: 0.6rem;
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  cursor: pointer;
}

.dark .stepper-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.stepper-btn:hover:not(:disabled) {
  background: #f9931e;
  border-color: #f9931e;
  color: white;
}

.stepper-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.stepper-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.stepper-input {
  width: 36px;
  text-align: center;
  font-weight: 800;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  outline: none;
  color: #1e293b;
}

.dark .stepper-input {
  color: white;
}

/* Botón eliminar */
.cart-remove-btn {
  width: 34px;
  height: 34px;
  border-radius: 0.875rem;
  background: rgba(239,68,68,0.08);
  border: 1.5px solid rgba(239,68,68,0.15);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.cart-remove-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
  transform: scale(1.08);
  box-shadow: 0 4px 10px rgba(239,68,68,0.3);
}

.cart-remove-btn:active {
  transform: scale(0.95);
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
  gap: 0.85rem;
  margin-top: 0.75rem;
}

.btn-multiple-payments {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%);
  color: white;
  padding: 0.85rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.875rem;
  grid-column: span 2;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 6px 16px -2px rgba(139, 92, 246, 0.45);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.btn-multiple-payments:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -2px rgba(139, 92, 246, 0.55);
  filter: brightness(1.08);
}
.btn-multiple-payments:active:not(:disabled) {
  transform: translateY(0);
}

.btn-complete-sale {
  background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%);
  color: white;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.875rem;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 6px 16px -2px rgba(16, 185, 129, 0.45);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.btn-complete-sale:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -2px rgba(16, 185, 129, 0.55);
  filter: brightness(1.08);
}
.btn-complete-sale:active:not(:disabled) {
  transform: translateY(0);
}

.btn-cancel {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
  color: white;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.875rem;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 6px 16px -2px rgba(239, 68, 68, 0.45);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.btn-cancel:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -2px rgba(239, 68, 68, 0.55);
  filter: brightness(1.08);
}
.btn-cancel:active:not(:disabled) {
  transform: translateY(0);
}

.shortcut-tag {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  color: white;
  font-family: inherit;
  font-size: 0.725rem;
  font-weight: 900;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  letter-spacing: 0.05em;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-multiple-payments:disabled,
.btn-complete-sale:disabled,
.btn-cancel:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  filter: grayscale(30%);
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
    /* Alevia Pay Orange */
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

/* ===== VISUAL REFRESH: POS ===== */
.sales-container {
  --pos-ink: #172033;
  --pos-muted: #71809a;
  --pos-line: #e8edf5;
  --pos-surface: #ffffff;
  --pos-accent: #ff7a16;
  max-width: 1600px;
  padding: 1.75rem 2rem 6rem;
  background:
    radial-gradient(circle at 93% 2%, rgba(255, 138, 42, .11), transparent 25rem),
    linear-gradient(135deg, #f8fafc 0%, #f3f6fb 100%);
}

.header {
  position: relative;
  margin-bottom: 1.75rem;
  padding: 1rem;
  border: 1px solid rgba(226, 232, 240, .9);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, .72);
  box-shadow: 0 12px 35px rgba(40, 54, 83, .055);
  backdrop-filter: blur(16px);
}

.search-container { max-width: 680px; }
.search-bar {
  min-height: 52px;
  border-color: var(--pos-line);
  box-shadow: 0 4px 15px rgba(32, 47, 76, .05);
}
.search-bar input { font-size: .92rem; }
.quick-action-buttons { margin-left: auto; }

.main-content { grid-template-columns: minmax(0, 1.7fr) minmax(360px, .9fr); gap: 1.25rem; }
.cart-section, .summary-section {
  border: 1px solid rgba(226, 232, 240, .88);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, .92);
  box-shadow: 0 15px 38px rgba(40, 54, 83, .07);
}
.cart-section { min-height: 620px; padding: 1.6rem; }
.summary-section { padding: 1.45rem; }
.cart-section > .flex:first-child, .summary-section > h2 {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--pos-line);
}
.cart-section > .flex:first-child h2, .summary-section > h2 {
  color: var(--pos-ink) !important;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -.015em;
}

.cart-item-card {
  padding: 1rem 1.1rem;
  border-color: #edf1f6;
  border-radius: 1rem;
  box-shadow: 0 5px 15px rgba(30, 41, 59, .045);
}
.cart-item-card:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(249, 115, 22, .12); }
.cart-item-icon { border-radius: .9rem; }
.cart-item-total-label { color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; font-size: .62rem; }
.cart-item-total-value { color: var(--pos-ink); font-size: 1rem; }
.cart-stepper { border-color: #e6ebf2; border-radius: .75rem; background: #f8fafc; }
.stepper-btn { border-radius: .55rem; }

.summary-content { margin-bottom: .75rem; }
.summary-section .client-search-bar-container { margin-bottom: .8rem; }
.btn-toggle { border-radius: .7rem; font-weight: 700; padding: .55rem .8rem; background: #fff4e8; color: #df6503; }
.btn-toggle:hover { background: #ffead4; color: #bd5000; }
.total-banner-card {
  position: relative;
  overflow: hidden;
  border: 0;
  border-radius: 1.1rem;
  padding: 1.2rem;
  background: linear-gradient(135deg, #202a3c 0%, #172033 58%, #5a2709 145%) !important;
  box-shadow: 0 13px 24px rgba(25, 35, 53, .2);
}
.total-banner-card::after { content: ''; position: absolute; width: 150px; height: 150px; right: -60px; bottom: -86px; border-radius: 50%; background: rgba(255, 128, 30, .23); filter: blur(2px); }
.total-banner-card > * { position: relative; z-index: 1; }
.payment-section { border-top: 1px solid var(--pos-line); padding-top: 1.15rem; }
.print-checkbox-container { padding: .75rem .85rem; border-radius: .75rem; background: #f8fafc; border-color: #e9eef5; }
.payment-actions { gap: .65rem; }
.btn-multiple-payments, .btn-complete-sale, .btn-cancel { min-height: 50px; border-radius: .9rem; }
.btn-complete-sale { box-shadow: 0 10px 18px rgba(16,185,129,.2); }
.btn-cancel { box-shadow: 0 10px 18px rgba(244,63,94,.14); }

.empty-cart { padding-top: 8rem !important; }
.empty-cart > div:first-child { background: linear-gradient(135deg, #fff4e7, #fffaf5); box-shadow: inset 0 0 0 1px #ffe1bf; }

/* POS layout inspired by the compact checkout workspace. */
.sales-container {
  padding-top: 1.25rem;
  min-height: calc(100vh - 76px);
}

.header {
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
}

.search-container {
  max-width: none;
  flex: 1 1 620px;
}

.search-bar {
  min-height: 64px;
  padding-left: 1.15rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 8px 22px rgba(31, 43, 65, .055);
}

.search-bar input { font-size: .84rem; color: #344259; }
.search-bar select { min-height: 38px; padding-left: .9rem; }
.btn-search { width: 44px; height: 40px; margin: 4px; border-radius: .7rem; }

.quick-action-buttons button {
  min-height: 42px;
  border-radius: .75rem;
}
.btn-action-sale {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(245, 158, 11, .35) !important;
}
.btn-action-sale:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
  color: #ffffff !important;
}
.btn-action-input {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(16, 185, 129, .35) !important;
}
.btn-action-input:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  color: #ffffff !important;
}
.btn-action-output {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(244, 63, 94, .35) !important;
}
.btn-action-output:hover {
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%) !important;
  color: #ffffff !important;
}

.main-content { align-items: stretch; margin-top: .25rem; }
.cart-section, .summary-section { border-radius: 1.15rem; }
.cart-section { position: relative; min-height: 538px; padding: 1.25rem; display: flex; flex-direction: column; }
.summary-section { padding: 1.15rem; }
.cart-section > .flex:first-child, .summary-section > h2 { padding-bottom: .9rem; }

.cart-header-actions { display: flex; gap: .55rem; }
.cart-header-action {
  width: 38px;
  height: 38px;
  border: 1px solid #e7edf5;
  border-radius: .7rem;
  color: #1682ff;
  background: #fff;
  box-shadow: 0 5px 12px rgba(35, 60, 94, .06);
}
.cart-header-action .material-symbols-outlined { font-size: 1.12rem; }
.cart-header-action.danger { color: #ff5268; }
.cart-header-action:disabled { color: #cbd5e1; cursor: default; box-shadow: none; }

.cart-list { flex: 1; max-height: none; }
.empty-cart { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 0 5rem !important; }
.empty-cart > div:first-child { width: 106px; height: 106px; margin-bottom: 1rem; }
.empty-cart > div:first-child svg { width: 82px; height: 82px; }
.empty-cart h3 { font-size: 1rem; margin-bottom: .5rem; color: #202b3d; }
.empty-cart p { font-size: .78rem; line-height: 1.7; color: #74819a; }

.cart-footer-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: auto;
  border: 1px solid #e9eef5;
  border-radius: .9rem;
  background: linear-gradient(110deg, #fff, #fbfcfe);
  overflow: hidden;
}
.cart-footer-stat { display: flex; align-items: center; gap: .65rem; padding: .78rem .95rem; }
.cart-footer-stat + .cart-footer-stat { border-left: 1px solid #e9eef5; }
.cart-footer-stat small, .cart-footer-stat b { display: block; }
.cart-footer-stat small { font-size: .62rem; color: #8491a6; margin-bottom: .1rem; }
.cart-footer-stat b { font-size: .85rem; color: #1b2638; }
.stat-icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; font-size: 1rem; }
.stat-icon.products { color: #ff7618; background: #fff1e8; }
.stat-icon.items { color: #3284ff; background: #eaf3ff; }
.stat-icon.discount { color: #0aa878; background: #e6f8ef; }

.summary-section > h2 { display: flex; align-items: center; justify-content: space-between; }
.summary-section > h2::after { content: 'trending_up'; font-family: 'Material Symbols Outlined'; display: grid; place-items: center; width: 32px; height: 32px; border-radius: .65rem; color: #8b5cf6; background: #f5f0ff; font-size: 1rem; }
.summary-section .client-search-bar-container { min-height: 46px; }
.payment-section { padding-top: .8rem; }
.total-banner-card { padding: 1rem; margin: .75rem 0 !important; border-radius: .9rem; }
.total-banner-card span.text-3xl { font-size: 1.5rem; }
.print-checkbox-container { margin: .55rem 0; padding: .58rem .75rem; }
.payment-actions { margin-top: .55rem; }
.btn-multiple-payments, .btn-complete-sale, .btn-cancel { min-height: 43px; font-size: .76rem; border-radius: .72rem; }

@media (max-width: 900px) {
  .cart-section { min-height: 500px; }
}

.dark .sales-container { background: radial-gradient(circle at 93% 2%, rgba(255,138,42,.10), transparent 25rem), #0e1625; }
.dark .header, .dark .cart-section, .dark .summary-section { background: rgba(20, 30, 47, .94); border-color: #26334a; }
.dark .cart-section > .flex:first-child, .dark .summary-section > h2, .dark .payment-section { border-color: #26334a; }

@media (max-width: 700px) {
  .sales-container { padding: 1rem 1rem 6rem; }
  .header { padding: .7rem; border-radius: 1rem; }
  .quick-action-buttons { width: 100%; }
  .quick-action-buttons button { flex: 1; justify-content: center; min-height: 42px; }
  .cart-section { min-height: auto; padding: 1.1rem; }
  .summary-section { border-radius: 1.15rem; }
}
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
