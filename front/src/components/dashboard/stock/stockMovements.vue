<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Movimientos de Stock</h1>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar producto</label>
          <input v-model="store.filters.search" type="text" placeholder="Nombre o código" class="w-full p-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select v-model="store.filters.type" class="w-full p-2 border border-gray-300 rounded-lg">
            <option value="">Todos</option>
            <option value="sale">Venta</option>
            <option value="purchase">Compra</option>
            <option value="transfer">Transferencia</option>
            <option value="return">Devolución</option>
            <option value="adjustment">Ajuste</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación origen</label>
          <select v-model="store.filters.fromLocation" class="w-full p-2 border border-gray-300 rounded-lg">
            <option value="">Todas</option>
            <option value="local">Local</option>
            <option value="depot">Depósito</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación destino</label>
          <select v-model="store.filters.toLocation" class="w-full p-2 border border-gray-300 rounded-lg">
            <option value="">Todas</option>
            <option value="local">Local</option>
            <option value="depot">Depósito</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
          <input v-model="store.filters.startDate" type="date" class="w-full p-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
          <input v-model="store.filters.endDate" type="date" class="w-full p-2 border border-gray-300 rounded-lg" />
        </div>
        <div class="flex items-end gap-2">
          <button @click="applyFilters" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Filtrar</button>
          <button @click="clearFilters" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Limpiar</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div v-if="store.loading" class="p-8 text-center text-gray-500">Cargando...</div>
      <table v-else class="w-full">
        <thead>
          <tr class="bg-gray-50 text-left">
            <th class="p-3 text-sm font-medium text-gray-600">Fecha</th>
            <th class="p-3 text-sm font-medium text-gray-600">Producto</th>
            <th class="p-3 text-sm font-medium text-gray-600">Código</th>
            <th class="p-3 text-sm font-medium text-gray-600">Tipo</th>
            <th class="p-3 text-sm font-medium text-gray-600">Origen</th>
            <th class="p-3 text-sm font-medium text-gray-600">Destino</th>
            <th class="p-3 text-sm font-medium text-gray-600">Cantidad</th>
            <th class="p-3 text-sm font-medium text-gray-600">Stock Ant.</th>
            <th class="p-3 text-sm font-medium text-gray-600">Stock Nuevo</th>
            <th class="p-3 text-sm font-medium text-gray-600">Usuario</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.movements.length === 0">
            <td colspan="10" class="p-8 text-center text-gray-500">No se encontraron movimientos</td>
          </tr>
          <tr v-for="m in store.movements" :key="m._id" class="border-t hover:bg-gray-50">
            <td class="p-3 text-sm">{{ formatDate(m.date) }}</td>
            <td class="p-3 text-sm font-medium">{{ m.productName }}</td>
            <td class="p-3 text-sm text-gray-500">{{ m.productCode }}</td>
            <td class="p-3 text-sm">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="typeBadgeClass(m.type)">{{ typeLabel(m.type) }}</span>
            </td>
            <td class="p-3 text-sm">{{ m.fromLocation || '-' }}</td>
            <td class="p-3 text-sm">{{ m.toLocation || '-' }}</td>
            <td class="p-3 text-sm">{{ m.quantity }}</td>
            <td class="p-3 text-sm text-gray-500">{{ m.previousQuantity }}</td>
            <td class="p-3 text-sm">{{ m.newQuantity }}</td>
            <td class="p-3 text-sm text-gray-500">{{ m.userName || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="store.pagination.totalPages > 1" class="flex justify-center mt-4 gap-2">
      <button v-for="p in store.pagination.totalPages" :key="p" @click="goToPage(p)"
        class="px-3 py-1 rounded-lg text-sm"
        :class="p === store.pagination.page ? 'bg-orange-500 text-white' : 'bg-gray-200 hover:bg-gray-300'">
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script>
import { useStockMovementsStore } from "@/stores/stockMovementsStore";
import moment from "moment";

export default {
  name: "StockMovements",
  components: {},
  data() {
    return {
      store: useStockMovementsStore(),
    };
  },
  methods: {
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY HH:mm");
    },

    typeBadgeClass(type) {
      const classes = {
        sale: "bg-red-100 text-red-800",
        purchase: "bg-blue-100 text-blue-800",
        transfer: "bg-purple-100 text-purple-800",
        return: "bg-yellow-100 text-yellow-800",
        adjustment: "bg-green-100 text-green-800",
      };
      return classes[type] || "bg-gray-100 text-gray-800";
    },

    typeLabel(type) {
      const labels = {
        sale: "Venta",
        purchase: "Compra",
        transfer: "Transferencia",
        return: "Devolución",
        adjustment: "Ajuste",
      };
      return labels[type] || type;
    },

    applyFilters() {
      this.store.fetchMovements(1, this.store.pagination.limit);
    },

    clearFilters() {
      this.store.clearFilters();
      this.store.fetchMovements(1, this.store.pagination.limit);
    },

    goToPage(page) {
      if (page >= 1 && page <= this.store.pagination.totalPages) {
        this.store.fetchMovements(page, this.store.pagination.limit);
      }
    },
  },

  async mounted() {
    await this.store.fetchMovements();
  },
};
</script>
