<template>
  <!-- Overlay -->
  <div class="fixed inset-0 bg-black/50 flex flex-col items-center justify-end md:justify-center z-[100] md:p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white w-full h-auto max-h-[95vh] md:w-[500px] md:h-auto md:max-h-[85vh] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up" @click.stop>
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-red-100 bg-red-50 text-red-600 md:rounded-t-3xl">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">delete_sweep</span>
          Vaciado Masivo
        </h2>
        <button @click="$emit('close')" class="text-red-400 hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <div class="p-6 flex-1 overflow-y-auto w-full text-left">
        <p class="text-gray-700 text-sm md:text-base mb-6">
          Esta herramienta eliminará de forma irreversible <strong>todos</strong> los productos asociados a la categoría seleccionada.
        </p>

        <!-- Selección de categoría -->
        <div class="flex flex-col gap-2">
          <label for="category" class="font-bold text-gray-800 text-sm">Selecciona una Categoría *</label>
          <select
            v-model="selectedCategory"
            id="category"
            class="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-red-500 focus:border-red-500 outline-none transition-shadow bg-gray-50"
            required
          >
            <option value="">-- Elige la categoría a vaciar --</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">
              {{ c.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Botones -->
      <div class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-3 md:rounded-b-3xl mt-auto shadow-inner">
        <button type="button" @click="$emit('close')" class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 shadow-sm w-full md:w-auto text-center" :disabled="loading">
          Cancelar
        </button>
        <button @click="deleteProducts" class="py-3 md:py-2 px-5 bg-red-600 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-red-700 shadow-sm flex items-center justify-center disabled:bg-red-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading || !selectedCategory">
          <span v-if="loading" class="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
          <i v-else class="fas fa-trash mr-2"></i>
          {{ loading ? "Eliminando..." : "Eliminar Todo" }}
        </button>
      </div>
    </div>
  </div>
  <toastComponent
    v-if="toast.showing"
    :message="toast.message"
    :state="toast.state"
    @close="toast.showing = false"
  />
</template>

<script>
import toastComponent from "../toast/toastComponent.vue";
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "DeleteProductsByCategory",
  components: {
    toastComponent,
  },
  data() {
    return {
      globalStore: useGlobalStore(),
      loading: false,
      categories: [],
      selectedCategory: "",
      toast: {
        showing: false,
        message: "",
        state: "",
      },
    };
  },
  async mounted() {
    await this.loadCategories();
  },
  methods: {
    async loadCategories() {
      try {
        this.loading = true;
        const shopId = this.globalStore.shopId();
        const res = await api.get(
          `/categories/get/get-categories-by-shop/${shopId}?page=1&limit=200`
        );
        if (res.data.success) {
          this.categories = res.data.categories || [];
        } else {
          this.toast = {
            showing: true,
            message: "Error al cargar categorías",
            state: "danger",
          };
        }
      } catch (err) {
        console.error("Error cargando categorías", err);
      } finally {
        this.loading = false;
      }
    },
    async deleteProducts() {
      if (!this.selectedCategory) {
        this.toast = {
          showing: true,
          message: "Por favor selecciona una categoría.",
          state: "information",
        };
        return;
      }

      this.loading = true;
      try {
        // Aquí en vez de hacer la llamada DELETE real, solo logeamos
        console.log("Eliminar productos de categoría:", this.selectedCategory);

        const response = await api.delete(
          `/products/delete/delete-products-by-category?shopId=${this.globalStore.shopId()}&categoryId=${
            this.selectedCategory
          }`
        );
        const data = response.data;
        if (data.success) {
          this.toast = {
            showing: true,
            message: "Productos eliminados correctamente.",
            state: "success",
          };
          setTimeout(() => {
            this.$emit("submit");
            this.$emit("close");
          }, 1000);
        } else {
          this.toast = {
            showing: true,
            message: data.message || "Error al eliminar productos.",
            state: "danger",
          };
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.main-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}
.delete-products-container {
  background: #fff;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.page-header h1 {
  color: #e11d48;
  font-size: 1.8rem;
  font-weight: 700;
}
.page-header .subtitle {
  color: #6b7280;
}
.form-section {
  margin-bottom: 1.5rem;
}
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}
.form-control {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 100%;
}
.form-control:focus {
  border-color: #e11d48;
  outline: none;
  box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.btn-danger {
  background: #e11d48;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-danger:hover {
  background: #be123c;
}
.btn-secondary {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
