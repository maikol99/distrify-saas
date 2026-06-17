<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm" @click="close">
    <div class="bg-white w-screen h-screen md:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl" @click.stop>
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-orange-100 bg-orange-50 md:rounded-t-3xl text-orange-600">
        <h2 class="text-xl font-bold m-0 flex items-center gap-2">
          <span class="material-symbols-outlined">edit</span>
          Editar Proveedor
        </h2>
        <button @click="close" class="text-orange-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      <div class="modal-body p-5 flex-1 overflow-y-auto">
        <form @submit.prevent="updateSupplier">
          <div class="form-group">
            <label for="supplierName">Nombre *</label>
            <input
              id="supplierName"
              v-model="supplierForm.name"
              type="text"
              class="form-control"
              placeholder="Nombre del proveedor"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="supplierCompany">Empresa</label>
            <input
              id="supplierCompany"
              v-model="supplierForm.company"
              type="text"
              class="form-control"
              placeholder="Nombre de la empresa"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="supplierAddress">Dirección</label>
            <input
              id="supplierAddress"
              v-model="supplierForm.address"
              type="text"
              class="form-control"
              placeholder="Dirección del proveedor"
              :disabled="loading"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="supplierPhone">Teléfono</label>
              <input
                id="supplierPhone"
                v-model="supplierForm.phone"
                type="tel"
                class="form-control"
                placeholder="Número de teléfono"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="supplierEmail">Email</label>
              <input
                id="supplierEmail"
                v-model="supplierForm.email"
                type="email"
                class="form-control"
                placeholder="Correo electrónico"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="supplierCuit">CUIT</label>
            <input
              id="supplierCuit"
              v-model="supplierForm.cuit"
              type="text"
              class="form-control"
              placeholder="CUIT del proveedor"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="supplierDebt">Deuda</label>
            <input
              id="supplierDebt"
              v-model="supplierForm.debt"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              placeholder="0.00"
              :disabled="loading"
            />
          </div>

          <!-- Mostrar errores si los hay -->
          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>
        </form>
      </div>
      <!-- FOOTER -->
      <div class="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 md:rounded-b-3xl mt-auto shadow-inner">
        <button @click="close" class="py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-800 shadow-sm w-full md:w-auto" :disabled="loading">
          Cancelar
        </button>
        <button @click="updateSupplier" class="py-2 px-5 bg-orange-500 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-orange-600 shadow-sm flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto" :disabled="loading">
          <span class="material-symbols-outlined mr-2 animate-spin" v-if="loading">progress_activity</span>
          Actualizar
        </button>
      </div>
    </div>
  </div>

  <spinnerComponent v-if="loading"></spinnerComponent>
</template>

<script>
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";
import spinnerComponent from "../spinnerComponent.vue";

export default {
  name: "EditSupplier",
  components: {
    spinnerComponent,
  },

  props: {
    supplier: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value.id !== 'undefined';
      }
    }
  },

  data() {
    return {
      loading: false,
      error: null,
      supplierForm: {
        _id: null,
        name: "",
        company: "",
        address: "",
        phone: "",
        email: "",
        cuit: "",
        debt: 0,
        shopId: "",
      },
      globalStore: useGlobalStore(),
    };
  },

  methods: {
    async updateSupplier() {
      try {
        if (!this.validateForm()) {
          return;
        }
        this.loading = true;
        
        // Preparar datos para actualizar
        const updateData = {
          ...this.supplierForm,
          shopId: this.globalStore.shopId()
        };

        const response = await api.patch(
          `/suppliers/patch/update-supplier/${this.supplierForm._id}`,
          updateData
        );
        
        const data = response.data;
        if (data.success) {
          this.$emit("submit", this.supplierForm);
          this.close();
        } else {
          this.error = data.message || "Error al actualizar el proveedor";
        }
      } catch (error) {
        console.log(error);
        this.error = error.response?.data?.message || "Error al actualizar el proveedor";
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      // Resetear error
      this.error = null;

      // Validar nombre requerido
      if (!this.supplierForm.name || !this.supplierForm.name.trim()) {
        this.error = "El nombre del proveedor es requerido";
        return false;
      }

      // Validar longitud del nombre
      if (this.supplierForm.name.trim().length < 2) {
        this.error = "El nombre debe tener al menos 2 caracteres";
        return false;
      }

      if (this.supplierForm.name.trim().length > 100) {
        this.error = "El nombre no puede exceder 100 caracteres";
        return false;
      }

      // Validar email si está presente
      if (!this.supplierForm.email) {
        this.error = "El email no es válido";
        return false;
      }

      // Validar CUIT si está presente
      if (!this.supplierForm.cuit) {
        this.error = "El CUIT no es válido";
        return false;
      }

      // Validar deuda
      if (this.supplierForm.debt < 0) {
        this.error = "La deuda no puede ser negativa";
        return false;
      }

      return true;
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    isValidCuit(cuit) {
      // Validación básica de CUIT argentino (11 dígitos)
      const cuitRegex = /^\d{2}-\d{8}-\d{1}$|^\d{11}$/;
      return cuitRegex.test(cuit);
    },

    close() {
      this.$emit("close");
    },

    initializeForm() {
      if (this.supplier) {
        this.supplierForm = {
          _id: this.supplier._id,
          name: this.supplier.name || "",
          company: this.supplier.company || "",
          address: this.supplier.address || "",
          phone: this.supplier.phone || "",
          email: this.supplier.email || "",
          cuit: this.supplier.cuit || "",
          debt: this.supplier.debt || 0,
          shopId: this.supplier.shopId || "",
        };
      }
      this.error = null;
    },
  },

  mounted() {
    this.initializeForm();
  },

  watch: {
    supplier: {
      handler() {
        this.initializeForm();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped>
/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.supplier-modal {
  background-color: white;
  border-radius: 0;
  width: 100vw;
  max-width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  box-shadow: none;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
  border-radius: 1.25rem 1.25rem 0 0;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  border-radius: 0 0 1.25rem 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

/* Error message */
.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message i {
  color: #dc2626;
}

/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Button styles */
.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e8831a;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .supplier-modal {
    max-width: 95%;
    margin: 1rem;
  }
}
</style>