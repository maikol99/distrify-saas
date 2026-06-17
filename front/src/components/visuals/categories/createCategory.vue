<template>
  <div class="modal-overlay" @click="close">
    <div class="category-modal" @click.stop>
      <div class="modal-header">
        <h3>
          {{ isEditMode ? "Editar Categoría" : "Nueva Categoría" }}
        </h3>
      </div>
      <div class="modal-body">
        <form @submit.prevent="saveCategory">
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
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="categoryForm.active" 
                type="checkbox" 
                :disabled="loading"
              />
              <span class="checkmark"></span>
              Categoría activa
            </label>
          </div>
          
          <!-- Mostrar errores si los hay -->
          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="close" class="btn-secondary" :disabled="loading">
          Cancelar
        </button>
        <button @click="saveCategory" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCategoriesStore } from "@/stores/categoriesStore";

export default {
  name: "CreateCategory",
  props: {
    categoryToEdit: {
      type: Object,
      default: null
    }
  },
  emits: ['categoryCreated', 'close'],
  
  data() {
    return {
      categoriesStore: useCategoriesStore(),
      loading: false,
      error: null,
      categoryForm: {
        name: '',
        description: '',
        active: true
      }
    };
  },

  computed: {
    isEditMode() {
      return this.categoryToEdit !== null;
    }
  },

  watch: {
    categoryToEdit: {
      immediate: true,
      handler(newValue) {
        this.initializeForm(newValue);
      }
    }
  },

  methods: {
    initializeForm(categoryData = null) {
      if (categoryData) {
        // Modo edición - llenar el formulario con los datos existentes
        this.categoryForm = {
          name: categoryData.name || '',
          description: categoryData.description || '',
          active: categoryData.active !== undefined ? categoryData.active : true
        };
      } else {
        // Modo creación - formulario vacío
        this.categoryForm = {
          name: '',
          description: '',
          active: true
        };
      }
      this.error = null;
    },

    async saveCategory() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        if (this.isEditMode) {
          // Actualizar categoría existente
          await this.updateCategory();
        } else {
          // Crear nueva categoría
          await this.createCategory();
        }
        
        // Emitir evento de éxito y cerrar modal
        this.$emit('categoryCreated');
        this.close();
        
      } catch (error) {
        console.error('Error saving category:', error);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    async createCategory() {
      const result = await this.categoriesStore.createCategory(this.categoryForm);
      
      if (!result.success) {
        throw new Error(result.message || 'Error al crear la categoría');
      }
    },

    async updateCategory() {
      const result = await this.categoriesStore.updateCategory(
        this.categoryToEdit._id, 
        this.categoryForm
      );
      
      if (!result.success) {
        throw new Error(result.message || 'Error al actualizar la categoría');
      }
    },

    validateForm() {
      // Resetear error
      this.error = null;

      // Validar nombre requerido
      if (!this.categoryForm.name || !this.categoryForm.name.trim()) {
        this.error = 'El nombre de la categoría es requerido';
        return false;
      }

      // Validar longitud del nombre
      if (this.categoryForm.name.trim().length < 2) {
        this.error = 'El nombre debe tener al menos 2 caracteres';
        return false;
      }

      if (this.categoryForm.name.trim().length > 50) {
        this.error = 'El nombre no puede exceder 50 caracteres';
        return false;
      }

      // Validar descripción si está presente
      if (this.categoryForm.description && this.categoryForm.description.length > 255) {
        this.error = 'La descripción no puede exceder 255 caracteres';
        return false;
      }

      return true;
    },

    handleError(error) {
      if (error.response) {
        // Error del servidor
        const serverMessage = error.response.data?.message;
        if (serverMessage) {
          this.error = serverMessage;
        } else {
          this.error = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.message) {
        // Error personalizado
        this.error = error.message;
      } else {
        // Error genérico
        this.error = 'Ha ocurrido un error inesperado';
      }
    },

    close() {
      if (!this.loading) {
        this.$emit('close');
      }
    },

    resetForm() {
      this.categoryForm = {
        name: '',
        description: '',
        active: true
      };
      this.error = null;
    }
  },

  mounted() {
    // Inicializar el formulario cuando se monta el componente
    this.initializeForm(this.categoryToEdit);
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

.checkbox-label input[type="checkbox"]:disabled {
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
</style>