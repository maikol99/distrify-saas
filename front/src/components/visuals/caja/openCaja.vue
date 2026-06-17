<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/40 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full sm:w-[500px] sm:max-w-[95vw] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up relative">
      <div class="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
        <div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight">Abrir Caja</h2>
          <p class="text-sm text-slate-500 mt-1 font-medium">Inicie una nueva sesión de caja.</p>
        </div>
        <button @click="$emit('close')" class="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors">
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>

      <div class="p-5 sm:p-6 overflow-y-auto">
        <form @submit.prevent="openCashRegister()">
          <div class="space-y-4 mb-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                <span>Título <span class="text-red-500">*</span></span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <i class="fas fa-font text-slate-400"></i>
                </div>
                <input v-model.number="cajaStore.title" type="text"
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#f9931e]/20 focus:border-[#f9931e] transition-all"
                  placeholder="Ingrese el título" required />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                <span>Efectivo Inicial <span class="text-red-500">*</span></span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span class="text-slate-400 font-bold">$</span>
                </div>
                <input v-model.number="cajaStore.entregaEfectivoInicial" type="number" step="0.01" min="0"
                  class="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#f9931e]/20 focus:border-[#f9931e] transition-all"
                  placeholder="0.00" required />
              </div>
            </div>
          </div>

          <div class="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 mb-4">
            <h3 class="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <i class="fas fa-clipboard-check text-indigo-500"></i> Resumen del Inicio
            </h3>
            <div class="space-y-2 text-sm max-w-full">
              <div class="flex justify-between items-center gap-2">
                <span class="text-slate-600 font-medium">Usuario:</span>
                <span class="font-bold text-slate-800 truncate">{{ globalStore.userName() }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-600 font-medium">Fecha:</span>
                <span class="font-bold text-slate-800">{{ formatCurrentDate() }}</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-indigo-100 mt-2">
                <span class="text-slate-600 font-medium">Efectivo Inicial:</span>
                <span class="font-black text-lg text-emerald-600">{{ formatCurrency(cajaStore.entregaEfectivoInicial) }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" :disabled="loading"
              class="flex-1 bg-[#f9931e] hover:bg-[#e8821a] text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-base shadow-sm">
              <i class="fas fa-spinner fa-spin" v-if="loading"></i>
              <i class="fas fa-cash-register" v-else></i>
              {{ loading ? 'Abriendo...' : 'Abrir Caja' }}
            </button>
            <button type="button" @click="$emit('close')"
              class="w-full sm:w-auto px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <spinnerComponent v-if="loading" />
</template>

<script>
import moment from "moment";
import spinnerComponent from "../spinnerComponent.vue";
import { useGlobalStore } from "@/stores/globalStore";
import numeral from "numeral";
import { useCajaStore } from "@/stores/cajaStore";

export default {
  name: "openCashRegisterModal",
  components: {
    spinnerComponent,
  },

  emits: ["close", "success"],

  data() {
    return {
      loading: false,
      globalStore: useGlobalStore(),
      cajaStore: useCajaStore(),
    };
  },

  methods: {
    formatCurrentDate() {
      return moment().format("DD/MM/YYYY HH:mm");
    },

    formatCurrency(amount) {
      return numeral(amount).format("$0.00");
    },

    async openCashRegister() {
      try {
        this.loading = true;
        await this.cajaStore.openCaja();
        this.$emit("success");
        this.$emit("close");
      } catch (error) {
        console.log("Error al iniciar la caja:", error);
      } finally {
        this.loading = false;
      }
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
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
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
  background-color: #f8fafc;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header h2::before {
  content: "💰";
  font-size: 1.5rem;
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
  background-color: #f8fafc;
}

/* Formularios */
.form-group {
  margin-bottom: 1.25rem;
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
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.input-group {
  display: flex;
  align-items: center;
}

.input-addon {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-right: none;
  border-radius: 0.375rem 0 0 0.375rem;
  padding: 0.625rem 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.input-group .form-control {
  border-radius: 0 0.375rem 0.375rem 0;
  border-left: none;
}

.input-group .form-control:focus {
  border-left: 1px solid #10b981;
}

.form-text {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Tarjeta de resumen */
.summary-card {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.summary-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-card h3::before {
  content: "📊";
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
  border-bottom: 1px solid #bbf7d0;
}

.summary-item:last-child {
  border-bottom: none;
  font-weight: 600;
}

.summary-label {
  color: #166534;
  font-weight: 500;
}

.summary-value {
  color: #15803d;
  font-weight: 600;
}

/* Botones */
.btn-primary {
  background-color: #10b981;
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

.btn-primary:hover:not(:disabled) {
  background-color: #059669;
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
  padding: 0.25rem;
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

  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
