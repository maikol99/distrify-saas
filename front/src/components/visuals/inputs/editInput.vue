<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm">
    <div class="bg-white w-screen h-screen md:w-[600px] md:h-auto md:max-h-[85vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 md:rounded-t-3xl text-orange-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">edit</span>
          Editar Ingreso
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <!-- Información Actual -->
      <div class="p-5 border-b border-gray-100 bg-orange-50/50">
        <h3 class="text-lg font-bold text-gray-800 m-0 mb-3">Información Actual</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
              <i class="fas fa-file-alt"></i> Descripción
            </div>
            <div class="font-bold text-gray-800 break-words">{{ currentIncome.description || "No especificada" }}</div>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
              <i class="fas fa-tag"></i> Categoría
            </div>
            <div class="font-bold text-gray-800 break-words">{{ currentIncome.category || "No seleccionada" }}</div>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
              <i class="fas fa-credit-card"></i> Pago Actual
            </div>
            <div>
              <span class="inline-block bg-orange-100 text-orange-700 border border-orange-200 py-1 px-2 rounded-lg text-xs font-bold">{{ currentIncome.paymentMethod || "No especificado" }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BODY -->
      <div class="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
        <!-- Input fields -->
        <div class="flex flex-col gap-1.5">
          <label for="incomeDescription" class="text-sm font-semibold text-gray-600">Descripción:</label>
          <input type="text" id="incomeDescription" v-model="currentIncome.description" class="py-2.5 px-3 border border-gray-200 rounded-xl text-base text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Descripción del ingreso" required />
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label for="incomeCategory" class="text-sm font-semibold text-gray-600">Categoría:</label>
          <select v-model="currentIncome.category" id="incomeCategory" class="py-2.5 px-3 border border-gray-200 rounded-xl text-base text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" required>
            <option value="" disabled>Seleccione una categoría</option>
            <option value="Ventas">Ventas</option>
            <option value="Cobro de cuenta corriente">Cobro de cuenta corriente</option>
            <option value="Aporte de socios">Aporte de socios</option>
            <option value="Préstamo recibido">Préstamo recibido</option>
            <option value="Devolución de dinero prestado">Devolución de dinero prestado</option>
            <option value="Entrega de caja">Entrega de caja</option>
            <option value="Ingreso por intereses">Ingreso por intereses</option>
            <option value="Reintegro">Reintegro</option>
            <option value="Venta de activo">Venta de activo</option>
            <option value="Ingreso extraordinario">Ingreso extraordinario</option>
            <option value="Subsidios y ayudas">Subsidios y ayudas</option>
            <option value="Ajuste contable">Ajuste contable</option>
            <option value="Alquiler">Alquiler</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="incomeDate" class="text-sm font-semibold text-gray-600">Fecha:</label>
            <input id="incomeDate" v-model="currentIncome.date" type="date" class="py-2.5 px-3 border border-gray-200 rounded-xl text-base text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" required />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="incomeTotal" class="text-sm font-semibold text-gray-600">Total:</label>
            <input id="incomeTotal" v-model.number="currentIncome.total" type="number" step="0.01" class="py-2.5 px-3 border border-gray-200 rounded-xl text-base text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" required />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="paymentMethod" class="text-sm font-semibold text-gray-600">Método de Pago:</label>
          <select v-model="paymentMethod" id="paymentMethod" class="py-2.5 px-3 border border-gray-200 rounded-xl text-base text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
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
        <button @click.prevent="updateIncome()" class="py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading">
          <span class="material-symbols-outlined mr-2 animate-spin" v-if="loading">progress_activity</span>
          Actualizar Ingreso
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
  name: "EditIncomeModal",
  components: {
    spinnerComponent,
  },
  props: {
    income: {
      type: Object,
      required: true,
    },
  },
  emits: ["update", "close", "submit"],
  data() {
    return {
      currentIncome: {
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
    income: {
      handler(newIncome) {
        if (newIncome) {
          this.loadIncomeData(newIncome);
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
    loadIncomeData(income) {
      this.currentIncome = JSON.parse(JSON.stringify(income));

      if (this.currentIncome.date) {
        this.currentIncome.date = moment
          .utc(this.currentIncome.date)
          .format("YYYY-MM-DD");
      }
      // Determine initial payment mode
      this.paymentMethod = this.currentIncome.paymentMethod || "Efectivo";
    },
    async updateIncome() {
      try {
        this.loading = true;

        const userId = this.globalStore.userId();

        const updateData = {
          description: this.currentIncome.description,
          category: this.currentIncome.category,
          total: this.currentIncome.total,
          userId: userId,
          createdAt: this.currentIncome.date,
          date: this.currentIncome.date
        };

        console.log('Update Data:', updateData);

        updateData.paymentMethod = this.paymentMethod || "Efectivo";
        const response = await api.patch(
          `/inputs/patch/update-input/${this.currentIncome._id}`,
          updateData
        );
        const data = response.data;
        if (data.success) {
          this.$emit("submit"); // Emit submit to reload the income list
          this.$emit("close");
        }
      } catch (error) {
        console.error("Error al actualizar el ingreso", error);
        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          window.alert(
            `Error: ${error.response.data.message || "No se pudo actualizar el ingreso"
            }`
          );
        } else {
          window.alert("No se pudo actualizar el ingreso. Intente nuevamente.");
        }
      } finally {
        this.loading = false;
      }
    },
  },
  async mounted() {
    // No need for supplierStore in incomes
  },
};
</script>

<style scoped>
/* Scoped overrides removed in favor of Tailwind CSS in template */
</style>