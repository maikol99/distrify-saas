<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Movimientos</h1>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select v-model="store.filters.type" class="w-full p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white">
            <option value="">Todos</option>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
          <select v-model="store.filters.paymentMethod" class="w-full p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white">
            <option value="">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="TarjetaCredito">Tarjeta de Crédito</option>
            <option value="TarjetaDebito">Tarjeta de Débito</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
          <input v-model="store.filters.startDate" type="date" class="w-full p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
          <input v-model="store.filters.endDate" type="date" class="w-full p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white" />
        </div>
        <div class="flex items-end gap-2">
          <button @click="applyFilters" class="flex-1 py-2 px-4 bg-gradient-to-br from-orange-400 to-orange-600 text-white border-none rounded-xl font-semibold cursor-pointer shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg text-sm">Filtrar</button>
          <button @click="clearFilters" class="flex-1 py-2 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer">Limpiar</button>
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
            <th class="p-3 text-sm font-medium text-gray-600">Tipo</th>
            <th class="p-3 text-sm font-medium text-gray-600">Descripción</th>
            <th class="p-3 text-sm font-medium text-gray-600">Categoría</th>
            <th class="p-3 text-sm font-medium text-gray-600">Método</th>
            <th class="p-3 text-sm font-medium text-gray-600 text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.movements.length === 0" class="border-t">
            <td colspan="6" class="p-8 text-center text-gray-500">No se encontraron movimientos</td>
          </tr>
          <tr v-for="m in paginatedMovements" :key="m._id" class="border-t hover:bg-gray-50">
            <td class="p-3 text-sm text-gray-600">{{ formatDate(m.createdAt || m.date) }}</td>
            <td class="p-3 text-sm">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="m.movementType === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ m.movementType === 'ingreso' ? 'Ingreso' : 'Egreso' }}
              </span>
            </td>
            <td class="p-3 text-sm font-medium text-gray-800">{{ m.description || '-' }}</td>
            <td class="p-3 text-sm text-gray-500">{{ m.category || '-' }}</td>
            <td class="p-3 text-sm text-gray-500">{{ m.paymentMethod || '-' }}</td>
            <td class="p-3 text-sm text-right font-semibold" :class="m.movementType === 'ingreso' ? 'text-green-600' : 'text-red-600'">
              {{ m.movementType === 'ingreso' ? '+' : '-' }}${{ formatNumber(m.total) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="!store.loading && totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">
          Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }}–{{ Math.min(currentPage * itemsPerPage, store.movements.length) }} de {{ store.movements.length }}
        </span>
        <div class="flex items-center gap-1">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="page === currentPage
              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white border-none shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
            class="px-3 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMovementsStore } from "@/stores/movementsStore";
import moment from "moment";
import numeral from "numeral";

export default {
  name: "MovementsComponent",
  data() {
    return {
      store: useMovementsStore(),
      currentPage: 1,
      itemsPerPage: 20,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.store.movements.length / this.itemsPerPage);
    },
    paginatedMovements() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.store.movements.slice(start, start + this.itemsPerPage);
    },
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      const delta = 2;
      const left = Math.max(1, current - delta);
      const right = Math.min(total, current + delta);
      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    applyFilters() {
      this.currentPage = 1;
      this.store.fetchMovements(1, this.store.pagination.limit);
    },
    clearFilters() {
      this.currentPage = 1;
      this.store.clearFilters();
      this.store.fetchMovements(1, this.store.pagination.limit);
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },
    formatDate(date) {
      if (!date) return "-";
      return moment(date).format("DD/MM/YYYY HH:mm");
    },
    formatNumber(value) {
      if (!value && value !== 0) return "0";
      return numeral(value).format("0,0.00");
    },
  },
  mounted() {
    this.store.fetchMovements();
  },
};
</script>

