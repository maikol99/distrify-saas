<template>
  <div class="box-container">
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

      <div v-if="showingFilters" class="filters-container">
        <div class="filter-group">
          <label for="filter-name">Filtrar por nombre:</label>
          <input
            type="text"
            v-model="cajaStore.filters.title"
            id="filter-name"
            placeholder="Buscar caja..."
            class="filter-input"
          />
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
          <input
            type="text"
            v-model="cajaStore.filters.createdBy"
            id="filter-createdBy"
            placeholder="Buscar por usuario..."
            class="filter-input"
          />
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
            <i
              v-if="!cajaStore.filters.startDate"
              class="fas fa-calendar-alt date-icon"
            ></i>
          </div>
          <button
            @click="cajaStore.filters.startDate = null"
            v-if="cajaStore.filters.startDate"
            class="clear-filter-btn"
          >
            <i class="fas fa-times"></i>
          </button>
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
            <i
              v-if="!cajaStore.filters.endDate"
              class="fas fa-calendar-alt date-icon"
            ></i>
          </div>
          <button
            @click="cajaStore.filters.endDate = null"
            v-if="cajaStore.filters.endDate"
            class="clear-filter-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="filter-actions">
          <button @click="cajaStore.filterCajas" class="btn-primary">
            <i class="fas fa-filter"></i> Aplicar Filtros
          </button>
          <button
            v-if="cajaStore.filtersApplied === true"
            @click="cajaStore.clearFilters"
            class="btn-secondary"
          >
            <i class="fas fa-times"></i> Limpiar Filtros
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
          <span class="box-date">{{ formatDate(caja.createdAt) }}</span>

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
import moment from "moment";
import numeral from "numeral";
export default {
  name: "BoxManagement",
  components: {
    spinnerComponent,
    openCaja,
  },
  data() {
    return {
      cajaStore: useCajaStore(),
      showingFilters: true,
      showingOpenCaja: false,
    };
  },
  methods: {
    viewCajaDetails(caja) {
      this.$router.push("/caja/detalles/" + caja._id);
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    formatCurrency(value) {
      return numeral(value).format("$0.00");
    },
  },
  async mounted() {
    await this.cajaStore.fetchCajas();
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
}

.filter-toggle-container {
  text-align: right;
}

.btn-toggle-filters {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
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
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #e8821a;
}

.btn-pagination:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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
  border-radius: 0.375rem;
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
</style>