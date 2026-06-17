<template>
  <div class="modal-overlay" @click="close">
    <div class="category-modal" @click.stop>
      <div class="modal-header">
        <h3>Editar Categoría</h3>
        <button @click="close" class="close-btn" :disabled="loading">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="updateCategory">
          <div class="form-group">
            <label for="categoryName">Nombre *</label>
            <input
              id="categoryName"
              v-model="categoryForm.name"
              type="text"
              class="form-control"
              placeholder="Nombre de la categoría"
              required
              :disabled="loading"
              ref="nameInput"
            />
          </div>
          <div class="form-group">
            <label for="categoryDescription">Descripción</label>
            <textarea
              id="categoryDescription"
              v-model="categoryForm.description"
              class="form-control"
              placeholder="Descripción de la categoría"
              rows="3"
              :disabled="loading"
            ></textarea>
          </div>

          <!-- Mostrar errores si los hay -->
          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>

          <!-- Mostrar mensaje de éxito -->
          <div v-if="successMessage" class="success-message">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="close" class="btn-secondary" :disabled="loading">
          Cancelar
        </button>
        <button
          @click="updateCategory"
          class="btn-primary"
          :disabled="loading || !hasChanges || !isFormValid"
        >
          <span v-if="loading" class="loading-spinner"></span>
          <i v-else class="fas fa-save"></i>
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCategoriesStore } from "@/stores/categoriesStore";

export default {
  name: "EditCategory",
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  emits: ["categoryUpdated", "close"],

  data() {
    return {
      categoriesStore: useCategoriesStore(),
      loading: false,
      error: null,
      successMessage: null,
      categoryForm: {
        name: "",
        description: "",
        active: true,
      },
      originalData: {
        name: "",
        description: "",
        active: true,
      },
    };
  },

  computed: {
    hasChanges() {
      return (
        this.categoryForm.name !== this.originalData.name ||
        this.categoryForm.description !== this.originalData.description ||
        this.categoryForm.active !== this.originalData.active
      );
    },

    isFormValid() {
      return (
        this.categoryForm.name &&
        this.categoryForm.name.trim().length >= 2 &&
        this.categoryForm.name.trim().length <= 50 &&
        (!this.categoryForm.description ||
          this.categoryForm.description.length <= 255)
      );
    },
  },

  watch: {
    category: {
      immediate: true,
      handler(newValue) {
        this.initializeForm(newValue);
      },
    },

    // Limpiar mensajes cuando el usuario empiece a escribir
    "categoryForm.name"() {
      this.clearMessages();
    },
    "categoryForm.description"() {
      this.clearMessages();
    },
    "categoryForm.active"() {
      this.clearMessages();
    },
  },

  methods: {
    initializeForm(categoryData) {
      if (categoryData) {
        const formData = {
          name: categoryData.name || "",
          description: categoryData.description || "",
          active:
            categoryData.active !== undefined ? categoryData.active : true,
        };

        this.categoryForm = { ...formData };
        this.originalData = { ...formData };
      }
      this.clearMessages();
    },

    async updateCategory() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const result = await this.categoriesStore.updateCategory(
          this.category._id || this.category.id,
          this.categoryForm
        );

        if (!result.success) {
          throw new Error(result.message || "Error al actualizar la categoría");
        }

        // Mostrar mensaje de éxito
        this.successMessage = "Categoría actualizada correctamente";

        // Actualizar los datos originales
        this.originalData = { ...this.categoryForm };

        // Emitir evento de éxito
        this.$emit("categoryUpdated", result.data || this.categoryForm);

        // Auto-cerrar después de un breve delay
        setTimeout(() => {
          this.close();
        }, 1500);
      } catch (error) {
        console.error("Error updating category:", error);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      this.error = null;

      // Validar nombre requerido
      if (!this.categoryForm.name || !this.categoryForm.name.trim()) {
        this.error = "El nombre de la categoría es requerido";
        this.focusNameInput();
        return false;
      }

      // Validar longitud del nombre
      if (this.categoryForm.name.trim().length < 2) {
        this.error = "El nombre debe tener al menos 2 caracteres";
        this.focusNameInput();
        return false;
      }

      if (this.categoryForm.name.trim().length > 50) {
        this.error = "El nombre no puede exceder 50 caracteres";
        this.focusNameInput();
        return false;
      }

      // Validar descripción si está presente
      if (
        this.categoryForm.description &&
        this.categoryForm.description.length > 255
      ) {
        this.error = "La descripción no puede exceder 255 caracteres";
        return false;
      }

      return true;
    },

    handleError(error) {
      if (error.response) {
        const serverMessage = error.response.data?.message;
        if (serverMessage) {
          this.error = serverMessage;
        } else {
          this.error = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.message) {
        this.error = error.message;
      } else {
        this.error = "Ha ocurrido un error inesperado";
      }
    },

    resetForm() {
      this.categoryForm = { ...this.originalData };
      this.clearMessages();
    },

    clearMessages() {
      this.error = null;
      this.successMessage = null;
    },

    close() {
      if (!this.loading) {
        if (this.hasChanges) {
          const confirmed = confirm(
            "¿Estás seguro de cerrar? Los cambios no guardados se perderán."
          );
          if (!confirmed) return;
        }
        this.$emit("close");
      }
    },

    focusNameInput() {
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus();
        }
      });
    },

    formatDate(dateString) {
      if (!dateString) return "";

      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      } catch (error) {
        return dateString;
      }
    },
  },

  mounted() {
    this.initializeForm(this.category);
    // Auto-focus en el campo nombre
    this.$nextTick(() => {
      this.focusNameInput();
    });
  },
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.category-modal {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s, background-color 0.2s;
}

.close-btn:hover:not(:disabled) {
  color: #374151;
  background-color: #f3f4f6;
}

.close-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
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
}

.form-group {
  margin-bottom: 1rem;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

/* Category info */
.category-info {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  color: #374151;
  font-family: monospace;
  font-size: 0.875rem;
}

/* Messages */
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

.success-message {
  color: #059669;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  gap: 0.5rem;
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

.btn-neutral {
  background-color: #6b7280;
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
  gap: 0.5rem;
}

.btn-neutral:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-neutral:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}
</style>
