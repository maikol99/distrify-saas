<template>
  <div class="box-details-container">
    <div class="box-header-section">
      <div class="header-info">
        <div class="header-left">
          <button @click="goBack" class="btn-back">
            <i class="fas fa-arrow-left"></i> Volver
          </button>
          <h1 class="box-title">Detalles de Caja</h1>
        </div>
        <div class="header-right">
          <span
            :class="[
              'status-badge',
              getStatusClass(cajaStore.cajaSummary.estado),
            ]"
          >
            {{ getStatusText(cajaStore.cajaSummary.estado) }}
          </span>
          <button
            v-if="cajaStore.cajaSummary.estado === 'abierta'"
            @click="showingCloseCaja = true"
            class="btn-primary"
            style="margin-left: 10px"
          >
            <i class="fas fa-lock"></i> Cerrar Caja
          </button>
        </div>
      </div>
      <div class="box-info-grid">
        <div class="info-card">
          <label>Fecha Apertura:</label>
          <span>{{ formatDateTime(cajaStore.cajaSummary.fechaApertura) }}</span>
        </div>
        <div class="info-card">
          <label>Usuario Apertura:</label>
          <span>{{
            cajaStore.cajaSummary.userIdApertura?.username || "N/A"
          }}</span>
        </div>
        <div class="info-card" v-if="cajaStore.cajaSummary.fechaCierre">
          <label>Fecha Cierre:</label>
          <span>{{ formatDateTime(cajaStore.cajaSummary.fechaCierre) }}</span>
        </div>
        <div class="info-card" v-if="cajaStore.cajaSummary.userIdCierre">
          <label>Usuario Cierre:</label>
          <span>{{
            cajaStore.cajaSummary.userIdCierre?.username || "N/A"
          }}</span>
        </div>
      </div>
      <div
        v-if="cajaStore.cajaSummary.observaciones"
        class="observations-section"
      >
        <label>Observaciones:</label>
        <p>{{ cajaStore.cajaSummary.observaciones }}</p>
      </div>
    </div>

    <div class="totals-section">
      <h2>Resumen de Totales</h2>
      <div class="totals-grid">
        <div class="total-card ventas">
          <div class="total-header">
            <i class="fas fa-shopping-cart"></i>
            <h3>Ventas</h3>
          </div>
          <p class="total-description">
            Las ventas incluyen todos movimientos de ventas registradas en tu
            negocio.
          </p>
          <div class="total-amount">
            {{
              formatAmount(cajaStore.cajaSummary.totalCaja?.totalVentas || 0)
            }}
          </div>
          <div class="total-breakdown">
            <div class="breakdown-item">
              <span>Efectivo:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalVentas?.totalEfectivo || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Tarjeta:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalVentas?.totalTarjeta || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Transferencia:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalVentas?.totalTransferencia || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Cuenta Corriente:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalVentas?.totalCuentaCorriente || 0
                )
              }}</span>
            </div>
          </div>
        </div>

        <div class="total-card compras">
          <div class="total-header">
            <i class="fas fa-truck"></i>
            <h3>Compras</h3>
          </div>
          <p class="total-description">
            Las compras incluyen todas las compras registradas en tu negocio.
          </p>
          <div class="total-amount">
            {{
              formatAmount(cajaStore.cajaSummary.totalCaja?.totalCompras || 0)
            }}
          </div>
          <div class="total-breakdown">
            <div class="breakdown-item">
              <span>Efectivo:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalCompras?.totalEfectivo || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Tarjeta:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalCompras?.totalTarjeta || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Transferencia:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalCompras?.totalTransferencia || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Cuenta Corriente:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalCompras?.totalCuentaCorriente || 0
                )
              }}</span>
            </div>
          </div>
        </div>

        <div class="total-card gastos">
          <div class="total-header">
            <i class="fas fa-money-bill-wave"></i>
            <h3>Gastos</h3>
          </div>
          <p class="total-description">
            Los gastos incluyen todos los egresos registrados en tu negocio.
          </p>
          <div class="total-amount">
            {{
              formatAmount(cajaStore.cajaSummary.totalCaja?.totalGastos || 0)
            }}
          </div>
          <div class="total-breakdown">
            <div class="breakdown-item">
              <span>Efectivo:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalGastos?.totalEfectivo || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Tarjeta:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalGastos?.totalTarjeta || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Transferencia:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalGastos?.totalTransferencia || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Cuenta Corriente:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalGastos?.totalCuentaCorriente || 0
                )
              }}</span>
            </div>
          </div>
        </div>

        <div class="total-card ingresos">
          <div class="total-header">
            <i class="fas fa-plus-circle"></i>
            <h3>Ingresos</h3>
          </div>
          <p class="total-description">
            Los ingresos incluyen todos los ingresos registrados en tu caja.
          </p>
          <div class="total-amount">
            {{
              formatAmount(cajaStore.cajaSummary.totalCaja?.totalIngresos || 0)
            }}
          </div>
          <div class="total-breakdown">
            <div class="breakdown-item">
              <span>Efectivo:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalIngresos?.totalEfectivo || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Tarjeta:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalIngresos?.totalTarjeta || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Transferencia:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalIngresos?.totalTransferencia || 0
                )
              }}</span>
            </div>
            <div class="breakdown-item">
              <span>Cuenta Corriente:</span>
              <span>{{
                formatAmount(
                  cajaStore.cajaSummary.totalIngresos?.totalCuentaCorriente || 0
                )
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        cajaStore.cajaSummary.estado === 'cerrada' &&
        cajaStore.cajaSummary.arqueoFinal
      "
      class="arqueo-section"
    >
      <h2>Arqueo Final</h2>
      <div class="arqueo-grid">
        <div class="arqueo-item">
          <label>Balance Final:</label>
          <span class="arqueo-value">{{
            formatAmount(cajaStore.cajaSummary.arqueoFinal.balanceFinal)
          }}</span>
        </div>
        <div class="arqueo-item">
          <label>Efectivo Total Sistema:</label>
          <span class="arqueo-value">{{
            formatAmount(cajaStore.cajaSummary.arqueoFinal.efectivoTotalSistema)
          }}</span>
        </div>
        <div class="arqueo-item">
          <label>Efectivo Total Presentado Inicio:</label>
          <span class="arqueo-value">{{
            formatAmount(cajaStore.cajaSummary.entregasEfectivo.inicio)
          }}</span>
        </div>
        <div class="arqueo-item">
          <label>Efectivo Total Presentado Cierre:</label>
          <span class="arqueo-value">{{
            formatAmount(cajaStore.cajaSummary.entregasEfectivo.final)
          }}</span>
        </div>
      </div>
    </div>

    <div class="movements-section">
      <div class="movements-header">
        <h2>Movimientos</h2>
      </div>

      <div class="movements-filters">
        <div class="filter-group">
          <label>Método:</label>
          <select
            v-model="movementFilters.metodo"
            class="filter-select"
            @change="resetPagination"
          >
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="cheque">Cheque</option>
            <option value="transferencia">Transferencia</option>
            <option value="cuenta_corriente">Cuenta Corriente</option>
          </select>
        </div>
        <div class="filter-group">
          <button @click="clearMovementFilters" class="btn-secondary">
            <i class="fas fa-times"></i> Limpiar
          </button>
        </div>
      </div>

      <div class="movements-list">
        <div v-if="filteredMovements.length === 0" class="empty-state">
          <i class="fas fa-exchange-alt"></i>
          <p>No hay ingresos registrados</p>
        </div>
        <div v-else>
          <div class="movements-summary">
            <p class="filter-results">
              Mostrando {{ paginatedMovements.length }} de
              {{ filteredMovements.length }} movimientos
              <span v-if="hasActiveFilters" class="active-filters">
                (filtrado{{
                  movementFilters.tipo
                    ? " por tipo: " + getMovementTypeText(movementFilters.tipo)
                    : ""
                }}{{
                  movementFilters.metodo
                    ? " por método: " +
                      getPaymentMethodText(movementFilters.metodo)
                    : ""
                }})
              </span>
            </p>
          </div>
          <div class="movements-table-container">
            <table class="movements-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Método</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="movement in paginatedMovements" :key="movement._id">
                  <td>{{ formatDateTime(movement.fecha) }}</td>

                  <td>{{ movement.descripcion || "Sin descripción" }}</td>
                  <td>{{ getPaymentMethodText(movement.metodo) }}</td>
                  <td
                    :class="['movement-amount', getAmountClass(movement.tipo)]"
                  >
                    {{ formatAmount(movement.monto) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-controls" v-if="totalMovementPages > 1">
            <button
              @click="previousMovementPage"
              :disabled="currentMovementPage === 1"
              class="btn-pagination"
            >
              Anterior
            </button>
            <span class="pagination-info">
              Página {{ currentMovementPage }} de {{ totalMovementPages }}
            </span>
            <button
              @click="nextMovementPage"
              :disabled="currentMovementPage === totalMovementPages"
              class="btn-pagination"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <spinner-component v-if="cajaStore.loading" />
  <closeCaja
    v-if="showingCloseCaja"
    @close="showingCloseCaja = false"
  ></closeCaja>
</template>

<script>import closeCaja from "./closeCaja.vue";
import spinnerComponent from "../spinnerComponent.vue";
import { useCajaStore } from "@/stores/cajaStore";
import { useGlobalStore } from "@/stores/globalStore";
import moment from "moment";
import numeral from "numeral";

export default {
  name: "BoxDetails",
  components: {
    spinnerComponent,
    closeCaja,
  },
  data() {
    return {
      showingCloseCaja: false,
      showCreateMovement: false,
      currentMovementPage: 1,
      movementsPerPage: 10,
      movementFilters: {
        tipo: "",
        metodo: "",
      },
      newMovement: {
        tipo: "ingreso",
        metodo: "",
        monto: 0,
        descripcion: "",
      },
      cajaStore: useCajaStore(),
      globalStore: useGlobalStore(),
    };
  },
  computed: {
    filteredMovements() {
      let filtered = this.cajaStore.cajaSummary?.movimientos || [];
      // Filtrar por tipo
      if (this.movementFilters.tipo) {
        filtered = filtered.filter((m) => m.tipo === this.movementFilters.tipo);
      }
      // Filtrar por método
      if (this.movementFilters.metodo) {
        filtered = filtered.filter(
          (m) => m.metodo === this.movementFilters.metodo
        );
      }
      // Ordenar por fecha descendente (más recientes primero)
      // Nota: Si 'fecha' es un marcador de posición (como en esta adaptación), la ordenación podría no ser significativa.
      return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },
    totalMovementPages() {
      return Math.ceil(this.filteredMovements.length / this.movementsPerPage);
    },
    paginatedMovements() {
      const start = (this.currentMovementPage - 1) * this.movementsPerPage;
      const end = start + this.movementsPerPage;
      return this.filteredMovements.slice(start, end);
    },
    hasActiveFilters() {
      return this.movementFilters.tipo || this.movementFilters.metodo;
    },
    isFormValid() {
      return (
        this.newMovement.tipo &&
        this.newMovement.metodo &&
        this.newMovement.monto &&
        parseFloat(this.newMovement.monto) > 0
      );
    },
  },
  watch: {
    // Observar cambios en los filtros para resetear la paginación
    "movementFilters.tipo"() {
      this.resetPagination();
    },
    "movementFilters.metodo"() {
      this.resetPagination();
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    getStatusClass(status) {
      switch (status) {
        case "abierta":
          return "status-open";
        case "cerrada":
          return "status-closed";
        case "en_revision":
          return "status-review";
        default:
          return "";
      }
    },
    getStatusText(status) {
      switch (status) {
        case "abierta":
          return "ABIERTA";
        case "cerrada":
          return "CERRADA";
        case "en_revision":
          return "EN REVISIÓN";
        default:
          return status?.toUpperCase() || "";
      }
    },
    getMovementTypeClass(type) {
      switch (type) {
        case "venta":
        case "ingreso":
          return "type-positive";
        case "compra":
        case "egreso":
          return "type-negative";
        case "ajuste":
          return "type-neutral";
        default:
          return "";
      }
    },
    getMovementTypeText(type) {
      switch (type) {
        case "venta":
          return "Venta";
        case "compra":
          return "Compra";
        case "egreso":
          return "Egreso";
        case "ingreso":
          return "Ingreso";
        case "ajuste":
          return "Ajuste";
        default:
          return type;
      }
    },
    getPaymentMethodText(method) {
      switch (method) {
        case "efectivo":
          return "Efectivo";
        case "tarjeta":
          return "Tarjeta";
        case "cheque":
          return "Cheque";
        case "transferencia":
          return "Transferencia";
        case "cuenta_corriente":
          return "Cuenta Corriente";
        default:
          return method;
      }
    },
    getAmountClass(type) {
      switch (type) {
        case "venta":
        case "ingreso":
          return "amount-positive";
        case "compra":
        case "egreso":
          return "amount-negative";
        default:
          return "";
      }
    },
    getDifferenceClass() {
      if (!this.cajaStore.cajaSummary?.arqueoFinal) return "";
      const difference =
        this.cajaStore.cajaSummary.arqueoFinal.efectivoTotalPresentado -
        this.cajaStore.cajaSummary.arqueoFinal.efectivoTotalSistema;
      return difference >= 0 ? "difference-positive" : "difference-negative";
    },
    resetPagination() {
      this.currentMovementPage = 1;
    },
    clearMovementFilters() {
      this.movementFilters = {
        tipo: "",
        metodo: "",
      };
      this.resetPagination();
    },
    previousMovementPage() {
      if (this.currentMovementPage > 1) {
        this.currentMovementPage--;
      }
    },
    nextMovementPage() {
      if (this.currentMovementPage < this.totalMovementPages) {
        this.currentMovementPage++;
      }
    },
    closeCreateMovement() {
      this.showCreateMovement = false;
      this.newMovement = {
        tipo: "",
        metodo: "",
        monto: "",
        descripcion: "",
      };
    },
    async createMovement() {
      if (!this.isFormValid) return;
      try {
        const shopId = this.globalStore.shopId();
        const userId = this.globalStore.userId();
        let movementData = {
          ...this.newMovement,
          monto: parseFloat(this.newMovement.monto),
          userId: userId,
          shopId: shopId,
        };
        await this.cajaStore.createMovement(
          movementData,
          this.cajaStore.cajaSummary._id
        );
        this.closeCreateMovement();
      } catch (error) {
        console.error("Error al crear movimiento:", error);
      }
    },
    formatDateTime(date) {
      return moment(date).format("DD/MM/YYYY HH:mm:ss");
    },
    formatAmount(amount) {
      return numeral(amount || 0).format("$0.00");
    },
    /**
     * Transforms a movement object from the new backend structure to the component's expected structure.
     * @param {object} newMovement - The movement object from the new backend.
     * @param {number} index - The index of the movement (for generating a unique ID).
     * @param {string} summaryFechaActual - The 'fechaActual' from the caja summary, used as a fallback date.
     * @returns {object} The transformed movement object.
     */
    transformMovement(newMovement, index, summaryFechaActual) {
      // Map display names from backend to internal method keys
      const paymentMethodKeyMap = {
        "Efectivo": "efectivo",
        "Tarjeta": "tarjeta",
        "Cheque": "cheque",
        "Transferencia": "transferencia",
        "Cuenta Corriente": "cuenta_corriente",
        // Add any other payment methods if they appear in the backend response
      };

      const internalMetodo = paymentMethodKeyMap[newMovement.paymentMethod] || newMovement.paymentMethod.toLowerCase();

      return {
        _id: `movement-${index}-${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID for v-for key
        fecha: summaryFechaActual || new Date().toISOString(), // Use summary's fechaActual as a fallback, or current date
        descripcion: `Movimiento de ${this.getMovementTypeText(newMovement.type)}`, // Generate a description
        metodo: internalMetodo,
        monto: newMovement.total,
        tipo: newMovement.type,
      };
    },
  },
  async mounted() {
    let cajaId = this.$route.params.id;
    await this.cajaStore.getCajaSummary(cajaId);

    if (this.cajaStore.cajaSummary) {
      // Adapt 'entregasEfectivo.inicial' to 'entregasEfectivo.inicio'
      if (this.cajaStore.cajaSummary.entregasEfectivo && typeof this.cajaStore.cajaSummary.entregasEfectivo.inicial !== 'undefined') {
        this.cajaStore.cajaSummary.entregasEfectivo.inicio = this.cajaStore.cajaSummary.entregasEfectivo.inicial;
      }

      // Transform movements if they exist
      if (this.cajaStore.cajaSummary.movimientos) {
        const summaryFechaActual = this.cajaStore.cajaSummary.fechaActual;
        this.cajaStore.cajaSummary.movimientos = this.cajaStore.cajaSummary.movimientos.map((m, index) =>
          this.transformMovement(m, index, summaryFechaActual)
        );
      }
    }
  },
};
</script>

<style scoped>
.total-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
/* Estilos generales */
.box-details-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

/* Header de la caja */
.box-header-section {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back:hover {
  background-color: #e5e7eb;
}

.box-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
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

.status-review {
  background-color: #fef3c7;
  color: #92400e;
}

.box-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-card label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.info-card span {
  font-size: 0.875rem;
  color: #1f2937;
}

.observations-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.observations-section label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  display: block;
  margin-bottom: 0.5rem;
}

.observations-section p {
  margin: 0;
  color: #1f2937;
  font-size: 0.875rem;
}

/* Sección de totales */
.totals-section {
  margin-bottom: 1.5rem;
}

.totals-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.total-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border-left: 4px solid;
}

.total-card.ventas {
  border-left-color: #10b981;
}

.total-card.compras {
  border-left-color: #f59e0b;
}

.total-card.gastos {
  border-left-color: #ef4444;
}

.total-card.ingresos {
  border-left-color: #3b82f6;
}

.total-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.total-header i {
  font-size: 1.25rem;
  color: #6b7280;
}

.total-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.total-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.breakdown-item span:first-child {
  color: #6b7280;
}

.breakdown-item span:last-child {
  color: #1f2937;
  font-weight: 500;
}

/* Sección de arqueo */
.arqueo-section {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.arqueo-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.arqueo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.arqueo-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.arqueo-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.arqueo-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.difference-positive {
  color: #10b981;
}

.difference-negative {
  color: #ef4444;
}

/* Sección de movimientos */
.movements-section {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.movements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.movements-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.movements-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  min-width: 150px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

.movements-summary {
  margin-bottom: 1rem;
}

.filter-results {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.active-filters {
  font-weight: 500;
  color: #f9931e;
}

.movements-table-container {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.movements-table {
  width: 100%;
  border-collapse: collapse;
}

.movements-table th,
.movements-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.movements-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.movements-table tbody tr:hover {
  background-color: #f3f4f6;
}

.movement-type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-positive {
  background-color: #d1fae5;
  color: #065f46;
}

.type-negative {
  background-color: #fee2e2;
  color: #991b1b;
}

.type-neutral {
  background-color: #f3f4f6;
  color: #4b5563;
}

.movement-amount {
  font-weight: 600;
}

.amount-positive {
  color: #10b981;
}

.amount-negative {
  color: #ef4444;
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
  background-color: #e8851b;
}

.btn-primary:disabled {
  background-color: #cccccc;
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
  background-color: #e8851b;
}

.btn-pagination:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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
  margin-top: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Modal */
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
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 500px;
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
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
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

.modal-body {
  padding: 1.25rem;
  flex-grow: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #f3f4f6;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

/* Responsive */
@media (max-width: 1200px) {
  .totals-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 992px) {
  .header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .box-info-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .totals-grid {
    grid-template-columns: 1fr;
  }

  .movements-filters {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .box-details-container {
    padding: 1rem;
  }

  .movements-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .movements-table-container {
    font-size: 0.875rem;
  }

  .movements-table th,
  .movements-table td {
    padding: 0.5rem 0.75rem;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .box-info-grid {
    grid-template-columns: 1fr;
  }

  .arqueo-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 0.5rem;
    max-width: none;
  }
}
</style>
