<template>
  <div>
  <div class="purchases-container">
    <div class="actions-bar">
      <div class="search-container">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input
            v-model="buysStore.searchQuery"
            @input="buysStore.checkInput"
            @keydown.enter="buysStore.searchBySupplier"
            placeholder="Buscar por proveedor"
          />
        </div>
        <button @click="searchBySupplier" class="btn-primary">
          <i class="fas fa-search"></i> Buscar
        </button>
      </div>
      <button class="btn-primary" @click="showingCreateBuy = true">
        <i class="fas fa-plus"></i> Registrar Nueva Compra
      </button>
    </div>
    <div class="data-table-container">
      <!-- Cabecera de la tabla -->
      <div class="table-header">
        <div class="table-header-left">
          <span class="table-icon-wrap"><i class="fas fa-shopping-cart"></i></span>
          <div>
            <h2>Compras Registradas</h2>
            <p class="table-subtitle">Historial y gestión de compras</p>
          </div>
        </div>
      </div>
      <!-- FILTROS -->
      <div class="filter-toggle-container">
        <button
          @click="
            buysStore.filtersObject.showFilters =
              !buysStore.filtersObject.showFilters
          "
          class="btn-toggle-filters"
        >
          <i
            :class="
              buysStore.filtersObject.showFilters
                ? 'fas fa-chevron-up'
                : 'fas fa-chevron-down'
            "
          ></i>
          {{
            buysStore.filtersObject.showFilters
              ? "Ocultar filtros"
              : "Mostrar filtros"
          }}
        </button>
      </div>

      <!-- Contenedor de Filtros -->
      <div v-if="buysStore.filtersObject.showFilters" class="filters-container">
        <div class="filter-group search-autocomplete-container">
          <label for="filter-provider">Proveedor:</label>
          <input
            type="text"
            id="filter-provider"
            placeholder="Nombre del proveedor"
            class="filter-input"
            v-model="buysStore.filtersObject.supplierSearchQuery"
            @keydown.enter="buysStore.searchSuppliers"
          />
          <button
            class="btn-clear-autocomplete"
            title="Limpiar proveedor seleccionado"
            @click="buysStore.clearSelections"
          >
            <i
              class="fas fa-times"
              v-if="buysStore.filtersObject.selectedSupplier === true"
            ></i>
          </button>
          <ul
            v-if="buysStore.filtersObject.selectedSupplier === false"
            class="autocomplete-results-list"
          >
            <li
              @click="buysStore.selectSupplier(supplier)"
              v-for="supplier in buysStore.suppliers"
              class="autocomplete-result-item"
            >
              {{ supplier.name }}
            </li>
          </ul>
        </div>

        <div class="filter-group search-autocomplete-container">
          <div class="filter-group search-autocomplete-container">
            <label for="filter-category">Categoría:</label>
            <select
              v-model="buysStore.filtersObject.filters.category"
              class="filter-input"
              id="filter-category"
            >
              <option value="">Seleccionar...</option>
              <option value="Compra de insumos y materia prima">
                Compra de insumos y materia prima
              </option>
              <option value="Compra de mercadería para reventa">
                Compra de mercadería para reventa
              </option>
              <option value="Envases y empaques">Envases y empaques</option>
              <option value="Fletes y logística contratada">
                Fletes y logística contratada
              </option>
              <option value="Mantenimiento y reparaciones contratadas">
                Mantenimiento y reparaciones contratadas
              </option>
              <option
                value="Servicios tercerizados (limpieza, seguridad, etc.)"
              >
                Servicios tercerizados (limpieza, seguridad, etc.)
              </option>
              <option value="Publicidad y diseño gráfico">
                Publicidad y diseño gráfico
              </option>
              <option value="Licencias, software y servicios digitales">
                Licencias, software y servicios digitales
              </option>
              <option value="Equipos, herramientas y mobiliario">
                Equipos, herramientas y mobiliario
              </option>
              <option value="Suministros de oficina">
                Suministros de oficina
              </option>
              <option value="Papelería y materiales gráficos">
                Papelería y materiales gráficos
              </option>
              <option
                value="Servicios profesionales (contables, legales, técnicos)"
              >
                Servicios profesionales (contables, legales, técnicos)
              </option>
              <option value="Viáticos y movilidad facturada">
                Viáticos y movilidad facturada
              </option>
              <option value="Seguros contratados">Seguros contratados</option>
              <option value="Otros gastos a proveedores">
                Otros gastos a proveedores
              </option>
            </select>
          </div>
        </div>

      

         <div class="filter-group search-autocomplete-container">
          <label for="filter-category">Método de pago:</label>
          <select
            v-model="buysStore.filtersObject.filters.paymentMethod"
            class="filter-input"
            name=""
            id=""
          >
            <option value="">Seleccionar...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Cuenta corriente">Cuenta corriente</option>
            <option value="Credito">Credito</option>
            <option value="Debito">Debito</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Rango de monto:</label>
          <div class="amount-range">
            <input
              type="number"
              v-model="buysStore.filtersObject.filters.minAmount"
              placeholder="Desde $"
              class="filter-input amount-input"
            />
            <input
              type="number"
              v-model="buysStore.filtersObject.filters.maxAmount"
              placeholder="Hasta $"
              class="filter-input amount-input"
            />
          </div>
        </div>

        <div class="filter-group">
          <label for="filter-isPaid">Estado de pago:</label>
          <select
            v-model="buysStore.filtersObject.filters.isPaid"
            id="filter-isPaid"
            class="filter-input"
          >
            <option value="">Todas</option>
            <option value="true">Pagada</option>
            <option value="false">No pagada</option>
          </select>
        </div>



         <div class="filter-group search-autocomplete-container">
          <label for="filter-category">Fecha inicio:</label>
          <input
            type="date"
            v-model="buysStore.filtersObject.filters.startDate"
            class="filter-input"
            name=""
            id=""
          />
        </div>


        <div class="filter-group search-autocomplete-container">
          <label for="filter-category">Fecha fin:</label>
          <input
            type="date"
            v-model="buysStore.filtersObject.filters.endDate"
            class="filter-input"
            name=""
            id=""
          />
        </div>

        <div class="filter-actions">
          <button @click="buysStore.filterBuys" class="btn-primary">
            <i class="fas fa-filter"></i> Filtrar
          </button>
          <button @click="buysStore.clearFilters" class="btn-secondary">
            <i class="fas fa-times"></i> Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Indicador de carga -->
      <div v-if="buysStore.loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Cargando compras...</p>
      </div>
      <div class="table-responsive">
        <div class="hidden md:block">
          <table class="data-table" :class="{ loading: buysStore.loading }">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Usuario</th>
                <th>Productos cargados</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody v-if="buysStore.buys.length > 0">
              <tr v-for="buy in buysStore.buys" :key="buy._id">
                <td>{{ formatDate(buy.createdAt) }}</td>
           
                <td>{{ buy.category }}</td>
  
           
                <td>{{ buy.userName }}</td>
                <td :class="{ 'text-success': buy.productsAdded }">
                  {{ buy.productsAdded ? 'Si' : 'No' }}
     
                </td>
                <td class="price-cell">{{ formatPrice(buy.total) }}</td>
                <td class="actions-cell">
                  <select
                    class="form-control"
                    @change="handleActionChange(buy, $event)"
                  >
                    <option value="">Acciones</option>
                    <option value="edit">Editar</option>
                    <option value="upload">Cargar productos</option>
                    <option value="print">Imprimir</option>
                    <option value="delete">Eliminar</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA MÓVIL (TARJETAS) -->
        <div class="md:hidden flex flex-col gap-4 py-4 w-full" v-if="buysStore.buys.length > 0">
          <div v-for="buy in buysStore.buys" :key="buy._id" class="bg-white border text-sm border-gray-100 rounded-2xl p-4 shadow-sm relative">
             <div class="flex justify-between items-start mb-3">
               <div class="flex-1 pr-2">
                 <h3 class="font-bold text-gray-800 text-lg m-0 truncate">Compra #{{ buy._id ? buy._id.substring(buy._id.length - 4).toUpperCase() : 'N/A' }}</h3>
                 <p class="text-[0.65rem] font-bold text-gray-500 m-0 mt-1 uppercase tracking-wider"><span class="bg-orange-50 text-orange-500 py-0.5 px-2 rounded">{{ buy.category || 'Sin categoría' }}</span></p>
               </div>
               <!-- Dropdown Acciones -->
                <select
                  class="p-1.5 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                  @change="handleActionChange(buy, $event)"
                >
                  <option value="">Acciones</option>
                  <option value="edit">Editar</option>
                  <option value="upload">Cargar productos</option>
                  <option value="print">Imprimir</option>
                  <option value="delete">Eliminar</option>
                </select>
             </div>
             
             <div class="grid grid-cols-2 gap-3 mt-4 text-gray-600 border-t border-gray-50 pt-3">
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Fecha</span>
                  <span class="font-medium text-sm">{{ formatDate(buy.createdAt) }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Monto</span>
                  <span class="font-bold text-sm text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded w-fit">{{ formatPrice(buy.total) }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Usuario</span>
                  <span class="font-medium text-sm">{{ buy.userName || 'N/A' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[0.65rem] uppercase tracking-wider text-gray-400 font-bold mb-1">Prod. Cargados</span>
                  <span class="font-medium text-sm" :class="{ 'text-emerald-500 font-bold': buy.productsAdded, 'text-red-500 font-bold': !buy.productsAdded }">{{ buy.productsAdded ? 'Si' : 'No' }}</span>
                </div>
             </div>
          </div>
        </div>

      </div>
      <!-- Estado vacío -->
      <div
        v-if="buysStore.buys.length === 0 && !buysStore.loading"
        class="empty-state"
      >
        <i class="fas fa-receipt"></i>
        <p>No se encontraron compras</p>
      </div>
      <!-- Información de paginación -->
      <div class="pagination-info">
        <span>{{ buysStore.itemsInfo }}</span>
      </div>
      <!-- Controles de paginación -->
      <div class="pagination">
        <!-- Botón anterior -->
        <button
          @click="buysStore.previousPage()"
          :disabled="buysStore.pagination.page === 1 || buysStore.loading"
          class="btn-secondary pagination-btn"
        >
          <i class="fas fa-chevron-left"></i> Anterior
        </button>
        <!-- Números de página -->
        <div class="page-numbers">
          <!-- Primera página -->
          <button
            v-if="buysStore.pagination.page > 3"
            @click="buysStore.goToPage(1)"
            class="page-number"
            :disabled="buysStore.loading"
          >
            1
          </button>
          <span v-if="buysStore.pagination.page > 3" class="page-ellipsis"
            >...</span
          >
          <!-- Páginas visibles -->
          <button
            v-for="pageNumber in buysStore.visiblePages"
            :key="pageNumber"
            @click="buysStore.goToPage(pageNumber)"
            :class="[
              'page-number',
              { active: buysStore.pagination.page === pageNumber },
            ]"
            :disabled="buysStore.loading"
          >
            {{ pageNumber }}
          </button>
          <!-- Última página -->
          <span
            v-if="
              buysStore.pagination.page < buysStore.pagination.totalPages - 2
            "
            class="page-ellipsis"
            >...</span
          >
          <button
            v-if="
              buysStore.pagination.page < buysStore.pagination.totalPages - 2
            "
            @click="buysStore.goToPage(buysStore.pagination.totalPages)"
            class="page-number"
            :disabled="buysStore.loading"
          >
            {{ buysStore.pagination.totalPages }}
          </button>
        </div>
        <!-- Botón siguiente -->
        <button
          @click="buysStore.nextPage()"
          :disabled="
            buysStore.pagination.page === buysStore.pagination.totalPages ||
            buysStore.loading
          "
          class="btn-secondary pagination-btn"
        >
          Siguiente <i class="fas fa-chevron-right"></i>
        </button>
        <!-- Selector de elementos por página -->
        <div class="items-per-page">
          <label for="itemsPerPage">Compras por página:</label>
          <select
            id="itemsPerPage"
            v-model="itemsPerPage"
            @change="handleLimitChange"
            class="form-control"
            :disabled="buysStore.loading"
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
  <createBuy
    v-if="showingCreateBuy"
    @close="showingCreateBuy = false"
    @submit="buysStore.getAllBuys()"
  ></createBuy>
  <editBuy
    v-if="showingEditBuy"
    :buy="buyToEdit"
    @close="showingEditBuy = false"
    @submit="buysStore.getAllBuys()"
  ></editBuy>
  <deleteBuy
    v-if="showingDeleteBuy"
    :purchaseId="buyTodelete"
    @close="showingDeleteBuy = false"
    @submit="buysStore.getAllBuys()"
  ></deleteBuy>
  <spinnerComponent v-if="buysStore.loading"></spinnerComponent>
  <toastComponent
    v-if="buysStore.toast.showing"
    :message="buysStore.toast.message"
    :state="buysStore.toast.state"
    @close="buysStore.toast.showing = false"
  ></toastComponent>
  <addProductsToBuy v-if="showingAddProducts" :purchase="buyToEdit" @close="showingAddProducts = false" @save="handleBuyProducts"></addProductsToBuy>
  </div>
</template>

<script>
import addProductsToBuy from "@/components/visuals/buys/addProductsToBuy.vue";
import toastComponent from "@/components/visuals/toast/toastComponent.vue";
import spinnerComponent from "@/components/visuals/spinnerComponent.vue";
import moment from "moment";
import createBuy from "@/components/visuals/buys/createBuy.vue";
import editBuy from "@/components/visuals/buys/editBuy.vue";
import deleteBuy from "@/components/visuals/buys/deleteBuy.vue";
import { useBuysStore } from "@/stores/buysStore";
import numeral from "numeral";

export default {
  components: {
    spinnerComponent,
    createBuy,
    editBuy,
    deleteBuy,
    toastComponent,
    addProductsToBuy,
  },
  data() {
    return {
      showingAddProducts: false,
      buysStore: useBuysStore(),
      filterQuery: "",
      showingCreateBuy: false,
      showingEditBuy: false,
      showingDeleteBuy: false,
      itemsPerPage: 10,
      buyToEdit: null,
      buyTodelete: null,
    };
  },
  methods: {
    async handleBuyProducts(){
      this.showingAddProducts = false;
      this.buysStore.toast = {
        showing: true,
        message: "Productos agregados a la compra exitosamente",
        state: "success",
      };
      await this.buysStore.getAllBuys();

    },
    async printBuy(buy) {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      // ===== ENCABEZADO =====
      doc.setFillColor(41, 128, 185); // azul corporativo
      doc.rect(0, 0, 210, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("COMPROBANTE DE COMPRA", 105, 18, { align: "center" });

      // ===== DATOS PRINCIPALES =====
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const startY = 40;
      doc.text(`Fecha: ${this.formatDate(buy.createdAt)}`, 14, startY + 7);
      doc.text(
        `Proveedor: ${buy.supplierId?.name || "Sin proveedor"}`,
        14,
        startY + 14
      );
      doc.text(`Usuario: ${buy.userName || "N/A"}`, 14, startY + 21);
      doc.text(`Categoría: ${buy.category || "N/A"}`, 14, startY + 28);

      // ===== MÉTODOS DE PAGO =====
      const paymentData =
        buy.paymentMethods && buy.paymentMethods.length > 0
          ? buy.paymentMethods.map((p) => [
              p.method,
              `$${this.formatPrice(p.amount)}`,
            ])
          : [[buy.paymentMethod || "N/A", `$${this.formatPrice(buy.total)}`]];

      autoTable(doc, {
        startY: startY + 40,
        head: [["Método de Pago", "Monto"]],
        body: paymentData,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 11,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          halign: "center",
        },
      });

      // ===== TOTAL =====
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(14, finalY, 182, 10, "F");
      doc.text(
        `TOTAL COMPRA: ${this.formatPrice(buy.total)}`,
        200 - 14,
        finalY + 7,
        { align: "right" }
      );

      // ===== PIE =====
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Documento generado automáticamente por Sistema Nahuel",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );

      doc.save(`Compra_${buy._id}.pdf`);
    },
    handleActionChange(buy, event) {
      const action = event.target.value;
      if (action === "edit") {
        this.showingEditBuy = true;
        this.buyToEdit = buy;
      } else if (action === "delete") {
        this.showingDeleteBuy = true;
        this.buyTodelete = buy._id;
      } else if (action === "print") {
        this.printBuy(buy);
      }
      if (action === "upload") {
        this.buyToEdit = buy;
        this.showingAddProducts = true;
      }
      event.target.value = ""; // Reset select after action
    },
    formatDate(date) {
      return moment.utc(date).format("DD/MM/YYYY");
    },
    formatPrice(value) {
      return numeral(value).format("$0.00");
    },
    handleLimitChange() {
      this.buysStore.changeLimit(parseInt(this.itemsPerPage));
    },
  },
  async mounted() {
    await this.buysStore.getAllBuys();
    this.itemsPerPage = this.buysStore.pagination.limit;
  },
};
</script>

<style scoped>

.text-success{
  color: #10b981;
  font-weight: 600;
}
.search-autocomplete-container {
  position: relative;
}

.autocomplete-results-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 6px 12px -1px rgba(0, 0, 0, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.06);
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.autocomplete-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1f2937;
  border-bottom: 1px solid #f3f4f6;
}

.autocomplete-result-item:last-child {
  border-bottom: none;
}

.autocomplete-result-item:hover {
  background-color: #f3f4f6;
}

.btn-clear-autocomplete {
  background: none;
  border: none;
  color: #6b7280;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(calc(-50% + 0.5rem));
  padding: 0.25rem;
  font-size: 1rem;
  width: auto;
  height: auto;
  border-radius: 50%;
  z-index: 11;
}

.btn-clear-autocomplete:hover {
  color: #ef4444;
  background-color: #f3f4f6;
}
/* Nuevos estilos para los filtros */
.filter-toggle-container {
  text-align: right;
  margin-bottom: 1rem;
}

.btn-toggle-filters {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-toggle-filters:hover {
  background-color: #e8821a;
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: white;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.filter-input,
.filter-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 2px rgba(249, 147, 30, 0.2);
}

.amount-range {
  display: flex;
  gap: 0.5rem;
}

.amount-input {
  flex: 1;
  min-width: 0;
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}
.actions-cell {
  text-align: center;
  width: 60px;
}

.actions-header {
  text-align: center;
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

/* Estilos para métodos de pago */
.payment-methods-cell {
  min-width: 180px;
  max-width: 250px;
}

.single-payment {
  display: flex;
  justify-content: flex-start;
}

.multiple-payments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.payment-header i {
  color: #f59e0b;
  font-size: 0.875rem;
}

.multiple-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.payment-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.payment-badge.single {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.payment-badge.multiple {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.payment-amount {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background-color: #d1fae5;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid #a7f3d0;
}

/* Estilos generales */
.purchases-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
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

.btn-view {
  color: #f9931e;
}

.btn-edit {
  color: #10b981;
}

.btn-delete {
  color: #ef4444;
}

.btn-icon:hover {
  background-color: #f3f4f6;
}

/* Table header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
}
.table-header-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
.table-icon-wrap {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f9931e 0%, #e8821a 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}
.table-header h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.1rem;
}
.table-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

/* Tabla de datos */
.data-table-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
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
  color: #374151;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.price-cell {
  font-weight: 600;
  color: #10b981;
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

/* Responsive */
@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .data-table-container {
    display: grid;
    grid-template-columns: 1fr;
  }

  .purchases-container {
    display: grid;
    grid-template-rows: 1fr;
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

  .payment-methods-cell {
    min-width: 200px;
  }

  .payment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .purchases-container {
    padding: 1rem;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
