<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm">
    <div class="bg-white w-screen h-screen md:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 md:rounded-t-3xl text-orange-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">add_circle</span>
          Registrar Egreso
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      <div class="modal-body p-5 flex-1 overflow-y-auto">
        <!-- Selector Tipo de Egreso: Gasto General vs Pago a Proveedor -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Egreso:</label>
          <div class="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              @click="expenseType = 'gasto'; currentExpense.category = 'Otros'"
              :class="[
                'p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all',
                expenseType === 'gasto'
                  ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              ]"
            >
              <span class="material-symbols-outlined text-lg">receipt_long</span>
              Gasto del Local
            </button>
            <button
              type="button"
              @click="expenseType = 'proveedor'; currentExpense.category = 'Pago a proveedores'"
              :class="[
                'p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all',
                expenseType === 'proveedor'
                  ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              ]"
            >
              <span class="material-symbols-outlined text-lg">local_shipping</span>
              Pago a Proveedor
            </button>
          </div>
        </div>

        <!-- Si es Proveedor: selector opcional de proveedor registrado -->
        <div v-if="expenseType === 'proveedor'" class="form-group bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100 mb-4">
          <label for="supplierSelect" class="block text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">
            Proveedor:
          </label>
          <select
            id="supplierSelect"
            v-model="selectedSupplierId"
            @change="onSupplierChange"
            class="form-control bg-white"
          >
            <option value="">-- Escribir nombre manual o seleccionar --</option>
            <option v-for="sup in suppliers" :key="sup._id" :value="sup._id">
              {{ sup.name }} {{ sup.company ? '(' + sup.company + ')' : '' }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="expenseDescription">Descripción / Concepto:</label>
          <input
            type="text"
            id="expenseDescription"
            v-model="currentExpense.description"
            class="form-control"
            :placeholder="expenseType === 'proveedor' ? 'Ej: Pago mercadería La Serenísima' : 'Descripción del egreso'"
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
            <optgroup label="Proveedores">
              <option value="Pago a proveedores">Pago a proveedores</option>
              <option value="Materia prima">Materia prima</option>
              <option value="Empaques">Empaques</option>
            </optgroup>
            <optgroup label="Gastos Operativos">
              <option value="Servicios">Servicios (Luz, agua, gas, internet)</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Sueldos">Sueldos</option>
              <option value="Impuestos">Impuestos</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Insumos de oficina">Insumos de oficina</option>
              <option value="Seguros">Seguros</option>
              <option value="Servicios profesionales">Servicios profesionales</option>
              <option value="Publicidad y marketing">Publicidad y marketing</option>
              <option value="Transporte y logística">Transporte y logística</option>
              <option value="Comisiones bancarias">Comisiones bancarias</option>
              <option value="Préstamos o créditos">Préstamos o créditos</option>
              <option value="Otros">Otros</option>
            </optgroup>
          </select>
        </div>
        <div class="form-row">
    
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
        <div class="form-row">
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
      </div>
      
      <!-- FOOTER -->
      <div class="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 md:rounded-b-3xl mt-auto shadow-inner">
        <button @click="$emit('close')" class="py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto">
          Cancelar
        </button>        
        <button @click.prevent="saveExpense()" class="py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading" style="pointer-events: auto;">
          <span class="material-symbols-outlined mr-2 animate-spin" v-if="loading">progress_activity</span>
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
    <!-- Modal de métodos de pago -->
  </div>
  <spinnerComponent v-if="loading" />
</template>

<script>
import moment from "moment";
import api from "@/config/axios.config";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "CreateExpenseModal",
  components: {
    spinnerComponent,
  },
  emits: ["save", "close", "submit"],
  data() {
    return {
      expenseType: "gasto", // "gasto" | "proveedor"
      selectedSupplierId: "",
      suppliers: [],
      currentExpense: {
        description: "",
        category: "Otros",
        date: moment().format("YYYY-MM-DD"),
        total: 0,
        shopId: "",
      },
      paymentMethod: "Efectivo",
      paymentMethods: [],
      loading: false,
      globalStore: useGlobalStore(),
    };
  },
  async mounted() {
    await this.loadSuppliers();
  },
  methods: {
    async loadSuppliers() {
      try {
        const shopId = this.globalStore.shopId();
        if (!shopId) return;
        const res = await api.get(`/suppliers/get/all-suppliers-with-select/${shopId}`);
        if (res.data?.success && Array.isArray(res.data.suppliers)) {
          this.suppliers = res.data.suppliers;
        }
      } catch (err) {
        // Silencioso si falla la carga de lista
      }
    },
    onSupplierChange() {
      if (this.selectedSupplierId) {
        const sup = this.suppliers.find((s) => s._id === this.selectedSupplierId);
        if (sup) {
          this.currentExpense.description = `Pago proveedor: ${sup.name}${sup.company ? ' (' + sup.company + ')' : ''}`;
        }
      }
    },
    resetForm() {
      this.expenseType = "gasto";
      this.selectedSupplierId = "";
      this.currentExpense = {
        description: "",
        category: "Otros",
        date: moment().format("YYYY-MM-DD"),
        total: 0,
      };
      this.paymentMethod = "Efectivo";
      this.paymentMethods = [];
    },
    async saveExpense() {
      if (this.loading) return; // Guard contra doble envío
      try {
        this.loading = true;
        const shopId = this.globalStore.shopId();
        const userId = this.globalStore.userId();
        const expenseData = {
          shopId: shopId,
          description: this.currentExpense.description,
          category: this.currentExpense.category,
          total: this.currentExpense.total,
          userId: userId,
          paymentMethod: this.paymentMethod,
          date:this.currentExpense.date
        };

        const response = await api.post(
          "/outputs/post/create-output",
          expenseData
        );
        const data = response.data;
        if (data.success) {
          this.$emit("submit");
          this.resetForm();
          this.$emit("close");
        }
      } catch (error) {
        console.error("Error al registrar el egreso", error);
        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          window.alert(
            `Error: ${
              error.response.data.message || "No se pudo registrar el egreso"
            }`
          );
        } else {
          window.alert("No se pudo registrar el egreso. Intente nuevamente.");
        }
      } finally {
        this.loading = false;
      }
    },
    handlePaymentMethods(saleData) {
      this.paymentMethods = saleData.paymentMethods;
      this.showingModalPaymentMethods = false;
    },
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
/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: none;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
