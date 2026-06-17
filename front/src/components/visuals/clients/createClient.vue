<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white w-screen h-screen md:w-[600px] md:h-auto md:max-h-[85vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl"
    >
      <div
        class="flex justify-between items-center p-5 border-b border-gray-100"
      >
        <h2 class="text-xl font-semibold text-gray-800 m-0">
          Registrar Cliente
        </h2>
        <button
          @click="$emit('close')"
          class="bg-transparent border-none text-gray-500 cursor-pointer transition-colors hover:text-red-500 flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      <div class="p-6 flex-grow overflow-y-auto">
        <div class="mb-5">
          <label for="clientName" class="block mb-2 font-medium text-gray-700"
            >Nombre:</label
          >
          <input
            id="clientName"
            v-model="currentClient.name"
            type="text"
            class="w-full p-3 border border-gray-300 rounded-xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
            required
            placeholder="Nombre del cliente"
          />
        </div>
        <div class="mb-5">
          <label
            for="clientAddress"
            class="block mb-2 font-medium text-gray-700"
            >Dirección:</label
          >
          <input
            id="clientAddress"
            v-model="currentClient.address"
            type="text"
            class="w-full p-3 border border-gray-300 rounded-xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
            placeholder="Dirección del cliente"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label
              for="clientPhone"
              class="block mb-2 font-medium text-gray-700"
              >Teléfono:</label
            >
            <input
              id="clientPhone"
              v-model.number="currentClient.phone"
              type="number"
              class="w-full p-3 border border-gray-300 rounded-xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
              placeholder="Número de teléfono"
            />
          </div>
          <div>
            <label
              for="clientEmail"
              class="block mb-2 font-medium text-gray-700"
              >Email:</label
            >
            <input
              id="clientEmail"
              v-model="currentClient.email"
              type="email"
              class="w-full p-3 border border-gray-300 rounded-xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
              placeholder="Email del cliente"
            />
          </div>
        </div>
        <div class="mb-5">
          <label for="clientDebt" class="block mb-2 font-medium text-gray-700"
            >Deuda:</label
          >
          <input
            id="clientDebt"
            v-model.number="currentClient.debt"
            type="number"
            class="w-full p-3 border border-gray-300 rounded-xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
          />
        </div>
      </div>
      <div
        class="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 flex-col md:flex-row"
      >
        <button
          @click.prevent="saveClient()"
          class="flex items-center justify-center gap-2 px-6 py-3 border-none rounded-2xl font-semibold cursor-pointer transition-all bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          :disabled="loading"
        >
          <span v-if="loading" class="material-symbols-outlined fa-spin"
            >progress_activity</span
          >
          <span v-else class="material-symbols-outlined">save</span>
          Guardar
        </button>
        <button
          @click="$emit('close')"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-2xl font-semibold cursor-pointer shadow-sm transition-all hover:bg-gray-50 hover:-translate-y-[1px] w-full md:w-auto"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
  <!-- Asumiendo que spinnerComponent es un componente externo, si no lo tienes, puedes eliminar esta línea -->
  <spinnerComponent v-if="loading" />
</template>

<script>
import api from "@/config/axios.config"; // Descomentar y configurar si es necesario
import { useGlobalStore } from "@/stores/globalStore"; // Descomentar y configurar si es necesario
import spinnerComponent from "../spinnerComponent.vue"; // Descomentar si tienes un componente spinner

export default {
  name: "CreateClientModal",
  components: {
    spinnerComponent, // Descomentar si usas el spinner
  },
  emits: ["save", "close"],
  data() {
    return {
      currentClient: {
        shopId: "",
        name: "",
        address: "",
        phone: null,
        email: "",
        debt: 0,
      },
      globalStore: useGlobalStore(),
      loading: false,
    };
  },
  methods: {
    resetForm() {
      this.currentClient = {
        shopId: "", // Reset to initial placeholder or actual value
        name: "",
        address: "",
        phone: null,
        email: "",
        typeOfClient: "",
        isAuthorized: "",
        clientList: "",
      };
    },
    async saveClient() {
      try {
        this.loading = true;
        const shopId = this.globalStore.shopId();

        const clientData = {
          shopId: shopId,
          name: this.currentClient.name,
          address: this.currentClient.address,
          phone: this.currentClient.phone,
          email: this.currentClient.email,
          debt: this.currentClient.debt,
        };

        const response = await api.post(
          "/clients/post/create-client",
          clientData,
        );
        const data = response.data;

        if (data.success) {
          this.$emit("submit");
          this.resetForm();
          this.$emit("close");
          window.alert(data.message);
        } else {
          window.alert(data.message || "No se pudo registrar el cliente.");
        }
      } catch (error) {
        window.alert("No se pudo registrar el cliente. Intente nuevamente.");
        // }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Scoped styles replaced by Tailwind utilities */
</style>
