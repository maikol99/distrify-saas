<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm">
    <div class="bg-white w-screen h-screen md:w-[600px] md:h-auto md:max-h-[85vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 md:rounded-t-3xl text-orange-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">add_circle</span>
          Registrar Ingreso
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
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
            <label for="incomeTotal" class="text-sm font-semibold text-gray-600">Total:</label>
            <input id="incomeTotal" v-model.number="currentIncome.total" type="number" step="0.01" class="py-2.5 px-3 border border-gray-200 rounded-xl text-base text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" required />
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
      </div>

      <!-- FOOTER -->
      <div class="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 md:rounded-b-3xl mt-auto shadow-inner">
        <button @click="$emit('close')" class="py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto">
          Cancelar
        </button>        
        <button @click.prevent="saveIncome()" class="py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading">
          <span class="material-symbols-outlined mr-2 animate-spin" v-if="loading">progress_activity</span>
          Guardar Ingreso
        </button>
      </div>
    </div>
  </div>
  <spinnerComponent v-if="loading" />
</template>

<script>
import moment from "moment";
import api from "@/config/axios.config";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "CreateIncomeModal",
  components: {
    spinnerComponent,
  },
  emits: ["save", "close", "submit"],
  data() {
    return {
      currentIncome: {
        description: "",
        category: "",
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
  methods: {
    resetForm() {
      this.currentIncome = {
        description: "",
        category: "",
        date: moment().format("YYYY-MM-DD"),
        total: 0,
      };
      this.paymentMethod = "Efectivo";
      this.paymentMethods = [];
    },
    async saveIncome() {
      try {
        this.loading = true;
        const shopId = this.globalStore.shopId();
        const userId = this.globalStore.userId();
        const incomeData = {
          shopId: shopId,
          description: this.currentIncome.description,
          category: this.currentIncome.category,
          total: this.currentIncome.total,
          userId: userId,
          paymentMethod: this.paymentMethod,
          date: this.currentIncome.date
        };

        const response = await api.post(
          "/inputs/post/create-input",
          incomeData
        );
        const data = response.data;
        if (data.success) {
          this.$emit("submit");
          this.resetForm();
          this.$emit("close");
        }
      } catch (error) {
        console.error("Error al registrar el ingreso", error);
        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          window.alert(
            `Error: ${error.response.data.message || "No se pudo registrar el ingreso"
            }`
          );
        } else {
          window.alert("No se pudo registrar el ingreso. Intente nuevamente.");
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
/* Scoped overrides removed in favor of Tailwind CSS in template */
</style>