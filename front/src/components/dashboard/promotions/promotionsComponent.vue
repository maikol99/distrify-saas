<template>
  <div class="inventory-container">
    <!-- Top Bar: Search inline & Nueva Promocion arriba a la derecha -->
    <div class="promo-top-bar">
      <div class="modern-search-bar">
        <div class="search-input-wrap">
          <i class="fas fa-search search-icon-left"></i>
          <input
            v-model="store.filters.search"
            placeholder="Buscar promoción por nombre..."
            @keyup.enter="applyFilters"
            class="search-field"
          />
          <button
            v-if="store.filters.search"
            @click="clearSearch"
            class="clear-search-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <select v-model="store.filters.type" @change="applyFilters" class="filter-select-inline">
          <option value="">Tipo: Todos</option>
          <option value="discount">Descuento</option>
          <option value="combo">Combo</option>
        </select>

        <select v-model="store.filters.isActive" @change="applyFilters" class="filter-select-inline">
          <option value="">Estado: Todos</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>

        <input
          type="date"
          v-model="store.filters.startDate"
          @change="applyFilters"
          class="filter-date-inline"
          title="Desde"
        />

        <input
          type="date"
          v-model="store.filters.endDate"
          @change="applyFilters"
          class="filter-date-inline"
          title="Hasta"
        />

        <button @click="applyFilters" class="btn-filter-apply-top">
          <i class="fas fa-filter"></i> Aplicar filtros
        </button>

        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="btn-secondary"
          style="padding: 0.5rem 0.85rem; border-radius: 0.75rem;"
          title="Limpiar filtros"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="top-action-buttons">
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> Nueva Promoción
        </button>
      </div>
    </div>

    <!-- 3 KPI Cards como en Img 2 -->
    <div class="promo-kpi-grid">
      <!-- Tarjeta 1: Promociones activas -->
      <div class="promo-kpi-card kpi-orange">
        <div class="kpi-left">
          <div class="kpi-icon-circle bg-orange-circle">
            <span class="material-symbols-outlined">sell</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Promociones activas</span>
            <h2 class="kpi-number">{{ activePromotionsCount }}</h2>
          </div>
        </div>
        <span class="material-symbols-outlined kpi-chevron">chevron_right</span>
        <div class="kpi-deco kpi-deco-orange"></div>
      </div>

      <!-- Tarjeta 2: Combos -->
      <div class="promo-kpi-card kpi-green">
        <div class="kpi-left">
          <div class="kpi-icon-circle bg-green-circle">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Combos</span>
            <h2 class="kpi-number">{{ combosCount }}</h2>
          </div>
        </div>
        <span class="material-symbols-outlined kpi-chevron">chevron_right</span>
        <div class="kpi-deco kpi-deco-green"></div>
      </div>

      <!-- Tarjeta 3: Próximas a vencer -->
      <div class="promo-kpi-card kpi-blue">
        <div class="kpi-left">
          <div class="kpi-icon-circle bg-blue-circle">
            <span class="material-symbols-outlined">schedule</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Próximas a vencer</span>
            <h2 class="kpi-number">{{ expiringSoonCount }}</h2>
          </div>
        </div>
        <span class="material-symbols-outlined kpi-chevron">chevron_right</span>
        <div class="kpi-deco kpi-deco-blue"></div>
      </div>
    </div>

    <!-- Sección de tabla con título 'Listado de promociones' -->
    <div class="promo-table-section">
      <div class="table-section-header">
        <h2 class="table-section-title">Listado de promociones</h2>
      </div>

      <div class="data-table-container">
        <div v-if="store.loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>Cargando promociones...</p>
        </div>

        <div class="table-responsive hidden md:block">
          <table class="data-table" :class="{ loading: store.loading }">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>TIPO</th>
                <th>PRODUCTOS</th>
                <th>DESCUENTO / COMBO</th>
                <th>VIGENCIA</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="promotion in store.promotions"
                :key="promotion._id"
              >
                <td class="font-semibold text-gray-800">{{ promotion.name || "N/A" }}</td>
                <td>
                  <span :class="promotion.type === 'combo' ? 'badge-combo' : 'badge-discount'">
                    {{ promotion.type === 'discount' ? 'Descuento' : 'Combo' }}
                  </span>
                </td>
                <td>
                  <span
                    class="truncate-text"
                    :title="getProductNames(promotion)"
                  >
                    {{ getProductNames(promotion) || "N/A" }}
                  </span>
                </td>
                <td class="font-medium text-gray-700">
                  <span v-if="promotion.type === 'discount'">
                    {{ promotion.discountType === 'percentage' ? '%' : '$' }}
                    {{ promotion.discountValue !== undefined && promotion.discountValue !== null ? promotion.discountValue : promotion.value }}
                  </span>
                  <span v-else>
                    {{ formatPrice(promotion.comboPrice) }}
                  </span>
                </td>
                <td class="text-xs text-gray-600 whitespace-nowrap">
                  <span v-if="promotion.startDate || promotion.endDate">
                    {{ formatDate(promotion.startDate) }} – {{ promotion.endDate ? formatDate(promotion.endDate) : 'Sin vencimiento' }}
                  </span>
                  <span v-else class="text-gray-400">Sin vencimiento</span>
                </td>
                <td>
                  <span :class="promotion.isActive ? 'status-pill-active' : 'status-pill-inactive'">
                    <span class="status-dot-indicator"></span>
                    {{ promotion.isActive ? "Activa" : "Inactiva" }}
                  </span>
                </td>
                <td class="actions-cell">
                  <select
                    class="form-control"
                    :value="getPromotionAction(promotion._id)"
                    @change="handleActionChange(promotion, $event)"
                  >
                    <option value="">Acciones</option>
                    <option value="edit">Editar</option>
                    <option value="delete">Eliminar</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vista mobile simplificada -->
        <div class="grid grid-cols-1 gap-4 md:hidden mb-4 p-4">
          <div
            v-for="promotion in store.promotions"
            :key="promotion._id"
            class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative"
          >
            <div class="flex justify-between items-start">
              <div class="flex flex-col min-w-0 pr-2">
                <h3 class="font-bold text-gray-800 text-sm m-0 truncate w-full" :title="promotion.name || 'N/A'">
                  {{ promotion.name || "N/A" }}
                </h3>
                <span class="text-xs text-gray-500 mt-1">
                  {{ promotion.type === 'discount' ? 'Descuento' : 'Combo' }}
                </span>
              </div>
              <div class="flex-shrink-0">
                <select
                  class="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-1 px-2 text-xs font-semibold"
                  :value="getPromotionAction(promotion._id)"
                  @change="handleActionChange(promotion, $event)"
                >
                  <option value="">Acciones</option>
                  <option value="edit">Editar</option>
                  <option value="delete">Eliminar</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg text-xs border border-gray-100">
              <div>
                <span class="text-gray-400 font-bold uppercase block text-[10px]">Inicio</span>
                <span class="font-semibold text-gray-800">{{ formatDate(promotion.startDate) }}</span>
              </div>
              <div class="text-right">
                <span class="text-gray-400 font-bold uppercase block text-[10px]">Fin</span>
                <span class="font-semibold text-gray-800">{{ formatDate(promotion.endDate) }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center border-t border-gray-100 pt-2 text-xs">
              <span class="text-gray-500 font-semibold uppercase">
                {{ promotion.type === 'discount' ? 'Descuento:' : 'Precio combo:' }}
              </span>
              <span class="font-bold text-orange-600">
                <template v-if="promotion.type === 'discount'">
                  {{ promotion.discountType === 'percentage' ? '%' : '$' }}{{ promotion.discountValue !== undefined && promotion.discountValue !== null ? promotion.discountValue : promotion.value }}
                </template>
                <template v-else>
                  {{ formatPrice(promotion.comboPrice) }}
                </template>
              </span>
            </div>

            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 font-semibold uppercase">Estado:</span>
              <span :class="promotion.isActive ? 'status-pill-active' : 'status-pill-inactive'">
                <span class="status-dot-indicator"></span>
                {{ promotion.isActive ? "Activa" : "Inactiva" }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="store.promotions.length === 0 && !store.loading"
          class="empty-state"
        >
          <i class="fas fa-percent"></i>
          <p>No se encontraron promociones</p>
        </div>

        <div class="pagination-info">
          <span>{{ store.itemsInfo }}</span>
        </div>

        <div class="pagination">
          <button
            @click="store.previousPage()"
            :disabled="store.pagination.page === 1 || store.loading"
            class="btn-secondary pagination-btn"
          >
            <i class="fas fa-chevron-left"></i> Anterior
          </button>

          <div class="page-numbers">
            <button
              v-if="store.pagination.page > 3"
              @click="store.goToPage(1)"
              class="page-number"
              :disabled="store.loading"
            >
              1
            </button>
            <span v-if="store.pagination.page > 3" class="page-ellipsis">...</span>

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

          <div class="items-per-page">
            <label for="itemsPerPage">Mostrar por página:</label>
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

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex flex-col items-center md:justify-center justify-end z-[1100] md:p-4 backdrop-blur-sm"
    >
      <div
        class="bg-white w-full md:w-[600px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up max-h-[90vh]"
      >
        <div
          class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 text-orange-600"
        >
          <h3 class="text-xl font-bold m-0 flex items-center gap-2">
            <span class="material-symbols-outlined">sell</span>
            {{ isEditing ? "Editar Promoción" : "Nueva Promoción" }}
          </h3>
          <button
            @click="closeModal"
            class="text-orange-400 hover:text-orange-600 transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-5 flex-1 overflow-y-auto space-y-4">
          <div class="form-group">
            <label class="form-label">Nombre <span class="text-red-500">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Nombre de la promoción"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Tipo <span class="text-red-500">*</span></label>
            <select v-model="form.type" class="form-input">
              <option value="">Seleccionar tipo</option>
              <option value="discount">Descuento</option>
              <option value="combo">Combo</option>
            </select>
          </div>

          <div v-if="form.type === 'discount'" class="form-group">
            <label class="form-label">Tipo de descuento <span class="text-red-500">*</span></label>
            <select v-model="form.discountType" class="form-input">
              <option value="">Seleccionar</option>
              <option value="percentage">Porcentaje</option>
              <option value="fixed">Monto fijo</option>
            </select>
          </div>

          <div v-if="form.type === 'discount'" class="form-group">
            <label class="form-label">Valor <span class="text-red-500">*</span></label>
            <input
              v-model.number="form.value"
              type="number"
              class="form-input"
              :placeholder="form.discountType === 'percentage' ? 'Ej: 20' : 'Ej: 5000'"
              min="0"
              :step="form.discountType === 'percentage' ? '1' : '0.01'"
            />
          </div>

          <div v-if="form.type === 'combo'" class="form-group">
            <label class="form-label">Precio del combo <span class="text-red-500">*</span></label>
            <input
              v-model.number="form.comboPrice"
              type="number"
              class="form-input"
              placeholder="Precio del combo"
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Productos <span class="text-red-500">*</span></label>
            <div class="multi-select-container">
              <div class="selected-chips" v-if="form.products.length > 0">
                <span
                  v-for="product in form.products"
                  :key="product._id"
                  class="chip"
                >
                  {{ product.name || product._id }}
                  <button
                    @click="removeProduct(product._id)"
                    class="chip-remove"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </span>
              </div>
              <div class="product-search-wrapper">
                <input
                  v-model="productSearchQuery"
                  type="text"
                  class="form-input"
                  placeholder="Buscar productos por nombre..."
                  @input="searchProducts"
                />
                <ul
                  v-if="productSearchResults.length > 0 && productSearchQuery.length > 0"
                  class="autocomplete-results-list"
                >
                  <li
                    v-for="product in productSearchResults"
                    :key="product._id"
                    @click="addProduct(product)"
                    class="autocomplete-result-item"
                    :class="{ 'selected-item': isProductSelected(product._id) }"
                  >
                    {{ product.name }}
                    <span class="text-xs text-gray-400 ml-2">{{ formatPrice(product.sellPrice) }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Fecha inicio <span class="text-red-500">*</span></label>
              <input
                v-model="form.startDate"
                type="date"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Fecha fin <span class="text-red-500">*</span></label>
              <input
                v-model="form.endDate"
                type="date"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span class="form-label !mb-0">Activo</span>
            </label>
          </div>
        </div>

        <div
          class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-3 mt-auto"
        >
          <button
            @click="closeModal"
            class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto text-center"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="submitting"
            class="py-3 md:py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center w-full md:w-auto"
          >
            <span class="material-symbols-outlined mr-2">save</span>
            {{ isEditing ? "Guardar Cambios" : "Crear Promoción" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 flex flex-col items-center md:justify-center justify-end z-[1100] md:p-4 backdrop-blur-sm"
    >
      <div
        class="bg-white w-full md:w-[500px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up max-h-[90vh]"
      >
        <div
          class="flex justify-between items-center p-5 border-b border-red-100 bg-red-50 text-red-600"
        >
          <h3 class="text-xl font-bold m-0 flex items-center gap-2">
            <span class="material-symbols-outlined">warning</span>
            Eliminar Promoción
          </h3>
        </div>
        <div class="p-5 flex-1 overflow-y-auto">
          <p class="text-gray-700 md:text-lg mb-2">
            ¿Estás seguro de que deseas eliminar la promoción
            <strong class="text-red-600">{{ promotionToDelete?.name }}</strong
            >?
          </p>
          <p class="text-red-500 text-sm font-semibold mb-4">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div
          class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-3 mt-auto"
        >
          <button
            @click="showDeleteModal = false"
            class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto text-center"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="deleting"
            class="py-3 md:py-2 px-5 bg-red-600 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-red-700 shadow-sm flex items-center justify-center w-full md:w-auto"
          >
            <span class="material-symbols-outlined mr-2">delete</span>
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <toastComponent
      v-if="store.toast.showing"
      :message="store.toast.message"
      :state="store.toast.state"
      :autoClose="true"
    ></toastComponent>
  </div>
</template>

<script>
import { usePromotionsStore } from "@/stores/promotionsStore";
import toastComponent from "@/components/visuals/toast/toastComponent.vue";
import api from "@/config/axios.config";
import moment from "moment";
import numeral from "numeral";

export default {
  name: "PromotionsManagement",
  components: {
    toastComponent,
  },
  data() {
    return {
      store: usePromotionsStore(),
      showFilters: false,
      itemsPerPage: 10,
      promotionActions: {},
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      submitting: false,
      deleting: false,
      editingPromotionId: null,
      promotionToDelete: null,
      productSearchQuery: "",
      productSearchResults: [],
      productSearchTimeout: null,
      form: this.getEmptyForm(),
    };
  },

  computed: {
    hasActiveFilters() {
      const f = this.store.filters;
      return f.isActive || f.type || f.startDate || f.endDate || f.search;
    },
    activePromotionsCount() {
      return this.store.promotions.filter((p) => p.isActive).length;
    },
    combosCount() {
      return this.store.promotions.filter((p) => p.type === 'combo').length;
    },
    expiringSoonCount() {
      const now = new Date();
      const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return this.store.promotions.filter((p) => {
        if (!p.endDate) return false;
        const end = new Date(p.endDate);
        return end >= now && end <= in7days;
      }).length;
    },
  },

  methods: {
    getEmptyForm() {
      return {
        name: "",
        type: "",
        discountType: "",
        value: null,
        comboPrice: null,
        products: [],
        startDate: "",
        endDate: "",
        isActive: true,
      };
    },

    getProductNames(promotion) {
      const raw = promotion.productIds || promotion.products || [];
      if (raw.length === 0) return "Sin productos";
      const names = raw.map((p) => {
        if (typeof p === "object" && p.name) return p.name;
        if (typeof p === "object" && p.productId && p.productId.name) return p.productId.name;
        return "Producto";
      });
      return names.join(", ");
    },

    formatDate(date) {
      if (!date) return "N/A";
      return moment(date).format("DD/MM/YYYY");
    },

    formatPrice(price) {
      return numeral(price || 0).format("$0.00");
    },

    getPromotionAction(promotionId) {
      return this.promotionActions[promotionId] || "";
    },

    handleActionChange(promotion, event) {
      const action = event.target.value;
      const promotionId = promotion._id;

      this.promotionActions[promotionId] = action;

      switch (action) {
        case "edit":
          this.openEditModal(promotion);
          break;
        case "delete":
          this.promotionToDelete = promotion;
          this.showDeleteModal = true;
          break;
      }

      setTimeout(() => {
        this.promotionActions[promotionId] = "";
      }, 100);
    },

    openCreateModal() {
      this.isEditing = false;
      this.editingPromotionId = null;
      this.form = this.getEmptyForm();
      this.productSearchQuery = "";
      this.productSearchResults = [];
      this.showModal = true;
    },

    openEditModal(promotion) {
      this.isEditing = true;
      this.editingPromotionId = promotion._id;
      const rawProducts = promotion.productIds || promotion.products || [];
      this.form = {
        name: promotion.name || "",
        type: promotion.type || "",
        discountType: promotion.discountType || "",
        value: promotion.discountValue !== undefined && promotion.discountValue !== null ? promotion.discountValue : (promotion.value || null),
        comboPrice: promotion.comboPrice || null,
        products: rawProducts.map((p) => {
          if (typeof p === "object" && p._id) return { _id: p._id, name: p.name };
          if (typeof p === "object" && p.productId) return { _id: p.productId._id || p.productId, name: p.productId.name || "Producto" };
          return { _id: p, name: "Producto" };
        }),
        startDate: promotion.startDate ? moment(promotion.startDate).format("YYYY-MM-DD") : "",
        endDate: promotion.endDate ? moment(promotion.endDate).format("YYYY-MM-DD") : "",
        isActive: promotion.isActive !== undefined ? promotion.isActive : true,
      };
      this.productSearchQuery = "";
      this.productSearchResults = [];
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.form = this.getEmptyForm();
      this.productSearchQuery = "";
      this.productSearchResults = [];
    },

    async handleSubmit() {
      if (!this.form.name || !this.form.type) {
        this.store.toast = {
          showing: true,
          message: "Por favor completa los campos requeridos.",
          state: "danger",
        };
        return;
      }

      if (this.form.type === "discount" && (!this.form.discountType || this.form.value === null || this.form.value === "")) {
        this.store.toast = {
          showing: true,
          message: "Por favor completa el tipo de descuento y el valor.",
          state: "danger",
        };
        return;
      }

      if (this.form.type === "combo" && (this.form.comboPrice === null || this.form.comboPrice === "")) {
        this.store.toast = {
          showing: true,
          message: "Por favor ingresa el precio del combo.",
          state: "danger",
        };
        return;
      }

      if (this.form.products.length === 0) {
        this.store.toast = {
          showing: true,
          message: "Por favor selecciona al menos un producto.",
          state: "danger",
        };
        return;
      }

      try {
        this.submitting = true;

        const payload = {
          shopId: this.store.shopId(),
          name: this.form.name,
          type: this.form.type,
          productIds: this.form.products.map((p) => p._id),
          startDate: this.form.startDate,
          endDate: this.form.endDate,
          isActive: this.form.isActive,
        };

        if (this.form.type === "discount") {
          payload.discountType = this.form.discountType;
          payload.discountValue = this.form.value;
          payload.value = this.form.value;
        } else {
          payload.comboPrice = this.form.comboPrice;
          payload.discountValue = 0;
        }

        let result;
        if (this.isEditing) {
          result = await this.store.updatePromotion(this.editingPromotionId, payload);
        } else {
          result = await this.store.createPromotion(payload);
        }

        if (result.success) {
          this.store.toast = {
            showing: true,
            message: this.isEditing
              ? "Promoción actualizada exitosamente"
              : "Promoción creada exitosamente",
            state: "success",
          };
          this.closeModal();
          await this.store.loadData();
        } else {
          this.store.toast = {
            showing: true,
            message: result.message || "Error al procesar la promoción",
            state: "danger",
          };
        }
      } catch (error) {
        console.error("Error submitting promotion:", error);
        this.store.toast = {
          showing: true,
          message: error.response?.data?.message || "Error al procesar la promoción",
          state: "danger",
        };
      } finally {
        this.submitting = false;
      }
    },

    async handleDelete() {
      if (!this.promotionToDelete) return;

      try {
        this.deleting = true;
        const result = await this.store.deletePromotion(this.promotionToDelete._id);

        if (result.success) {
          this.store.toast = {
            showing: true,
            message: "Promoción eliminada exitosamente",
            state: "success",
          };
          this.showDeleteModal = false;
          this.promotionToDelete = null;
          await this.store.loadData();
        } else {
          this.store.toast = {
            showing: true,
            message: result.message || "Error al eliminar la promoción",
            state: "danger",
          };
        }
      } catch (error) {
        console.error("Error deleting promotion:", error);
        this.store.toast = {
          showing: true,
          message: error.response?.data?.message || "Error al eliminar la promoción",
          state: "danger",
        };
      } finally {
        this.deleting = false;
      }
    },

    async searchProducts() {
      if (this.productSearchTimeout) {
        clearTimeout(this.productSearchTimeout);
      }

      if (this.productSearchQuery.length < 2) {
        this.productSearchResults = [];
        return;
      }

      this.productSearchTimeout = setTimeout(async () => {
        try {
          const shopId = this.store.shopId();
          const response = await api.get(
            `/products/get/search-product/${shopId}?name=${encodeURIComponent(this.productSearchQuery)}&page=1&limit=20`
          );
          const data = response.data;
          if (data.success) {
            this.productSearchResults = data.data || [];
          }
        } catch (error) {
          console.error("Error searching products:", error);
        }
      }, 300);
    },

    addProduct(product) {
      if (!this.isProductSelected(product._id)) {
        this.form.products.push(product);
      }
      this.productSearchQuery = "";
      this.productSearchResults = [];
    },

    removeProduct(productId) {
      this.form.products = this.form.products.filter((p) => p._id !== productId);
    },

    isProductSelected(productId) {
      return this.form.products.some((p) => p._id === productId);
    },

    applyFilters() {
      this.store.pagination.page = 1;
      this.store.loadData();
    },

    clearSearch() {
      this.store.filters.search = "";
      this.store.loadData();
    },

    clearAllFilters() {
      this.store.clearFilters();
      this.store.loadData();
    },

    handleLimitChange() {
      this.store.changeLimit(parseInt(this.itemsPerPage));
    },
  },

  async mounted() {
    await this.store.fetchPromotions();
    this.itemsPerPage = this.store.pagination.limit;
  },
};
</script>

<style scoped>
.inventory-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex: 1;
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-input i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
}

.search-input input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s;
}

.search-input input:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.875rem;
}

.clear-search:hover {
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-buttons button {
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(249, 147, 30, 0.4);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
}

.btn-search {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.3);
  transition: all 0.2s ease;
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(249, 147, 30, 0.4);
}

.filter-toggle-container {
  margin-bottom: 1rem;
}

.btn-toggle-filters {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.3);
}

.btn-toggle-filters:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(249, 147, 30, 0.4);
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: white;
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
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.filter-input,
.filter-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.stock-management {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.data-table-container {
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #f3f4f6;
  border-top-color: #f9931e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: #6b7280;
  font-size: 0.875rem;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table.loading {
  opacity: 0.5;
}

.data-table thead {
  background-color: #f9fafb;
}

.data-table th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.actions-cell {
  min-width: 140px;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.truncate-text {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.stock-ok {
  color: #10b981;
  font-weight: 600;
}

.stock-out {
  color: #ef4444;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  color: #d1d5db;
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.pagination-info {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f9fafb;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-number {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 2.5rem;
  text-align: center;
  font-size: 0.875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.page-number:hover:not(:disabled) {
  background-color: #f9fafb;
  transform: translateY(-1px);
}

.page-number.active {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.3);
}

.page-number:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0.5rem 0.25rem;
  color: #6b7280;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.items-per-page label {
  font-size: 0.875rem;
  color: #6b7280;
}

.form-control {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  background: white;
  min-width: 5rem;
  font-size: 0.875rem;
}

.form-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.375rem;
}

.form-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  width: 100%;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.multi-select-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  background: white;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background-color: #fef3c7;
  color: #92400e;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.chip-remove {
  background: none;
  border: none;
  color: #92400e;
  cursor: pointer;
  padding: 0;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  opacity: 0.7;
}

.chip-remove:hover {
  opacity: 1;
}

.product-search-wrapper {
  position: relative;
}

.product-search-wrapper .form-input {
  border: none;
  padding: 0.375rem 0;
  border-radius: 0;
}

.product-search-wrapper .form-input:focus {
  outline: none;
  box-shadow: none;
}

.autocomplete-results-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 6px 12px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.06);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.autocomplete-result-item:last-child {
  border-bottom: none;
}

.autocomplete-result-item:hover {
  background-color: #f3f4f6;
}

.autocomplete-result-item.selected-item {
  background-color: #fef3c7;
  color: #92400e;
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-input {
    max-width: none;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .action-buttons button {
    width: 100%;
  }

  .filters-container {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-numbers {
    justify-content: center;
    order: -1;
  }

  .items-per-page {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pagination-btn {
    width: 100%;
    justify-content: center;
  }

  .search-input {
    width: 100%;
  }

  .inventory-container {
    padding: 1rem;
  }
}

/* ===== PROMO TOP BAR ===== */
.promo-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.modern-search-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}
.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
}
.search-icon-left {
  position: absolute;
  left: 0.65rem;
  color: #9ca3af;
  font-size: 0.85rem;
  pointer-events: none;
}
.search-field {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
}
.search-field:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249,147,30,0.1);
}
.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.2rem;
}
.filter-select-inline,
.filter-date-inline {
  padding: 0.5rem 0.65rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.82rem;
  background: white;
  color: #374151;
  min-width: 110px;
}
.filter-select-inline:focus,
.filter-date-inline:focus {
  outline: none;
  border-color: #f9931e;
}
.btn-filter-apply-top {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 3px 6px rgba(249,147,30,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-filter-apply-top:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(249,147,30,0.4);
}
.top-action-buttons {
  display: flex;
  align-items: center;
}

/* ===== KPI CARDS ===== */
.promo-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.promo-kpi-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
  position: relative;
}
.promo-kpi-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}
.kpi-orange { border-left: 4px solid #f97316; }
.kpi-green  { border-left: 4px solid #10b981; }
.kpi-blue   { border-left: 4px solid #3b82f6; }
.kpi-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1;
}
.kpi-icon-circle {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bg-orange-circle { background: linear-gradient(135deg, #f97316, #ea580c); color: white; }
.bg-green-circle  { background: linear-gradient(135deg, #10b981, #059669); color: white; }
.bg-blue-circle   { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
.kpi-info { display: flex; flex-direction: column; }
.kpi-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.kpi-orange .kpi-label { color: #ea580c; }
.kpi-green  .kpi-label { color: #059669; }
.kpi-blue   .kpi-label { color: #2563eb; }
.kpi-number {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0.1rem 0 0;
  line-height: 1.1;
}
.kpi-chevron {
  font-size: 1.4rem;
  color: #cbd5e1;
  z-index: 1;
}
.kpi-deco {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.12;
}
.kpi-deco-orange { background: #f97316; }
.kpi-deco-green  { background: #10b981; }
.kpi-deco-blue   { background: #3b82f6; }

/* ===== TABLE SECTION ===== */
.promo-table-section {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}
.table-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.5rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
}
.table-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* ===== BADGES & STATUS PILLS ===== */
.badge-combo {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  background: #fff7ed;
  color: #ea580c;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #fed7aa;
}
.badge-discount {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #bfdbfe;
}
.status-pill-active,
.status-pill-inactive {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}
.status-pill-active {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.status-pill-inactive {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.status-dot-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 768px) {
  .promo-kpi-grid { grid-template-columns: 1fr; }
  .promo-top-bar { flex-direction: column; align-items: stretch; }
  .modern-search-bar { flex-direction: column; align-items: stretch; }
}

</style>
