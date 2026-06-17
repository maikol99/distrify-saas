<template>
  <div class="output-container">
    <div class="actions-bar">
      <!-- Botones de acción principales (arriba a la derecha) -->
      <div class="main-action-buttons"></div>

      <!-- Botón para mostrar/ocultar filtros -->
      <div class="filter-toggle-container">
        <button @click="toggleFilters" class="btn-toggle-filters">
          <i
            :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          ></i>
          {{ showFilters ? "Ocultar Filtros" : "Mostrar Filtros" }}
        </button>
      </div>

      <!-- Contenedor de Filtros -->
      <div v-if="showFilters" class="filters-container">
        <!-- Fila 1 de filtros -->
        <div class="filter-group search-autocomplete-container">
          <label for="filter-cashier">Usuario:</label>
          <input
            type="text"
            id="filter-cashier"
            placeholder="Nombre del usuario"
            class="filter-input"
            v-model="inputsStore.searchQuery"
            @keydown.enter="inputsStore.searchCashiers"
          />
          <button
            class="btn-clear-autocomplete"
            title="Limpiar usuario seleccionado"
            @click="inputsStore.clearCashierSearch"
          >
            <i class="fas fa-times"></i>
          </button>
          <ul
            v-if="inputsStore.cashierSearchResults.length > 0"
            class="autocomplete-results-list"
          >
            <li
              v-for="cashier in inputsStore.cashierSearchResults"
              class="autocomplete-result-item"
              @click="inputsStore.selectCashier(cashier)"
            >
              {{ cashier.username }}
            </li>
          </ul>
        </div>

        <div class="filter-group date-filter">
          <label for="startDate">Fecha Inicio:</label>
          <div class="input-with-icon">
            <input
              type="date"
              id="startDate"
              class="filter-input"
              v-model="inputsStore.filters.startDate"
            />
            <i
              v-if="!inputsStore.filters.startDate"
              class="fas fa-calendar-alt date-icon"
            ></i>
          </div>
          <button class="clear-filter-btn">
            <i
              @click="inputsStore.filters.startDate = null"
              v-if="inputsStore.filters.startDate"
              class="fas fa-times"
            ></i>
          </button>
        </div>
        <div class="filter-group date-filter">
          <label for="endDate">Fecha Fin:</label>
          <div class="input-with-icon">
            <input
              type="date"
              id="endDate"
              class="filter-input"
              v-model="inputsStore.filters.endDate"
            />
            <i
              v-if="!inputsStore.filters.endDate"
              class="fas fa-calendar-alt date-icon"
            ></i>
          </div>
          <button
            @click="inputsStore.filters.endDate = null"
            v-if="inputsStore.filters.endDate"
            class="clear-filter-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="filter-group">
          <label for="inputType">Tipo de Ingreso:</label>
          <select
            v-model="inputsStore.filters.category"
            id="inputType"
            class="filter-select"
          >
            <option value="">Todos</option>
            <option value="Ventas">Ventas</option>
            <option value="Cobro de cuenta corriente">
              Cobro de cuenta corriente
            </option>
            <option value="Aporte de socios">Aporte de socios</option>
            <option value="Préstamo recibido">Préstamo recibido</option>
            <option value="Devolución de dinero prestado">
              Devolución de dinero prestado
            </option>
            <option value="Entrega de caja">Entrega de caja</option>
            <option value="Ingreso por intereses">Ingreso por intereses</option>
            <option value="Reintegro">Reintegro</option>
            <option value="Venta de activo">Venta de activo</option>
            <option value="Ingreso extraordinario">
              Ingreso extraordinario
            </option>
            <option value="Subsidios y ayudas">Subsidios y ayudas</option>
            <option value="Ajuste contable">Ajuste contable</option>
            <option value="Otros ingresos">Otros ingresos</option>
            <option value="Alquiler">Alquiler</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="paymentMethod">Método de Pago:</label>
          <select
            v-model="inputsStore.filters.paymentMethod"
            id="paymentMethod"
            class="filter-select"
          >
            <option value="">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Credito">Crédito</option>
            <option value="Debito">Débito</option>
            <option value="Transferencia">Transferencia bancaria</option>
            <option value="Cheque">Cheque</option>
            <option value="Cuenta corriente">Cuenta corriente</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Rango de monto:</label>
          <div class="amount-range">
            <input
              type="number"
              v-model="inputsStore.filters.minAmount"
              placeholder="Desde $"
              class="filter-input amount-input"
            />
            <input
              type="number"
              v-model="inputsStore.filters.maxAmount"
              placeholder="Hasta $"
              class="filter-input amount-input"
            />
          </div>
        </div>

        <!-- Botones de acción de filtros -->
        <div class="filter-actions">
          <button @click="inputsStore.filterInputs" class="btn-primary">
            <i class="fas fa-filter"></i> Aplicar Filtros
          </button>
          <button
            v-if="inputsStore.filterApplied"
            @click="inputsStore.clearFilters"
            class="btn-secondary"
          >
            <i class="fas fa-times"></i> Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <div class="data-table-container">
      <div class="table-header">
        <h2>Ingresos Registrados</h2>
        <button @click="showingCreateInput = true" class="btn-primary">
          <i class="fas fa-plus"></i> Registrar Nuevo Ingreso
        </button>
      </div>
      <div v-if="inputsStore.inputs.length > 0" class="table-responsive">
        <div class="hidden md:block">
          <table class="sales-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th>Usuario</th>
                <th>Medio de Pago</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="input in inputsStore.inputs" :key="input._id">
                <td>{{ input.description || "N/A" }}</td>

                <td>
                  <span class="category-badge">{{ input.category }}</span>
                </td>
                <td>${{ formatAmount(input.total) }}</td>

                <td>{{ input.userId.username || "N/A" }}</td>
                <td>{{ input.paymentMethod || "N/A" }}</td>
                <td>{{ formatDate(input.createdAt) }}</td>
                <td class="sale-actions-cell">
                  <select
                    class="form-control"
                    @change="handleActionChange(input, $event)"
                  >
                    <option value="">Acciones</option>
                    <option value="edit">Editar</option>
                    <option value="print">Imprimir</option>
                    <option value="delete">Eliminar</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA MÓVIL (TARJETAS) -->
        <div class="md:hidden flex flex-col gap-4 py-4 w-full">
          <div v-for="input in inputsStore.inputs" :key="input._id" class="bg-white border text-sm border-gray-100 rounded-2xl p-4 shadow-sm relative">
             <div class="flex justify-between items-start mb-3">
               <div class="flex-1 pr-2">
                 <h3 class="font-bold text-gray-800 text-lg m-0 truncate">{{ input.description || "N/A" }}</h3>
                 <p class="text-[0.65rem] font-bold text-gray-500 m-0 mt-1 uppercase tracking-wider"><span class="bg-orange-50 text-orange-500 py-0.5 px-2 rounded">{{ input.category }}</span></p>
               </div>
               <!-- Dropdown Acciones -->
                <select
                  class="p-1.5 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                  @change="handleActionChange(input, $event)"
                >
                  <option value="">Acciones</option>
                  <option value="edit">Editar</option>
                  <option value="print">Imprimir</option>
                  <option value="delete">Eliminar</option>
                </select>
             </div>
             
             <div class="grid grid-cols-2 gap-3 mt-4 text-gray-600 border-t border-gray-50 pt-3">
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Fecha</span>
                  <span class="font-medium text-sm">{{ formatDate(input.createdAt) }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Monto</span>
                  <span class="font-bold text-sm text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded w-fit">${{ formatAmount(input.total) }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Usuario</span>
                  <span class="font-medium text-sm">{{ input.userId.username || "N/A" }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Pago</span>
                  <span class="font-medium text-sm">{{ input.paymentMethod || "N/A" }}</span>
                </div>
             </div>
          </div>
        </div>
        <div
          class="pagination-controls"
          v-if="inputsStore.pagination.totalPages > 1"
        >
          <button
            @click="previousPage"
            :disabled="inputsStore.pagination.page === 1"
            class="btn-pagination"
          >
            Anterior
          </button>
          <span
            >Página {{ inputsStore.pagination.page }} de
            {{ inputsStore.pagination.totalPages }}</span
          >
          <button
            @click="nextPage"
            :disabled="
              inputsStore.pagination.page === inputsStore.pagination.totalPages
            "
            class="btn-pagination"
          >
            Siguiente
          </button>
          <div class="items-per-page">
            <label for="itemsPerPage">Ingresos por página:</label>
            <select
              id="itemsPerPage"
              v-model="inputsStore.pagination.limit"
              @change="changeLimit(parseInt(inputsStore.pagination.limit))"
              class="form-control"
              :disabled="loading"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
        <div v-if="inputsStore.inputs.length === 0" class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No se encontraron ingresos</p>
        </div>
      </div>
      <div v-else>
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>
            No hay ingresos registrados. ¡Comienza a registrar tus ingresos!
          </p>
        </div>
      </div>
    </div>
    <!-- Controles de Paginación -->
  </div>
  <spinnerComponent v-if="inputsStore.loading"></spinnerComponent>
  <createInput
    v-if="showingCreateInput"
    @close="showingCreateInput = false"
    @submit="inputsStore.fetchInputs"
  >
  </createInput>

  <deleteInput
    v-if="showingDeleteInput"
    :inputId="inputToDelete"
    @close="showingDeleteInput = false"
    @submit="inputsStore.fetchInputs"
  ></deleteInput>

  <editInput
    v-if="showingEditInput"
    :income="inputToEdit"
    @close="showingEditInput = false"
    @submit="inputsStore.fetchInputs"
  ></editInput>

  <toastComponent
    v-if="inputsStore.toast.showing"
    :message="inputsStore.toast.message"
    :state="inputsStore.toast.state"
    @close="inputsStore.toast.showing = false"
  ></toastComponent>
</template>

<script>
import toastComponent from "@/components/visuals/toast/toastComponent.vue";
import { useInputsStore } from "@/stores/inputsStore";
import moment from "moment";
import numeral from "numeral";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import createInput from "@/components/visuals/inputs/createInput.vue";
import deleteInput from "@/components/visuals/inputs/deleteInput.vue";
import editInput from "@/components/visuals/inputs/editInput.vue";

export default {
  name: "inputManagement",
  components: {
    spinnerComponent,
    createInput,
    deleteInput,
    editInput,
    toastComponent,
  },
  data() {
    return {
      inputs: [],
      loading: false,
      showFilters: false,
      showingCreateInput: false,
      showingEditInput: false,
      showingDeleteInput: false,
      inputsStore: useInputsStore(),
      inputToDelete: null,
      inputToEdit: null,
    };
  },

  methods: {
    async printInput(input) {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      // ===== ENCABEZADO EMPRESARIAL =====
      doc.setFillColor(41, 128, 185); // azul corporativo
      doc.rect(0, 0, 210, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("COMPROBANTE DE INGRESO", 105, 18, { align: "center" });

      // ===== DATOS GENERALES =====
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const startY = 40;
      doc.text(`Fecha: ${this.formatDate(input.createdAt)}`, 14, startY + 7);
      doc.text(`Usuario: ${input.userId?.username || "N/A"}`, 14, startY + 14);

      // ===== TABLA PRINCIPAL =====
      autoTable(doc, {
        startY: startY + 25,
        head: [["Descripción", "Categoría", "Método de Pago", "Monto"]],
        body: [
          [
            input.description || "N/A",
            input.category || "N/A",
            input.paymentMethod || "N/A",
            `$${this.formatAmount(input.total)}`,
          ],
        ],
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 11,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          halign: "center",
        },
      });

      // ===== TOTAL RESALTADO =====
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(14, finalY, 182, 10, "F");
      doc.text(
        `TOTAL A PAGAR: $${this.formatAmount(input.total)}`,
        200 - 14,
        finalY + 7,
        { align: "right" }
      );

      // ===== PIE DE PÁGINA =====
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Documento generado automáticamente por Sistema Nahuel",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );

      // Descargar
      doc.save(`Factura_${input._id}.pdf`);
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    async previousPage() {
      if (this.inputsStore.pagination.page > 1) {
        this.inputsStore.pagination.page--;
        await this.inputsStore.loadData();
      }
    },
    async nextPage() {
      if (
        this.inputsStore.pagination.page <
        this.inputsStore.pagination.totalPages
      ) {
        this.inputsStore.pagination.page++;
        await this.inputsStore.loadData();
      }
    },

    async changeLimit(newLimit) {
      this.inputsStore.pagination.limit = newLimit;
      this.inputsStore.pagination.page = 1; // Resetear a la primera página cuando cambia el límite
      await this.inputsStore.loadData();
    },
    async handleActionChange(input, event) {
      const action = event.target.value;
      if (action === "edit") {
        this.inputToEdit = input;
        this.showingEditInput = true;
      } else if (action === "delete") {
        this.inputToDelete = input._id;
        this.showingDeleteInput = true;
      } else if (action === "print") {
        this.printInput(input);
      }
      event.target.value = ""; // Resetear el select
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    formatAmount(amount) {
      return numeral(amount || 0).format("0,0.00");
    },
  },
  async mounted() {
    await this.inputsStore.fetchInputs();
  },
};
</script>

<style scoped>
/* Estilos generales */
.output-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
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
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
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
  /* Color de hover para el naranja */
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: white;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
}

.modal-header h3 {
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

/* Nuevos estilos para los filtros */
.actions-bar {
  display: flex;
  flex-direction: column;
  /* Apila las secciones verticalmente */
  gap: 1rem;
  /* Espacio entre las secciones */
  margin-bottom: 1.5rem;
}

.main-action-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  /* Alinea a la derecha */
  flex-wrap: wrap;
  /* Permite que los botones se envuelvan */
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
  /* Borde para el contenedor de filtros */
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  position: relative;
  /* Para el autocompletado y el icono de fecha */
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
  /* Asegura que ocupen el 100% del espacio disponible */
  box-sizing: border-box;
  /* Incluye padding y border en el ancho */
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

/* Estilos para inputs de fecha con icono */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon input[type="date"] {
  padding-right: 2.5rem;
  /* Espacio para el icono */
}

.date-icon {
  position: absolute;
  right: 0.75rem;
  color: #9ca3af;
  pointer-events: none;
  /* Permite hacer clic en el input a través del icono */
}

.clear-filter-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  /* Centra verticalmente */
  transform: translateY(calc(-50% + 0.6rem));
  /* Ajusta para centrar con el input */
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
  /* Ocupa todo el ancho de la cuadrícula */
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  /* Alinea los botones a la derecha */
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
  border-radius: 0.5rem;
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
  color: #374151;
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
  top: calc(100% + 0.25rem);
  /* Posiciona la lista debajo del input con un pequeño margen */
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  transform: translateY(calc(-50% + 0.6rem));
  /* Ajusta para centrar con el input */
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

/* Estilos de Paginación */
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

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-left: auto;
  /* Empuja este grupo a la derecha */
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
  min-width: 5rem;
  font-size: 0.875rem;
}

.form-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Badge para categorías */
.category-badge {
  background-color: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* Responsive */
@media (max-width: 1200px) {
  .filters-container {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 992px) {
  .data-table-container {
    display: grid;
    grid-template-columns: 1fr;
  }

  .main-action-buttons {
    justify-content: center;
    /* Centra los botones en pantallas medianas */
    width: 100%;
  }

  .filters-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .filter-toggle-container {
    text-align: center;
    /* Centra el botón de toggle */
  }
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
    /* Una columna en pantallas pequeñas */
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .table-header {
    display: flex;
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .sales-table {
    font-size: 0.875rem;
  }

  .sales-table th,
  .sales-table td {
    padding: 0.5rem 0.75rem;
  }

  .pagination-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .items-per-page {
    margin-left: 0;
    /* Elimina el margen para centrar */
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .output-container {
    padding: 1rem;
  }

  .btn-pagination {
    width: 100%;
    justify-content: center;
  }
}
</style>
