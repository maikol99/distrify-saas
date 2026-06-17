<template>
  <div class="inventory-container">
    <!-- Stock Value Cards -->
    <div v-if="store.stockValue" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-gradient-orange">
          <i class="fas fa-boxes"></i>
        </div>
        <div class="stat-info">
          <span class="stat-title">Costo Total Inventario</span>
          <h2 class="stat-value">{{ formatPrice(store.stockValue.totalCost) }}</h2>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-gradient-green">
          <i class="fas fa-tag"></i>
        </div>
        <div class="stat-info">
          <span class="stat-title">Valor de Venta</span>
          <h2 class="stat-value">{{ formatPrice(store.stockValue.totalSellValue) }}</h2>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-gradient-blue">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-info">
          <span class="stat-title">Margen Potencial</span>
          <h2 class="stat-value">{{ formatPrice(store.stockValue.potentialProfit || (store.stockValue.totalSellValue - store.stockValue.totalCost)) }}</h2>
        </div>
      </div>
    </div>

    <!-- Toolbar: búsqueda + acciones primarias -->
    <div class="toolbar">
      <div class="toolbar-search">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input
            v-model="store.searchQuery"
            placeholder="Buscar por nombre o código..."
            @keyup.enter="store.searchProduct"
            @input="checkInput"
          />
          <button v-if="store.searchQuery" @click="clearSearch" class="clear-search">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button class="btn-search" @click="store.searchProduct">
          <i class="fas fa-search"></i>
          <span>Buscar</span>
        </button>
        <button
          class="btn-toggle-filters"
          @click="store.filtersObject.showFilters = !store.filtersObject.showFilters"
        >
          <i :class="store.filtersObject.showFilters ? 'fas fa-filter' : 'fas fa-filter'"></i>
          <span>Filtros</span>
          <i :class="store.filtersObject.showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="filter-chevron"></i>
        </button>
      </div>

      <div class="toolbar-actions">
        <button @click="goTo('/inventario/crear-producto')" class="btn-primary">
          <i class="fas fa-plus"></i> Nuevo Producto
        </button>
        <button @click="showingQuickCreateProduct = true" class="btn-secondary">
          <i class="fas fa-bolt"></i> Creación Rápida
        </button>
        <button @click="showingPercentagePatch = true" class="btn-secondary">
          <i class="fas fa-sync"></i> Actualizar precios
        </button>
        <div class="toolbar-divider"></div>
        <button
          @click="store.toggleBulkDeleteMode()"
          :class="store.bulkDeleteMode ? 'btn-secondary' : 'btn-danger-outline'"
        >
          <i :class="store.bulkDeleteMode ? 'fas fa-times' : 'fas fa-trash-alt'"></i>
          {{ store.bulkDeleteMode ? "Cancelar" : "Eliminar múltiples" }}
        </button>
        <button @click="showingDeleteProductByCategory = true" class="btn-danger-outline">
          <i class="fas fa-trash-alt"></i> Por categoría
        </button>
      </div>
    </div>

    <!-- Panel de Filtros -->
    <transition name="filters-slide">
      <div v-if="store.filtersObject.showFilters" class="filters-panel">
        <div class="filters-panel-header">
          <span><i class="fas fa-filter"></i> Filtros avanzados</span>
          <button @click="store.clearFilters" class="filters-clear-btn">
            <i class="fas fa-times"></i> Limpiar todo
          </button>
        </div>
        <div class="filters-grid">
          <div class="filter-group">
            <label for="filter-code">Código</label>
            <input
              type="text"
              id="filter-code"
              placeholder="Código del producto"
              class="filter-input"
              v-model="store.filtersObject.filters.code"
            />
          </div>

          <div class="filter-group search-autocomplete-container">
            <label for="filter-category">Categoría</label>
            <input
              type="text"
              id="filter-category"
              placeholder="Nombre de la categoría"
              class="filter-input"
              v-model="store.filtersObject.categorySearchQuery"
              @keydown.enter="store.searchCategories"
            />
            <button
              class="btn-clear-autocomplete"
              title="Limpiar categoría seleccionada"
              @click="store.clearSelections"
            >
              <i class="fas fa-times" v-if="store.filtersObject.selectedCategory === true"></i>
            </button>
            <ul v-if="store.filtersObject.selectedCategory === false && store.categories.length > 0" class="autocomplete-results-list">
              <li
                @click="store.selectCategory(category)"
                v-for="category in store.categories"
                class="autocomplete-result-item"
              >{{ category.name }}</li>
            </ul>
          </div>

          <div class="filter-group search-autocomplete-container">
            <label for="filter-provider">Proveedor</label>
            <input
              type="text"
              id="filter-provider"
              placeholder="Nombre del proveedor"
              class="filter-input"
              v-model="store.filtersObject.supplierSearchQuery"
              @keydown.enter="store.searchSuppliers"
            />
            <button
              class="btn-clear-autocomplete"
              title="Limpiar proveedor seleccionado"
              @click="store.clearSelections"
            >
              <i class="fas fa-times" v-if="store.filtersObject.selectedSupplier === true"></i>
            </button>
            <ul v-if="store.filtersObject.selectedSupplier === false && store.suppliers.length > 0" class="autocomplete-results-list">
              <li
                @click="store.selectSupplier(supplier)"
                v-for="supplier in store.suppliers"
                class="autocomplete-result-item"
              >{{ supplier.name }}</li>
            </ul>
          </div>

          <div class="filter-group">
            <label>Vencimiento (desde – hasta)</label>
            <div class="filter-range">
              <input type="date" id="filter-expiration-from" v-model="store.filtersObject.filters.expirationFrom" class="filter-input" />
              <input type="date" id="filter-expiration-to" v-model="store.filtersObject.filters.expirationTo" class="filter-input" />
            </div>
          </div>

          <div class="filter-group">
            <label>Fecha de creación (desde – hasta)</label>
            <div class="filter-range">
              <input type="date" v-model="store.filtersObject.filters.createdFrom" class="filter-input" />
              <input type="date" v-model="store.filtersObject.filters.createdTo" class="filter-input" />
            </div>
          </div>

          <div class="filter-group">
            <label>Precio de venta (mín – máx)</label>
            <div class="filter-range">
              <input type="number" v-model="store.filtersObject.filters.minPrice" placeholder="Mín" class="filter-input" />
              <input type="number" v-model="store.filtersObject.filters.maxPrice" placeholder="Máx" class="filter-input" />
            </div>
          </div>

          <div class="filter-group">
            <label>Precio de costo (mín – máx)</label>
            <div class="filter-range">
              <input type="number" v-model="store.filtersObject.filters.minBuyPrice" placeholder="Mín" class="filter-input" />
              <input type="number" v-model="store.filtersObject.filters.maxBuyPrice" placeholder="Máx" class="filter-input" />
            </div>
          </div>

          <div class="filter-group">
            <label>Stock (mín – máx)</label>
            <div class="filter-range">
              <input type="number" v-model="store.filtersObject.filters.minStock" placeholder="Mín" class="filter-input" />
              <input type="number" v-model="store.filtersObject.filters.maxStock" placeholder="Máx" class="filter-input" />
            </div>
          </div>

          <div class="filter-group">
            <label for="filter-location">Ubicación</label>
            <select id="filter-location" v-model="store.filtersObject.filters.location" class="filter-input">
              <option value="">Todas</option>
              <option value="local">Local</option>
              <option value="depot">Depósito</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-stock-level">Estado de stock</label>
            <select id="filter-stock-level" v-model="store.filtersObject.filters.stockLevel" class="filter-input">
              <option value="">Todos</option>
              <option value="in">Con stock</option>
              <option value="low">Stock bajo</option>
              <option value="out">Sin stock</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Ordenar por</label>
            <div class="filter-range">
              <select v-model="store.filtersObject.filters.sortBy" class="filter-input">
                <option value="">Más reciente</option>
                <option value="name">Nombre</option>
                <option value="sellPrice">Precio de venta</option>
                <option value="quantity">Stock</option>
                <option value="expirationDate">Vencimiento</option>
              </select>
              <select v-model="store.filtersObject.filters.sortOrder" class="filter-input">
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <button @click="store.filterProducts" class="btn-primary">
            <i class="fas fa-filter"></i> Aplicar filtros
          </button>
        </div>
      </div>
    </transition>

    <!-- Tabla de productos -->
    <div class="stock-management">
      <div class="data-table-container">
        <!-- Indicador de carga -->
        <div v-if="store.loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>Cargando productos...</p>
        </div>

        <div class="table-responsive hidden md:block">
          <table class="data-table" :class="{ loading: store.loading }">
            <thead>
              <tr>
                <th v-if="store.bulkDeleteMode" class="checkbox-cell">
                  <input
                    type="checkbox"
                    @change="store.selectAllProducts()"
                    :checked="store.allProductsSelected"
                    class="bulk-checkbox"
                  />
                  <span class="checkbox-label">Todos</span>
                </th>
                <th>Imagen</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio compra</th>
                <th>Precio venta</th>
                <th>Stock Total</th>
                <th>Stock Local</th>
                <th>Stock Depósito</th>
                <th>Vencimiento</th>
                <th
                  v-if="!store.bulkDeleteMode"
                  colspan="3"
                  class="actions-header"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in store.products"
                :key="product._id"
                :class="{
                  'low-stock': product.quantity < 10,
                  'out-of-stock': product.quantity <= 0,
                  'selected-for-deletion': store.isProductSelected(product._id),
                }"
              >
                <td v-if="store.bulkDeleteMode" class="checkbox-cell">
                  <input
                    type="checkbox"
                    :checked="store.isProductSelected(product._id)"
                    @change="store.toggleProductSelection(product._id)"
                    class="product-checkbox"
                  />
                </td>
                <td class="image-cell">
                  <img
                    v-if="product.images && product.images.length > 0"
                    :src="product.images[0].secure_url"
                    alt="Imagen del producto"
                    class="product-image"
                  />
                  <span v-else class="no-image">Sin imagen</span>
                </td>
                <td>{{ product.code || "N/A" }}</td>
                <td>{{ product.name || "N/A" }}</td>
                <td>{{ product.categoryId?.name || product.category || "N/A" }}</td>
                <td>{{ formatPrice(product.buyPrice) }}</td>
                <td>{{ formatPrice(product.sellPrice) }}</td>
                <td>
                  <span :class="getStockClass((product.quantity || 0) + (product.depotStock || 0))">
                    {{ (product.quantity || 0) + (product.depotStock || 0) }}
                  </span>
                </td>
                <td>
                  <span :class="getStockClass(product.quantity)">
                    {{ product.quantity !== undefined ? product.quantity : "N/A" }}
                  </span>
                </td>
                <td>
                  <span :class="getStockClass(product.depotStock)">
                    {{ product.depotStock || 0 }}
                  </span>
                </td>
                <td>
                  {{ product.expirationDate ? formatDate(product.expirationDate) : "N/A" }}
                </td>
                <td v-if="!store.bulkDeleteMode" class="actions-cell">
                  <div class="action-buttons-inline">
                    <button class="btn-sell" @click="sellFromStock(product)" title="Vender">
                      <i class="fas fa-cart-shopping"></i> Vender
                    </button>
                    <button class="btn-transfer" @click="openTransferModal(product)" title="Transferir">
                      <i class="fas fa-exchange-alt"></i> Transferir
                    </button>
                    <select
                      class="form-control"
                      :value="getProductAction(product._id)"
                      @change="handleActionChange(product, $event)"
                    >
                      <option value="">Acciones</option>
                      <option value="edit">Editar</option>
                      <option value="quick-update">Actualizar rápido</option>
                      <option value="delete">Eliminar</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Stacked Cards (Visible < 768px) -->
        <div class="grid grid-cols-1 gap-4 md:hidden mb-4">
          <div
            v-for="product in store.products"
            :key="product._id"
            class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative transition-colors"
            :class="{
              'border-orange-300': product.quantity < 10,
              'bg-red-50': product.quantity <= 0,
              'ring-2 ring-orange-500 bg-orange-50': store.isProductSelected(product._id)
            }"
          >
            <!-- Header (Select, Image, Names, Actions) -->
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3 flex-1 overflow-hidden">
                <input
                  v-if="store.bulkDeleteMode"
                  type="checkbox"
                  :checked="store.isProductSelected(product._id)"
                  @change="store.toggleProductSelection(product._id)"
                  class="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 bg-white"
                />
                <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                  <img
                    v-if="product.images && product.images.length > 0"
                    :src="product.images[0].secure_url"
                    class="w-full h-full object-cover"
                    alt="Prod"
                  />
                  <span v-else class="material-symbols-outlined text-gray-400">image_not_supported</span>
                </div>
                <!-- Title & Code -->
                <div class="flex flex-col min-w-0 pr-2">
                  <h3 class="font-bold text-gray-800 text-sm md:text-base m-0 truncate w-full" :title="product.name || 'N/A'">{{ product.name || "N/A" }}</h3>
                  <span class="text-xs text-gray-500 truncate mt-1">Ref: {{ product.code || "N/A" }}</span>
                </div>
              </div>

              <!-- Quick Action Dropdown -->
              <div v-if="!store.bulkDeleteMode" class="flex-shrink-0">
                <select
                  class="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-1 px-2 text-xs focus:ring-orange-500 focus:border-orange-500 font-semibold"
                  :value="getProductAction(product._id)"
                  @change="handleActionChange(product, $event)"
                >
                  <option value="">Acciones</option>
                  <option value="edit">Editar</option>
                  <option value="quick-update">Actualizar</option>
                  <option value="delete">Eliminar</option>
                </select>
              </div>
            </div>
            
            <!-- Prices Container -->
            <div class="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
              <div class="flex flex-col">
                <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Costo Unit.</span>
                <span class="font-semibold text-gray-800">{{ formatPrice(product.buyPrice) }}</span>
              </div>
              <div class="flex flex-col text-right">
                <span class="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Venta</span>
                <span class="font-bold text-orange-600 text-[15px]">{{ formatPrice(product.sellPrice) }}</span>
              </div>
            </div>
            
            <!-- Stock and Status -->
            <div class="border-t border-gray-100 pt-3 mt-1">
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <span class="text-[10px] text-gray-500 font-bold uppercase">Total</span>
                  <span :class="getStockClass((product.quantity || 0) + (product.depotStock || 0))" class="font-bold text-sm">
                    {{ (product.quantity || 0) + (product.depotStock || 0) }}
                  </span>
                </div>
                <div class="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <span class="text-[10px] text-gray-500 font-bold uppercase">Local</span>
                  <span :class="getStockClass(product.quantity)" class="font-bold text-sm">
                    {{ product.quantity !== undefined ? product.quantity : "N/A" }}
                  </span>
                </div>
                <div class="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <span class="text-[10px] text-gray-500 font-bold uppercase">Depósito</span>
                  <span :class="getStockClass(product.depotStock)" class="font-bold text-sm">
                    {{ product.depotStock || 0 }}
                  </span>
                </div>
              </div>
              <div v-if="!store.bulkDeleteMode" class="flex gap-2 mt-3">
                <button class="flex-1 btn-sell py-1.5 text-xs" @click="sellFromStock(product)">
                  <i class="fas fa-cart-shopping"></i> Vender
                </button>
                <button class="flex-1 btn-transfer py-1.5 text-xs" @click="openTransferModal(product)">
                  <i class="fas fa-exchange-alt"></i> Transferir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div
          v-if="store.products.length === 0 && !store.loading"
          class="empty-state"
        >
          <i class="fas fa-box-open"></i>
          <p>No se encontraron productos</p>
        </div>

        <!-- Información de paginación -->
        <div class="pagination-info">
          <span>{{ store.itemsInfo }}</span>
        </div>

        <!-- Controles de paginación -->
        <div class="pagination">
          <!-- Botón anterior -->
          <button
            @click="store.previousPage()"
            :disabled="store.pagination.page === 1 || store.loading"
            class="btn-secondary pagination-btn"
          >
            <i class="fas fa-chevron-left"></i> Anterior
          </button>

          <!-- Números de página -->
          <div class="page-numbers">
            <!-- Primera página -->
            <button
              v-if="store.pagination.page > 3"
              @click="store.goToPage(1)"
              class="page-number"
              :disabled="store.loading"
            >
              1
            </button>
            <span v-if="store.pagination.page > 3" class="page-ellipsis"
              >...</span
            >

            <!-- Páginas visibles -->
            <button
              v-for="pageNumber in store.visiblePages"
              :key="pageNumber"
              @click="store.goToPage(pageNumber)"
              :class="[
                'page-number',
                { active: store.pagination.page === pageNumber },
              ]"
              :disabled="store.loading"
            >
              {{ pageNumber }}
            </button>

            <!-- Última página -->
            <span
              v-if="store.pagination.page < store.pagination.totalPages - 2"
              class="page-ellipsis"
              >...</span
            >
            <button
              v-if="store.pagination.page < store.pagination.totalPages - 2"
              @click="store.goToPage(store.pagination.totalPages)"
              class="page-number"
              :disabled="store.loading"
            >
              {{ store.pagination.totalPages }}
            </button>
          </div>

          <!-- Botón siguiente -->
          <button
            @click="store.nextPage()"
            :disabled="
              store.pagination.page === store.pagination.totalPages ||
              store.loading
            "
            class="btn-secondary pagination-btn"
          >
            Siguiente <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Selector de elementos por página -->
          <div class="items-per-page">
            <label for="itemsPerPage">Productos por página:</label>
            <select
              id="itemsPerPage"
              v-model="itemsPerPage"
              @change="handleLimitChange"
              class="form-control"
              :disabled="store.loading"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de acciones para eliminación masiva -->
    <div
      v-if="store.bulkDeleteMode && store.hasSelectedProducts"
      class="bulk-actions-bar"
    >
      <div class="selected-count">
        <i class="fas fa-check-circle"></i>
        {{ store.selectedProductsCount }} producto(s) seleccionado(s)
      </div>
      <div class="bulk-buttons">
        <button @click="store.cancelBulkDelete()" class="btn-secondary">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button @click="store.showBulkDeleteConfirmation()" class="btn-danger">
          <i class="fas fa-trash-alt"></i> Eliminar todos ({{
            store.selectedProductsCount
          }})
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para eliminación masiva -->
  <div v-if="store.showBulkDeleteModal" class="fixed inset-0 bg-black/50 flex flex-col items-center md:justify-center justify-end z-[1100] md:p-4 backdrop-blur-sm">
    <div class="bg-white w-full md:w-[500px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up max-h-[90vh]">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-red-100 bg-red-50 text-red-600">
        <h3 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">warning</span>
          Confirmar eliminación masiva
        </h3>
      </div>
      <div class="p-5 flex-1 overflow-y-auto">
        <p class="text-gray-700 md:text-lg mb-2">
          ¿Estás seguro de que deseas eliminar
          <strong class="text-red-600">{{ store.selectedProductsCount }}</strong> producto(s)?
        </p>
        <p class="text-red-500 text-sm font-semibold mb-4">Esta acción no se puede deshacer.</p>
        <div v-if="store.selectedProductsCount <= 5" class="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 text-sm max-h-40 overflow-y-auto">
          <p class="font-bold text-gray-700 mb-2">Productos a eliminar:</p>
          <ul class="list-disc pl-5 m-0 text-gray-600">
            <li
              v-for="productName in store.selectedProductNames"
              :key="productName"
            >
              {{ productName }}
            </li>
          </ul>
        </div>
      </div>
      <!-- FOOTER -->
      <div class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-3 mt-auto">
        <button @click="store.hideBulkDeleteModal()" class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto text-center">
          Cancelar
        </button>
        <button @click="handleBulkDelete" class="py-3 md:py-2 px-5 bg-red-600 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-red-700 shadow-sm flex items-center justify-center w-full md:w-auto">
          <span class="material-symbols-outlined mr-2">delete</span> Eliminar
        </button>
      </div>
    </div>
  </div>

  <!-- Componentes modales existentes -->
  <deleteProduct
    v-if="showingDeleteModal"
    @close="showingDeleteModal = false"
    :product="productToDelete"
    @deleted="handleDeleteProduct"
  ></deleteProduct>

  <editProduct
    v-if="showingEditProduct"
    @close="showingEditProduct = false"
    :productId="productId"
  ></editProduct>

  <toastComponent
    v-if="store.toast.showing"
    :message="store.toast.message"
    :state="store.toast.state"
    :autoClose="true"
  ></toastComponent>

  <quickUpdate
    :product="selectedProduct"
    @close="showingQuickUpdate = false"
    @submit="handleQuickUpdateSubmit"
    @error="handleQuickUpdateError"
    v-if="showingQuickUpdate"
  ></quickUpdate>

  <categoryPercentagePatch
    v-if="showingPercentagePatch"
    @close="showingPercentagePatch = false"
    @submit="store.fetchProducts"
  ></categoryPercentagePatch>

  <quickCreateProduct
    v-if="showingQuickCreateProduct"
    @close="showingQuickCreateProduct = false"
    @submit="store.fetchProducts"
  ></quickCreateProduct>

  <deleteProductsByCategory
    v-if="showingDeleteProductByCategory"
    @close="showingDeleteProductByCategory = false"
    @submit="store.fetchProducts"
  ></deleteProductsByCategory>

  <!-- Transferir Stock Modal -->
  <div v-if="showingTransferModal" class="fixed inset-0 bg-black/50 flex flex-col items-center md:justify-center justify-end z-[1100] md:p-4 backdrop-blur-sm" @click.self="showingTransferModal = false">
    <div class="bg-white w-full md:w-[500px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up max-h-[90vh]">
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 text-orange-600">
        <h3 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">swap_horiz</span>
          Transferir Stock
        </h3>
        <button @click="showingTransferModal = false" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      <div class="p-5 flex-1 overflow-y-auto">
        <div v-if="transferProduct" class="flex flex-col gap-4">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p class="text-sm text-gray-600 mb-1"><strong>{{ transferProduct.name }}</strong></p>
            <div class="flex gap-4 text-sm">
              <span>Local: <strong>{{ transferProduct.quantity || 0 }}</strong></span>
              <span>Depósito: <strong>{{ transferProduct.depotStock || 0 }}</strong></span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-bold text-gray-700 text-sm">Origen:</label>
            <select v-model="transferConfig.origin" class="p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none">
              <option value="local">Local ({{ transferProduct.quantity || 0 }})</option>
              <option value="depot">Depósito ({{ transferProduct.depotStock || 0 }})</option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-bold text-gray-700 text-sm">Destino:</label>
            <select v-model="transferConfig.destination" class="p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none">
              <option value="local">Local</option>
              <option value="depot">Depósito</option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-bold text-gray-700 text-sm">Cantidad:</label>
            <input
              v-model.number="transferConfig.quantity"
              type="number"
              min="1"
              :max="transferMaxQuantity"
              class="p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Ingresa la cantidad"
            />
            <span v-if="transferConfig.quantity > transferMaxQuantity" class="text-red-500 text-xs">Stock insuficiente en origen</span>
          </div>

          <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            <i class="fas fa-info-circle mr-1"></i>
            El origen y destino no pueden ser iguales.
          </div>
        </div>
      </div>
      <div class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-3">
        <button @click="showingTransferModal = false" class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer hover:bg-gray-100 shadow-sm w-full md:w-auto text-center" :disabled="transferLoading">
          Cancelar
        </button>
        <button @click="transferStock" class="py-3 md:py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto" :disabled="transferLoading || !canTransfer">
          <span v-if="transferLoading" class="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
          <i v-else class="fas fa-exchange-alt mr-2"></i>
          {{ transferLoading ? "Transfiriendo..." : "Transferir" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import quickCreateProduct from "@/components/visuals/stock/quickCreateProduct.vue";
import { useStockStore } from "@/stores/stockStore";
import { useSalesStore } from "@/stores/salesStore";
import api from "@/config/axios.config";
import moment from "moment";
import numeral from "numeral";
import editProduct from "@/components/visuals/stock/editProduct.vue";
import deleteProduct from "@/components/visuals/stock/deleteProduct.vue";
import toastComponent from "@/components/visuals/toast/toastComponent.vue";
import quickUpdate from "@/components/visuals/stock/quickUpdate.vue";
import categoryPercentagePatch from "@/components/visuals/stock/categoryPercentagePatch.vue";
import deleteProductsByCategory from "@/components/visuals/stock/deleteProductsByCategory.vue";

export default {
  name: "StockManagement",
  components: {
    deleteProduct,
    editProduct,
    toastComponent,
    quickUpdate,
    categoryPercentagePatch,
    quickCreateProduct,
    deleteProductsByCategory,
  },
  data() {
    return {
      store: useStockStore(),
      salesStore: useSalesStore(),
      searchTimeout: null,
      showConfirmModal: false,
      productToDelete: null,
      itemsPerPage: 10,
      productActions: {},
      showingDeleteModal: false,
      showingEditProduct: false,
      showingQuickUpdate: false,
      showingPercentagePatch: false,
      productId: null,
      selectedProduct: null,
      showingQuickCreateProduct: false,
      showingDeleteProductByCategory: false,
      showingTransferModal: false,
      transferProduct: null,
      transferLoading: false,
      transferConfig: {
        origin: "local",
        destination: "depot",
        quantity: 1,
      },
    };
  },

  computed: {
    transferMaxQuantity() {
      if (!this.transferProduct) return 0;
      if (this.transferConfig.origin === "local") {
        return this.transferProduct.quantity || 0;
      }
      return this.transferProduct.depotStock || 0;
    },
    canTransfer() {
      return (
        this.transferConfig.origin !== this.transferConfig.destination &&
        this.transferConfig.quantity > 0 &&
        this.transferConfig.quantity <= this.transferMaxQuantity
      );
    },
  },

  methods: {
    handleQuickUpdateSubmit() {
      this.showingQuickUpdate = false;
      this.store.toast = {
        showing: true,
        message: "Producto actualizado exitosamente",
        state: "success",
      };
    },
    handleQuickUpdateError(error) {
      this.showingQuickUpdate = false;
      this.store.toast = {
        showing: true,
        message: error.message || "Error al actualizar el producto",
        state: "danger",
      };
    },
    async goTo(path) {
      console.log("Navigating to:", path);
      this.$router.push(path);
    },

    getProductAction(productId) {
      return this.productActions[productId] || "";
    },

    async handleActionChange(product, event) {
      const action = event.target.value;
      const productId = product._id;

      this.productActions[productId] = action;

      switch (action) {
        case "update":
          break;
        case "edit":
          this.productId = productId;
          this.showingEditProduct = true;
          break;

        case "quick-update":
          this.selectedProduct = product;
          this.showingQuickUpdate = true;
          break;
        case "delete":
          this.showingDeleteModal = true;
          this.productToDelete = product;
          console.log("product to delete:", this.productToDelete);
          break;
      }

      setTimeout(() => {
        this.productActions[productId] = "";
      }, 100);
    },

    async handleDeleteProduct() {
      this.showingDeleteModal = false;
      this.productToDelete = null;
      await this.store.fetchProducts();
    },

    // Método para manejar la eliminación masiva
    async handleBulkDelete() {
      try {
        const result = await this.store.executeBulkDelete();

        if (result.success) {
          this.store.toast = {
            showing: true,
            message: `${result.deletedCount} producto(s) eliminado(s) exitosamente`,
            state: "success",
          };
        }
      } catch (error) {
        this.store.toast = {
          showing: true,
          message: `Error: ${error.message}`,
          state: "danger",
        };
      }
    },

    // Métodos existentes
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },

    formatPrice(price) {
      return numeral(price || 0).format("$0.00");
    },

    getStockClass(quantity) {
      if (quantity === undefined || quantity === null) return "";
      if (quantity <= 0) return "stock-out";
      if (quantity < 10) return "stock-low";
      return "stock-ok";
    },

    clearSearch() {
      this.store.searchQuery = "";
      this.store.fetchProducts(1, this.itemsPerPage);
    },

    handleLimitChange() {
      this.store.changeLimit(parseInt(this.itemsPerPage));
    },

    showCreateModal() {
      console.log("Mostrar modal de creación");
    },

    editProduct(productId) {
      console.log("Editar producto:", productId);
    },

    setIdForDelete(productId) {
      this.productToDelete = productId;
      this.showConfirmModal = true;
    },

    async deleteProduct() {
      if (this.productToDelete) {
        try {
          console.log("Eliminar producto:", this.productToDelete);
          await this.store.fetchProducts();
          this.showConfirmModal = false;
          this.productToDelete = null;
        } catch (error) {
          console.error("Error al eliminar producto:", error);
        }
      }
    },

    quickUpdate(product) {
      console.log("Actualización rápida:", product);
    },

    async checkInput() {
      if (this.store.searchQuery === "") {
        this.store.fetchProducts();
      }
    },

    sellFromStock(product) {
      this.salesStore.addToCart(product);
      this.$router.push("/ventas");
    },

    openTransferModal(product) {
      this.transferProduct = product;
      this.transferConfig = {
        origin: "local",
        destination: "depot",
        quantity: 1,
      };
      this.showingTransferModal = true;
    },

    async transferStock() {
      if (!this.canTransfer) return;
      this.transferLoading = true;
      try {
        const shopId = this.store.shopId();
        const payload = {
          shopId,
          productId: this.transferProduct._id,
          from: this.transferConfig.origin,
          to: this.transferConfig.destination,
          quantity: this.transferConfig.quantity,
        };
        const response = await api.post("/products/post/transfer-stock", payload);
        const data = response.data;
        if (data.success) {
          this.store.toast = {
            showing: true,
            message: "Stock transferido exitosamente",
            state: "success",
          };
          this.showingTransferModal = false;
          this.store.fetchProducts();
        } else {
          this.store.toast = {
            showing: true,
            message: data.message || "Error al transferir stock",
            state: "danger",
          };
        }
      } catch (error) {
        this.store.toast = {
          showing: true,
          message: "Error de conexión al transferir stock",
          state: "danger",
        };
      } finally {
        this.transferLoading = false;
      }
    },
  },

  async mounted() {
    await this.store.fetchProducts();
    this.store.fetchStockValue();

    this.itemsPerPage = this.store.pagination.limit;
  },
};
</script>

<style scoped>
/* ─── Base ─── */
.inventory-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  color: #1f2937;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ─── Stats Cards ─── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
.stat-icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 1.1rem;
}
.stat-info { display: flex; flex-direction: column; min-width: 0; }
.stat-title { font-size: 0.8rem; font-weight: 600; color: #64748b; margin-bottom: 0.2rem; }
.stat-value { font-size: 1.35rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; word-break: break-all; }
.bg-gradient-orange { background: linear-gradient(135deg, #f9931e 0%, #f76707 100%); }
.bg-gradient-green  { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.bg-gradient-blue   { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }

/* ─── Toolbar ─── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 0.875rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar-search {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
}

.search-input {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  padding: 0.5rem 0.875rem;
  flex: 1;
  min-width: 0;
  gap: 0.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input:focus-within {
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.12);
  background: white;
}
.search-input i { color: #9ca3af; flex-shrink: 0; }
.search-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  background: transparent;
  color: #1f2937;
  min-width: 0;
}
.search-input input::placeholder { color: #9ca3af; }

.clear-search {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.15s;
}
.clear-search:hover { color: #ef4444; }

.btn-search {
  background: #f9931e;
  color: white;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s;
}
.btn-search:hover { background: #e8821a; }

.btn-toggle-filters {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.55rem 0.875rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}
.btn-toggle-filters:hover { background: #e2e8f0; }
.filter-chevron { font-size: 0.7rem; }

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar-divider {
  width: 1px;
  height: 1.5rem;
  background: #e5e7eb;
  flex-shrink: 0;
}

/* ─── Botones generales ─── */
.btn-primary {
  background: #f9931e;
  color: white;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-primary:hover { background: #e8821a; }

.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.55rem 1rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
  transition: all 0.15s;
}
.btn-secondary:hover { background: #e2e8f0; }

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-danger:hover { background: #dc2626; }

.btn-danger-outline {
  background: transparent;
  color: #ef4444;
  border: 1px solid #fca5a5;
  padding: 0.55rem 1rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
  transition: all 0.15s;
}
.btn-danger-outline:hover { background: #fef2f2; border-color: #ef4444; }

/* ─── Panel de Filtros ─── */
.filters-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filters-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 700;
  font-size: 0.875rem;
  color: #374151;
}
.filters-panel-header i { color: #f9931e; margin-right: 0.375rem; }

.filters-clear-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.15s;
}
.filters-clear-btn:hover { color: #ef4444; background: #fef2f2; }

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  position: relative;
}

.filter-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-input,
.filter-select {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1f2937;
  background: #f8fafc;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.12);
  background: white;
}

.filter-range {
  display: flex;
  gap: 0.5rem;
}
.filter-range .filter-input { flex: 1; min-width: 0; }

.filter-input[type="date"] {
  min-width: 0;
}

select.filter-input {
  appearance: auto;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid #f3f4f6;
  background: #f8fafc;
}

/* Autocomplete */
.search-autocomplete-container { position: relative; }

.autocomplete-results-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.375rem;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
}
.autocomplete-result-item {
  padding: 0.625rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #1f2937;
  border-radius: 0.375rem;
}
.autocomplete-result-item:hover { background: #f3f4f6; }

.btn-clear-autocomplete {
  background: none;
  border: none;
  color: #6b7280;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(calc(-50% + 0.5rem));
  padding: 0.25rem;
  width: auto;
  height: auto;
  border-radius: 50%;
  cursor: pointer;
  z-index: 11;
  transition: color 0.15s;
}
.btn-clear-autocomplete:hover { color: #ef4444; }

/* Filtros slide transition */
.filters-slide-enter-active,
.filters-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.filters-slide-enter-from,
.filters-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ─── Tabla ─── */
.stock-management { padding: 0; }

.data-table-container {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
}

.table-responsive { overflow-x: auto; }

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f3f4f6;
  border-top-color: #f9931e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table.loading { opacity: 0.5; }

.data-table th {
  background: #f8fafc;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #374151;
}

.data-table tbody tr { transition: background 0.15s; }
.data-table tbody tr:hover { background: #f8fafc; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tr.low-stock { background: #fffbeb; }
.data-table tr.out-of-stock { background: #fef2f2; }

.image-cell { width: 72px; text-align: center; }
.product-image {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
.no-image {
  font-size: 0.7rem;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
}

.actions-cell { white-space: nowrap; }
.actions-header { text-align: center; }

.action-buttons-inline {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: nowrap;
}

.btn-sell {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-sell:hover { background: #059669; }

.btn-transfer {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-transfer:hover { background: #2563eb; }

.form-control {
  padding: 0.4rem 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f8fafc;
  font-size: 0.8rem;
  color: #374151;
  cursor: pointer;
}
.form-control:disabled { opacity: 0.5; cursor: not-allowed; }

/* Stock badges */
.stock-out  { color: #ef4444; font-weight: 700; }
.stock-low  { color: #f59e0b; font-weight: 700; }
.stock-ok   { color: #10b981; font-weight: 600; }

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #9ca3af;
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  color: #d1d5db;
}
.empty-state p { font-size: 1rem; }

/* Paginación */
.pagination-info {
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  color: #9ca3af;
  font-size: 0.8rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pagination-btn {
  padding: 0.5rem 0.875rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  transition: all 0.15s;
}
.pagination-btn:hover:not(:disabled) { background: #f3f4f6; }
.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.page-number {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  min-width: 2.25rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  transition: all 0.15s;
}
.page-number:hover:not(:disabled) { background: #f3f4f6; }
.page-number.active { background: #f9931e; color: white; border-color: #f9931e; }
.page-number:disabled { opacity: 0.4; cursor: not-allowed; }
.page-ellipsis { padding: 0.5rem 0.25rem; color: #9ca3af; font-weight: 600; }

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.items-per-page label { font-size: 0.8rem; color: #9ca3af; font-weight: 600; }

/* Bulk action bar */
.checkbox-cell { width: 52px; text-align: center; }
.bulk-checkbox, .product-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: #f9931e; }
.checkbox-label { font-size: 0.7rem; color: #9ca3af; margin-left: 0.2rem; }
.selected-for-deletion { background: #fef2f2 !important; border-left: 3px solid #ef4444; }

.bulk-actions-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1e293b;
  color: white;
  padding: 0.875rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  z-index: 40;
}
.selected-count { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9rem; }
.selected-count i { color: #10b981; }
.bulk-buttons { display: flex; gap: 0.75rem; }
.bulk-buttons .btn-secondary { background: #334155; border-color: #475569; color: white; }
.bulk-buttons .btn-secondary:hover { background: #475569; }

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 1rem;
  }
  .toolbar-search { flex-wrap: wrap; }
  .toolbar-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .toolbar-actions .btn-primary,
  .toolbar-actions .btn-secondary,
  .toolbar-actions .btn-danger-outline { flex: 1; justify-content: center; }
  .toolbar-divider { display: none; }

  .filters-grid { grid-template-columns: 1fr; }

  .pagination { flex-direction: column; align-items: stretch; }
  .page-numbers { justify-content: center; order: -1; }
  .items-per-page { justify-content: center; }

  .bulk-actions-bar { flex-direction: column; gap: 0.75rem; padding: 1rem; }
  .bulk-buttons { width: 100%; justify-content: stretch; }
  .bulk-buttons button { flex: 1; justify-content: center; }
}

@media (max-width: 480px) {
  .pagination-btn { flex: 1; justify-content: center; }
  .search-input { min-width: 0; }
}
</style>
