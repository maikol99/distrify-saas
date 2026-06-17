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
          <select v-model="store.filters.type" class="w-full p-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Todos</option>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
          <select v-model="store.filters.paymentMethod" class="w-full p-2 border border-gray-300 rounded-lg text-sm">
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
          <input v-model="store.filters.startDate" type="date" class="w-full p-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
          <input v-model="store.filters.endDate" type="date" class="w-full p-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div class="flex items-end gap-2">
          <button @click="applyFilters" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium">Filtrar</button>
          <button @click="clearFilters" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium">Limpiar</button>
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
          <tr v-for="m in store.movements" :key="m._id" class="border-t hover:bg-gray-50">
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
    };
  },
  methods: {
    applyFilters() {
      this.store.fetchMovements(1, this.store.pagination.limit);
    },
    clearFilters() {
      this.store.clearFilters();
      this.store.fetchMovements(1, this.store.pagination.limit);
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
