<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/40 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full sm:w-[500px] sm:max-w-[95vw] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up relative">
      <div class="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
        <div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight">Cerrar Caja</h2>
          <p class="text-sm text-slate-500 mt-1 font-medium">Finalice y registre su arqueo de caja.</p>
        </div>
        <button @click="$emit('close')" class="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors">
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>

      <div class="p-5 sm:p-6 overflow-y-auto">
        <form @submit.prevent="closeCashRegister()">
          <div class="space-y-4 mb-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                <span>Efectivo Final <span class="text-red-500">*</span></span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span class="text-slate-400 font-bold">$</span>
                </div>
                <input v-model.number="cajaStore.entregaEfectivoFinal" type="number" step="0.01" min="0"
                  class="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#f9931e]/20 focus:border-[#f9931e] transition-all"
                  placeholder="0.00" required />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                <span>Observaciones</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <i class="fas fa-comment-alt text-slate-400"></i>
                </div>
                <input v-model="cajaStore.observaciones" type="text"
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#f9931e]/20 focus:border-[#f9931e] transition-all"
                  placeholder="Ingrese observaciones..." />
              </div>
            </div>
          </div>

          <div class="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 mb-4">
            <h3 class="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <i class="fas fa-clipboard-list text-indigo-500"></i> Resumen del Cierre
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
                <span class="text-slate-600 font-medium">Efectivo Final:</span>
                <span class="font-black text-lg text-emerald-600">{{ formatCurrency(cajaStore.entregaEfectivoFinal) }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" :disabled="loading"
              class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-base shadow-sm">
              <i class="fas fa-spinner fa-spin" v-if="loading"></i>
              <i class="fas fa-cash-register" v-else></i>
              {{ loading ? 'Cerrando...' : 'Cerrar Caja' }}
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
  name: "CloseCashRegisterModal",
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

    async closeCashRegister() {
      try {
        this.loading = true;
        await this.cajaStore.closeCaja()
        this.$emit("success");
        this.$emit("close");
      } catch (error) {
        console.log("Error al iniciar el cierre de caja:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style>
/* Animación central compartida en Alevia Pay con Tailwind */
@keyframes slideUpModal {
  0% { opacity: 0; transform: translateY(100%); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (min-width: 640px) {
  @keyframes slideUpModal {
    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
}

.animate-slide-up {
  animation: slideUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
