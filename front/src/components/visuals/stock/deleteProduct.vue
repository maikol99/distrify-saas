<template>
  <div>
    <!-- Modal de confirmación de eliminación -->
    <div v-if="!showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:p-4 backdrop-blur-sm" @click="closeModal">
      <div class="bg-white w-screen h-screen md:w-[500px] md:h-auto md:max-h-[90vh] md:rounded-3xl max-w-full max-h-full overflow-y-auto flex flex-col font-sans shadow-2xl" @click.stop>
        <!-- HEADER -->
        <div class="flex justify-between items-center p-5 border-b border-red-100 bg-red-50 md:rounded-t-3xl text-red-600">
          <h2 class="text-xl font-bold m-0 flex items-center gap-2">
            <span class="material-symbols-outlined">delete</span>
            Confirmar eliminación
          </h2>
          <button @click="closeModal" class="text-red-400 hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer flex justify-center items-center">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div class="p-5 flex-1 overflow-y-auto w-full md:w-auto text-center md:text-left">
          <p class="text-gray-700 md:text-lg mb-4 text-center md:text-left">
            ¿Estás seguro de que deseas eliminar este producto?
          </p>

          <div v-if="product" class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 border-l-4 border-l-red-500 flex flex-col items-stretch text-left">
            <div class="flex flex-col md:flex-row md:justify-between items-start md:items-center py-1">
              <span class="font-medium text-gray-500 text-sm">Nombre:</span>
              <span class="font-bold text-gray-800 text-sm md:text-right mt-1 md:mt-0">{{ product.name }}</span>
            </div>
            <div class="flex flex-col md:flex-row md:justify-between items-start md:items-center py-1">
              <span class="font-medium text-gray-500 text-sm">Código:</span>
              <span class="font-bold text-gray-800 text-sm">{{ product.code }}</span>
            </div>
            <div class="flex flex-col md:flex-row md:justify-between items-start md:items-center py-1">
              <span class="font-medium text-gray-500 text-sm">Stock:</span>
              <span class="font-bold text-gray-800 text-sm">{{ product.quantity }} unidades</span>
            </div>
          </div>

          <div class="flex flex-col md:flex-row justify-center items-center md:items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-yellow-800 text-left">
            <span class="material-symbols-outlined text-amber-500 mt-0.5">info</span>
            <span>Esta acción no se puede deshacer.</span>
          </div>
        </div>

        <div class="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 md:rounded-b-3xl mt-auto shadow-inner flex-col md:flex-row">
          <button @click="closeModal" class="py-3 md:py-2 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer transition-colors hover:bg-gray-100 shadow-sm w-full md:w-auto" :disabled="loading">
            Cancelar
          </button>
          <button @click="confirmDelete" class="py-3 md:py-2 px-5 bg-red-600 border-none text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-red-700 shadow-sm flex items-center justify-center disabled:bg-red-400 w-full md:w-auto" :disabled="loading">
            <span class="material-symbols-outlined mr-2 animate-spin" v-if="loading">progress_activity</span>
            {{ loading ? "Eliminando..." : "Eliminar" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de éxito -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex flex-col justify-end md:justify-center items-center z-[110] md:p-4 backdrop-blur-sm" @click="closeSuccessModal">
      <div class="bg-white w-full md:w-[400px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col font-sans overflow-hidden slide-up" @click.stop>
        <div class="flex justify-between items-center p-5 border-b border-green-100 bg-green-50 md:rounded-t-3xl text-green-600">
          <h2 class="text-xl font-bold m-0 flex items-center gap-2">
            <span class="material-symbols-outlined">check_circle</span>
            Producto Eliminado
          </h2>
        </div>
        <div class="p-6 text-center">
          <p class="text-gray-700 font-medium pb-2 text-lg">El producto ha sido eliminado exitosamente.</p>
        </div>
        <div class="p-5 border-t border-gray-100 flex justify-center bg-gray-50 md:rounded-b-3xl">
          <button @click="closeSuccessModal" class="py-3 px-6 w-full bg-green-500 text-white rounded-xl font-bold shadow hover:bg-green-600 transition">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/config/axios.config";

export default {
  name: "DeleteConfirmationModal",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showSuccessModal: false,
      loading: false,
    };
  },

  methods: {
    closeModal() {
      if (!this.loading) {
        this.$emit("close");
      }
    },

    async confirmDelete() {
      this.loading = true;

      try {
        // Emitir evento al componente padre con el ID del producto
        this.$emit("confirm-delete", this.product._id);

        const response = await api.delete(
          `/products/delete/delete-product/${this.product._id}`
        );
        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || "Error al eliminar el producto");
        }

        this.showSuccessModal = true;

      } catch (error) {
        console.error("Error al eliminar producto:", error);
        this.$emit("delete-error", error);
      } finally {
        this.loading = false;
      }
    },

    closeSuccessModal() {
      this.showSuccessModal = false;
      
      this.$emit("deleted");
    },
  },

  mounted() {
    console.log("Producto a eliminar: ", this.product);
  },
};
</script>

<style scoped>
.modal-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
}

/* Modal overlay */
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
  z-index: 1000;
  padding: 1rem;
}

/* Modal base */
.delete-modal,
.success-modal {
  background-color: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: scale(1);
  transition: transform 0.2s ease;
}

.modal-overlay .delete-modal,
.modal-overlay .success-modal {
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal header */
.modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
  border-radius: 1.25rem 1.25rem 0 0;
}

.warning-icon {
  width: 4rem;
  height: 4rem;
  background-color: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.warning-icon i {
  font-size: 1.75rem;
  color: #ef4444;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background-color: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.success-icon i {
  font-size: 1.75rem;
  color: #10b981;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Modal body */
.modal-body {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
}

.warning-text {
  font-size: 1rem;
  color: #4b5563;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.product-info {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #f9931e;
}

.product-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.product-detail:last-child {
  margin-bottom: 0;
}

.product-detail .label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.product-detail .value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.warning-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #92400e;
}

.warning-note i {
  color: #f59e0b;
}

/* Modal footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
  border-radius: 0 0 1.25rem 1.25rem;
}

/* Botones */
.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  min-width: 100px;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e8851b;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  min-width: 100px;
  justify-content: center;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  min-width: 120px;
  justify-content: center;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .delete-modal,
  .success-modal {
    max-width: 100%;
  }

  .modal-header {
    padding: 1rem 1rem 0.75rem 1rem;
  }

  .modal-body {
    padding: 0.75rem 1rem 1rem 1rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem 1rem 1rem;
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
    min-width: auto;
  }

  .warning-icon,
  .success-icon {
    width: 3rem;
    height: 3rem;
  }

  .warning-icon i,
  .success-icon i {
    font-size: 1.5rem;
  }
}
</style>
