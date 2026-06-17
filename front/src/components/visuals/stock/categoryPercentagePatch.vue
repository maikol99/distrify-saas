<template>
  <!-- Overlay -->
  <div class="fixed inset-0 bg-black/50 flex flex-col items-center justify-end md:justify-center z-[100] md:p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white w-full h-auto max-h-[95vh] md:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up" @click.stop>
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 text-orange-600 md:rounded-t-3xl">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">percent</span>
          Actualizar Precios
        </h2>
        <button @click="$emit('close')" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <div class="p-6 flex-1 overflow-y-auto w-full text-left">
        <p class="text-gray-700 text-sm md:text-base mb-6">Aplica aumentos o descuentos por porcentaje de forma masiva.</p>

        <form @submit.prevent="updatePrices" class="flex flex-col gap-6" id="price-form">
          <!-- Modo de actualización -->
          <div class="flex flex-col gap-2">
            <h5 class="font-bold text-gray-800 text-sm m-0">Modo de actualización</h5>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors" :class="{'bg-orange-50 border-orange-300': updateConfig.mode === 'percentage'}">
                <input type="radio" v-model="updateConfig.mode" value="percentage" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Porcentaje</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors" :class="{'bg-orange-50 border-orange-300': updateConfig.mode === 'fixed'}">
                <input type="radio" v-model="updateConfig.mode" value="fixed" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Monto fijo ($)</span>
              </label>
            </div>
          </div>

          <!-- Aumento o disminucion -->
          <div class="flex flex-col gap-2">
            <h5 class="font-bold text-gray-800 text-sm m-0">Aumento / Disminución de precio</h5>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors" :class="{'bg-orange-50 border-orange-300': updateConfig.action === 'increase'}">
                <input type="radio" v-model="updateConfig.action" value="increase" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Aumento</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors" :class="{'bg-orange-50 border-orange-300': updateConfig.action === 'decrease'}">
                <input type="radio" v-model="updateConfig.action" value="decrease" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Disminución</span>
              </label>
            </div>
          </div>

          <!-- Tipo de precio -->
          <div class="flex flex-col gap-2">
            <h5 class="font-bold text-gray-800 text-sm m-0">Tipo de Precio</h5>
            <div class="flex flex-wrap gap-3">
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors" :class="{'bg-orange-50 border-orange-300': updateConfig.type === 'buyPrice'}">
                <input type="radio" v-model="updateConfig.type" value="buyPrice" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Previo de Compra</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors" :class="{'bg-orange-50 border-orange-300': updateConfig.type === 'sellPrice'}">
                <input type="radio" v-model="updateConfig.type" value="sellPrice" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Precio de Venta</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors" :class="{'bg-orange-50 border-orange-300': updateConfig.type === 'both'}">
                <input type="radio" v-model="updateConfig.type" value="both" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Ambos</span>
              </label>
            </div>
          </div>

          <!-- Alcance -->
          <div class="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h5 class="font-bold text-gray-800 text-sm m-0 mb-1">Alcance</h5>
            <div class="flex flex-col md:flex-row gap-4 mb-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="updateConfig.range" value="all" @change="onScopeChange" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Todos los productos</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="updateConfig.range" value="category" @change="onScopeChange" class="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                <span class="text-sm font-medium text-gray-700">Por categoría</span>
              </label>
            </div>

            <div v-if="updateConfig.range === 'category'" class="flex flex-col gap-1 mt-2 slide-up">
              <label for="category" class="font-bold text-gray-700 text-xs">Seleccionar Categoría *</label>
              <select
                v-model="updateConfig.categoryId"
                id="category"
                class="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow bg-white"
                required
              >
                <option value="">Selecciona una categoría</option>
                <option v-for="c in categories" :key="c._id" :value="c._id">
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Valor de Cambio -->
          <div class="flex flex-col gap-2">
            <h5 class="font-bold text-gray-800 text-sm m-0">
              {{ updateConfig.mode === 'fixed' ? 'Monto Fijo de Cambio ($)' : 'Porcentaje de Cambio' }}
            </h5>
            <div class="relative flex items-center mb-2">
              <span class="absolute left-3 text-gray-500 font-bold">{{ updateConfig.mode === 'fixed' ? '$' : '%' }}</span>
              <input
                id="value"
                v-model="updateConfig.value"
                type="number"
                step="0.01"
                class="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow font-semibold text-gray-800"
                :placeholder="updateConfig.mode === 'fixed' ? 'Ej: 50, 100...' : 'Ej: 10, 15.5...'"
                required
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Botones -->
      <div class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-3 md:rounded-b-3xl mt-auto shadow-inner">
        <button type="button" @click="$emit('close')" class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 shadow-sm w-full md:w-auto text-center" :disabled="loading">
          Cancelar
        </button>
        <button form="price-form" type="submit" class="py-3 md:py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading">
          <span v-if="loading" class="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
          <i v-else class="fas fa-sync-alt mr-2"></i>
          {{ loading ? "Actualizando..." : "Actualizar Precios" }}
        </button>
      </div>
    </div>
  </div>
  <spinnerComponent v-if="loading"></spinnerComponent>
  <toastComponent
    v-if="toast.showing"
    :message="toast.message"
    :state="toast.state"
  ></toastComponent>
</template>

<script>
import spinnerComponent from "../spinnerComponent.vue";
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";
import toastComponent from "../toast/toastComponent.vue";

export default {
  name: "PriceUpdater",
  components: {
    spinnerComponent,
    toastComponent,
  },
  data() {
    return {
      globalStore: useGlobalStore(),
      loading: false,
      categories: [],
      updateConfig: {
        shopId: "",
        range: "",
        type: "",
        mode: "percentage",
        value: "",
        action: "",
        categoryId: "",
      },
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
        const data = res.data;

        if (data.success) {
          this.categories = data.categories || [];
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
    async updatePrices() {
      this.loading = true;

      if (
        this.updateConfig.action === "" ||
        this.updateConfig.value === "" ||
        this.updateConfig.range === "" ||
        this.updateConfig.mode === "" ||
        this.updateConfig.type === ""
      ) {
        this.toast = {
          showing: true,
          message: "Todos los campos son requeridos.",
          state: "information",
        };
        this.loading = false;
        return;
      }

      if (
        this.updateConfig.range === "category" &&
        this.updateConfig.categoryId === ""
      ) {
        this.toast = {
          showing: true,
          message: "Por favor selecciona una categoría.",
          state: "information",
        };
        this.loading = false;
        return;
      }

      try {
        const shopId = this.globalStore.shopId();
        const payload = {
          ...this.updateConfig,
          shopId,
        };

        const response = await api.patch(
          this.updateConfig.mode === "fixed"
            ? `/products/patch/update-multiple-products/by-fixed-amount`
            : `/products/patch/update-multiple-products/by-percentage`,
          payload
        );
        const data = response.data;

        if (data.success) {
          this.toast = {
            showing: true,
            message: "Precios actualizados correctamente.",
            state: "success",
          };
          this.cleanForm();
          setTimeout(() => {
            this.$emit("submit");
            this.$emit("close");
          }, 1000);
        } else {
          this.toast = {
            showing: true,
            message: data.message || "Error al actualizar precios",
            state: "danger",
          };
        }
      } catch (err) {
        alert("Error de conexión, intenta nuevamente");
      } finally {
        this.loading = false;
      }
    },
    cleanForm() {
      this.updateConfig = {
        shopId: "",
        range: "",
        type: "",
        mode: "percentage",
        value: "",
        action: "",
        categoryId: "",
      };
    },
    onScopeChange() {
      if (this.updateConfig.scope === "all") this.updateConfig.categoryId = "";
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
  z-index: 9999; /* siempre por encima */
  padding: 1rem;
}
.price-updater-container {
  background: #fff;
  border-radius: 0.5rem;
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  max-height: 90vh;
}
.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.page-header h1 {
  color: #f9931e;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #374151;
}
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.radio-option {
  display: flex;
  align-items: center;
}
.radio-option input {
  display: none;
}
.radio-custom {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  margin-right: 8px;
  position: relative;
}
.radio-option input:checked + .radio-custom {
  border-color: #f9931e;
  background: #f9931e;
}
.radio-option input:checked + .radio-custom::after {
  content: "";
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.form-control {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 100%;
}
.form-control:focus {
  border-color: #f9931e;
  outline: none;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}
.input-with-prefix {
  position: relative;
}
.input-prefix {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}
.input-with-prefix input {
  padding-left: 2rem;
}
.help-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.btn-primary {
  background: #f9931e;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-primary:hover {
  background: #e8851b;
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
@media (max-width: 640px) {
  .price-updater-container {
    padding: 1rem;
  }
  .form-actions {
    flex-direction: column;
  }
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
