<template>
  <!-- Overlay para el formulario principal -->
  <div class="main-form-overlay">
    <div class="category-creator-container">
      <header class="page-header">
        <h1>Creación rápida de producto</h1>
        <p class="subtitle">
          Completa la información para agregar un nuevo producto al sistema
        </p>
      </header>

      <div class="form-container">
        <form @submit.prevent="createProduct" class="category-form">
          <!-- Información básica -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-tag"></i>
              Información del Producto
            </h3>

            <div class="form-group">
              <label for="name">Nombre del Producto *</label>
              <input
                id="name"
                v-model="product.name"
                type="text"
                class="form-control"
                :class="{ error: errors.name }"
                placeholder="Ingresa el nombre del producto"
                required
              />
              <span v-if="errors.name" class="error-message">{{
                errors.name
              }}</span>
            </div>
            <div class="form-group">
              <label for="name">Categoría *</label>
              <select
                name="categoryId"
                id="categoryId"
                v-model="product.categoryId"
                class="form-control"
              >
                <option value="">Selecciona una categoría</option>
                <option
                  v-for="category in categories"
                  :key="category._id"
                  :value="category._id"
                >
                  {{ category.name }}
                </option>
              </select>
              <span v-if="errors.categoryId" class="error-message">{{
                errors.categoryId
              }}</span>
            </div>

            <div class="form-group">
              <label for="description">Código de barras</label>
              <input
                id="name"
                v-model="product.code"
                type="text"
                class="form-control"
                placeholder="Ingresa el código de barras del producto"
                required
              />
            </div>

            <div class="form-group">
              <label for="description">Cantidad</label>
              <input
                id="name"
                v-model="product.quantity"
                type="number"
                class="form-control"
                placeholder="Ingresa la cantidad del producto"
                required
              />
            </div>

            <div class="form-group">
              <label for="description">Precio de venta</label>
              <input
                id="name"
                v-model="product.sellPrice"
                type="number"
                class="form-control"
                placeholder="Ingresa el precio de venta del producto"
                required
              />
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="form-actions">
            <button type="button" @click="resetForm" class="btn-secondary">
              <i class="fas fa-undo"></i>
              Volver
            </button>

            <button type="submit" class="btn-primary" :disabled="loading">
              <i class="fas fa-save"></i>
              {{ loading ? "Guardando..." : "Crear producto" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal de éxito (existente) -->
  <div v-if="showSuccessModal" class="modal-overlay">
    <div class="success-modal">
      <div class="modal-header">
        <i class="fas fa-check-circle success-icon"></i>
        <h3>¡Producto creado!</h3>
      </div>
      <div class="modal-body">
        <p>El producto "{{ product.name }}" ha sido creado exitosamente.</p>
      </div>
      <div class="modal-footer">
        <button @click="closeSuccessModal" class="btn-primary">Aceptar</button>
      </div>
    </div>
  </div>

  <!-- Modal de error (existente) -->
  <div v-if="showErrorModal" class="modal-overlay">
    <div class="error-modal">
      <div class="modal-header">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <h3>Error al Crear Categoría</h3>
      </div>
      <div class="modal-body">
        <p>{{ errorMessage }}</p>
      </div>
      <div class="modal-footer">
        <button @click="closeErrorModal" class="btn-primary">Aceptar</button>
      </div>
    </div>
  </div>

  <spinner-component v-if="loadingSpinner" />
</template>

<script>
import api from "@/config/axios.config";
import { useGlobalStore } from "@/stores/globalStore";

export default {
  name: "CategoryCreator",
  components: {},
  data() {
    return {
      globalStore: useGlobalStore(),
      loadingSpinner: false,
      loading: false,
      showSuccessModal: false,
      showErrorModal: false,
      errorMessage: "",
      errors: {},
      product: {
        name: "",
        code: "",
        quantity: 0,
        sellPrice: 0,
        categoryId: "",
      },
    };
  },

  methods: {
    async createProduct() {
      this.loading = true;
      try {
        const shopId = this.globalStore.shopId();
        const response = await api.post("/products/post/create-product", {
          ...this.product,
          shopId: shopId,
        });

        const data = response.data;

        if (data.success) {
          this.showSuccessModal = true;
        } else {
          this.errorMessage =
            data.message || "Error desconocido al crear el producto";
        }
      } catch (error) {
        console.error("Error al crear producto:", error);
      } finally {
        this.loading = false;
      }
    },
    async getCategories() {
      this.loading = true;
      const shopId = this.globalStore.shopId();
      try {
        const response = await api.get(
          `/categories/get/get-categories-by-shop/${shopId}?page=1&limit=200`
        );
        const data = response.data;
        if (data.success) {
          this.categories = data.categories;
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.$emit("close");
    },

    closeSuccessModal() {
      this.showSuccessModal = false;
      this.resetForm();
      this.$emit('submit')
    },

    closeErrorModal() {
      this.showErrorModal = false;
    },
  },
  async mounted() {
    await this.getCategories();
  },
};
</script>

<style scoped>
/* Nuevo estilo para el overlay del formulario principal */
.main-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* Fondo semitransparente */
  display: flex;
  align-items: center; /* Centrar verticalmente */
  justify-content: center; /* Centrar horizontalmente */
  z-index: 40; /* Asegura que esté sobre el contenido de la página, pero debajo de los modales de éxito/error */
  padding: 1rem; /* Espaciado para pantallas pequeñas */
  overflow-y: auto; /* Permite el scroll si el contenido es muy largo */
}

.category-creator-container {
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  padding: 1.5rem;
  color: #1f2937;
  background-color: #f9fafb;
  border-radius: 0;
  width: 100vw;
  max-width: 100%;
  height: 100vh;
  max-height: 100vh;
  box-shadow: none;
  position: relative; /* Necesario para que el z-index funcione correctamente si hay elementos posicionados dentro */
  z-index: 41; /* Ligeramente superior al overlay para asegurar que el contenido del formulario esté visible */
  max-height: 95vh; /* Limita la altura para que no se desborde en pantallas pequeñas */
  overflow-y: auto; /* Permite el scroll dentro del formulario si es necesario */
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.mb-4 {
  margin-bottom: 1rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #f9931e;
  margin-bottom: 0.5rem;
}

.page-header .subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.category-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.section-title i {
  color: #f9931e;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background-color: white;
}

.form-control:focus {
  outline: none;
  border-color: #f9931e;
  box-shadow: 0 0 0 3px rgba(249, 147, 30, 0.1);
}

.form-control.error {
  border-color: #ef4444;
}

.form-control.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Botones */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary {
  background-color: #f9931e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e8851b;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

/* Modales existentes (mantienen su z-index más alto) */
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
  z-index: 50; /* Asegura que estos modales estén siempre encima de todo, incluyendo el formulario principal */
}

.success-modal,
.error-modal {
  background-color: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
}

.modal-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 60%);
  border-radius: 1.25rem 1.25rem 0 0;
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  border-radius: 0 0 1.25rem 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .category-creator-container {
    padding: 1rem;
    max-width: 100%;
  }

  .category-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.125rem;
  }
}
</style>
