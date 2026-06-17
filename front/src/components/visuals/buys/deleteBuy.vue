<template>
  <div class="modal-overlay" @click="close">
    <div class="purchase-modal" @click.stop>
      <div class="modal-header">
        <h3>Eliminar Compra</h3>
      </div>
      <div class="modal-body">
        <div class="confirmation-content">
          <div class="warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="confirmation-text">
            <p><strong>¿Estás seguro de que quieres eliminar esta compra?</strong></p>
            <p>Esta acción no se puede deshacer. La compra será eliminada permanentemente del sistema.</p>
          </div>
        </div>

        <!-- Mostrar errores si los hay -->
        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          {{ error }}
        </div>
      </div>
      <div class="modal-footer">
        <button @click="close" class="btn-secondary" :disabled="loading">
          Cancelar
        </button>
        <button @click="deletePurchase" class="btn-danger" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          Eliminar
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
  name: "DeletePurchase",
  components: {
    spinnerComponent,
  },
  props: {
    purchaseId: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      error: null,
      globalStore: useGlobalStore(),
    };
  },

  methods: {
    async deletePurchase() {
      try {
        this.loading = true;
        this.error = null;
        
        const shopId = this.globalStore.shopId();
        const response = await api.delete(
          `/buys/delete/delete-buy/${this.purchaseId}`
        );
        
        const data = response.data;
        if (data.success) {
          this.$emit("submit");
          this.$emit("close");
          this.close();
        } else {
          this.error = data.message || "Error al eliminar la compra";
        }
      } catch (error) {
        console.log(error);
        this.error = "Error de conexión. Intenta nuevamente.";
      } finally {
        this.loading = false;
      }
    },

    close() {
      this.$emit("close");
    },
  },

  mounted() {},
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

.purchase-modal {
  background-color: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
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
  color: #dc2626;
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

/* Confirmation content */
.confirmation-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.warning-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background-color: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  font-size: 1.25rem;
}

.confirmation-text {
  flex: 1;
}

.confirmation-text p {
  margin: 0 0 0.5rem 0;
  color: #374151;
  line-height: 1.5;
}

.confirmation-text p:last-child {
  margin-bottom: 0;
  color: #6b7280;
  font-size: 0.875rem;
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
.btn-danger {
  background-color: #dc2626;
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

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-danger:disabled {
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
  .purchase-modal {
    max-width: 95%;
    margin: 1rem;
  }

  .confirmation-content {
    flex-direction: column;
    text-align: center;
  }

  .warning-icon {
    align-self: center;
  }
}
</style>