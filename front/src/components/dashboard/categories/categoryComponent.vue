<template>
  <div class="inventory-container">
    <div class="actions-bar">
      <div class="search-container">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            placeholder="Buscar"
            @keyup.enter="searchCategories"
            @input="checkInput"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <button
          class="btn-secondary clear-search"
          @click="clearFilters"
          v-if="searchQuery !== ''"
        >
          <i class="fas fa-filter"></i>
          Limpiar filtros
        </button>

        <button class="btn-search" @click="searchCategories">
          <i class="fas fa-search"></i> Buscar
        </button>
      </div>

      <div class="action-buttons">
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> Crear Nueva Categoría
        </button>
      </div>
    </div>

    <div class="stock-management">
      <div class="data-table-container">
        <!-- Indicador de carga -->
        <div v-if="categoriesStore.loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>Cargando categorías...</p>
        </div>

        <div class="table-responsive hidden md:block">
          <table
            class="data-table"
            :class="{ loading: categoriesStore.loading }"
          >
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos asociados</th>
                <th>Fecha creación</th>
                <th>Última modificación</th>
                <th class="actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="category in categoriesStore.categories"
                :key="category._id"
                :class="{
                  'inactive-category': !category.active,
                }"
              >
                <td>
                  <div class="category-name">
                    <i class="fas fa-tag category-icon"></i>
                    {{ category.name || "N/A" }}
                  </div>
                </td>
                <td class="description-cell">
                  <div class="truncate-text" :title="category.description">
                    {{ category.description || "Sin descripción" }}
                  </div>
                </td>
                <td>
                  <span class="product-count">
                    {{ category.productCount || 0 }} productos
                  </span>
                </td>

                <td>{{ formatDate(category.createdAt) }}</td>
                <td>{{ formatDate(category.updatedAt) }}</td>
                <td class="actions-cell">
                  <select
                    class="form-control"
                    :value="getCategoryAction(category._id)"
                    @change="handleActionChange(category, $event)"
                    :disabled="categoriesStore.loading"
                  >
                    <option value="">Acciones</option>
                    <option value="edit">Editar</option>
                    <option
                      value="delete"
                      :disabled="category.productCount > 0"
                    >
                      Eliminar
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Stacked Cards (Visible < 768px) -->
        <div class="grid grid-cols-1 gap-4 md:hidden mb-4">
          <div
            v-for="category in categoriesStore.categories"
            :key="category._id"
            class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative transition-colors"
            :class="{
              'opacity-60 bg-gray-50': !category.active
            }"
          >
            <!-- Header (Icon, Name, Actions) -->
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0 flex items-center justify-center border border-orange-200">
                  <i class="fas fa-tag text-lg"></i>
                </div>
                <div class="flex flex-col min-w-0">
                  <h3 class="font-bold text-gray-800 text-sm md:text-base m-0">{{ category.name || "N/A" }}</h3>
                </div>
              </div>

              <!-- Actions Select -->
              <div class="flex-shrink-0">
                <select
                  class="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg py-1 px-2 text-xs focus:ring-orange-500 focus:border-orange-500 font-semibold"
                  :value="getCategoryAction(category._id)"
                  @change="handleActionChange(category, $event)"
                  :disabled="categoriesStore.loading"
                >
                  <option value="">Acciones</option>
                  <option value="edit">Editar</option>
                  <option value="delete" :disabled="category.productCount > 0">Eliminar</option>
                </select>
              </div>
            </div>
            
            <!-- Description -->
            <p class="text-sm text-gray-600 m-0 line-clamp-2">
               {{ category.description || "Sin descripción" }}
            </p>

            <!-- Metadata info -->
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-xs border border-gray-100">
              <div class="flex flex-col gap-1">
                <span class="text-gray-500">Creado: {{ formatDate(category.createdAt) }}</span>
                <span class="text-gray-500">Modificado: {{ formatDate(category.updatedAt) }}</span>
              </div>
              <div class="flex flex-col text-right">
                <span class="font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                  {{ category.productCount || 0 }} productos
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div
          v-if="
            categoriesStore.categories.length === 0 && !categoriesStore.loading
          "
          class="empty-state"
        >
          <i class="fas fa-tags"></i>
          <p>No se encontraron categorías</p>
          <button @click="openCreateModal" class="btn-primary">
            <i class="fas fa-plus"></i> Crear primera categoría
          </button>
        </div>

        <!-- Información de paginación -->
        <div
          v-if="categoriesStore.categories.length > 0"
          class="pagination-info"
        >
          <span>{{ itemsInfo }}</span>
        </div>

        <!-- Controles de paginación -->
        <div
          v-if="categoriesStore.pagination.totalPages > 1"
          class="pagination"
        >
          <!-- Botón anterior -->
          <button
            @click="previousPage"
            :disabled="
              categoriesStore.pagination.page === 1 || categoriesStore.loading
            "
            class="btn-secondary pagination-btn"
          >
            <i class="fas fa-chevron-left"></i> Anterior
          </button>

          <!-- Números de página -->
          <div class="page-numbers">
            <!-- Primera página -->
            <button
              v-if="categoriesStore.pagination.page > 3"
              @click="goToPage(1)"
              class="page-number"
              :disabled="categoriesStore.loading"
            >
              1
            </button>
            <span
              v-if="categoriesStore.pagination.page > 3"
              class="page-ellipsis"
              >...</span
            >

            <!-- Páginas visibles -->
            <button
              v-for="pageNumber in visiblePages"
              :key="pageNumber"
              @click="goToPage(pageNumber)"
              :class="[
                'page-number',
                { active: categoriesStore.pagination.page === pageNumber },
              ]"
              :disabled="categoriesStore.loading"
            >
              {{ pageNumber }}
            </button>

            <!-- Última página -->
            <span
              v-if="
                categoriesStore.pagination.page <
                categoriesStore.pagination.totalPages - 2
              "
              class="page-ellipsis"
              >...</span
            >
            <button
              v-if="
                categoriesStore.pagination.page <
                categoriesStore.pagination.totalPages - 2
              "
              @click="goToPage(categoriesStore.pagination.totalPages)"
              class="page-number"
              :disabled="categoriesStore.loading"
            >
              {{ categoriesStore.pagination.totalPages }}
            </button>
          </div>

          <!-- Botón siguiente -->
          <button
            @click="nextPage"
            :disabled="
              categoriesStore.pagination.page ===
                categoriesStore.pagination.totalPages || categoriesStore.loading
            "
            class="btn-secondary pagination-btn"
          >
            Siguiente <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Selector de elementos por página -->
          <div class="items-per-page">
            <label for="itemsPerPage">Categorías por página:</label>
            <select
              id="itemsPerPage"
              v-model="itemsPerPage"
              @change="handleLimitChange"
              class="form-control"
              :disabled="categoriesStore.loading"
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
  </div>

  <!-- Modal de confirmación para eliminar -->
  <div v-if="showingDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] md:p-4 backdrop-blur-sm" @click="closeDeleteModal">
    <div class="bg-white w-screen h-screen md:w-[450px] md:h-auto md:max-h-[90vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl" @click.stop>
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-red-100 bg-red-50 md:rounded-t-3xl text-red-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">delete</span>
          Confirmar eliminación
        </h2>
        <button @click="closeDeleteModal" class="text-red-400 hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <div class="p-6 flex-1 overflow-y-auto w-full md:w-auto text-center md:text-left">
        <p class="text-gray-700 md:text-lg mb-4 text-center md:text-left">
          ¿Estás seguro de que deseas eliminar la categoría <strong>"{{ categoryToDelete?.name }}"</strong>?
        </p>

        <div v-if="categoryToDelete?.productCount > 0" class="flex flex-col md:flex-row justify-center items-center md:items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-yellow-800 text-left mt-4 shadow-sm">
          <span class="material-symbols-outlined text-amber-500 text-3xl">warning</span>
          <p class="mt-1 font-medium m-0">
            Esta categoría tiene <strong>{{ categoryToDelete.productCount }}</strong> productos
            asociados y no puede ser eliminada directamente.
          </p>
        </div>
      </div>

      <div class="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 md:rounded-b-3xl mt-auto shadow-inner flex-col md:flex-row">
        <button @click="closeDeleteModal" class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 shadow-sm w-full md:w-auto" :disabled="deletingCategory">
          Cancelar
        </button>
        <button @click="confirmDelete" class="py-3 md:py-2 px-5 bg-red-600 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-red-700 shadow-sm flex items-center justify-center disabled:bg-red-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="categoryToDelete?.productCount > 0 || deletingCategory">
          <span v-if="deletingCategory" class="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
          {{ deletingCategory ? "Eliminando..." : "Eliminar" }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de crear categoría -->
  <CreateCategory
    v-if="showingCreateCategory && !categoryToEdit"
    @categoryCreated="handleCategoryCreated"
    @close="closeCreateModal"
  />

  <!-- Modal de editar categoría -->
  <EditCategory
    v-if="showingEditCategory && categoryToEdit"
    :category="categoryToEdit"
    @categoryUpdated="handleCategoryUpdated"
    @close="closeEditModal"
  />
</template>

<script>
import CreateCategory from "@/components/visuals/stock/createCategory.vue";
import EditCategory from "@/components/visuals/categories/editCategory.vue";
import { useCategoriesStore } from "@/stores/categoriesStore";

export default {
  name: "CategoryManagement",
  components: {
    CreateCategory,
    EditCategory, // Registrar el nuevo componente
  },
  data() {
    return {
      categoriesStore: useCategoriesStore(),
      searchQuery: "",
      typeOfQuery: "",
      categoryActions: {},
      showingDeleteModal: false,
      showingCreateCategory: false,
      showingEditCategory: false, // Nueva variable para controlar el modal de edición
      categoryToDelete: null,
      categoryToEdit: null,
      deletingCategory: false,
      itemsPerPage: 10,
    };
  },

  computed: {
    itemsInfo() {
      if (!this.categoriesStore?.pagination) return "";

      const { page, limit, total } = this.categoriesStore.pagination;
      const start = (page - 1) * limit + 1;
      const end = Math.min(page * limit, total);
      return `Mostrando ${start}-${end} de ${total} categorías`;
    },

    visiblePages() {
      if (!this.categoriesStore?.pagination) return [];

      const current = this.categoriesStore.pagination.page;
      const total = this.categoriesStore.pagination.totalPages;
      const pages = [];

      const start = Math.max(1, current - 1);
      const end = Math.min(total, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  methods: {
    getCategoryAction(categoryId) {
      return this.categoryActions[categoryId] || "";
    },

    async handleActionChange(category, event) {
      const action = event.target.value;
      const categoryId = category._id;

      this.categoryActions[categoryId] = action;

      try {
        switch (action) {
          case "edit":
            this.editCategory(category);
            break;
          case "toggle":
            await this.toggleCategoryStatus(category);
            break;
          case "delete":
            this.showDeleteModal(category);
            break;
        }
      } catch (error) {
        console.error("Error handling action:", error);
      }

      // Reset select after action
      setTimeout(() => {
        this.categoryActions[categoryId] = "";
      }, 100);
    },

    // Método actualizado para editar categoría
    editCategory(category) {
      this.categoryToEdit = { ...category }; // Crear una copia de la categoría
      this.showingEditCategory = true; // Mostrar el modal de edición
    },

    async toggleCategoryStatus(category) {
      try {
        const updatedData = {
          active: !category.active,
        };

        await this.categoriesStore.updateCategory(category._id, updatedData);
      } catch (error) {
        console.error("Error toggling category status:", error);
      }
    },

    showDeleteModal(category) {
      this.categoryToDelete = category;
      this.showingDeleteModal = true;
    },

    closeDeleteModal() {
      this.showingDeleteModal = false;
      this.categoryToDelete = null;
      this.deletingCategory = false;
    },

    async confirmDelete() {
      if (!this.categoryToDelete) return;

      this.deletingCategory = true;

      try {
        await this.categoriesStore.deleteCategory(this.categoryToDelete._id);
        this.closeDeleteModal();
      } catch (error) {
        console.error("Error deleting category:", error);
        this.deletingCategory = false;
      }
    },

    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    getStatusClass(active) {
      return active ? "status-active" : "status-inactive";
    },

    async searchCategories() {
      console.log(
        "Buscando categorías:",
        this.searchQuery,
        "por:",
        this.typeOfQuery
      );

      this.categoriesStore.pagination.page = 1;
      await this.categoriesStore.fetchCategoriesByShop();
    },

    async clearSearch() {
      this.searchQuery = "";
      this.typeOfQuery = "";
      await this.loadCategories();
    },

    async clearFilters() {
      await this.clearSearch();
    },

    async checkInput() {
      if (this.searchQuery === "") {
        await this.loadCategories();
      }
    },

    exportCategories() {
      console.log("Exportando categorías...");
      const csvContent = this.generateCSV();
      this.downloadCSV(csvContent, "categorias.csv");
    },

    generateCSV() {
      const headers = [
        "Nombre",
        "Descripción",
        "Estado",
        "Productos",
        "Fecha Creación",
      ];
      const rows = this.categoriesStore.categories.map((category) => [
        category.name,
        category.description || "",
        category.active ? "Activa" : "Inactiva",
        category.productCount || 0,
        this.formatDate(category.createdAt),
      ]);

      return [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");
    },

    downloadCSV(content, filename) {
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    async previousPage() {
      if (this.categoriesStore.pagination.page > 1) {
        this.categoriesStore.pagination.page--;
        await this.categoriesStore.fetchCategoriesByShop();
      }
    },

    async nextPage() {
      if (
        this.categoriesStore.pagination.page <
        this.categoriesStore.pagination.totalPages
      ) {
        this.categoriesStore.pagination.page++;
        await this.categoriesStore.fetchCategoriesByShop();
      }
    },

    async goToPage(page) {
      if (page !== this.categoriesStore.pagination.page) {
        this.categoriesStore.pagination.page = page;
        await this.categoriesStore.fetchCategoriesByShop();
      }
    },

    async handleLimitChange() {
      this.categoriesStore.pagination.limit = parseInt(this.itemsPerPage);
      this.categoriesStore.pagination.page = 1;
      await this.categoriesStore.fetchCategoriesByShop();
    },

    openCreateModal() {
      this.categoryToEdit = null;
      this.showingCreateCategory = true;
    },

    closeCreateModal() {
      this.showingCreateCategory = false;
      this.categoryToEdit = null;
    },

    // Nuevo método para cerrar el modal de edición
    closeEditModal() {
      this.showingEditCategory = false;
      this.categoryToEdit = null;
    },

    // Método para manejar cuando se crea una categoría
    async handleCategoryCreated() {
      await this.categoriesStore.fetchCategoriesByShop();
      this.closeCreateModal();
    },

    // Nuevo método para manejar cuando se actualiza una categoría
    async handleCategoryUpdated(updatedCategory) {
      console.log("Categoría actualizada:", updatedCategory);
      // Recargar la lista de categorías para mostrar los cambios
      await this.categoriesStore.fetchCategoriesByShop();
      this.closeEditModal();
    },

    async loadCategories() {
      await this.categoriesStore.fetchCategoriesByShop();
    },
  },

  async mounted() {
    const { useCategoriesStore } = await import("@/stores/categoriesStore");
    this.categoriesStore = useCategoriesStore();

    this.itemsPerPage = this.categoriesStore.pagination.limit;

    await this.loadCategories();
  },
};
</script>
<style scoped>
.inventory-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  min-height: 100vh;
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
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  min-width: 300px;
  transition: all 0.2s ease;
}

.search-input:focus-within {
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
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

.search-input input::placeholder {
  color: #9ca3af;
}

.search-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-select:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.clear-search {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.clear-search:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e8821a;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-search {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-search:hover {
  background-color: #e8821a;
  transform: translateY(-1px);
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
  font-size: 0.875rem;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
}

.btn-danger:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* Tabla de datos */
.stock-management {
  padding: 0;
}

.data-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
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

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #4b5563;
  position: sticky;
  top: 0;
  z-index: 1;
  font-size: 0.875rem;
}

.data-table tbody tr {
  transition: background-color 0.2s;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.data-table tr.inactive-category {
  background-color: #f9f9f9;
  opacity: 0.7;
}

.actions-cell {
  text-align: center;
  width: 120px;
}

.actions-header {
  text-align: center;
}

.description-cell {
  max-width: 200px;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.category-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.category-icon {
  color: #f9931e;
  font-size: 0.875rem;
}

.product-count {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e0f2fe;
  color: #0369a1;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-inactive {
  color: #ef4444;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  color: #d1d5db;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1rem;
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
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
  transform: translateY(-1px);
}

.page-number.active {
  background-color: #f9931e;
  color: white;
  border-color: #f9931e;
}

.page-number:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-ellipsis {
  padding: 0.5rem 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.items-per-page label {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
}

.form-control {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.form-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirm-modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-radius: 0.5rem 0.5rem 0 0;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #4b5563;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-radius: 0 0 0.5rem 0.5rem;
}

.text-warning {
  color: #f59e0b;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.text-warning i {
  color: #f59e0b;
}

/* Responsive */
@media (max-width: 768px) {
  .inventory-container {
    padding: 1rem;
  }

  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-input {
    min-width: auto;
    width: 100%;
  }

  .action-buttons {
    justify-content: center;
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

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {

  .stock-management{
    display: grid;
    grid-template-columns: 1fr;
  }

  .search-container button{
    width: 100%;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }

  .data-table th,
  .data-table td {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .category-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .confirm-modal {
    animation: none;
  }

  .btn-primary:hover,
  .btn-secondary:hover,
  .btn-danger:hover,
  .pagination-btn:hover,
  .page-number:hover {
    transform: none;
  }
}

/* Focus visible para accesibilidad */
.btn-primary:focus-visible,
.btn-secondary:focus-visible,
.btn-danger:focus-visible,
.pagination-btn:focus-visible,
.page-number:focus-visible {
  outline: 2px solid #f9931e;
  outline-offset: 2px;
}
</style>
