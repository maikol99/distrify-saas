<template>
  <div class="turns-container animate-fade-in">
    <!-- Header -->
    <div class="turns-header">
      <div class="turns-header-left">
        <div class="turns-header-icon">
          <span class="material-symbols-outlined">schedule</span>
        </div>
        <div>
          <h1 class="turns-title">Turnos</h1>
          <p class="turns-subtitle">Historial y totales de turnos del negocio</p>
        </div>
      </div>

      <div v-if="turnsStore.hasOpenTurn" class="turn-open-badge">
        <span class="material-symbols-outlined">radio_button_checked</span>
        Turno activo: {{ turnsStore.currentTurn?.userName }}
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Desde</label>
          <input
            type="date"
            v-model="turnsStore.filters.dateFrom"
            class="filter-input"
            :max="turnsStore.filters.dateTo || undefined"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Hasta</label>
          <input
            type="date"
            v-model="turnsStore.filters.dateTo"
            class="filter-input"
            :min="turnsStore.filters.dateFrom || undefined"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Usuario</label>
          <select v-model="turnsStore.filters.userId" class="filter-input">
            <option value="">Todos los usuarios</option>
            <option
              v-for="user in shopUsers"
              :key="user._id"
              :value="user._id"
            >
              {{ user.username }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Estado</label>
          <select v-model="turnsStore.filters.status" class="filter-input">
            <option value="">Todos</option>
            <option value="Abierto">Abierto</option>
            <option value="Cerrado">Cerrado</option>
            <option value="En curso">En curso</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Rango ventas</label>
          <div class="amount-range">
            <input
              type="number"
              v-model="turnsStore.filters.minSales"
              placeholder="Desde $"
              class="filter-input amount-input"
            />
            <input
              type="number"
              v-model="turnsStore.filters.maxSales"
              placeholder="Hasta $"
              class="filter-input amount-input"
            />
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn-filter" @click="applyFilters" :disabled="turnsStore.turnsLoading">
            <span class="material-symbols-outlined">search</span>
            Buscar
          </button>
          <button class="btn-clear" @click="clearFilters">
            <span class="material-symbols-outlined">clear</span>
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Cards resumen -->
    <div v-if="turnsStore.stats" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#eff6ff; color:#3b82f6">
          <span class="material-symbols-outlined">schedule</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">Turnos</span>
          <span class="stat-value">{{ turnsStore.stats.totalTurnos }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fff7ed; color:#f9931e">
          <span class="material-symbols-outlined">payments</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total ventas</span>
          <span class="stat-value">{{ formatPrice(turnsStore.stats.totalVentas) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#f0fdf4; color:#16a34a">
          <span class="material-symbols-outlined">attach_money</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">Efectivo</span>
          <span class="stat-value">{{ formatPrice(turnsStore.stats.totalEfectivo) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fdf4ff; color:#9333ea">
          <span class="material-symbols-outlined">swap_horiz</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">Transferencia</span>
          <span class="stat-value">{{ formatPrice(turnsStore.stats.totalTransferencia) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef2f2; color:#dc2626">
          <span class="material-symbols-outlined">credit_card</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tarjeta</span>
          <span class="stat-value">{{ formatPrice(turnsStore.stats.totalTarjeta) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fefce8; color:#ca8a04">
          <span class="material-symbols-outlined">trending_up</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">Ingresos</span>
          <span class="stat-value">{{ formatPrice(turnsStore.stats.totalIngresos) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef2f2; color:#dc2626">
          <span class="material-symbols-outlined">trending_down</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">Egresos</span>
          <span class="stat-value">{{ formatPrice(turnsStore.stats.totalEgresos) }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="turnsStore.turnsLoading" class="turns-loading">
      <div class="turns-spinner"></div>
      <span>Cargando turnos...</span>
    </div>

    <!-- Error -->
    <div v-else-if="turnsStore.error" class="turns-error">
      <span class="material-symbols-outlined">error</span>
      {{ turnsStore.error }}
    </div>

    <!-- Tabla de turnos -->
    <div v-else-if="turnsStore.turns.length > 0" class="turns-table-card">
      <div class="turns-table-header">
        <h3>Resultados ({{ turnsStore.turns.length }} turno{{ turnsStore.turns.length !== 1 ? 's' : '' }})</h3>
      </div>
      <div class="turns-table-wrapper">
        <table class="turns-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Apertura</th>
              <th>Cierre</th>
              <th>Estado</th>
              <th>Total Ventas</th>
              <th>Efectivo Sistema</th>
              <th>Efectivo Presentado</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="turn in turnsStore.turns"
              :key="turn._id"
              class="turns-table-row"
              @click="selectedTurn = turn"
            >
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ (turn.userName || "?")[0].toUpperCase() }}</div>
                  <span>{{ turn.userName || "—" }}</span>
                </div>
              </td>
              <td>{{ formatDate(turn.horaApertura) }}</td>
              <td>{{ turn.horaCierre ? formatDate(turn.horaCierre) : "—" }}</td>
              <td>
                <span class="status-badge" :class="statusClass(turn.status)">
                  {{ turn.status }}
                </span>
              </td>
              <td class="amount-cell">{{ formatPrice(turn.totalVentas) }}</td>
              <td class="amount-cell">{{ formatPrice(turn.efectivoRealSistema) }}</td>
              <td class="amount-cell">{{ formatPrice(turn.efectivoPresentado) }}</td>
              <td class="amount-cell" :class="{ 'negative': (turn.balancePresentadoReal || 0) < 0 }">
                {{ formatPrice(turn.balancePresentadoReal) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!turnsStore.turnsLoading" class="turns-empty">
      <span class="material-symbols-outlined turns-empty-icon">schedule</span>
      <h3>No hay turnos en este período</h3>
      <p>Ajustá los filtros o seleccioná un rango de fechas diferente.</p>
    </div>

    <!-- Modal de detalle de turno -->
    <div v-if="selectedTurn" class="turn-detail-backdrop" @click.self="selectedTurn = null">
      <div class="turn-detail-card">
        <div class="turn-detail-header">
          <h3>Detalle del Turno</h3>
          <button class="btn-modal-close" @click="selectedTurn = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="turn-detail-body">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">Usuario</span>
              <span class="detail-value">{{ selectedTurn.userName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Apertura</span>
              <span class="detail-value">{{ formatDate(selectedTurn.horaApertura) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cierre</span>
              <span class="detail-value">{{ selectedTurn.horaCierre ? formatDate(selectedTurn.horaCierre) : "Abierto" }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado</span>
              <span class="status-badge" :class="statusClass(selectedTurn.status)">{{ selectedTurn.status }}</span>
            </div>
            <div v-if="selectedTurn.descriptionApertura" class="detail-row">
              <span class="detail-label">Nota apertura</span>
              <span class="detail-value">{{ selectedTurn.descriptionApertura }}</span>
            </div>
            <div v-if="selectedTurn.descriptionCierre" class="detail-row">
              <span class="detail-label">Nota cierre</span>
              <span class="detail-value">{{ selectedTurn.descriptionCierre }}</span>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="detail-section-title">Ventas</h4>
            <div class="detail-row">
              <span class="detail-label">Total</span>
              <span class="detail-value highlight">{{ formatPrice(selectedTurn.totalVentas) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Efectivo</span>
              <span class="detail-value">{{ formatPrice(selectedTurn.totalEfectivo) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transferencia</span>
              <span class="detail-value">{{ formatPrice(selectedTurn.totalTransferencia) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tarjeta</span>
              <span class="detail-value">{{ formatPrice(selectedTurn.totalTarjeta) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cuenta corriente</span>
              <span class="detail-value">{{ formatPrice(selectedTurn.totalCuentaCorriente) }}</span>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="detail-section-title">Caja</h4>
            <div class="detail-row">
              <span class="detail-label">Efectivo inicial</span>
              <span class="detail-value">{{ formatPrice(selectedTurn.efectivoRecibido) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Efectivo sistema</span>
              <span class="detail-value">{{ formatPrice(selectedTurn.efectivoRealSistema) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Efectivo presentado</span>
              <span class="detail-value">{{ formatPrice(selectedTurn.efectivoPresentado) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Balance</span>
              <span class="detail-value" :class="{ 'negative': (selectedTurn.balancePresentadoReal || 0) < 0, 'positive': (selectedTurn.balancePresentadoReal || 0) >= 0 }">
                {{ formatPrice(selectedTurn.balancePresentadoReal) }}
              </span>
            </div>
          </div>
          <div class="detail-section" v-if="(selectedTurn.totalIngresos || 0) + (selectedTurn.totalEgresos || 0) > 0">
            <h4 class="detail-section-title">Movimientos</h4>
            <div class="detail-row">
              <span class="detail-label">Ingresos</span>
              <span class="detail-value positive">{{ formatPrice(selectedTurn.totalIngresos) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Egresos</span>
              <span class="detail-value negative">{{ formatPrice(selectedTurn.totalEgresos) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTurnsStore } from "@/stores/turnsStore";
import { useGlobalStore } from "@/stores/globalStore";
import api from "@/config/axios.config";

export default {
  name: "TurnsComponent",

  data() {
    return {
      turnsStore: useTurnsStore(),
      globalStore: useGlobalStore(),
      selectedTurn: null,
      shopUsers: [],
    };
  },

  methods: {
    formatPrice(value) {
      if (!value && value !== 0) return "$0";
      return "$" + Number(value).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },

    formatDate(dateStr) {
      if (!dateStr) return "—";
      return new Date(dateStr).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    statusClass(status) {
      if (status === "Abierto") return "status-open";
      if (status === "Cerrado") return "status-closed";
      return "status-encurso";
    },

    async applyFilters() {
      await this.turnsStore.fetchShopTurns();
    },

    clearFilters() {
      this.turnsStore.clearFilters();
      this.turnsStore.fetchShopTurns();
    },

    async loadShopUsers() {
      try {
        const shopId = this.globalStore.shopId();
        const response = await api.get(`/users/get/get-users/${shopId}`);
        this.shopUsers = response.data?.users || response.data || [];
      } catch {
        this.shopUsers = [];
      }
    },
  },

  async mounted() {
    await this.turnsStore.fetchCurrentTurn();
    await this.turnsStore.fetchShopTurns();
    await this.loadShopUsers();
  },
};
</script>

<style scoped>
.turns-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  padding: 1.5rem;
  background: #f9fafb;
  min-height: calc(100vh - 64px);
  color: #1f2937;
}

/* Header */
.turns-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.turns-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.turns-header-icon {
  width: 48px;
  height: 48px;
  background: #fff7ed;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.turns-header-icon .material-symbols-outlined {
  font-size: 1.5rem;
  color: #f9931e;
}
.turns-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.2rem;
}
.turns-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.turn-open-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  padding: 0.4rem 0.875rem;
  font-size: 0.82rem;
  font-weight: 600;
}
.turn-open-badge .material-symbols-outlined {
  font-size: 0.875rem;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Filtros */
.filters-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.filter-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.filter-input {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.filter-input:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.15);
}
.amount-range {
  display: flex;
  gap: 0.5rem;
}
.amount-input {
  flex: 1;
  min-width: 0;
}
.filter-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-filter {
  background: #f9931e;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-filter:hover:not(:disabled) { background: #e8821a; }
.btn-filter:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-filter .material-symbols-outlined { font-size: 1rem; }

.btn-clear {
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-clear:hover { background: #e5e7eb; }
.btn-clear .material-symbols-outlined { font-size: 1rem; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.stat-card {
  background: white;
  border-radius: 0.875rem;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon .material-symbols-outlined { font-size: 1.25rem; }
.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}
.stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Loading / Error / Empty */
.turns-loading, .turns-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  justify-content: center;
  font-size: 0.9rem;
  color: #6b7280;
}
.turns-error { color: #dc2626; background: #fee2e2; border-radius: 1rem; }
.turns-error .material-symbols-outlined { font-size: 1.25rem; }
.turns-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #f9931e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.turns-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #9ca3af;
}
.turns-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.turns-empty h3 { font-size: 1.1rem; font-weight: 600; color: #6b7280; margin: 0 0 0.5rem; }
.turns-empty p { font-size: 0.875rem; color: #9ca3af; margin: 0; }

/* Tabla */
.turns-table-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.turns-table-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}
.turns-table-header h3 { font-size: 0.9rem; font-weight: 700; color: #111827; margin: 0; }
.turns-table-wrapper { overflow-x: auto; }
.turns-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.turns-table thead tr {
  background: #f9fafb;
}
.turns-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.turns-table-row {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f9fafb;
}
.turns-table-row:last-child { border-bottom: none; }
.turns-table-row:hover { background: #fafafa; }
.turns-table td {
  padding: 0.875rem 1rem;
  color: #374151;
  white-space: nowrap;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fed7aa;
  color: #c2410c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.amount-cell {
  font-weight: 600;
  color: #111827;
}
.negative { color: #dc2626 !important; }
.positive { color: #16a34a !important; }

/* Status badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}
.status-open { background: #dcfce7; color: #16a34a; }
.status-closed { background: #f1f5f9; color: #64748b; }
.status-encurso { background: #fff7ed; color: #f9931e; }

/* Modal detalle */
.turn-detail-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  backdrop-filter: blur(2px);
  padding: 1rem;
}
.turn-detail-card {
  background: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}
.turn-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
.turn-detail-header h3 { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
.btn-modal-close {
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

.turn-detail-body { padding: 1.25rem 1.5rem; }
.detail-section {
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}
.detail-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.detail-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 0.75rem;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f9fafb;
}
.detail-row:last-child { border-bottom: none; }
.detail-label {
  font-size: 0.82rem;
  color: #6b7280;
  font-weight: 500;
}
.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}
.detail-value.highlight { color: #f9931e; font-size: 1rem; }

/* Responsive */
@media (max-width: 1024px) {
  .filters-grid { grid-template-columns: 1fr 1fr; }
  .filter-actions { grid-column: span 2; }
}

@media (max-width: 640px) {
  .turns-container { padding: 1rem; }
  .filters-grid { grid-template-columns: 1fr; }
  .filter-actions { grid-column: 1; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .turns-title { font-size: 1.25rem; }
}
</style>
