<template>
  <div class="sales-container animate-fade-in">
    <div class="data-table-container">
      <!-- Botón para mostrar/ocultar filtros -->
      <div class="filter-toggle-container">
        <button @click="toggleFilters" class="btn-toggle-filters">
          <span class="material-symbols-outlined">
            {{ showFilters ? "expand_less" : "expand_more" }}
          </span>
          {{ showFilters ? "Ocultar Filtros" : "Mostrar Filtros" }}
        </button>
      </div>

      <!-- Contenedor de Filtros -->
      <div v-if="showFilters" class="filters-container">
        <div class="filter-group search-autocomplete-container">
          <label for="filter-cashier">Cajero:</label>
          <input
            type="text"
            id="filter-cashier"
            v-model="cashierSearchQuery"
            @input="debouncedCashierSearch"
            placeholder="Nombre del cajero"
            class="filter-input"
            :disabled="salesListStore?.selectedCashier !== null"
          />
          <button
            v-if="salesListStore?.selectedCashier"
            @click="clearSelectedCashier"
            class="btn-clear-autocomplete"
            title="Limpiar cajero seleccionado"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <ul
            v-if="
              salesListStore?.cashierSearchResults?.length > 0 &&
              cashierSearchQuery?.length > 0 &&
              !salesListStore?.selectedCashier
            "
            class="autocomplete-results-list"
          >
            <li
              v-for="cashier in salesListStore.cashierSearchResults"
              :key="cashier?.username || 'unknown'"
              @click="selectCashier(cashier)"
              class="autocomplete-result-item"
            >
              {{ cashier?.username || "Cajero sin nombre" }}
            </li>
          </ul>
        </div>

        <div class="filter-group search-autocomplete-container">
          <label for="filter-client">Cliente:</label>
          <input
            type="text"
            id="filter-client"
            v-model="clientSearchQuery"
            @input="debouncedClientSearch"
            placeholder="Nombre del cliente"
            class="filter-input"
            :disabled="salesListStore?.selectedClient !== null"
          />
          <button
            v-if="salesListStore?.selectedClient"
            @click="clearSelectedClient"
            class="btn-clear-autocomplete"
            title="Limpiar cliente seleccionado"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <ul
            v-if="
              salesListStore?.clientSearchResults?.length > 0 &&
              clientSearchQuery?.length > 0 &&
              !salesListStore?.selectedClient
            "
            class="autocomplete-results-list"
          >
            <li
              v-for="client in salesListStore.clientSearchResults"
              :key="client?._id || 'unknown'"
              @click="selectClient(client)"
              class="autocomplete-result-item"
            >
              {{ client?.name || "Cliente sin nombre" }} ({{
                client?.address || "Sin dirección"
              }})
            </li>
          </ul>
        </div>

        <div class="filter-group">
          <label for="filter-start-date">Fecha inicio:</label>
          <input
            type="date"
            id="filter-start-date"
            v-model="salesListStore.filters.startDate"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label for="filter-end-date">Fecha fin:</label>
          <input
            type="date"
            id="filter-end-date"
            v-model="salesListStore.filters.endDate"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label for="filter-payment-method">Método de pago:</label>
          <select
            id="filter-payment-method"
            v-model="salesListStore.filters.paymentMethod"
            class="filter-select"
          >
            <option value="">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Cuenta corriente">Cuenta corriente</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-status">Estado de la venta:</label>
          <select
            id="filter-status"
            v-model="salesListStore.filters.status"
            class="filter-select"
          >
            <option value="">Todos</option>
            <option value="Completado">Completada</option>
            <option value="Cancelado">Cancelada</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-minAmount">Desde $:</label>
          <input
            type="number"
            id="filter-minAmount"
            v-model="salesListStore.filters.minAmount"
            class="filter-input"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div class="filter-group">
          <label for="filter-maxAmount">Hasta $:</label>
          <input
            type="number"
            id="filter-maxAmount"
            v-model="salesListStore.filters.maxAmount"
            class="filter-input"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div class="filter-group">
          <label for="filter-productId">Producto:</label>
          <input
            type="text"
            id="filter-productId"
            v-model="salesListStore.filters.productId"
            class="filter-input"
            placeholder="ID del producto"
          />
        </div>

        <div class="filter-group">
          <label for="filter-hasDiscount">Descuento:</label>
          <select
            id="filter-hasDiscount"
            v-model="salesListStore.filters.hasDiscount"
            class="filter-select"
          >
            <option value="">Todos</option>
            <option value="true">Con descuento</option>
            <option value="false">Sin descuento</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-saleId">ID de ticket:</label>
          <input
            type="text"
            id="filter-saleId"
            v-model="salesListStore.filters.saleId"
            class="filter-input"
            placeholder="ID de la venta"
          />
        </div>

        <div class="filter-actions">
          <button @click="applyFilters" class="btn-primary">
            <span class="material-symbols-outlined">filter_alt</span> Filtrar
          </button>
          <button @click="clearFilters" class="btn-secondary">
            <span class="material-symbols-outlined">close</span> Limpiar Filtros
          </button>
        </div>
      </div>

      <div class="table-header">
        <h2>Ventas Realizadas</h2>
      </div>

      <div class="table-responsive">
        <!-- Vista tabla para desktop -->
        <table v-if="sales?.length > 0" class="sales-table desktop-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total</th>
              <th>Cajero</th>
              <th>Cliente</th>
              <th>Método de Pago</th>
              <th>Estado Pago</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(sale, id) in sales"
              :key="sale?._id || id"
              :class="{
                'sale-canceled': sale?.status === 'Cancelado',
                'sale-returned': hasReturns(sale),
              }"
            >
              <td>
                <div class="date-cell">
                  <span class="date-text">
                    {{
                      sale?.createdAt
                        ? salesListStore.formatDate(sale.createdAt)
                        : "Fecha no disponible"
                    }}
                  </span>
                  <span
                    v-if="hasReturns(sale)"
                    class="return-indicator"
                    title="Esta venta tiene devoluciones"
                  >
                    <span class="material-symbols-outlined">undo</span>
                  </span>
                </div>
              </td>
              <td class="text-right">
                {{
                  sale?.total ? salesListStore.formatPrice(sale.total) : "$0.00"
                }}
              </td>
              <td>{{ sale?.cashier || "Sin cajero" }}</td>
              <td>
                <span v-if="sale?.clientId?.name">
                  {{ sale.clientId.name }}
                </span>
                <span v-else-if="sale?.clientName">
                  {{ sale.clientName }}
                </span>
                <span v-else>Cliente general</span>
              </td>

              <!-- Celda de métodos de pago modificada -->
              <td class="payment-methods-cell">
                <!-- Método de pago único -->
                <div
                  v-if="sale.paymentMethods.length === 0"
                  class="single-payment"
                >
                  <span class="payment-badge single">
                    {{ sale.paymentMethod }}
                  </span>
                </div>

                <!-- Múltiples métodos de pago -->
                <div v-else class="multiple-payments">
                  <div class="payment-header"></div>
                  <div class="payment-details">
                    <div
                      v-for="(payment, index) in sale.paymentMethods"
                      :key="index"
                      class="payment-item"
                    >
                      <span class="payment-badge multiple">
                        {{ payment.method }}
                      </span>
                      <span class="payment-amount">
                        {{ salesListStore.formatPrice(payment.amount) }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <td>
                <span
                  :class="[
                    'payment-status-badge',
                    sale?.paymentStatus === 'paid' ? 'payment-status-paid' : 'payment-status-pending'
                  ]"
                >
                  {{ sale?.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente' }}
                </span>
              </td>

              <td class="products-summary">
                <div class="products-count">
                  {{
                    sale?.productDetails
                      ? getTotalProductsCount(sale.productDetails)
                      : 0
                  }}
                  productos
                </div>
                <div
                  v-if="
                    sale?.productDetails && hasVariants(sale.productDetails)
                  "
                  class="variants-indicator"
                >
                  <span class="material-symbols-outlined">palette</span> Con
                  variantes
                </div>
              </td>
              <td class="actions-cell">
                <select
                  class="form-control"
                  @change="handleActionChange(sale, $event)"
                >
                  <option value="">Acciones</option>
                  <option value="detalles">Ver venta</option>
                  <option
                    value="devolucion"
                    :disabled="sale?.status === 'Cancelado'"
                  >
                    Devolución/Cambio
                  </option>
                  <option value="historial-devoluciones">
                    Ver historial de devoluciones
                  </option>
                  <option
                    value="anular"
                    :disabled="sale?.status === 'Cancelado'"
                  >
                    {{ sale?.status === "Cancelado" ? "Ya anulada" : "Anular" }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Vista cards para móvil -->
        <div v-if="sales?.length > 0" class="mobile-cards-container">
          <div
            v-for="(sale, id) in sales"
            :key="`mobile-${sale?._id || id}`"
            class="sale-card"
            :class="{
              'sale-canceled': sale?.status === 'Cancelado',
              'sale-returned': hasReturns(sale),
            }"
          >
            <!-- Header del card con fecha y total -->
            <div class="card-header">
              <div class="card-date">
                <span class="material-symbols-outlined">calendar_today</span>
                {{
                  sale?.createdAt
                    ? salesListStore.formatDate(sale.createdAt)
                    : "Fecha no disponible"
                }}
                <span
                  v-if="hasReturns(sale)"
                  class="return-indicator mobile-return-indicator"
                  title="Esta venta tiene devoluciones"
                >
                  <span class="material-symbols-outlined">undo</span>
                </span>
              </div>
              <div class="card-total">
                {{
                  sale?.total ? salesListStore.formatPrice(sale.total) : "$0.00"
                }}
              </div>
            </div>

            <!-- Información principal del card -->
            <div class="card-content">
              <div class="card-field">
                <span class="field-label">
                  <span class="material-symbols-outlined">person</span> Cajero:
                </span>
                <span class="field-value">{{
                  sale?.cashier || "Sin cajero"
                }}</span>
              </div>

              <div class="card-field">
                <span class="field-label">
                  <span class="material-symbols-outlined">assignment_ind</span>
                  Cliente:
                </span>
                <span class="field-value">
                  <span v-if="sale?.clientId?.name">
                    {{ sale.clientId.name }}
                  </span>
                  <span v-else-if="sale?.clientName">
                    {{ sale.clientName }}
                  </span>
                  <span v-else>Cliente general</span>
                </span>
              </div>

              <div class="card-field">
                <span class="field-label">
                  <span class="material-symbols-outlined">credit_card</span>
                  Método de pago:
                </span>
                <div class="field-value">
                  <!-- Método de pago único -->
                  <div
                    v-if="sale.paymentMethods.length === 0"
                    class="single-payment"
                  >
                    <span class="payment-badge single">
                      {{ sale.paymentMethod }}
                    </span>
                  </div>
                  <!-- Múltiples métodos de pago -->
                  <div v-else class="multiple-payments">
                    <div class="payment-details">
                      <div
                        v-for="(payment, index) in sale.paymentMethods"
                        :key="index"
                        class="payment-item"
                      >
                        <span class="payment-badge multiple">
                          {{ payment.method }}
                        </span>
                        <span class="payment-amount">
                          {{ salesListStore.formatPrice(payment.amount) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-field">
                <span class="field-label">
                  <span class="material-symbols-outlined">inventory_2</span>
                  Productos:
                </span>
                <div class="field-value">
                  <div class="products-count">
                    {{
                      sale?.productDetails
                        ? getTotalProductsCount(sale.productDetails)
                        : 0
                    }}
                    productos
                  </div>
                  <div
                    v-if="
                      sale?.productDetails && hasVariants(sale.productDetails)
                    "
                    class="variants-indicator"
                  >
                    <span class="material-symbols-outlined">palette</span> Con
                    variantes
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer del card con acciones -->
            <div class="card-footer">
              <select
                class="form-control card-actions-select"
                @change="handleActionChange(sale, $event)"
              >
                <option value="">Acciones</option>
                <option value="detalles">Ver venta</option>
                <option
                  value="devolucion"
                  :disabled="sale?.status === 'Cancelado'"
                >
                  Devolución/Cambio
                </option>
                <option value="historial-devoluciones">
                  Ver historial de devoluciones
                </option>
                <option value="anular" :disabled="sale?.status === 'Cancelado'">
                  {{ sale?.status === "Cancelado" ? "Ya anulada" : "Anular" }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <span class="material-symbols-outlined">receipt_long</span>
          <p>No hay ventas registradas</p>
        </div>
      </div>
    </div>

    <!-- Controles de Paginación -->
    <div class="pagination-controls" v-if="salesListStore?.totalPages > 1">
      <button
        @click="prevPage"
        :disabled="salesListStore?.page === 1"
        class="btn-pagination"
      >
        Anterior
      </button>
      <span>
        Página {{ salesListStore?.page || 1 }} de
        {{ salesListStore?.totalPages || 1 }}
      </span>
      <button
        @click="nextPage"
        :disabled="salesListStore?.page === salesListStore?.totalPages"
        class="btn-pagination"
      >
        Siguiente
      </button>
    </div>

    <!-- Modal de detalles de venta -->
    <div
      v-if="salesListStore?.selectedSale"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalles de la Venta</h2>
          <button @click="closeModal" class="btn-close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div
            v-if="salesListStore.selectedSale?.status === 'Cancelado'"
            class="canceled-banner"
          >
            <span class="material-symbols-outlined">block</span> VENTA ANULADA
          </div>
          <div class="sale-details">
            <div class="detail-section">
              <h3>Información General</h3>
              <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.createdAt
                      ? salesListStore.formatDate(
                          salesListStore.selectedSale.createdAt,
                        )
                      : "Fecha no disponible"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Cliente:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.clientName ||
                    salesListStore.selectedSale?.clientId?.name ||
                    "Cliente general"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Cajero:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.cashier || "No especificado"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Lista de precios:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.listName || "Precio general"
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
                    salesListStore.selectedSale?.subtotal
                      ? salesListStore.formatPrice(
                          salesListStore.selectedSale.subtotal,
                        )
                      : "$0.00"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">IVA 21%:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.iva
                      ? salesListStore.formatPrice(
                          salesListStore.selectedSale.iva,
                        )
                      : "$0.00"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Descuento:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.discount
                      ? salesListStore.formatPrice(
                          salesListStore.selectedSale.discount,
                        )
                      : "$0.00"
                  }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recargo:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.surcharge
                      ? salesListStore.formatPrice(
                          salesListStore.selectedSale.surcharge,
                        )
                      : "$0.00"
                  }}
                </span>
              </div>
              <div class="detail-row total-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.total
                      ? salesListStore.formatPrice(
                          salesListStore.selectedSale.total,
                        )
                      : "$0.00"
                  }}
                </span>
              </div>
            </div>

            <div class="detail-section">
              <h3>Estado de Pago</h3>
              <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span
                  :class="[
                    'payment-status-badge',
                    salesListStore.selectedSale?.paymentStatus === 'paid'
                      ? 'payment-status-paid'
                      : 'payment-status-pending'
                  ]"
                >
                  {{ salesListStore.selectedSale?.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente' }}
                </span>
              </div>
            </div>

            <div class="detail-section">
              <h3>Método de Pago</h3>
              <div
                v-if="
                  !salesListStore.selectedSale?.paymentMethods ||
                  salesListStore.selectedSale.paymentMethods.length === 0
                "
                class="detail-row"
              >
                <span class="detail-label">Método:</span>
                <span class="detail-value">
                  {{
                    salesListStore.selectedSale?.paymentMethod ||
                    "Sin especificar"
                  }}
                </span>
              </div>
              <div v-else class="payment-methods">
                <div
                  v-for="(method, index) in salesListStore.selectedSale
                    .paymentMethods"
                  :key="method?.method || index"
                  class="detail-row"
                >
                  <span class="detail-label"
                    >{{ method?.method || "Método sin especificar" }}:</span
                  >
                  <span class="detail-value">
                    {{
                      method?.amount
                        ? salesListStore.formatPrice(method.amount)
                        : "$0.00"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section products-section">
              <h3>Productos Comprados</h3>
              <div
                v-if="salesListStore.selectedSale?.productDetails?.length > 0"
                class="products-list"
              >
                <div
                  v-for="(item, index) in salesListStore.selectedSale
                    .productDetails"
                  :key="item?._id || index"
                  class="product-item"
                >
                  <div class="product-header">
                    <div class="product-name" style="display:flex;align-items:center;gap:6px;">
                      {{ item?.productName || item?.productId?.name || "Producto sin nombre" }}
                      <span
                        v-if="item?.isCustom"
                        style="display:inline-flex;align-items:center;gap:3px;background:#fef3c7;color:#d97706;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;border:1px solid #fde68a;white-space:nowrap;"
                        title="Producto sin código de barras registrado en catálogo"
                      >
                        <span class="material-symbols-outlined" style="font-size:12px;">bolt</span>
                        Venta Rápida
                      </span>
                    </div>
                    <div class="product-quantity-badge">
                      {{ item?.quantity || 0 }} unidades
                    </div>
                  </div>

                  <!-- Mostrar variantes si existen -->
                  <div
                    v-if="item?.variants?.length > 0"
                    class="product-variants"
                  >
                    <h4 class="variants-title">
                      <span class="material-symbols-outlined">palette</span>
                      Variantes:
                    </h4>
                    <div class="variants-list">
                      <div
                        v-for="(variant, variantIndex) in item.variants"
                        :key="variantIndex"
                        class="variant-item"
                      >
                        <div class="variant-details">
                          <span v-if="variant?.size" class="variant-attribute">
                            <span class="material-symbols-outlined"
                              >straighten</span
                            >
                            Talle:
                            {{ variant.size }}
                          </span>
                          <span v-if="variant?.color" class="variant-attribute">
                            <span class="material-symbols-outlined"
                              >palette</span
                            >
                            Color:
                            {{ variant.color }}
                          </span>
                          <span class="variant-quantity">
                            <span class="material-symbols-outlined"
                              >category</span
                            >
                            Cantidad:
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
                          (item?.salePrice ?? item?.productId?.sellPrice) != null
                            ? salesListStore.formatPrice(
                                item.salePrice ?? item.productId.sellPrice,
                              )
                            : "$0.00"
                        }}
                      </span>
                    </div>
                    <div class="product-detail">
                      <span class="detail-label">Precio total:</span>
                      <span class="detail-value">
                        {{
                          (item?.salePrice ?? item?.productId?.sellPrice) != null && item?.quantity
                            ? salesListStore.formatPrice(
                                (item.salePrice ?? item.productId.sellPrice) * item.quantity,
                              )
                            : "$0.00"
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-products">
                <p>No hay productos registrados en esta venta</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="emitirTicket" class="btn-primary">
            <span class="material-symbols-outlined">print</span> Imprimir Ticket
          </button>
          <button @click="closeModal" class="btn-secondary">
            <span class="material-symbols-outlined">close</span> Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de devoluciones -->
  <returnsComponent
    :visible="showReturnsModal"
    :sale="selectedSaleForReturn"
    @close="closeReturnsModal"
    @processed="onReturnProcessed"
  />

  <!-- Modal de historial de devoluciones -->
  <returnsHistoryComponent
    :visible="showReturnsHistoryModal"
    :saleId="selectedSaleIdForHistory"
    @close="closeReturnsHistoryModal"
  />

  <spinnerComponent v-if="salesListStore?.loading" />
</template>
<script>
import { mapState, mapActions } from "pinia";
import { useSalesListStore } from "@/stores/salesListStore";
import { useGlobalStore } from "@/stores/globalStore";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import returnsComponent from "@/components/visuals/sales/returnsComponent.vue";
import returnsHistoryComponent from "@/components/visuals/sales/returnsHistoryComponent.vue";
import jsPDF from "jspdf";

export default {
  components: { spinnerComponent, returnsComponent, returnsHistoryComponent },
  data() {
    return {
      globalStore: useGlobalStore(),
      cashierSearchQuery: "",
      clientSearchQuery: "",
      showFilters: true,
      cashierSearchTimeout: null,
      clientSearchTimeout: null,
      showReturnsModal: false,
      selectedSaleForReturn: null,
      showReturnsHistoryModal: false,
      selectedSaleIdForHistory: null,
    };
  },
  computed: {
    ...mapState(useSalesListStore, [
      "sales",
      "loading",
      "page",
      "limit",
      "totalSales",
      "totalPages",
      "cashierSearchResults",
      "clientSearchResults",
      "selectedCashier",
      "selectedClient",
    ]),
    salesListStore() {
      return useSalesListStore();
    },
  },
  methods: {
    ...mapActions(useSalesListStore, [
      "fetchSales",
      "fetchSaleDetails",
      "cancelSale",
      "fetchUserProhibitedRoutes",
      "clearSelectedSale",
      "searchCashiers",
      "selectCashier",
      "clearSelectedCashier",
      "searchClients",
      "selectClient",
      "clearSelectedClient",
    ]),

    // Nuevos métodos para manejar variantes
    getTotalProductsCount(productDetails) {
      return productDetails.reduce((total, item) => total + item.quantity, 0);
    },

    hasVariants(productDetails) {
      return productDetails.some(
        (item) => item.variants && item.variants.length > 0,
      );
    },

    formatVariants(variants) {
      if (!variants || variants.length === 0) return "";

      return variants
        .map((variant) => {
          let variantText = "";
          if (variant.size) variantText += `Talle: ${variant.size}`;
          if (variant.color) {
            if (variantText) variantText += " - ";
            variantText += `Color: ${variant.color}`;
          }
          if (variant.quantity > 1) {
            variantText += ` (${variant.quantity})`;
          }
          return variantText;
        })
        .join(", ");
    },

    // Método para verificar si una venta tiene devoluciones
    hasReturns(sale) {
      // Verificar si la venta tiene el campo returns y contiene elementos
      return (
        sale?.returns && Array.isArray(sale.returns) && sale.returns.length > 0
      );
    },

    async selectSale(saleId) {
      await this.fetchSaleDetails(saleId);
    },

    async handleActionChange(sale, event) {
      const action = event.target.value;
      const saleId = sale._id;

      switch (action) {
        case "detalles":
          this.selectSale(saleId);
          break;
        case "devolucion":
          this.handleReturnSale(sale);
          break;
        case "historial-devoluciones":
          this.handleViewReturnsHistory(saleId);
          break;
        case "anular":
          this.handleCancelSale(saleId);
          break;
      }

      event.target.value = "";
    },

    async handleCancelSale(id) {
      if (window.confirm("¿Estás seguro que deseas anular la venta?")) {
        const success = await this.cancelSale(id);
        if (success) {
          const shopId = localStorage.getItem("shopId");
          if (shopId) {
            await this.fetchSales(shopId);
          }
          alert("Venta cancelada");
          this.clearSelectedSale();
        }
      }
    },

    async handleReturnSale(sale) {
      // Verificar que la venta no esté cancelada
      if (sale.status === "Cancelado") {
        alert("No se puede procesar devolución de una venta cancelada");
        return;
      }

      // Verificar que la venta tenga productos
      if (!sale.productDetails || sale.productDetails.length === 0) {
        alert("Esta venta no tiene productos para devolver");
        return;
      }

      try {
        // Obtener los detalles completos de la venta con productos populados
        await this.fetchSaleDetails(sale._id);

        // Usar la venta con detalles completos del store
        this.selectedSaleForReturn = this.salesListStore.selectedSale;
        this.showReturnsModal = true;
      } catch (error) {
        console.error("Error al obtener detalles de la venta:", error);
        alert("Error al cargar los detalles de la venta");
      }
    },

    closeReturnsModal() {
      this.showReturnsModal = false;
      this.selectedSaleForReturn = null;
    },

    // Método que se ejecuta cuando se procesa exitosamente una devolución
    async onReturnProcessed() {
      // Refrescar la lista de ventas para mostrar el estado actualizado
      await this.fetchSales();
      this.closeReturnsModal();
    },

    handleViewReturnsHistory(saleId) {
      this.selectedSaleIdForHistory = saleId;
      this.showReturnsHistoryModal = true;
    },

    closeReturnsHistoryModal() {
      this.showReturnsHistoryModal = false;
      this.selectedSaleIdForHistory = null;
    },

    async onReturnProcessed(result) {
      // Actualizar la lista de ventas después de procesar la devolución
      const shopId = localStorage.getItem("shopId");
      if (shopId) {
        await this.fetchSales(shopId);
      }

      // Mostrar mensaje de éxito
      if (result.success) {
        this.globalStore.showToast(result.message, "success");
      }

      this.closeReturnsModal();
    },

    closeModal() {
      this.clearSelectedSale();
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
                "Vue Router no está disponible. No se pudo redirigir.",
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
      if (page >= 1 && page <= this.salesListStore.totalPages) {
        this.salesListStore.page = page;
        await this.salesListStore.loadData();
      }
    },

    prevPage() {
      this.goToPage(this.salesListStore.page - 1);
    },

    nextPage() {
      this.goToPage(this.salesListStore.page + 1);
    },
    //Emitir ticket para impresoras termicas
    async emitirTicket() {
      if (!this.salesListStore?.selectedSale) {
        console.warn("No hay venta seleccionada para generar ticket");
        alert("No se puede generar el ticket: no hay venta seleccionada.");
        return false;
      }
      try {
        await this.salesListStore.emitirTicketVenta();
        return true;
      } catch (error) {
        console.error("Error al generar el ticket:", error);
        alert("Error al generar el ticket. Por favor, intente nuevamente.");
        return false;
      }
    },

    applyFilters() {
      console.log("Aplicando filtros:", this.salesListStore.filters);
      this.salesListStore.filtersApplied = true;
      this.salesListStore.page = 1;
      this.salesListStore.loadData();
    },

    clearFilters() {
      this.cashierSearchQuery = "";
      this.clientSearchQuery = "";
      this.salesListStore.filters.startDate = null;
      this.salesListStore.filters.endDate = null;
      this.salesListStore.filters.paymentMethod = "";
      this.salesListStore.filters.status = "";
      this.salesListStore.filters.minAmount = null;
      this.salesListStore.filters.maxAmount = null;
      this.salesListStore.filters.productId = "";
      this.salesListStore.filters.hasDiscount = "";
      this.salesListStore.filters.saleId = "";
      this.salesListStore.filters.cashier = null;
      this.salesListStore.filters.clientId = null;
      this.salesListStore.clearSelectedCashier();
      this.salesListStore.clearSelectedClient();
      this.salesListStore.filtersApplied = false;
      this.salesListStore.page = 1;
      this.salesListStore.loadData();
    },

    toggleFilters() {
      this.showFilters = !this.showFilters;
    },

    debouncedCashierSearch() {
      clearTimeout(this.cashierSearchTimeout);
      this.cashierSearchTimeout = setTimeout(() => {
        if (this.cashierSearchQuery.length > 2) {
          const shopId = this.globalStore.shopId();
          this.salesListStore.searchCashiers(shopId, this.cashierSearchQuery);
        } else if (this.cashierSearchQuery.length === 0) {
          this.salesListStore.cashierSearchResults = [];
          this.salesListStore.clearSelectedCashier();
          this.salesListStore.filters.cashier = null;
        }
      }, 300);
    },

    debouncedClientSearch() {
      clearTimeout(this.clientSearchTimeout);
      this.clientSearchTimeout = setTimeout(() => {
        if (this.clientSearchQuery.length > 2) {
          const shopId = this.globalStore.shopId();
          this.salesListStore.searchClients(shopId, this.clientSearchQuery);
        } else if (this.clientSearchQuery.length === 0) {
          this.salesListStore.clientSearchResults = [];
          this.salesListStore.clearSelectedClient();
          this.salesListStore.filters.clientId = null;
        }
      }, 300);
    },

    selectCashier(cashier) {
      this.cashierSearchQuery = cashier.username;
      this.salesListStore.selectCashier(cashier);
      this.salesListStore.filters.cashier = cashier.username;
    },

    clearSelectedCashier() {
      this.cashierSearchQuery = "";
      this.salesListStore.clearSelectedCashier();
      this.salesListStore.filters.cashier = null;
    },

    selectClient(client) {
      console.log("Seleccionando cliente:", client);
      this.clientSearchQuery = client.name;
      this.salesListStore.selectClient(client);
      this.salesListStore.filters.clientId = client._id;
    },

    clearSelectedClient() {
      this.clientSearchQuery = "";
      this.salesListStore.clearSelectedClient();
      this.salesListStore.filters.clientId = null;
    },
  },

  async mounted() {
    await this.globalStore.fetchShopData();
    await this.salesListStore.loadData();
    this.checkUserRoutesAllowed();
  },

  beforeUnmount() {
    clearTimeout(this.cashierSearchTimeout);
    clearTimeout(this.clientSearchTimeout);
  },
};
</script>

<style scoped>
.single-payment {
  display: flex;
  justify-content: flex-start;
}

.multiple-payments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.payment-header i {
  color: #f59e0b;
  font-size: 0.875rem;
}

.multiple-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.payment-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
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

.payment-amount {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background-color: #d1fae5;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid #a7f3d0;
}

.payment-status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.payment-status-paid {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.payment-status-pending {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.cancelled-sale {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fee2e2;
}

.actions-cell {
  text-align: center;
  width: 60px;
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

/* Estilos para el modal de detalles con variantes */
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.product-quantity-badge {
  background-color: #f9931e;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-variants {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
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
  background-color: white;
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
  color: #38a169;
}

/* Estilos generales */
.sales-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #f9931e;
}

/* Contenedor de datos */
.data-table-container {
  background-color: white;
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
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
}

.table-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Botones */
.btn-icon {
  background-color: transparent;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-view {
  color: #f9931e;
}

.btn-delete {
  color: #ef4444;
}

.btn-icon:hover {
  background-color: #f3f4f6;
}

.btn-primary {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.3);
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(249, 147, 30, 0.4);
}

.btn-secondary {
  background: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
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
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 1.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  width: 100%;
  max-width: 800px;
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

/* Detalles de venta */
.canceled-banner {
  background-color: #ef4444;
  color: white;
  text-align: center;
  padding: 0.75rem;
  border-radius: 1rem;
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
  border-radius: 1.5rem;
  overflow: hidden;
}

.detail-section h3 {
  background-color: #f9fafb;
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #4b5563;
}

.detail-value {
  color: #1f2937;
}

.total-row {
  font-weight: 600;
  background-color: #f9fafb;
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
  border-radius: 1rem;
  overflow: hidden;
}

.product-name {
  background-color: #f9fafb;
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

/* Métodos de pago */
.payment-methods {
  padding: 0;
}

/* Estilos de Paginación */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.btn-pagination {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(249, 147, 30, 0.3);
}

.btn-pagination:hover:not(:disabled) {
  background-color: #e8821a;
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
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-toggle-filters:hover {
  background-color: #e8821a;
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: white;
  border-radius: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
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
  border-radius: 1rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
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

/* Estilos de la tabla de ventas */
.table-responsive {
  overflow-x: auto;
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: white;
  border-radius: 1.5rem;
  overflow: hidden;
}

.sales-table th,
.sales-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.sales-table th {
  background-color: #f9fafb;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
}

.sales-table tbody tr:last-child td {
  border-bottom: none;
}

.sales-table tbody tr:hover {
  background-color: #f3f4f6;
}

.sales-table .sale-canceled {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
}

.sales-table .sale-actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}

.text-right {
  text-align: right;
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

/* Vista desktop y móvil - Control de visibilidad */
.desktop-table {
  display: table;
}

.mobile-cards-container {
  display: none;
}

/* Estilos para las cards móviles */
.sale-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.5rem;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.sale-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.sale-card.sale-canceled {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.card-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
}

.card-date i {
  color: #f9931e;
}

.card-total {
  font-size: 1.125rem;
  font-weight: 700;
  color: #059669;
  background-color: #d1fae5;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  border: 1px solid #a7f3d0;
}

.card-content {
  padding: 1.25rem;
}

.card-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.card-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.field-label i {
  color: #f9931e;
  font-size: 0.875rem;
}

.field-value {
  font-size: 0.9rem;
  color: #1f2937;
  padding-left: 1.375rem;
}

.card-footer {
  padding: 1rem 1.25rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.card-actions-select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  background: white;
  font-size: 0.875rem;
  color: #1f2937;
  cursor: pointer;
}

.card-actions-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  /* Ocultar tabla en móvil y mostrar cards */
  .desktop-table {
    display: none;
  }

  .mobile-cards-container {
    display: block;
    margin-top: 1rem;
  }

  /* Ajustes para los filtros en móvil */
  .filters-container {
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

  /* Ajustes para modal en móvil */
  .modal-content {
    width: 95%;
    max-width: none;
    margin: 1rem;
  }

  .modal-body {
    max-height: 70vh;
  }

  /* Ajustes para variantes en móvil */
  .variant-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  /* Ajustes para el card en móvil */
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .card-total {
    align-self: flex-end;
    font-size: 1rem;
  }

  .card-field {
    margin-bottom: 0.75rem;
  }

  .field-label {
    font-size: 0.8125rem;
  }

  .field-value {
    font-size: 0.875rem;
    padding-left: 1.25rem;
  }

  /* Ajustes para payments badges en móvil */
  .payment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .payment-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .payment-amount {
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
  }

  .products-count {
    font-size: 0.875rem;
  }

  .variants-indicator {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  /* Paginación en móvil */
  .pagination-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-pagination {
    width: 100%;
    padding: 0.75rem;
  }

  /* Estilos legacy mantenidos para compatibilidad */
  .sale-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .sale-actions {
    margin-top: 1rem;
    align-self: flex-end;
  }

  .data-table-container {
    display: grid;
    grid-template-columns: 1fr;
  }
}

/* Estilos para ventas devueltas */
.sale-returned {
  background-color: #fff3cd !important;
  border-left: 4px solid #ffc107 !important;
}

.sale-returned:hover {
  background-color: #ffeaa7 !important;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-text {
  flex: 1;
}

.return-indicator {
  color: #f59e0b;
  font-size: 0.875rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Estilos para vista móvil */
.mobile-return-indicator {
  margin-left: 0.5rem;
}

.sale-card.sale-returned {
  border-left: 4px solid #ffc107 !important;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%) !important;
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

/* Animations */ .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to {
opacity: 1; transform: translateY(0); } }
