<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm">
    <div class="bg-white w-screen h-screen md:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 md:rounded-t-3xl text-orange-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">edit</span>
          Editar Egreso
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      <!-- Información Actual -->
      <div class="current-info-section">
        <h3>Información Actual</h3>
        <div class="info-cards">
          <div class="info-card">
            <div class="info-label">
              <i class="fas fa-file-alt"></i>
              Descripción Actual
            </div>
            <div class="info-value">
              {{ currentExpense.description || "No especificada" }}
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">
              <i class="fas fa-tag"></i>
              Categoría Actual
            </div>
            <div class="info-value">
              {{ currentExpense.category || "No seleccionada" }}
            </div>
          </div>
          <!-- Nuevo: Información de Método de Pago Actual -->
          <div class="info-card payment-info-card">
            <div class="info-label">
              <i class="fas fa-credit-card"></i>
              Método de Pago Actual
            </div>
            <div class="info-value">
              <!-- Lógica para mostrar el método de pago actual -->
              <div class="single-payment-display">
                <span class="payment-badge single">
                  {{ currentExpense.paymentMethod || "No especificado" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="expenseDescription">Descripción:</label>
          <input
            type="text"
            id="expenseDescription"
            v-model="currentExpense.description"
            class="form-control"
            placeholder="Descripción del egreso"
            required
          />
        </div>
        <div class="form-group">
          <label for="expenseCategory">Categoría:</label>
          <select
            v-model="currentExpense.category"
            id="expenseCategory"
            class="form-control"
            required
          >
            <option value="" disabled>Seleccione una categoría</option>
            <option value="Alquiler">Alquiler</option>
            <option value="Servicios">Servicios</option>
            <option value="Sueldos">Sueldos</option>
            <option value="Impuestos">Impuestos</option>
            <option value="Seguros">Seguros</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Insumos de oficina">Insumos de oficina</option>
            <option value="Servicios profesionales">
              Servicios profesionales
            </option>
            <option value="Publicidad y marketing">
              Publicidad y marketing
            </option>
            <option value="Transporte y logística">
              Transporte y logística
            </option>
            <option value="Comunicaciones">Comunicaciones</option>
            <option value="Comisiones bancarias">Comisiones bancarias</option>
            <option value="Préstamos o créditos">Préstamos o créditos</option>
            <option value="Materia prima">Materia prima</option>
            <option value="Empaques">Empaques</option>
            <option value="Costos de exportación">Costos de exportación</option>
            <option value="Aduana">Aduana</option>
            <option value="Costos de producción">Costos de producción</option>
            <option value="Licencias de software">Licencias de software</option>
            <option value="Investigación y desarrollo">
              Investigación y desarrollo
            </option>
            <option value="Capacitación">Capacitación</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="expenseDate">Fecha:</label>
            <input
              id="expenseDate"
              v-model="currentExpense.date"
              type="date"
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="expenseTotal">Total:</label>
            <input
              id="expenseTotal"
              v-model.number="currentExpense.total"
              type="number"
              step="0.01"
              class="form-control"
              required
            />
          </div>
        </div>
        <!-- Sección de Métodos de Pago para Edición -->
        <div class="form-group">
          <label for="paymentMethod">Método de Pago:</label>
          <select
            v-model="paymentMethod"
            id="paymentMethod"
            class="form-control"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Cuenta corriente">Cuenta corriente</option>
            <option value="Credito">Crédito</option>
            <option value="Debito">Débito</option>
            <option value="Cheque">Cheque</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>
      
      <!-- FOOTER -->
      <div class="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 md:rounded-b-3xl mt-auto shadow-inner">
        <button @click="$emit('close')" class="py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto">
          Cancelar
        </button>        
        <button @click.prevent="updateExpense()" class="py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading">
          <span class="material-symbols-outlined mr-2 animate-spin" v-if="loading">progress_activity</span>
          Actualizar
        </button>
      </div>
    </div>
  </div>
  <spinnerComponent v-if="loading" />
</template>

<script>
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import moment from "moment";
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";
import numeral from "numeral";

export default {
  name: "EditExpenseModal",
  components: {
    spinnerComponent,
  },
  props: {
    expense: {
      type: Object,
      required: true,
    },
  },
  emits: ["update", "close", "submit"],
  data() {
    return {
      currentExpense: {
        _id: "",
        description: "",
        category: "",
        date: "",
        total: 0,
        paymentMethod: "",
      },
      paymentMethod: "Efectivo",
      loading: false,
      globalStore: useGlobalStore(),
    };
  },
  watch: {
    expense: {
      handler(newExpense) {
        if (newExpense) {
          this.loadExpenseData(newExpense);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    formatPrice(value) {
      return numeral(value).format("$0.00");
    },
    loadExpenseData(expense) {
      this.currentExpense = JSON.parse(JSON.stringify(expense));

      if (this.currentExpense.date) {
        this.currentExpense.date = moment
          .utc(this.currentExpense.date)
          .format("YYYY-MM-DD");
      }
      // Determine initial payment mode
      this.paymentMethod = this.currentExpense.paymentMethod || "Efectivo";
    },
    async updateExpense() {
      try {
        this.loading = true;

        const userId = this.globalStore.userId();

        const updateData = {
          description: this.currentExpense.description,
          category: this.currentExpense.category,
          total: this.currentExpense.total,
          userId: userId,
          createdAt: this.currentExpense.date,
          date:this.currentExpense.date 
        };

        console.log('Update Data:', updateData);
        
        updateData.paymentMethod = this.paymentMethod || "Efectivo";
        const response = await api.patch(
          `/outputs/patch/update-output/${this.currentExpense._id}`,
          updateData
        );
        const data = response.data;
        if (data.success) {
          this.$emit("submit"); // Emit submit to reload the expense list
          this.$emit("close");
        }
      } catch (error) {
        console.error("Error al actualizar el egreso", error);
        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          window.alert(
            `Error: ${
              error.response.data.message || "No se pudo actualizar el egreso"
            }`
          );
        } else {
          window.alert("No se pudo actualizar el egreso. Intente nuevamente.");
        }
      } finally {
        this.loading = false;
      }
    },
  },
  async mounted() {
    // No need for supplierStore in expenses
  },
};
</script>

<style scoped>
/* Modales */
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 600px;
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
.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}
/* Sección de información actual - usando estilos originales como base */
.current-info-section {
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: #f9fafb;
}
.current-info-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
.info-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
}
.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}
.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  word-wrap: break-word;
}
/* Estilos para la visualización de métodos de pago en "Información Actual" */
.payment-info-card .info-value {
  font-weight: normal; /* Reset font-weight for nested elements */
}
.single-payment-display {
  display: flex;
  justify-content: flex-start;
}
.multiple-payments-display {
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
.payment-details-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.payment-item-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.payment-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
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
.payment-amount-display {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background-color: #d1fae5;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid #a7f3d0;
}
/* Fin de estilos de visualización */
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
/* Formularios */
.form-group {
  margin-bottom: 1.25rem;
}
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
}
.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.form-control:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}
.form-text {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
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
  background-color: #e8851b; /* Adjusted hover color for orange */
}
.btn-primary:disabled {
  background-color: #9ca3af;
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
/* Estilos para el toggle de modo de pago */
.payment-mode-toggle {
  display: flex;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
}
.btn-toggle {
  flex: 1;
  padding: 0.625rem 0.75rem;
  background-color: white;
  color: #4b5563;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.btn-toggle:hover {
  background-color: #f3f4f6;
}
.btn-toggle.active {
  background-color: #f9931e;
  color: white;
  box-shadow: inset 0 0 0 2px #f9931e;
}
/* Estilos para la entrada de múltiples pagos */
.multiple-payments-input {
  margin-top: 1rem;
}
.current-multiple-payments {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  background-color: #f9fafb;
}
.payment-input-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}
.payment-input-item:last-child {
  border-bottom: none;
}
.payment-input-item .payment-badge {
  margin-right: 0.5rem;
}
.btn-remove-payment {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}
.btn-remove-payment:hover {
  background-color: #fee2e2;
}
.text-muted {
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
}
/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: none;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .info-cards {
    grid-template-columns: 1fr;
  }
  .payment-item-display,
  .payment-input-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  .payment-amount-display,
  .payment-input-item .payment-amount {
    margin-left: 0;
  }
}
</style>
