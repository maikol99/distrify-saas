<template>
  <div class="box-container">
    <!-- Header Superior de Caja -->
    <div class="caja-top-header">
      <div class="header-titles">
        <h1 class="main-page-title">Caja</h1>
        <p class="main-page-subtitle">Control y seguimiento de tus cajas</p>
      </div>
      <div class="header-date-chip">
        <span class="material-symbols-outlined date-chip-icon">calendar_today</span>
        <span>{{ todayFormatted }}</span>
      </div>
    </div>

    <!-- 3 Tarjetas KPI Superiores (como en la imagen de referencia) -->
    <div class="caja-kpi-grid">
      <!-- Tarjeta 1: Caja activa -->
      <div
        class="caja-kpi-card kpi-orange"
        :class="{ 'cursor-pointer hover:shadow-md': activeCaja }"
        @click="activeCaja ? viewCajaDetails(activeCaja) : null"
      >
        <div class="kpi-left">
          <div class="kpi-icon-circle bg-orange-circle">
            <span class="material-symbols-outlined">point_of_sale</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-title">Caja activa</span>
            <h2 class="kpi-main-val">{{ activeCaja ? (activeCaja.title || 'N.° ' + activeCajaNumber) : 'Sin caja activa' }}</h2>
            <div class="kpi-status-row">
              <span class="status-dot" :class="activeCaja ? 'dot-open' : 'dot-closed'"></span>
              <span class="status-text">{{ activeCaja ? 'Abierta' : 'Cerrada' }}</span>
            </div>
          </div>
        </div>
        <span v-if="activeCaja" class="material-symbols-outlined kpi-arrow arrow-orange">chevron_right</span>
      </div>

      <!-- Tarjeta 2: Ventas del día -->
      <div class="caja-kpi-card kpi-green">
        <div class="kpi-left">
          <div class="kpi-icon-circle bg-green-circle">
            <span class="material-symbols-outlined">trending_up</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-title">Ventas del día</span>
            <h2 class="kpi-main-val">{{ formatCurrency(todaySales) }}</h2>
            <span class="kpi-caption">Total vendido hoy</span>
          </div>
        </div>
        <span class="material-symbols-outlined kpi-arrow arrow-green">chevron_right</span>
      </div>

      <!-- Tarjeta 3: Saldo actual de caja -->
      <div class="caja-kpi-card kpi-blue">
        <div class="kpi-left">
          <div class="kpi-icon-circle bg-blue-circle">
            <span class="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-title">Saldo actual de caja</span>
            <h2 class="kpi-main-val">{{ formatCurrency(currentCajaBalance) }}</h2>
            <span class="kpi-caption">Dinero disponible en las cajas de hoy</span>
          </div>
        </div>
        <span class="material-symbols-outlined kpi-arrow arrow-blue">chevron_right</span>
      </div>
    </div>

    <!-- Barra de filtros -->
    <div class="actions-bar">
      <!-- <div class="filter-toggle-container">
        <button
          @click="showingFilters = !showingFilters"
          class="btn-toggle-filters"
        >
          <i class="fas fa-chevron-up"></i>
          {{ showingFilters ? "Ocultar Filtros" : "Mostrar Filtros" }}
        </button>
      </div> -->

      <div v-if="showingFilters" class="filters-container modern-filters-bar">
        <div class="filter-group">
          <label for="filter-name">Filtrar por nombre:</label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon-left">search</span>
            <input
              type="text"
              v-model="cajaStore.filters.title"
              id="filter-name"
              placeholder="Buscar caja..."
              class="filter-input with-left-icon"
            />
          </div>
        </div>

        <div class="filter-group">
          <label for="filter-status">Filtrar por estado:</label>
          <select
            v-model="cajaStore.filters.estado"
            id="filter-status"
            class="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="abierta">Abierta</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-createdBy">Usuario apertura:</label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon-left">search</span>
            <input
              type="text"
              v-model="cajaStore.filters.createdBy"
              id="filter-createdBy"
              placeholder="Buscar por usuario..."
              class="filter-input with-left-icon"
            />
          </div>
        </div>

        <div class="filter-group">
          <label>Rango de monto:</label>
          <div class="amount-range">
            <input
              type="number"
              v-model="cajaStore.filters.minAmount"
              placeholder="Desde $"
              class="filter-input amount-input"
            />
            <input
              type="number"
              v-model="cajaStore.filters.maxAmount"
              placeholder="Hasta $"
              class="filter-input amount-input"
            />
          </div>
        </div>

        <div class="filter-group">
          <label for="filter-isAutomatic">Tipo:</label>
          <select
            v-model="cajaStore.filters.isAutomatic"
            id="filter-isAutomatic"
            class="filter-select"
          >
            <option value="">Todas</option>
            <option value="manual">Manual</option>
            <option value="automatica">Automática</option>
          </select>
        </div>

        <div class="filter-group date-filter">
          <label for="startDate">Desde:</label>
          <div class="input-with-icon">
            <input
              v-model="cajaStore.filters.startDate"
              type="date"
              id="startDate"
              class="filter-input"
            />
          </div>
        </div>

        <div class="filter-group date-filter">
          <label for="endDate">Hasta:</label>
          <div class="input-with-icon">
            <input
              v-model="cajaStore.filters.endDate"
              type="date"
              id="endDate"
              class="filter-input"
            />
          </div>
        </div>

        <div class="filter-button-wrapper">
          <button @click="cajaStore.filterCajas" class="btn-primary btn-filter-apply">
            <span class="material-symbols-outlined text-sm">filter_alt</span>
            <span>Aplicar Filtros</span>
          </button>
          <button
            v-if="cajaStore.filtersApplied === true"
            @click="cajaStore.clearFilters"
            class="btn-secondary btn-filter-clear"
            title="Limpiar filtros"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contador de resultados -->
    <div class="results-counter">
      Cajas encontradas: {{ cajaStore.pagination.total }}
    </div>
    <div class="main-action-buttons">
      <button @click="showingOpenCaja = true" class="btn-primary">
        <i class="fas fa-plus"></i> Nueva Caja
      </button>
    </div>
    <!-- Grid de cajas -->
    <div class="boxes-grid">
      <div v-for="caja in cajaStore.cajas" :key="caja._id" class="box-card">
        <div class="box-header">
          <h3 class="box-name">{{ caja.title }}</h3>
          <span class="box-date">{{ formatDate(caja.fechaApertura || caja.createdAt) }}</span>

          <!-- Boton para eliminar -->
          <button @click="cajaStore.deleteCaja(caja._id)" class="btn-delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>

        <!-- Solo mostrar detalles si la caja está cerrada -->
        <div v-if="caja.estado === 'cerrada'" class="box-details">
          <div class="detail-row">
            <span class="detail-label">Caja Inicial:</span>
            <span class="detail-value initial-amount">{{
              formatCurrency(caja.entregasEfectivo.inicial) || "N/A"
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Ventas:</span>
            <span class="detail-value income-amount">{{
              formatCurrency(caja.totalCaja.totalVentas) || 0
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Ingresos:</span>
            <span class="detail-value income-amount">{{
              formatCurrency(caja.totalCaja.totalIngresos) || 0
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Compras:</span>
            <span class="detail-value expense-amount">{{
              formatCurrency(caja.totalCaja.totalCompras) || 0
            }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Egresos:</span>
            <span class="detail-value expense-amount">{{
              formatCurrency(caja.totalCaja.totalGastos) || 0
            }}</span>
          </div>

          <div class="detail-row balance-row">
            <span class="detail-label">Balance:</span>
            <span
              class="detail-value"
              :class="{
                'positive-balance': caja.arqueoFinal.balanceFinal > 0,
                'negative-balance': caja.arqueoFinal.balanceFinal < 0,
              }"
              >{{ formatCurrency(caja.arqueoFinal.balanceFinal) || 0 }}</span
            >
          </div>
        </div>

        <!-- Mensaje para cajas abiertas -->
        <div v-else class="box-details open-box-message">
          <div class="open-message">
            <i class="fas fa-clock"></i>
            <p>Caja en curso - Los resúmenes estarán disponibles cuando se cierre</p>
          </div>
        </div>

        <div class="box-footer">
          <span
            class="status-badge"
            :class="{
              'status-open': caja.estado === 'abierta',
              'status-closed': caja.estado === 'cerrada',
            }"
          >
            {{ caja.estado }}
          </span>
          <button @click="viewCajaDetails(caja)" class="btn-view-details">
            Ver Detalle
          </button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="cajaStore.cajas.length === 0" class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>No se encontraron cajas</p>
    </div>

    <!-- Paginación -->
    <div class="pagination-controls">
      <button
        class="btn-pagination"
        :disabled="cajaStore.pagination.page === 1"
        @click="cajaStore.previousPage"
      >
        Anterior
      </button>

      <div class="pagination-info">
        <span
          >Página {{ cajaStore.pagination.page }} de
          {{ cajaStore.pagination.totalPages }}</span
        >
      </div>

      <button
        class="btn-pagination"
        :disabled="
          cajaStore.pagination.page === cajaStore.pagination.totalPages
        "
        @click="cajaStore.nextPage"
      >
        Siguiente
      </button>

      <div class="items-per-page">
        <label for="itemsPerPage">Mostrar:</label>
        <select
          @change="cajaStore.changeLimit($event.target.value)"
          id="itemsPerPage"
          class="form-control"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  </div>
  <spinner-component v-if="cajaStore.loading" />
  <open-caja v-if="showingOpenCaja" @close="showingOpenCaja = false" />
</template>

<script>
import openCaja from "@/components/visuals/caja/openCaja.vue";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import { useCajaStore } from "@/stores/cajaStore";
import { useGlobalStore } from "@/stores/globalStore";
import moment from "moment";
import numeral from "numeral";
import api from "@/config/axios.config";

export default {
  name: "BoxManagement",
  components: {
    spinnerComponent,
    openCaja,
  },
  data() {
    return {
      cajaStore: useCajaStore(),
      globalStore: useGlobalStore(),
      showingFilters: true,
      showingOpenCaja: false,
      todaySales: 0,
      currentCajaBalance: 0,
    };
  },
  computed: {
    todayFormatted() {
      return (
        "Hoy · " +
        moment().locale("es").format("D [de] MMMM [de] YYYY")
      );
    },
    activeCaja() {
      return (
        this.cajaStore.cajas.find((c) => c.estado === "abierta") || null
      );
    },
    activeCajaNumber() {
      if (!this.activeCaja) return null;
      const idx = this.cajaStore.cajas.indexOf(this.activeCaja) + 1;
      return idx;
    },
  },
  methods: {
    viewCajaDetails(caja) {
      this.$router.push("/caja/detalles/" + caja._id);
    },
    formatDate(date) {
      if (!date) return "-";
      return moment(date).format("DD/MM/YYYY");
    },
    formatCurrency(value) {
      return numeral(value).format("$0.00");
    },
    async fetchTodaySales() {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const res = await api.get("/reports/get/business-report", {
          params: {
            shopId: shopId,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        });
        if (res.data && res.data.totals) {
          this.todaySales = res.data.totals.sales || 0;
          this.currentCajaBalance = res.data.totals.sales || 0;
        }
      } catch (e) {
        this.todaySales = 0;
        this.currentCajaBalance = 0;
      }
    },
  },
  async mounted() {
    await this.cajaStore.fetchCajas();
    await this.fetchTodaySales();
    moment.locale("es");
  },
};
</script>

<style scoped>
.btn-delete {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.btn-delete:active {
  background-color: #b91c1c;
}
.positive-balance {
  color: #10b981; /* Verde */
}
.negative-balance {
  color: #ef4444; /* Rojo */
}

/* Estilos para cajas abiertas */
.open-box-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #f8fafc;
  border-radius: 0.375rem;
  border: 2px dashed #cbd5e1;
}

.open-message {
  text-align: center;
  color: #64748b;
}

.open-message i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: #f59e0b;
}

.open-message p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Estilos generales */
.box-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

/* Barra de acciones y filtros */
.actions-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.main-action-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.filter-toggle-container {
  text-align: right;
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
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  position: relative;
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
  color: #1f2937;
  background-color: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

.amount-range {
  display: flex;
  gap: 0.5rem;
}

.amount-input {
  flex: 1;
  min-width: 0;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon input[type="date"] {
  padding-right: 2.5rem;
}

.date-icon {
  position: absolute;
  right: 0.75rem;
  color: #9ca3af;
  pointer-events: none;
}

.clear-filter-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(calc(-50% + 0.6rem));
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.clear-filter-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

/* Botones */
.btn-primary {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(249, 147, 30, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(249, 147, 30, 0.4);
}

.btn-secondary {
  background: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
}

/* Contador de resultados */
.results-counter {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding-left: 0.25rem;
}

/* Grid de cajas */
.boxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.box-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.box-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.box-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.box-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.box-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.balance-row {
  border-top: 2px solid #f3f4f6;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  font-size: 0.875rem;
}

.initial-amount {
  color: #1f2937;
}

.income-amount {
  color: #10b981;
}

.expense-amount {
  color: #ef4444;
}

.balance-amount {
  color: #3b82f6;
  font-size: 1rem;
}

.box-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-open {
  background-color: #d1fae5;
  color: #065f46;
}

.status-closed {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-suspended {
  background-color: #fef3c7;
  color: #92400e;
}

.btn-view-details {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-view-details:hover {
  background-color: #2563eb;
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

/* Paginación */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-pagination {
  background: linear-gradient(135deg, #f9931e 0%, #f76707 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-pagination:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.btn-pagination:disabled {
  background: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-left: auto;
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
  min-width: 8rem;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .filters-container {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .boxes-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 992px) {
  .main-action-buttons {
    justify-content: center;
    width: 100%;
  }

  .filters-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .filter-toggle-container {
    text-align: center;
  }

  .boxes-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
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

  .boxes-grid {
    grid-template-columns: 1fr;
  }

  .pagination-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .items-per-page {
    margin-left: 0;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .box-container {
    padding: 1rem;
  }

  .box-card {
    padding: 1rem;
  }

  .btn-pagination {
    width: 100%;
    justify-content: center;
  }
}

/* ===== TOP HEADER ===== */
.caja-top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.header-titles {
  display: flex;
  flex-direction: column;
}
.main-page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}
.main-page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}
.header-date-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #ea580c;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}
.date-chip-icon {
  font-size: 1rem;
}

/* ===== KPI CARDS GRID ===== */
.caja-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.caja-kpi-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
  position: relative;
}
.caja-kpi-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
.kpi-orange { border-left: 4px solid #f97316; }
.kpi-green  { border-left: 4px solid #10b981; }
.kpi-blue   { border-left: 4px solid #3b82f6; }
.kpi-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.kpi-icon-circle {
  width: 3rem;
  height: 3rem;
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
.kpi-title {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kpi-main-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0.15rem 0;
  line-height: 1.2;
}
.kpi-caption { font-size: 0.78rem; color: #94a3b8; }
.kpi-status-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.25rem;
}
.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-open   { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
.dot-closed { background: #94a3b8; }
.status-text { font-size: 0.82rem; color: #10b981; font-weight: 600; }
.kpi-arrow { font-size: 1.5rem; color: #cbd5e1; transition: color 0.2s; }
.arrow-orange:hover { color: #f97316; }
.arrow-green { color: #a7f3d0; }
.arrow-blue  { color: #bfdbfe; }

/* ===== MODERN FILTERS BAR ===== */
.modern-filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
}
.modern-filters-bar .filter-group {
  display: flex;
  flex-direction: column;
  min-width: 120px;
  flex: 1;
}
.modern-filters-bar .filter-group label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-weight: 500;
}
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon-left {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #9ca3af;
  pointer-events: none;
}
.with-left-icon { padding-left: 2rem !important; }
.filter-button-wrapper { display: flex; align-items: flex-end; gap: 0.5rem; }
.btn-filter-apply { display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap; }
.btn-filter-clear { padding: 0.6rem; min-width: unset; }

@media (max-width: 768px) {
  .caja-kpi-grid { grid-template-columns: 1fr; }
  .caja-top-header { flex-direction: column; align-items: flex-start; }
}

</style>