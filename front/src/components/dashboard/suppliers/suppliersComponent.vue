<template>
  <div class="suppliers-container">
    <div class="actions-bar">
      <div class="search-container">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input
            v-model="suppliersStore.searchQuery"
            @keydown.enter="suppliersStore.searchByName"
            placeholder="Buscar por nombre"
            @input="suppliersStore.checkInput"
          />
          <button @click="clearFilters" class="clear-search">
            <i v-if="suppliersStore.searchQuery" class="fas fa-times"></i>
          </button>
        </div>
        <button @click="searchByName" class="btn-primary">
          <i class="fas fa-search"></i> Buscar
        </button>
        <button
          class="btn-secondary clear-search"
          @click="clearFilters"
          v-if="filterQuery !== ''"
        >
          <i class="fas fa-filter"></i>
          Limpiar filtros
        </button>
      </div>
      <button @click="showingCreateSupplier = true" class="btn-primary">
        <i class="fas fa-plus"></i> Registrar Nuevo Proveedor
      </button>
    </div>
     <div class="actions-bar secondary-actions">
      <button @click="showingRegisterPayment = true" class="btn-secondary">
        <i class="fas fa-cash-register"></i> Registrar pago
      </button>
    </div>

    <div class="data-table-container">
      <!-- Indicador de carga -->
      <div v-if="suppliersStore.loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Cargando proveedores...</p>
      </div>

      <div class="table-responsive">
        <div class="hidden md:block">
          <table class="data-table" :class="{ loading: suppliersStore.loading }">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Deuda</th>
                <th colspan="3" class="actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(supplier, index) in suppliersStore.suppliers"
                :key="index"
              >
                <td>{{ supplier.name }}</td>
                <td>{{ supplier.company || "No especificada" }}</td>
                <td>{{ supplier.address || "No especificada" }}</td>
                <td>{{ supplier.phone }}</td>
                <td>{{ supplier.email }}</td>
                <td>{{ formatPrice(supplier.debt) }}</td>
                <td class="actions-cell">
                  <select
                    class="form-control"
                    @change="handleActionChange(supplier, $event)"
                  >
                    <option value="">Acciones</option>
                    <option value="edit">Editar / Ver Detalles</option>
                    <option value="delete">Eliminar</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA MÓVIL (TARJETAS) -->
        <div class="md:hidden flex flex-col gap-4 py-4 w-full" v-if="suppliersStore.suppliers.length > 0">
          <div v-for="(supplier, index) in suppliersStore.suppliers" :key="index" class="bg-white border text-sm border-gray-100 rounded-2xl p-4 shadow-sm relative">
             <div class="flex justify-between items-start mb-3">
               <div class="flex-1 pr-2">
                 <h3 class="font-bold text-gray-800 text-lg m-0 truncate">{{ supplier.name }}</h3>
                 <p class="text-[0.65rem] font-bold text-gray-500 m-0 mt-1 uppercase tracking-wider"><span class="bg-blue-50 text-blue-500 py-0.5 px-2 rounded">{{ supplier.company || 'Empresa No Especificada' }}</span></p>
               </div>
               <!-- Dropdown Acciones -->
                <select
                  class="p-1.5 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                  @change="handleActionChange(supplier, $event)"
                >
                  <option value="">Acciones</option>
                  <option value="edit">Editar / Ver Detalles</option>
                  <option value="delete">Eliminar</option>
                </select>
             </div>
             
             <div class="grid grid-cols-2 gap-3 mt-4 text-gray-600 border-t border-gray-50 pt-3">
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Teléfono</span>
                  <span class="font-medium text-sm truncate">{{ supplier.phone || 'N/A' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Deuda</span>
                  <span class="font-bold text-sm text-red-600 bg-red-50 py-0.5 px-2 rounded w-fit">{{ formatPrice(supplier.debt) }}</span>
                </div>
                <div class="flex flex-col col-span-2">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Email / Dirección</span>
                  <span class="font-medium text-xs break-words">{{ supplier.email || 'N/A' }} - {{ supplier.address || 'N/A' }}</span>
                </div>
             </div>
          </div>
        </div>

      </div>

      <!-- Estado vacío -->
      <div
        v-if="suppliersStore.suppliers.length === 0 && !suppliersStore.loading"
        class="empty-state"
      >
        <i class="fas fa-users"></i>
        <p>No se encontraron proveedores</p>
      </div>

      <!-- Información de paginación -->
      <div class="pagination-info">
        <span>{{ suppliersStore.itemsInfo }}</span>
      </div>

      <!-- Controles de paginación -->
      <div class="pagination">
        <!-- Botón anterior -->
        <button
          @click="suppliersStore.previousPage()"
          :disabled="
            suppliersStore.pagination.page === 1 || suppliersStore.loading
          "
          class="btn-secondary pagination-btn"
        >
          <i class="fas fa-chevron-left"></i> Anterior
        </button>

        <!-- Números de página -->
        <div class="page-numbers">
          <!-- Primera página -->
          <button
            v-if="suppliersStore.pagination.page > 3"
            @click="suppliersStore.goToPage(1)"
            class="page-number"
            :disabled="suppliersStore.loading"
          >
            1
          </button>
          <span v-if="suppliersStore.pagination.page > 3" class="page-ellipsis"
            >...</span
          >

          <!-- Páginas visibles -->
          <button
            v-for="pageNumber in suppliersStore.visiblePages"
            :key="pageNumber"
            @click="suppliersStore.goToPage(pageNumber)"
            :class="[
              'page-number',
              { active: suppliersStore.pagination.page === pageNumber },
            ]"
            :disabled="suppliersStore.loading"
          >
            {{ pageNumber }}
          </button>

          <!-- Última página -->
          <span
            v-if="
              suppliersStore.pagination.page <
              suppliersStore.pagination.totalPages - 2
            "
            class="page-ellipsis"
            >...</span
          >
          <button
            v-if="
              suppliersStore.pagination.page <
              suppliersStore.pagination.totalPages - 2
            "
            @click="
              suppliersStore.goToPage(suppliersStore.pagination.totalPages)
            "
            class="page-number"
            :disabled="suppliersStore.loading"
          >
            {{ suppliersStore.pagination.totalPages }}
          </button>
        </div>

        <!-- Botón siguiente -->
        <button
          @click="suppliersStore.nextPage()"
          :disabled="
            suppliersStore.pagination.page ===
              suppliersStore.pagination.totalPages || suppliersStore.loading
          "
          class="btn-secondary pagination-btn"
        >
          Siguiente <i class="fas fa-chevron-right"></i>
        </button>

        <!-- Selector de elementos por página -->
        <div class="items-per-page">
          <label for="itemsPerPage">Proveedores por página:</label>
          <select
            id="itemsPerPage"
            v-model="itemsPerPage"
            @change="handleLimitChange"
            class="form-control"
            :disabled="suppliersStore.loading"
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
  <spinnerComponent v-if="suppliersStore.loading"></spinnerComponent>
  <createSupplier
    v-if="showingCreateSupplier"
    @close="showingCreateSupplier = false"
    @submit="suppliersStore.getAllSuppliers()"
  ></createSupplier>

  <deleteSupplier
    v-if="showingDeleteSupplier"
    :supplierId="supplierIdToDelete"
    @close="showingDeleteSupplier = false"
    @submit="suppliersStore.getAllSuppliers()"
  ></deleteSupplier>

  <editSupplier
    v-if="showingEditSupplier"
    :supplier="supplierToEdit"
    @close="showingEditSupplier = false"
    @submit="suppliersStore.getAllSuppliers()"
  >
  </editSupplier>

  <supplierDetails
    v-if="showingSupplierDetails"
    :supplierId="supplierId"
    :shopId="shopId"
    @close="showingSupplierDetails = false"
  ></supplierDetails>

  <supplierRegisterPayment
    v-if="showingRegisterPayment"
    @close="showingRegisterPayment = false"
    @submit="suppliersStore.getAllSuppliers()"
  ></supplierRegisterPayment>
</template>

<script>
import createSupplier from "@/components/visuals/suppliers/createSupplier.vue";
import deleteSupplier from "@/components/visuals/suppliers/deleteSupplier.vue";
import editSupplier from "@/components/visuals/suppliers/editSupplier.vue";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import { useSuppliersStore } from "@/stores/suppliersStore";
import supplierDetails from "@/components/visuals/suppliers/supplierDetails.vue";
import supplierRegisterPayment from "@/components/visuals/suppliers/supplierRegisterPayment.vue";
import numeral from "numeral";

export default {
  components: {
    spinnerComponent,
    createSupplier,
    deleteSupplier,
    editSupplier,
    supplierDetails,
    supplierRegisterPayment,
  },
  data() {
    return {
      filterQuery: "",
      showAddSupplierModal: false,
      suppliersStore: useSuppliersStore(),
      itemsPerPage: 10,
      loading: false,
      showingCreateSupplier: false,
      showingDeleteSupplier: false,
      supplierIdToDelete: null,
      showingEditSupplier: false,
      showingSupplierDetails: false,
      shopId: null,
      supplierId: null,
      showingRegisterPayment: false,
    };
  },
  computed: {},
  methods: {
    formatPrice(price) {
      return numeral(price).format("$0.00");
    },
    handleActionChange(supplier, event) {
      const action = event.target.value;
      if (action === "edit") {
        // this.showingEditSupplier = true;
        this.showingSupplierDetails = true;
        this.supplierToEdit = supplier;
        this.supplierId = supplier._id;
        this.shopId = supplier.shopId;
      } else if (action === "delete") {
        this.showingDeleteSupplier = true;
        this.supplierIdToDelete = supplier._id;
      }
      event.target.value = ""; // Reset select after action
    },
    clearSearch() {
      this.filterQuery = "";
      this.suppliersStore.getAllSuppliers();
    },

    clearFilters() {
      this.suppliersStore.searchQuery = "";
      this.suppliersStore.getAllSuppliers();
    },

    editSupplier(supplier) {
      // Implementar edición de proveedor
      console.log("Editar proveedor:", supplier);
    },

    async deleteSupplier(supplierId) {
      if (confirm("¿Está seguro de que desea eliminar este proveedor?")) {
        await this.suppliersStore.deleteSupplier(supplierId);
      }
    },

    handleLimitChange() {
      this.suppliersStore.changeLimit(parseInt(this.itemsPerPage));
    },
  },
  async mounted() {
    await this.suppliersStore.getAllSuppliers();
    this.itemsPerPage = this.suppliersStore.pagination.limit;
  },
};
</script>

<style scoped>
/* Estilos generales */
.suppliers-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #f9931e;
}

/* Barra de acciones */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-container {
  display: flex;
  column-gap: 10px;
  flex-grow: 1;
  max-width: 500px;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  flex-grow: 1;
}

.search-input i {
  color: #f9931e;
  margin-right: 0.75rem;
}

.search-input input {
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 0.95rem;
  background: transparent;
}

.clear-search {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-search:hover {
  background-color: #f3f4f6;
  color: #4b5563;
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
  background-color: #e8821a;
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

.btn-icon {
  background-color: transparent;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-edit {
  color: #f9931e;
}

.btn-delete {
  color: #ef4444;
}

.btn-icon:hover {
  background-color: #f3f4f6;
}

/* Tabla de datos */
.data-table-container {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
}

.table-responsive {
  overflow-x: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #f9931e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table.loading {
  opacity: 0.6;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.data-table th {
  background-color: #f9fafb;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.8rem;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background-color: #f9fafb;
}

.actions-cell {
  white-space: nowrap;
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Paginación */
.pagination-info {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-number {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 2.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.page-number:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.page-number.active {
  background-color: #f9931e;
  color: white;
  border-color: #f9931e;
}

.page-number:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0.5rem 0.25rem;
  color: #6b7280;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.items-per-page label {
  font-size: 0.875rem;
  color: #6b7280;
}

.form-control {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  min-width: 5rem;
  font-size: 0.875rem;
}

.form-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .data-table-container {
    display: grid;
    grid-template-columns: auto;
  }

  .search-container {
    max-width: none;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-numbers {
    justify-content: center;
    order: -1;
  }

  .items-per-page {
    justify-content: center;
  }

  .data-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .suppliers-container {
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
