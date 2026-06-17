<template>
  <div class="p-6 bg-slate-50 min-h-screen font-sans">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div class="flex flex-1 w-full md:max-w-md gap-3">
        <div class="relative flex-1">
          <span
            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            >search</span
          >
          <input
            v-model="clientStore.searchQuery"
            placeholder="Buscar por nombre o email"
            @keydown.enter="clientStore.searchByName"
            @input="clientStore.checkInput"
            class="w-full py-3 pr-3 pl-10 border border-gray-300 rounded-2xl text-[0.95rem] transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
          />
        </div>
        <button
          @click="clientStore.searchByName"
          class="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-br from-orange-400 to-orange-600 text-white border-none rounded-2xl font-semibold cursor-pointer shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span class="material-symbols-outlined text-white">search</span>
          Buscar
        </button>
      </div>

      <button
        @click="showingCreateClient = true"
        class="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-br from-orange-400 to-orange-600 text-white border-none rounded-2xl font-semibold cursor-pointer shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg w-full md:w-auto"
      >
        <span class="material-symbols-outlined">add</span> Agregar Nuevo Cliente
      </button>
    </div>

    <div class="flex justify-start mb-6 w-full">
      <button
        @click="showingClientPagosRegister = true"
        class="flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl font-semibold cursor-pointer shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow w-full md:w-auto"
      >
        <span class="material-symbols-outlined">payments</span> Registrar pago
      </button>
    </div>

    <!-- Toggle para filtros -->
    <div class="flex justify-start mb-4 w-full">
      <button
        @click="showFilters = !showFilters"
        class="flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl font-semibold cursor-pointer shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow w-full md:w-auto"
      >
        <span class="material-symbols-outlined">
          {{ showFilters ? "expand_less" : "expand_more" }}
        </span>
        {{ showFilters ? "Ocultar Filtros" : "Mostrar Filtros" }}
      </button>
    </div>

    <!-- Filtros -->
    <div v-if="showFilters" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deuda desde:</label>
          <input
            type="number"
            v-model="clientStore.minDebt"
            placeholder="$0.00"
            min="0"
            step="0.01"
            class="w-full py-2.5 px-3 border border-gray-300 rounded-2xl text-sm transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deuda hasta:</label>
          <input
            type="number"
            v-model="clientStore.maxDebt"
            placeholder="$0.00"
            min="0"
            step="0.01"
            class="w-full py-2.5 px-3 border border-gray-300 rounded-2xl text-sm transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiene deuda:</label>
          <select
            v-model="clientStore.hasDebt"
            class="w-full py-2.5 px-3 border border-gray-300 rounded-2xl text-sm transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
          >
            <option value="">Todos</option>
            <option value="true">Con deuda</option>
            <option value="false">Sin deuda</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo de cliente:</label>
          <select
            v-model="clientStore.typeOfClient"
            class="w-full py-2.5 px-3 border border-gray-300 rounded-2xl text-sm transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
          >
            <option value="">Todos</option>
            <option value="Hogar">Hogar</option>
            <option value="Empresa">Empresa</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado autorización:</label>
          <select
            v-model="clientStore.isAuthorized"
            class="w-full py-2.5 px-3 border border-gray-300 rounded-2xl text-sm transition-all bg-white focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(249,147,30,0.1)]"
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-4">
        <button
          @click="applyClientFilters"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-orange-400 to-orange-600 text-white border-none rounded-2xl font-semibold cursor-pointer shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span class="material-symbols-outlined text-white">filter_alt</span>
          Filtrar
        </button>
        <button
          @click="clearClientFilters"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-2xl font-semibold cursor-pointer shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50"
        >
          <span class="material-symbols-outlined">close</span>
          Limpiar
        </button>
      </div>
    </div>

    <div
      class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="overflow-x-auto w-full hidden md:block">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-left">
              <th class="p-4 font-semibold text-gray-600 whitespace-nowrap">
                Nombre
              </th>
              <th class="p-4 font-semibold text-gray-600 whitespace-nowrap">
                Dirección
              </th>
              <th class="p-4 font-semibold text-gray-600 whitespace-nowrap">
                Teléfono
              </th>
              <th class="p-4 font-semibold text-gray-600 whitespace-nowrap">
                Email
              </th>
              <th class="p-4 font-semibold text-gray-600 whitespace-nowrap">
                Deuda
              </th>
              <th
                class="p-4 font-semibold text-gray-600 whitespace-nowrap text-center"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="clientStore.clients.length > 0"
              v-for="client in clientStore.clients"
              :key="client._id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="p-4 text-gray-800">{{ client.name }}</td>
              <td
                class="p-4 text-gray-600 max-w-[200px] truncate"
                :title="client.address"
              >
                {{ client.address }}
              </td>
              <td class="p-4 text-gray-600">{{ client.phone }}</td>
              <td class="p-4 text-gray-600">{{ client.email }}</td>
              <td
                class="p-4 font-medium"
                :class="client.debt > 0 ? 'text-red-500' : 'text-emerald-600'"
              >
                {{ formatValue(client.debt) }}
              </td>
              <td class="p-4 flex justify-center">
                <select
                  class="p-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
                  @change="handleActionChange(client, $event)"
                >
                  <option value="">Acciones</option>
                  <option value="verVentas">Ver Ventas</option>
                  <option value="edit">Editar</option>
                  <option value="delete">Eliminar</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA MÓVIL (TARJETAS) -->
      <div class="md:hidden flex flex-col gap-4 p-4 w-full">
        <div v-if="clientStore.clients.length > 0" v-for="client in clientStore.clients" :key="client._id" class="bg-white border text-sm border-gray-100 rounded-2xl p-4 shadow-sm relative">
           <div class="flex justify-between items-start mb-3">
             <div class="flex-1 pr-2">
               <h3 class="font-bold text-gray-800 text-lg m-0 truncate">{{ client.name }}</h3>
               <p class="text-gray-500 m-0 text-xs truncate">{{ client.email }}</p>
             </div>
             <!-- Dropdown Acciones -->
              <select
                class="p-1.5 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                @change="handleActionChange(client, $event)"
              >
                <option value="">Acciones</option>
                <option value="verVentas">Ver Ventas</option>
                <option value="edit">Editar</option>
                <option value="delete">Eliminar</option>
              </select>
           </div>
           
           <div class="grid grid-cols-2 gap-3 mt-4 text-gray-600 border-t border-gray-50 pt-3">
              <div class="flex flex-col">
                <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Teléfono</span>
                <span class="font-medium text-sm">{{ client.phone || 'N/A' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Deuda</span>
                <span class="font-bold text-sm" :class="client.debt > 0 ? 'text-red-500 bg-red-50 py-0.5 px-2 rounded w-fit' : 'text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded w-fit'">{{ formatValue(client.debt) }}</span>
              </div>
              <div class="flex flex-col col-span-2">
                <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Dirección</span>
                <span class="font-medium text-sm truncate">{{ client.address || 'N/A' }}</span>
              </div>
           </div>
        </div>
      </div>

      <div
        v-if="clientStore.clients.length === 0"
        class="flex flex-col items-center justify-center py-16 text-gray-400"
      >
        <span class="material-symbols-outlined text-6xl mb-4 opacity-50"
          >group</span
        >
        <p class="text-lg">No se encontraron clientes</p>
      </div>

      <!-- PAGINACION -->
      <div
        class="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100 flex-wrap gap-4 text-sm text-gray-600"
      >
        <!-- Botón anterior -->
        <button
          :disabled="clientStore.pagination.page === 1"
          @click="clientStore.previousPage"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl cursor-pointer transition-all hover:not(:disabled):bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-[1.1rem]"
            >chevron_left</span
          >
          Anterior
        </button>
        <!-- Números de página -->
        <div class="flex items-center gap-2">
          <!-- Primera página -->
          <button
            class="px-4 py-2 border-none bg-orange-500 text-white rounded-xl font-medium cursor-pointer transition-all shadow-sm"
          >
            {{ clientStore.pagination.page }}
          </button>
          <span class="px-2 text-gray-500">de</span>
          <button
            class="px-4 py-2 border border-gray-200 bg-white rounded-xl font-medium cursor-default transition-all"
          >
            {{ clientStore.pagination.totalPages }}
          </button>
        </div>
        <!-- Botón siguiente -->
        <button
          :disabled="
            clientStore.pagination.page === clientStore.pagination.totalPages
          "
          @click="clientStore.nextPage"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl cursor-pointer transition-all hover:not(:disabled):bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
          <span class="material-symbols-outlined text-[1.1rem]"
            >chevron_right</span
          >
        </button>
        <!-- Selector de elementos por página -->
        <div class="flex items-center gap-2">
          <label for="itemsPerPage">Clientes por página:</label>
          <select
            @change="clientStore.changeLimit($event.target.value)"
            id="itemsPerPage"
            class="py-2 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <spinnerComponent v-if="clientStore.loading"></spinnerComponent>

  <clientRegisterPago
    @close="showingClientPagosRegister = false"
    @submit="clientStore.fetchClients"
    v-if="showingClientPagosRegister"
  ></clientRegisterPago>

  <clientDetails
    :clientId="clientToEdit"
    @close="showingClientDetails = false"
    v-if="showingClientDetails"
  ></clientDetails>
  <createClient
    v-if="showingCreateClient"
    @submit="clientStore.fetchClients"
    @close="showingCreateClient = false"
  ></createClient>

  <deleteClient
    v-if="showingDeleteClient"
    :clientId="clientToDelete"
    @submit="clientStore.fetchClients"
    @close="showingDeleteClient = false"
  ></deleteClient>

  <!-- Modal Ver Ventas del Cliente -->
  <div
    v-if="showClientSalesModal"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4"
    @click="closeClientSalesModal"
  >
    <div
      class="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      @click.stop
    >
      <div class="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-800 m-0">
          Ventas de {{ selectedClientForSales?.name || "Cliente" }}
        </h2>
        <button @click="closeClientSalesModal" class="bg-transparent border-none text-gray-400 cursor-pointer text-xl p-1 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="p-5 flex-1 overflow-y-auto">
        <spinnerComponent v-if="clientStore.clientSalesLoading" />
        <div v-else-if="clientStore.clientSales.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <span class="material-symbols-outlined text-6xl mb-4 opacity-50">receipt_long</span>
          <p class="text-lg">No se encontraron ventas</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-left">
                <th class="p-3 font-semibold text-gray-600 text-sm whitespace-nowrap">Fecha</th>
                <th class="p-3 font-semibold text-gray-600 text-sm whitespace-nowrap">Total</th>
                <th class="p-3 font-semibold text-gray-600 text-sm whitespace-nowrap">Cajero</th>
                <th class="p-3 font-semibold text-gray-600 text-sm whitespace-nowrap">Método de pago</th>
                <th class="p-3 font-semibold text-gray-600 text-sm whitespace-nowrap">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sale in clientStore.clientSales"
                :key="sale._id"
                class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="p-3 text-gray-800 text-sm">{{ formatDate(sale.createdAt) }}</td>
                <td class="p-3 text-gray-800 text-sm font-medium">{{ formatValue(sale.total) }}</td>
                <td class="p-3 text-gray-600 text-sm">{{ sale.cashier || "Sin cajero" }}</td>
                <td class="p-3 text-gray-600 text-sm">{{ sale.paymentMethod || "-" }}</td>
                <td class="p-3 text-sm">
                  <span
                    :class="sale.status === 'Cancelado' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'"
                    class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  >
                    {{ sale.status === "Cancelado" ? "Cancelada" : "Completada" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex justify-end p-5 border-t border-gray-100">
        <button
          @click="closeClientSalesModal"
          class="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-2xl font-semibold cursor-pointer shadow-sm transition-all hover:bg-gray-50"
        >
          <span class="material-symbols-outlined">close</span> Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import clientDetails from "@/components/visuals/clients/clientDetails.vue";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import clientRegisterPago from "@/components/visuals/clients/clientRegisterPago.vue";
import { useClientsStore } from "@/stores/clientsStore";
import numeral from "numeral";
import createClient from "@/components/visuals/clients/createClient.vue";
import deleteClient from "@/components/visuals/clients/deleteClient.vue";

export default {
  components: {
    spinnerComponent,
    clientRegisterPago,
    clientDetails,
    createClient,
    deleteClient,
  },
  data() {
    return {
      showingClientDetails: false,
      showingCreateClient: false,
      showingDeleteClient: false,
      showingClientPagosRegister: false,
      clientStore: useClientsStore(),
      clientToDelete: null,
      clientToEdit: null,
      showFilters: false,
      showClientSalesModal: false,
      selectedClientForSales: null,
    };
  },
  computed: {},
  methods: {
    async handleActionChange(client, event) {
      const action = event.target.value;
      switch (action) {
        case "view":
          console.log("Detalles de cliente:", client);
          break;
        case "verVentas":
          this.selectedClientForSales = client;
          this.showClientSalesModal = true;
          this.clientStore.fetchSalesByClient(client._id);
          break;
        case "edit":
          this.clientToEdit = client._id;
          this.showingClientDetails = true;
          break;
        case "delete":
          this.clientToDelete = client._id;
          this.showingDeleteClient = true;
          break;
      }

      event.target.value = ""; // Reset the select after action
    },
    formatValue(value) {
      return numeral(value).format("$0.00");
    },
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    applyClientFilters() {
      this.clientStore.filtersApplied = true;
      this.clientStore.pagination.page = 1;
      this.clientStore.loadData();
    },
    clearClientFilters() {
      this.clientStore.minDebt = null;
      this.clientStore.maxDebt = null;
      this.clientStore.hasDebt = "";
      this.clientStore.typeOfClient = "";
      this.clientStore.isAuthorized = "";
      this.clientStore.filtersApplied = false;
      this.clientStore.pagination.page = 1;
      this.clientStore.fetchClients();
    },
    closeClientSalesModal() {
      this.showClientSalesModal = false;
      this.selectedClientForSales = null;
      this.clientStore.clientSales = [];
    },
  },
  async mounted() {
    await this.clientStore.fetchClients();
  },
};
</script>

<style scoped>
/* Scoped styles replaced by Tailwind utilities */
table { border-collapse: collapse; width: 100%; }
thead tr { background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%); }
thead th { font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: #374151; }
</style>
